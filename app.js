const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Tüm klasörü statik dosya olarak sunuyoruz
app.use(express.static(path.join(__dirname)));

// Ana sayfa isteği için index.html dosyasını gönderiyoruz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Sunucuyu belirtilen port üzerinden dinlemeye başlıyoruz
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor...`);
});
