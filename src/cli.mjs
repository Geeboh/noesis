import { createObservatory, parseServerConfig } from "./server.mjs";
import { addressCandidates, selectAdvertisedHost, startupInstructions } from "./lan.mjs";

const config = parseServerConfig();
const started = await createObservatory({ config });
const candidates = addressCandidates();
const address = started.address;
const port = typeof address === "object" && address ? address.port : config.port;
const host = selectAdvertisedHost(config, candidates);
console.log(startupInstructions({ host, port, candidates, pairingCode: started.pairing_code.code }));

const shutdown = () => {
  started.server.close(() => started.service.close());
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
