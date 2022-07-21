[![GitPOAP Badge](https://public-api.gitpoap.io/v1/repo/Examp-LLC/ethrank/badge)](https://www.gitpoap.io/gh/Examp-LLC/ethrank)

# ethrank.io 🏆

The Ethereum Leaderboard

## Getting Started

See [this tweet](https://twitter.com/blankey1337/status/1478051718617198593) for an overview of how this site was built.

## Setup a PlanetScale account
This app uses a remote MySQL database via a service called PlanetScale.
Please register an account at https://planetscale.com/ and create a DB to get started.

## Update .env.development with your API keys

## Install Dependencies
```bash
npm install
```

## Connect to PlanetScale DB
```bash
pscale auth login
pscale connect ethrank main --port 3309
```

If this is your first time, you may need to run `npx prisma migrate dev`

## Run the dev server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
