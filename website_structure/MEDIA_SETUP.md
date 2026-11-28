# Connecting Energy feeds

The site reads selected posts by slug from the public Connecting Energy Substack RSS feed at https://connectingenergy.substack.com/feed. No credential is required. The homepage and Insights page include an HTML snapshot of real previews as a fallback. The site’s /api/media function refreshes titles, dates, summaries, artwork and links for these posts. Edit api/_lib/selected-articles.json to change the selection and update the HTML fallback cards when choosing a new evergreen feature. Vercel caches successful responses for ten minutes. Paid access stays on Substack. The site's API does not publish the full-text RSS field.

The podcast launch page already accepts guest enquiries via the shared HubSpot form. Once the first public episode or trailer is published, add its show's public (not subscriber-specific) RSS address as the Vercel environment variable PUBLIC_PODCAST_RSS_URL and redeploy. The site will display the newest episode on the homepage and create player links under /podcast. When the publication feed includes audio episodes they appear automatically as well, unless a separate show feed is configured.

Optional Vercel variables for official show destinations are PODCAST_YOUTUBE_URL, PODCAST_APPLE_URL and PODCAST_SPOTIFY_URL. The public pages use platform search links during pre-launch. Setting a show URL replaces that platform’s search link.

The community and events pages use the existing HubSpot enquiry form to collect live and replay interest before a date is set. Photo contributors can email an attachment or send a link via the same form. The Energy map page links to published research until the app is ready at map.ignisleadership.com. Update these links when the respective launch is confirmed.
