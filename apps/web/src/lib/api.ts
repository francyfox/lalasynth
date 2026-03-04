import type { paths } from "@app/src/type";
import createClient from "openapi-fetch";

export const client = createClient<paths>({
	baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});
