import { plan, rules } from "../core/validator/validator";

class createValidator extends plan {
  public handle = () => {
    return this.create({
      first_name: this.string(),
      last_name: this.string(),
      email: this.string([
        rules.email(),
        rules.unique({
          model: "user",
          column: "email",
        }),
      ]),
      password: this.string([rules.minLength(11)]),
    });
  };
}

export default createValidator;
