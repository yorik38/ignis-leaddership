(function(){
  "use strict";

  var app = document.getElementById("readiness-app");
  if (!app) return;

  var dimensions = {
    process: "Process clarity",
    information: "Information and evidence",
    governance: "Governance and decision rights",
    team_readiness: "Team readiness",
    learning: "Learning and improvement"
  };

  var shared = [
    {id:"q1", dimension:"process", title:"How clearly is the end-to-end workflow defined?", options:["It mostly lives in people’s heads.","There is a rough path, but teams follow it differently.","The main stages and responsibilities are documented.","It is owned, used as the default and updated when the work changes."]},
    {id:"q2", dimension:"process", title:"How are hand-offs managed between contributors?", options:["Informally; gaps are usually found late.","Through email and meetings, with some ambiguity.","Owners, inputs and outputs are named for the main hand-offs.","Hand-offs are checklist-driven and checked before work moves on."]},
    {id:"q5", dimension:"governance", title:"How clear are the decisions that must remain with people?", options:["They are not explicitly defined.","People know informally, but it varies by team.","Important approvals and decision owners are documented.","Decision rights, evidence and escalation paths are explicit and followed."]},
    {id:"q6", dimension:"governance", title:"How is AI or automation used in this work today?", options:["It is not used, or use is unknown.","Individuals experiment without a shared method.","Some approved tools and boundaries exist.","Use is governed, traceable and tied to named human approvals."]},
    {id:"q7", dimension:"team_readiness", title:"How consistently can the team follow a shared process without relying on one or two key people?", options:["The work depends heavily on individuals and local workarounds.","Some shared steps exist, but frequent support is still needed.","Most people can follow documented steps and templates.","The team can run, challenge and improve a shared process with a clear owner."]},
    {id:"q8", dimension:"learning", title:"What happens after a win, loss or award decision?", options:["Little is captured for the next cycle.","Lessons are discussed but rarely reused.","Useful lessons and evidence are stored in a shared place.","Learning is reviewed, curated and deliberately carried into the next pursuit."]},
    {id:"q11", dimension:"team_readiness", title:"Who could own and support the first AI-supported workflow if you chose to test one?", options:["No one is clearly accountable yet.","A likely sponsor exists, but day-to-day responsibility is unclear.","A sponsor and day-to-day owner can be named.","A sponsor, owner and user group are ready to support a bounded pilot."]},
    {id:"q12", dimension:"learning", title:"How would you know whether the first AI-supported change was working?", options:["We have not agreed what to measure.","We would rely mainly on anecdotal feedback.","A few practical measures could be defined before a pilot.","Measures, baseline evidence and a review point are already understood."]}
  ];

  var routeQuestions = {
    bid: [
      {id:"q3", dimension:"information", title:"When an ITT or RFP lands, how quickly can the team establish one trusted requirements view?", options:["Requirements are discovered while responses are already being written.","A first view exists, but duplicates and omissions are common.","A structured compliance or response matrix is normally created.","The matrix is complete, owned, source-linked and kept current."]},
      {id:"q4", dimension:"information", title:"Can the team trace a response claim back to its source and owner?", options:["Rarely, without reconstructing the history.","For important items, if the right person is available.","Most material claims have an identifiable source and owner.","Citations, owners, versions and approvals are consistently visible."]},
      {id:"q9", title:"Where does bid work most often slow down or lose control?", nonScored:true, options:["Turning the ITT into clear, owned requirements","Finding approved evidence and reusable content","Securing timely Go / No-Go, strategy and commercial decisions","Coordinating contributors, reviews and revisions","Closing the pursuit and reusing what the team learned"]},
      {id:"q10", title:"Which part of the work would you most like AI agents to support first?", nonScored:true, options:["Compliance and response matrix","Go / No-Go and strategy gate","Evidence and citation control","Red-team and submission assurance","I am not sure yet"]}
    ],
    tender: [
      {id:"q3", dimension:"information", title:"When supplier returns arrive, how quickly can the team create a comparable view?", options:["Comparison starts in separate files and judgement calls.","A consolidated view is built, but gaps and different interpretations remain.","A standard evaluation matrix and mandatory checks are normally used.","Returns are complete, source-linked and comparable under one controlled structure."]},
      {id:"q4", dimension:"information", title:"Can the team trace an evaluation conclusion to the supplier return and agreed criteria?", options:["Rarely, without reconstructing the history.","For important items, if the evaluator is available.","Most conclusions have a visible source and rationale.","Sources, clarifications, versions and approvals are consistently visible."]},
      {id:"q9", title:"Where does tender work most often slow down or lose control?", nonScored:true, options:["Turning supplier returns into one comparable view","Verifying mandatory requirements and evidence","Managing clarifications consistently","Coordinating evaluators, moderation and approvals","Closing the tender and reusing what the team learned"]},
      {id:"q10", title:"Which part of the work would you most like AI agents to support first?", nonScored:true, options:["Comparable evaluation matrix","Mandatory requirements checks","Clarification control","Evaluation assurance and moderation","I am not sure yet"]}
    ]
  };

  var state = {route:null, index:-1, answers:{}};
  var progressBar = document.getElementById("readiness-progress-bar");
  var progressText = document.getElementById("readiness-progress-text");
  var screen = document.getElementById("readiness-screen");

  function questions(){
    var rq = routeQuestions[state.route] || [];
    return [shared[0],shared[1],rq[0],rq[1],shared[2],shared[3],shared[4],shared[5],rq[2],rq[3],shared[6],shared[7]];
  }

  function escapeHtml(value){
    return String(value).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});
  }

  function updateProgress(label, percentage){
    progressText.textContent = label;
    progressBar.style.width = percentage + "%";
  }

  function routeScreen(){
    updateProgress("Choose your route",0);
    screen.innerHTML = '<span class="eyebrow">First, choose the work</span><h2>Which side of the commercial process are you assessing?</h2><p class="screen-copy">The language and first-workflow recommendation will adapt to your answer.</p><div class="readiness-route-grid"><label class="readiness-choice"><input type="radio" name="route" value="bid"><strong>We compete for work</strong><span>Win work: bid and proposal management.</span></label><label class="readiness-choice"><input type="radio" name="route" value="tender"><strong>We issue and evaluate tenders</strong><span>Buy well: tendering, evaluation and supplier sourcing.</span></label></div><div class="readiness-actions"><span></span><button class="btn-primary" type="button" data-next>Start the check →</button></div><p class="readiness-error" role="alert"></p>';
    screen.querySelector("[data-next]").addEventListener("click",function(){
      var chosen = screen.querySelector('input[name="route"]:checked');
      if (!chosen) { screen.querySelector(".readiness-error").textContent = "Choose the route that is closest to your work."; return; }
      state.route = chosen.value;
      state.index = 0;
      questionScreen();
    });
  }

  function questionScreen(){
    var list = questions();
    var q = list[state.index];
    var count = state.index + 1;
    var isLast = state.index === list.length-1;
    var hasSavedAnswer = Boolean(state.answers[q.id]);
    updateProgress("Question " + count + " of " + list.length,Math.round(count/list.length*82));
    var options = q.options.map(function(option,i){
      var checked = state.answers[q.id] && state.answers[q.id].value === i ? " checked" : "";
      return '<label class="readiness-option"><input type="radio" name="answer" value="'+i+'"'+checked+'><span>'+escapeHtml(option)+'</span></label>';
    }).join("");
    screen.innerHTML = '<span class="eyebrow">'+(q.nonScored ? "Your priority" : escapeHtml(dimensions[q.dimension]))+'</span><h2>'+escapeHtml(q.title)+'</h2>'+(q.nonScored?'<p class="screen-copy">This shapes the recommendation but does not affect your readiness band.</p>':'')+'<div class="readiness-options">'+options+'</div><div class="readiness-actions"><button class="btn-secondary" type="button" data-back>← Back</button><button class="btn-primary" type="button" data-next'+(isLast && !hasSavedAnswer?' hidden':'')+'>'+(isLast?"Get your results →":"Next →")+'</button></div><p class="readiness-error" role="alert"></p>';
    if (isLast) {
      Array.prototype.forEach.call(screen.querySelectorAll('input[name="answer"]'),function(answer){
        answer.addEventListener("change",function(){
          screen.querySelector("[data-next]").hidden = false;
          screen.querySelector(".readiness-error").textContent = "";
        });
      });
    }
    screen.querySelector("[data-back]").addEventListener("click",function(){
      if (state.index === 0) routeScreen(); else { state.index -= 1; questionScreen(); }
    });
    screen.querySelector("[data-next]").addEventListener("click",function(){
      var chosen = screen.querySelector('input[name="answer"]:checked');
      if (!chosen) { screen.querySelector(".readiness-error").textContent = "Choose the answer that is closest to your current practice."; return; }
      state.answers[q.id] = {value:Number(chosen.value),label:q.options[Number(chosen.value)],dimension:q.dimension || null};
      if (isLast) gateScreen(); else { state.index += 1; questionScreen(); }
    });
  }

  function gateScreen(){
    updateProgress("Your tailored result",90);
    var result=calculate();
    var preview={foundation:"Your practice appears to need a stronger foundation before an AI pilot.",pilot:"Your practice appears ready for a bounded pilot.",connect:"Your practice appears ready to connect workflows.",scale:"Your practice appears ready to scale carefully."};
    screen.innerHTML = '<span class="eyebrow">Initial result</span><h2>'+preview[result.band]+'</h2><p class="screen-copy">Enter your full name and work email to see the full readiness band, weakest dimension and recommended first workflow.</p><form id="readiness-gate-form"><div class="readiness-gate"><label>Full name<input type="text" name="full_name" autocomplete="name" required></label><label>Work email<input type="email" name="email" autocomplete="email" inputmode="email" required></label></div><input class="readiness-honeypot" type="text" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true"><p class="readiness-consent">Receive your result and a short five-email follow-up explaining what it means. Unsubscribe at any time. See our <a href="/privacy">Privacy Policy</a>.</p><div class="readiness-actions"><button class="btn-secondary" type="button" data-back>← Back</button><button class="btn-primary" type="submit">Show my result →</button></div><p class="readiness-error" role="alert"></p></form>';
    screen.querySelector("[data-back]").addEventListener("click",function(){state.index=questions().length-1;questionScreen();});
    screen.querySelector("form").addEventListener("submit",submitAssessment);
  }

  function calculate(){
    var totals = {}, counts = {};
    Object.keys(dimensions).forEach(function(key){totals[key]=0;counts[key]=0;});
    questions().forEach(function(q){
      if (!q.dimension || !state.answers[q.id]) return;
      totals[q.dimension] += state.answers[q.id].value;
      counts[q.dimension] += 1;
    });
    var averages = {};
    Object.keys(dimensions).forEach(function(key){averages[key]=counts[key]?totals[key]/counts[key]:0;});
    var weights={process:1.2,information:1.2,governance:1.2,team_readiness:1,learning:1};
    var weighted=0,weightTotal=0;
    Object.keys(dimensions).forEach(function(key){weighted+=averages[key]*weights[key];weightTotal+=weights[key];});
    var score=weighted/weightTotal;
    var band=score<1?"foundation":score<1.75?"pilot":score<2.4?"connect":"scale";
    var priorityOrder=["governance","information","process","team_readiness","learning"];
    var weakest=priorityOrder.slice().sort(function(a,b){return averages[a]-averages[b] || priorityOrder.indexOf(a)-priorityOrder.indexOf(b);})[0];
    return {score:score,band:band,weakest:weakest,averages:averages};
  }

  function recommendation(result){
    var route=state.route, dim=result.weakest;
    if (result.band === "foundation") return route === "bid" ? ["Map the bid protocol before adding agents","Make the stages, owners, trusted sources and human gates visible; then choose one bounded workflow."] : ["Map the tender protocol before adding agents","Make the stages, evaluation rules, trusted sources and decision rights visible; then choose one bounded workflow."];
    if (route === "bid") {
      if (dim === "governance") return ["Test a governed Go / No-Go and strategy gate","Make evidence, decision rights and sign-off explicit before accelerating downstream work."];
      if (dim === "learning") return ["Test submission assurance and learning capture","Use a controlled red-team and close-out step so evidence improves the next pursuit."];
      return ["Test a compliance and response matrix","Turn the ITT into one owned, source-linked view before response drafting accelerates."];
    }
    if (dim === "governance") return ["Test controlled clarifications and decision gates","Keep equal treatment, decision rights and the clarification record visible to every evaluator."];
    if (dim === "learning") return ["Test evaluation assurance and learning capture","Moderate the evaluation consistently and carry the evidence into the next sourcing cycle."];
    return ["Test a comparable evaluation matrix","Create one source-linked view of supplier returns and mandatory checks before scoring accelerates."];
  }

  function submitAssessment(event){
    event.preventDefault();
    var form=event.currentTarget, error=form.querySelector(".readiness-error"), button=form.querySelector('button[type="submit"]');
    if (!form.reportValidity()) return;
    var result=calculate(), rec=recommendation(result);
    var payload={full_name:form.full_name.value.trim(),email:form.email.value.trim(),company_website:form.company_website.value,route:state.route,readiness_band:result.band,weakest_dimension:result.weakest,recommended_workflow:rec[0],constraint_answer:state.answers.q9.label,workflow_interest:state.answers.q10.label,source:"commercial_ai_readiness_check",page_url:window.location.href,answers:{}};
    Object.keys(state.answers).forEach(function(key){payload.answers[key]=state.answers[key].value;});
    button.disabled=true;button.textContent="Preparing your result…";error.textContent="";
    var local=/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    var request=local?Promise.resolve({ok:true,json:function(){return Promise.resolve({ok:true,preview:true});}}):fetch("/api/readiness",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)});
    request.then(function(response){if(!response.ok) throw new Error("submit");return response.json();}).then(function(){resultScreen(result,rec,payload.full_name);}).catch(function(){error.textContent="We could not save your details. Please try again, or email admin@ignisleadership.com.";button.disabled=false;button.textContent="Show my result →";});
  }

  function resultScreen(result,rec,fullName){
    updateProgress("Assessment complete",100);
    var bands={foundation:["Foundation needed","Structure the process before any AI pilot."],pilot:["Ready for a bounded pilot","One workflow appears ready to be tested safely."],connect:["Ready to connect workflows","The foundations exist; coordination is now the constraint."],scale:["Ready to scale carefully","The evidence supports connecting more of the practice map."]};
    var scaleLabels=["Foundation needed","Early foundation","Pilot ready","Well established"];
    var rows=Object.keys(dimensions).map(function(key){var pct=Math.round(result.averages[key]/3*100);return '<div class="dimension-row"><strong>'+dimensions[key]+'</strong><div class="dimension-track" aria-hidden="true"><span style="width:'+pct+'%"></span></div><span class="dimension-label">'+scaleLabels[Math.round(result.averages[key])]+'</span></div>';}).join("");
    var firstName=String(fullName || "").trim().split(/\s+/)[0];
    screen.innerHTML='<div class="readiness-result-head"><span class="result-band">'+bands[result.band][0]+'</span><h2>'+escapeHtml(firstName)+', your practice '+(result.band==="foundation"?"needs a stronger foundation before an AI pilot.":"appears "+bands[result.band][0].toLowerCase()+".")+'</h2><p>'+bands[result.band][1]+' Your weakest dimension is <strong>'+dimensions[result.weakest].toLowerCase()+'</strong>.</p></div><div class="dimension-list">'+rows+'</div><div class="readiness-recommendation"><span>Recommended first move</span><h3>'+rec[0]+'</h3><p>'+rec[1]+'</p></div><div class="readiness-next"><a class="btn-primary" href="https://calendly.com/yorik-tisseau-tmff/bid-capability-diagnostic" data-calendly-link target="_blank" rel="noopener">Book a call →</a><a class="btn-secondary" href="/forge">See how FORGE works</a></div>';
    if (typeof initCalendly === "function") initCalendly();
    window.scrollTo({top:Math.max(0,app.getBoundingClientRect().top+window.scrollY-100),behavior:"smooth"});
  }

  routeScreen();
})();
