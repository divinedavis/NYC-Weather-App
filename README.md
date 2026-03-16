# City Weather

Real-time hyperlocal weather for neighborhoods in top cities worldwide — built for SEO, LLM discoverability, and fast performance.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router, SSR/ISR) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Weather API | OpenWeatherMap |
| Hosting | Ubuntu / Nginx (DigitalOcean) |
| Process Manager | PM2 |
| SSL | Let's Encrypt (Certbot) |

## Features

- Real-time weather for neighborhoods in 6 major cities worldwide
- IP-based geolocation — nearest city surfaces first on the homepage
- Incremental Static Regeneration — pages revalidate every 10 minutes
- Schema.org structured data for Google rich snippets
- llms.txt for LLM/AI crawler discoverability
- robots.txt explicitly allowing GPTBot, PerplexityBot, ClaudeBot
- XML sitemap auto-generated at /sitemap.xml
- Natural language weather summaries optimized for AI Overviews
- Mobile-first responsive design

## Cities & URL Structure

| City | City Page | District Pages |
|------|-----------|----------------|
| New York City | /nyc | /nyc/[neighborhood] |
| London | /london | /london/[district] |
| Tokyo | /tokyo | /tokyo/[district] |
| Paris | /paris | /paris/[arrondissement] |
| Dubai | /dubai | /dubai/[district] |
| Sydney | /sydney | /sydney/[suburb] |

## URL Structure

```
/                        → Homepage (all cities, nearest first)
/[city]                  → City overview + all districts
/[city]/[district]       → Hyperlocal neighborhood weather
```

## Redirects

Old NYC borough URLs are permanently redirected to the new city/district structure:

- `/:borough` → `/nyc`
- `/:borough/:neighborhood` → `/nyc/:neighborhood`

## Server Deployment

The app runs on a DigitalOcean droplet behind Nginx with PM2 for process management.

A cron job runs every 30 minutes to auto-commit and push any changes to this repo.

## SEO Strategy

- Dedicated page per city and per neighborhood at clean URLs
- Schema.org WebPage + Place + GeoCoordinates markup
- Natural language microclimate descriptions that LLMs and Google AI Overviews can cite
- Target keywords: city weather, neighborhood weather, [city] weather, [neighborhood] weather today

## License

MIT
