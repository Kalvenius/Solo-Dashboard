# Solo: komanda üçün tapşırıq idarəetməsi

Jira-nın əsas imkanlarını təkrarlayan, öz komandanız üçün quraşdırdığınız sistem. Əlavə olaraq **əməkdaşlar dashboardu** var. İnterfeys azərbaycancadır.

**İmkanlar:** Scrum və Kanban layihələri · Epic / Story / Tapşırıq / Bug / Alt tapşırıq · sürüklə-burax lövhə · backlog və sprintlər · şərhlər, tarixçə, vaxt qeydi, fayllar, əlaqəli tapşırıqlar · filtrlər və CSV ixrac · burndown, velocity, zaman xətti · bildirişlər · qlobal axtarış · admin paneli · **hər əməkdaş üzrə məhsuldarlıq dashboardu** · **3 dil: Azərbaycan, İngilis, Rus** · **qaranlıq rejim**

---

## 🤖 AI agenti üçün quraşdırma təlimatı

> Bu bölmə AI köməkçisinin (Claude Code, Cursor, Codex və s.) addım-addım icra etməsi üçün yazılıb. Hər addımı ardıcıl icra et və sonundakı **yoxlama** keçmədən növbəti addıma keçmə. İnsan da eyni addımları izləyə bilər.

### Addım 0. İstifadəçidən soruş (cavab məlum deyilsə)

1. **Rejim:**
   - **A. Lokal demo.** Sınaq üçün: 7 uydurma əməkdaş, 3 layihə, ~80 tapşırıq.
   - **B. Lokal təmiz.** Öz komandası ilə işləmək üçün boş baza.
   - **C. Server.** Komanda brauzerdən daxil olacaq (Linux server).
2. **C rejimində:**
   - Domen varmı (HTTPS ilə), yoxsa yalnız IP / daxili şəbəkə?
   - Hansı portda işləsin? Default 3000.
3. **Verilənlər bazası:**
   - **SQLite** (default). Heç nə quraşdırmaq lazım deyil, ~30 nəfərlik komanda üçün kifayətdir.
   - **PostgreSQL.** Daha böyük komanda üçün və ya artıq Postgres serveri varsa.

İstifadəçi cavab vermirsə, default: **A rejimi, SQLite, port 3000**.

### Addım 1. Tələbləri yoxla

```bash
node -v      # v20 və ya daha yeni olmalıdır (v22 LTS tövsiyə olunur)
npm -v
git --version
openssl version
```

Node yoxdursa və ya v20-dən köhnədirsə:
- **macOS:** `brew install node@22`
- **Ubuntu/Debian:** `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs`

✅ **Yoxlama:** `node -v` `v20.` və ya daha yüksək göstərir.

### Addım 2. Kodu yüklə

```bash
git clone https://github.com/safaroww/jira-copy.git
cd jira-copy
```

Qalan bütün əmrləri bu qovluqda icra et.

### Addım 3. `.env` faylını yarat

```bash
cp .env.example .env
SECRET=$(openssl rand -hex 32)
# macOS:
sed -i '' "s|^AUTH_SECRET=.*|AUTH_SECRET=\"$SECRET\"|" .env
# Linux:
sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=\"$SECRET\"|" .env
```

✅ **Yoxlama:** `grep AUTH_SECRET .env` dırnaq içində 64 simvollu hex sətir göstərir. Boşdursa, giriş işləməyəcək.

| Dəyişən | Məcburi | İzah |
|---|---|---|
| `DATABASE_URL` | bəli | SQLite üçün `file:./solo.db` (fayl `prisma/solo.db`-də yaranır). PostgreSQL üçün Addım 7.4-ə bax |
| `AUTH_SECRET` | bəli | Sessiya şifrələmə açarı. `openssl rand -hex 32` ilə yarat, heç vaxt paylaşma |
| `TZ` | xeyr | Saat qurşağı, default `Asia/Baku` |
| `INSECURE_COOKIES` | xeyr | `1` yalnız production rejimini **HTTPS-siz** (IP ilə) işlədəndə lazımdır. Addım 7.3-ə bax |
| `PORT` | xeyr | Default 3000 |

### Addım 4. Paketləri quraşdır və bazanı yarat

```bash
npm ci
npx prisma db push
```

Yalnız **A rejimində** (demo) əlavə et:

```bash
npm run db:seed
```

✅ **Yoxlama:**
- `npx prisma db push` "Your database is now in sync" yazır.
- Demo rejimində seed `✔ Demo məlumat yaradıldı` yazır.

