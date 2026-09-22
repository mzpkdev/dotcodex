---
name: design
description: Build and refine interactive UI mockups directly in project code. Use for designing screens, exploring visual alternatives, matching screenshots, or improving the appearance and interaction of an existing interface. Not for backend-only work or production audits.
---

# Design in code

Turn a visual intent into a running mockup the user can judge and steer. Work through
ordinary conversation; no command vocabulary or setup questionnaire is required.

## Read the intent

Inspect the relevant screen, components, styles, assets, and project instructions.
Use existing design notes when available. Identify the audience, primary task, and
content from the request and project. Ask only when a missing answer would materially
change the result; otherwise state a consequential assumption briefly and proceed.

Distinguish the requested work:

- **Create:** choose one coherent direction and build it. For substantial new work,
  briefly explain the visual idea before editing; this is not an approval gate.
- **Refine:** preserve the current identity, content, behavior, and everything outside
  the requested change. A small spacing fix stays a small spacing fix.
- **Redesign:** change the visual direction while retaining product facts and required
  functionality. Do not turn a redesign into incremental polish of the discarded look.
- **Explore:** when alternatives are requested, make them meaningfully different in
  composition, hierarchy, or visual character. Keep them easy to compare in the running
  mockup and preserve the current version until a direction is selected. Use an existing
  preview mechanism when available; otherwise choose a small reversible implementation.

## Use references deliberately

Honor the user's explicit choices. Treat a screenshot to match as a fidelity target:
reproduce its composition, proportions, typography, colors, and imagery rather than
substituting your taste. Treat inspiration as guidance to interpret, not a template to
copy. Clarify this distinction only when it is ambiguous and would change the work.

For refinements, the existing interface supplies the visual conventions even without a
DESIGN.md. References override those conventions only within the requested scope.
Inspect supplied images with available image tools; do not claim fidelity to unseen media.

## Make the design serve the screen

Let the content and task drive hierarchy, type, spacing, color, and imagery. A marketing
screen can earn attention through a strong visual idea; a dashboard needs scanability
and useful density; a reading screen needs comfortable measure and clear structure.

Choose a small coherent set of visual tokens. Prefer the project's existing tokens for
refinements. Give expressive work a distinctive focal point and quieter supporting
elements. Common patterns—cards, gradients, familiar fonts, eyebrow labels—are choices
to justify in context, not universal prohibitions. The brief outranks aesthetic defaults.

Use realistic content and varied lengths to expose layout problems. Preserve supplied
facts and copy unless editing them is in scope; identify invented figures or claims as
sample content. Use available imagery or suitable asset tools when imagery carries the
concept. If assets are missing, make placeholders intentional and disclose the gap.

## Build the mockup

Use the project's stack, components, and styling conventions. For new prototype behavior,
make the main interaction work with local state or mock data; preserve working integrations
when editing an existing screen. Include relevant empty, loading, error, and selected
states without manufacturing an exhaustive state matrix.
Keep backend integration and production infrastructure outside scope unless requested.

Maintain readable contrast, semantic controls, keyboard focus, reduced-motion support
where motion is used, and responsive behavior appropriate to the requested device scope.
Use existing preview tools; keep the result easy to open and revisit.

## Inspect and refine

When browser tools are available, inspect the rendered result at relevant viewport sizes
and exercise the main interaction. For reference matching, compare at the requested CSS
viewport; otherwise estimate the reference's content viewport and state uncertainty.
Check composition and hierarchy as well as overflow, spacing, content, and states;
a successful build alone is not visual proof.

Batch the visible fixes, then verify the affected views and interactions. Continue only
for a concrete remaining defect or requested change, not endless aesthetic polishing.
Run existing checks appropriate to the edit. If rendering or interaction checks are
unavailable, disclose that limitation and distinguish verified behavior from assumptions.

Reuse existing design documentation. Record settled reusable decisions in DESIGN.md when
they will help future work; keep notes brief and provisional explorations out of it.
Creating documentation is not a prerequisite for editing a screen.

Finish with what changed, where to preview it, and what was checked. Mention material
mocked behavior, asset gaps, or verification limits. Keep the handoff short so the user
can judge the design itself.
