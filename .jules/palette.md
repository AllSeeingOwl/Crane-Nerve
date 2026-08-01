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

## 2025-02-13 - Focus management on application entry point

**Learning:** For application entry points like `MainMenu.tsx`, auto-focusing the primary action (e.g., a "Proceed" button) immediately on mount ensures that keyboard users instantly know how to interact with the screen without having to tab into the content.
**Action:** Automatically apply `useRef` and `useEffect` with a small timeout to focus primary action buttons on mount for entry and transition screens.

## 2025-02-23 - Auto-focusing dynamic grids

**Learning:** When users return to a menu or grid layout (like Level Select) after completing a task, forcing them to manually re-navigate or tab into the grid creates unnecessary friction. Auto-focusing the next logical uncompleted item on mount provides immediate continuity.
**Action:** Use `useRef` array and a `useEffect` with a timeout on mount to automatically focus the button corresponding to the next logical step in grid-based selection menus.

## 2025-02-23 - Critical Alert ARIA Roles

**Learning:** When displaying critical, transient warning messages or delayed popups (like a sudden "WARNING! WAKE UP!" message), screen readers will not announce them by default since focus does not change. Standard `aria-live="polite"` might not be urgent enough.
**Action:** For highly critical warnings that demand immediate attention, use `role="alert"` and `aria-live="assertive"` on the rendering container so that the screen reader interrupts current speech and announces the message immediately.

## 2025-02-24 - Restoring Context with aria-describedby

**Learning:** When adding `aria-label` to buttons to provide clean screen reader announcements, we often inadvertently hide rich secondary text (like descriptions or control hints) present in the button's DOM.
**Action:** Use `aria-describedby` with dynamic IDs to explicitly link secondary descriptive text (like `<p>` tags for descriptions or `<div>` tags for controls) back to the button. This ensures screen readers announce the primary label followed by the rich context, preserving a clean structure without losing information.

## 2025-02-24 - Critical Alerts in Level Components

**Learning:** When displaying critical, transient warning messages (like the DVORAK keyboard warning in Level12TheDebrief), screen readers will not announce them by default since focus does not change. Standard `aria-live="polite"` might not be urgent enough for these sudden game events.
**Action:** For highly critical warnings that demand immediate attention, use `role="alert"` and `aria-live="assertive"` on the rendering container so that the screen reader interrupts current speech and announces the message immediately.
