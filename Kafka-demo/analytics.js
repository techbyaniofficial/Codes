// analytics.js
import { Kafka } from "kafkajs";
const kafka = new Kafka({ clientId: "analytics-service", brokers: ["localhost:9092"] });

const topic = "match-events";
const groupId = process.env.GROUP || "analytics-group";

(async () => {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  const stats = {}; // { matchId: { batsman: runs } }

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      const { matchId, matchName, batsman, runs, isWicket } = JSON.parse(message.value.toString());
      if (!stats[matchId]) stats[matchId] = {};
      stats[matchId][batsman] = (stats[matchId][batsman] || 0) + (isWicket ? 0 : runs);

      console.log(`📈 [ANALYTICS][P${partition}] ${matchName} → ${JSON.stringify(stats[matchId])}`);
    },
  });
})();
