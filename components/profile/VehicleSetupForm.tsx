"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { maximumVehicleYear, vehicleSchema } from "@/lib/validation/vehicle";

type VehicleSetupFormProps = {
  userId: string;

  initialVehicle: {
    id: string;
    make: string;
    model: string;
    colour: string;
    year: number | null;
    passengerSeats: number;
    accessibilityNotes: string;
    driverDeclarationAcceptedAt: string;
  } | null;
};

type VehicleErrors = Record<string, string[] | undefined>;

type FormStatus = {
  type: "success" | "error";
  message: string;
} | null;

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const errorInputClassName =
  "border-red-400 focus:border-red-500 focus:ring-red-100";

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p id={id} className="mt-2 text-sm text-red-600">
      {errors[0]}
    </p>
  );
}

function getFriendlyVehicleError(message: string) {
  const normalisedMessage = message.toLowerCase();

  if (
    normalisedMessage.includes("permission") ||
    normalisedMessage.includes("row-level security")
  ) {
    return "Your vehicle could not be saved because your session does not have permission. Please log in again.";
  }

  if (
    normalisedMessage.includes("duplicate") ||
    normalisedMessage.includes("unique")
  ) {
    return "A primary vehicle already exists for this account. Refresh the page and try editing it again.";
  }

  if (
    normalisedMessage.includes("constraint") ||
    normalisedMessage.includes("violates")
  ) {
    return "Some vehicle information does not meet the required format. Please review the highlighted fields.";
  }

  return "We could not save your vehicle. Please check the details and try again.";
}

