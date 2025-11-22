Postgres + Prisma setup

1) Install dependencies (in backend):

```bash
cd backend
npm install prisma @prisma/client
```

2) Create .env from .env.example and set DATABASE_URL to your Postgres instance.

3) Generate Prisma client and run initial migration:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4) (Optional) Open Prisma Studio:

```bash
npx prisma studio
```

Notes
- The Prisma schema is at `backend/prisma/schema.prisma`.
- A lightweight `src/lib/prisma.ts` client wrapper was added; import it with `import prisma from './lib/prisma'`.
