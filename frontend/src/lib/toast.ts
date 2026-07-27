import Swal from "sweetalert2";

/**
 * Single source of truth for admin feedback UI, styled to match the site's
 * noir/gold visual identity. Replaces the old mix of blocking window.alert /
 * window.confirm calls (which don't match the design and read as broken on
 * a "premium" portfolio) with consistent, non-blocking toasts for
 * success/info and a real confirm dialog for destructive actions.
 */

const swalTheme = {
  background: "var(--noir-bg-elevated)",
  color: "var(--noir-fg)",
};

const toastMixin = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timerProgressBar: true,
  ...swalTheme,
  didOpen: (el) => {
    el.addEventListener("mouseenter", Swal.stopTimer);
    el.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export function toastSuccess(message: string) {
  return toastMixin.fire({
    icon: "success",
    title: message,
    timer: 3000,
    iconColor: "var(--noir-accent)",
  });
}

export function toastError(message: string) {
  return toastMixin.fire({
    icon: "error",
    title: message,
    timer: 4000,
    iconColor: "#ef4444",
  });
}

export function toastInfo(message: string) {
  return toastMixin.fire({
    icon: "info",
    title: message,
    timer: 3500,
    iconColor: "var(--noir-accent)",
  });
}

/** Blocking confirm dialog for a single destructive action. Resolves true only on explicit confirm. */
export async function confirmDelete(itemLabel?: string): Promise<boolean> {
  const result = await Swal.fire({
    title: "Delete this item?",
    text: itemLabel ? `"${itemLabel}" will be permanently removed. This can't be undone.` : "This can't be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "var(--noir-bg-surface-2, #1c1c1f)",
    ...swalTheme,
  });
  return result.isConfirmed;
}

/** Blocking confirm dialog for a bulk action across N selected rows. */
export async function confirmBulkAction(action: string, count: number, danger = false): Promise<boolean> {
  const result = await Swal.fire({
    title: `${action} ${count} item${count === 1 ? "" : "s"}?`,
    text: danger ? "This can't be undone." : undefined,
    icon: danger ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText: action,
    cancelButtonText: "Cancel",
    confirmButtonColor: danger ? "#ef4444" : "var(--noir-accent)",
    cancelButtonColor: "var(--noir-bg-surface-2, #1c1c1f)",
    ...swalTheme,
  });
  return result.isConfirmed;
}
