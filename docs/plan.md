# Monad Parallel Vision — Implementation Plan

> **For agentic workers:** Use `skills/writing-plans` and `skills/executing-plans` to implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Block Explorer + Performance Dashboard that visualizes Monad's Optimistic Parallel Execution for developers and hackathon judges. 
*Note: First, read skills.devnads.com, rethink the project architecture and integrate it fully on Monad using the best practices and skills provided.*

**Architecture:** Next.js 15 App Router frontend with viem for blockchain reads, Foundry for any smart contracts, deployed to Vercel via the monskills vercel-deploy script (no CLI needed). All blockchain interaction uses the monskills `scaffold` pattern: contracts first, then frontend.

**Tech Stack:** Next.js 15, TypeScript (ES2020), Tailwind CSS, shadcn/ui, RainbowKit + Wagmi v3 + viem, TanStack Query, Framer Motion, Tremor charts

**Monad Testnet:** RPC `https://testnet-rpc.monad.xyz` · Chain ID `10143` · Explorer `testnet.monadscan.com`

---

# MONAD PARALLEL VISION
## Hackathon Proje Planı & Vibe Coding Yol Haritası

> **Kategori:** Infrastructure / Dev Tools
> **Stack:** Next.js 15 + viem + Monad Testnet
> **Target:** Hackathon Birinciliği

| Ana Faz | Tahmini Süre | Deploy |
|---------|-------------|--------|
| 6 | ~8 saat | Vercel (otomatik) |

> **BU DOSYA NASIL KULLANILIR:** Her faz sırasıyla tamamlanır. Prompt bloklarını olduğu gibi Cursor / Claude / Windsurf'e yapıştır. `KILLER` etiketli görevler demo'nun kalbi — bunları atlama.

---

## 1. Proje Özet Analizi

### Ne yapıyor?

Monad Parallel Vision, Monad blockchain'in en kritik teknik özelliği olan **Optimistic Parallel Execution**'ı görsel olarak somutlaştıran bir Block Explorer + Performance Dashboard uygulamasıdır. Standart explorer'ların (sadece tx listesi, blok bilgisi) çok ötesine geçerek geliştiricilere şunu gösterir: bloklarındaki işlemlerin kaçı gerçekten paralel çalışıyor, kontratları Monad'dan ne kadar fayda sağlıyor?

### Neden hackathon'da öne çıkar?

- **Görsel anlatım gücü:** Monad'ın soyut teknik avantajını canlı animasyonlar ve grafiklerle somutlaştırıyor. Jüriler teknik detayı okumak yerine görüyor.
- **İlk yapan olma avantajı:** Mevcut explorer'lar bu görselleştirmeyi yapmıyor. Monad'daki parallel execution'ı bu kadar anlaşılır gösteren araç yok.
- **Gerçek fayda:** Diğer geliştiriciler kendi kontratlarını analiz etmek için gerçekten kullanmak ister — sadece hackathon demosu değil.
- **Demo etkisi:** Ethereum vs Monad yan yana animasyonu, TX Timeline ve Wallet Tracker jüri önünde "aha moment" yaratır.

### Hedef Kitle

Monad üzerinde geliştiren Solidity geliştiricileri, dApp builder'ları, hackathon katılımcıları ve Monad ekosistemini araştıran yatırımcılar.

---

## 2. Beyin Fırtınası — Ne Ekle, Ne Çıkar

### ✅ Kesinlikle Eklenecekler

#### `[KILLER]` Ethereum vs Monad Animasyonu
Landing page'de yan yana animasyon: solda tx'ler birer birer sıralı işleniyor, sağda hepsi aynı anda parlıyor. 5 saniyelik döngü. Bu tek başına viral olabilir ve jürinin aklında kalır.

#### Live Block Feed
Sayfa açıkken yeni bloklar polling ile otomatik üst'e eklenir, smooth animasyonla. Canlılık hissi oluşturur — "Monad gerçekten hızlı" duygusunu verir.

#### Parallel Score Tooltip Açıklaması
Her blok kartında "Bu blok neden %87 parallel?" sorusunu cevaplayan hover tooltip. Hem eğitici hem de projeyi daha derin gösterir.

#### `[KILLER]` Wallet Tracker
Kullanıcı kendi cüzdan adresini girer, son 20 tx'inin Monad'daki parallel efficiency skoru ve gas optimizasyon analizi çıkar. Demo sırasında kendi adresini girmek = kişiselleştirilmiş wow moment.

