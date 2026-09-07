# Project implementation rules

## Product boundary

Succession Scenario Lab is a renderer and deterministic calculation player. It is not an AI legal-answer generator. Legal questions, facts, explanations, answers, case citations, and jurisprudence metadata must enter through imported JSONL files. A downloadable, source-verified case-library JSONL may ship as a static data artifact, but case substance must never be embedded in React components or calculation code.

## Architecture

- Keep scenario content, parsing, calculations, and presentation separate.
- `src/types` owns the versioned scenario contract.
- `src/engine` contains pure, independently tested calculation functions and JSONL parsing.
- Property inventory helpers derive net asset values and reconcile itemized property against declared estate totals. They do not decide legal entitlement.
- UI components receive typed data and may not embed substantive legal rules.
- Top navigation is stateful. Cases is the combined overview dashboard; Family tree, Estate, and Computation render isolated detail views. Do not turn the tabs into scroll anchors.
- Imported cases are durable application records. Save their full validated JSON payloads in the bound D1 database, upsert by stable case `id`, and load the saved library from the server when the app opens. Browser-only storage is not an acceptable persistence layer.
- D1 migrations define schema only. Keep seed or library content in JSONL and load it through the same cases API used by the import flow.
- The app shell is viewport-contained: never introduce document-level scrolling. Set overflow ownership deliberately so long property, story, disposition, computation, and graph content scrolls inside its card/canvas.
- Family graph connectors must be derived from `relationships` and `dispositions`; generation numbers may assist layout but may not stand in for explicit relationship edges.
- Graph pan, zoom, and node dragging are presentation-only state and must never mutate imported scenario content.
- Scenario storytelling is supplied through the optional `story` object. The UI may organize and label imported facts, people, and dispositions, but it must not invent missing dates, circumstances, classifications, or narrative facts.
- Unknown computation modules must fail visibly and must not be guessed.
- Dispositions reference people and property by stable IDs. Never duplicate property or beneficiary data inside a disposition.
- Every calculation returns its result plus human-readable arithmetic steps for the learning interface.

## Required calculation modules

- `calculate_legitimate_child_legitime()`
- `calculate_spouse_concurrence()`
- `calculate_representation()`
- `calculate_reciprocal_substitution()`

Keep inputs explicit, outputs serializable, and functions free of UI or network dependencies. Extend by registering new modules instead of editing scenario components.

## JSONL constraints

- One complete scenario object per line; blank lines are ignored.
- Validate required fields and report line-specific errors.
- Preserve provenance fields for jurisprudence, including whether a scenario is exact or case-inspired.
- Jurisprudence titles shown in the case library must include the case name, G.R. number, and decision date. Preserve reporter citations and corrected user-supplied citations in `caseDetails`.
- Never silently repair doctrinal content or generate missing legal explanations.
- Treat imported text as untrusted display data. Do not execute HTML from JSONL.

## Scalability and quality

- Prefer small composable modules over a universal succession solver.
- Preserve backwards compatibility through `schemaVersion` migrations.
- Money calculations use explicit numeric inputs and display currency through `Intl.NumberFormat`.
- Add tests with each rule extension, especially boundary cases and allocation totals.
- Meet keyboard, focus, contrast, reduced-motion, empty, loading, and error-state requirements.
- Keep the full-page shell responsive at 360px, 768px, 1024px, and 1440px.

## Visual rules

Follow `DESIGN.md`. Maintain one periwinkle accent, cool neutral surfaces, 16px card radii, thin borders, and restrained motion. Do not copy third-party logos or brand assets from the visual references.
