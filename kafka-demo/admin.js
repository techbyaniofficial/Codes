// admin.js
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "topic-admin",
  brokers: ["localhost:9092"], // or host.docker.internal on mac/windows (both localhost also work)
});

(async () => {
  const admin = kafka.admin();
  await admin.connect();

  // idempotent create
  await admin.createTopics({
    topics: [
      {
        topic: "match-events",
        numPartitions: 2,       // two matches -> two partitions
        replicationFactor: 1,   // single broker demo
      },
    ],
    waitForLeaders: true,
  });

  console.log("✅ topic ensured: match-events (2 partitions)");
  await admin.disconnect();
})();
