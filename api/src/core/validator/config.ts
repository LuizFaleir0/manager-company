/// <reference path="./index.d.ts" />

import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

export const messagesDefault = {
  string: "Esse campo precisa ser do tipo string!",
  number: "Esse campo precisa ser do tipo number!",
  required: "Esse campo é requerido!",
  email: "Esse campo precisa ser um email válido!",
  minLenght: (length: number) => {
    return `Esse campo precisa ter no mínimo ${length} dígitos!`;
  },
  file: "Esse campo precisa ser um arquivo!",
  extension: (extensions: string[]) => {
    const extensionsString =
      extensions.length > 1
        ? extensions.map((extension) =>
            extensions[0] !== extension ? ` ${extension}` : `${extension}`
          )
        : extensions[0];
    return `O arquivo precisa ser ${
      extensions.length > 1 ? `de algum desses tipos ` : `do tipo`
    } [${extensionsString}]`;
  },
  unique: "Já existe um registro com esse valor",
  uuid: "O campo precisa ser um uuid",
};
export const valuesDefault = {
  minLength: 8,
  maxLength: 20,
};

export const type = {
  all: "all" as "all",
  number: "number" as "number",
  string: "string" as "string",
  boolean: "boolean" as "boolean",
  file: "file" as "file",
};

export const Error = {
  POSSIBILITY: true,
  NOT_POSSIBILITY: false,
};

export const verify = {
  string: ({ fieldValue }: { fieldValue: any }) =>
    typeof fieldValue === "string",
  number: ({ fieldValue }: { fieldValue: any }) =>
    !isNaN(parseFloat(fieldValue)) && isFinite(fieldValue),
  required: ({ fieldValue }: { fieldValue: any }) => {
    return typeof fieldValue !== "undefined" && fieldValue !== "";
  },
  email: ({ fieldValue }: { fieldValue: any }) => {
    const base =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    return base.test(fieldValue);
  },
  minLength: ({
    fieldValue,
    fieldLength,
  }: {
    fieldValue: any;
    fieldLength: number;
  }) => fieldValue.length >= fieldLength,
  file: ({ fieldValue }: { fieldValue: any }) => {
    if (fieldValue === undefined) {
      return false;
    }
    return fieldValue.constructor.name === "File";
  },
  extension: ({
    fieldValue,
    extensions,
  }: {
    fieldValue: any;
    extensions: string[];
  }) => {
    if (fieldValue === undefined) {
      return false;
    }
    const fileName = fieldValue.name;
    const fileExtension = fileName.split(".").pop();

    return extensions.includes(fileExtension);
  },
  unique: async ({
    fieldValue,
    options,
  }: {
    fieldValue: any;
    options: { model: validator.ModelNames; column: validator.ColumnsUser };
  }) => {
    const whereInTable = {
      [options.column]: fieldValue,
    } as Prisma.UserWhereUniqueInput;
    const item = await prisma[options.model].findUnique({
      where: whereInTable,
    });
    return item === null;
  },

  uuid: ({ fieldValue }: { fieldValue: any }) => {
    const base =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return base.test(fieldValue);
  },
} as { [keyof: string]: Function };
