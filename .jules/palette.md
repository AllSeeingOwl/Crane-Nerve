## 2024-05-24 - Screen Reader ARIA Improvements

**UX Issue:** Custom UI elements like visual progress bars, mutating flavor text, and inline keyboard hints create a poor, noisy experience for screen reader users (NVDA/JAWS).
**Learning:**

- Custom `div` implementations of progress/health bars must explicitly define `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and an `aria-label`.
- Text that mutates automatically (like a rotating warning string) should be wrapped with `aria-hidden="true"` to prevent it from constantly interrupting the screen reader's output buffer.
- Visual button hints for keyboard shortcuts (like `ESC`) should use the semantic `<kbd>` element rather than a generic `<span>`.
  **Action:** When building custom interactive or status-displaying UI elements, prioritize adding explicit ARIA roles and properties.
