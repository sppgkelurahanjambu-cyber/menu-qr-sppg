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

  useEffect(() => {
    loadMenu();
  }, [selectedCategory]);

  async function loadMenu() {
    setMessage("");
    setSelectedFile(null);
    setPreviewUrl("");

    const { data, error } = await supabase
      .from("menu_photos")
      .select("image_url")
      .eq("category", selectedCategory)
      .single();

    if (error) {
      console.error(error);
      setImageUrl("");
      return;
    }

    setImageUrl(data?.image_url || "");
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("File harus berupa gambar.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Ukuran foto maksimal 10 MB.");
      return;
    }

    setSelectedFile(file);
    setMessage("");

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  async function saveMenu() {
    if (!selectedFile) {
      setMessage("Silakan pilih foto menu terlebih dahulu.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const fileExtension =
        selectedFile.name.split(".").pop() || "jpg";

      const fileName = `${selectedCategory}-${Date.now()}.${fileExtension}`;

      const filePath = `${selectedCategory}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-photos")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: selectedFile.type,
        });

      if (uploadError) {
        console.error(uploadError);
        setMessage("Gagal mengupload foto.");
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("menu-photos")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("menu_photos")
        .update({
          image_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("category", selectedCategory);

      if (updateError) {
        console.error(updateError);
        setMessage(
          "Foto berhasil diupload, tetapi gagal menyimpan menu."
        );
        setLoading(false);
        return;
      }

      setImageUrl(publicUrl);
      setSelectedFile(null);
      setPreviewUrl("");

      setMessage("Foto menu berhasil disimpan.");
    } catch (error) {
      console.error(error);
      setMessage("Terjadi kesalahan saat menyimpan foto.");
    }

    setLoading(false);
  }

  const currentCategory = categories.find(
    (category) => category.key === selectedCategory
  );

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">
            SPPG KELURAHAN JAMBU
          </p>

          <h1>Admin Menu</h1>

          <p>
            Upload foto menu untuk ditampilkan pada
            halaman publik.
          </p>
        </div>

        <a href="/" className="back-button">
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
                setSelectedCategory(category.key)
              }
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
              <h2>{currentCategory?.title}</h2>

              <p>
                Upload foto menu untuk kategori ini.
              </p>
            </div>
          </div>

          <label htmlFor="menuPhoto">
            Foto Menu
          </label>

          <input
            id="menuPhoto"
            className="file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleFileChange}
          />

          {selectedFile && (
            <p className="selected-file">
              Foto dipilih: <strong>{selectedFile.name}</strong>
            </p>
          )}

          {(previewUrl || imageUrl) && (
            <div className="image-preview">
              <img
                src={previewUrl || imageUrl}
                alt={`Foto ${currentCategory?.title}`}
              />
            </div>
          )}

          <div className="editor-actions">
            <button
              type="button"
              className="save-button"
              onClick={saveMenu}
              disabled={loading || !selectedFile}
            >
              {loading
                ? "Mengupload..."
                : "Simpan Foto Menu"}
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
