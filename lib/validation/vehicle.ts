import { z } from "zod";

export const maximumVehicleYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  make: z
    .string()
    .trim()
    .min(2, "Vehicle make must contain at least 2 characters.")
    .max(60, "Vehicle make must contain no more than 60 characters."),

  model: z
    .string()
    .trim()
    .min(1, "Enter the vehicle model.")
    .max(60, "Vehicle model must contain no more than 60 characters."),

  colour: z
    .string()
    .trim()
    .min(2, "Vehicle colour must contain at least 2 characters.")
    .max(40, "Vehicle colour must contain no more than 40 characters."),

  year: z.preprocess(
    (value) => {
      const text = String(value ?? "").trim();

      return text === "" ? null : Number(text);
    },
    z
      .number({
        message: "Enter a valid vehicle year.",
      })
      .int("Vehicle year must be a whole number.")
      .min(1900, "Vehicle year must be 1900 or later.")
      .max(
        maximumVehicleYear,
        `Vehicle year cannot be later than ${maximumVehicleYear}.`,
      )
      .nullable(),
  ),

  passengerSeats: z.preprocess(
    (value) => Number(value),
    z
      .number({
        message: "Select the number of passenger seats.",
      })
      .int("Passenger seats must be a whole number.")
      .min(1, "At least one passenger seat is required.")
      .max(8, "A maximum of 8 passenger seats is supported."),
  ),

  accessibilityNotes: z
    .string()
    .trim()
    .max(
      500,
      "Accessibility information must contain no more than 500 characters.",
    ),

  driverDeclarationAccepted: z.boolean().refine((value) => value, {
    message:
      "You must accept the driver declaration before saving the vehicle.",
  }),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;
