export function renderChronicleSection(chronicle) {
  document.querySelector("#chronicle-kicker").textContent = chronicle.kicker;
  document.querySelector("#chronicle-title").textContent = chronicle.title;
  document.querySelector("#chronicle-description").textContent =
    chronicle.description;

  const container = document.querySelector("#campaign-chronicle");
  container.replaceChildren(
    ...chronicle.sessions.map((session) => {
      const entry = document.createElement("article");
      entry.className = "kct-archive-entry";

      const header = document.createElement("div");
      header.className = "kct-archive-entry__header";

      const number = document.createElement("span");
      number.className = "kct-archive-entry__number";
      number.textContent = String(session.number ?? session.sessionNumber ?? "—")
        .replace(/^S0*/i, "")
        .padStart(2, "0");

      const title = document.createElement("h3");
      title.className = "kct-archive-entry__title";
      title.textContent = session.title || "Bez tytułu";

      const date = document.createElement("time");
      date.className = "kct-archive-entry__date";
      date.hidden = !session.date;
      if (session.date) {
        date.dateTime = session.date;
        date.textContent = session.date;
      }

      const links = document.createElement("div");
      links.className = "kct-archive-entry__links";
      const recordings = Array.isArray(session.recordings)
        ? session.recordings
        : [];
      links.hidden = recordings.length === 0;
      recordings.forEach((recording) => {
        const link = document.createElement("a");
        link.className = "kct-recording-link";
        link.href = recording.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = recording.label || "Odtwórz";
        links.append(link);
      });

      header.append(number, title, date, links);

      const description = document.createElement("p");
      description.className = "kct-archive-entry__description";
      description.textContent = session.description || "";

      entry.append(header, description);
      return entry;
    }),
  );
}
