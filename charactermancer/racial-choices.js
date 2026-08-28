/*
===========================================================
 RACIAL CHOICES
===========================================================

Keeps race-specific selectable proficiencies and ability
bonuses outside the main renderer/rules files.

2014 rules implemented here:
- Half-Elf: choose 2 skills; choose two abilities for +1 each,
  in addition to the fixed CHA +2.
- Variant Human: choose 1 skill; choose two abilities for +1
  each instead of the standard Human +1 to every ability.
===========================================================
*/

const RACIAL_CHOICE_RULES = {
  "Half-Elf": {
    skillCount: 2,
    abilityCount: 2,
    abilityBonus: 1,
    abilityMode: "add"
  },
  "Human::Variant Human": {
    skillCount: 1,
    abilityCount: 2,
    abilityBonus: 1,
    abilityMode: "replaceFixed"
  }
};

function racialChoiceRule() {
  if (S.race === "Human" && S.subrace === "Variant Human") {
    return RACIAL_CHOICE_RULES["Human::Variant Human"];
  }

  if (S.race === "Half-Elf" && S.racialMode === "2014") {
    return RACIAL_CHOICE_RULES["Half-Elf"];
  }

  return null;
}

function ensureRacialChoiceState() {
  if (!Array.isArray(S.racialSkills)) S.racialSkills = [];
  if (!S.racialAbilityChoices || typeof S.racialAbilityChoices !== "object") {
    S.racialAbilityChoices = {};
  }

  const rule = racialChoiceRule();
  const abilityCount = rule?.abilityCount || 0;
  const selectedAbilities = Object.keys(S.racialAbilityChoices)
    .filter(ability => DATA.abilities.includes(ability))
    .slice(0, abilityCount);

  S.racialAbilityChoices = Object.fromEntries(
    selectedAbilities.map(ability => [ability, rule.abilityBonus])
  );

  if (!rule) {
    S.racialSkills = [];
    S.racialAbilityChoices = {};
  } else if (S.racialSkills.length > rule.skillCount) {
    S.racialSkills = S.racialSkills.slice(0, rule.skillCount);
  }
}

function renderRacialSkillChoices(rule) {
  if (!rule?.skillCount) return "";

  return `
    <label class="field-label">
      Skill Proficiencies — choose exactly ${rule.skillCount}
    </label>
    <div class="specimen-rack">
      ${DATA.skills
        .map(skill => choice(
          "racialSkill",
          skill,
          skill,
          S.racialSkills.includes(skill)
        ))
        .join("")}
    </div>
    <p class="panel-sub">
      ${S.race === "Half-Elf"
        ? "Half-Elf: choose any two skill proficiencies."
        : "Variant Human: choose one skill proficiency."}
    </p>
  `;
}

function renderRacialAbilityChoices(rule) {
  if (!rule?.abilityCount) return "";

  const selected = new Set(Object.keys(S.racialAbilityChoices));

  return `
    <label class="field-label">
      Ability Score Increase — choose ${rule.abilityCount} abilities (+${rule.abilityBonus} each)
    </label>
    <div class="specimen-rack">
      ${DATA.abilities
        .map(ability => choice(
          "racialAbility",
          ability,
          ability,
          selected.has(ability)
        ))
        .join("")}
    </div>
    <p class="panel-sub">
      ${rule.abilityMode === "add"
        ? "These bonuses are added to the fixed racial modifiers."
        : "These bonuses replace the standard Human +1 to every ability."}
    </p>
  `;
}

const baseRenderRace = window.renderRace;

window.renderRace = function () {
  ensureRacialChoiceState();

  let html = baseRenderRace();
  const rule = racialChoiceRule();

  if (!rule) return html;

  const abilityText = rule.abilityMode === "add"
    ? ["CHA +2", ...Object.keys(S.racialAbilityChoices).map(ability => `${ability} +1`)].join("</i><i>")
    : Object.keys(S.racialAbilityChoices)
        .map(ability => `${ability} +1`)
        .join("</i><i>");

  html = html.replace(
    /(<b>Ability Modifiers<\/b><p class="tags">).*?(<\/p>)/,
    `$1<i>${abilityText || "None"}</i>$2`
  );

  html = html.replace(
    /<b>Innate Proficiencies<\/b><p>.*?<\/p>/,
    `${renderRacialSkillChoices(rule)}${renderRacialAbilityChoices(rule)}`
  );

  return html;
};

const baseRacialBonuses = R.bonus;

R.bonus = function () {
  ensureRacialChoiceState();

  const rule = racialChoiceRule();

  if (!rule) return baseRacialBonuses.call(R);

  const bonuses = {};
  const race = R.race();
  const subrace = (race?.subs || {})[S.subrace] || {};

  if (rule.abilityMode !== "replaceFixed") {
    Object.entries(race?.fixed || {}).forEach(([ability, value]) => {
      bonuses[ability] = (bonuses[ability] || 0) + Number(value || 0);
    });
  }

  Object.entries(subrace).forEach(([ability, value]) => {
    bonuses[ability] = (bonuses[ability] || 0) + Number(value || 0);
  });

  Object.entries(S.racialAbilityChoices).forEach(([ability, value]) => {
    bonuses[ability] = (bonuses[ability] || 0) + Number(value || 0);
  });

  return bonuses;
};

R.scores = function () {
  const scores = {};
  const bonuses = R.bonus();

  for (const ability of DATA.abilities) {
    scores[ability] = Number(S.assign?.[ability] || 0) + Number(bonuses[ability] || 0);
  }

  return scores;
};

const baseProficientSkills = R.proficientSkills;

R.proficientSkills = function () {
  ensureRacialChoiceState();

  const skills = baseProficientSkills.call(R);
  const rule = racialChoiceRule();

  if (!rule) return skills;

  return [...new Set([
    ...skills.filter(skill => skill !== "2 CHOICE"),
    ...S.racialSkills
  ])];
};

const baseValidation = R.validation;

R.validation = function () {
  ensureRacialChoiceState();

  const checks = baseValidation.call(R);
  const rule = racialChoiceRule();

  if (!rule) return checks;

  checks.push({
    key: "racialSkills",
    label: `${S.race === "Half-Elf" ? "Half-Elf" : "Variant Human"} skill proficiencies`,
    ok: S.racialSkills.length === rule.skillCount
  });

  checks.push({
    key: "racialAbilityChoices",
    label: `${S.race === "Half-Elf" ? "Half-Elf" : "Variant Human"} ability bonuses`,
    ok: Object.keys(S.racialAbilityChoices).length === rule.abilityCount
  });

  return checks;
};

R.isComplete = function () {
  return R.validation().every(item => item.ok);
};

document.addEventListener("click", event => {
  const control = event.target.closest('[data-type="racialSkill"],[data-type="racialAbility"]');
  if (!control || !racialChoiceRule()) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  const rule = racialChoiceRule();
  const value = control.dataset.value;

  if (control.dataset.type === "racialSkill") {
    const index = S.racialSkills.indexOf(value);

    if (index >= 0) {
      S.racialSkills.splice(index, 1);
    } else if (S.racialSkills.length < rule.skillCount) {
      S.racialSkills.push(value);
    }
  } else {
    const selected = S.racialAbilityChoices;

    if (selected[value]) {
      delete selected[value];
    } else if (Object.keys(selected).length < rule.abilityCount) {
      selected[value] = rule.abilityBonus;
    }
  }

  render();
}, true);
