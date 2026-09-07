import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const output = resolve("public/cases/advanced-succession-mastery-15.jsonl");
const civilCodeUrl = "https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html";

const profiles = [
  { slug: "del-rosario", family: "Del Rosario", testator: "Ramon", spouse: "Lucia", children: ["Adrian", "Bianca", "Cesar"], reps: ["Diana", "Enzo"], outsiders: ["Felisa", "Gabriel", "Helena", "Ismael"], net: 18000000, liabilities: 2000000, lines: 3, title: "Simple Substitution After Predecease", focus: "A simple substitution covers predecease, renunciation, or incapacity when the will does not restrict the causes; it operates only on the disposable allocation and never burdens a legitime.", types: ["simple", "brief", "compendious", "reciprocal"] },
  { slug: "villanueva", family: "Villanueva", testator: "Teresa", spouse: "Manuel", children: ["Nora", "Oscar"], reps: ["Paolo", "Quinn"], outsiders: ["Rosa", "Samuel", "Tala", "Ulysses"], net: 12000000, liabilities: 1500000, lines: 2, title: "Brief Substitution for Two Instituted Heirs", focus: "One substitute is called for two primary beneficiaries, illustrating brief substitution together with a negative potestative suspensive condition.", types: ["brief", "simple", "reciprocal", "fideicommissary"] },
  { slug: "aguilar", family: "Aguilar", testator: "Vicente", spouse: "Wanda", children: ["Xavier", "Yolanda", "Zandro", "Amelia"], reps: ["Bruno", "Carina"], outsiders: ["Diego", "Estela", "Fabian", "Giselle"], net: 24000000, liabilities: 3000000, lines: 4, title: "Compendious Substitution with Mixed Conditions", focus: "Two substitutes are designated for one primary devisee, and the triggering event depends jointly on the beneficiary and an independent third party.", types: ["compendious", "simple", "brief", "reciprocal"] },
  { slug: "bautista", family: "Bautista", testator: "Hector", spouse: "Irene", children: ["Joaquin", "Katrina", "Leandro"], reps: ["Marisol", "Nico"], outsiders: ["Olivia", "Pedro", "Rina", "Sergio"], net: 30000000, liabilities: 4000000, lines: 3, title: "Reciprocal Substitution in Unequal Shares", focus: "Instituted beneficiaries in unequal shares reciprocally substitute for one another; the vacant disposable share is reallocated in the same relative proportions unless a contrary intent appears.", types: ["reciprocal", "simple", "compendious", "brief"] },
  { slug: "castillo", family: "Castillo", testator: "Soledad", spouse: "Tomas", children: ["Una", "Victor"], reps: ["Wilma", "Xandro"], outsiders: ["Yvette", "Zacarias", "Alma", "Benito"], net: 16000000, liabilities: 2000000, lines: 2, title: "Valid One-Degree Fideicommissary Substitution", focus: "The fiduciary and second heir are alive at opening of succession, the duty to preserve and transmit is express, the transfer stays within one degree, and only the disposable portion is burdened.", types: ["fideicommissary", "simple", "brief", "reciprocal"] },
  { slug: "dominguez", family: "Dominguez", testator: "Clara", spouse: "Dante", children: ["Elisa", "Fernando", "Grace", "Hugo"], reps: ["Ines", "Jaime"], outsiders: ["Karen", "Luis", "Marta", "Noel"], net: 32000000, liabilities: 4500000, lines: 4, title: "Fideicommissary Clause Limited to the Free Portion", focus: "A preservation-and-transmission clause cannot burden the compulsory heir's legitime; the exercise severs the protected share and applies the fideicommissary duty only to the disposable excess.", types: ["fideicommissary", "compendious", "simple", "reciprocal"] },
  { slug: "evangelista", family: "Evangelista", testator: "Orlando", spouse: "Pilar", children: ["Rafael", "Selena", "Teodoro"], reps: ["Ursula", "Vito"], outsiders: ["Wena", "Xenia", "Yago", "Zenaida"], net: 36000000, liabilities: 5000000, lines: 3, title: "Representation Distinguished from Substitution", focus: "Grandchildren take their predeceased parent's compulsory line by representation, while named substitutes take a separate vacant testamentary gift by the testator's designation.", types: ["simple", "brief", "compendious", "fideicommissary"] },
  { slug: "fernandez", family: "Fernandez", testator: "Arturo", spouse: "Belinda", children: ["Carlos", "Dolores"], reps: ["Eduardo", "Flora"], outsiders: ["Gordon", "Hazel", "Ivan", "Julia"], net: 20000000, liabilities: 2500000, lines: 2, title: "Preterition, Representation, and Preserved Legacies", focus: "The exercise assumes total omission of a compulsory descendant in the direct line, annuls the institution to the extent required, preserves valid devises and legacies insofar as they are not inofficious, and then restores the represented branch.", types: ["simple", "reciprocal", "brief", "compendious"] },
  { slug: "garcia", family: "Garcia", testator: "Kiko", spouse: "Lorna", children: ["Mateo", "Nadia", "Omar", "Patricia"], reps: ["Renato", "Sofia"], outsiders: ["Tristan", "Valerie", "Walter", "Yasmin"], net: 40000000, liabilities: 6000000, lines: 4, title: "Ineffective Disinheritance and Representative Branch", focus: "A stated disinheritance is treated as ineffective for failure to establish a statutory cause; the omitted line's legitime is restored and divided by representation without disturbing disposable gifts beyond the necessary reduction.", types: ["brief", "simple", "fideicommissary", "reciprocal"] },
  { slug: "hernandez", family: "Hernandez", testator: "Zosimo", spouse: "Andrea", children: ["Benjie", "Celia", "Dario"], reps: ["Erika", "Felix"], outsiders: ["Gemma", "Harold", "Ilona", "Jericho"], net: 24000000, liabilities: 3500000, lines: 3, title: "Substitution Before Accretion", focus: "An express substitute is tested before accretion; only a vacancy left without an effective substitute may pass by accretion, and neither device may invade compulsory shares.", types: ["reciprocal", "simple", "brief", "compendious"] },
  { slug: "ignacio", family: "Ignacio", testator: "Ligaya", spouse: "Mario", children: ["Nena", "Ogie"], reps: ["Pia", "Ramon"], outsiders: ["Sabel", "Tony", "Ursula", "Vera"], net: 28000000, liabilities: 3000000, lines: 2, title: "Prohibited Marriage Condition and Valid Alternative", focus: "An absolute prohibition on marriage is separated from a valid condition limited by law; the prohibited restraint is treated as not written while the substitute remains relevant to a different valid suspensive gift.", types: ["simple", "compendious", "brief", "fideicommissary"] },
  { slug: "jimenez", family: "Jimenez", testator: "Wilfredo", spouse: "Yolanda", children: ["Andres", "Belen", "Crispin"], reps: ["Dahlia", "Ernesto"], outsiders: ["Faye", "Gino", "Hilda", "Isko"], net: 42000000, liabilities: 7000000, lines: 3, title: "Term, Mode, and Conditional Institution", focus: "A term postpones possession, a mode imposes a charge without suspending institution, and a true suspensive condition delays acquisition; each consequence is tracked separately before allocation.", types: ["compendious", "simple", "reciprocal", "fideicommissary"] },
  { slug: "lim", family: "Lim", testator: "Josefina", spouse: "Kardo", children: ["Liza", "Mon", "Nestor", "Ofelia"], reps: ["Paula", "Rico"], outsiders: ["Susan", "Tino", "Ula", "Virgil"], net: 48000000, liabilities: 8000000, lines: 4, title: "Captatory Condition and Severable Dispositions", focus: "A captatory demand that the beneficiary make a reciprocal testamentary provision is treated as void; independent and severable gifts remain subject to legitime and reduction rules.", types: ["brief", "reciprocal", "simple", "compendious"] },
  { slug: "magsaysay", family: "Magsaysay", testator: "Wenceslao", spouse: "Aida", children: ["Berto", "Corazon"], reps: ["Danilo", "Ester"], outsiders: ["Franco", "Gloria", "Hernan", "Imelda"], net: 24000000, liabilities: 4000000, lines: 2, title: "Reduction of Inofficious Devises and Legacies", focus: "The stated gifts exceed the disposable portion; the guide restores the compulsory shares first, charges the valid gifts to the free portion, and proportionally reduces the excess for this exercise.", types: ["reciprocal", "compendious", "simple", "fideicommissary"] },
  { slug: "navarro", family: "Navarro", testator: "Jovito", spouse: "Lourdes", children: ["Miguel", "Natividad", "Orlando"], reps: ["Perla", "Quirino"], outsiders: ["Rosario", "Salvador", "Teresa", "Ulrich"], net: 54000000, liabilities: 9000000, lines: 3, title: "Grand Synthesis of Conditional and Substituted Gifts", focus: "The capstone combines representation, spouse concurrence, four conditional gifts, simple, brief, compendious, reciprocal, and fideicommissary structures, plus a final reconciliation against the net hereditary estate.", types: ["simple", "brief", "compendious", "reciprocal", "fideicommissary"] },
];

