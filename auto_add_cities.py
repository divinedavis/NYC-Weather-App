#!/usr/bin/env python3
"""
auto_add_cities.py — Daily cron script that adds 10 new cities to cityweather.app
Uses Claude claude-opus-4-6 to generate rich, detailed city + district data.
"""

import os
import sys
import json
import shutil
import subprocess
import logging
from datetime import datetime
from pathlib import Path

import anthropic

# ── Config ────────────────────────────────────────────────────────────────────
APP_DIR       = Path("/var/www/nycweather")
CITIES_TS     = APP_DIR / "lib" / "cities.ts"
QUEUE_FILE    = APP_DIR / "city_queue.json"
LOG_FILE      = APP_DIR / "auto_add_cities.log"
BATCH_SIZE    = 30
MODEL         = "claude-opus-4-6"

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)

# ── Example city block (used as few-shot in prompt) ───────────────────────────
EXAMPLE_CITY = """  {
    name: 'Barcelona',
    slug: 'barcelona',
    country: 'Spain',
    flag: '🇪🇸',
    lat: 41.3851,
    lon: 2.1734,
    timezone: 'Europe/Madrid',
    description: "Barcelona's Mediterranean climate is shaped by its unique position between the sea and the Collserola mountain range. The city enjoys warm, dry summers and mild winters, but the Serra de Collserola acts as a weather barrier that creates distinct microclimates between coastal and inland neighborhoods. Sea breezes moderate summer heat along the coast while inland districts behind the ridge experience hotter, drier conditions.",
    districts: [
      { name: 'Barceloneta', slug: 'barceloneta', lat: 41.3796, lon: 2.1895, group: 'Coastal', description: "Barceloneta's beachfront position makes it Barcelona's most distinctly maritime neighborhood — sea breezes keep summer temperatures 3–4°C cooler than inland districts and provide constant natural ventilation. Winter sea fog is more frequent here than anywhere else in the city." },
      { name: 'Eixample', slug: 'eixample', lat: 41.3925, lon: 2.1609, group: 'Central', description: "The Eixample's grid of wide boulevards and interior courtyards creates Barcelona's most studied urban heat island. The straight streets channel sea breezes effectively but the stone facades retain heat, keeping nighttime temperatures 2–3°C above the city average." },
      { name: 'Gràcia', slug: 'gracia', lat: 41.4036, lon: 2.1545, group: 'Central', description: "Gràcia's dense low-rise fabric and village-scale plazas trap heat during the day but cool rapidly at night. The neighborhood's slight elevation above Eixample and proximity to Collserola gives it earlier access to evening mountain-cooled air." },
      { name: 'Sarrià-Sant Gervasi', slug: 'sarria-sant-gervasi', lat: 41.4018, lon: 2.1295, group: 'Upper', description: "Sarrià-Sant Gervasi climbs the Collserola foothills and is Barcelona's coolest and greenest residential district. Temperatures here run 4–6°C below those of the waterfront in summer, and morning mist from the hills is common in autumn and winter." },
      { name: 'Poble Sec', slug: 'poble-sec', lat: 41.3720, lon: 2.1570, group: 'Central South', description: "Poble Sec sits at the foot of Montjuïc hill, which blocks prevailing sea breezes from the southwest, making it one of Barcelona's warmest inner neighborhoods. The hill creates a wind shadow that reduces natural ventilation and intensifies summer heat." },
      { name: 'Sant Martí', slug: 'sant-marti', lat: 41.4060, lon: 2.2004, group: 'East', description: "Sant Martí's former industrial waterfront is undergoing rapid densification. The coastal position provides sea breeze cooling but the proliferation of glass towers in the 22@ tech district creates localized heat reflections and wind deflection." },
      { name: 'Les Corts', slug: 'les-corts', lat: 41.3842, lon: 2.1338, group: 'West', description: "Les Corts sits in the transition zone between Barcelona's coastal plain and the Collserola ridge, creating a microclimate influenced by both marine and mountain air. Evening downslope winds from Collserola begin earlier here than in coastal districts." },
      { name: 'Horta-Guinardó', slug: 'horta-guinardo', lat: 41.4252, lon: 2.1655, group: 'North', description: "Horta-Guinardó occupies hilly terrain north of the city with significant elevation variation. Higher zones near Parc del Guinardó see noticeably lower temperatures and more frequent cloud and mist from Collserola during autumn and winter." },
      { name: 'Nou Barris', slug: 'nou-barris', lat: 41.4365, lon: 2.1748, group: 'North', description: "Nou Barris sits in the northern valley between Collserola and the city grid, where cold mountain air pools on still winter nights creating the coldest temperatures in the metropolitan area. The valley topography also traps urban pollution during weather inversions." },
      { name: 'Sant Andreu', slug: 'sant-andreu', lat: 41.4333, lon: 2.1901, group: 'North East', description: "Sant Andreu's flat inner-city position insulates it from both sea breezes and Collserola mountain effects, creating a typical urban heat island microclimate. The neighborhood's former industrial heritage left minimal green space, amplifying heat accumulation." },
      { name: 'Sants-Montjuïc', slug: 'sants-montjuic', lat: 41.3658, lon: 2.1389, group: 'South West', description: "Sants-Montjuïc encompasses both the Montjuïc hill and the flat industrial plains below. The hill summit sits above the urban heat island and catches stronger winds, while the flat Sants district below is sheltered from sea breezes by the hill itself." },
      { name: 'Poblenou', slug: 'poblenou', lat: 41.4025, lon: 2.2056, group: 'East Coastal', description: "Poblenou's beachfront and 22@ district position gives it strong sea breeze exposure that moderates summer heat. The coastal orientation and new high-density mixed-use development create complex interactions between marine and urban heat effects." },
      { name: 'El Born', slug: 'el-born', lat: 41.3850, lon: 2.1820, group: 'Old City', description: "El Born's medieval street pattern with narrow alleys and tall stone buildings creates deep shade but poor ventilation. The dense historic fabric stores heat through the day and the lack of green space makes it one of the old city's warmest zones at night." },
      { name: 'Diagonal Mar', slug: 'diagonal-mar', lat: 41.4098, lon: 2.2200, group: 'East Coastal', description: "Diagonal Mar's modern waterfront development with wide open spaces and proximity to the sea gives it Barcelona's strongest sea breeze exposure. The open design allows winds to penetrate inland but also exposes residents to strong Mediterranean wind events in autumn and winter." },
      { name: 'Tibidabo', slug: 'tibidabo', lat: 41.4219, lon: 2.1190, group: 'Upper Hills', description: "Tibidabo at 512m is Barcelona's highest point and experiences a completely different climate from the city below — temperatures are 8–10°C cooler in summer, clouds and mist are common year-round, and winds are frequent and strong. The summit is often above the city's marine fog layer in winter." },
    ],
  },"""

