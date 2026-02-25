# BOND Production Deploy (Debian 13 + Nginx)

Quyidagi tartib Timeweb Cloud VPS (Debian 13) uchun, Nginx bilan bir nechta sayt ishlayotgan holatda mos.

## 1) Server tayyorgarligi
Node.js LTS va PM2 kerak:
```
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm i -g pm2
```

## 2) Loyihani joylash
```
mkdir -p /var/www
cd /var/www
git clone <REPO_URL> bond
cd bond
```

## 3) .env tayyorlash
```
cp .env.production.example .env
```
`.env` ichidagi qiymatlarni serveringizdagi DB va admin login bilan to'ldiring.

## 4) Dependencies va build
```
npm ci
npm run build
```

## 5) Prisma
```
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

## 6) Upload papkalar
```
mkdir -p public/uploads/olympiads public/uploads/articles
chown -R $USER:$USER public/uploads
```

## 7) PM2 bilan start
```
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```
Default port: `3001` (ecosystem.config.cjs ichida).

## 8) Nginx konfiguratsiya
Server block tayyor fayl: `deploy/nginx-bondolympiad.uz.conf`
```
cp deploy/nginx-bondolympiad.uz.conf /etc/nginx/sites-available/bondolympiad.uz
ln -s /etc/nginx/sites-available/bondolympiad.uz /etc/nginx/sites-enabled/bondolympiad.uz
nginx -t
systemctl reload nginx
```

## 9) SSL (Let's Encrypt)
```
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d bondolympiad.uz -d www.bondolympiad.uz
```

## 10) DNS (Ahost)
Ahost panelida domen uchun A record yozing:
- `@` -> SERVER_IP
- `www` -> SERVER_IP

DNS tarqalishi 5-60 daqiqa (ba'zan 24 soat).

## 11) Ishlashni tekshirish
```
pm2 status
curl -I http://bondolympiad.uz
```

## Eslatma
- Agar boshqa sayt ham shu serverda ishlayotgan bo'lsa, u bilan portni to'qnashmasligi uchun port `3001` bo'lib turadi.
- `DATABASE_URL` faqat serverdagi DB ga mos bo'lishi kerak.
