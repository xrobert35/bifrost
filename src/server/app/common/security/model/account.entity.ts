import { Role } from './role.enum';

export class Account {
  uid: string;
  email: string;
  password: string;
  roles: Role[];
  name: string;
  lastLoginAttempt?: Date;
  lastLoginSuccessful?: Date;
  createdOn?: Date;
  updatedOn?: Date;
}
