# Visual evidence and acceptance

Use this workflow when the user requests implementation fidelity to a design or reference image. Scale the review to the changed component; do not turn a small UI edit into a whole-site audit.

## Establish the reference

- Confirm the target node/frame and breakpoint. An image layer, unrelated hero, or unexpected dimensions may indicate the wrong target; resolve that before using its values downstream.
- A token definition proves a variable exists, not that it controls a visible fill. Establish its binding to the target property and active mode/variant, including opacity and compositing when relevant. Preserve unresolved bindings as hypotheses.
- Inspect the reference's visible appearance. When structured values and the screenshot disagree, retain both observations and resolve the discrepancy rather than silently choosing one. Never invent an exact hex value from an unaided visual estimate.
- Make reference evidence accessible to whoever will compare it: focused image artifact or directly retrievable screenshot, source node/frame identity, breakpoint/state, and outstanding uncertainties. A specialist's prose description or claim that it saw an image is not a replacement for the image.

## Compare the implementation

Render the final implementation at each supplied breakpoint relevant to the changed surface. Wait for fonts and assets, establish the intended UI state, and use consistent animation timing when needed. Record the render's source state, route, viewport, and image path. Inspect a focused crop at useful resolution, plus enough surrounding context to judge placement; a scaled-down full-page image is insufficient for fine color or asset checks.

Compare reference and render explicitly for background treatment, foreground/logo tone and asset variant, typography, dimensions, spacing, clipping, and placement. Check responsive or motion behavior where relevant. Pixel sampling or image diffs can clarify discrepancies but are not universal requirements or proof of exact fidelity across different renderers.

If delegating, give `critic` both images, their identities and viewports, the user outcome, and unresolved interpretations. Ask it to challenge the implementation's premises against the reference. Do not encode a disputed color as an acceptance criterion. Code and visual review may run together or separately; preserve separate outcomes.

## Report only what passed

Tests of chosen CSS values establish internal behavior; they do not independently establish the values match the reference. Distinguish implementation/checks complete, code review complete, and visual comparison complete. Name missing breakpoints, unavailable images, or unresolved discrepancies explicitly.

Do not declare the design-matching task complete while required visual comparison is missing or material discrepancies remain. Continue authorized work to obtain evidence and fix discrepancies. If evidence is inaccessible, report the specific limitation and next step. This does not introduce a mandatory user-approval gate: claim user acceptance only when the user actually gave it.
