"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import {
  normalisePhoneNumber,
  profileSchema,
} from "@/lib/validation/profile";

type ProfileSetupFormProps = {
  userId: string;
  email?: string;
  hasLoadError?: boolean;

  initialProfile: {
    fullName: string;
    role: string;
    phone: string;
    generalArea: string;
    bio: string;
    organisationName: string;
    workEmail: string;
    organisationVerifiedAt: string | null;
    preferSameOrganisation: boolean;
    showOrganisation: boolean;
    genderIdentity: string;
    useGenderForMatching: boolean;
    preferSameGender: boolean;
    profileCompletedAt: string | null;
  };
};

type FormErrors = Record<string, string[] | undefined>;

type FormStatus = {
  type: "success" | "warning" | "error";
  message: string;
} | null;

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const errorInputClassName =
  "border-red-400 focus:border-red-500 focus:ring-red-100";

const genderLabels: Record<string, string> = {
  woman: "Woman",
  man: "Man",
  non_binary: "Non-binary",
  another_identity: "Another identity",
};

const roleOptions = [
  {
    value: "passenger",
    title: "Find rides",
    description:
      "Search available journeys and request passenger seats.",
  },
  {
    value: "driver",
    title: "Offer rides",
    description:
      "Post journeys and manage passenger seat requests.",
  },
  {
    value: "both",
    title: "Find and offer rides",
    description:
      "Use CommuteConnect as both a passenger and a driver.",
  },
];

function getFriendlyProfileError(message: string) {
  const normalisedMessage = message.toLowerCase();

  if (
    normalisedMessage.includes("permission") ||
    normalisedMessage.includes("row-level security")
  ) {
    return "Your profile could not be updated because your session does not have permission. Please log in again.";
  }

  if (
    normalisedMessage.includes("constraint") ||
    normalisedMessage.includes("violates")
  ) {
    return "Some profile information does not meet the required format. Please review the highlighted fields.";
  }

  return "We could not save your profile. Please check your details and try again.";
}

function FieldError({
  id,
  errors,
}: {
  id: string;
  errors?: string[];
}) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p id={id} className="mt-2 text-sm text-red-600">
      {errors[0]}
    </p>
  );
}

