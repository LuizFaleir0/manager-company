/// <reference path="./index.d.ts" />

import { Error, messagesDefault, type, valuesDefault, verify } from "./config";
export class plan {
  private fields: validator.Fields;
  private messages: validator.messages;
  constructor(fields: validator.Fields) {
    this.fields = fields;
    this.messages = [];
  }
  public async create(rules: validator.Rules) {
    for (const field in rules) {
      rules[field].push({
        type: type.string,
        error: Error.POSSIBILITY,
        rule: "required",
        message: messagesDefault.required,
      });
      rules[field].forEach((item: validator.RuleVerify) => {
        if (item.rule === "optional" && this.fields[field] === undefined) {
          rules[field] = [];
        }
      });

      for (const item of rules[field]) {
        const { error, rule, column, model, extensions, fieldLength, message } =
          item as validator.RuleVerify;
        if (error === Error.NOT_POSSIBILITY) {
          continue;
        }

        if (
          await this.validateField({
            field: field,
            rule: rule,
            fieldLength: fieldLength,
            extensions: extensions,
            options:
              model && column ? { model: model, column: column } : undefined,
          })
        ) {
          continue;
        }

        const messageObject = {
          field: field,
          rule: rule,
          message: message,
        };

        this.messages.push(messageObject);
      }
    }
    return this.messages;
  }

  public string(
    rules?: validator.Rule<"string" | "all">[]
  ): validator.Rule<"string" | "all">[] {
    let rulesString = rules ? rules : [];
    rulesString.push({
      type: type.string,
      error: Error.POSSIBILITY,
      rule: "string",
      message: messagesDefault.string,
    });
    return rulesString;
  }

  public boolean(
    rules?: validator.Rule<"boolean" | "all">[]
  ): validator.Rule<"boolean" | "all">[] {
    let rulesNumber = rules ? rules : [];
    rulesNumber.push({
      type: type.boolean,
      error: Error.POSSIBILITY,
      rule: "boolean",
      message: messagesDefault.number,
    });
    return rulesNumber;
  }

  public file(
    options?: {
      extensions: string[];
    },
    rules?: validator.Rule<"file" | "all">[]
  ): validator.Rule<"file" | "all">[] {
    let rulesFile = rules ? rules : [];
    rulesFile.push({
      type: type.file,
      error: Error.POSSIBILITY,
      rule: "file",
      message: messagesDefault.file,
    });

    if (options?.extensions && options.extensions.length > 0) {
      rulesFile.push({
        type: type.file,
        error: Error.POSSIBILITY,
        rule: "extension",
        message: messagesDefault.extension(options.extensions),
        extensions: options.extensions ? options.extensions : [],
      });
    }
    return rulesFile;
  }

  public number(
    rules?: validator.Rule<"number" | "all">[]
  ): validator.Rule<"number" | "all">[] {
    let rulesNumber = rules ? rules : [];
    rulesNumber.push({
      type: type.number,
      error: Error.POSSIBILITY,
      rule: "number",
      message: messagesDefault.number,
    });
    return rulesNumber;
  }

  private async validateField({
    field,
    rule,
    fieldLength,
    extensions,
    options,
  }: validator.validateRules) {
    const verifyFunction = verify[rule as keyof typeof verify];
    const fieldValue = this.fields[field];

    const params = { fieldValue: fieldValue } as validator.params;

    if (fieldLength !== undefined) {
      if (fieldValue === undefined) {
        return false;
      }
      params.fieldLength = fieldLength;
    }

    if (extensions !== undefined) {
      if (fieldValue === undefined) {
        return false;
      }
      params.extensions = extensions;
    }

    if (options !== undefined) {
      if (fieldValue === undefined) {
        return false;
      }
      params.options = options;
    }

    return await verifyFunction(params);
  }
}

export class rules {
  static optional(): validator.Rule<"all"> {
    return {
      type: type.all,
      error: Error.NOT_POSSIBILITY,
      rule: "optional",
    };
  }

  static minLength(fieldLength?: number): validator.Rule<"string"> {
    return {
      type: type.string,
      error: Error.POSSIBILITY,
      rule: "minLength",
      message: messagesDefault.minLenght(
        fieldLength ? fieldLength : valuesDefault.minLength
      ),
      fieldLength: fieldLength ? fieldLength : valuesDefault.minLength,
    };
  }

  static email(): validator.Rule<"string"> {
    return {
      type: type.string,
      error: Error.POSSIBILITY,
      rule: "email",
      message: messagesDefault.email,
    };
  }

  static unique({ model, column }: validator.Unique): validator.Rule<"all"> {
    return {
      type: type.all,
      error: Error.POSSIBILITY,
      rule: "unique",
      message: messagesDefault.unique,
      model: model,
      column: column,
    };
  }

  static uuid() {
    return {
      type: type.string,
      error: Error.POSSIBILITY,
      rule: "uuid",
      message: messagesDefault.uuid,
    };
  }
}