const pesos = (value) => `PHP ${value.toLocaleString("en-PH")}`;

function build(profile, index) {
  const id = `advanced-${String(index + 1).padStart(2, "0")}-${profile.slug}`;
  const prefix = profile.slug.replaceAll("-", "_");
  const net = profile.net;
  const gross = net + profile.liabilities;
  const encumbrance = Math.floor(profile.liabilities / 2);
  const generalLiability = profile.liabilities - encumbrance;
  const childCollective = net * 0.5;
  const perLine = childCollective / profile.lines;
  const spouseShare = perLine;
  const free = net - childCollective - spouseShare;
  const freeShares = [free * 0.5, free * 0.3, free * 0.2];
  const representatives = profile.reps.map((name, position) => ({ id: `${prefix}_rep_${position + 1}`, name: `${name} ${profile.family}`, role: `Grandchild representing ${profile.children[0]}`, status: "living", generation: 2 }));
  const children = profile.children.slice(0, profile.lines).map((name, position) => ({ id: `${prefix}_child_${position + 1}`, name: `${name} ${profile.family}`, role: position === 0 ? "Predeceased legitimate child" : "Legitimate child and compulsory heir", status: position === 0 ? "predeceased" : "living", generation: 1 }));
  const outsiders = profile.outsiders.map((name, position) => ({ id: `${prefix}_outside_${position + 1}`, name: `${name} ${profile.family}`, role: ["Conditional devisee", "Conditional legatee", "Fiduciary first heir", "Second heir and substitute"][position], status: "living", generation: 1 }));
  const testatorId = `${prefix}_testator`;
  const spouseId = `${prefix}_spouse`;
  const conditionTexts = [
    `${outsiders[0].name} receives the mortgaged commercial property if, within two years after learning of the death, the devisee completes the stated professional training; otherwise the named substitute is called.`,
    `${outsiders[1].name} receives the cash legacy provided the legatee does not assign, pledge, or renounce it during the first year; the stated substitute or substitutes take upon failure.`,
    `${outsiders[2].name} receives the investment block immediately, but the disposable gift terminates if the beneficiary sells it within ten years with the written cooperation of the independent trustee.`,
    `${outsiders[2].name}, as fiduciary first heir, must preserve the disposable residue and transmit it to ${outsiders[3].name} upon the stated event, subject to the one-degree and legitime limits.`,
    `${outsiders[0].name} takes only if a government permit is issued and the beneficiary establishes the required foundation, combining an external event and personal action.`,
  ];
  const conditionClasses = [
    ["positive", "potestative", "suspensive"],
    ["negative", "potestative", "suspensive"],
    ["positive", "mixed", "resolutory"],
    ["negative", "casual", "resolutory"],
    ["positive", "mixed", "suspensive"],
  ];
  const conditions = profile.types.map((type, position) => ({
    id: `${prefix}_condition_${position + 1}`,
    text: conditionTexts[position],
    classification: conditionClasses[position],
    substitutionType: type,
    substitutionNote: `${type[0].toUpperCase()}${type.slice(1)} substitution exercise. ${profile.focus}`,
  }));
  const commercialNet = freeShares[0];
  const securitiesNet = freeShares[2];
  const residueGross = gross - (commercialNet + encumbrance) - freeShares[1] - securitiesNet;
  const properties = [
    { id: `${prefix}_commercial`, name: `${profile.family} commercial property`, propertyType: "real_property", ownershipClassification: "exclusive", grossValue: commercialNet + encumbrance, encumbrances: [{ id: `${prefix}_mortgage`, label: "Secured mortgage allocated to the property", amount: encumbrance }], valuationDate: "2025-12-31", description: `The net devise value is ${pesos(commercialNet)} after its mortgage.` },
    { id: `${prefix}_deposit`, name: `${profile.family} estate deposit`, propertyType: "cash", ownershipClassification: "exclusive", grossValue: freeShares[1], encumbrances: [], valuationDate: "2025-12-31", description: "Liquid funds earmarked for the conditional monetary legacy." },
    { id: `${prefix}_shares`, name: `${profile.family} Holdings voting shares`, propertyType: "securities", ownershipClassification: "exclusive", grossValue: securitiesNet, encumbrances: [], valuationDate: "2025-12-31", description: "A disposable investment block used for the resolutory and fiduciary exercises." },
    { id: `${prefix}_residue`, name: `${profile.family} residuary estate pool`, propertyType: "business_interest", ownershipClassification: index % 3 === 0 ? "conjugal" : "exclusive", grossValue: residueGross, encumbrances: [], valuationDate: "2025-12-31", description: "The remaining inventoried property from which compulsory shares and the estate's general liability are settled." },
  ];
  const relationships = [
    { from: testatorId, to: spouseId, type: "spouse" },
    ...children.map((child) => ({ from: testatorId, to: child.id, type: "parent" })),
    ...representatives.flatMap((representative) => [
      { from: children[0].id, to: representative.id, type: "parent" },
      { from: children[0].id, to: representative.id, type: "representation" },
    ]),
    { from: outsiders[0].id, to: outsiders[3].id, type: "substitution" },
    { from: outsiders[1].id, to: outsiders[3].id, type: "substitution" },
    { from: outsiders[2].id, to: outsiders[3].id, type: "substitution" },
  ];
  const dispositions = [
    { id: `${prefix}_devise`, kind: "devise", beneficiaryId: outsiders[0].id, source: "specific_property", propertyId: properties[0].id, conditionId: conditions[0].id, substitutionIds: profile.types[0] === "compendious" ? [outsiders[2].id, outsiders[3].id] : [outsiders[3].id], description: `A net devise of ${pesos(freeShares[0])}, charged exclusively to the disposable portion and subject to the stated condition and substitution.` },
    { id: `${prefix}_legacy`, kind: "legacy", beneficiaryId: outsiders[1].id, source: "general_estate", amount: freeShares[1], conditionId: conditions[1].id, substitutionIds: profile.types[1] === "brief" ? [outsiders[3].id] : [outsiders[0].id, outsiders[3].id], description: `A conditional legacy of ${pesos(freeShares[1])}; failure activates the named substitute structure before any accretion analysis.` },
    { id: `${prefix}_investment`, kind: "devise", beneficiaryId: outsiders[2].id, source: "specific_property", propertyId: properties[2].id, conditionId: conditions[2].id, substitutionIds: [outsiders[3].id], description: `A ${pesos(freeShares[2])} investment devise with a resolutory condition; the protected legitimes remain outside the burden.` },
    { id: `${prefix}_institution`, kind: "institution", beneficiaryId: children[1].id, source: "general_estate", amount: perLine, conditionId: conditions[3].id, substitutionIds: [outsiders[3].id], description: "The institution confirms the compulsory heir's line share; any prohibited condition or substitution is disregarded insofar as it burdens that legitime." },
  ];
  const expectedDistribution = [
    { personId: spouseId, amount: spouseShare, mechanisms: ["legitime"], rationale: `The surviving spouse receives a legitime equal to one legitimate-child line: ${pesos(spouseShare)}.` },
    ...children.slice(1).map((child) => ({ personId: child.id, amount: perLine, mechanisms: ["legitime"], rationale: `This living legitimate-child line receives ${pesos(perLine)}.` })),
    ...representatives.map((representative) => ({ personId: representative.id, amount: perLine / representatives.length, mechanisms: ["legitime", "representation"], rationale: `The ${pesos(perLine)} share of the predeceased line is divided equally between ${representatives.length} representatives.` })),
    { personId: outsiders[0].id, amount: freeShares[0], mechanisms: ["free_portion", "devise", "substitution"], propertyIds: [properties[0].id], rationale: "The largest disposable allocation funds the conditional devise, or its substitute if the stated trigger occurs." },
    { personId: outsiders[1].id, amount: freeShares[1], mechanisms: ["free_portion", "legacy", "substitution"], rationale: "The monetary legacy is charged only to the remaining free portion." },
    { personId: outsiders[2].id, amount: freeShares[2], mechanisms: ["free_portion", "devise", "substitution"], propertyIds: [properties[2].id], rationale: "The investment devise is the final disposable allocation and carries the resolutory or fiduciary burden described in the will." },
  ];
  const guide = [
    { title: "Inventory the gross estate", explanation: "Add every listed property at its stated gross value before deductions.", expression: properties.map((property) => property.grossValue).join(" + "), result: gross },
    { title: "Deduct enforceable obligations", explanation: `Subtract the property mortgage of ${pesos(encumbrance)} and general estate charges of ${pesos(generalLiability)}.`, expression: `${gross} - ${profile.liabilities}`, result: net },
    { title: "Identify compulsory lines", explanation: `Count ${profile.lines} legitimate-child lines. The predeceased first line remains one stirps because its descendants represent it; the surviving spouse concurs.`, expression: `${net} × 0.5`, result: childCollective },
    { title: "Compute each legitimate-child line", explanation: "Divide the children's collective legitime equally per line, not per individual grandchild.", expression: `${childCollective} ÷ ${profile.lines}`, result: perLine },
    { title: "Compute the surviving spouse's legitime", explanation: "With two or more legitimate-child lines, the spouse receives the same amount as one line, taken from the disposable half.", expression: `${childCollective} ÷ ${profile.lines}`, result: spouseShare },
    { title: "Apply representation per stirpes", explanation: `Reserve the predeceased child's ${pesos(perLine)} line share, then divide it equally among the two qualified representatives.`, expression: `${perLine} ÷ ${representatives.length}`, result: perLine / representatives.length },
    { title: "Determine the usable free portion", explanation: "Start from the net estate and deduct the children's collective legitime and the spouse's concurrent legitime.", expression: `${net} - ${childCollective} - ${spouseShare}`, result: free },
    { title: "Test conditions and substitutions", explanation: profile.focus, expression: `${free} × 0.50`, result: freeShares[0] },
    { title: "Fund the remaining disposable gifts", explanation: "Allocate thirty percent of the usable free portion to the conditional legacy and twenty percent to the investment devise; substitute takers change identity, not the ceiling of the free portion.", expression: `${freeShares[0]} + ${freeShares[1]} + ${freeShares[2]}`, result: free },
    { title: "Reconcile the final distribution", explanation: "Add the spouse, every legitimate-child line (including the represented branch), and all disposable gifts. The total must equal the net hereditary estate.", expression: expectedDistribution.map((item) => item.amount).join(" + "), result: net },
  ];

  return {
    schemaVersion: 1,
    id,
    title: `${String(index + 1).padStart(2, "0")} — ${profile.family} Estate: ${profile.title}`,
    difficulty: index < 5 ? 4 : 5,
    scenarioType: "fictional",
    currency: "PHP",
    story: {
      narrative: `${profile.testator} ${profile.family} died testate, survived by spouse ${profile.spouse}, ${profile.lines - 1} living legitimate-child line${profile.lines - 1 === 1 ? "" : "s"}, and the two descendants of a predeceased legitimate child. The will protects the compulsory shares, makes three substantial dispositions from the free portion, and layers conditional institutions with named substitutes. ${profile.focus}`,
      deathDate: `2025-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 20) + 5).padStart(2, "0")}`,
      deathPlace: ["Quezon City", "Makati City", "Cebu City", "Davao City", "Iloilo City"][index % 5] + ", Philippines",
      willDate: `2024-${String(((index + 4) % 12) + 1).padStart(2, "0")}-15`,
      circumstances: `All filiation, marriage, capacity, ownership, and will-formality facts are stipulated for this advanced classroom exercise. Gross assets are ${pesos(gross)} and enforceable obligations are ${pesos(profile.liabilities)}. The legal focus is: ${profile.focus}`,
      keyFacts: [
        `The declared and itemized net hereditary estate is ${pesos(net)}.`,
        `${children[0].name} predeceased the testator and is represented by ${representatives.map((person) => person.name).join(" and ")}.`,
        `The surviving spouse and ${profile.lines} legitimate-child lines are compulsory heirs for the assumptions of this exercise.`,
        `The free portion after the spouse's legitime is ${pesos(free)} and is the only pool burdened by the conditional gifts.`,
        profile.focus,
      ],
    },
    estate: { assets: gross, liabilities: profile.liabilities, properties, generalLiabilities: [{ id: `${prefix}_charges`, label: "Taxes, administration expenses, and unsecured obligations", amount: generalLiability }] },
    persons: [
      { id: testatorId, name: `${profile.testator} ${profile.family}`, role: "Testator and decedent", status: "deceased", generation: 0 },
      { id: spouseId, name: `${profile.spouse} ${profile.family}`, role: "Surviving spouse and compulsory heir", status: "living", generation: 0 },
      ...children,
      ...representatives,
      ...outsiders,
    ],
    relationships,
    dispositions,
    conditions,
    computations: [
      { module: "legitimate_child_legitime", legitimateChildLines: profile.lines },
      { module: "spouse_concurrence", legitimateChildLines: profile.lines },
      { module: "representation", branchShare: perLine, representativeIds: representatives.map((person) => person.id) },
      { module: "reciprocal_substitution", vacantShare: freeShares[0], substitutes: [{ personId: outsiders[1].id, weight: 3 }, { personId: outsiders[3].id, weight: 2 }] },
    ],
    expectedDistribution,
    computationGuide: guide,
    explanation: `Advanced fictional classroom problem based on the Civil Code of the Philippines. ${profile.focus} The numerical answer assumes every compulsory-heir status and valuation stated in the record, ignores unstated donations or debts, and treats substitute allocations as alternative takers of the same disposable gifts rather than additions to the estate. Consult the ten-step computation guide for the full derivation. This is not legal advice.`,
    source: { type: "statute-based fictional exercise", title: "Civil Code of the Philippines, especially Articles 854, 857-875, 886-907, and 970-977", treatment: "case-inspired", url: civilCodeUrl },
  };
}

const cases = profiles.map(build);
writeFileSync(output, `${cases.map((item) => JSON.stringify(item)).join("\n")}\n`);
console.log(`Wrote ${cases.length} advanced scenarios to ${output}`);
