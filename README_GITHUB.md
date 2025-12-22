# 🛡️ AdsKalkan - Google Ads Tıklama Koruma Platformu

<div align="center">

![AdsKalkan Logo](https://img.shields.io/badge/AdsKalkan-Tıklama_Koruma-orange?style=for-the-badge&logo=shield)
![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green?style=for-the-badge&logo=mongodb)

**Türkiye'nin İlk Havuz Sistemi ile Google Ads Tıklama Koruma Platformu**

[Demo](https://adskalkan.com) • [Dokümantasyon](#) • [API Docs](#)

</div>

---

## 🚀 Özellikler

### 🔥 Ana Özellikler

- **Gerçek Zamanlı Tıklama Takibi** - Her tıklama anında analiz edilir
- **Şüpheli Tıklama Tespiti** - Gelişmiş algoritma ile fraud detection (0-100 skor)
- **Otomatik IP Engelleme** - Şüpheli IP'ler anında engellenir
- **Bot Detection** - User agent analizi ile bot tespiti
- **Detaylı Raporlama** - Kampanya bazlı istatistikler ve grafikler

### 🏊 Havuz Sistemi (Kollektif Koruma) - YENİLİKÇİ!

**AdsKalkan'ın en güçlü özelliği:**

- **Şehir + Sektör Bazlı Havuzlar** - İstanbul Tesisatçı (34001), Ankara Avukat (06002)
- **Kollektif Koruma** - Bir üyeye gelen tehdit, TÜM havuz üyelerini korur
- **Proaktif Güvenlik** - Şüpheli IP bir kez tespit edildiğinde tüm havuz korunur
- **Premium Özellik** - Havuz üyeleri ekstra koruma altında

**Örnek Senaryo:**
```
1. İstanbul Tesisatçı Havuzu'nda 100 firma var
2. Firma A'ya şüpheli IP'den (185.x.x.x) tıklama gelir  
3. Sistem anında tespit eder → Fraud Score: 85/100
4. IP engellenir (kullanıcı ayarına göre 1-30 gün)
5. ✨ AYNI ANDA 100 firmanın HEPSİ bu IP'den korunur!
```

### ⚙️ Esnek Engelleme Ayarları

**Tıklama Eşiği:**
- 1 Tıklama - Maksimum Koruma 🛡️
- 2 Tıklama - Dengeli
- 3 Tıklama - Esnek  
- 5-10 Tıklama - Özelleştirilebilir

**Engelleme Süresi:**
- 1-3 Gün - Kısa süreli
- 7 Gün - Önerilen ⭐
- 14-30 Gün - Uzun süreli

### 👨‍💼 Operatör Paneli

- **81 İl Desteği** - Tüm Türkiye şehirleri
- **Sınırsız Sektör** - İstediğiniz sektörü ekleyin
- **Esnek Fiyatlandırma** - Havuz başına özel ücret
- **Otomatik Kod Üretimi** - Sistem havuz kodlarını otomatik oluşturur

---

## 🏗️ Teknoloji Stack

### Backend
- **FastAPI** - Modern, hızlı Python web framework
- **MongoDB + Motor** - Async NoSQL veritabanı
- **JWT Authentication** - Güvenli token bazlı kimlik doğrulama
- **Pydantic** - Veri validasyonu

### Frontend  
- **React 19** - Modern UI geliştirme
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Erişilebilir UI componentleri
- **Axios** - HTTP client

### Veritabanı Yapısı
```
users          → Kullanıcı yönetimi
campaigns      → Google Ads kampanyaları  
clicks         → Tıklama verileri (indeksli, optimize)
pools          → Havuz sistemi (şehir + sektör)
pool_members   → Havuz üyelikleri (ayarlar ile)
blocked_ips    → Engellenen IP listesi (süre ile)
fraud_patterns → Öğrenilen şüpheli kalıplar
```

---

## 📦 Kurulum

### Gereksinimler
- Python 3.9+
- Node.js 18+
- MongoDB 5.0+
- Yarn

### Hızlı Başlangıç

```bash
# Projeyi klonlayın
git clone https://github.com/KULLANICI_ADI/adskalkan.git
cd adskalkan

# Backend kurulumu
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# .env dosyasını düzenleyin
cp .env.example .env
nano .env

# Demo data oluşturun
python seed_demo_data.py

# Backend'i başlatın
uvicorn server:app --host 0.0.0.0 --port 8001

# Yeni terminal açın - Frontend kurulumu
cd ../frontend
yarn install

# .env dosyasını düzenleyin  
cp .env.example .env
nano .env

# Frontend'i başlatın
yarn start
```

**Tarayıcınızda açın:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

---

## 🎯 Kullanım

### 1. Kayıt Olun
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "secure_password",
  "full_name": "İsim Soyisim"
}
```

### 2. Kampanya Oluşturun
```bash
POST /api/campaigns
{
  "name": "Yaz Kampanyası 2025",
  "google_ads_id": "optional"
}
```

### 3. Havuza Katılın
```bash
POST /api/pools/join
{
  "pool_code": "34001",
  "click_threshold": 1,
  "block_duration_days": 7
}
```

### 4. Tıklama Takibi
```bash
POST /api/clicks/track
{
  "campaign_id": "xxx",
  "ip_address": "185.x.x.x",
  "device_type": "desktop",
  "location_city": "Istanbul"
}
```

---

## 🔒 Güvenlik

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS configuration
- ✅ MongoDB indexing
- ✅ Input validation (Pydantic)
- ✅ Rate limiting ready

---

## 📊 Fraud Detection Algoritması

### Analiz Kriterleri

1. **IP Reputation** - Engellenmiş IP kontrolü
2. **Click Frequency** - Dakika başına tıklama analizi (threshold bazlı)
3. **Bot Detection** - User agent pattern matching
4. **Cross-Campaign** - Aynı IP'den farklı kampanyalara saldırı
5. **Geolocation** - Türkiye dışı trafik kontrolü
6. **Fraud Scoring** - 0-100 arası risk skoru (threshold: 70+)

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/login` - Giriş yap
- `GET /api/auth/me` - Kullanıcı bilgileri

### Campaigns
- `GET /api/campaigns` - Kampanya listesi
- `POST /api/campaigns` - Yeni kampanya
- `GET /api/campaigns/{id}/stats` - Kampanya istatistikleri

### Pools
- `GET /api/pools` - Havuz listesi
- `POST /api/pools/join` - Havuza katıl
- `GET /api/pools/my-pools` - Üye olunan havuzlar
- `POST /api/pools/operator/create-pool` - Yeni havuz (Operator)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard istatistikleri
- `GET /api/analytics/blocked-ips` - Engellenen IP'ler
- `GET /api/analytics/recent-threats` - Son tehditler

---

## 🎨 Demo Havuzlar

| Kod | Şehir | Sektör | Ücrет |
|-----|-------|--------|-------|
| 34001 | İstanbul | Tesisatçı | 99 TL/ay |
| 34002 | İstanbul | Kombi Servisi | 99 TL/ay |
| 34003 | İstanbul | Elektrikçi | 99 TL/ay |
| 06001 | Ankara | Tesisatçı | 99 TL/ay |
| 06002 | Ankara | Avukat | 99 TL/ay |
| 35001 | İzmir | Emlak Danışmanı | 99 TL/ay |
| 35002 | İzmir | Diş Hekimi | 99 TL/ay |
| 16001 | Bursa | İnşaat Firması | 99 TL/ay |

---

## 📈 Proje Yapısı

```
adskalkan/
├── backend/
│   ├── server.py              # Ana FastAPI app
│   ├── config.py              # Konfigürasyon
│   ├── database.py            # MongoDB bağlantı
│   ├── models/                # Pydantic modeller
│   ├── routes/                # API endpoints
│   ├── services/              # Business logic
│   │   ├── click_analyzer.py
│   │   ├── pool_service.py
│   │   └── fraud_detector.py
│   └── utils/
├── frontend/
│   ├── src/
│   │   ├── pages/            # React sayfaları
│   │   ├── components/       # UI componentleri
│   │   ├── contexts/         # State management
│   │   └── services/         # API client
│   └── public/
└── README.md
```

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen:

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📝 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

## 📞 İletişim

- **Website:** https://adskalkan.com
- **Email:** info@adskalkan.com
- **GitHub:** https://github.com/KULLANICI_ADI/adskalkan

---

## 🙏 Teşekkürler

- [ClickCease](https://www.clickcease.com/) - İlham kaynağı
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [MongoDB](https://www.mongodb.com/) - Database

---

<div align="center">

**Made with ❤️ in Turkey 🇹🇷**

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

</div>
