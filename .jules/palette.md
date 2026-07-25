## 2024-05-24 - Screen Reader ARIA Improvements

**UX Issue:** Custom UI elements like visual progress bars, mutating flavor text, and inline keyboard hints create a poor, noisy experience for screen reader users (NVDA/JAWS).
**Learning:**

- Custom `div` implementations of progress/health bars must explicitly define `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and an `aria-label`.
- Text that mutates automatically (like a rotating warning string) should be wrapped with `aria-hidden="true"` to prevent it from constantly interrupting the screen reader's output buffer.
- Visual button hints for keyboard shortcuts (like `ESC`) should use the semantic `<kbd>` element rather than a generic `<span>`.
  **Action:** When building custom interactive or status-displaying UI elements, prioritize adding explicit ARIA roles and properties.

## 2025-02-18 - Focusable Locked States

**Learning:** Using `disabled` on interactive elements (like level select buttons) prevents them from receiving keyboard focus, which breaks custom arrow-key navigation and causes screen readers to skip them entirely.
**Action:** Instead of `disabled`, use `aria-disabled` combined with an `onClick` guard and conditional styling to preserve keyboard focusability and screen reader announcements for locked/unavailable items.

## 2025-02-19 - Explicit ARIA Labels on Buttons with Visual Hints

**Learning:** Buttons on transition screens that include decorative visual hints (like arrows '→' or keyboard shortcuts '<kbd>ESC</kbd>') often cause noisy and confusing screen reader announcements if their text content isn't carefully controlled. While using 'aria-hidden' on the hints helps, explicitly defining the intended action via 'aria-label' ensures the most concise and accurate auditory experience.
**Action:** Always provide explicit 'aria-label' attributes (e.g., 'aria-label="Return to menu"') on interactive buttons that have complex or multi-part visual labels to override the default text node extraction for screen readers.

## 2025-02-19 - Safe ARIA Live Regions for Transient Feedback

**Learning:** Completely hiding rapidly updating visual text from screen readers using `aria-hidden="true"` without providing an accessible alternative is an anti-pattern. However, attempting to create complex visually hidden `aria-live` replicas can lead to state/scope issues. The safest, most impactful pattern is attaching `aria-live="polite"` directly to the container of the transient visual feedback (like success/error messages), ensuring screen readers announce it precisely when it appears in the DOM.
**Action:** Use `aria-live="polite"` directly on the conditional rendering elements (e.g., `{feedback && <p aria-live="polite">{feedback}</p>}`) to safely announce dynamic status updates to screen reader users without over-engineering visually hidden replicas.
