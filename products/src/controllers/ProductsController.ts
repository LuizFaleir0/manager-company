import { Response, Request } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import createValidator from "../validators/createValidator";
import showValidator from "../validators/showValidator";
import updateValidator from "../validators/updateValidator";
const prisma = new PrismaClient();
class Products {
  public async index(request: Request, response: Response) {
    const token = request.header("Authorization") as string;
    const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

    try {
      jwt.verify(token, PRIVATE_KEY, {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;

      const productsAll = await prisma.product.findMany();

      if (productsAll.length === 0) {
        return response.status(404).send({
          messages: "Ainda não há nenhum produto cadastrado!",
        });
      }

      return response.status(200).send({
        message: "Dados de produtos coletados com sucesso!",
        products: productsAll,
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

      console.error("Internal Server Error", error);
      return response.status(500).send({
        message: `Internal Server Error: ${
          error.message ? error.message : "Unknown error"
        }`,
      });
    }
  }

  public async show(request: Request, response: Response) {
    const validator = new showValidator(request.query);
    const messages = await validator.handle();

    const token = request.header("Authorization") as string;
    const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

    try {
      if (messages.length > 0) {
        return response.status(400).send({
          erros: {
            messages: messages,
          },
        });
      }

      jwt.verify(token, PRIVATE_KEY, {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;

      const product = await prisma.product.findUnique({
        where: {
          id: request.query.id as string,
        },
      });

      if (!product) {
        return response.status(404).send({
          message: "Produto não encontrado!",
        });
      }

      return response.status(200).send({
        message: "Dados de produto coletado com sucesso!",
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price.toString()),
          category: product.category,
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

  public async create(request: Request, response: Response) {
    const validator = new createValidator(request.body);
    const messages = await validator.handle();
    const token = request.header("Authorization") as string;
    const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

    try {
      if (messages.length > 0) {
        return response.status(400).send({
          errors: {
            messages: messages,
          },
        });
      }

      jwt.verify(token, PRIVATE_KEY, {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;

      const data = {
        name: request.body.name,
        description: request.body.description,
        price: request.body.price,
        category: request.body.category,
      };

      const product = await prisma.product.create({
        data: data,
      });

      return response.status(201).send({
        message: "Produto registrado com sucesso!",
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price.toString()),
          category: product.category,
        },
      });
    } catch (error: any) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error("Erro na verificação do token", error);
        return response.status(400).send({
          message: `Erro na verificação do token: ${error.message}`,
        });
      }
      console.error("Internal Server Error", error);
      return response.status(500).send({
        message: `Internal Server Error: ${
          error.message ? error.message : "Unknown error"
        }`,
      });
    }
  }

  public async update(request: Request, response: Response) {
    const validator = new updateValidator({
      ...request.body,
      ...request.query,
    });
    const messages = await validator.handle();
    const token = request.header("Authorization") as string;
    const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

    try {
      if (messages.length > 0) {
        return response.status(400).send({
          errors: {
            messages: messages,
          },
        });
      }

      jwt.verify(token, PRIVATE_KEY, {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;

      const data = {
        name: request.body.name,
        description: request.body.description,
        price: request.body.price,
        category: request.body.category,
      };

      const product = await prisma.product.update({
        where: {
          id: request.query.id as string,
        },

        data: data,
      });

      return response.status(200).send({
        message: "Produto atualizado com sucesso!",
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price.toString()),
          category: product.category,
        },
      });
    } catch (error: any) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error("Erro na verificação do token", error);
        return response.status(400).send({
          message: `Erro na verificação do token: ${error.message}`,
        });
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return response.status(404).send({
          message: "Produto não encontrado!",
        });
      }

      console.error("Internal Server Error", error);
      return response.status(500).send({
        message: `Internal Server Error: ${
          error.message ? error.message : "Unknown error"
        }`,
      });
    }
  }

  public async delete(request: Request, response: Response) {
    const validator = new showValidator(request.query);
    const token = request.header("Authorization") as string;
    const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

    try {
      validator.handle();
      jwt.verify(token, PRIVATE_KEY, {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;

      await prisma.product.delete({
        where: {
          id: request.query.id as string,
        },
      });

      return response.status(200).send({
        message: "Produto deletado com sucesso!",
      });
    } catch (error: any) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error("Erro na verificação do token", error);
        return response.status(400).send({
          message: `Erro na verificação do token: ${error.message}`,
        });
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return response.status(404).send({
          message: "Produto não encontrado!",
        });
      }

      console.error("Internal Server Error", error);
      return response.status(500).send({
        message: `Internal Server Error: ${
          error.message ? error.message : "Unknown error"
        }`,
      });
    }
  }
}

export default new Products();
