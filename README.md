# Platform B

Simulated market-data API returning commodity prices in GHS.

## Endpoints

- `GET /api/prices`
- `GET /api/health`

## Local Development

```bash
npm install
npm run dev -- --port 3102
```

Then call:

```bash
curl http://localhost:3102/api/prices
curl http://localhost:3102/api/health
```

## Deploying to Vercel

Deploy this folder as an independent Vercel project:

```bash
vercel
```
