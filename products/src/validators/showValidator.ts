import { plan, rules } from "../core/validator/validator";

class showValidator extends plan {
  public handle = () => {
    return this.create({
      id: this.string([rules.uuid()]),
    });
  };
}

export default showValidator;
