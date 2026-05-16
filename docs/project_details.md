# Project Details (Proje Detayları)

Buraya proje hakkındaki tüm detaylı bilgileri, amacını, hedef kitlesini, kullanılacak teknolojileri ve mimari kararları yazabilirsin.

## Projenin Amacı
**Monad Parallel Vision**, Monad blockchain'in en kritik teknik özelliği olan **Optimistic Parallel Execution**'ı görsel olarak somutlaştıran bir Block Explorer ve Performance Dashboard test uygulamasıdır. Standart explorer'ların (sadece tx listesi, blok bilgisi) ötesine geçerek; bloklardaki işlemlerin ne kadarının paralel çalıştığını ve akıllı kontratların Monad'ın hızından ne ölçüde faydalandığını canlı animasyonlar, TX Timeline (İşlem Zaman Çizelgesi) ve paralel verimlilik skorları ile gösterir. 

## Hedef Kitle
- Monad ağında uygulama geliştiren Solidity ve dApp geliştiricileri.
- Kendi cüzdan veya kontrat işlemlerinin performansını, gas optimizasyonunu ve paralellik verimliliğini analiz etmek isteyen kullanıcılar.
- Monad ekosistemini araştıran yatırımcılar.
- Hackathon jürileri ve katılımcılar.

## Kullanılacak Teknolojiler
- **Framework:** Next.js 15 (App Router)
- **Dil:** TypeScript (ES2020)
- **Stil & Komponentler:** Tailwind CSS, shadcn/ui, lucide-react
- **Blockchain Etkileşimi:** viem, RainbowKit, Wagmi v3
- **Veri Çekme & State Yönetimi:** TanStack Query (Polling, Caching, Error Boundary için)
- **Görselleştirme & Animasyon:** Framer Motion (TX akışları ve animasyonlar), Tremor (Grafikler)
- **Dağıtım:** Vercel

## Mimari ve Veritabanı
Proje, hızı ön planda tutan frontend ağırlıklı (sunucusuz) bir mimariye sahiptir.
- **Veritabanı / Backend:** Ayrı bir backend (Node.js, Python vb.) veya geleneksel SQL/NoSQL veritabanı **kullanılmayacaktır**. 
- **Veri Kaynağı:** Tüm gerçek zamanlı blockchain verileri doğrudan **Monad Testnet RPC** (`https://testnet-rpc.monad.xyz`) üzerinden çekilecektir.
- **Demo Mode Modülü:** Veri çekme hatalarına (RPC down / Rate limit) karşı korunmak için önceden oluşturulmuş blok verilerini içeren `mockData.ts` fallback yapısı bulunacaktır.
- **Algoritma:** Gerçek conflict detection şu an RPC'de açık olmadığı için paralel çalışma skoru; block içindeki tx sayısı, gas varyansı ve doluluk (utilization) gibi parametrelere göre euristik (sezgisel) olarak simüle edilecektir.
