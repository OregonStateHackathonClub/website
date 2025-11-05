import { auth, toNextJsHandler } from "@repo/auth";

export const { POST, GET } = toNextJsHandler(auth);
