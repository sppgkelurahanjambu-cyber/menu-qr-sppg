import fs from "node:fs";

const qrSource = fs.readFileSync("app/components/CategoryQr.tsx", "utf8");
const homeSource = fs.readFileSync("app/page.tsx", "utf8");
const adminSource = fs.readFileSync("app/admin/page.tsx", "utf8");

// QR must encode the permanent category page, never the current Storage image URL.
if (/value=\{photoUrl\}/.test(qrSource) || /value=\{imageUrl\}/.test(qrSource)) {
  throw new Error(
    "QR stability check failed: QR tidak boleh menggunakan URL foto langsung."
  );
}

if (!/value=\{qrUrl\}/.test(qrSource)) {
  throw new Error(
    "QR stability check failed: QRCodeCanvas harus menggunakan qrUrl yang stabil."
  );
}

if (!/const qrUrl\s*=\s*`\$\{PUBLIC_SITE_URL\}\$\{categoryPath\}`/.test(qrSource)) {
  throw new Error(
    "QR stability check failed: qrUrl harus dibentuk dari PUBLIC_SITE_URL + categoryPath."
  );
}

if (!/categoryPath:\s*string/.test(qrSource)) {
  throw new Error(
    "QR stability check failed: CategoryQr harus menerima categoryPath."
  );
}

const requiredCategoryPaths = [
  "/porsi-besar",
  "/porsi-kecil",
  "/ibu-hamil-menyusui",
  "/balita",
];

for (const path of requiredCategoryPaths) {
  if (!homeSource.includes(`href: \"${path}\"`)) {
    throw new Error(`QR route check failed: halaman kategori ${path} tidak ditemukan.`);
  }
}

if (!homeSource.includes("categoryPath={category.href}")) {
  throw new Error(
    "QR route check failed: halaman publik harus memberikan category.href ke CategoryQr."
  );
}

// Replacement flow must retain the old URL, upload a new file, update the DB,
// then remove the old Storage object. This prevents stale files from accumulating.
const requiredAdminMarkers = [
  "const oldImageUrl = imageUrl;",
  ".from(\"menu-photos\")",
  ".upload(filePath, selectedFile",
  ".update({ image_url: publicUrl",
  "const oldFilePath = getStoragePathFromPublicUrl(oldImageUrl);",
  ".remove([oldFilePath])",
];

for (const marker of requiredAdminMarkers) {
  if (!adminSource.includes(marker)) {
    throw new Error(
      `Photo replacement check failed: marker tidak ditemukan: ${marker}`
    );
  }
}

const uploadIndex = adminSource.indexOf(".upload(filePath, selectedFile");
const updateIndex = adminSource.indexOf(".update({ image_url: publicUrl");
const deleteIndex = adminSource.indexOf(".remove([oldFilePath])");

if (!(uploadIndex < updateIndex && updateIndex < deleteIndex)) {
  throw new Error(
    "Photo replacement check failed: urutan harus upload foto baru -> update database -> hapus foto lama."
  );
}

console.log("QR stability and photo replacement checks passed.");
