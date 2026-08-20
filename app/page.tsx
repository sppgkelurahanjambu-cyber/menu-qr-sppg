"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import CategoryQr from "./components/CategoryQr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const categories = [
  { key: "porsi_besar", title: "Porsi Besar", description: "Menu untuk penerima manfaat porsi besar", href: "/porsi-besar", icon: "🍽️" },
  { key: "porsi_kecil", title: "Porsi Kecil", description: "Menu untuk penerima manfaat porsi kecil", href: "/porsi-kecil", icon: "🥣" },
  { key: "ibu_hamil_menyusui", title: "Ibu Hamil & Menyusui", description: "Menu khusus ibu hamil dan menyusui", href: "/ibu-hamil-menyusui", icon: "🤰" },
  { key: "balita", title: "Balita", description: "Menu sehat untuk balita", href: "/balita", icon: "👶" },
];

export default function HomePage() {
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadPhotos() {
      const { data, error } = await supabase.from("menu_photos").select("category,image_url,updated_at");
      if (error) {
        console.error("PUBLIC MENU ERROR:", error);
        return;
      }
      const next: Record<string, string> = {};
      for (const row of data || []) if (row.image_url) next[row.category] = row.image_url;
      setPhotos(next);
    }
    loadPhotos();
  }, []);

  return (
    <main className="home">
      <div className="container">
        <header className="header">
          <div className="logoBox"><img src="/logo-bgn.png" alt="Logo BGN" className="logo" /></div>
          <div className="brandText">
            <p className="eyebrow">SPPG SEMARANG JAMBU JAMBU 02</p>
            <h1>Menu Hari Ini</h1>
            <p className="subtitle">Pilih kategori untuk melihat foto menu terbaru.</p>
          </div>
        </header>

        <section className="cards" aria-label="Kategori menu">
          {categories.map((category) => (
            <Link key={category.href} href={category.href} className="card">
              <div className="icon" aria-hidden="true">{category.icon}</div>
              <div className="cardContent">
                <h2>{category.title}</h2>
                <p>{category.description}</p>
                {photos[category.key] && <span className="photoStatus">● Foto tersedia</span>}
              </div>
              <div className="arrow" aria-hidden="true">→</div>
            </Link>
          ))}
        </section>

        <section className="qrSection" aria-label="QR Menu per kategori">
          <div className="sectionHeading">
            <p className="eyebrow">AKSES CEPAT</p>
            <h2>QR Menu per Kategori</h2>
            <p>Scan QR untuk langsung membuka foto menu tanpa login.</p>
          </div>
          <div className="qrGrid">
            {categories.map((category) => (
              <CategoryQr key={category.key} category={category.key} title={category.title} />
            ))}
          </div>
        </section>

        <footer>
          <p>SPPG SEMARANG JAMBU JAMBU 02</p>
          <Link href="/admin" className="adminLink">Admin</Link>
        </footer>
      </div>
    </main>
  );
}