#### `[WOW]` Shareable Block Report
`/block/[id]` sayfası OG meta tags ile. "Monad block #12345 achieved 94% parallel efficiency" tweet'i atılabilir hale gelir.

#### Network Health Header
Her sayfanın üstünde canlı: TPS, avg block time, network-wide parallel efficiency. Ziyaretçi açar açmaz Monad'ın hızını görür.

#### Demo Mode Toggle
`USE_MOCK_DATA=true` env değişkeni ile tüm veri pre-baked JSON'dan gelir. RPC down olduğunda demo kurtarır. UI'da küçük "demo mode" rozeti yeter.

---

### ❌ Çıkarılacaklar / Basitleştirilecekler

**FastAPI / NestJS Backend**
Tamamen gereksiz. Next.js API Routes + Server Actions yeterli. Hackathon süresinde ayrı backend kurmak zaman katliamıdır.

**React Flow Dependency Graph**
Görsel etkisi yüksek ama geliştirme süresi çok uzun. MVP'de yok, zamanın 2. gün artarsa ekle.

**Gerçek Conflict Detection**
Monad RPC şu an bunu expose etmiyor. Simüle et. README'de dürüstçe açıkla: "Heuristic-based score." Jüriler bunu anlar ve takdir eder.

**"Run Benchmark" Sahte Butonu**
Tamamen fake data yerine "Son 50 blok ortalaması" göster. Gerçek data daha etkileyici, daha dürüst.

---

## 3. Teknik Mimari & Tech Stack

### Seçilen Stack ve Gerekçeleri

| Katman | Teknoloji | Neden? |
|--------|-----------|--------|
| Framework | Next.js 15 App Router | Server Components, Streaming, en iyi perf, Vercel deploy kolay |
| UI | Tailwind CSS + shadcn/ui | En hızlı komponent geliştirme, erişilebilir, dark mode hazır |
| Blockchain | viem | ethers.js'ten modern, TypeScript-first, Monad compat |
| Data Fetching | TanStack Query | Polling, caching, rate limit koruması, loading states |
| Charts | Tremor | Recharts'tan daha az kod, daha iyi default görünüm |
| Animasyon | Framer Motion | Block feed, TX timeline, hero animasyonları için |
| Deploy | Vercel | Her push'ta otomatik, ücretsiz, demo linki hazır |
| Icons | lucide-react | shadcn/ui ile tam uyumlu |

### Monad Testnet Bağlantı Bilgileri

| | |
|--|--|
| **RPC Endpoint** | `https://testnet-rpc.monad.xyz` |
| **Chain ID** | `10143` |
| **Explorer** | `https://testnet.monadexplorer.com` |
| **Test Token** | `faucet.monad.xyz` |
| **RPC Alternatifi** | QuickNode veya Ankr üzerinden Monad Testnet |

### Dizin Yapısı (Önerilen)

```
/app
  /                      → Landing / Hero
  /explorer              → Blok listesi (canlı feed)
  /explorer/[block]      → Blok detay + TX Timeline
  /dashboard             → Metrics + Wallet Tracker
  /docs                  → Parallel execution açıklaması

/lib
  monad.ts               → viem client + tüm blockchain fonksiyonları
  mockData.ts            → Demo mode verileri
  parallelScore.ts       → Skor algoritması

/components
  /ui                    → shadcn bileşenleri
  /charts                → Tremor chart wrapper'ları
  /blocks                → BlockCard, Heatmap, TxTimeline
```

---

## 4. Vibe Coding Yol Haritası — Faz Faz

> **KURAL:** Her faz'ın prompt'unu AI agent'a ver → çalıştığını doğrula → sonraki faza geç. Fazı bitmeden sonrakine atlama. Düzeltmeye takılma, ilerle.

---

### FAZ 0 — Hazırlık & Ortam Kurulumu
**Süre: ~30 dk | Önce tamamla**

- [ ] `skills.devnads.com` adresini incele ve projeyi Monad üzerinde entegre etmek için gerekli yetenekleri (skills) belirleyerek yapıyı yeniden düşün.
  - → AI destekli Monad geliştirme paketi (Monskills) kullanılacak. Projeyi scaffold etmek, kontrat yüklemek ve Vercel'e deploy etmek için bu AI yetenekleri temel alınacak.
- [ ] Monad Testnet RPC endpoint al (`testnet-rpc.monad.xyz`)
  - → Chain ID 10143 — Metamask'a ekle, 1-2 test tx gönder, explorer'da görünüyor mu doğrula
- [ ] GitHub repo oluştur, Vercel'e bağla
  - → Her push'ta otomatik deploy aktif olsun — demo linki en baştan hazır