# ── Prompt builder ─────────────────────────────────────────────────────────────
def build_prompt(city_info: dict) -> str:
    return f"""You are generating TypeScript data for a hyperlocal weather website (cityweather.app).

Generate a complete TypeScript object for the city: {city_info['name']}, {city_info['country']}.

REQUIREMENTS:
- Exactly 15 districts (neighborhoods)
- Each district must have: name, slug (URL-safe kebab-case), lat (number), lon (number), group (area label), description (2 sentences, microclimate-focused)
- City must have: name, slug="{city_info['slug']}", country="{city_info['country']}", flag="{city_info['flag']}", lat, lon, timezone="{city_info['timezone']}", description (2-3 sentences about the city's overall climate geography)
- District descriptions must be SPECIFIC to real microclimate factors: elevation differences, water proximity, urban heat islands, wind corridors, building density, park cooling effects, industrial history, etc.
- Use REAL neighborhood names that people actually search for (not generic "North District")
- All lat/lon must be accurate to 4 decimal places
- Slugs must be lowercase, kebab-case, no special characters
- Groups should reflect logical geographic areas (e.g., "Downtown", "Coastal", "North", "East Side", etc.)

OUTPUT FORMAT: Return ONLY the TypeScript object, no imports, no exports, no CITIES array wrapper, no explanations. Start with the opening brace of the city object.

Here is a high-quality example of the expected format and detail level (Barcelona):

{EXAMPLE_CITY}

Now generate the same quality data for {city_info['name']}, {city_info['country']}. Use {city_info['flag']} as the flag emoji. The slug is "{city_info['slug']}" and timezone is "{city_info['timezone']}".

Return ONLY the TypeScript object starting with {{ and ending with }},"""


# ── Claude call ────────────────────────────────────────────────────────────────
def generate_city_ts(client: anthropic.Anthropic, city_info: dict) -> str:
    prompt = build_prompt(city_info)
    log.info(f"  Calling Claude for {city_info['name']}...")

    message = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    content = message.content[0].text.strip()

    # Ensure it starts with { and ends with },
    if not content.startswith('{'):
        # Find the first {
        idx = content.find('{')
        if idx >= 0:
            content = content[idx:]

    # Ensure it ends with },
    if content.endswith('}'):
        content = content + ','
    elif not content.endswith('},'):
        content = content.rstrip() + ','

    return content


