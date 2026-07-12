## 2024-07-12 - Progress bar ARIA roles

**Learning:** Custom UI elements acting as progress bars (like the stress meter and level progress) lacked semantics and ARIA attributes in this app. The decorative visual shapes were hiding information from screen readers.
**Action:** Always add `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` to any visual meters/progress indicators built with `div`s. Remember to add `aria-hidden="true"` to adjacent purely decorative SVGs (like the EKG icon next to the stress meter) to prevent noisy screen reader output.
