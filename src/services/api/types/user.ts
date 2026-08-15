import { FileEntity } from "./file-entity";
import { Role } from "./role";
import { Status } from "./status";

export enum UserProviderEnum {
  EMAIL = "email",
  GOOGLE = "google",
}

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  photo?: FileEntity;
  provider?: UserProviderEnum;
  socialId?: string;
  role?: Role;
  status?: Status;
  createdAt?: string;
};