export function VehicleSetupForm({
  userId,
  initialVehicle,
}: VehicleSetupFormProps) {
  const router = useRouter();

  const [errors, setErrors] = useState<VehicleErrors>({});
  const [status, setStatus] = useState<FormStatus>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});
    setStatus(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const values = {
      make: String(formData.get("make") || ""),
      model: String(formData.get("model") || ""),
      colour: String(formData.get("colour") || ""),
      year: String(formData.get("year") || ""),
      passengerSeats: String(formData.get("passengerSeats") || ""),
      accessibilityNotes: String(formData.get("accessibilityNotes") || ""),
      driverDeclarationAccepted:
        formData.get("driverDeclarationAccepted") === "on",
    };

    const result = vehicleSchema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      setStatus({
        type: "error",
        message:
          "Please correct the highlighted vehicle information before saving.",
      });
      setIsSubmitting(false);
      return;
    }

    const declarationAcceptedAt =
      initialVehicle?.driverDeclarationAcceptedAt || new Date().toISOString();

    const vehicleData = {
      make: result.data.make,
      model: result.data.model,
      colour: result.data.colour,
      year: result.data.year,
      passenger_seats: result.data.passengerSeats,
      accessibility_notes: result.data.accessibilityNotes || null,
      is_primary: true,
      is_active: true,
      driver_declaration_accepted_at: declarationAcceptedAt,
    };

    const supabase = createClient();

    if (initialVehicle) {
      const { data: updatedVehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .update(vehicleData)
        .eq("id", initialVehicle.id)
        .eq("owner_id", userId)
        .select("id")
        .single();

      if (vehicleError || !updatedVehicle) {
        setStatus({
          type: "error",
          message: getFriendlyVehicleError(
            vehicleError?.message || "The vehicle record was not found.",
          ),
        });
        setIsSubmitting(false);
        return;
      }
    } else {
      const { data: createdVehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .insert({
          ...vehicleData,
          owner_id: userId,
        })
        .select("id")
        .single();

      if (vehicleError || !createdVehicle) {
        setStatus({
          type: "error",
          message: getFriendlyVehicleError(
            vehicleError?.message || "The vehicle could not be created.",
          ),
        });
        setIsSubmitting(false);
        return;
      }
    }

    setStatus({
      type: "success",
      message: initialVehicle
        ? "Your vehicle details have been updated successfully."
        : "Your primary vehicle has been added successfully.",
    });

    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <section
      aria-labelledby="vehicle-setup-heading"
      className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={handleSubmit} noValidate>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Driver setup
          </p>

          <h2
            id="vehicle-setup-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-slate-950"
          >
            {initialVehicle
              ? "Manage your primary vehicle"
              : "Add your primary vehicle"}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Passengers use vehicle information to identify the vehicle for an
            accepted journey. No registration numbers and ownership documents
            are collected at this stage.
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="vehicleMake"
                className="block text-sm font-medium text-slate-700"
              >
                Vehicle make
              </label>

              <input
                id="vehicleMake"
                name="make"
                type="text"
                autoComplete="off"
                defaultValue={initialVehicle?.make || ""}
                placeholder="For example, Toyota"
                aria-invalid={Boolean(errors.make)}
                aria-describedby={
                  errors.make ? "vehicleMake-error" : "vehicleMake-description"
                }
                className={`${inputClassName} ${
                  errors.make ? errorInputClassName : ""
                }`}
              />

              <p
                id="vehicleMake-description"
                className="mt-2 text-xs leading-5 text-slate-500"
              >
                Enter the vehicle manufacturer.
              </p>

              <FieldError id="vehicleMake-error" errors={errors.make} />
            </div>

            <div>
              <label
                htmlFor="vehicleModel"
                className="block text-sm font-medium text-slate-700"
              >
                Vehicle model
              </label>

              <input
                id="vehicleModel"
                name="model"
                type="text"
                autoComplete="off"
                defaultValue={initialVehicle?.model || ""}
                placeholder="For example, Corolla"
                aria-invalid={Boolean(errors.model)}
                aria-describedby={
                  errors.model ? "vehicleModel-error" : undefined
                }
                className={`${inputClassName} ${
                  errors.model ? errorInputClassName : ""
                }`}
              />

              <FieldError id="vehicleModel-error" errors={errors.model} />
            </div>

            <div>
              <label
                htmlFor="vehicleColour"
                className="block text-sm font-medium text-slate-700"
              >
                Vehicle colour
              </label>

              <input
                id="vehicleColour"
                name="colour"
                type="text"
                autoComplete="off"
                defaultValue={initialVehicle?.colour || ""}
                placeholder="For example, Silver"
                aria-invalid={Boolean(errors.colour)}
                aria-describedby={
                  errors.colour
                    ? "vehicleColour-error"
                    : "vehicleColour-description"
                }
                className={`${inputClassName} ${
                  errors.colour ? errorInputClassName : ""
                }`}
              />

              <p
                id="vehicleColour-description"
                className="mt-2 text-xs leading-5 text-slate-500"
              >
                This helps passengers identify the correct vehicle.
              </p>

              <FieldError id="vehicleColour-error" errors={errors.colour} />
            </div>

            <div>
              <label
                htmlFor="vehicleYear"
                className="block text-sm font-medium text-slate-700"
              >
                Vehicle year{" "}
                <span className="font-normal text-slate-500">(optional)</span>
              </label>

              <input
                id="vehicleYear"
                name="year"
                type="number"
                inputMode="numeric"
                min={1900}
                max={maximumVehicleYear}
                defaultValue={initialVehicle?.year || ""}
                placeholder="For example, 2020"
                aria-invalid={Boolean(errors.year)}
                aria-describedby={errors.year ? "vehicleYear-error" : undefined}
                className={`${inputClassName} ${
                  errors.year ? errorInputClassName : ""
                }`}
              />

              <FieldError id="vehicleYear-error" errors={errors.year} />
            </div>

            <div>
              <label
                htmlFor="passengerSeats"
                className="block text-sm font-medium text-slate-700"
              >
                Available passenger seats
              </label>

              <select
                id="passengerSeats"
                name="passengerSeats"
                defaultValue={
                  initialVehicle?.passengerSeats
                    ? String(initialVehicle.passengerSeats)
                    : ""
                }
                aria-invalid={Boolean(errors.passengerSeats)}
                aria-describedby={
                  errors.passengerSeats
                    ? "passengerSeats-error"
                    : "passengerSeats-description"
                }
                className={`${inputClassName} ${
                  errors.passengerSeats ? errorInputClassName : ""
                }`}
              >
                <option value="" disabled>
                  Select capacity
                </option>

                {Array.from({ length: 8 }, (_, index) => {
                  const seats = index + 1;

                  return (
                    <option key={seats} value={seats}>
                      {seats} passenger {seats === 1 ? "seat" : "seats"}
                    </option>
                  );
                })}
              </select>

              <p
                id="passengerSeats-description"
                className="mt-2 text-xs leading-5 text-slate-500"
              >
                Count passenger seats only; do not include the driver seat.
              </p>

              <FieldError
                id="passengerSeats-error"
                errors={errors.passengerSeats}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="accessibilityNotes"
                className="block text-sm font-medium text-slate-700"
              >
                Accessibility or practical information{" "}
                <span className="font-normal text-slate-500">(optional)</span>
              </label>

              <textarea
                id="accessibilityNotes"
                name="accessibilityNotes"
                rows={4}
                defaultValue={initialVehicle?.accessibilityNotes || ""}
                placeholder="For example, space for a folding wheelchair or limited luggage capacity."
                aria-invalid={Boolean(errors.accessibilityNotes)}
                aria-describedby={
                  errors.accessibilityNotes
                    ? "accessibilityNotes-error"
                    : "accessibilityNotes-description"
                }
                className={`${inputClassName} resize-y ${
                  errors.accessibilityNotes ? errorInputClassName : ""
                }`}
              />

              <p
                id="accessibilityNotes-description"
                className="mt-2 text-xs leading-5 text-slate-500"
              >
                Maximum of 500 characters. Do not include sensitive personal
                information.
              </p>

              <FieldError
                id="accessibilityNotes-error"
                errors={errors.accessibilityNotes}
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="driverDeclarationAccepted"
                defaultChecked={Boolean(
                  initialVehicle?.driverDeclarationAcceptedAt,
                )}
                className="mt-1 h-4 w-4 accent-emerald-600"
              />

              <span>
                <span className="block text-sm font-semibold text-amber-950">
                  Driver declaration
                </span>

                <span className="mt-2 block text-sm leading-6 text-amber-900">
                  I confirm that I am legally allowed to drive this vehicle and
                  that I am responsible for keeping a valid license, insurance
                  and any required permission for cost-sharing journeys.
                </span>
              </span>
            </label>

            <FieldError
              id="driverDeclarationAccepted-error"
              errors={errors.driverDeclarationAccepted}
            />
          </div>

          {status ? (
            <div
              role={status.type === "error" ? "alert" : "status"}
              aria-live="polite"
              className={`mt-6 rounded-xl border p-4 text-sm leading-6 ${
                status.type === "success"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-red-300 bg-red-50 text-red-900"
              }`}
            >
              {status.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting
              ? "Saving vehicle…"
              : initialVehicle
                ? "Update Vehicle"
                : "Save Vehicle"}
          </button>
        </form>

        <aside className="rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
              className="h-6 w-6"
            >
              <path d="M5 17h14" />
              <path d="m7 17-1 3" />
              <path d="m17 17 1 3" />
              <path d="M6 13h12l-1.5-5h-9L6 13Z" />
              <circle cx="8" cy="14" r="1" />
              <circle cx="16" cy="14" r="1" />
            </svg>
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
            Responsible driving
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight">
            Vehicle information is not verification
          </h3>

          <p className="mt-4 text-sm leading-6 text-slate-300">
            CommuteConnect records the details you provide but does not
            currently verify ownership, licensing or insurance.
          </p>

          <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
            <li>Keep your vehicle information accurate and up to date.</li>
            <li>Do not upload registration, licence or insurance documents.</li>
            <li>
              Journey-specific information such as pets, smoking and luggage
              belongs in the journey form.
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
