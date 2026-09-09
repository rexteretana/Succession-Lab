# Replacement of cases 20–25 — 9 September 2026

These six fictional **testate** problems replace the incomplete earlier records using the same IDs. Case 20 is the baseline; 21–25 are the five additional ascendant examples. All have no surviving spouse or descendants. Every recipient is an ascendant by blood or adoption. The reference point for “legitimate” or “nonmarital” filiation is explicitly stated.

## Authorities checked

- [Civil Code](https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html): Articles 887, 889–890, 903; 962–974, 986–987 and 993 for the stated comparisons; Articles 859–862, 872, 876–880, 904 and 955 for substitution, conditional gifts and separate acceptance.
- [RA 11642](https://lawphil.net/statutes/repacts/ra2022/ra_11642_2022.html): Sections 41–43 for the expressly stipulated 2023 adoption in case 25. Section 41 extends legitimate filiation to specified adoptive relatives. The old proposition that adoption has no effect on any adopter's relatives cannot be applied indiscriminately to this current-law example.

## Doctrinal corrections

Representation never operates in the ascending line (Article 972). Consequently, per-stirpes representation cannot give grandparents a deceased parent's reserved share. A surviving legitimate parent takes the whole parental reserve. Where the nearest legitimate ascendants are in both lines at the same degree, divide by line, then equally within each line; this is distinct from representation.

Parents of a nonmarital decedent receive the Article 903 reserve on the stipulated no-spouse/no-descendant facts. Grandparents do not receive that parental legitime by representation. Case 24 has a complete valid will and no surviving compulsory heirs: its grandparents take voluntary gifts. It does not pretend to resolve every intestate claim involving nonmarital grandparents, or extend the downward-representation holding in Aquino to upward representation.

“Artificial relationship” is illustrated by actual legal adoption, not merely acknowledging filiation. Case 25 distinguishes adopters' protected shares from a biological parent's voluntary legacy. Its non-stepparent, unrescinded adoption and the relevant dates are explicit.

Conditions affect only voluntary gifts. All suspensive events are expressly fulfilled by the accounting snapshot. Case 21's resolutory gift remains defeasible, with required security given and no breach. Substitution triggers are actual predecease or separately specified repudiation, not mislabeled conditional events. No future or failed primary gift is counted twice.

## Independent ledger expectations (PHP millions)

| Case | Net | Protected | Voluntary | Final recipients |
|---|---:|---:|---:|---|
| 20 | 24 | 12 | 12 | Alberto 6; Remedios 6; Benigno 6; Leonora 6 |
| 21 | 18 | 9 | 9 | Clara 9; Tomas 6; Luz 3 |
| 22 | 24 | 12 | 12 | Tomas 14 (6+8); Jaime 7 (3+4); Teresa 3 (3+0) |
| 23 | 20 | 10 | 10 | Marco 5; Diana 5; Berto 10 |
| 24 | 16 | 0 | 16 | Oscar 6; Ruben 2; Pia 8 |
| 25 | 20 | 10 | 10 | Victor 5; Lina 5; Jose 10 |

Case 22's reserved paternal half is 6, while each maternal grandparent receives 3. Teresa repudiates only her distinct voluntary legacy and retains her separately accepted legitime. The vacant voluntary 3 passes to Tomas and Jaime in their original 6:3 ratio, giving 2 and 1 respectively. Case 23's one substitute takes both 4 and 6 legacies. Case 24's two substitutes divide the failed 4 legacy into 2 each.

## Data and regression checks

- Explicit zero allocations explain all non-takers; no missing distribution arrays.
- Every generation link joins an actual parent and child; grandparents are connected through the intervening parents. No ascending representation edges.
- Adoptive links and biological origin links are labeled separately in case 25.
- Every condition references an operative disposition; every substitute edge references its gift and substitution type.
- Every guide arithmetic expression is checked against its result; itemized assets and liabilities reconcile to final awards.
- The final computation allocations equal the expected distribution person by person.
- Explicit `protectedAmount` separates a person's reserved amount from any voluntary excess in the chart.
- The server includes all 25 cases and refreshes only the six corrected built-in IDs in durable storage. Other imported IDs are preserved.
- The obsolete ascendant generator was removed; older library generators preserve reviewed revision-5 content.

These are statutory classroom hypotheticals with stipulated facts, not reported judgments or a general-purpose legal solver.
