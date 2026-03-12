# NYC Weather App

Real-time weather for all five New York City boroughs — built for SEO, LLM discoverability, and fast performance.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, SSR/ISR) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Weather API | OpenWeatherMap |
| Hosting | Ubuntu / Nginx (DigitalOcean) |
| Process Manager | PM2 |
| SSL | Let’s Encrypt (Certbot) |

## Features

- Real-time weather for all 5 NYC boroughs (Manhattan, Brooklyn, Queens, The Bronx, Staten Island)
- Incremental Static Regeneration — pages revalidate every 10 minutes
- Schema.org structured data for Google rich snippets
- llms.txt for LLM/AI crawler discoverability
- robots.txt explicitly allowing GPTBot, PerplexityBot, ClaudeBot
- XML sitemap auto-generated at /sitemap.xml
- Natural language weather summaries on each borough page (optimized for AI Overviews)
- Mobile-first responsive design

## Borough Pages

| Borough | URL |
|---------|-----|
| All Boroughs | / |
| Manhattan | /manhattan |
| Brooklyn | /brooklyn |
| Queens | /queens |
| The Bronx | /bronx |
| Staten Island | /staten-island |

## Setup

### 1. Clone the repo

git clone https://github.com/divinedavis/NYC-Weather-App.git
cd NYC-Weather-App
npm install

### 2. Get an API key

Sign up at openweathermap.org — free tier supports 60 calls/min.

### 3. Configure environment

cp .env.example .env.local
# Edit .env.local and add your API key

OPENWEATHER_API_KEY=your_key_here

### 4. Run locally

npm run dev

### 5. Build for production

npm run build
npm start

## Server Deployment

The app runs on a DigitalOcean droplet behind Nginx with PM2 for process management.

A cron job runs every 30 minutes to auto-commit and push any changes to this repo.

## SEO Strategy

- Dedicated page per borough at clean URLs (/brooklyn, /manhattan, etc.)
- Schema.org WebPage + Place + GeoCoordinates markup
- Natural language weather summaries that LLMs and Google AI Overviews can cite
- Target keywords: nyc weather, brooklyn weather today, [borough] weather this weekend

## License

MIT
