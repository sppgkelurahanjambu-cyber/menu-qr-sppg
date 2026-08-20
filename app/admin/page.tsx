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

  const [currentImage, setCurrentImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
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
    setPreview("");

    const { data, error } = await supabase
      .from("menu_photos")
      .select("image_url")
      .eq("category", selectedCategory)
      .maybeSingle();

    if (error) {
      console.error("Load menu error:", error);
      setCurrentImage("");
      return;
    }

    setCurrentImage(data?.image_url || "");
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage("");

    if (!file.type.startsWith("image/")) {
      setMessage("File yang dipilih harus berupa foto.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Ukuran foto maksimal 10 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  }

  async function uploadMenu() {
    if (!selectedFile) {
      setMessage("Silakan pilih foto menu terlebih dahulu.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const extension =
        selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName =
        `${selectedCategory}-${Date.now()}.${extension}`;

      const filePath = `menu/${fileName}`;

      /*
       * Upload foto ke Supabase Storage
       */
      const { error: uploadError } = await supabase.storage
        .from("menu-photos")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: selectedFile.type,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setMessage(
          `Gagal upload foto: ${uploadError.message}`
        );
        setLoading(false);
        return;
      }

      /*
       * Ambil URL foto
       */
      const { data: publicUrlData } = supabase.storage
        .from("menu-photos")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      /*
       * Simpan URL ke tabel menu_photos
       */
      const { error: databaseError } = await supabase
        .from("menu_photos")
        .update({
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("category", selectedCategory);

      if (databaseError) {
        console.error(
          "Database error:",
          databaseError
        );

        setMessage(
          `Foto berhasil diupload, tetapi gagal menyimpan data: ${databaseError.message}`
        );

        setLoading(false);
        return;
      }

      setCurrentImage(imageUrl);
      setSelectedFile(null);
      setPreview("");

      setMessage(
        `Foto ${currentCategory?.title} berhasil disimpan.`
      );
    } catch (error) {
      console.error("Unexpected error:", error);

      setMessage(
        "Terjadi kesalahan saat mengupload foto."
      );
    }

    setLoading(false);
  }

  return (
    <main className="admin-page">

      {/* HEADER */}
      <div className="admin-header">
        <div>
          <p className="eyebrow">
            SPPG KELURAHAN JAMBU
          </p>

          <h1>Admin Menu</h1>

          <p>
            Upload foto menu yang akan tampil pada
            halaman publik.
          </p>
        </div>

        <a
          href="/"
          className="back-button"
        >
          ← Lihat Halaman Menu
        </a>
      </div>


      {/* PANEL */}
      <section className="admin-panel">

        <h2>Pilih Kategori</h2>

        {/* KATEGORI */}
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
                setSelectedCategory(category.key)
              }
            >
              <span className="category-icon">
                {category.icon}
              </span>

              <span>
                {category.title}
              </span>
            </button>
          ))}

        </div>


        {/* EDITOR */}
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
                Pilih foto menu langsung dari HP
                atau komputer.
              </p>
            </div>

          </div>


          {/* FILE INPUT */}
          <label
            htmlFor="menuPhoto"
            className="upload-label"
          >
            Pilih Foto Menu
          </label>

          <input
            id="menuPhoto"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            onChange={handleFileChange}
            className="file-input"
          />


          {/* PREVIEW FOTO BARU */}
          {preview && (
            <div className="image-preview">

              <p className="preview-title">
                Preview Foto Baru
              </p>

              <img
                src={preview}
                alt="Preview foto menu"
              />

            </div>
          )}


          {/* FOTO YANG TERSIMPAN */}
          {!preview && currentImage && (
            <div className="image-preview">

              <p className="preview-title">
                Foto Menu Saat Ini
              </p>

              <img
                src={currentImage}
                alt={`Menu ${currentCategory?.title}`}
              />

            </div>
          )}


          {!currentImage && !preview && (
            <div className="empty-preview">
              Belum ada foto menu untuk kategori ini.
            </div>
          )}


          <p className="upload-info">
            JPG, PNG, atau WebP. Maksimal 10 MB.
          </p>


          {/* BUTTON */}
          <div className="editor-actions">

            <button
              type="button"
              className="save-button"
              onClick={uploadMenu}
              disabled={
                loading || !selectedFile
              }
            >
              {loading
                ? "Mengupload..."
                : "Upload & Simpan Menu"}
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
