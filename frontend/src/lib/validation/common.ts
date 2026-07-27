import { z } from "zod";

export const urlPattern = /^https?:\/\/[^\s]+\.[^\s]+$/i;

/** Optional URL field — empty string passes, anything else must look like a real URL.
 *  No `.optional()`/`.transform()`: those make zod's input/output types diverge,
 *  which breaks zodResolver's generic inference. Fields are always plain strings
 *  defaulting to "" from the form's defaultValues, so this is never undefined. */
export function optionalUrl(label = "URL", max = 500) {
  return z
    .string()
    .trim()
    .max(max, `${label} is too long`)
    .refine((val) => val === "" || urlPattern.test(val), {
      message: `Enter a valid ${label.toLowerCase()} (starting with http:// or https://)`,
    });
}

export function requiredUrl(label = "URL", max = 500) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} is too long`)
    .refine((val) => urlPattern.test(val), {
      message: `Enter a valid ${label.toLowerCase()} (starting with http:// or https://)`,
    });
}

export function requiredText(label: string, min = 1, max = 255) {
  return z
    .string()
    .trim()
    .min(min, min > 1 ? `${label} must be at least ${min} characters` : `${label} is required`)
    .max(max, `${label} must be under ${max} characters`);
}

export function optionalText(max = 1000) {
  return z.string().trim().max(max, `Must be under ${max} characters`);
}

export const requiredEmail = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const optionalEmail = z
  .string()
  .trim()
  .max(255)
  .refine((val) => val === "" || z.string().email().safeParse(val).success, {
    message: "Enter a valid email address",
  });
