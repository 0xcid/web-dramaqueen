# DramaQueen - Streaming Drama Korea

Website streaming drama Korea dengan UI mobile-first, didesain untuk dijalankan sebagai Telegram Mini App.

## Tech Stack

- **Framework**: Nuxt.js 3
- **Styling**: Tailwind CSS
- **Deployment**: Cloudflare Pages
- **Storage**: Cloudflare KV
- **Video Player**: HTML5 Video

## Features

### Core Features
- **Streaming Video** - Putar video drama dengan player built-in
- **Auto Play Modal** - Drama langsung diputar saat diklik tanpa ke halaman detail
- **Telegram Mini App** - Integrasi dengan Telegram WebApp API
- **Dark/Light Mode** - Toggle tema dengan preferensi sistem

### User Features
- **Bookmark/Favorites** - Simpan drama favorit
- **Watch History** - Riwayat tontonan dengan progress
- **Continue Watching** - Lanjutkan dari episode terakhir
- **Search** - Pencarian drama dengan auto-suggest

### Cronjob Features
- **Episode Notification** - Notifikasi ke Telegram Channel saat ada episode baru
- **Ongoing Drama Monitor** - Otomatis mendeteksi drama yang masih ongoing
- **State Persistence** - Simpan state di Cloudflare KV

## Getting Started

### Prerequisites

- Node.js 18+
- npm atau yarn
- Cloudflare account
- Telegram Bot Token dan Channel ID (untuk notifikasi)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd dramaqueen

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Configuration

Edit `.env` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=@your_channel_or_chat_id

# API Configuration
NUXT_PUBLIC_API_BASE=https://dramaqueen.iseries.my.id/api
```

### Development

```bash
# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build
```

## Deployment to Cloudflare Pages

### Step 1: Create KV Namespace

```bash
# Login to Cloudflare
npx wrangler login

# Create KV namespace
npx wrangler kv:namespace create DRAMA_KV
```

Copy the ID yang dihasilkan dan update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "DRAMA_KV"
id = "your-actual-kv-id"
```

### Step 2: Create Telegram Bot

1. Buka [@BotFather](https://t.me/BotFather) di Telegram
2. Kirim `/newbot` dan ikuti instruksi
3. Copy bot token yang diberikan

### Step 3: Get Channel ID

1. Buat channel atau gunakan channel yang sudah ada
2. Add bot sebagai admin di channel
3. Kirim pesan ke channel
4. Akses `https://api.telegram.org/bot<TOKEN>/getUpdates` untuk mendapatkan channel ID

### Step 4: Deploy

```bash
# Deploy to Cloudflare Pages
npm run deploy
```

Atau via Cloudflare Dashboard:
1. Connect repository ke Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables di Settings > Environment Variables

### Step 5: Setup Cron Triggers

Di Cloudflare Dashboard:
1. Buka Workers & Pages > dramaqueen
2. Settings > Triggers
3. Add Cron Trigger: `*/10 * * * *` (setiap 10 menit)

## API Endpoints

### Cron Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cron/notify` | GET | Cek episode baru dan kirim notifikasi |
| `/api/cron/state` | GET | Lihat state drama yang di-monitor |

## Project Structure

```
dramaqueen/
├── app.vue                 # Root component
├── nuxt.config.ts          # Nuxt configuration
├── tailwind.config.js      # Tailwind configuration
├── wrangler.toml           # Cloudflare configuration
├── pages/
│   ├── index.vue           # Home page
│   ├── drama/
│   │   ├── index.vue       # Drama list
│   │   └── [id].vue        # Drama detail
│   ├── search.vue          # Search page
│   ├── favorites.vue       # Favorites page
│   └── history.vue         # History page
├── components/
│   ├── DramaCard.vue       # Drama card component
│   ├── VideoPlayer.vue     # Video player component
│   ├── EpisodeList.vue     # Episode list component
│   ├── PlayModal.vue       # Play modal component
│   ├── Navbar.vue          # Navigation bar
│   ├── BottomNav.vue       # Bottom navigation
│   ├── SearchBar.vue       # Search bar component
│   └── SearchModal.vue     # Search modal component
├── composables/
│   ├── useApi.ts           # API composable
│   ├── useFavorites.ts     # Favorites composable
│   ├── useHistory.ts       # History composable
│   ├── useTelegram.ts      # Telegram composable
│   └── useTheme.ts         # Theme composable
├── server/
│   ├── api/cron/
│   │   ├── notify.ts       # Cron notification endpoint
│   │   └── state.ts        # Cron state endpoint
│   ├── plugins/
│   │   └── cron.ts         # Cron plugin
│   └── utils/
│       ├── telegram.ts     # Telegram utilities
│       └── dramaApi.ts     # Drama API utilities
└── types/
    └── index.ts            # TypeScript types
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Yes (for cron) |
| `TELEGRAM_CHANNEL_ID` | Telegram channel ID | Yes (for cron) |
| `NUXT_PUBLIC_API_BASE` | Drama API base URL | No (default provided) |
| `CRON_SECRET` | Secret for cron API | No |

## License

MIT
