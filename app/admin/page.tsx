```tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const categories = [
  {
    key: "porsi_besar",
    title: "Porsi Besar",
    icon: "🍽️",
  },
  {
    key: "porsi_kecil",
    title: "Porsi Kecil",
    icon: "🥣",
  },
  {
    key: "ibu_hamil_menyusui",
    title: "Ibu Hamil & Menyusui",
    icon: "🤰",
  },
  {
    key: "balita",
    title: "Balita",
    icon: "👶",
  },
];

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function AdminPage() {
  const [selectedCategory, setSelectedCategory] =
    useState("porsi_besar");

  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const currentCategory = categories.find(
    (category) => category.key === selectedCategory
  );

  useEffect(() => {
    loadMenu();
  }, [selectedCategory]);

  async function loadMenu() {
    setMessage("");
    setSelectedFile(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");

    const { data, error } = await supabase
      .from("menu_photos")
      .select("image_url")
      .eq("category", selectedCategory)
      .maybeSingle();

    if (error) {
      console.error("LOAD MENU ERROR:", error);
      setImageUrl("");
      setMessage("Gagal mengambil data menu.");
      return;
    }

    setImageUrl(data?.image_url || "");
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setMessage("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage(
        "File harus berupa foto JPG, PNG, atau WebP."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Ukuran foto maksimal 10 MB.");
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const localPreview = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(localPreview);
  }

  async function saveMenu() {
    if (!selectedFile) {
      setMessage("Silakan pilih foto terlebih dahulu.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      /*
       * Gunakan nama file yang sangat sederhana.
       * Tidak menggunakan nama asli file.
       * Tidak menggunakan folder.
       */
      const uniqueName =
  selectedCategory + "-" + Date.now() + "." + extension;
      console.log("UPLOAD FILE:", uniqueName);
      console.log("UPLOAD TYPE:", selectedFile.type);
      console.log("UPLOAD SIZE:", selectedFile.size);

      const { error: uploadError } = await supabase.storage
  .from("menu-photos")
  .upload(uniqueName, selectedFile, {
    cacheControl: "3600",
    upsert: true,
    contentType: selectedFile.type,
  });

      if (uploadError) {
        console.error(
          "SUPABASE UPLOAD ERROR:",
          uploadError
        );

        setMessage(
          `Gagal upload foto: ${uploadError.message}`
        );

        setLoading(false);
        return;
      }

      const { data: publicData } =
        supabase.storage
          .from("menu-photos")
          .getPublicUrl(uniqueName);

      const publicUrl = publicData.publicUrl;

      if (!publicUrl) {
        setMessage(
          "Foto berhasil diupload tetapi URL foto tidak ditemukan."
        );

        setLoading(false);
        return;
      }

      console.log("PUBLIC URL:", publicUrl);

      /*
       * Simpan URL hasil upload ke tabel menu_photos.
       */
      const { data: existingMenu, error: findError } =
        await supabase
          .from("menu_photos")
          .select("category")
          .eq("category", selectedCategory)
          .maybeSingle();

      if (findError) {
        console.error(
          "FIND MENU ERROR:",
          findError
        );

        setMessage(
          `Foto berhasil diupload, tetapi gagal membaca data menu: ${findError.message}`
        );

        setLoading(false);
        return;
      }

      let databaseError = null;

      if (existingMenu) {
        const result = await supabase
          .from("menu_photos")
          .update({
            image_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("category", selectedCategory);

        databaseError = result.error;
      } else {
        const result = await supabase
          .from("menu_photos")
          .insert({
            category: selectedCategory,
            image_url: publicUrl,
            updated_at: new Date().toISOString(),
          });

        databaseError = result.error;
      }

      if (databaseError) {
        console.error(
          "DATABASE ERROR:",
          databaseError
        );

        setMessage(
          `Foto berhasil diupload, tetapi gagal menyimpan data menu: ${databaseError.message}`
        );

        setLoading(false);
        return;
      }

      setImageUrl(publicUrl);
      setSelectedFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl("");

      setMessage(
        "✅ Foto menu berhasil diupload dan disimpan."
      );
    } catch (error) {
      console.error("UPLOAD EXCEPTION:", error);

      if (error instanceof Error) {
        setMessage(
          `Terjadi kesalahan: ${error.message}`
        );
      } else {
        setMessage(
          "Terjadi kesalahan saat mengupload foto."
        );
      }
    }

    setLoading(false);
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">
            SPPG KELURAHAN JAMBU
          </p>

          <h1>Admin Menu</h1>

          <p>
            Upload foto menu langsung dari HP atau komputer.
          </p>
        </div>

        <a
          href="/"
          className="back-button"
        >
          ← Lihat Halaman Menu
        </a>
      </div>

      <section className="admin-panel">
        <h2>Pilih Kategori</h2>

        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              className={
                selectedCategory === category.key
                  ? "category-button active"
                  : "category-button"
              }
              onClick={() => {
                setSelectedCategory(category.key);
              }}
            >
              <span>{category.icon}</span>
              {category.title}
            </button>
          ))}
        </div>

        <div className="menu-editor">
          <div className="editor-title">
            <span className="editor-icon">
              {currentCategory?.icon}
            </span>

            <div>
              <h2>
                {currentCategory?.title}
              </h2>

              <p>
                Upload foto menu dari HP atau komputer.
              </p>
            </div>
          </div>

          <label htmlFor="menuPhoto">
            Pilih Foto Menu
          </label>

          <input
            id="menuPhoto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={loading}
          />

          {selectedFile && (
            <p className="upload-info">
              File dipilih:{" "}
              <strong>{selectedFile.name}</strong>
            </p>
          )}

          {previewUrl && (
            <div className="image-preview">
              <img
                src={previewUrl}
                alt="Preview foto menu"
              />
            </div>
          )}

          {!previewUrl && imageUrl && (
            <div className="image-preview">
              <img
                src={imageUrl}
                alt={`Foto ${currentCategory?.title}`}
              />
            </div>
          )}

          {!selectedFile &&
            !previewUrl &&
            !imageUrl && (
              <div className="upload-empty">
                📷
                <p>
                  Belum ada foto menu.
                </p>
              </div>
            )}

          <p className="upload-info">
            JPG, PNG, atau WebP • Maksimal 10 MB
          </p>

          <div className="editor-actions">
            <button
              type="button"
              className="save-button"
              onClick={saveMenu}
              disabled={
                loading || !selectedFile
              }
            >
              {loading
                ? "⏳ Mengupload..."
                : "⬆️ Upload & Simpan Menu"}
            </button>
          </div>

          {message && (
            <div
              className={
                message.startsWith("✅")
                  ? "save-message success"
                  : "save-message error"
              }
            >
              {message}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
```
