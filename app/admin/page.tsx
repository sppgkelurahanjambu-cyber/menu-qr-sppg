"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";

const categories = [
  { key: "porsi_besar", title: "Porsi Besar", icon: "🍽️" },
  { key: "porsi_kecil", title: "Porsi Kecil", icon: "🥣" },
  { key: "ibu_hamil_menyusui", title: "Ibu Hamil & Menyusui", icon: "🤰" },
  { key: "balita", title: "Balita", icon: "👶" },
];

const supabase = createClient();

function getStoragePathFromPublicUrl(url: string) {
  const marker = "/storage/v1/object/public/menu-photos/";
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) return "";

  const path = url.slice(markerIndex + marker.length).split("?")[0];

  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

export default function AdminPage() {
  const [selectedCategory, setSelectedCategory] = useState("porsi_besar");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const currentCategory = categories.find((c) => c.key === selectedCategory);

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      setMessage("");
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");

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
    }

    loadMenu();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setMessage("Mengupload foto...");

    const oldImageUrl = imageUrl;

    try {
      const extension =
        selectedFile.type === "image/png"
          ? "png"
          : selectedFile.type === "image/webp"
            ? "webp"
            : "jpg";
      const filePath = `${selectedCategory}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-photos")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: selectedFile.type,
        });

      if (uploadError) {
        console.error("STORAGE UPLOAD ERROR", uploadError);
        setMessage(`Gagal upload foto: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("menu-photos")
        .getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("menu_photos")
        .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("category", selectedCategory);

      if (updateError) {
        console.error("MENU UPDATE ERROR", updateError);

        // Jangan tinggalkan file baru jika database gagal menunjuk ke file tersebut.
        await supabase.storage.from("menu-photos").remove([filePath]);

        setMessage(`Foto gagal disimpan: ${updateError.message}`);
        return;
      }

      // QR tetap sama karena QR mengarah ke halaman kategori.
      // Yang berubah hanya foto yang ditampilkan halaman tersebut.
      setImageUrl(publicUrl);

      // Hapus file lama setelah database sudah menunjuk ke foto baru.
      if (oldImageUrl && oldImageUrl !== publicUrl) {
        const oldFilePath = getStoragePathFromPublicUrl(oldImageUrl);

        if (oldFilePath && oldFilePath !== filePath) {
          const { error: deleteError } = await supabase.storage
            .from("menu-photos")
            .remove([oldFilePath]);

          if (deleteError) {
            console.error("OLD PHOTO DELETE ERROR", deleteError);
            setMessage(
              "Foto baru berhasil disimpan, tetapi foto lama belum dapat dihapus."
            );
          } else {
            setMessage("Foto baru berhasil disimpan dan foto lama terhapus.");
          }
        } else {
          setMessage("Foto baru berhasil disimpan.");
        }
      } else {
        setMessage("Foto menu berhasil disimpan.");
      }

      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    } catch (error) {
      console.error("UPLOAD ERROR", error);
      setMessage(
        `Upload gagal: ${
          error instanceof Error ? error.message : "Kesalahan tidak diketahui"
        }`
      );
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">SPPG SEMARANG JAMBU JAMBU 02</p>
          <h1>Admin Menu</h1>
          <p>Kelola foto menu langsung dari HP atau komputer.</p>
        </div>
        <div className="admin-header-actions">
          <a href="/" className="back-button">← Halaman Publik</a>
          <button type="button" className="logout-button" onClick={logout}>Keluar</button>
        </div>
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
              <span>{category.icon}</span>{category.title}
            </button>
          ))}
        </div>

        <div className="menu-editor">
          <div className="editor-title">
            <span className="editor-icon">{currentCategory?.icon}</span>
            <div><h2>{currentCategory?.title}</h2><p>Upload foto menu baru dari HP.</p></div>
          </div>

          <div className="mobile-upload-buttons">
            <button type="button" className="upload-choice camera" onClick={() => cameraInputRef.current?.click()} disabled={loading}>📷 Ambil Foto dengan Kamera</button>
            <button type="button" className="upload-choice gallery" onClick={() => galleryInputRef.current?.click()} disabled={loading}>🖼️ Pilih dari Galeri</button>
          </div>

          <input ref={cameraInputRef} className="hidden-file-input" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFileChange} />
          <input ref={galleryInputRef} className="hidden-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />

          {selectedFile && <p className="selected-file">Foto dipilih: <strong>{selectedFile.name}</strong></p>}

          {previewUrl ? (
            <div className="image-preview"><img src={previewUrl} alt="Preview foto menu baru" /></div>
          ) : imageUrl ? (
            <div className="image-preview"><img src={imageUrl} alt={`Foto ${currentCategory?.title}`} /></div>
          ) : (
            <div className="empty-photo">Belum ada foto menu untuk kategori ini.</div>
          )}

          <p className="upload-info">JPG, PNG, atau WebP • maksimal 10 MB</p>

          <div className="editor-actions">
            <button type="button" className="save-button" onClick={saveMenu} disabled={loading || !selectedFile}>{loading ? "Mengupload..." : "⬆️ Upload & Simpan Menu"}</button>
            {message && <span className="save-message">{message}</span>}
          </div>
        </div>
      </section>
    </main>
  );
}
