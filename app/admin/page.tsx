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
      .maybeSingle();

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

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("File harus berupa gambar.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Ukuran foto maksimal 10 MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage("");
  }

  async function saveMenu() {
    if (!selectedFile) {
      setMessage("Silakan pilih foto menu terlebih dahulu.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const extension =
        selectedFile.name.split(".").pop()?.toLowerCase() ||
        "jpg";

      const fileName =
        `${selectedCategory}-${Date.now()}.${extension}`;

      const filePath = `menu/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("menu-photos")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        console.error(uploadError);
        setMessage(
          "Gagal upload foto: " + uploadError.message
        );
        setLoading(false);
        return;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("menu-photos")
          .getPublicUrl(filePath);

      const publicUrl =
        publicUrlData.publicUrl;

      const { error: updateError } =
        await supabase
          .from("menu_photos")
          .update({
            image_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("category", selectedCategory);

      if (updateError) {
        console.error(updateError);
        setMessage(
          "Foto berhasil diupload tetapi gagal menyimpan database."
        );
        setLoading(false);
        return;
      }

      setImageUrl(publicUrl);
      setSelectedFile(null);
      setPreviewUrl("");

      setMessage(
        "✅ Foto menu berhasil diupload dan disimpan."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Terjadi kesalahan saat mengupload foto."
      );
    }

    setLoading(false);
  }

  const currentCategory = categories.find(
    (category) =>
      category.key === selectedCategory
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f8f6",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "30px",
            marginBottom: "25px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#009b63",
                  marginBottom: "8px",
                }}
              >
                SPPG KELURAHAN JAMBU
              </div>

              <h1
                style={{
                  margin: 0,
                  color: "#123b68",
                  fontSize: "36px",
                }}
              >
                Admin Menu
              </h1>

              <p
                style={{
                  color: "#667085",
                  fontSize: "17px",
                }}
              >
                Upload foto menu langsung dari HP atau komputer.
              </p>
            </div>

            <a
              href="/"
              style={{
                background: "#123b68",
                color: "white",
                padding: "13px 20px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              ← Lihat Menu
            </a>
          </div>
        </div>

        {/* CATEGORY */}

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "30px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              color: "#123b68",
              marginTop: 0,
            }}
          >
            Pilih Kategori
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "30px",
            }}
          >
            {categories.map((category) => {
              const active =
                selectedCategory === category.key;

              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(category.key)
                  }
                  style={{
                    padding: "25px 15px",
                    borderRadius: "18px",
                    border: active
                      ? "3px solid #009b63"
                      : "2px solid #e1ebe6",
                    background: active
                      ? "#eaf8f2"
                      : "white",
                    cursor: "pointer",
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#123b68",
                  }}
                >
                  <div
                    style={{
                      fontSize: "42px",
                      marginBottom: "10px",
                    }}
                  >
                    {category.icon}
                  </div>

                  {category.title}
                </button>
              );
            })}
          </div>

          {/* EDITOR */}

          <div
            style={{
              border: "2px solid #e5eee9",
              borderRadius: "22px",
              padding: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
              }}
            >
              <div
                style={{
                  fontSize: "45px",
                  background: "#eaf8f2",
                  padding: "10px 18px",
                  borderRadius: "18px",
                }}
              >
                {currentCategory?.icon}
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#123b68",
                  }}
                >
                  {currentCategory?.title}
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#667085",
                  }}
                >
                  Upload foto menu untuk kategori ini.
                </p>
              </div>
            </div>

            {/* FILE UPLOAD */}

            <label
              htmlFor="menuPhoto"
              style={{
                display: "block",
                fontWeight: 700,
                color: "#123b68",
                marginBottom: "10px",
              }}
            >
              📷 Pilih Foto Menu
            </label>

            <input
              id="menuPhoto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              style={{
                display: "block",
                width: "100%",
                padding: "18px",
                border: "2px dashed #009b63",
                borderRadius: "16px",
                background: "#f7fcfa",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            />

            <p
              style={{
                color: "#667085",
                fontSize: "14px",
                marginTop: "10px",
              }}
            >
              JPG, PNG, atau WebP. Maksimal 10 MB.
            </p>

            {/* PREVIEW */}

            {(previewUrl || imageUrl) && (
              <div
                style={{
                  marginTop: "25px",
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    color: "#123b68",
                  }}
                >
                  {previewUrl
                    ? "Preview Foto Baru"
                    : "Foto Menu Saat Ini"}
                </p>

                <div
                  style={{
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid #dfe8e3",
                    background: "#f5f5f5",
                  }}
                >
                  <img
                    src={
                      previewUrl ||
                      imageUrl
                    }
                    alt="Preview menu"
                    style={{
                      width: "100%",
                      maxHeight: "500px",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
              </div>
            )}

            {/* BUTTON */}

            <div
              style={{
                marginTop: "25px",
              }}
            >
              <button
                type="button"
                onClick={saveMenu}
                disabled={
                  loading || !selectedFile
                }
                style={{
                  width: "100%",
                  padding: "17px",
                  border: "none",
                  borderRadius: "14px",
                  background:
                    loading || !selectedFile
                      ? "#b8c8c1"
                      : "#009b63",
                  color: "white",
                  fontSize: "17px",
                  fontWeight: 800,
                  cursor:
                    loading || !selectedFile
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {loading
                  ? "⏳ Mengupload..."
                  : "⬆️ Upload & Simpan Menu"}
              </button>
            </div>

            {/* MESSAGE */}

            {message && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "15px",
                  borderRadius: "12px",
                  background:
                    message.startsWith("✅")
                      ? "#eaf8f2"
                      : "#fff1f0",
                  color:
                    message.startsWith("✅")
                      ? "#087443"
                      : "#b42318",
                  fontWeight: 700,
                }}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
