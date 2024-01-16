declare namespace validator {
  type Fields = any;
  type messages = Array<{
    rule: string;
    field: string;
    message?: string;
  }>;

  type Rule<T> = {
    type: T;
    error: boolean;
    rule: string;
    message?: string;
    model?: string;
    column?: string;
    fieldLength?: number;
    extensions?: string[] | undefined;
  };

  type RuleVerify = {
    type: string;
    error: boolean;
    rule: string;
    message?: string;
    model?: string;
    column?: string;
    fieldLength?: number;
    extensions?: string[] | undefined;
  };

  type Rules = {
    [key: string]: Rule[];
  };

  type rulesString = Array<{
    type: "string" | "all";
    error: boolean;
    rule: string;
    field?: string;
    message?: string;
  }>;

  type rulesNumber = Array<{
    type: "number" | "all";
    error: boolean;
    rule: string;
    field?: string;
    message?: string;
  }>;

  type rulesBoolean = Array<{
    type: "boolean" | "all";
    error: boolean;
    rule: string;
    field?: string;
    message?: string;
  }>;

  type rulesFile = Array<{
    type: "file" | "all";
    error: boolean;
    rule: string;
    field?: string;
    message?: string;
    extensions?: string[];
  }>;

  type validateRules = {
    field: string;
    rule: string;
    fieldLength?: number;
    extensions?: string[];
    options?: Unique;
  };

  type params = {
    extensions: string[];
    fieldValue: any;
    fieldLength?: number;
    options?: Unique;
  };

  type Unique = { model: string; column: string };

  type ModelNames = "product";

  type ColumnsUser = "id" | "name" | "description" | "price" | "category";
}
