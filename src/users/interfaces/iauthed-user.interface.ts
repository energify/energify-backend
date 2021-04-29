import { Roles } from "src/shared/enums/roles.enum";

export interface IAuthedUser {
  id: number;
  name: string;
  email: string;
  birthdate: Date;
  role: Roles;
}
