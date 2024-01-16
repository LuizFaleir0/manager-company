import { plan, rules } from "../core/validator/validator";

class createValidator extends plan {
  public handle = () => {
    return this.create({
      name: this.string([rules.unique({ model: "product", column: "name" })]),
      description: this.string(),
      price: this.number(),
      category: this.string(),
    });
  };
}

export default createValidator;
