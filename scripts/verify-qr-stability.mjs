import fs from "node:fs";

const qrSource = fs.readFileSync("app/components/CategoryQr.tsx", "utf8");
const homeSource = fs.readFileSync("app/page.tsx", "utf8");
const clockSource = fs.readFileSync("app/components/RealTimeDate.tsx", "utf8");
const adminSource = fs.readFileSync("app/admin/page.tsx", "utf8");

// QR must encode the permanent category page, never the current Storage image URL.
if (/value=\{photoUrl\}/.test(qrSource) || /value=\{imageUrl\}/.test(qrSource)) {
  throw new Error("QR stability check failed: QR tidak boleh menggunakan URL foto langsung.");
}
if (!/value=\{qrUrl\}/.test(qrSource)) {
  throw new Error("QR stability check failed: QRCodeCanvas harus menggunakan qrUrl yang stabil.");
}
if (!/const qrUrl\s*=\s*`\$\{PUBLIC_SITE_URL\}\$\{categoryPath\}`/.test(qrSource)) {
  throw new Error("QR stability check failed: qrUrl harus dibentuk dari PUBLIC_SITE_URL + categoryPath.");
}
if (!/categoryPath:\s*string/.test(qrSource)) {
  throw new Error("QR stability check failed: CategoryQr harus menerima categoryPath.");
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
  throw new Error("QR route check failed: halaman publik harus memberikan category.href ke CategoryQr.");
}

// Public homepage requirements. Whitespace is normalized so the test checks
// the actual required content instead of failing on harmless formatting changes.
const normalizedHome = homeSource.replace(/\s+/g, " ").trim();
const requiredHomeMarkers = [
  "KRAJAN RT 01 RW 01 DESA KELURHAN KECAMATAN JAMBU KABUPATEN SEMARANG JAWA TENGAH",
  "<RealTimeDate />",
  "Sesuai Angka Kecukupan Gizi Harian",
];
for (const marker of requiredHomeMarkers) {
  if (!normalizedHome.includes(marker)) {
    throw new Error(`Public page copy check failed: marker tidak ditemukan: ${marker}`);
  }
}

if (!clockSource.includes("Asia/Jakarta")) {
  throw new Error("Real-time date check failed: RealTimeDate harus menggunakan zona waktu Asia/Jakarta.");
}
if (!clockSource.includes("setInterval")) {
  throw new Error("Real-time date check failed: RealTimeDate harus memperbarui waktu secara berkala.");
}
if (!qrSource.includes("Sesuai Angka Kecukupan Gizi Harian")) {
  throw new Error("Category copy check failed: setiap QR kategori harus menampilkan teks standar AKG harian.");
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
    throw new Error(`Photo replacement check failed: marker tidak ditemukan: ${marker}`);
  }
}

const uploadIndex = adminSource.indexOf(".upload(filePath, selectedFile");
const updateIndex = adminSource.indexOf(".update({ image_url: publicUrl");
const deleteIndex = adminSource.indexOf(".remove([oldFilePath])");
if (!(uploadIndex < updateIndex && updateIndex < deleteIndex)) {
  throw new Error("Photo replacement check failed: urutan harus upload foto baru -> update database -> hapus foto lama.");
}

console.log("QR stability, public layout, real-time date, AKG copy, and photo replacement checks passed.");
