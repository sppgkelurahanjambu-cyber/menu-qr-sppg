"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const categories = {
  "porsi-besar": {
    key: "porsi_besar",
    title: "Porsi Besar",
    icon: "🍽️",
  },
  "porsi-kecil": {
    key: "porsi_kecil",
    title: "Porsi Kecil",
    icon: "🥣",
  },
  "ibu-hamil-menyusui": {
    key: "ibu_hamil_menyusui",
    title: "Ibu Hamil & Menyusui",
    icon: "🤰",
  },
  balita: {
    key: "balita",
    title: "Balita",
    icon: "👶",
  },
} as const;

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const slug = params?.category || "";
  const category = categories[slug as keyof typeof categories];

  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!category) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadMenu() {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("menu_photos")
        .select("image_url")
        .eq("category", category.key)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("PUBLIC MENU ERROR:", error);
        setImageUrl("");
        setMessage("Menu belum dapat dimuat.");
      } else {
        setImageUrl(data?.image_url || "");
        if (!data?.image_url) {
          setMessage("Foto menu untuk kategori ini belum tersedia.");
        }
      }

      setLoading(false);
    }

    loadMenu();

    return () => {
      cancelled = true;
    };
  }, [slug, category]);

  if (!category) {
    return (
      <main className="home">
        <div className="container">
          <h1>Kategori tidak ditemukan</h1>
          <Link href="/">← Kembali ke Menu Hari Ini</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="home">
      <div className="container">
        <header className="header">
          <div className="logoBox">
            <img
              src="/logo-bgn.png"
              alt="Logo Badan Gizi Nasional"
              className="logo"
            />
          </div>

          <div>
            <p className="eyebrow">SPPG Kelurahan Jambu</p>
            <h1>
              {category.icon} {category.title}
            </h1>
            <p className="subtitle">Menu hari ini</p>
          </div>
        </header>

        <section className="menu-editor">
          <div className="editor-title">
            <span className="editor-icon">{category.icon}</span>
            <div>
              <h2>{category.title}</h2>
              <p>Foto menu yang telah diupload oleh admin.</p>
            </div>
          </div>

          {loading && <p>Memuat menu...</p>}

          {!loading && imageUrl && (
            <div className="image-preview">
              <img src={imageUrl} alt={`Menu ${category.title}`} />
            </div>
          )}

          {!loading && !imageUrl && message && (
            <p className="save-message">{message}</p>
          )}

          <div className="editor-actions">
            <Link href="/" className="back-button">
              ← Pilih Kategori Lain
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
