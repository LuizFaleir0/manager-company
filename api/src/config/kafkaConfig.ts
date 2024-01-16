import { EachMessagePayload } from "kafkajs";

export const eachMessage = async (
  { topic, message }: EachMessagePayload,
  clientName: string
  // producer: Producer
) => {
  if (message.value) {
    // const sendProducerMessage = async (
    //   topic: string,
    //   clientName: string,
    //   message: string
    // ) => {
    //   await producer.send({
    //     topic: topic,
    //     messages: [
    //       {
    //         value: JSON.stringify({
    //           clientName: clientName,
    //           message: message,
    //         }),
    //       },
    //     ],
    //   });
    // };

    const messageObject = JSON.parse(message.value?.toString());
    if (topic === "connect") {
      console.log(
        `${
          messageObject.type === "main"
            ? "A API principal"
            : `O serviço de ${messageObject.name}`
        } está online!`
      );
    } else {
      console.log(
        `[${messageObject.clientName}] - [${topic}]: ${messageObject.message}`
      );
    }
  }
};