- [ ] 3-4 farklı test kontratı deploy et (ERC20, Counter, NFT mint)
  - → Demo sırasında "bu benim kontratım" diyebilmek için kendi data'n olsun
- [ ] `next.config.ts`'e env variable şablonu koy: `USE_MOCK_DATA`, `MONAD_RPC_URL`
  - → Demo mode için en baştan hazırla, sonra unutursun

---

### FAZ 1 — Proje İskeleti + UI Framework
**Süre: ~45 dk | Prompt 1**

**AI AGENT PROMPT:**
```
Next.js 15 App Router, TypeScript strict mode, Tailwind CSS, shadcn/ui
kurulumu yap. next-themes ile dark mode zorunlu (default dark).
Navigation: Home, Explorer, Dashboard, Docs.
Layout: sol tarafta animated sidebar, sag tarafta content area.
Header'da canlı network stats bar (TPS, block time, parallel efficiency - 
simdi mock data). Glassmorphism dark blockchain temasi.
lucide-react ve framer-motion yukle.
/app dizin yapisini olustur: /, /explorer, /explorer/[block], /dashboard.
```

**Görevler:**
- [ ] Sonucu kontrol et: dark mode, nav linkleri, responsive çalışıyor mu
- [ ] `[KILLER]` Ethereum vs Monad hero animasyonu — landing page'e ekle
  - → Sol: tx'ler birer birer sıralı ışıyor. Sağ: hepsi aynı anda parlıyor. 5 sn döngü. Framer Motion ile.
- [ ] Network Health Header: TPS, block time, parallel efficiency (mock data ile başla)

---

### FAZ 2 — Blockchain Veri Katmanı
**Süre: ~60 dk | Prompt 2**

**AI AGENT PROMPT:**
```
viem ile Monad public client olustur (RPC: process.env.MONAD_RPC_URL).
lib/monad.ts dosyasina su fonksiyonlari yaz:
  - getLatestBlocks(limit: number)
  - getBlockDetail(blockNumber)
  - getBlockReceipts(blockNumber)
  - getParallelScore(block) → tx sayisi + gas variance + inter-tx timing'e
    gore 0-100 arasi skor uretsin

TanStack Query ile tum fonksiyonlar icin custom hook'lar yaz:
  - useLatestBlocks, useBlockDetail, useParallelScore
  - 3 saniye polling, 30 saniye stale time

lib/mockData.ts dosyasinda USE_MOCK_DATA=true iken devreye giren
sample data ekle. Tum TypeScript tipleri yaz.
```

**Parallel Score Algoritması:**
```
tx sayısı       → 40% ağırlık
gas variance    → 35% ağırlık
block utiliz.   → 25% ağırlık

0–60   → kırmızı  (low parallel)
61–80  → sarı     (medium parallel)
81–100 → yeşil    (high parallel)
```

**Görevler:**
- [ ] Rate limit koruması + error boundary
  - → RPC down olduğunda mock data'ya fallback. Demo sırasında patlama olmasın.
- [ ] Network Health bar'ı gerçek data ile bağla
- [ ] `lib/mockData.ts`'i oluştur — en az 20 blok, 200 tx

---

### FAZ 3 — Block Explorer (Görselleştirme Kalbi)
**Süre: ~90 dk | Prompt 3A + 3B**

**AI AGENT PROMPT 3A — Explorer Ana Sayfa:**
```
Explorer sayfasini yap. Ust kisimda: arama bari (block no / tx hash / adres).
Ana alan: 3 saniyede bir polling ile yeni bloklar gelince
Framer Motion ile smooth animasyonlu blok karti grid'i (3 sutun).
Her kart: block number, tx sayisi, timestamp, gas used,
Parallel Score (buyuk renkli badge - kirmizi/sari/yesil),
mini sparkline (son 10 blok score trendi).
Karta tiklayinca /explorer/[block] sayfasina git.
```

**AI AGENT PROMPT 3B — Blok Detay Sayfası:**
```
Blok detay sayfasi /explorer/[block]:

Ust: block metadata (number, hash, timestamp, miner, gas).

Ana bolum 1 - TX Heatmap:
  tx'lerin gas kullanimini NxN grid olarak goster,
  renk yogunlugu = gas miktari.

Ana bolum 2 - Parallel Execution Timeline:
  tx'leri grupla: bagımsız tx'ler yan yana (ayni satirda),
  potansiyel conflict'li tx'ler alt satira.
  Framer Motion ile siralı animasyonlu "execute" efekti.

Ana bolum 3 - Parallel Score Breakdown:
  pie chart + aciklama tooltip. Her metrik ne kadar katkı sağlıyor.

OG meta tag ekle (paylasilabilir link icin):
  og:title, og:description, twitter:card
```

