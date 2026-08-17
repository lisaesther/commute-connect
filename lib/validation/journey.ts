import { z } from "zod";

import { irelandLocalDateTimeToIso } from "@/lib/time/ireland";

export const departureFlexibilityValues = [
  "0",
  "15",
  "30",
  "60",
] as const;

export const luggagePreferenceValues = [
  "none",
  "small",
  "medium",
  "large",
] as const;

export const petsPreferenceValues = [
  "no",
  "yes",
  "ask",
] as const;

const coordinateSchema = z
  .number()
  .finite();

export const journeySchema = z
  .object({
    originName: z
      .string()
      .trim()
      .min(2, "Search for and select an origin location.")
      .max(300, "Origin must be under 300 characters."),

    originLatitude: coordinateSchema
      .min(-90, "Origin latitude is invalid.")
      .max(90, "Origin latitude is invalid."),

    originLongitude: coordinateSchema
      .min(-180, "Origin longitude is invalid.")
      .max(180, "Origin longitude is invalid."),

    destinationName: z
      .string()
      .trim()
      .min(2, "Search for and select a destination location.")
      .max(300, "Destination must be under 300 characters."),

    destinationLatitude: coordinateSchema
      .min(-90, "Destination latitude is invalid.")
      .max(90, "Destination latitude is invalid."),

    destinationLongitude: coordinateSchema
      .min(-180, "Destination longitude is invalid.")
      .max(180, "Destination longitude is invalid."),

    departureDate: z
      .string()
      .min(1, "Departure date is required."),

    departureTime: z
      .string()
      .min(1, "Departure time is required."),

    departureFlexibilityMinutes: z.enum(
      departureFlexibilityValues,
    ),

    seatsOffered: z
      .string()
      .min(1, "Available passenger seats are required.")
      .refine(
        (value) => {
          const seats = Number(value);

          return (
            Number.isInteger(seats) &&
            seats >= 1 &&
            seats <= 8
          );
        },
        {
          message:
            "Passenger seats must be a whole number between 1 and 8.",
        },
      ),

    suggestedContribution: z
      .string()
      .refine(
        (value) => {
          if (value.trim() === "") {
            return true;
          }

          const contribution = Number(value);

          return (
            Number.isFinite(contribution) &&
            contribution >= 0 &&
            contribution <= 100
          );
        },
        {
          message:
            "Suggested contribution must be between €0 and €100.",
        },
      ),

    luggagePreference: z.enum(
      luggagePreferenceValues,
    ),

    petsPreference: z.enum(
      petsPreferenceValues,
    ),

    smokingAllowed: z.boolean(),

    notes: z
      .string()
      .max(
        500,
        "Journey notes must be 500 characters or fewer.",
      ),

    pickupDetails: z
      .string()
      .max(
        500,
        "Private pickup instructions must be 500 characters or fewer.",
      ),

    dropoffDetails: z
      .string()
      .max(
        500,
        "Private drop-off instructions must be 500 characters or fewer.",
      ),
  })
  .superRefine((values, context) => {
    const originAndDestinationAreIdentical =
      values.originLatitude ===
        values.destinationLatitude &&
      values.originLongitude ===
        values.destinationLongitude;

    if (originAndDestinationAreIdentical) {
      context.addIssue({
        code: "custom",
        path: ["destinationName"],
        message:
          "Origin and destination must be different locations.",
      });
    }

    if (
      !values.departureDate ||
      !values.departureTime
    ) {
      return;
    }

    const departureIso =
      irelandLocalDateTimeToIso(
        values.departureDate,
        values.departureTime,
      );

    if (!departureIso) {
      context.addIssue({
        code: "custom",
        path: ["departureTime"],
        message:
          "Choose a valid departure date and time in Ireland.",
      });

      return;
    }

    if (
      Date.parse(departureIso) <=
      Date.now()
    ) {
      context.addIssue({
        code: "custom",
        path: ["departureDate"],
        message:
          "Departure must be scheduled for a future date and time.",
      });
    }
  });

export type JourneyFormValues = z.infer<
  typeof journeySchema
>;

export type JourneyFieldErrors = Partial<
  Record<keyof JourneyFormValues, string[]>
>;

export function normaliseOptionalText(
  value: string,
) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function validateJourneySeatCapacity(
  seatsOffered: string,
  passengerCapacity: number,
) {
  const seats = Number(seatsOffered);

  if (
    !Number.isInteger(seats) ||
    seats < 1
  ) {
    return "Enter a valid number of passenger seats.";
  }

  if (seats > passengerCapacity) {
    return `You can offer a maximum of ${passengerCapacity} passenger ${
      passengerCapacity === 1 ? "seat" : "seats"
    } with this vehicle.`;
  }

  return null;
}
