import { networkInterfaces } from "node:os";
import QRCode from "qrcode";
import { checkedQrUrl } from "./pairing-policy.mjs";

export function addressCandidates() {
  const candidates = [];
  for (const [name, entries] of Object.entries(networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.internal || entry.family !== "IPv4") continue;
      candidates.push({ interface: name, host: entry.address });
    }
  }
  return candidates;
}

export function selectAdvertisedHost(config, candidates = addressCandidates()) {
  if (config.advertised_host) return config.advertised_host;
  return candidates[0]?.host ?? "127.0.0.1";
}

export function accessUrl(host, port, path = "/") {
  const displayHost = host.includes(":") && !host.startsWith("[") ? `[${host}]` : host;
  return `http://${displayHost}:${port}${path}`;
}

export function renderTextQr(url) {
  const checked = checkedQrUrl(url);
  const qr = QRCode.create(checked, { errorCorrectionLevel: "M" });
  const size = qr.modules.size + 8;
  const matrix = Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, column) => {
    const qrRow = row - 4;
    const qrColumn = column - 4;
    return qrRow >= 0 && qrColumn >= 0 && qrRow < qr.modules.size && qrColumn < qr.modules.size && qr.modules.get(qrColumn, qrRow);
  }));
  const lines = [];
  for (let row = 0; row < matrix.length; row += 2) {
    const top = matrix[row];
    const bottom = matrix[row + 1] ?? Array(matrix.length).fill(false);
    lines.push(top.map((value, column) => ({ top: value, bottom: bottom[column] })).map(({ top, bottom }) => top && bottom ? "█" : top ? "▀" : bottom ? "▄" : " ").join(""));
  }
  return lines.join("\n");
}

export function startupInstructions({ host, port, candidates, pairingCode }) {
  const url = accessUrl(host, port, "/");
  const alternatives = candidates.map((candidate) => `  ${candidate.interface}: ${accessUrl(candidate.host, port, "/")}`).join("\n");
  return [`NOESIS ready at ${url}`, "", renderTextQr(url), "", `Pairing code (separate from QR, expires soon): ${pairingCode}`, "", "Reachable addresses:", alternatives || `  loopback: ${url}`].join("\n");
}
