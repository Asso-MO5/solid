import { SolidAuth } from "@solid-mediakit/auth";
import { authOptions } from "~/features/auth/auth.api";

export const { GET, POST } = SolidAuth(authOptions);
