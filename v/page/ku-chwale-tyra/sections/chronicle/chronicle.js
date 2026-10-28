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
      const number = document.createElement("span");
      number.className = "kct-archive-entry__number";
      number.textContent = session.number;

      const copy = document.createElement("div");
      copy.className = "kct-archive-entry__copy";
      const title = document.createElement("h3");
      title.textContent = session.title;
      const description = document.createElement("p");
      description.textContent = session.description;
      copy.append(title, description);

      const links = document.createElement("div");
      links.className = "kct-archive-entry__links";
      session.recordings.forEach((recording) => {
        const link = document.createElement("a");
        link.className = "kct-recording-link";
        link.href = recording.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = recording.label;
        links.append(link);
      });
      entry.append(number, copy, links);
      return entry;
    }),
  );
}
