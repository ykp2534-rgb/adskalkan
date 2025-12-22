#!/bin/bash
# AdsKalkan GitHub Export Script
# Bu script tüm proje dosyalarını tar.gz olarak paketler

echo "🛡️ AdsKalkan - GitHub Export Başlıyor..."

# Çıktı dizini
OUTPUT_DIR="/tmp/adskalkan-export"
rm -rf $OUTPUT_DIR
mkdir -p $OUTPUT_DIR

# Ana proje dizinine git
cd /app

# Gerekli dosyaları kopyala
echo "📦 Dosyalar kopyalanıyor..."

# Backend
cp -r backend $OUTPUT_DIR/
rm -rf $OUTPUT_DIR/backend/venv
rm -rf $OUTPUT_DIR/backend/__pycache__

# Frontend  
mkdir -p $OUTPUT_DIR/frontend
cp -r frontend/src $OUTPUT_DIR/frontend/
cp -r frontend/public $OUTPUT_DIR/frontend/
cp frontend/package.json $OUTPUT_DIR/frontend/
cp frontend/tailwind.config.js $OUTPUT_DIR/frontend/
cp frontend/postcss.config.js $OUTPUT_DIR/frontend/
cp frontend/craco.config.js $OUTPUT_DIR/frontend/
cp frontend/jsconfig.json $OUTPUT_DIR/frontend/
cp frontend/components.json $OUTPUT_DIR/frontend/

# Root dosyalar
cp .gitignore $OUTPUT_DIR/
cp README_GITHUB.md $OUTPUT_DIR/README.md

# .env.example dosyaları oluştur
echo "📝 .env.example dosyaları oluşturuluyor..."

cat > $OUTPUT_DIR/backend/.env.example << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=adskalkan_db
CORS_ORIGINS=*
SECRET_KEY=change-this-to-a-secure-random-string
EOF

cat > $OUTPUT_DIR/frontend/.env.example << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8001
EOF

# Tar.gz oluştur
echo "📦 Paketleniyor..."
cd /tmp
tar -czf adskalkan-github.tar.gz adskalkan-export/

echo "✅ TAMAMLANDI!"
echo ""
echo "📁 Dosya konumu: /tmp/adskalkan-github.tar.gz"
echo "📦 Boyut: $(du -h /tmp/adskalkan-github.tar.gz | cut -f1)"
echo ""
echo "🚀 Sonraki adımlar:"
echo "1. Bu dosyayı yerel PC'nize indirin"
echo "2. Çıkarın: tar -xzf adskalkan-github.tar.gz"
echo "3. GitHub'a push edin"
