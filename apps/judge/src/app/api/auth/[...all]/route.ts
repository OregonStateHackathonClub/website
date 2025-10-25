import { auth, toNextJsHandler } from "@repo/auth";

export const { GET, POST } = toNextJsHandler(auth);
