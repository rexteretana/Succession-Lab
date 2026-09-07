# Succession Lab visual system

## Reading-first audit update

- Family connector labels are measured from their SVG paths, not positioned independently. Representation labels belong to their own branches; external disposition routes use a separate corridor. Hover and keyboard focus emphasize incident relationships, with restrained dashed-line motion disabled for reduced-motion preferences. Fullscreen preserves manual node positioning.

- Condition space uses a rotatable orthographic 3D categorical plot, selectable grouped points, projection guides, a keyboard-accessible rotation slider, and fullscreen/Escape. Missing axes are unplotted rather than placed at invented midpoint coordinates. Identical classifications intentionally share a position; substitution types are separate metadata, not a fourth spatial axis.

- Desktop uses a 64px navigation rail and a 264px workspace sidebar. The rail toggle remains available when the sidebar is closed, including on phones.
- Cases uses one scrollable reading surface below compact summary cards. The full-width story precedes inventory and dispositions; no family graph or computation panel competes with the narrative.
- Body text uses 13–14px with generous line spacing. Names, roles, dates, and titles wrap. Secondary text uses darker gray for legibility.
- Estate rows expand to reveal valuations and full clauses. Lists size to their content instead of compressing rows inside a constrained panel.
- Computation prioritizes the authored numbered guide, followed by calculation details. Monetary summaries aggregate the existing calculation outputs.
- Conditions pairs a scrollable classification map with complete condition records. Legal outcomes and substitution types are never inferred from a visual classification alone.
- Family-tree fitting includes outside beneficiaries and substitution connectors. Fullscreen and zoom remain available for dense maps.
- These decisions supersede conflicting proportions and overview layouts below.

## Design intent

A calm, full-page legal learning workspace modeled on the supplied references: a bright application frame, a narrow utility rail, a wider case-library sidebar, a compact topbar, pale summary tiles, and a large dotted relationship canvas. The product should feel precise, approachable, and academically serious.

## Core tokens

- Page: `#eef0f3`; app and primary cards: `#ffffff`; secondary surfaces: `#f6f7f9`.
- Text: `#17181b`; secondary: `#686b73`; quiet: `#979aa3`; border: `#e4e6eb`.
- Primary accent: restrained periwinkle `#6764e8`; tint `#efefff`.
- Semantic accents only: coral `#ef7b74`, mint `#38b982`, amber `#e9ae47`.
- Font: Geist-style modern grotesk via a local system stack. Strong hierarchy comes from weight and scale, not decoration.
- Radius rule: 16px cards, 12px controls, fully rounded compact segmented controls.
- Shadows: very soft cool-gray ambient shadow on the outer shell only; cards rely mainly on borders.

## Layout

- App covers `100dvh`. On wide screens it has a 16px outer gutter and a softly rounded shell. The document itself never scrolls: `html`, `body`, and the root app are viewport-locked, while each dense card (property list, dispositions, story facts, computation ledger) owns its own internal scroll.
- Desktop grid: 76px utility rail, 292px collapsible case-library sidebar, flexible workspace.
- Topbar is 72px tall and remains on one line.
- Workspace uses 20-24px gutters. The Cases tab is the complete dashboard overview; Family tree, Estate, and Computation are isolated detail modes.
- Cases combines the citation record, case story, summary, property inventory, testamentary dispositions, family tree, and calculation ledger in one page. Family tree dedicates the stage to relationships; Estate pairs property inventory with dispositions; Computation gives the rule ledger the full content width.
- The Cases overview includes a compact case-story section between the monetary summary and analytical panels. It uses an editorial narrative column plus structured decedent, death, will, parties, procedural history, issues, rulings, doctrines, and dispositions facts, all sourced from JSONL.
- Estate property rows show type, ownership, net value, and encumbrances without hiding the underlying estate totals.
- The graph canvas is the visual anchor: near-white dotted grid, thin charcoal connectors, periwinkle focus states, and white person nodes. Spouse, line-of-descent, representation, and testamentary-disposition connections have distinct styles and a persistent legend.
- Family graph controls support zoom in/out, cursor-centered wheel zoom, drag-to-pan, Fit view, reset layout, and movable person nodes whose connectors update with their positions.

## Components and states

- Cards: white or cool-gray fill, 1px border, 14-16px radius, no heavy drop shadow.
- Controls: 38-42px height, quiet neutral default, periwinkle tint for selected state.
- Hover: border darkens slightly and surface lifts by 1px. Active state presses by 1px.
- Focus: 3px translucent periwinkle ring with a 1px solid inner outline.
- Loading: structural skeletons matching tiles and nodes. Empty state invites JSONL loading. Errors appear inline in the import dialog.
- Motion: brief opacity/translate transitions only when content loads or the active scenario changes; disabled under reduced motion.

## Responsive behavior

- Under 1100px: estate panels stack and wide relationship diagrams remain scrollable without shrinking person cards below a readable width.
- Under 820px: case-library sidebar becomes a slide-over; icon rail and topbar remain.
- Under 640px: outer gutter and shell radius disappear, summary tiles become horizontally scrollable, top navigation collapses to the current view, and graph nodes retain a minimum readable width. Viewport containment remains intact; scrolling is limited to the active card or graph canvas.
- Touch targets remain at least 44px. Keyboard focus is always visible.

## Reference boundaries

Match the supplied references in shell proportions, spacing, rounded surfaces, light-gray palette, and graph-panel feel. Do not reproduce their logo, brand marks, names, illustrative assets, or proprietary iconography.
