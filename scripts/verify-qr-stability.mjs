import fs from "node:fs";

const source = fs.readFileSync("app/components/CategoryQr.tsx", "utf8");

if (source.includes("value={photoUrl}")) {
  throw new Error(
    "QR stability check failed: QR masih menggunakan URL foto langsung. QR harus menggunakan URL halaman kategori yang tetap."
  );
}

if (!source.includes("value={qrUrl}")) {
  throw new Error(
    "QR stability check failed: CategoryQr harus memberikan URL kategori yang stabil ke QRCodeCanvas."
  );
}

if (!source.includes("categoryPath")) {
  throw new Error(
    "QR stability check failed: CategoryQr harus menerima path kategori yang tetap."
  );
}

console.log("QR stability check passed.");
