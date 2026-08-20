import fs from "node:fs";

const qrSource = fs.readFileSync("app/components/CategoryQr.tsx", "utf8");
const adminSource = fs.readFileSync("app/admin/page.tsx", "utf8");

if (qrSource.includes("value={photoUrl}")) {
  throw new Error(
    "QR stability check failed: QR masih menggunakan URL foto langsung. QR harus menggunakan URL halaman kategori yang tetap."
  );
}

if (!qrSource.includes("value={qrUrl}")) {
  throw new Error(
    "QR stability check failed: CategoryQr harus memberikan URL kategori yang stabil ke QRCodeCanvas."
  );
}

if (!qrSource.includes("categoryPath")) {
  throw new Error(
    "QR stability check failed: CategoryQr harus menerima path kategori yang tetap."
  );
}

if (!adminSource.includes("oldImageUrl")) {
  throw new Error(
    "Photo replacement check failed: admin harus menyimpan URL foto lama sebelum mengganti foto."
  );
}

if (!adminSource.includes("storage.from(\"menu-photos\").remove")) {
  throw new Error(
    "Photo replacement check failed: admin harus menghapus file foto lama dari Storage."
  );
}

if (!adminSource.includes("oldFilePath")) {
  throw new Error(
    "Photo replacement check failed: admin harus menentukan path file lama sebelum menghapusnya."
  );
}

console.log("QR stability and photo replacement checks passed.");
