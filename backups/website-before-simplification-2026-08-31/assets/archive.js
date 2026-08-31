(function(){
  "use strict";
  var input=document.getElementById("archive-search");
  var items=Array.from(document.querySelectorAll("[data-archive-item]"));
  var noResults=document.getElementById("archive-no-results");
  var pagination=document.getElementById("archive-pagination");
  var previous=document.getElementById("archive-previous");
  var next=document.getElementById("archive-next");
  var status=document.getElementById("archive-page-status");
  var perPage=8;
  var page=1;
  if(!input)return;

  function render(){
    var query=input.value.trim().toLowerCase();
    var matches=items.filter(function(item){return !query||item.getAttribute("data-search").indexOf(query)>-1;});
    var pages=Math.max(1,Math.ceil(matches.length/perPage));
    page=Math.min(page,pages);
    items.forEach(function(item){item.hidden=true;});
    matches.slice((page-1)*perPage,page*perPage).forEach(function(item){item.hidden=false;});
    noResults.hidden=matches.length!==0;
    pagination.hidden=matches.length<=perPage;
    status.textContent="Page "+page+" of "+pages;
    previous.disabled=page===1;
    next.disabled=page===pages;
  }

  input.addEventListener("input",function(){page=1;render();});
  previous.addEventListener("click",function(){if(page>1){page-=1;render();}});
  next.addEventListener("click",function(){page+=1;render();});
  render();
}());
