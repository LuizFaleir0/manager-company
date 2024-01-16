import { plan, rules } from "../core/validator/validator";

class updateValidator extends plan {
  public handle = () => {
    return this.create({
      id: this.string([rules.uuid()]),
      name: this.string([rules.unique({ model: "product", column: "name" })]),
      description: this.string(),
      price: this.number(),
      category: this.string(),
    });
  };
}

export default updateValidator;
