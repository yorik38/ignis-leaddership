(function(){"use strict";
function el(tag,cls,text){var node=document.createElement(tag);if(cls)node.className=cls;if(text)node.textContent=text;return node;}
function formatDate(iso){var d=new Date(iso);if(isNaN(d.getTime()))return"";return d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"Europe/London"});}
function safeHref(url){try{var u=new URL(url);return u.protocol==="https:"&&u.hostname==="connectingenergy.substack.com"?u.href:"";}catch(e){return"";}}
function card(item){var href=safeHref(item.url);if(!href||!item.title)return null;var li=el("li","ce-post");var a=el("a","ce-post-link");a.href=href;a.rel="noopener";
if(item.image){var img=el("img","ce-post-image");img.src=item.image;img.alt="";img.loading="lazy";img.decoding="async";img.width=720;img.height=405;a.appendChild(img);}
var body=el("span","ce-post-body");var date=formatDate(item.date);if(date){var t=el("time","ce-post-date",date);t.setAttribute("datetime",item.date);body.appendChild(t);}
body.appendChild(el("span","ce-post-title",item.title));if(item.summary)body.appendChild(el("span","ce-post-summary",item.summary));body.appendChild(el("span","ce-post-more","Read on Substack"));a.appendChild(body);li.appendChild(a);return li;}
document.querySelectorAll("[data-substack-feed]").forEach(function(list){var limit=Number(list.getAttribute("data-limit"))||3;
fetch("/api/substack-feed",{headers:{Accept:"application/json"}}).then(function(r){return r.ok?r.json():null;}).then(function(data){if(!data||!data.ok||!data.items||!data.items.length)return;var cards=data.items.slice(0,limit).map(card).filter(Boolean);if(!cards.length)return;list.textContent="";cards.forEach(function(c){list.appendChild(c);});list.setAttribute("data-feed-state","live");}).catch(function(){});});
function mailtoFallback(form,note){var get=function(n){var f=form.querySelector('[name="'+n+'"]');return f?String(f.value||"").trim():"";};
var body="Name: "+get("name")+"\nEmail: "+get("email")+"\nOrganisation: "+get("organisation")+"\nRole: "+get("role")+"\nLinkedIn: "+get("linkedin")+"\n\nTopic idea:\n"+get("topic");
var href="mailto:yorik@ignisleadership.com?subject="+encodeURIComponent("Connecting Energy podcast: guest idea")+"&body="+encodeURIComponent(body);
note.textContent="";note.appendChild(document.createTextNode("The form isn't switched on yet. "));var a=el("a","","Send it by email instead");a.href=href;note.appendChild(a);note.appendChild(document.createTextNode(" and your answers will be filled in for you."));note.hidden=false;}
document.querySelectorAll("[data-guest-form]").forEach(function(form){var button=form.querySelector("button[type=submit]"),label=button?button.textContent:"",status=form.querySelector("[data-form-status]"),errorNote=form.querySelector("[data-form-error]");
var page=form.querySelector("[name=page_url]");if(page)page.value=window.location.href;
form.addEventListener("submit",function(event){event.preventDefault();if(!form.reportValidity())return;if(errorNote){errorNote.hidden=true;errorNote.textContent="";}if(button){button.disabled=true;button.textContent="Sending…";}
var payload={};new FormData(form).forEach(function(v,k){payload[k]=v;});var hutk=document.cookie.match(/(?:^|; )hubspotutk=([^;]*)/);if(hutk)payload.hutk=decodeURIComponent(hutk[1]);var token=form.querySelector("[name='cf-turnstile-response']");if(token)payload.turnstile_token=token.value;
var wait=window.ignisFormDelay?window.ignisFormDelay(form):Promise.resolve();
wait.then(function(){return fetch(form.getAttribute("action")||"/api/guest",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(payload)});}).then(function(r){return r.json().catch(function(){return{};}).then(function(data){return{status:r.status,data:data};});}).then(function(res){
if(res.status===200&&res.data&&res.data.ok){form.reset();form.querySelectorAll("input,textarea,button").forEach(function(n){n.disabled=true;});if(status){status.hidden=false;if(status.focus)status.focus();}if(typeof window.gtag==="function")window.gtag("event","generate_lead",{form_id:"podcast_guest"});return;}
if(res.status===503&&res.data&&res.data.error==="not_configured"&&errorNote){mailtoFallback(form,errorNote);}else if(errorNote){errorNote.textContent=(res.data&&res.data.error&&res.data.error.length<160)?res.data.error:"That didn't go through. Please try again in a minute.";errorNote.hidden=false;}
if(window.ignisResetTurnstile)window.ignisResetTurnstile(form);if(button){button.disabled=false;button.textContent=label;}}).catch(function(){if(errorNote){errorNote.textContent="That didn't go through. Please check your connection and try again.";errorNote.hidden=false;}if(button){button.disabled=false;button.textContent=label;}});});});
})();
