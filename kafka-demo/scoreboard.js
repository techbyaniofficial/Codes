// scoreboard.js
import { Kafka } from "kafkajs";
const kafka = new Kafka({ clientId: "scoreboard-service", brokers: ["localhost:9092"] });

const topic = "match-events";
const groupId = process.env.GROUP || "scoreboard-group-1";

(async () => {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  const scores = {}; // { matchId: { total, wickets } }

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      const e = JSON.parse(message.value.toString());
      if (!scores[e.matchId]) scores[e.matchId] = { total: 0, wickets: 0 };

      if (e.isWicket) scores[e.matchId].wickets += 1;
      else scores[e.matchId].total += e.runs;

      console.log(
        `📊 [SCOREBOARD][P${partition}] ${e.matchName} → Ball ${e.ball} | ` +
        (e.isWicket ? `${e.batsman} OUT!` : `${e.batsman}+${e.runs}`) +
        ` | Total: ${scores[e.matchId].total}/${scores[e.matchId].wickets}`
      );
    },
  });
})();
