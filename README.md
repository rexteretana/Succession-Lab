# Succession Scenario Lab

A full-page React workspace that loads legal scenarios from user-supplied JSONL and renders the estate summary, family structure, and deterministic computation steps.

## Run locally

```bash
pnpm install
pnpm dev
```

## JSONL contract

Each non-blank line is one `schemaVersion: 1` scenario. Required fields are `id`, `title`, `estate`, `persons`, `relationships`, and `computations`.

- `schema/scenario.schema.json` is the machine-readable contract.
- `examples/scenario.template.jsonl` is a placeholder-only authoring template.
- `src/types/scenario.ts` is the matching TypeScript contract.

The optional `estate.properties` collection supports real property, cash, vehicles, securities, business interests, jewelry, intellectual property, receivables, and other personal property. Each item may carry an ownership classification and asset-specific encumbrances. `dispositions` reference beneficiaries and either a specific property or the general estate.

The optional `story` object supplies the human-readable case narrative, death date and place, will date, material circumstances, and key facts displayed in the Cases overview. The optional `caseDetails` object carries citation data, procedural history, issues, rulings, doctrines, provisions, source limitations, and citation corrections. Missing facts are labeled as not supplied rather than inferred.

The optional `computationGuide` array supplies authored, case-specific derivation steps. Each step may include a title, explanation, arithmetic expression, and numeric result; the Computation page uses it in place of the generic module narration.

The calculation engine contains no hard-coded legal cases. Use the in-app **Load JSONL** control to import class-authored or source-verified content. Validated cases are upserted by stable ID into the site's D1 database and automatically reloaded on later visits, so the case library is not tied to one browser.

The published app includes a downloadable ten-case Philippine succession library at `public/cases/philippine-succession-cases.jsonl`. It remains external JSONL content and enters the app through the same persistent import API as user files.

The advanced fictional mastery library is `public/cases/advanced-succession-mastery-15.jsonl`. Regenerate it with `pnpm generate:advanced-library`; its automated checks cover scenario count, inventory reconciliation, distribution totals, condition axes, and substitution types.
