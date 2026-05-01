# Resume work — reactivate the AllowanceExhaustedModal

The site shipped with U5 dormant (Option A). Free quota, Polar tip jar,
and Beehiiv newsletter unlock are all built and deployed but **inert**
because `ALLOWANCE_MODAL_ENABLED` is not set in Vercel.

Right now the site is "free for everyone, capped by the middleware
500/day cap and the $5/day cost cap." That's the launch state.

To turn the modal on later, do these in order. Stop at any step if
priorities change.

## 1. Run the U5 migration against production

```
cd ~/dev/robo-trope-spotter && npx vercel env pull .env.prod-temp --environment production && DATABASE_URL=$(grep ^DATABASE_URL_UNPOOLED= .env.prod-temp | cut -d= -f2- | tr -d '"') npm run db:migrate && rm .env.prod-temp
```

Adds the `unlocks` table. Pure additive, safe to run any time.

## 2. Set up Polar.sh

1. Sign in at polar.sh, create an organization for Robotropes.
2. Create a "Buy Brent a coffee" product. Recommended: pay-what-you-want pricing. Note the product ID.
3. Add a webhook at `https://robotropes.dxn.is/api/polar/webhook`. Copy the webhook secret.
4. Generate an organization access token. Copy it.
5. Add to Vercel production env:
   - `POLAR_ACCESS_TOKEN`
   - `POLAR_WEBHOOK_SECRET`
   - `POLAR_PRODUCT_ID`
   - `POLAR_ENV=sandbox` while testing, then remove or change for live.

## 3. Set up Beehiiv

1. From AI for FIs publication settings, copy the publication ID.
2. Get an API key (Account Settings → API).
3. Add to Vercel production env:
   - `BEEHIIV_API_KEY`
   - `BEEHIIV_PUBLICATION_ID`

Caveat: the subscribe POST endpoint requires Beehiiv Scale tier or higher per `reference_beehiiv_api_tier_limits.md`. Verify before relying on it. If the tier doesn't expose POST, fall back to a hosted Beehiiv form or swap to a Resend audience.

## 4. Flip the flag

In Vercel production env:

```
ALLOWANCE_MODAL_ENABLED=true
```

Redeploy:

```
cd ~/dev/robo-trope-spotter && npx vercel deploy --prod
```

## 5. Smoke test

Run 5+ analyses to trigger the modal. Try each path: newsletter, Polar sandbox tip, "$0 / no thanks." Confirm unlock works (next analysis runs without showing the modal again). Switch `POLAR_ENV` off sandbox and verify with a real $1 test.

## Rollback

If anything breaks: set `ALLOWANCE_MODAL_ENABLED=false` in Vercel and redeploy. Site returns to launch-state behavior. The unlocks table can stay; it's just unused.
