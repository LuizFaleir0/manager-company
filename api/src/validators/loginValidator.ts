import { plan, rules } from "../core/validator/validator";

class loginValidator extends plan {
  public handle = () => {
    return this.create({
      email: this.string([rules.email()]),
      password: this.string([rules.minLength(11)]),
    });
  };
}

export default loginValidator;
