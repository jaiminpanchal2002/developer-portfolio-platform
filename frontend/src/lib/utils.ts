import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** JSON.stringify doesn't escape `</script>`, so a JSON-LD payload built
 *  from admin-editable text (bio, blog content, etc.) that happens to
 *  contain that literal substring would prematurely close the <script>
 *  tag and inject raw HTML into the page. Escaping `<` to its unicode
 *  form is the standard mitigation and is a no-op for valid JSON. */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
