/* Half-Elf racial skill choice.
   The existing state already stores racialSkills and the character export
   already includes racialSkillChoices, so this module only wires the UI
   and derived proficiency rules for Half-Elf.
*/

const HALF_ELF_SKILL_MARKER = "2 CHOICE";
const HALF_ELF_SKILL_LIMIT = 2;

function isHalfElfSkillChoice() {
  return S.race === "Half-Elf" && (R.race()?.skills || []).includes(HALF_ELF_SKILL_MARKER);
}

function renderRace() {
  const race = R.race();
  const raceChoices = Object.keys(DATA.races)
    .map(r => choice("race", r, r, S.race === r))
    .join("");

  if (!race) {
    return `
      <section>
        <div class="panel-head">
          <h2>Lineage</h2>
          <p class="panel-sub">Choose your character’s race.</p>
        </div>
        <div class="specimen-rack">${raceChoices}</div>
      </section>
    `;
  }

  const subraceChoices = Object.keys(race.subs || {})
    .map(sr => choice("subrace", sr, sr, S.subrace === sr))
    .join("");
  const fixedBonuses = Object.entries(race.fixed || {})
    .map(([ability, bonus]) => `<i>${ability} +${bonus}</i>`)
    .join("");
  const subraceBonuses = Object.entries((race.subs || {})[S.subrace] || {})
    .map(([ability, bonus]) => `<i>${ability} +${bonus}</i>`)
    .join("");
  const fixedLanguages = race.languages || [];
  const languageChoices = race.languageChoices || 0;
  const modes = [["2014", "Racial"], ["tasha2+1", "Tasha +2 / +1"], ["tasha1+1+1", "Tasha +1 / +1 / +1"]]
    .map(([mode, label]) => choice(
      "racialMode",
      mode,
      label,
      (mode === "2014" && S.racialMode === "2014") ||
      (mode.startsWith("tasha") &&
        S.racialMode === "tasha" &&
        S.tashaMode === (mode === "tasha2+1" ? "2+1" : "1+1+1"))
    ))
    .join("");

  const racialSkills = isHalfElfSkillChoice()
    ? `
      <label class="field-label">Skill Proficiencies — choose exactly 2</label>
      <div class="specimen-rack">
        ${DATA.skills
          .map(skill => choice("racialSkill", skill, skill, (S.racialSkills || []).includes(skill)))
          .join("")}
      </div>
      <p class="panel-sub">Half-Elf: choose any two skill proficiencies.</p>
    `
    : `
      <b>Innate Proficiencies</b>
      <p>${(race.skills || []).filter(skill => skill !== HALF_ELF_SKILL_MARKER).join(", ") || "None"}</p>
    `;

  return `
    <section>
      <div class="panel-head">
        <h2>Lineage</h2>
        <p class="panel-sub">Choose your character’s race and variant.</p>
      </div>
      <div class="specimen-rack">${raceChoices}</div>

      <div class="panel-head">
        <h2>Variant</h2>
      </div>
      <div class="specimen-rack">${subraceChoices}</div>

      <div class="porthole">
        <b>Ability Modifiers</b>
        <p class="tags">
          ${S.racialMode === "2014" ? (fixedBonuses + subraceBonuses || "None") : "Replaced by Tasha's allocation"}
        </p>

        <b>Languages</b>
        <p>${fixedLanguages.length ? fixedLanguages.map(escapeHtml).join(", ") : "None"}</p>

        ${languageChoices ? `
          <label class="field-label">Additional standard language — choose ${languageChoices}</label>
          <div class="specimen-rack">
            ${renderLanguageChoice("racialLanguage", S.racialLanguages || [], languageChoices, fixedLanguages)}
          </div>
        ` : ""}

        ${racialSkills}

        <div class="toggle-row">${modes}</div>
        ${S.racialMode === "tasha" ? renderTashaBonuses() : ""}
      </div>
    </section>
  `;
}

const previousRaceSkills = R.proficientSkills;
R.proficientSkills = function () {
  const skills = previousRaceSkills.call(R).filter(skill => skill !== HALF_ELF_SKILL_MARKER);

  if (isHalfElfSkillChoice()) {
    skills.push(...(S.racialSkills || []));
  }

  return [...new Set(skills)];
};

const previousValidation = R.validation;
R.validation = function () {
  const checks = previousValidation.call(R);

  if (isHalfElfSkillChoice()) {
    checks.push({
      key: "racialSkills",
      label: "Half-Elf skill proficiencies",
      ok: (S.racialSkills || []).length === HALF_ELF_SKILL_LIMIT
    });
  }

  return checks;
};

R.isComplete = function () {
  return R.validation().every(item => item.ok);
};

document.addEventListener("click", event => {
  const control = event.target.closest('[data-type="racialSkill"]');
  if (!control || !isHalfElfSkillChoice()) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  const value = control.dataset.value;
  const skills = S.racialSkills || (S.racialSkills = []);
  const index = skills.indexOf(value);

  if (index >= 0) skills.splice(index, 1);
  else if (skills.length < HALF_ELF_SKILL_LIMIT) skills.push(value);

  render();
}, true);
