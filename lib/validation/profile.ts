import { z } from "zod";

export const profileRoles = [
  "passenger",
  "driver",
  "both",
] as const;

export const genderOptions = [
  "",
  "woman",
  "man",
  "non_binary",
  "another_identity",
] as const;

export function normalisePhoneNumber(value: string) {
  const compactValue = value
    .trim()
    .replace(/[\s\-()]/g, "");

  if (!compactValue) {
    return "";
  }

  if (compactValue.startsWith("00")) {
    return `+${compactValue.slice(2)}`;
  }

  if (/^0[0-9]+$/.test(compactValue)) {
    return `+353${compactValue.slice(1)}`;
  }

  if (/^353[0-9]+$/.test(compactValue)) {
    return `+${compactValue}`;
  }

  return compactValue;
}

export const profileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must contain at least 2 characters.")
      .max(100, "Full name must contain no more than 100 characters."),

    role: z.enum(profileRoles, {
      message: "Select how you plan to use CommuteConnect.",
    }),

    phone: z
      .string()
      .trim()
      .max(25, "Phone number is too long.")
      .refine(
        (value) => {
          const normalisedValue = normalisePhoneNumber(value);

          return (
            normalisedValue === "" ||
            /^\+[1-9][0-9]{7,14}$/.test(normalisedValue)
          );
        },
        {
          message:
            "Enter a valid phone number, such as 087 123 4567 or +353871234567.",
        },
      ),

    generalArea: z
      .string()
      .trim()
      .max(120, "General area must contain no more than 120 characters.")
      .refine(
        (value) => value === "" || value.length >= 2,
        "General area must contain at least 2 characters.",
      ),

    bio: z
      .string()
      .trim()
      .max(500, "Bio must contain no more than 500 characters."),

    organisationName: z
      .string()
      .trim()
      .max(
        120,
        "Organisation name must contain no more than 120 characters.",
      )
      .refine(
        (value) => value === "" || value.length >= 2,
        "Organisation name must contain at least 2 characters.",
      ),

    workEmail: z
      .string()
      .trim()
      .max(254, "Work email address is too long.")
      .refine(
        (value) =>
          value === "" || z.string().email().safeParse(value).success,
        "Enter a valid work email address.",
      ),

    preferSameOrganisation: z.boolean(),
    showOrganisation: z.boolean(),

    genderIdentity: z.enum(genderOptions),

    useGenderForMatching: z.boolean(),
    preferSameGender: z.boolean(),
  })
  .superRefine((values, context) => {
    if (
      values.preferSameOrganisation &&
      !values.organisationName
    ) {
      context.addIssue({
        code: "custom",
        path: ["preferSameOrganisation"],
        message:
          "Add an organisation before enabling same-organisation matching.",
      });
    }

    if (values.showOrganisation && !values.organisationName) {
      context.addIssue({
        code: "custom",
        path: ["showOrganisation"],
        message:
          "Add an organisation before allowing it to be displayed.",
      });
    }

    if (
      values.useGenderForMatching &&
      !values.genderIdentity
    ) {
      context.addIssue({
        code: "custom",
        path: ["genderIdentity"],
        message:
          "Select an optional gender identity before enabling gender-based matching.",
      });
    }

    if (
      values.preferSameGender &&
      !values.useGenderForMatching
    ) {
      context.addIssue({
        code: "custom",
        path: ["preferSameGender"],
        message:
          "Enable gender-based matching before selecting this preference.",
      });
    }

    if (
      values.preferSameGender &&
      !values.genderIdentity
    ) {
      context.addIssue({
        code: "custom",
        path: ["genderIdentity"],
        message:
          "Select an optional gender identity before enabling this preference.",
      });
    }
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
