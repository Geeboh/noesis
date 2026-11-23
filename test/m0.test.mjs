import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import QRCode from "qrcode";

test("selected Node runtime supplies SQLite and QR primitives", () => {
  const db = new DatabaseSync(":memory:");
  db.exec("CREATE TABLE probe(value TEXT NOT NULL)");
  db.prepare("INSERT INTO probe(value) VALUES (?)").run("ok");
  assert.equal(db.prepare("SELECT value FROM probe").get().value, "ok");
  db.close();

  const qr = QRCode.create("http://192.0.2.1:7337/pair", {
    errorCorrectionLevel: "M",
  });
  assert.equal(qr.modules.size > 0, true);
});
