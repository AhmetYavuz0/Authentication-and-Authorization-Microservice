🛰️ Log Monitoring Microservices (Filebeat + Logstash + Node.js + PostgreSQL)

Bu proje, sunuculardan gerçek zamanlı log toplayıp merkezi bir dashboard üzerinden izlemeyi sağlayan mikroservis tabanlı bir log izleme altyapısıdır.
Sistem; Filebeat → Logstash → Node.js API → PostgreSQL → Vue Dashboard akışıyla çalışır.

Amaç: Dağıtık sunuculardaki logları toplayarak tek bir noktada depolamak, filtrelemek ve görselleştirmek.

1️⃣ Filebeat Service (Agent Layer)

Her sunucuya kurulan hafif log kolektörüdür.

Logstash’e güvenli HTTP/Beats protokolüyle veri gönderir.

Config, log yollarını ve harici tag’leri tanımlar.

Görevi: Sunucudan logları okuyup Logstash'e göndermek.

2️⃣ Logstash Service (Ingestion Layer)

Filebeat’ten gelen logları işler, normalize eder.

Hem Elasticsearch gibi analiz sistemlerine hem de Node.js API’sine forward edebilir.

Bu projede logları Node.js API endpoint’ine POST ederek gönderir.

Görevi: Log’u işlemek, dönüştürmek ve API’ye iletmek.

3️⃣ Node.js (Fastify) Log API (Processing Layer)

Logstash’in gönderdiği logları karşılar.

Drizzle ORM ile PostgreSQL'e güvenli şekilde kaydeder.

Dashboard’un ihtiyaç duyduğu filtreli log verilerini sağlar.

Görevi: Log verisini saklamak ve frontend'e servis etmek.

Özellikler:

JWT ile authentication

Fastify + TypeScript

Drizzle ORM

Log filtreleme (tarih, hostname, tag, serverName vs.)

Protected routes

4️⃣ MySQL Database (Storage Layer)

Tüm loglar structured şekilde saklanır.

Analiz, dashboard, raporlama sistemlerinin veri kaynağıdır.

Görevi: Kalıcı ve performanslı log depolama.


