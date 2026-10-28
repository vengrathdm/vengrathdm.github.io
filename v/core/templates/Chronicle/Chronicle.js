export function renderChronicle(
  container,
  sessions,
  { accent = "#bca06a" } = {},
) {
  container.classList.add("chronicle");
  container.replaceChildren();
  const records = Array.isArray(sessions) ? sessions : [];
  records.forEach((session) =>
    container.append(createChronicleRecord(session, { accent })),
  );
  return container;
}
