const { ARTICLE_FEED, fetchFeed, httpsUrl, sortUnique } = require("./_lib/media-feed");
const articleOrder = require("./_lib/selected-articles.json");

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).end();
  }

  // Only use the publisher's public feed. Subscriber-specific feeds grant access
  // to paid audio and must never be configured here.
  const podcastFeed = httpsUrl(process.env.PUBLIC_PODCAST_RSS_URL);
  const [publication, podcast] = await Promise.allSettled([
    fetchFeed(ARTICLE_FEED),
    podcastFeed && podcastFeed !== ARTICLE_FEED ? fetchFeed(podcastFeed) : null,
  ]);

  const articles = publication.value?.articles;
  const bySlug = new Map(articles?.map((article) => [new URL(article.url).pathname.split("/").filter(Boolean).at(-1), article]));
  const episodes = podcastFeed && podcastFeed !== ARTICLE_FEED
    ? podcast.value?.episodes
    : publication.value?.episodes;
  const platforms = [
    ["YouTube", process.env.PODCAST_YOUTUBE_URL],
    ["Apple Podcasts", process.env.PODCAST_APPLE_URL],
    ["Spotify", process.env.PODCAST_SPOTIFY_URL],
  ].map(([label, url]) => ({ label, url: httpsUrl(url) })).filter(({ url }) => url);
  const degraded = publication.status === "rejected" || podcast.status === "rejected";

  res.setHeader("Cache-Control", "public, max-age=60");
  res.setHeader("Vercel-CDN-Cache-Control", degraded ? "public, s-maxage=60" : "public, s-maxage=600, stale-while-revalidate=1800");
  if (req.method === "HEAD") return res.status(200).end();
  return res.status(200).json({
    articles: articles ? articleOrder.map((slug) => bySlug.get(slug)).filter(Boolean) : null,
    articleOrder,
    episodes: episodes ? sortUnique(episodes, "id") : null,
    platforms,
  });
};
