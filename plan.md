1. **Refactor React State Updates in `Level6Tuning.tsx`**
   - In `Level6Tuning.tsx`, `setHoldProgress` is updated every frame inside a `requestAnimationFrame` loop, which causes excessive React re-renders (~60fps) and violates the memory guideline on game loops.
   - I will remove the `holdProgress` state and `setHoldProgress`.
   - I will add `holdProgressContainerRef` and `holdProgressFillRef` to directly manipulate the DOM inside the `requestAnimationFrame` loop.

2. **Complete Pre-commit Steps**
   - Ensure proper testing, verification, review, and reflection are done by following the pre-commit instructions.

3. **Submit the PR**
   - Commit the changes and submit the PR with the title '⚡ Bolt: [performance improvement]' and description detailing the What, Why, Impact, and Measurement.
