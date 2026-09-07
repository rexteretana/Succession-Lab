export function resolvePersonReferences(
  label: string,
  persons: Array<{ id: string; name: string }>,
) {
  const namesById = new Map(persons.map((person) => [person.id, person.name]));

  // Calculation engines place person IDs in labels as complete tokens (for
  // example, "Allocation to v"). Never replace raw substrings: short IDs such
  // as "a" or "t" otherwise corrupt ordinary words such as "Share".
  return label.replace(/[A-Za-z0-9_-]+/g, (token) => namesById.get(token) ?? token);
}
