"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const categories = [
  { key: "porsi_besar", title: "Porsi Besar", icon: "🍽️" },
  { key: "porsi_kecil", title: "Porsi Kecil", icon: "🥣" },
  { key: "ibu_hamil_menyusui", title: "Ibu Hamil & Menyusui", icon: "🤰" },
  { key: "balita", title: "Balita", icon: "👶" },
];

const SUPABASE_URL = "https://zqnpgjmejaetafgahzlw.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_KEY);

export default function AdminPage() {
  const [selectedCategory, setSelectedCategory] = useState("porsi_besar");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const currentCategory = categories.find((c) => c.key === selectedCategory);

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      setMessage("");
      setSelectedFile(null);

      const { data, error } = await supabase
        .from("menu_photos")
        .select("image_url")
        .eq("category", selectedCategory)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("LOAD MENU ERROR", error);
        setImageUrl("");
        setMessage(`Gagal mengambil data menu: ${error.message}`);
        return;
      }

      setImageUrl(data?.image_url || "");
      setPreviewUrl("");
    }

    loadMenu();

    return () => {
      cancelled = true;
    };
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

    if (!SUPABASE_KEY) {
      setMessage("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum tersedia di Vercel.");
      return;
    }

    setLoading(true);
    setMessage("Mengupload foto...");

    try {
      const extension =
        selectedFile.type === "image/png"
          ? "png"
          : selectedFile.type === "image/webp"
            ? "webp"
            : "jpg";

      // Hanya nama file relatif di dalam bucket. Tidak ada slash di awal.
      const filePath = `${selectedCategory}-${Date.now()}.${extension}`;

      // Upload langsung ke REST Storage API. Ini menghindari masalah
      // pembentukan URL path pada Storage client.
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/menu-photos/${encodeURIComponent(filePath)}`;

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": selectedFile.type,
          "x-upsert": "true",
          "cache-control": "3600",
        },
        body: selectedFile,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("STORAGE REST ERROR", uploadResponse.status, errorText);

        let detail = errorText;
        try {
          const parsed = JSON.parse(errorText);
          detail = parsed.message || parsed.error || errorText;
        } catch {
          // Keep plain response text.
        }

        setMessage(`Gagal upload foto (${uploadResponse.status}): ${detail}`);
        return;
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/menu-photos/${encodeURIComponent(filePath)}`;

      const { error: updateError } = await supabase
        .from("menu_photos")
        .update({
          image_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("category", selectedCategory);

      if (updateError) {
        console.error("MENU UPDATE ERROR", updateError);
        setMessage(
          `Foto berhasil diupload, tetapi data menu gagal disimpan: ${updateError.message}`
        );
        return;
      }

      setImageUrl(publicUrl);
      setSelectedFile(null);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      setMessage("Foto menu berhasil diupload dan disimpan.");
    } catch (error) {
      console.error("UPLOAD ERROR", error);
      setMessage(
        `Upload gagal: ${error instanceof Error ? error.message : "Kesalahan tidak diketahui"}`
      );
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

          <p className="upload-info">
            Format JPG, PNG, atau WebP. Maksimal 10 MB.
          </p>

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
