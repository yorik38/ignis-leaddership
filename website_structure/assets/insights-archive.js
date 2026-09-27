(function(){
  "use strict";
  var input=document.getElementById("insights-search");
  var items=Array.from(document.querySelectorAll("[data-insight-item]"));
  var toggle=document.getElementById("insights-archive-toggle");
  var noResults=document.getElementById("insights-no-results");
  var initialLimit=8;
  var expanded=false;

  if(!input||!toggle||!noResults)return;

  function render(){
    var query=input.value.trim().toLowerCase();
    var matches=items.filter(function(item){
      return !query||item.getAttribute("data-search").indexOf(query)>-1;
    });

    items.forEach(function(item){item.hidden=true;});
    matches.forEach(function(item,index){
      item.hidden=!(query||expanded||index<initialLimit);
    });

    noResults.hidden=matches.length!==0;
    toggle.hidden=Boolean(query)||items.length<=initialLimit;
    toggle.setAttribute("aria-expanded",String(expanded));
    toggle.innerHTML=expanded?'Close archive <span aria-hidden="true">↑</span>':'Explore archive <span aria-hidden="true">↓</span>';
  }

  input.addEventListener("input",render);
  toggle.addEventListener("click",function(){expanded=!expanded;render();});
  render();
}());
