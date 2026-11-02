# Productive Day

Daily tracker for prayer, training, nutrition and your day plan, with a coach, phone-number sign-in and Telegram reminders.

- **Sign in** with a phone number and a 6-digit SMS code (Twilio Verify).
- **Telegram reminders:** at each prayer time, your plan at 07:30 and an evening check-in at 21:30 (the user's local time).
- **Sharing:** send anyone the link. Each person signs in with their own number and gets a private tracker.
- **Hosting:** one Cloudflare Worker (free plan) with a D1 database. It serves the app and the API and runs the reminders every 5 minutes.

The UI is shared with the portfolio repo's `app/life` and `lib/life`, so this folder only has the server (`worker/`), the sign-in and account screens (`web/`) and the build.

## One-time setup (about 20 minutes)

You need three free accounts. SMS itself is paid; see the Twilio note.

### 1. Telegram bot
1. In Telegram, open **@BotFather** and send `/newbot`.
2. Pick a name (e.g. *Productive Day*) and a username ending in `bot` (e.g. `AyoubProductiveBot`).
3. Copy the **token** it gives you. It's a password: don't share it or paste it anywhere public.

### 2. Twilio (SMS codes)
1. Sign up at twilio.com.
2. In the Console, open **Verify → Services → Create new**, name it *Productive Day*, and turn on the SMS channel.
3. Note the **Account SID**, **Auth Token** (Console home) and the **Verify Service SID** (starts with `VA`).
4. Under **Messaging → Settings → Geo permissions**, enable **Morocco** and any other countries you'll use.
5. A trial account can only text numbers you've verified in Twilio. To let anyone sign in, upgrade the account. Each verification costs about $0.05 plus the SMS price for the country.

### 3. Cloudflare
1. Sign up at dash.cloudflare.com (free plan).
2. On your computer (Node.js 20 or newer):

```bash
git clone https://github.com/safwanesalihi/Ayoub-Lamhamdi-portfolio.git
cd Ayoub-Lamhamdi-portfolio
git checkout claude/daily-tracking-platform-p74bp4
npm install            # the app's UI dependencies live in the repo root
cd tracker
npm install
npx wrangler login     # opens the browser to authorize Cloudflare
npx wrangler d1 create productive-day
```

3. Copy the `database_id` it prints into `wrangler.toml`. Set `TELEGRAM_BOT_USERNAME` there to your bot's username, without the `@`.
4. Create the tables and add the secrets. Each `secret put` asks you to paste the value:

```bash
npm run db:init
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET   # any long random text, e.g. from: openssl rand -hex 24
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_VERIFY_SID
npm run deploy
```

`deploy` prints your site's address, e.g. `https://productive-day.<your-subdomain>.workers.dev`.

5. Point Telegram at your site. Use the same webhook secret as above:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://productive-day.<your-subdomain>.workers.dev/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

It should answer `{"ok":true,...}`.

### 4. Use it
- Open the site on your phone and sign in with your number.
- In Safari, tap **Share → Add to Home Screen**. On Android, use Chrome **⋮ → Add to Home screen**.
- Go to **Settings → Connect Telegram** and tap **Start** in the bot.
- **Bring your data from the claude.ai version:** there, go to Settings → **Export backup**. Here, go to Settings → **Import backup**.
- Invite people with **Settings → Invite someone**.

## Updating

After pulling new code, run `npm run deploy` in `tracker/`.

## Local development

```bash
cd tracker
printf 'OTP_MODE=dev\n' > .dev.vars      # codes are printed in the terminal instead of sent by SMS
npm run db:init:local
npm run dev                               # http://localhost:8787
```

Never set `OTP_MODE=dev` on the deployed site. Anyone could then sign in as any number by reading the logs.

## How it works

| Piece | Where |
| --- | --- |
| API (sign-in, sync, Telegram linking) | `worker/index.ts` |
| SMS codes (Twilio Verify) and phone number formats | `worker/sms.ts` |
| Reminders (cron every 5 minutes) | `worker/notify.ts` |
| Database tables | `schema.sql` |
| Sign-in and account screens | `web/main.tsx` |
| Tracker UI, coach, plans, prayer-time maths | `../app/life`, `../lib/life` |

- Sessions are random tokens in an HttpOnly cookie; only their SHA-256 hash is stored. They last 90 days.
- Code requests are rate-limited to 5 per number per hour and 20 per IP per hour. Code checks are limited to 10 per number per hour.
- Prayer times use the Moroccan Ministry parameters: Fajr 19°, Isha 17°, Dhuhr and Maghrib +5 min.
- Reminders use the UTC offset reported by each user's phone. They don't depend on the server's time-zone data, which can lag behind real changes. For example, Morocco moved from UTC+1 to UTC+0 on 20 September 2026.
