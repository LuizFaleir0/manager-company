import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const token = request.header("Authorization");
  try {
    if (!token) {
      return response.status(401).send({
        message: "Você não está autenticado",
      });
    }

    const hasToken = await prisma.token.findUnique({
      where: {
        token: token,
      },
    });

    if (!hasToken) {
      return response.status(401).send({
        message: "Você não está autenticado",
      });
    }

    next();
  } catch (error: any) {
    console.error("Internal Error Server:", error.message);
    response.status(500).send({
      message: "Internal Error Server",
      error: error,
    });
  }
};