**Görevler:**
- [ ] `[KILLER]` TX Timeline — EN KRİTİK GÖRSEL
  - → Bu sayfayı mükemmel yap. Demo'nun kalbi burası. Zamanının %30'unu buraya ver.
- [ ] `[WOW]` Shareable block link + OG meta tags
- [ ] Blok arama — hash veya numara ile direkt gitme
- [ ] Heatmap renk skalası legend'ı

---

### FAZ 4 — Performance Dashboard + Wallet Tracker
**Süre: ~60 dk | Prompt 4**

**AI AGENT PROMPT:**
```
Dashboard sayfasi /dashboard:

Bolum 1 - Network Overview:
  Son 100 blok ortalamalari.
  Tremor BarChart (parallel score dagılımı histogramı).
  Tremor RadarChart (Monad vs Ethereum karsilastirmasi:
    latency, TPS, gas cost, finality, parallel efficiency).
  Ethereum verileri statik/mock olabilir.

Bolum 2 - Wallet Tracker:
  Input alani (adres gir), submit butonlu.
  Submit'te o adresin son 20 tx'ini cek, goster:
    - Toplam tx sayisi
    - Ortalama parallel efficiency skoru (buyuk, renkli)
    - Gas optimizasyon skoru
    - Tx tip dagilimi pie chart
    - En yuksek gas'li 5 tx listesi
  Loading state ve error state yaz.

Bolum 3 - Karsilastirma Kartlari:
  Monad vs Ethereum yan yana kart.
  "3-5 sn → 0.4 sn" gorseli vurgula.

Tremor kullan, Framer Motion ile giris animasyonlari.
```

**Görevler:**
- [ ] `[KILLER]` Wallet Tracker — demo sırasında kendi adresini gir
  - → Input sonrası 2 sn loading animation, sonra sonuçlar. Kişiselleştirilmiş data = wow.
- [ ] Monad vs Ethereum: Ethereum tarafı statik mock olabilir, kimse beklemez
- [ ] Son 100 blok parallel score histogramı

---

### FAZ 5 — Polish + Demo Hazırlığı
**Süre: ~60 dk | Son sprint**

**AI AGENT PROMPT:**
```
Tum sayfalar icin:
  - Loading skeleton'lar (Shimmer efekti ile)
  - Error state'ler (guzel fallback UI, "Network Unavailable" ekrani)
  - Responsive tasarim kontrol (mobile + tablet)

Landing hero animasyonunu guclendir:
  Daha fazla tx, daha etkileyici paralel vs siralı kontrast.

"Why This Tool Matters for Monad Developers" bolumu ekle landing'e.

Demo mode aktifken sol alt kosede kucuk sari badge goster: "Demo Mode Active"

README.md yaz:
  - Proje amaci ve ekran goruntuleri bolumu
  - Kurulum (npm install && npm run dev)
  - Deploy (Vercel one-click)
  - Parallel Score algoritmasi aciklamasi (donustce yaz)
  - Monad testnet bilgileri
```

**Görevler:**
- [ ] Loading skeleton'lar — shimmer efekti (blok listesi, detay, dashboard için)
- [ ] Error boundary — "Network Unavailable" → otomatik mock data fallback
- [ ] `[SPEED]` README: parallel score algoritması açıklaması
  - → Simüle edildiğini dürüstçe yaz + metodoloji açıkla
- [ ] Demo script yaz ve ezberle (bkz. Bölüm 5)

---

## 5. Risk Yönetimi & Demo Stratejisi

### Kritik Riskler ve Çözümleri

| Risk | Olasılık | Çözüm |
|------|----------|-------|
| RPC demo sırasında down olur | Orta | `USE_MOCK_DATA=true` ile demo mode. UI'da sarı badge: "Demo Mode" |
| Rate limit aşımı | Yüksek | TanStack Query caching (30s stale time). Aynı data defalarca çekilmez. |
| Parallel Score simülasyon sorusu | Kesin | README'de ve demo'da açıkça söyle: "Heuristic-based, Monad RPC conflict API yok" |
| TX Timeline yanlış gruplayabilir | Orta | Algoritmayı basit tut: gas threshold'a göre "potentially parallel" grupla |
| Vercel build hatası demo öncesi | Düşük | Son push'u 2 saat öncesinden yap. Build'i kontrol et. |

---

