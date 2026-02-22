import { Elysia } from "elysia";
import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/db";
import {
	account as accountTable,
	session as sessionTable,
	UserSchema,
	verification as verificationTable,
} from "@/db/schema";
import { betterAuthPlugin } from "@/libs/better-auth";

describe("BetterAuth Routes", () => {
	let app: Elysia;

	beforeEach(() => {
		// @ts-ignore-next-line
		app = new Elysia().use(betterAuthPlugin).get("/", () => "BetterAuth API");
	});

	beforeEach(async () => {
		await Promise.all([
			db.delete(verificationTable),
			db.delete(accountTable),
			db.delete(sessionTable),
			db.delete(UserSchema),
		]);
	});

	test("GET /auth/session returns 200 with no session", async () => {
		const res = await app.handle(new Request("http://localhost/auth/session"));
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.data).toEqual({ user: null, session: null });
	});

	test("POST /auth/sign-up creates user and returns 201", async () => {
		const body = JSON.stringify({
			email: "test@example.com",
			password: "password123",
		});

		const res = await app.handle(
			new Request("http://localhost/auth/sign-up", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body,
			}),
		);

		expect(res.status).toBe(201);
		const json = await res.json();
		expect(json.data?.user.email).toBe("test@example.com");
	});

	test("POST /auth/sign-in logs in user and returns 200 with session", async () => {
		// First sign up
		const signupBody = JSON.stringify({
			email: "login@example.com",
			password: "password123",
		});

		const signupRes = await app.handle(
			new Request("http://localhost/auth/sign-up", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: signupBody,
			}),
		);
		expect(signupRes.status).toBe(201);

		// Then sign in
		const signinBody = JSON.stringify({
			email: "login@example.com",
			password: "password123",
		});

		const res = await app.handle(
			new Request("http://localhost/auth/sign-in", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: signinBody,
			}),
		);

		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.data?.user.email).toBe("login@example.com");
		expect(json.data?.session).toBeDefined();
	});

	test("POST /auth/sign-out invalidates session and returns 200", async () => {
		// Sign up
		await app.handle(
			new Request("http://localhost/auth/sign-up", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "signout@example.com",
					password: "password123",
				}),
			}),
		);

		// Sign in
		const signinRes = await app.handle(
			new Request("http://localhost/auth/sign-in", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "signout@example.com",
					password: "password123",
				}),
			}),
		);

		const signinJson = await signinRes.json();
		const sessionToken = signinJson.data.session.token;

		// Sign out
		const res = await app.handle(
			new Request("http://localhost/auth/sign-out", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionToken}`,
				},
			}),
		);

		expect(res.status).toBe(200);

		// Verify session is invalid
		const sessionRes = await app.handle(
			new Request("http://localhost/auth/session", {
				headers: { Authorization: `Bearer ${sessionToken}` },
			}),
		);

		expect(sessionRes.status).toBe(200);
		const sessionJson = await sessionRes.json();
		expect(sessionJson.data.session).toBeNull();
	});
});
