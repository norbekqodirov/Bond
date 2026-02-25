
# BOND Marketplace Platform

Production-ready marketplace platform for BOND (admin + organizer cabinet + mobile app) with RBAC, i18n, and PostgreSQL.

## Highlights
- **Next.js App Router + TypeScript**
- **Tailwind + shadcn/ui components**
- **i18n** with Uzbek (default), Russian, English via `next-intl`
- **PostgreSQL + Prisma** for RBAC, olympiads, registrations, organizations, finance, and content
- **Admin panel v2** + **Organizer cabinet**
- **OTP-ready auth** (phone) + email/password
- **JWT access + refresh tokens**, Redis for OTP + rate limits
- **Expo mobile app** with catalog, registration, and profile screens

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Postgres + Redis:
   ```bash
   docker compose up -d
   ```
3. Create `.env.local` from `.env.example`:
   ```bash
   copy .env.example .env.local
   ```
4. Update the environment variables:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `PARTICIPANT_PHONE`
   - `PARTICIPANT_PASSWORD`
   - `OTP_TTL_MINUTES`
   - `OTP_RATE_LIMIT`
5. Run Prisma migrations and seed:
   ```bash
   npm run prisma:migrate
   npm run seed
   ```
   If `prisma migrate dev` is blocked in a non-interactive shell, run:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```
6. Start the dev server:
   ```bash
   npm run dev
   ```

## Admin Access (Dev Login)
- URL: `http://localhost:3000/uz/admin/login` (switch locale as needed)
- Uses `ADMIN_EMAIL` + `ADMIN_PASSWORD` from `.env.local`
- Cookies: `bond_access`, `bond_refresh` (httpOnly, sameSite=lax, secure in production)

## Organizer Cabinet (Dev Login)
- URL: `http://localhost:3000/uz/organizer/login`
- Credentials: `organizer@bond.local` / `ChangeMe123!`

## Mobile App (Expo)
```bash
cd mobile
npm install
npx expo start -c
```
- Set API URL:
  - `EXPO_PUBLIC_API_URL="http://localhost:3000"` for web
  - Android emulator: `http://10.0.2.2:3000`
  - iOS simulator: `http://localhost:3000`
  - Real device: `http://<LAN-IP>:3000`
- OTP in dev returns `devCode` from `/api/auth/otp/request`.

## Scripts
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run prisma:migrate` - create/apply migrations
- `npm run seed` - seed sample data
- `npm run test` - run minimal tests
