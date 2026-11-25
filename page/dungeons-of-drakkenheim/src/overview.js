export function renderOverview(DATA, el){
 var O=document.querySelector('#ov');O.innerHTML='';
 DATA.overview.forEach(function(o){
  var c=el('article','note status-note '+(o.kind||''));
  if(o.title)c.append(el('h3','',o.title));
  if(o.kind==='situation'){
   c.append(el('p','status-meta',o.meta),el('span','status-stamp',o.stamp));
  }else if(o.kind==='metric'){
   if(o.value)c.append(el('strong','status-value',o.value));
   c.append(el('p','status-detail',o.detail));
  }else if(o.kind==='threats'){
   var list=el('ul','status-threats');
   o.items.forEach(function(item){var li=el('li','status-threat');li.append(el('span','status-threat-name',item.text),el('span','status-tag '+item.level,item.status));list.append(li)});
   c.append(list);
  }else if(o.kind==='clue'){
   c.append(el('blockquote','status-quote',o.quote),el('p','status-detail',o.text));
  }else if(o.items){
   var u=el('ul');o.items.forEach(function(x){u.append(el('li','',x))});c.append(u);
  }else c.append(el('p','',o.text||''));
  O.append(c);
 });
}
