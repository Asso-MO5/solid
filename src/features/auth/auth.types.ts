import type { DefaultSession } from "@auth/core/types";

export type SessionUser = DefaultSession["user"] & {
  email?: string;
  avatar?: string;
  username?: string;
  roles?: string[];
};
