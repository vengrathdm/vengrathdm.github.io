const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const drawer = $("#drawer");
$("#menuButton").addEventListener("click", () => {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
});
$("#closeButton").addEventListener("click", closeDrawer);
$$(".drawer a").forEach(a => a.addEventListener("click", closeDrawer));
function closeDrawer(){
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}

$$("[data-scroll]").forEach(btn => {
  btn.addEventListener("click", () => document.querySelector(btn.dataset.scroll)?.scrollIntoView({behavior:"smooth"}));
});

const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalTag = $("#modalTag");
const modalSubtitle = $("#modalSubtitle");
const modalBody = $("#modalBody");

const files = {
  Field_Name: {
    tag:"RESTRICTED FILE · DARK LORD",
    title:"Field_Name Lysander Ignatius Field_Name",
    subtitle:"The Eternal Gentleman · Pride",
    body:`<p>Field_Name is Field_Name's public face of perfection: aristocrat, archmage and chairman of the Council of Princes.</p>
    <p>His private obsession is the transfer of age. He requires beautiful victims and uses the psychiatric asylum as a source of people whose disappearance can be quietly explained.</p>
    <p>He prefers to threaten with a smile. His greatest fear is not death, but the public collapse of the image he has constructed.</p>`
  },
  Field_Name: {
    tag:"FILE 02-A · SENATORIUM",
    title:"Field_Name Field_Name",
    subtitle:"Medical district · Sloth",
    body:`<p>The Senatorium is where Field_Name's respectable institutions acquire their most convenient silences. Field_Name's influence is felt through the systems of care, confinement and neglect.</p><p>Further details remain sealed in the Field_Name archive.</p>`
  },
  Field_Name: {
    tag:"FILE 02-B · WISIELCZE WZGÓRZE",
    title:"Field_Name Field_Name",
    subtitle:"Military-j judicial district · Wrath",
    body:`<p>Order is not merely an ideal here; it is architecture. Courts, checkpoints and armed authority make the district one of the city's most controlled environments.</p><p>Further details remain sealed in the Field_Name archive.</p>`
  },
  Field_Name: {
    tag:"FILE 02-C · ZABRANIEC",
    title:"Field_Name Field_Name",
    subtitle:"Financial-industrial district · Greed",
    body:`<p>Debt is a second geography in Zabraniec. Those who owe are permitted to travel only as far as the collectors allow.</p><p>Further details remain sealed in the Field_Name archive.</p>`
  }
};

function openModal(key){
  const f = files[key];
  if(!f) return;
  modalTag.textContent = f.tag;
  modalTitle.textContent = f.title;
  modalSubtitle.textContent = f.subtitle;
  modalBody.innerHTML = f.body;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
}
$$("[data-modal]").forEach(el => el.addEventListener("click", () => openModal(el.dataset.modal)));
$$(".modal-close, .modal-backdrop").forEach(el => el.addEventListener("click", closeModal));
function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
}
document.addEventListener("keydown", e => {
  if(e.key === "Escape"){ closeModal(); closeDrawer(); }
});

const locations = {
  asylum:["Field_Name PSYCHIATRIC ASYLUM","A respectable institution with an inconvenient relationship to disappearance.","The place where the Field_Name begins."],
  pharmacy:["BLACK POPPY PHARMACY","A shop of remedies, ingredients and things that should not be prescribed.","Look beneath the counter."],
  opera:["DORIAN'S OPERA","Culture, spectacle and aristocratic appetite beneath gas and electric light.","A perfect place for someone who needs an audience."],
  palace:["THE PALACE","The public seat of Field_Name Field_Name and the entrance to the Workshops Below.","Nothing beneath it is merely architectural."],
  cathedral:["ST. BASIL'S CATHEDRAL","The spiritual heart of the Church of the Bright.","Its archives may contain more truth than its sermons."]
};
const locationFile = $("#locationFile");
function selectLocation(key){
  const [title, desc, note] = locations[key];
  locationFile.innerHTML = `<span class="tag">LOCATION FILE</span><h3>${title}</h3><p>${desc}</p><p class="eyebrow">${note}</p>`;
  $$(".pin").forEach(p => p.classList.toggle("active", p.dataset.location === key));
  $$(".location-list button").forEach(p => p.classList.toggle("active", p.dataset.location === key));
}
$$("[data-location]").forEach(el => el.addEventListener("click", () => selectLocation(el.dataset.location)));

const hero = $(".hero-art");
window.addEventListener("mousemove", e => {
  const x = (e.clientX / innerWidth - .5) * 10;
  const y = (e.clientY / innerHeight - .5) * 6;
  hero.style.transform = `perspective(900px) rotateY(${x*.08}deg) rotateX(${-y*.05}deg)`;
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.animate(
        [{opacity:0, transform:"translateY(24px)"},{opacity:1, transform:"translateY(0)"}],
        {duration:900, easing:"cubic-bezier(.2,.8,.2,1)", fill:"forwards"}
      );
      observer.unobserve(entry.target);
    }
  });
},{threshold:.12});
$$(".district-card,.faith-card,.evidence-card,.Field_Name-timeline article,.section-heading").forEach(el => observer.observe(el));