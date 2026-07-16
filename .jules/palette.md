## 2024-07-12 - Progress bar ARIA roles

**Learning:** Custom UI elements acting as progress bars (like the stress meter and level progress) lacked semantics and ARIA attributes in this app. The decorative visual shapes were hiding information from screen readers.
**Action:** Always add `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` to any visual meters/progress indicators built with `div`s. Remember to add `aria-hidden="true"` to adjacent purely decorative SVGs (like the EKG icon next to the stress meter) to prevent noisy screen reader output.

## 2025-01-28 - Decorative SVGs and Screen Readers

**Learning:** Decorative SVG elements, such as background graphics (like EKG lines) or pure visualizers (like dragging lines or game objects), were being exposed to screen readers, creating noisy and confusing audio output.
**Action:** Always add `aria-hidden="true"` to purely decorative `<svg>` elements that do not convey meaningful information or interactable state. This ensures a cleaner and more focused screen reader experience.

## 2025-02-12 - Headings and Blinking Text for Screen Readers

**Learning:** Stylized text split across multiple heading tags (e.g., three `<h1>` tags for a three-word title) and continuously blinking UI elements causes significant auditory clutter and confusion for screen reader users.
**Action:** Consolidate multi-line stylized text into a single visually hidden `.sr-only` element for semantics, and wrap the visual pieces in an `aria-hidden="true"` container. For blinking text, provide a stable `aria-label` on the parent interactive element and apply `aria-hidden="true"` to the mutating text span to prevent constant re-announcements.

## 2025-02-12 - Inline decorative text for screen readers

**Learning:** Inline text characters like arrows (`←`, `→`) or checkmarks (`✓`) are often read aloud by screen readers (e.g., "leftward arrow", "check mark"), causing unnecessary clutter, especially when they just serve to style a clear label like "BACK" or "DONE".
**Action:** Always hide inline visual text symbols from screen readers by wrapping them in `<span aria-hidden="true">` elements to keep text clean, e.g. `<span aria-hidden="true">← </span>BACK`.

## 2025-02-13 - SPA Title Updates for Screen Readers

**Learning:** In state-based Single Page Applications (like this game routing on a \`screen\` state in \`App.tsx\`), the \`document.title\` does not update automatically on navigation. Screen reader users miss context about their location, and multi-tab usage is difficult.
**Action:** Always implement a mechanism (like a \`useEffect\`) to dynamically update the \`document.title\` based on the active screen state in SPAs to ensure screen readers announce page changes properly.

## 2025-02-13 - Dynamic ARIA Value Scaling

**Learning:** Hardcoded ARIA attributes like \`aria-valuemax=9\` on progress bars can quickly break or overflow when new content (like bonus levels) is added, confusing screen reader users with invalid fractions (e.g. 10/9).
**Action:** Ensure that visual progress scaling and their corresponding ARIA attributes (\`aria-valuemax\`) dynamically bind to the length of the data source array or collection instead of hardcoded maximums.
