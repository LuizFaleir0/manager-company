import { Response } from "express";
import createValidator from "../validators/createValidator";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import loginValidator from "../validators/loginValidator";
import { requestWithKafka } from "../types";
const prisma = new PrismaClient();
class Users {
  public async index(
    request: requestWithKafka.RequestKafka,
    response: Response
  ) {
    const token = request.header("Authorization") as string;

    const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

    try {
      jwt.verify(token, PRIVATE_KEY, {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;

      const usersAll = await prisma.user.findMany({
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          password: false,
        },
      });

      return response.status(200).send({
        message: "Dados de usuários coletados com sucesso!",
        users: usersAll,
      });
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        return response.status(401).send({
          message: "Sua sessão inspirou, faça login novamente!",
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return response.status(400).send({
          message: `Erro de token JWT: ${error.message}`,
        });
      }

      console.log("Internal Server Error", error);
      return response.status(500).send({
        message: `Internal Server Error: ${
          error.message ? error.message : "Unknown error"
        }`,
      });
    }
  }

  public async show(
    request: requestWithKafka.RequestKafka,
    response: Response
  ) {
    try {
      const token = request.header("Authorization") as string;

      const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

      const payload = jwt.verify(token, PRIVATE_KEY, {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;

      return response.status(200).send({
        user: {
          id: payload.id,
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
        },
      });
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        return response.status(401).send({
          message: "Sua sessão inspirou, faça login novamente!",
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return response.status(400).send({
          message: `Erro de token JWT: ${error.message}`,
        });
      }

      console.log("Internal Server Error", error);
      return response.status(500).send({
        message: `Internal Server Error: ${
          error.message ? error.message : "Unknown error"
        }`,
      });
    }
  }

  public async create(
    request: requestWithKafka.RequestKafka,
    response: Response
  ) {
    const validator = new createValidator(request.body);
    const messages = await validator.handle();

    try {
      if (messages.length > 0) {
        return response.status(400).send({
          errors: {
            messages: messages,
          },
        });
      }

      const HashedPassword = await argon2.hash(request.body.password);

      const user = await prisma.user.create({
        data: {
          first_name: request.body.first_name,
          last_name: request.body.last_name,
          email: request.body.email,
          password: HashedPassword,
        },
      });

      const payload = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      };

      const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

      const token = jwt.sign(payload, PRIVATE_KEY, {
        expiresIn: "7d",
        header: {
          alg: "HS256",
          typ: "JWT",
        },
      });

      await prisma.token.create({
        data: {
          token: token,
          id_user: payload.id,
        },
      });

      await request.producer?.send({
        topic: "user_new",
        messages: [
          {
            value: JSON.stringify({
              clientName: request.clientName,
              token: token,
            }),
          },
        ],
      });

      return response.status(201).setHeader("Authorization", token).send({
        message: "Usuário registrado com sucesso!",
        user: payload,
      });
    } catch (error: any) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error("Erro na verificação do token", error);
        return response.status(400).send({
          message: `Erro na verificação do token: ${error.message}`,
        });
      }
      console.log("Internal Server Error", error.message);
      return response.status(500).send({
        message: `Internal Server Error: ${
          error.message ? error.message : "Unknown error"
        }`,
      });
    }
  }

  public async delete(
    request: requestWithKafka.RequestKafka,
    response: Response
  ) {
    const token = request.header("Authorization") as string;
    const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
    try {
      const payload = jwt.verify(token, PRIVATE_KEY, {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;

      await prisma.token.deleteMany({
        where: {
          id_user: payload.id,
        },
      });

      await prisma.user.delete({
        where: {
          id: payload.id,
        },
      });

      await request.producer?.send({
        topic: "user_delete",
        messages: [
          {
            value: JSON.stringify({
              clientName: request.clientName,
              token: token,
            }),
          },
        ],
      });

      return response.status(200).send({
        message: "Conta deletada com sucesso!",
      });
    } catch (error: any) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error("Erro na verificação do token", error);
        return response.status(400).send({
          message: `Erro na verificação do token: ${error.message}`,
        });
      }

      console.error("Internal Server Error", error.message);
      return response.status(500).send({
        message: `Internal Server Error: ${
          error.message ? error.message : "Unknown error"
        }`,
      });
    }
  }

  public async login(
    request: requestWithKafka.RequestKafka,
    response: Response
  ) {
    const validator = new loginValidator(request.body);
    const messages = await validator.handle();

    try {
      if (messages.length > 0) {
        return response.status(400).send({
          errors: {
            messages: messages,
          },
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          email: request.body.email,
        },
      });

      if (!user) {
        return response.status(400).send({
          message: "Não há nenhuma conta registrada com esse email!",
        });
      }

      const passwordCorrect = await argon2.verify(
        user.password,
        request.body.password
      );

      if (!passwordCorrect) {
        return response.status(400).send({
          message: "A senha está incorreta!",
        });
      }

      const payload = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      };

      const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

      const token = jwt.sign(payload, PRIVATE_KEY, {
        expiresIn: "7d",
        header: {
          alg: "HS256",
          typ: "JWT",
        },
      });

      await prisma.token.create({
        data: {
          id_user: payload.id,
          token: token,
        },
      });

      await request.producer?.send({
        topic: "user_login",
        messages: [
          {
            value: JSON.stringify({
              clientName: request.clientName,
              token: token,
            }),
          },
        ],
      });

      return response.status(201).setHeader("Authorization", token).send({
        message: "Usuário logado com sucesso!",
        user: payload,
      });
    } catch (error: any) {
      console.log("Internal Server Error", error.message);
      return response.status(500).send({
        message: `Internal Server Error: ${
          error.message ? error.message : "Unknown error"
        }`,
      });
    }
  }

  public async logout(
    request: requestWithKafka.RequestKafka,
    response: Response
  ) {
    const token = request.header("Authorization");
    const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
    try {
      if (!token) {
        return response.status(401).send({
          message: "Você não está autenticado!",
        });
      }

      jwt.verify(token, PRIVATE_KEY, {
        algorithms: ["HS256"],
      });

      await prisma.token.delete({
        where: {
          token: token,
        },
      });

      await request.producer?.send({
        topic: "user_logout",
        messages: [
          {
            value: JSON.stringify({
              clientName: request.clientName,
              token: token,
            }),
          },
        ],
      });

      return response.status(200).send({
        message: "Usuário deslogado com sucesso!",
      });
    } catch (error: any) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error("Erro na verificação do token", error);
        return response.status(400).send({
          message: `Erro na verificação do token: ${error.message}`,
        });
      }

      console.error("Internal Server Error", error.message);
      return response.status(500).send({
        message: `Internal Server Error: ${
          error.message ? error.message : "Unknown error"
        }`,
      });
    }
  }
}

export default new Users();
