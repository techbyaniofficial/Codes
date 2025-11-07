// producer.js
import { Kafka } from "kafkajs";

const kafka = new Kafka({ clientId: "ipl-producer", brokers: ["localhost:9092"] });
const topic = "match-events";

const MATCHES = {
  1: { name: "MI vs CSK" },
  2: { name: "RCB vs KKR" },
};

const PLAYERS = {
  1: ["Rohit", "Suryakumar", "Hardik"],
  2: ["Virat", "Maxwell", "DK"],
};

function randomOutcome() {
  const outcomes = [0, 1, 2, 3, 4, 6, "W"]; // simple
  return outcomes[Math.floor(Math.random() * outcomes.length)];
}

(async () => {
  const producer = kafka.producer();
  await producer.connect();

  for (let ball = 1; ball <= 12; ball++) { // two overs total, interleaved across matches
    for (const matchId of [1, 2]) {
      const batsman = PLAYERS[matchId][Math.floor(Math.random() * PLAYERS[matchId].length)];
      const out = randomOutcome();
      const isWicket = out === "W";
      const runs = isWicket ? 0 : out;

      const event = {
        matchId,
        matchName: MATCHES[matchId].name,
        ball,
        batsman,
        runs,
        isWicket,
        at: new Date().toISOString(),
      };

      await producer.send({
        topic,
        messages: [{ key: String(matchId), value: JSON.stringify(event) }],
      });

      console.log(
        `🏏 [${MATCHES[matchId].name}] Ball ${ball}: ${
          isWicket ? `${batsman} OUT!` : `${batsman} scores ${runs}`
        }`
      );
    }

    await new Promise((r) => setTimeout(r, 800)); // pacing for demo
  }

  await producer.disconnect();
  console.log("✅ producer finished");
})();
