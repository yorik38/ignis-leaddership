(() => {
  const enquiries = {
    podcast: [
      "Pitch an episode.",
      "Tell me who you are, the question you’d like to explore on Connecting Energy and what experience or evidence you can bring. If you’re suggesting someone else, include a link so I can find them.",
    ],
    events: ["Suggest a debate question.", "Tell me the question you’d put to the audience and the two views you’d like to hear."],
    photos: ["Share a photo link.", "Send the link to a photo you took, where it was taken, why you chose it and how you’d like to be credited."],
    speaking: ["Enquire about speaking.", "Tell me about your event, the audience, the date and the question you’d like me to address."],
    advisory: ["Discuss an advisory project.", "Tell me about the project, the decision in front of you and what would help you move it forward."],
    sponsor: ["Sponsor Connecting Energy.", "Tell me about your organisation and who you’re looking to reach through the podcast or live events."],
  };
  const query = new URLSearchParams(window.location.search);
  const type = query.get("enquiry");
  if (!Object.hasOwn(enquiries, type)) return;
  const format = query.get("interest");
  const formats = { live: "I’d join the grid connections debate live.", replay: "I’d watch a replay of the grid connections debate." };
  const hasChoice = type === "events" && Object.hasOwn(formats, format);
  const [heading, description] = hasChoice
    ? ["Register your interest.", format === "live" ? "Add your details to register interest in joining the debate live." : "Add your details to register interest in watching a replay."]
    : enquiries[type];
  document.querySelector(".contact-intro h1").textContent = heading;
  document.querySelector(".contact-intro p").textContent = description;
  document.querySelector(".contact-promise").textContent = "Yorik reads every message personally.";
  document.querySelectorAll(".contact-book").forEach((link) => { link.hidden = true; });
  document.querySelector(".contact-thanks-lead").textContent = "Thanks for getting in touch. Yorik will read your message.";
  document.querySelector("#contact-thanks > p:not([class])").hidden = true;
  if (hasChoice) {
    const email = document.querySelector(".contact-email a");
    email.href = "mailto:yorik@ignisleadership.com?subject=Connecting%20Energy%20Live&body=" + encodeURIComponent(formats[format]);
  }
})();
