// commentary.js
import { Kafka } from "kafkajs";
const kafka = new Kafka({ clientId: "commentary-service", brokers: ["localhost:9092"] });

const topic = "match-events";
const groupId = process.env.GROUP || "commentary-group";

(async () => {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      const { matchName, batsman, runs, isWicket, ball } = JSON.parse(message.value.toString());
      const line = isWicket
        ? `Ball ${ball}: ${batsman} is GONE!`
        : `Ball ${ball}: ${batsman} picks up ${runs}.`;
      console.log(`🎤 [COMMENTARY][P${partition}] ${matchName} → ${line}`);
    },
  });
})();
