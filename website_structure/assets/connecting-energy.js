(() => {
  const editionLists = [...document.querySelectorAll("[data-article-feed]")];
  const episodeList = document.querySelector("[data-episode-feed]");
  const episodeDetail = document.querySelector("[data-episode-detail]");
  const platforms = document.querySelector("[data-podcast-platforms]");
  const format = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  }

  function dateLabel(published) {
    if (!published) return null;
    const date = new Date(published);
    if (!Number.isFinite(date.getTime())) return null;
    const time = element("time", "", format.format(date));
    time.dateTime = published;
    return time;
  }

  function artwork(source) {
    if (!source) return null;
    const image = element("img");
    image.src = source;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    return image;
  }

  function card(item, isEpisode) {
    const article = element("article", "media-story");
    const link = element("a");
    link.href = isEpisode ? "/podcast/" + item.id : item.url;
    const image = artwork(item.image);
    if (image) {
      const figure = element("figure");
      figure.append(image);
      link.append(figure);
    }
    const date = dateLabel(item.published);
    if (date) {
      const byline = element("p", "media-byline");
      byline.append(date);
      link.append(byline);
    }
    link.append(element("h3", "", item.title));
    if (item.summary) link.append(element("p", "", item.summary));
    article.append(link);
    return article;
  }

  function renderEpisode(episodes) {
    const id = location.pathname.match(/^\/podcast\/([a-f0-9]{16})\/?$/)?.[1];
    if (!id || !episodeDetail) return;
    const episode = episodes.find((item) => item.id === id);
    const intro = document.querySelector("[data-podcast-intro]");
    const heading = element("h1", "", episode?.title || "Episode unavailable");
    const back = element("a", "media-link", "All episodes");
    back.href = "/podcast";
    const actions = element("div", "media-actions");
    actions.append(back);
    const content = element("div", "wrap media-copy");
    content.append(element("p", "media-eyebrow", "Connecting Energy Podcast"), heading);
    if (episode) {
      document.title = episode.title + " | Connecting Energy";
      const date = dateLabel(episode.published);
      if (date) {
        const byline = element("p");
        byline.append(date);
        content.append(byline);
      }
      if (episode.summary) content.append(element("p", "", episode.summary));
      const image = artwork(episode.image);
      if (image) {
        image.className = "media-picture";
        content.append(image);
      }
      const audio = element("audio");
      audio.setAttribute("controls", "");
      audio.setAttribute("aria-label", "Listen to " + episode.title);
      audio.preload = "none";
      audio.src = episode.audio;
      content.append(audio);
      const source = element("a", "media-link", "Open episode on Substack");
      source.href = episode.url;
      actions.append(source);
    } else {
      content.append(element("p", "", "Try the episode archive or check again later."));
    }
    content.append(actions);
    episodeDetail.replaceChildren(content);
    episodeDetail.hidden = false;
    if (intro) intro.hidden = true;
  }

  if (!editionLists.length && !episodeList) return;
  fetch("/api/media", { headers: { Accept: "application/json" } })
    .then((response) => {
      if (!response.ok) throw new Error("Feed unavailable");
      return response.json();
    })
    .then(({ articles, episodes, platforms: destinations }) => {
      if (articles?.length) {
        for (const list of editionLists) {
          list.replaceChildren(...articles.slice(0, Number(list.dataset.limit)).map((item) => card(item, false)));
        }
      }
      if (episodeList && Array.isArray(episodes)) {
        if (episodes.length) {
          const visibleEpisodes = episodeList.dataset.limit ? episodes.slice(0, Number(episodeList.dataset.limit)) : episodes;
          episodeList.replaceChildren(...visibleEpisodes.map((item) => card(item, true)));
          episodeList.hidden = false;
          document.querySelector("[data-podcast-status]").hidden = true;
          const latestHeading = document.querySelector("[data-latest-episode-heading]");
          if (latestHeading) latestHeading.hidden = false;
        }
        renderEpisode(episodes);
      }
      if (platforms && destinations?.length) {
        for (const { label, url } of destinations) {
          const link = element("a", "media-link", label);
          link.href = url;
          platforms.append(link);
        }
        platforms.hidden = false;
      }
    })
    .catch(() => {
      // Server-rendered editions and the subscription links are the fallback.
    });
})();