### Addım 5. İşə sal

**A və B rejimləri (lokal):**

```bash
npm run dev
```

**C rejimi (server, production):**

```bash
npm run build
npm start          # başqa port üçün: PORT=3001 npm start
```

`npm start` terminalı tutur. Serverdə daimi işləməsi üçün Addım 7.1-ə keç.

### Addım 6. İşlədiyini yoxla

Server işləyərkən başqa terminalda:

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/login
```

| Rejim | Gözlənilən nəticə |
|---|---|
| A (demo) | `200` |
| B, C (təmiz baza) | `307 http://localhost:3000/setup`: ilk admin hələ yaradılmayıb, bu normaldır |

Sonra istifadəçiyə bunları de:
- **A:** `http://localhost:3000` ünvanını açsın. Giriş: **admin@solo.az / parol123**. Digər demo hesablar `aysel@`, `murad@`, `nigar@`, `tural@`, `leyla@`, `kamran@solo.az` ünvanlarıdır, şifrə eynidir.
- **B, C:** ünvanı açsın. Avtomatik `/setup` səhifəsinə yönlənəcək, orada öz admin hesabını yaradacaq. Sonra **İdarəetmə → İstifadəçilər** bölməsindən komanda üzvlərini əlavə edəcək və onlara şifrə verəcək.

### Addım 7. Server quraşdırması (yalnız C rejimi)

#### 7.1. Daimi işləmə (pm2)

```bash
sudo npm install -g pm2
pm2 start npm --name solo -- start
pm2 save
pm2 startup        # çap etdiyi `sudo ...` əmrini də icra et — server yenidən başlayanda avtomatik qalxsın
```

✅ **Yoxlama:** `pm2 status` siyahısında `solo` sətri `online` vəziyyətindədir. Loglar: `pm2 logs solo`.

#### 7.2. Domen + HTTPS (nginx)

`/etc/nginx/sites-available/solo` faylı (`solo.sirket.az` yerinə istifadəçinin domenini yaz):

```nginx
server {
    listen 80;
    server_name solo.sirket.az;
    client_max_body_size 12m;   # fayl yükləmə limiti 10 MB-dır

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/solo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d solo.sirket.az     # pulsuz SSL sertifikatı (Let's Encrypt)
```

✅ **Yoxlama:** `curl -sI https://solo.sirket.az/login` `200` və ya `307` qaytarır.

#### 7.3. Domen olmadan (IP ilə, daxili şəbəkə)

Production rejimində giriş cookie-si yalnız HTTPS üzərindən göndərilir. HTTPS yoxdursa (məs. `http://192.168.1.50:3000`), giriş səhifəsi dövrə girir: daxil olursan, yenə giriş səhifəsinə qayıdır. Həll:

```bash
echo 'INSECURE_COOKIES=1' >> .env
npm run build && pm2 restart solo
```

Bunu yalnız daxili şəbəkədə et. İnternetə açıq serverdə 7.2 (HTTPS) yolunu seç.

#### 7.4. PostgreSQL-ə keçid (istəyə bağlı)

```bash
# 1) Baza və istifadəçi yarat (SIFRE-ni dəyiş)
sudo -u postgres psql -c "CREATE USER solo WITH PASSWORD 'SIFRE';" -c "CREATE DATABASE solo OWNER solo;"

# 2) Provider-i dəyiş (Linux; macOS-da sed -i '')
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

# 3) .env-də DATABASE_URL-i dəyiş
sed -i 's|^DATABASE_URL=.*|DATABASE_URL="postgresql://solo:SIFRE@localhost:5432/solo"|' .env

# 4) Cədvəlləri yarat və yenidən build et
npx prisma db push
npm run build
```

Qeydlər:
- SQLite-dakı mövcud məlumat avtomatik köçmür. Keçidi ən yaxşısı başlanğıcda et.
- `schema.prisma` dəyişikliyi git-də görünəcək. Sonrakı `git pull`-larda bu sətri qoruyub saxla.

#### 7.5. Ehtiyat nüsxə (backup)

İki şey saxlanılmalıdır: **baza** və **`uploads/` qovluğu** (yüklənən fayllar).

```bash
mkdir -p ~/solo-backup
sqlite3 prisma/solo.db ".backup '$HOME/solo-backup/solo-$(date +%F).db'"   # SQLite
# PostgreSQL: pg_dump -U solo solo > ~/solo-backup/solo-$(date +%F).sql
tar czf ~/solo-backup/uploads-$(date +%F).tgz uploads 2>/dev/null || true
```

