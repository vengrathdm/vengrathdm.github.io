// Accessible single-panel navigation: only the selected section remains visible.
document.documentElement.classList.add("muppet-show-ready");
const tabs=[...document.querySelectorAll(".nav-tab")];
const panels=[...document.querySelectorAll(".show-panel")];
function activatePanel(id,focus=false){
 const selected=panels.find(panel=>panel.id===id);if(!selected)return;
 panels.forEach(panel=>{const active=panel===selected;panel.hidden=!active;panel.classList.toggle("is-active",active)});
 tabs.forEach(tab=>{const active=tab.dataset.panel===id;tab.classList.toggle("is-active",active);tab.setAttribute("aria-selected",String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus()});
 window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
}
tabs.forEach((tab)=>{tab.addEventListener("click",()=>activatePanel(tab.dataset.panel));tab.addEventListener("keydown",event=>{const i=tabs.indexOf(tab);let n=i;if(event.key==="ArrowRight")n=(i+1)%tabs.length;else if(event.key==="ArrowLeft")n=(i-1+tabs.length)%tabs.length;else if(event.key==="Home")n=0;else if(event.key==="End")n=tabs.length-1;else return;event.preventDefault();activatePanel(tabs[n].dataset.panel,true)})});
document.querySelectorAll("[data-go]").forEach(button=>button.addEventListener("click",()=>activatePanel(button.dataset.go)));
activatePanel("panel-premiere");
