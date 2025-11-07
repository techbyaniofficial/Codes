# 🏏 Kafka IPL Demo (Official Apache Kafka + Node.js, KRaft Mode)

End-to-end guide to run **Apache Kafka (official Docker image)** in **KRaft (no ZooKeeper)** and a **Node.js (KafkaJS)** demo that streams **two IPL matches in parallel** with three consumer groups (Scoreboard, Commentary, Analytics).

---

## 📦 What you’ll set up

- Official Kafka image (`apache/kafka:4.1.0`) in **KRaft** mode
- Single broker acting as **controller+broker**
- One topic `match-events` with **2 partitions** (one per match)
- Node.js producer & three consumers using **KafkaJS**

---

## 🧰 Prerequisites

- Docker Desktop running
- Node.js **18+**
- Terminal (PowerShell on Windows, bash/zsh on macOS/Linux)
- Internet connection (to pull images)

---

## ⚡ TL;DR (Quick Start)

```bash
# 1) Make folder
mkdir Kafka-demo && cd Kafka-demo

# 2) Create network & volume
docker network create kafka-net
docker volume create kafka-data

# 3) Create config file (server.properties) → content below
# 4) Generate Cluster ID
docker run --rm apache/kafka:4.1.0 /opt/kafka/bin/kafka-storage.sh random-uuid

# 5) Format storage (replace <CLUSTER_ID> with your output)
docker run --rm -v kafka-data:/var/lib/kafka/data -v ${PWD}/server.properties:/tmp/server.properties apache/kafka:4.1.0 /opt/kafka/bin/kafka-storage.sh format -t <CLUSTER_ID> -c /tmp/server.properties

# 6) Start Kafka
docker run -d --name kafka --network kafka-net -p 9092:9092 -v kafka-data:/var/lib/kafka/data -v ${PWD}/server.properties:/opt/kafka/config/server.properties apache/kafka:4.1.0 /opt/kafka/bin/kafka-server-start.sh /opt/kafka/config/server.properties

# 7) Verify
docker logs -f kafka
docker exec -it kafka bash -lc "/opt/kafka/bin/kafka-topics.sh --list --bootstrap-server localhost:9092"

# 8) Node.js demo setup
npm init -y
npm i kafkajs
# add "type": "module" to package.json

# 9) Create files: admin.js, producer.js, scoreboard.js, commentary.js, analytics.js → content below

# 10) Run demo
node admin.js
node scoreboard.js      # terminal 1
node commentary.js      # terminal 2
node analytics.js       # terminal 3
node producer.js        # terminal 4

