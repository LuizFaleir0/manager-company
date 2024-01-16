import { Kafka, logLevel } from "kafkajs";
import express from "express";
import dotenv from "dotenv";
import routes from "./routes";
import VerifyToken from "./middlewares/VerifyToken";
import { eachMessage } from "./config/kafkaConfig";
dotenv.config();

const PORT = process.env.PORT || 8002;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(VerifyToken);
app.use("/products", routes);

const clientName = "Products";
const kafka = new Kafka({
  clientId: "products",
  brokers: ["localhost:9092"],
  logLevel: logLevel.NOTHING,
});

const producer = kafka.producer();
const consumer = kafka.consumer({
  groupId: "api",
});

async function runKafka() {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({
    topics: ["connect", "user_new", "user_delete", "user_login", "user_logout"],
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async (payload) => eachMessage(payload, clientName, producer),
  });

  await producer.send({
    topic: "connect",
    messages: [
      {
        value: JSON.stringify({
          type: "products",
          name: "Produtos",
        }),
      },
    ],
  });
}

app.listen(PORT, () => {
  console.log(`Products service starting on PORT: [${PORT}]`);
});

runKafka();
