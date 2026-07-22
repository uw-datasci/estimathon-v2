import autoLoad from "@fastify/autoload";
import Fastify from "fastify";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { registerPlugins } from "./plugins";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isProduction = process.env.NODE_ENV === "production";

export async function buildServer() {
  const server = Fastify({
    logger: isProduction
      ? true
      : {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss",
              ignore: "pid,hostname",
            },
          },
        },
  });

  await registerPlugins(server);

  await server.register(autoLoad, {
    dir: join(__dirname, "routes"),
    forceESM: true,
  });

  return server;
}

async function start() {
  const server = await buildServer();
  const port = Number(server.config.PORT);
  const host = server.config.HOST;

  try {
    await server.listen({ host, port });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

const isEntryPoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntryPoint) await start();
