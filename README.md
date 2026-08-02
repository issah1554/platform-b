# Platform B

Simulated market-data API returning commodity prices with TZS and corresponding USD values.

## Endpoints

- `GET /api/prices`
- `GET /api/health`

## Local Development

```bash
npm install
npm run dev
```

Then call:

```bash
curl http://localhost:3002/api/prices
curl http://localhost:3002/api/health
```

## Deploying to Vercel

Deploy this folder as an independent Vercel project:

```bash
vercel
```
