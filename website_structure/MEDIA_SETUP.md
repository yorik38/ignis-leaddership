# Connecting Energy feeds

The site uses the public Connecting Energy Substack RSS feed at https://connectingenergy.substack.com/feed. No credential is required. The homepage and Insights page include an HTML snapshot of real previews as a fallback. The site's /api/media function refreshes titles, dates, summaries, artwork and links from public RSS. Vercel caches successful responses for ten minutes. Paid access stays on Substack. The site's API does not publish the full-text RSS field.

The podcast launch page already accepts guest enquiries via the shared HubSpot form. Once the first public episode or trailer is published, add its show's public (not subscriber-specific) RSS address as the Vercel environment variable PUBLIC_PODCAST_RSS_URL and redeploy. The site will display the newest episode on the homepage and create player links under /podcast. When the publication feed includes audio episodes they appear automatically as well, unless a separate show feed is configured.

Optional Vercel variables for official show destinations are PODCAST_YOUTUBE_URL, PODCAST_APPLE_URL and PODCAST_SPOTIFY_URL. Leave them unset until the show links exist.

Events has a planning state until there is a date and booking URL. The Energy map page links to published research until the app is ready at map.ignisleadership.com. Update these links when the respective launch is confirmed.