Gündəlik avtomatik backup üçün bu əmrləri `crontab -e` ilə cron-a əlavə et.

#### 7.6. Yeniləmə (kodda dəyişiklik olanda)

```bash
git pull
npm ci
npx prisma db push      # məlumat itkisi barədə xəbərdarlıq çıxsa — DAYAN və istifadəçidən soruş
npm run build
pm2 restart solo
```

#### 7.7. Docker (alternativ)

`Dockerfile` mövcuddur, amma sınaqdan keçirilməyib. Mümkünsə 7.1 (pm2) yolundan istifadə et.

```bash
docker build -t solo .
docker run -d -p 3000:3000 -v solo-data:/app/data -v solo-uploads:/app/uploads -e AUTH_SECRET="$(openssl rand -hex 32)" --name solo solo
```

### AI agenti üçün qaydalar

- `.env`, `prisma/*.db` və `uploads/` faylları **heç vaxt** git-ə commit edilməməlidir (`.gitignore`-da var).
- **Bazanı sıfırlama.** `npm run db:reset`, `prisma db push --force-reset` və ya `.db` faylını silmək bütün məlumatı məhv edir. Bunları yalnız istifadəçinin açıq razılığı ilə et. Prisma özü də AI-dan razılıq tələb edir.
- `npm run db:seed` yalnız boş bazada işləyir. Doludursa, heç nə etmir və bunu bildirir.
- Kodda dəyişiklik etsən, bitirməzdən əvvəl `npm run typecheck && npm run build` keçməlidir.
- Tapşırıq sahələrini dəyişən hər yeni kod `src/lib/issue-service.ts` faylındakı `applyIssueUpdate` funksiyasından keçməlidir. Əks halda tarixçə yazılmır və dashboard rəqəmləri səhv çıxır. Yeni tapşırıq `createIssueRecord` funksiyası ilə yaradılır.
- Mətn axtarışında `mode: "insensitive"` yazma, `textContains()` (`src/lib/db.ts`) istifadə et. Belə olanda kod həm SQLite, həm PostgreSQL ilə işləyir.
- **Interfeys mətnlərini koda birbaşa yazma.** Hər mətn `src/i18n/messages/<namespace>.ts` faylında hər üç dildə (az, en, ru) olmalıdır. Biri çatışmasa, TypeScript xəta verir. Server komponentində `const t = await getT("ns")`, client komponentində `const t = useT("ns")` istifadə et. Tarix və rəqəmlər üçün `getFormat()` / `useFormat()` var.
- **Sabit rəng yazma** (`#fff`, `bg-white`, `text-[#...]`). Tailwind tokenlərindən istifadə et (`text-ink`, `bg-surface-raised`, `border-line`, `bg-danger-subtle` və s., siyahı `tailwind.config.ts`-dədir). Belə olanda işıqlı və qaranlıq rejim avtomatik işləyir.

### Problemlər və həlləri

| Əlamət | Səbəb | Həll |
|---|---|---|
| Daxil olandan sonra yenə giriş səhifəsinə qaytarır | Production rejimi HTTPS-siz işləyir | Addım 7.3: `INSECURE_COOKIES=1`, sonra rebuild və restart |
| Girişdə xəta. Logda `AUTH_SECRET .env faylında təyin edilməyib` | `.env`-də açar boşdur | Addım 3-ü təkrarla, serveri yenidən başlat |
| `@prisma/client did not initialize yet` | Prisma client generasiya olunmayıb | `npx prisma generate` |
| `The table ... does not exist` | Baza yaradılmayıb | `npx prisma db push` |
| `EADDRINUSE: address already in use :::3000` | Port məşğuldur | `PORT=3001 npm start` (və ya `npm run dev -- -p 3001`). nginx `proxy_pass` portunu da dəyiş |
| `Baza artıq doludur` (seed zamanı) | Seed yalnız boş bazaya yazır | Normaldır. Demo məlumat artıq var |
| Fayl yükləmə 413 xətası verir | nginx limiti kiçikdir | nginx konfiqində `client_max_body_size 12m;` |
| Tarixlər bir neçə saat sürüşük görünür | Serverin saat qurşağı fərqlidir | `.env`-də `TZ="Asia/Baku"` olduğunu yoxla, restart et |
| Node versiya xətası / sintaksis xətası | Node 20-dən köhnədir | Addım 1 |

---

## İstifadə

### Rollar

