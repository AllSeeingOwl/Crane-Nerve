## 2024-07-12 - Progress bar ARIA roles

**Learning:** Custom UI elements acting as progress bars (like the stress meter and level progress) lacked semantics and ARIA attributes in this app. The decorative visual shapes were hiding information from screen readers.
**Action:** Always add `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` to any visual meters/progress indicators built with `div`s. Remember to add `aria-hidden="true"` to adjacent purely decorative SVGs (like the EKG icon next to the stress meter) to prevent noisy screen reader output.

## 2025-01-28 - Decorative SVGs and Screen Readers

**Learning:** Decorative SVG elements, such as background graphics (like EKG lines) or pure visualizers (like dragging lines or game objects), were being exposed to screen readers, creating noisy and confusing audio output.
**Action:** Always add `aria-hidden="true"` to purely decorative `<svg>` elements that do not convey meaningful information or interactable state. This ensures a cleaner and more focused screen reader experience.