### 3 Dakika Demo Scripti (Saniye Saniye)

**0:00 — Hero Animasyonu (30 sn)**
Landing sayfasını aç. "Ethereum'da tx'ler sıralı, Monad'da paralel" animasyonu göster. Tek cümle: *"Bu araç Monad'ın en güçlü özelliğini görsel yapıyor."*

**0:30 — Canlı Explorer (60 sn)**
Explorer sayfasına geç. Yeni blokların canlı geldiğini göster. Parallel score'u yüksek bir bloğa tıkla. TX Timeline animasyonunu çalıştır — *"bu tx'ler aynı anda işlendi"* de.

**1:30 — Dashboard & Wallet Tracker (60 sn)**
Dashboard'a geç. Monad vs Ethereum karşılaştırmasını göster. Kendi cüzdan adresini gir, Wallet Tracker'ı çalıştır. Kişisel parallel efficiency skorunu jüriye göster.

**2:30 — Kapanış (30 sn)**
README'yi açıkla: açık kaynak, Monad ekosistemi için araç. Shareable block link'i göster. *"Diğer developerlar kendi kontratlarını buradan analiz edebilir"* de.

> **ALTIN KURAL:** Demo'da her şey mükemmel olmak zorunda değil. Ama **TX Timeline sayfası mükemmel olmalı.** O "aha moment"ı yakalamak için tüm geliştirme süresinin %30'unu sadece oraya harca.

---

## 6. Vibe Coding Taktikleri

### AI Agent'a Etkili Prompt Yazma

**→ Tek seferde tek konsept**
Her prompt bir faz'ı veya bir bileşeni kapsasın. "Tüm projeyi yaz" deme — agent kaybolur.

**→ Tech stack'i her prompt'ta tekrarla**
"Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui kullan" — agent versiyonu karıştırabilir.

**→ Çıktı formatını belirt**
"`lib/monad.ts` dosyasına yaz", "`components/BlockCard.tsx` oluştur" gibi net dosya yolu ver.

**→ Önce çalışsın, sonra güzel olsun**
Polish prompt'u (Faz 5) en sona bırak. Çalışmayan güzel kod işe yaramaz.

**→ Hata alınca direkt paste et**
Error mesajını aynen agent'a ver: "Bu hatayı alıyorum: [hata]". Kendi yorumunu ekleme.

**→ Mock data'yı erken oluştur**
Faz 2'de `lib/mockData.ts`'i de yaptır. Sonra her component bunu kullanabilir, RPC bağımlılığı kalmaz.

---

### Hangi AI Agent, Ne Zaman?

| Agent | En iyi olduğu yer | Kaçın |
|-------|-------------------|-------|
| Cursor | Dosya yapısı, çoklu dosya düzenleme, refactor | Karmaşık blockchain mantığı |
| Claude (claude.ai) | Algoritma tasarımı, hata debug, mimari kararlar | Uzun kod blokları (token limiti) |
| v0 (Vercel) | UI bileşeni prototipleme, dashboard layout | Blockchain entegrasyonu |
| GitHub Copilot | Otomatik tamamlama, boilerplate | Yeni bileşen oluşturma |

---

### Zaman Yönetimi Tablosu

| Faz | Süre | Öncelik | Kesme Noktası |
|-----|------|---------|---------------|
| 0 — Hazırlık | 30 dk | Zorunlu | RPC çalışmıyorsa devam etme |
| 1 — İskelet | 45 dk | Yüksek | Dark mode + nav çalışınca sonraki faz |
| 2 — Veri Katmanı | 60 dk | Kritik | `getLatestBlocks` + `getParallelScore` çalışınca |
| 3 — Explorer | 90 dk | Kritik | TX Timeline çalışınca → bu bitti, diğerleri bonus |
| 4 — Dashboard | 60 dk | Yüksek | Wallet Tracker çalışınca |
| 5 — Polish | 60 dk | Orta | Süre kalmadıysa skeleton'ları atla |

---

## 7. Bonus Özellikler (Süre Kalırsa)

**◆ WebSocket Canlı Feed**
`wss://` endpoint ile bloklar polling yerine push ile gelir. Daha smooth, daha az API call. Monad testnet WebSocket destekliyorsa ekle.

**◆ Kontrat Analiz Modu**
Kullanıcı kontrat adresi girer, o kontratla ilgili tüm tx'lerin parallel efficiency tarihçesi çıkar.

**◆ Shareable Report Link**
`/report/[wallet]` URL'i ile Wallet Tracker sonuçları paylaşılabilir hale gelir.