| Rol | İmkanlar |
|---|---|
| **Sistem admini** | Hər şey: istifadəçilər, layihə yaratmaq, bütün layihələr, bütün əməkdaşların dashboardu |
| **Layihə admini** | Öz layihəsinin parametrləri və üzvləri |
| **Üzv** | Üzv olduğu layihələrdə işləmək. Yalnız öz dashboardunu görür |

### Əməkdaşlar dashboardu

Yuxarı menyudakı **Əməkdaşlar** bölməsi. Dövr seçimi var (7 / 14 / 30 / 90 gün), istəsəniz bir layihəyə görə də filtrləyə bilərsiniz.

- **Komanda cədvəli** hər əməkdaş üçün bunları göstərir:
  - açıq, icrada və yoxlamada olan tapşırıqlar
  - tamamlanan tapşırıqlar və story point
  - işlənən saat
  - gecikən işlər və vaxtında tamamlama faizi
  - orta həll müddəti
  - əvvəlki dövrlə müqayisə
- **Şəxsi səhifə** (`/people/<id>`): gündəlik aktivlik xəritəsi, həftəlik qrafiklər, cari işlər, son aktivlik və vaxt qeydləri.

Bütün rəqəmlər tapşırıqların status tarixçəsindən və vaxt qeydlərindən avtomatik hesablanır. Metrikaların dəqiq tərifləri `src/lib/metrics.ts` faylındadır.

### Dil və görünüş

Hər istifadəçi öz dilini (**AZ / EN / RU**) və görünüşü (**açıq / qaranlıq / sistem**) seçə bilər. Seçim yeri: sağ yuxarıdakı profil menyusu, **Profil** səhifəsi və ya giriş səhifəsi. Seçim brauzerdə yadda qalır. İlk girişdə dil brauzerin dilinə görə təyin olunur, uyğun gəlməzsə azərbaycanca açılır.

### Klaviatura qısayolları

| Düymə | Nə edir |
|---|---|
| `c` | Yeni tapşırıq yarat |
| `/` | Axtarışa keç |
| `Esc` | Pəncərəni bağla |

---

## Texniki məlumat

- **Stack:** Next.js 15 (App Router, Server Actions) · React 19 · TypeScript · Prisma 6 · SQLite / PostgreSQL · Tailwind CSS 3 · dnd-kit · Recharts
- **Dillər:** `src/i18n/`. Hər bölmənin öz tərcümə faylı var (`messages/*.ts`). Seçilən dil `solo_locale` cookie-sində saxlanılır.
- **Qaranlıq rejim:** rənglər `src/app/globals.css` faylında CSS dəyişənləri kimi təyin olunub (`:root` işıqlı, `.dark` qaranlıq). Seçim `solo_theme` cookie-sində saxlanılır.
- **Giriş:** öz sistemi. Şifrələr bcrypt ilə saxlanılır, sessiya JWT ilə httpOnly cookie-də (`src/lib/session.ts`, `src/lib/auth.ts`, `src/middleware.ts`).

| Qovluq / fayl | Məzmun |
|---|---|
| `prisma/schema.prisma` | Verilənlər bazası sxemi |
| `prisma/seed.ts` | Demo məlumat |
| `src/app/(auth)/` | Giriş, ilk quraşdırma |
| `src/app/(app)/` | Bütün səhifələr: `your-work`, `projects/[key]/{board,backlog,list,timeline,reports,settings}`, `browse/[issueKey]`, `issues`, `people`, `admin/users`, `profile` |
| `src/app/api/` | Fayl yükləmə/endirmə, CSV ixrac |
| `src/lib/actions/` | Server actions: dəyişiklik edən bütün əməliyyatlar |
| `src/lib/issue-service.ts` | Tapşırıq yaratma/yeniləmə məntiqi (tarixçə, bildirişlər, statuslar) |
| `src/lib/metrics.ts` | Dashboard və hesabat metrikaları |
| `src/components/` | UI komponentləri |
| `src/i18n/` | Dil sistemi və tərcümələr (`messages/` — hər bölmə üçün az/en/ru) |

| Əmr | Nə edir |
|---|---|
| `npm run dev` | İnkişaf serveri |
| `npm run build` / `npm start` | Production build və işə salma |
| `npm run typecheck` | TypeScript yoxlaması |
| `npm run db:seed` | Demo məlumat (yalnız boş bazaya) |
| `npm run db:studio` | Bazaya brauzerdən baxmaq (Prisma Studio) |
| `npm run db:reset` | ⚠️ Bazanı silib demo məlumatla yenidən doldurur |
