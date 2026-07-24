1. **Identify Performance Bottleneck**: `Level11NightShift.tsx` updates `mouseTaskHealth`, `gazeTaskHealth`, and `faceTaskHealth` 60 times a second using `useState` in a `requestAnimationFrame` loop. This causes React to re-render the entire component 60 times a second, which is extremely inefficient and can cause noticeable lag.
2. **Implement Optimization**: Replace the `useState` calls for `mouseTaskHealth`, `gazeTaskHealth`, and `faceTaskHealth` with `useRef` to store the health values, and directly mutate the DOM elements for the health bars using another set of `useRef`s, similar to the `Level10Crisis.tsx` optimization.
3. **Verify Optimization**: Run the application and verify that `Level11NightShift.tsx` functions correctly without causing excessive React re-renders. Ensure the health bars still update visually.
4. **Pre-commit Steps**: Run `pre_commit_instructions` to ensure the codebase meets standards before committing.
5. **Create PR**: Create a PR with the title "⚡ Bolt: [performance improvement]" and details.

**Journal Entry**: I will also record this optimization in `.jules/bolt.md` to document the pattern of moving high-frequency React state updates to DOM mutations using refs in `requestAnimationFrame` loops.
