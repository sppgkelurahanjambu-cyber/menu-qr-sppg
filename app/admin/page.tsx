"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const categories = [
  { key: "porsi_besar", title: "Porsi Besar", icon: "🍽️" },
  { key: "porsi_kecil", title: "Porsi Kecil", icon: "🥣" },
  { key: "ibu_hamil_menyusui", title: "Ibu Hamil & Menyusui", icon: "🤰" },
  { key: "balita", title: "Balita", icon: "👶" },
];

const supabase = createBrowserClient(
  "https://zqnpgjmejaetafgahzlw.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function AdminPage() {
  const [selectedCategory, setSelectedCategory] = useState("porsi_besar");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const currentCategory = categories.find((c) => c.key === selectedCategory);

  useEffect(() => {
    async function loadMenu() {
      setMessage("");
      setSelectedFile(null);
      setPreviewUrl("");
      const { data, error } = await supabase
        .from("menu_photos")
        .select("image_url")
        .eq("category", selectedCategory)
        .maybeSingle();
      if (error) {
        console.error(error);
        setImageUrl("");
        setMessage(`Gagal mengambil data menu: ${error.message}`);
        return;
      }
      setImageUrl(data?.image_url || "");
    }
    loadMenu();
  }, [selectedCategory]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setMessage("");
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("File harus JPG, PNG, atau WebP.");
      event.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Ukuran foto maksimal 10 MB.");
      event.target.value = "";
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function saveMenu() {
    if (!selectedFile) {
      setMessage("Silakan pilih foto terlebih dahulu.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const extension = selectedFile.type === "image/png"
        ? "png"
        : selectedFile.type === "image/webp"
          ? "webp"
          : "jpg";

      // Storage path must be a plain relative path inside the bucket.
      // Do not include the bucket name or a leading slash here.
      const filePath = `${selectedCategory}-${Date.now()}.${extension}`;

      const upload = await supabase.storage
        .from("menu-photos")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
          contentType: selectedFile.type,
        });

      if (upload.error) {
        console.error("STORAGE UPLOAD ERROR", upload.error);
        setMessage(`Gagal upload foto: ${upload.error.message}`);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("menu-photos")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        setMessage("Upload berhasil, tetapi URL foto tidak ditemukan.");
        return;
      }

      const { error: updateError } = await supabase
        .from("menu_photos")
        .update({
          image_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("category", selectedCategory);

      if (updateError) {
        console.error("MENU UPDATE ERROR", updateError);
        setMessage(`Foto terupload, tetapi data menu gagal disimpan: ${updateError.message}`);
        return;
      }

      setImageUrl(urlData.publicUrl);
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      setMessage("Foto menu berhasil diupload dan disimpan.");
    } catch (error) {
      console.error("UPLOAD ERROR", error);
      setMessage(`Upload gagal: ${error instanceof Error ? error.message : "Kesalahan tidak diketahui"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">SPPG KELURAHAN JAMBU</p>
          <h1>Admin Menu</h1>
          <p>Upload foto menu untuk ditampilkan pada halaman publik.</p>
        </div>
        <a href="/" className="back-button">← Lihat Halaman Menu</a>
      </div>

      <section className="admin-panel">
        <h2>Pilih Kategori</h2>
        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              className={selectedCategory === category.key ? "category-button active" : "category-button"}
              onClick={() => setSelectedCategory(category.key)}
            >
              <span>{category.icon}</span>
              {category.title}
            </button>
          ))}
        </div>

        <div className="menu-editor">
          <div className="editor-title">
            <span className="editor-icon">{currentCategory?.icon}</span>
            <div>
              <h2>{currentCategory?.title}</h2>
              <p>Pilih foto menu langsung dari HP atau komputer.</p>
            </div>
          </div>

          <label htmlFor="menuPhoto">Foto Menu</label>
          <input
            id="menuPhoto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />

          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview foto menu" />
            </div>
          )}

          {!previewUrl && imageUrl && (
            <div className="image-preview">
              <img src={imageUrl} alt={`Foto ${currentCategory?.title}`} />
            </div>
          )}

          <p className="upload-info">Format JPG, PNG, atau WebP. Maksimal 10 MB.</p>

          <div className="editor-actions">
            <button
              type="button"
              className="save-button"
              onClick={saveMenu}
              disabled={loading || !selectedFile}
            >
              {loading ? "Mengupload..." : "⬆️ Upload & Simpan Menu"}
            </button>
            {message && <span className="save-message">{message}</span>}
          </div>
        </div>
      </section>
    </main>
  );
}
