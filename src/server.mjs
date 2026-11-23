import { createServer } from "node:http";
import { join } from "node:path";
import { openService } from "./service.mjs";

export function parseServerConfig(env = process.env) {
  const bind_host = env.NOESIS_BIND_HOST ?? "0.0.0.0";
  const port = Number(env.NOESIS_PORT ?? 7337);
  const data_directory = env.NOESIS_DATA_DIR ?? join(process.cwd(), ".noesis");
  const advertised_host = env.NOESIS_ADVERTISED_HOST || null;
  if (!bind_host || /\s/.test(bind_host)) throw new Error("invalid NOESIS_BIND_HOST");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("invalid NOESIS_PORT");
  if (advertised_host && (/\s/.test(advertised_host) || ["0.0.0.0", "::", "*"].includes(advertised_host))) throw new Error("invalid NOESIS_ADVERTISED_HOST");
  return { bind_host, port, data_directory, advertised_host };
}

export function startServer({ config = parseServerConfig(), service = openService(join(config.data_directory, "mind.sqlite")), requestHandler = null } = {}) {
  const server = createServer(requestHandler ?? (() => {}));
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve({ server, service, address: server.address() });
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(config.port, config.bind_host);
  });
}
