# Classroom library reconciliation — 8 September 2026

The 20 JSONL examples are fictional stipulated exercises, not judicial holdings or advice for an actual estate. Numerical reconciliation does not by itself establish doctrinal correctness. A Philippine succession-law instructor should independently review the exercises before using them for assessment.

## Corrections

- Personal-property gifts (including stocks, business interests, and the movable archive) are legacies. A business interest is not a devise merely because its business operates on land.
- Cases 1–15 now state operative events and actual takers instead of displaying an unrelated reciprocal-substitution module. Case 2 illustrates one substitute for multiple beneficiaries (compendious); case 3 illustrates multiple substitutes for one beneficiary (brief).
- Cases involving preterition, ineffective disinheritance, captatory conditions and reduction state the consequence explicitly. Case 14 uses divisible monetary legacies so proportional reduction does not silently assume sale of indivisible real property.
- Pending/alternative substitutions are not added to current estate distributions. The reconciliation display includes all designated beneficiaries and substitutes, including zero current allocations. Fideicommissary second heirs are not awarded a duplicate present holding.
- Terms, modes, invalid restraints, and substitution-only clauses have no invented three-axis coordinates. A disposition can link multiple conditions, including separate acquisition and termination clauses.
- Substitution connectors reference their disposition and carry a path-anchored type label.
- Built-in records are refreshed from the shipped library while separately identified custom cases remain available.

## Primary authorities used

- [Civil Code, RA 386](https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html): Articles 782; 854; 857–868; 872–882; 888–899; 907–912; 918; 934; 970–977.
- [Family Code, Article 176, as amended by RA 9255](https://lawphil.net/statutes/repacts/ra2004/ra_9255_2004.html): the illegitimate-child half-share benchmark; apply the available-portion ceiling with the applicable Civil Code concurrence rules.

## Reproduction and safeguards

`pnpm generate:advanced-library` regenerates and reconciles the first fifteen records. `pnpm reconcile:library` applies the versioned amendments to shipped records. Never use the older generators alone as a production library.

`pnpm test` verifies estate totals, reference integrity, linked clauses, property classifications, substitution labels, selected actual recipient amounts and preservation of custom case IDs. `pnpm build` checks the production client and server bundle. The browser checks exercise the graph and reconciliation views; these tests are not a substitute for independent legal review.
