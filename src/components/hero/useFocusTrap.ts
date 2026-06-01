import { useEffect, useRef } from "react";

/** Elements that can receive keyboard focus inside the trap. */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Focus trap for a modal-style surface that only mounts while open (e.g. the
 * About dialog). On mount it remembers what was focused (the trigger), moves
 * focus into the container so the dialog's accessible name is announced, and
 * cycles Tab / Shift+Tab within the container. On unmount it restores focus to
 * the trigger. Escape-to-close is handled separately by the open-state hook.
 *
 * Attach the returned ref to the container and give it `tabIndex={-1}` so it
 * can receive the initial programmatic focus.
 */
export function useFocusTrap<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Move focus to the container itself rather than the first control, so the
    // dialog's role + accessible name are announced before its contents.
    node.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusables = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null);

      if (focusables.length === 0) {
        // Nothing tabbable: keep focus pinned to the container.
        e.preventDefault();
        node.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        // Wrap backwards from the first control (or the container) to the last.
        if (active === first || active === node) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        // Wrap forwards from the last control back to the first.
        e.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKeyDown);
    return () => {
      node.removeEventListener("keydown", onKeyDown);
      // Restore focus to the trigger so keyboard users land where they left.
      previouslyFocused?.focus?.();
    };
  }, []);

  return containerRef;
}
