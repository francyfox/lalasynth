import { betterAuthPlugin } from '@/libs/better-auth'
import { routes } from '@/routes'
import { Elysia, t } from 'elysia'
import { cors } from "@elysiajs/cors";


const app = new Elysia()
  .use(
    cors({
      origin: "http://localhost:3001",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(betterAuthPlugin)
  .use(routes).listen(3000, (server) => {
  console.log(
    `🦊 Elysia is running at http://${server?.hostname}:${server?.port}`
  );
});

const stop = async () => {
  console.log("🛑 Shutdown initiated...");

  // 1. Останавливаем сервер (прекращаем прием новых запросов)
  await app.stop();

  // 2. Закрываем соединения с БД (Turso/SQLite)
  // await db.close();

  console.log("✨ Gracefully terminated. See you, Fox.");
  process.exit(0);
};

// Перехватываем сигналы системы
process.on("SIGINT", stop);
process.on("SIGTERM", stop);