**◆ Monad Docs Sayfası**
Parallel execution'ı açıklayan mini eğitim sayfası. Jürilerin teknik sorularını bu sayfa cevaplar.

**◆ Block Race Animasyonu**
Son 5 blokta en yüksek parallel score'u kazanan blok "kazandı" animasyonu. Gamification + viral potansiyel.

---

> **HATIRLATMA:** Parallel Score simülasyon meşrudur. README'ye şunu yaz:
> *"Score is derived from block-level heuristics: tx count (40%), gas variance (35%), block utilization (25%). Monad RPC does not yet expose conflict detection data — this methodology is documented and open to improvement."*
> Dürüstlük güven verir, jüri bunu anlayıp takdir eder.

---

*Monad Parallel Vision — Infrastructure / Dev Tools — iyi şanslar! 🚀*


## Task 0: Repo & Environment Setup

**Files:**
- Create: `.env.example`
- Create: `vercel.json`
- Create: `web/` (Next.js app root)

- [ ] **Step 0: Initialize Monskills from skills.devnads.com**
  Entegre AI yeteneklerini (frontend, smart contract deployment, Vercel deployment) projeye çekmek için şu komutu çalıştır:
  ```bash
  npx skills add therealharpaljadeja/monskills
  ```
  Check out the imported `skills/monskills` directory. Review the available skills, rethink the project structure to optimally utilize agentic workflows, and plan the integration on Monad.

- [ ] **Step 1: Create GitHub repo and clone locally**
  ```bash
  git init && git add -A && git commit -m "chore: initial commit"
  ```

- [ ] **Step 2: Scaffold Next.js app**
  ```bash
  npx create-next-app@latest web --typescript --tailwind --app --no-src-dir --import-alias "@/*"
  cd web
  ```

- [ ] **Step 3: Bump tsconfig target to ES2020** (monskills `scaffold` known gotcha — prevents BigInt TS errors)
  ```bash
  jq '.compilerOptions.target = "ES2020"' tsconfig.json > tsconfig.tmp && mv tsconfig.tmp tsconfig.json
  ```

- [ ] **Step 4: Install dependencies**
  ```bash
  npm install @rainbow-me/rainbowkit wagmi viem@2.x @tanstack/react-query framer-motion
  npm install @tremor/react lucide-react
  npx shadcn@latest init
  ```

- [ ] **Step 5: Create `vercel.json` at web root** (required by monskills `vercel-deploy` skill)
  ```json
  { "framework": "nextjs" }
  ```

- [ ] **Step 6: Create `.env.example`**
  ```
  MONAD_RPC_URL=https://testnet-rpc.monad.xyz
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
  USE_MOCK_DATA=false
  ```

- [ ] **Step 7: Commit**
  ```bash
  git add -A && git commit -m "chore: scaffold Next.js app with deps"
  ```

---

## Task 1: Wallet & Provider Setup

> Follow `skills/monskills/wallet-integration.md` exactly.

**Files:**
- Create: `web/config/index.ts`
- Create: `web/app/providers.tsx`
- Modify: `web/app/layout.tsx`
- Modify: `web/package.json` (add `--webpack` flag)

- [ ] **Step 1: Create `web/config/index.ts`**
  ```ts
  import { getDefaultConfig } from '@rainbow-me/rainbowkit'
  import { monadTestnet } from 'wagmi/chains'
  import { http } from 'wagmi'

  export const config = getDefaultConfig({
    appName: 'Monad Parallel Vision',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
    chains: [monadTestnet],
    transports: {
      [monadTestnet.id]: http(process.env.MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz'),
    },
    ssr: true,
  })
  ```

- [ ] **Step 2: Create `web/app/providers.tsx`**
  ```tsx
  'use client'
  import '@rainbow-me/rainbowkit/styles.css'
  import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
  import { WagmiProvider } from 'wagmi'
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
  import { config } from '@/config'
  import type { ReactNode } from 'react'

  const queryClient = new QueryClient()

  export default function Providers({ children }: { children: ReactNode }) {
    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    )
  }
  ```

- [ ] **Step 3: Wrap `web/app/layout.tsx` with Providers, add `--webpack` to scripts**

- [ ] **Step 4: Run `npm run dev` and verify app starts without TS errors**

- [ ] **Step 5: Commit**
  ```bash
  git add -A && git commit -m "feat: wallet & RainbowKit provider setup"
  ```

---

## Task 2: Blockchain Data Layer

