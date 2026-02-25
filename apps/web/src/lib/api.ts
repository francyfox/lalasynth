import type { paths } from "@app/src/type";
import createClient from "openapi-fetch";

export const client = createClient<paths>({ baseUrl: "http://localhost:3000" });
