# 🎂 Medo Birthday Celebration

موقع احتفالي فاخر بعيد ميلاد ميدو مع Backend حقيقي وقاعدة بيانات SQLite مجانية وألعاب أونلاين!

## 🚀 التشغيل السريع

### الطريقة 1: Railway (مجاني + $5 شهرياً) ⭐ **الأفضل**
1. سجل في [Railway.app](https://railway.app)
2. أنشئ **New Project** → **Deploy from GitHub**
3. ارفع المشروع على GitHub واربطه
4. Railway هيبني ويشغل تلقائياً!
5. خد الرابط وشاركه 🎉

### الطريقة 2: Render.com (مجاني)
1. سجل في [Render.com](https://render.com)
2. أنشئ **New Web Service**
3. ارفع الملفات
4. **Build Command:** `cd server && npm install && cd ../client && npm install && npm run build`
5. **Start Command:** `cd server && node server.js`
6. **Environment Variables:**
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = أي نص عشوائي طويل
7. اضغط **Deploy**

### الطريقة 3: Fly.io (مجاني)
```bash
# سجل في fly.io ونزل CLI
flyctl auth login

# من مجلد المشروع
flyctl launch
flyctl deploy
```

### الطريقة 4: Docker (على أي VPS)
```bash
docker-compose up -d
```

### الطريقة 5: Development (على جهازك)
```bash
# السيرفر
cd server
cp .env.example .env
npm install
npm start

# العميل (Terminal تاني)
cd client
npm install
npm run dev
```

---

## 🗂️ هيكل المشروع

```
medo-birthday/
├── README.md
├── .gitignore
├── docker-compose.yml
├── render.yaml              # Render Blueprint
├── railway.json             # Railway Config
├── nixpacks.toml            # Railway Build
├── server/                  # 🔧 Backend
│   ├── server.js            # Express + Socket.io + SQLite
│   ├── package.json
│   ├── Procfile             # Render/Heroku
│   ├── Dockerfile
│   └── .env.example
└── client/                  # 🎨 Frontend
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env                 # Dev
    ├── .env.production      # Production
    ├── Dockerfile
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        └── components/
            ├── LoginScreen.jsx
            ├── LoadingScreen.jsx
            ├── HeroSection.jsx
            ├── CakeSection.jsx
            ├── ChatSection.jsx      💬 شات Socket.io
            ├── GamesSection.jsx
            ├── VideoSearchSection.jsx
            ├── MemoriesSection.jsx
            ├── MusicControl.jsx
            ├── Navigation.jsx
            ├── ParticlesBackground.jsx
            ├── Fireworks.jsx
            └── games/
                ├── QuickClickGame.jsx
                ├── CatchCakeGame.jsx
                ├── PopBalloonsGame.jsx
                ├── QuizGame.jsx
                ├── TicTacToe.jsx         ⭕ XO أونلاين
                └── ChessGame.jsx         ♟️ شطرنج أونلاين
```

## ✨ الميزات

### 🔐 تسجيل الدخول
- JWT Authentication
- bcryptjs Hashing
- SQLite Database (مجاني 100%)

### 💬 الشات المباشر
- Socket.io Real-Time
- مؤشر الكتابة
- قائمة المتصلين
- حفظ الرسائل في SQLite

### 🎮 الألعاب
| اللعبة | النوع |
|--------|-------|
| 🎯 اضغط بسرعة | فردي |
| 🎂 التقاط الكعكات | فردي |
| 🎈 فرقع البالونات | فردي |
| 🧠 مسابقة عيد الميلاد | فردي |
| ⭕ XO | أونلاين 2 لاعب |
| ♟️ شطرنج | أونلاين 2 لاعب |

### 🎵 الموسيقى
- Tone.js Synthesizer
- موسيقى احتفالية

## 🔧 التقنيات

**Backend:**
- Node.js + Express
- Socket.io (Real-Time)
- SQLite (better-sqlite3) - مجاني!
- bcryptjs + JWT
- Helmet + Rate Limiting

**Frontend:**
- React 18 + Vite
- Socket.io Client
- Canvas Confetti
- Tone.js

## 💾 قاعدة البيانات

**SQLite** - ملف محلي مجاني!
- مش محتاج MongoDB Atlas
- مش محتاج أي اشتراك
- البيانات تتحفظ في ملف `medo_birthday.db`
- سريع وخفيف

## 🎉 عيد ميلاد سعيد يا ميدو! 🎂