# ── cities.ts manipulation ─────────────────────────────────────────────────────
def insert_city_into_ts(city_ts: str) -> bool:
    """Insert city TypeScript block before the closing ] of CITIES array."""
    content = CITIES_TS.read_text(encoding='utf-8')

    # Find the position of the closing ]; of CITIES array
    # We look for the pattern: \n]\n\nexport function
    marker = '\n]\n\nexport function'
    idx = content.find(marker)
    if idx == -1:
        log.error("Could not find CITIES array closing bracket")
        return False

    # Insert the new city before the ]
    indented = '\n  ' + city_ts.replace('\n', '\n  ').rstrip()
    new_content = content[:idx] + indented + '\n' + content[idx:]

    CITIES_TS.write_text(new_content, encoding='utf-8')
    return True


# ── Build & deploy ─────────────────────────────────────────────────────────────
def run_build() -> bool:
    log.info("Running npm run build...")
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=str(APP_DIR),
        capture_output=True,
        text=True,
        timeout=300,
    )
    if result.returncode != 0:
        log.error(f"Build failed:\n{result.stderr[-3000:]}")
        return False
    log.info("Build succeeded.")
    return True


def restart_pm2() -> bool:
    log.info("Restarting PM2...")
    result = subprocess.run(
        ["pm2", "restart", "0"],
        capture_output=True, text=True, timeout=30
    )
    if result.returncode != 0:
        log.error(f"PM2 restart failed: {result.stderr}")
        return False
    log.info("PM2 restarted.")
    return True


def git_push(city_names: list[str]) -> bool:
    log.info("Pushing to GitHub...")
    names = ", ".join(city_names)
    msg = f"feat: add {len(city_names)} cities — {names}"

    cmds = [
        ["git", "add", "lib/cities.ts"],
        ["git", "commit", "-m", msg],
        ["git", "push"],
    ]
    for cmd in cmds:
        result = subprocess.run(cmd, cwd=str(APP_DIR), capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            log.error(f"Git command failed {cmd}: {result.stderr}")
            return False
    log.info(f"Pushed: {msg}")
    return True


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    log.info("=" * 60)
    log.info(f"auto_add_cities.py starting — {datetime.now().isoformat()}")

    # Load queue
    if not QUEUE_FILE.exists():
        log.error(f"Queue file not found: {QUEUE_FILE}")
        sys.exit(1)

    with open(QUEUE_FILE) as f:
        queue_data = json.load(f)

    pending = queue_data.get("queue", [])
    if not pending:
        log.info("Queue is empty — all cities added!")
        sys.exit(0)

    batch = pending[:BATCH_SIZE]
    log.info(f"Processing batch of {len(batch)} cities: {[c['name'] for c in batch]}")

    # Init Claude client
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        log.error("ANTHROPIC_API_KEY not set")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    # Backup cities.ts
    backup = CITIES_TS.with_suffix('.ts.bak')
    shutil.copy2(CITIES_TS, backup)
    log.info(f"Backed up cities.ts to {backup}")

    added_cities = []

    for city_info in batch:
        log.info(f"→ Generating {city_info['name']}...")
        try:
            city_ts = generate_city_ts(client, city_info)

            if not insert_city_into_ts(city_ts):
                log.error(f"Failed to insert {city_info['name']} into cities.ts")
                # Restore backup and stop
                shutil.copy2(backup, CITIES_TS)
                sys.exit(1)

            added_cities.append(city_info['name'])
            log.info(f"  ✓ {city_info['name']} inserted")

        except Exception as e:
            log.error(f"Error generating {city_info['name']}: {e}")
            # Restore backup and stop
            shutil.copy2(backup, CITIES_TS)
            log.info("Restored cities.ts from backup")
            sys.exit(1)

    # Try to build
    if not run_build():
        log.error("Build failed — restoring backup")
        shutil.copy2(backup, CITIES_TS)
        sys.exit(1)

    # Build succeeded — update queue state
    completed_slugs = [c["slug"] for c in batch]
    queue_data["completed"].extend(completed_slugs)
    queue_data["queue"] = pending[BATCH_SIZE:]

    with open(QUEUE_FILE, 'w') as f:
        json.dump(queue_data, f, indent=2, ensure_ascii=False)

    log.info(f"Queue updated. {len(queue_data['queue'])} cities remaining.")

    # Restart PM2
    restart_pm2()

    # Push to GitHub
    git_push(added_cities)

    log.info(f"Done! Added: {added_cities}")
    log.info(f"Cities remaining in queue: {len(queue_data['queue'])}")


if __name__ == "__main__":
    main()