export function ProfileSetupForm({
  userId,
  email,
  initialProfile,
  hasLoadError = false,
}: ProfileSetupFormProps) {
  const router = useRouter();

  const [role, setRole] = useState(initialProfile.role);
  const [genderIdentity, setGenderIdentity] = useState(
    initialProfile.genderIdentity,
  );

  const [useGenderForMatching, setUseGenderForMatching] =
    useState(initialProfile.useGenderForMatching);

  const [preferSameGender, setPreferSameGender] =
    useState(initialProfile.preferSameGender);

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleGenderChange(value: string) {
    setGenderIdentity(value);

    if (!value) {
      setUseGenderForMatching(false);
      setPreferSameGender(false);
    }
  }

  function handleGenderMatchingChange(enabled: boolean) {
    setUseGenderForMatching(enabled);

    if (!enabled) {
      setPreferSameGender(false);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrors({});
    setStatus(null);

    const formData = new FormData(event.currentTarget);

    const values = {
      fullName: String(formData.get("fullName") || ""),
      role: String(formData.get("role") || ""),
      phone: String(formData.get("phone") || ""),
      generalArea: String(formData.get("generalArea") || ""),
      bio: String(formData.get("bio") || ""),
      organisationName: String(
        formData.get("organisationName") || "",
      ),
      workEmail: String(formData.get("workEmail") || ""),
      preferSameOrganisation:
        formData.get("preferSameOrganisation") === "on",
      showOrganisation:
        formData.get("showOrganisation") === "on",
      genderIdentity: String(
        formData.get("genderIdentity") || "",
      ),
      useGenderForMatching:
        formData.get("useGenderForMatching") === "on",
      preferSameGender:
        formData.get("preferSameGender") === "on",
    };

    const result = profileSchema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      setStatus({
        type: "error",
        message:
          "Please correct the highlighted information before saving.",
      });
      setIsSubmitting(false);
      return;
    }

    const normalisedPhone = normalisePhoneNumber(
      result.data.phone,
    );

    const profileCompletedAt =
      initialProfile.profileCompletedAt ||
      new Date().toISOString();

    const supabase = createClient();

    const {
      data: updatedProfile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .update({
        full_name: result.data.fullName,
        role: result.data.role,
        phone_e164: normalisedPhone || null,
        general_area: result.data.generalArea || null,
        bio: result.data.bio || null,
        organisation_name:
          result.data.organisationName || null,
        work_email:
          result.data.workEmail.toLowerCase() || null,
        prefer_same_organisation:
          result.data.preferSameOrganisation,
        show_organisation:
          result.data.showOrganisation,
        gender_identity:
          result.data.genderIdentity || null,
        use_gender_for_matching:
          result.data.useGenderForMatching,
        prefer_same_gender:
          result.data.preferSameGender,
        profile_completed_at: profileCompletedAt,
      })
      .eq("id", userId)
      .select("id")
      .single();

    if (profileError || !updatedProfile) {
      setStatus({
        type: "error",
        message: getFriendlyProfileError(
          profileError?.message || "Profile row was not found.",
        ),
      });
      setIsSubmitting(false);
      return;
    }

    const { error: metadataError } =
      await supabase.auth.updateUser({
        data: {
          full_name: result.data.fullName,
          role: result.data.role,
        },
      });

    if (metadataError) {
      setStatus({
        type: "warning",
        message:
          "Your profile was saved, but your account display information could not be refreshed immediately. It will update after you log in again.",
      });
    } else {
      setStatus({
        type: "success",
        message: "Your profile has been saved successfully.",
      });
    }

    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"
      noValidate
    >
      <div className="space-y-6">
        {hasLoadError ? (
          <div
            role="alert"
            className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-900"
          >
            Some existing profile information could not be loaded.
            Review every field carefully before saving.
          </div>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Personal details
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Your account information
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Provide only the information needed for communication and
            journey matching. An exact home address is not required.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-slate-700"
              >
                Full name
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                defaultValue={initialProfile.fullName}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={
                  errors.fullName
                    ? "fullName-error"
                    : "fullName-description"
                }
                className={`${inputClassName} ${
                  errors.fullName ? errorInputClassName : ""
                }`}
              />

              <p
                id="fullName-description"
                className="mt-2 text-xs leading-5 text-slate-500"
              >
                This name will identify you within CommuteConnect.
              </p>

              <FieldError
                id="fullName-error"
                errors={errors.fullName}
              />
            </div>

            <div>
              <p className="block text-sm font-medium text-slate-700">
                Login email
              </p>

              <div className="mt-2 min-h-12 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700">
                {email || "Email unavailable"}
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Your login email is managed through your account and
                is never displayed publicly.
              </p>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-700"
              >
                Phone number{" "}
                <span className="font-normal text-slate-500">
                  (optional)
                </span>
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                defaultValue={initialProfile.phone}
                placeholder="087 123 4567"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={
                  errors.phone
                    ? "phone-error"
                    : "phone-description"
                }
                className={`${inputClassName} ${
                  errors.phone ? errorInputClassName : ""
                }`}
              />

              <p
                id="phone-description"
                className="mt-2 text-xs leading-5 text-slate-500"
              >
                Irish numbers are stored securely in international
                format. They are intended for accepted journeys only.
              </p>

              <FieldError
                id="phone-error"
                errors={errors.phone}
              />
            </div>

            <div>
              <label
                htmlFor="generalArea"
                className="block text-sm font-medium text-slate-700"
              >
                General area{" "}
                <span className="font-normal text-slate-500">
                  (optional)
                </span>
              </label>

              <input
                id="generalArea"
                name="generalArea"
                type="text"
                autoComplete="address-level2"
                defaultValue={initialProfile.generalArea}
                placeholder="For example, Dublin 8"
                aria-invalid={Boolean(errors.generalArea)}
                aria-describedby={
                  errors.generalArea
                    ? "generalArea-error"
                    : "generalArea-description"
                }
                className={`${inputClassName} ${
                  errors.generalArea ? errorInputClassName : ""
                }`}
              />

              <p
                id="generalArea-description"
                className="mt-2 text-xs leading-5 text-slate-500"
              >
                Enter only a broad area. Do not enter your exact home
                address.
              </p>

              <FieldError
                id="generalArea-error"
                errors={errors.generalArea}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-slate-700"
              >
                Short introduction{" "}
                <span className="font-normal text-slate-500">
                  (optional)
                </span>
              </label>

              <textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={initialProfile.bio}
                placeholder="Share a brief introduction for future journey participants."
                aria-invalid={Boolean(errors.bio)}
                aria-describedby={
                  errors.bio ? "bio-error" : "bio-description"
                }
                className={`${inputClassName} resize-y ${
                  errors.bio ? errorInputClassName : ""
                }`}
              />

              <p
                id="bio-description"
                className="mt-2 text-xs leading-5 text-slate-500"
              >
                Maximum 500 characters. Avoid sensitive personal
                information.
              </p>

              <FieldError id="bio-error" errors={errors.bio} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Travel preferences
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            How will you use CommuteConnect?
          </h2>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-slate-700">
              Select your current preference
            </legend>

            <div className="mt-3 grid gap-3">
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
                    role === option.value
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={() => setRole(option.value)}
                    className="mt-1 h-4 w-4 accent-emerald-600"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {option.title}
                    </span>

                    <span className="mt-1 block text-sm leading-6 text-slate-600">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <FieldError id="role-error" errors={errors.role} />
          </fieldset>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Organisation
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Optional workplace or university details
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Organisation details can later support workplace or
            university-based journey matching.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="organisationName"
                className="block text-sm font-medium text-slate-700"
              >
                Organisation name{" "}
                <span className="font-normal text-slate-500">
                  (optional)
                </span>
              </label>

              <input
                id="organisationName"
                name="organisationName"
                type="text"
                autoComplete="organization"
                defaultValue={initialProfile.organisationName}
                placeholder="Company, university or organisation"
                aria-invalid={Boolean(errors.organisationName)}
                aria-describedby={
                  errors.organisationName
                    ? "organisationName-error"
                    : "organisationName-description"
                }
                className={`${inputClassName} ${
                  errors.organisationName
                    ? errorInputClassName
                    : ""
                }`}
              />

              <p
                id="organisationName-description"
                className="mt-2 text-xs leading-5 text-slate-500"
              >
                Entering a name does not create verified status.
              </p>

              <FieldError
                id="organisationName-error"
                errors={errors.organisationName}
              />
            </div>

            <div>
              <label
                htmlFor="workEmail"
                className="block text-sm font-medium text-slate-700"
              >
                Work or organisation email{" "}
                <span className="font-normal text-slate-500">
                  (optional)
                </span>
              </label>

              <input
                id="workEmail"
                name="workEmail"
                type="email"
                inputMode="email"
                autoComplete="email"
                defaultValue={initialProfile.workEmail}
                placeholder="name@organisation.ie"
                aria-invalid={Boolean(errors.workEmail)}
                aria-describedby={
                  errors.workEmail
                    ? "workEmail-error"
                    : "workEmail-description"
                }
                className={`${inputClassName} ${
                  errors.workEmail ? errorInputClassName : ""
                }`}
              />

              <p
                id="workEmail-description"
                className="mt-2 text-xs leading-5 text-slate-500"
              >
                This may support a future verification process.
              </p>

              <FieldError
                id="workEmail-error"
                errors={errors.workEmail}
              />
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              Verification status
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {initialProfile.organisationVerifiedAt
                ? "Verified"
                : "Not verified"}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input
                type="checkbox"
                name="preferSameOrganisation"
                defaultChecked={
                  initialProfile.preferSameOrganisation
                }
                className="mt-1 h-4 w-4 accent-emerald-600"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Prefer same-organisation matches
                </span>

                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  Use your organisation as an optional matching signal.
                </span>
              </span>
            </label>

            <FieldError
              id="preferSameOrganisation-error"
              errors={errors.preferSameOrganisation}
            />

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input
                type="checkbox"
                name="showOrganisation"
                defaultChecked={
                  initialProfile.showOrganisation
                }
                className="mt-1 h-4 w-4 accent-emerald-600"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Show organisation to relevant users
                </span>

                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  Allow your organisation name to be shown where it is
                  relevant to a matched journey.
                </span>
              </span>
            </label>

            <FieldError
              id="showOrganisation-error"
              errors={errors.showOrganisation}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Optional safety preference
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Gender-based matching preference
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            This information is optional. It is never inferred from
            your name, email address, profile image or artificial
            intelligence.
          </p>

          <div className="mt-6">
            <label
              htmlFor="genderIdentity"
              className="block text-sm font-medium text-slate-700"
            >
              Gender identity{" "}
              <span className="font-normal text-slate-500">
                (optional)
              </span>
            </label>

            <select
              id="genderIdentity"
              name="genderIdentity"
              value={genderIdentity}
              onChange={(event) =>
                handleGenderChange(event.target.value)
              }
              aria-invalid={Boolean(errors.genderIdentity)}
              aria-describedby={
                errors.genderIdentity
                  ? "genderIdentity-error"
                  : "genderIdentity-description"
              }
              className={`${inputClassName} ${
                errors.genderIdentity
                  ? errorInputClassName
                  : ""
              }`}
            >
              <option value="">Do not provide</option>

              {Object.entries(genderLabels).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>

            <p
              id="genderIdentity-description"
              className="mt-2 text-xs leading-5 text-slate-500"
            >
              This remains private and is used only when you explicitly
              enable matching.
            </p>

            <FieldError
              id="genderIdentity-error"
              errors={errors.genderIdentity}
            />
          </div>

          <div className="mt-5 space-y-3">
            <label
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                genderIdentity
                  ? "border-slate-200"
                  : "border-slate-200 bg-slate-50 opacity-70"
              }`}
            >
              <input
                type="checkbox"
                name="useGenderForMatching"
                checked={useGenderForMatching}
                disabled={!genderIdentity}
                onChange={(event) =>
                  handleGenderMatchingChange(
                    event.target.checked,
                  )
                }
                className="mt-1 h-4 w-4 accent-emerald-600"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Use this information for matching
                </span>

                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  Explicitly allow CommuteConnect to use this optional
                  information when matching journeys.
                </span>
              </span>
            </label>

            <label
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                useGenderForMatching
                  ? "border-slate-200"
                  : "border-slate-200 bg-slate-50 opacity-70"
              }`}
            >
              <input
                type="checkbox"
                name="preferSameGender"
                checked={preferSameGender}
                disabled={!useGenderForMatching}
                onChange={(event) =>
                  setPreferSameGender(event.target.checked)
                }
                className="mt-1 h-4 w-4 accent-emerald-600"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Prefer same-gender matches
                </span>

                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  Treat this as a preference rather than a guaranteed
                  matching condition.
                </span>
              </span>
            </label>

            <FieldError
              id="preferSameGender-error"
              errors={errors.preferSameGender}
            />
          </div>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
        <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
              className="h-6 w-6"
            >
              <path d="M12 3 5 6v5c0 4.6 2.9 8.7 7 10 4.1-1.3 7-5.4 7-10V6l-7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
            Privacy by design
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            You control your information
          </h2>

          <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
            <li>Login email addresses are never shown publicly.</li>
            <li>
              Phone details are intended for accepted journeys only.
            </li>
            <li>
              Exact home addresses are not collected in your profile.
            </li>
            <li>
              Organisation and gender matching preferences remain
              optional.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Save profile
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Saving marks your basic profile setup as complete.
            Driver accounts will still need to add a vehicle.
          </p>

          {status ? (
            <div
              role={
                status.type === "error" ? "alert" : "status"
              }
              aria-live="polite"
              className={`mt-5 rounded-xl border p-4 text-sm leading-6 ${
                status.type === "success"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : status.type === "warning"
                    ? "border-amber-300 bg-amber-50 text-amber-900"
                    : "border-red-300 bg-red-50 text-red-900"
              }`}
            >
              {status.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving profile…" : "Save Profile"}
          </button>

          <Link
            href="/dashboard"
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Return to Dashboard
          </Link>
        </section>
      </aside>
    </form>
  );
}
