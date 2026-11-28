(() => {
  const editionLists = [...document.querySelectorAll("[data-article-feed]")];
  const episodeList = document.querySelector("[data-episode-feed]");
  const episodeDetail = document.querySelector("[data-episode-detail]");
  const platforms = [...document.querySelectorAll("[data-podcast-platforms] a[data-platform]")];
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

  function articleSlug(url) {
    return new URL(url).pathname.split("/").filter(Boolean).at(-1);
  }

  function refreshArticles(list, articles, articleOrder) {
    const excluded = new Set((list.dataset.excludeSlugs || "").split(/\s+/));
    const cards = new Map([...list.children].map((entry) => [articleSlug(entry.querySelector("a").href), entry]));
    for (const article of articles) cards.set(articleSlug(article.url), card(article, false));
    const visible = articleOrder
      .filter((slug) => !excluded.has(slug) && cards.has(slug))
      .slice(0, Number(list.dataset.limit))
      .map((slug) => cards.get(slug));
    list.replaceChildren(...visible);
  }

  if (!editionLists.length && !episodeList) return;
  fetch("/api/media", { headers: { Accept: "application/json" } })
    .then((response) => {
      if (!response.ok) throw new Error("Feed unavailable");
      return response.json();
    })
    .then(({ articles, articleOrder, episodes, platforms: destinations }) => {
      if (articles?.length && articleOrder?.length) {
        for (const list of editionLists) {
          refreshArticles(list, articles, articleOrder);
        }
      }
      if (episodeList && Array.isArray(episodes)) {
        if (episodes.length) {
          const visibleEpisodes = episodeList.dataset.limit ? episodes.slice(0, Number(episodeList.dataset.limit)) : episodes;
          episodeList.replaceChildren(...visibleEpisodes.map((item) => card(item, true)));
          episodeList.hidden = false;
          const latestHeading = document.querySelector("[data-latest-episode-heading]");
          if (latestHeading) {
            latestHeading.hidden = false;
            document.querySelector("[data-podcast-status]").hidden = true;
          }
          const archive = document.querySelector("[data-episode-archive]");
          if (archive) {
            archive.hidden = false;
            document.querySelector("[data-podcast-status] .media-eyebrow").textContent = "Connecting Energy";
            document.querySelector("[data-podcast-status] .edition-launch-copy p:not(.media-eyebrow)").textContent =
              "Conversations with the people working across generation, grid and demand.";
          }
        }
        renderEpisode(episodes);
      }
      if (destinations?.length) {
        for (const tag of platforms) {
          const destination = destinations.find(({ label }) => label === tag.dataset.platform);
          if (!destination) continue;
          tag.href = destination.url;
          tag.setAttribute("aria-label", "Connecting Energy on " + destination.label);
        }
      }
    })
    .catch(() => {
      // Server-rendered editions and the subscription links are the fallback.
    });
})();
