import type { authRoles } from "./auth.roles";
import type { DefaultSession } from "@auth/core/types";

export type SessionUser = DefaultSession["user"] & {
  providerId?: string;
  roles?: Record<keyof typeof authRoles, boolean>;
};