**Files:**
- Create: `web/lib/monad.ts`
- Create: `web/lib/parallelScore.ts`
- Create: `web/lib/mockData.ts`
- Create: `web/hooks/useLatestBlocks.ts`
- Create: `web/hooks/useBlockDetail.ts`

- [ ] **Step 1: Create `web/lib/monad.ts`** with viem public client and typed fetch functions
  ```ts
  import { createPublicClient, http } from 'viem'
  import { monadTestnet } from 'wagmi/chains'

  export const client = createPublicClient({
    chain: monadTestnet,
    transport: http(process.env.MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz'),
  })

  export async function getLatestBlocks(limit: number) {
    const latest = await client.getBlockNumber()
    const numbers = Array.from({ length: limit }, (_, i) => latest - BigInt(i))
    return Promise.all(numbers.map(n => client.getBlock({ blockNumber: n, includeTransactions: true })))
  }

  export async function getBlockDetail(blockNumber: bigint) {
    return client.getBlock({ blockNumber, includeTransactions: true })
  }
  ```

- [ ] **Step 2: Create `web/lib/parallelScore.ts`** — heuristic 0–100 score
  ```ts
  import type { Block } from 'viem'

  export function computeParallelScore(block: Block<bigint, true>): number {
    const txCount = block.transactions.length
    if (txCount === 0) return 0

    const txCountScore = Math.min(txCount / 100, 1) * 40

    const gasValues = block.transactions.map(tx => Number(tx.gas ?? 0n))
    const mean = gasValues.reduce((a, b) => a + b, 0) / gasValues.length
    const variance = gasValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / gasValues.length
    const stdDev = Math.sqrt(variance)
    const gasVarianceScore = Math.min(stdDev / 100000, 1) * 35

    const gasUsed = Number(block.gasUsed)
    const gasLimit = Number(block.gasLimit)
    const utilizationScore = (gasLimit > 0 ? gasUsed / gasLimit : 0) * 25

    return Math.round(txCountScore + gasVarianceScore + utilizationScore)
  }

  export function scoreColor(score: number): 'red' | 'yellow' | 'green' {
    if (score <= 60) return 'red'
    if (score <= 80) return 'yellow'
    return 'green'
  }
  ```

- [ ] **Step 3: Create `web/lib/mockData.ts`** with 20 sample blocks for `USE_MOCK_DATA=true` fallback

- [ ] **Step 4: Create `web/hooks/useLatestBlocks.ts`** using TanStack Query with 3s polling and mock fallback
  ```ts
  import { useQuery } from '@tanstack/react-query'
  import { getLatestBlocks } from '@/lib/monad'
  import { MOCK_BLOCKS } from '@/lib/mockData'

  export function useLatestBlocks(limit = 20) {
    return useQuery({
      queryKey: ['blocks', limit],
      queryFn: () => process.env.USE_MOCK_DATA === 'true' ? MOCK_BLOCKS : getLatestBlocks(limit),
      refetchInterval: 3000,
      staleTime: 2000,
    })
  }
  ```

- [ ] **Step 5: Verify TypeScript compiles without errors:** `npm run build`

- [ ] **Step 6: Commit**
  ```bash
  git add -A && git commit -m "feat: blockchain data layer with parallel score"
  ```

---

## Task 3: Landing Page — Hero Animation

**Files:**
- Create/Modify: `web/app/page.tsx`
- Create: `web/components/HeroAnimation.tsx`

- [ ] **Step 1: Build `web/components/HeroAnimation.tsx`** — Framer Motion, side-by-side, 5s loop
  - Left side: transactions process one-by-one sequentially (staggered `y` + opacity reveal)
  - Right side: all transactions flash simultaneously (single burst animation)

- [ ] **Step 2: Add Network Health bar** — TPS, avg block time, parallel efficiency (mock initially)

- [ ] **Step 3: Add "Why This Tool Matters" section** below hero

- [ ] **Step 4: Commit**
  ```bash
  git add -A && git commit -m "feat: landing hero animation + network health bar"
  ```

---

## Task 4: Block Explorer Page

**Files:**
- Create: `web/app/explorer/page.tsx`
- Create: `web/components/blocks/BlockCard.tsx`
- Create: `web/app/explorer/[block]/page.tsx`
- Create: `web/components/blocks/TxTimeline.tsx`
- Create: `web/components/blocks/TxHeatmap.tsx`

- [ ] **Step 1: Build `BlockCard.tsx`** — block number, tx count, timestamp, gas used, colored parallel score badge, mini sparkline

- [ ] **Step 2: Build `web/app/explorer/page.tsx`** — 3-col grid, polling via `useLatestBlocks`, Framer Motion `AnimatePresence` for new block entries

