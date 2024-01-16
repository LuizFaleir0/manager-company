import { Request } from "express";
import { Consumer, Producer } from "kafkajs";

declare namespace requestWithKafka {
  interface RequestKafka extends Request {
    producer?: Producer;
    consumer?: Consumer;
    clientName?: string;
  }
}
