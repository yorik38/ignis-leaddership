(function(){
  var switches=document.querySelectorAll("[data-pilot-route]");
  var panels=document.querySelectorAll("[data-pilot-panel]");
  if(!switches.length)return;
  function select(route){
    switches.forEach(function(button){button.setAttribute("aria-selected",String(button.getAttribute("data-pilot-route")===route));});
    panels.forEach(function(panel){panel.hidden=panel.getAttribute("data-pilot-panel")!==route;});
  }
  switches.forEach(function(button){button.addEventListener("click",function(){select(button.getAttribute("data-pilot-route"));});});
  var route=new URLSearchParams(window.location.search).get("route");
  select(route==="tender"?"tender":"bid");
})();
