import { EachMessagePayload, Producer } from "kafkajs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const eachMessage = async (
  { topic, message }: EachMessagePayload,
  clientName: string,
  producer: Producer
) => {
  if (message.value) {
    const sendProducerMessage = async (
      clientName: string,
      topic: string,
      message: string
    ) => {
      await producer.send({
        topic: topic,
        messages: [
          {
            value: JSON.stringify({
              clientName: clientName,
              message: message,
            }),
          },
        ],
      });
    };
    const messageObject = JSON.parse(message.value?.toString());
    if (topic === "connect") {
      console.log(
        `${
          messageObject.type === "main"
            ? "A API principal"
            : `O serviço de ${messageObject.name}`
        } está online!`
      );
    }

    try {
      if (topic === "user_new" || topic === "user_login") {
        const token = jwt.decode(messageObject.token, {
          complete: false,
        }) as JwtPayload;
        const data = {
          id_user: token.id,
          token: messageObject.token,
        };
        await prisma.token.create({ data: data });
        const topicProducer = "token_new";
        const messageProducer = "Token cadastrado com sucesso!";

        console.log(
          `[${messageObject.clientName}] - [${topic}]: ${messageProducer}`
        );

        await sendProducerMessage(clientName, topicProducer, messageProducer);
      }

      if (topic === "user_logout" || topic === "user_delete") {
        await prisma.token.delete({ where: { token: messageObject.token } });
        const topicProducer = "token_delete";
        const messageProducer = "Token removido com sucesso!";
        console.log(
          `[${messageObject.clientName}] - [${topic}]: ${messageProducer}`
        );

        await sendProducerMessage(clientName, topicProducer, messageProducer);
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        const topicProducer = "token_delete";
        const messageProducer = "[Error: 404] Token não encontrado!";
        console.log(
          `[${messageObject.clientName}] - [${topic}]: ${messageProducer}`
        );

        await sendProducerMessage(clientName, topicProducer, messageProducer);
      }
    }
  }
};