- [ ] **Step 3: Build `TxTimeline.tsx`** — group txs by independence (gas threshold heuristic), animate "parallel" rows with simultaneous reveal, "sequential" rows with stagger. **This is the KILLER feature — spend 30% of total dev time here.**

- [ ] **Step 4: Build `TxHeatmap.tsx`** — NxN grid, cell color intensity = gas used

- [ ] **Step 5: Build `web/app/explorer/[block]/page.tsx`** — metadata header + TxHeatmap + TxTimeline + score breakdown pie chart + OG meta tags

- [ ] **Step 6: Test with real RPC and mock data both:** `USE_MOCK_DATA=true npm run dev`

- [ ] **Step 7: Commit**
  ```bash
  git add -A && git commit -m "feat: block explorer with TX timeline and heatmap"
  ```

---

## Task 5: Dashboard + Wallet Tracker

**Files:**
- Create: `web/app/dashboard/page.tsx`
- Create: `web/components/WalletTracker.tsx`

- [ ] **Step 1: Build `WalletTracker.tsx`** — address input → fetch last 20 txs → show avg parallel score (large colored number), gas optimization score, tx type pie chart, top 5 gas txs list. 2s skeleton loading state.

- [ ] **Step 2: Build Monad vs Ethereum comparison cards** — static mock data for Ethereum side, real data for Monad

- [ ] **Step 3: Build last-100-blocks histogram** using Tremor BarChart

- [ ] **Step 4: Build Radar chart** — Monad vs Ethereum on latency, TPS, gas, finality, parallelism (Tremor RadarChart, static data)

- [ ] **Step 5: Commit**
  ```bash
  git add -A && git commit -m "feat: dashboard with wallet tracker and comparison charts"
  ```

---

## Task 6: Polish & Error Handling

**Files:**
- Create: `web/components/ui/Skeleton.tsx`
- Create: `web/components/NetworkUnavailable.tsx`
- Modify: all page files (add Suspense + error boundaries)

- [ ] **Step 1: Add shimmer skeletons** for block list, block detail, dashboard

- [ ] **Step 2: Add error boundary** — on RPC failure, automatically switch to mock data, show yellow "Demo Mode" badge bottom-left

- [ ] **Step 3: Add `USE_MOCK_DATA` Demo Mode badge** — small fixed badge when env is true

- [ ] **Step 4: Verify responsive layout** on mobile (375px) and tablet (768px)

- [ ] **Step 5: Commit**
  ```bash
  git add -A && git commit -m "feat: skeleton loading, error boundaries, demo mode badge"
  ```

---

## Task 7: Deploy to Vercel

> Follow `skills/monskills/vercel-deploy.md` exactly. No CLI, no authentication needed.

- [ ] **Step 1: Ensure all changes are committed** — `git status` must be clean

- [ ] **Step 2: Download deploy script**
  ```bash
  curl -sO https://skills.devnads.com/vercel-deploy/deploy.sh && chmod +x deploy.sh
  ```

- [ ] **Step 3: Run deploy**
  ```bash
  bash deploy.sh web/
  ```

- [ ] **Step 4: Note the two URLs returned:**
  - **Preview URL** — share with judges immediately
  - **Claim URL** — transfer to your Vercel account

- [ ] **Step 5: Write `README.md`** — purpose, setup (`npm install && npm run dev`), parallel score algorithm methodology (honest: heuristic-based, methodology documented), Monad testnet info

- [ ] **Step 6: Final commit**
  ```bash
  git add -A && git commit -m "docs: README with parallel score methodology"
  ```

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| RPC down during demo | `USE_MOCK_DATA=true` env → auto-fallback, yellow "Demo Mode" badge |
| Rate limit | TanStack Query: 3s poll, 2s stale time — same data never re-fetched |
| Parallel Score questioned | README documents heuristic: tx count (40%) + gas variance (35%) + utilization (25%) |
| Vercel build fails | Run `npm run build` locally before deploying |

---

## Skills Referenced

| Task | Skill File |
|------|-----------|
| Project scaffold + verification | `skills/monskills/scaffold.md` |
| Wallet connection | `skills/monskills/wallet-integration.md` |
| Vercel deploy (no CLI) | `skills/monskills/vercel-deploy.md` |
| Contract addresses | `skills/monskills/addresses.md` |
| Writing this plan | `skills/writing-plans/skill.md` |
| Executing tasks | `skills/executing-plans/skill.md` |
| Debugging | `skills/systematic-debugging/skill.md` |
