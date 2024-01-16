import routes from "./routes/index";
import { Kafka, logLevel } from "kafkajs";
import express from "express";

import dotenv from "dotenv";
import { requestWithKafka } from "./types";
import { eachMessage } from "./config/kafkaConfig";
dotenv.config();
const PORT = process.env.PORT || 8001;
const app = express();

app.use((request: requestWithKafka.RequestKafka, response, next) => {
  request.producer = producer;
  request.consumer = consumer;
  request.clientName = clientName;
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", routes);

const clientName = "API";
const kafka = new Kafka({
  clientId: "api",
  brokers: ["0.0.0.0:9092"],
  logLevel: logLevel.NOTHING,
});

const producer = kafka.producer();
const consumer = kafka.consumer({
  groupId: "products",
});

async function runKafka() {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({
    topics: ["connect", "token_new", "token_delete"],
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async (payload) => eachMessage(payload, clientName),
  });

  await producer.send({
    topic: "connect",
    messages: [
      {
        value: JSON.stringify({
          type: "main",
          name: "API",
        }),
      },
    ],
  });
}

runKafka();

app.listen(PORT, () => {
  console.log(`API starting on PORT: [${PORT}]`);
});
