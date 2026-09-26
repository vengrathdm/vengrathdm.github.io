/* ============================================================
   KSIĄŻĘTA HEARTWELL — CAMPAIGN INTERACTIONS
   ------------------------------------------------------------
   Keep content in index.html. This file is only for behavior.
   ============================================================ */

/* ============================================================
   TAB NAVIGATION
   ============================================================ */
function goToPage(name){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name)?.classList.add('active');
  document.querySelector('.tab-btn[data-page="' + name + '"]')?.classList.add('active');
  window.scrollTo({top:0, behavior:'instant'});
}
document.getElementById('tabList').addEventListener('click', (e) => {
  const btn = e.target.closest('.tab-btn');
  if(!btn) return;
  goToPage(btn.dataset.page);
});

/* ============================================================
   CASE LOG ACCORDION
   ============================================================ */
