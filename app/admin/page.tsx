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
       * Ambil ekstensi file.
       * Contoh:
       * foto.jpg -> jpg
       * foto.png -> png
       * foto.webp -> webp
       */
      const extension =
        selectedFile.name.split(".").pop()?.toLowerCase() ||
        "jpg";

      /*
       * Nama file sederhana tanpa folder.
       */
      const uniqueName =
        selectedCategory +
        "-" +
        Date.now() +
        "." +
        extension;

      console.log("UPLOAD FILE:", uniqueName);
      console.log("UPLOAD TYPE:", selectedFile.type);
      console.log("UPLOAD SIZE:", selectedFile.size);

      /*
       * Upload ke Supabase Storage.
       */
      const { error: uploadError } =
        await supabase.storage
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

      /*
       * Ambil URL publik foto.
       */
      const { data: publicUrlData } =
        supabase.storage
          .from("menu-photos")
          .getPublicUrl(uniqueName);

      const publicUrl =
        publicUrlData.publicUrl;

      console.log("PUBLIC URL:", publicUrl);

      /*
       * Simpan URL foto ke tabel menu_photos.
       */
      const { error: updateError } =
        await supabase
          .from("menu_photos")
          .update({
            image_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("category", selectedCategory);

      if (updateError) {
        console.error(
          "UPDATE MENU ERROR:",
          updateError
        );

        setMessage(
          "Foto berhasil diupload, tetapi gagal menyimpan data menu."
        );

        setLoading(false);
        return;
      }

      /*
       * Berhasil.
       */
      setImageUrl(publicUrl);
      setSelectedFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl("");

      setMessage(
        "Foto menu berhasil diupload dan disimpan."
      );
    } catch (error) {
      console.error(
        "UPLOAD UNEXPECTED ERROR:",
        error
      );

      setMessage(
        "Terjadi kesalahan saat mengupload foto."
      );
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
            Upload foto menu untuk ditampilkan
            pada halaman publik.
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
              onClick={() =>
                setSelectedCategory(
                  category.key
                )
              }
            >
              <span>
                {category.icon}
              </span>

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
                Pilih foto menu langsung
                dari HP atau komputer.
              </p>
            </div>
          </div>

          <label htmlFor="menuPhoto">
            Foto Menu
          </label>

          <input
            id="menuPhoto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />

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

          <p className="upload-info">
            Format JPG, PNG, atau WebP.
            Maksimal 10 MB.
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
                ? "Mengupload..."
                : "⬆️ Upload & Simpan Menu"}
            </button>

            {message && (
              <span className="save-message">
                {message}
              </span>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
