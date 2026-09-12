# Visual evidence and acceptance

Verify requested visual fidelity or visible interaction behavior. Scope review to the changed
component and the behavior at issue; reference-comparison steps apply when a design reference exists.

## Establish the reference

- Confirm the target node/frame and breakpoint; resolve unexpected layers or dimensions before using their values.
- Establish token bindings to visible properties and active mode/variant, including relevant opacity and compositing. Definitions alone do not prove bindings; keep unresolved ones as hypotheses.
- Inspect the reference. Retain and resolve disagreements between structured values and screenshots; do not choose silently or invent exact hex values from visual estimates.
- Share a focused image or retrievable screenshot, source identity, breakpoint/state, and uncertainties with the reviewer. A specialist's description or inspection claim cannot replace the image.

## Compare the implementation

Before distributing captures, validate one shared procedure against the expected viewport and UI state, and verify the page serves the intended source. Keep relevant inputs stable during final captures. Share the proven procedure and give each capture owner separate output paths.

Render the final implementation at each relevant supplied breakpoint. Wait for fonts/assets, establish UI state, and use consistent animation timing where needed. Record source state, route, viewport, and image path. Inspect a crop at useful resolution with enough context to judge placement; a reduced full-page image cannot establish fine color or asset fidelity.

Compare background treatment, foreground/logo tone and asset variant, typography, dimensions, spacing, clipping, and placement. Check relevant responsive/motion behavior. Pixel samples or image diffs may clarify discrepancies; they are neither mandatory nor proof of fidelity across renderers.

For transition defects, preserve animation and exercise the movement between controls; settled
screenshots cannot establish absence of flicker or moving borders. Observe live behavior or retain
a timed sequence. For text focus, inspect actual caret or selection visibility where expected;
computed `caret-color` alone does not prove the browser draws a caret.

For token or recipe substitutions intended to preserve appearance, compare computed values and the
selectors activated by added classes. A token's name or a recipe class does not establish equivalence.

If delegating, give `critic` the render or interaction evidence, source identity, viewport, user
outcome, and unresolved interpretations; include both images for reference comparison. Ask it to
challenge assumptions against the applicable requirement; do not set a disputed color as an
acceptance criterion. Code and visual review may run together or separately, with separate outcomes.

## Report only what passed

CSS-value tests establish computed properties, not reference fidelity or visible interaction results.
Distinguish an observed failure from an assumed design requirement, and supplied-evidence review from
independent reproduction. Name inspected states, missing breakpoints, unavailable images, and
unresolved discrepancies; keep code and visual outcomes separate.

Complete only after required visual comparison and resolution of material discrepancies. Continue authorized evidence gathering and fixes; if evidence is inaccessible, report the limitation and next step. No additional approval gate is implied; claim user acceptance only when given.
