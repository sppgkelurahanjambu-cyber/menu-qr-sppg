import Link from "next/link";
import CategoryQr from "./components/CategoryQr";

const categories = [
  {
    key: "porsi_besar",
    title: "Porsi Besar",
    description: "Menu untuk penerima manfaat porsi besar",
    href: "/porsi-besar",
    icon: "🍽️",
  },
  {
    key: "porsi_kecil",
    title: "Porsi Kecil",
    description: "Menu untuk penerima manfaat porsi kecil",
    href: "/porsi-kecil",
    icon: "🥣",
  },
  {
    key: "ibu_hamil_menyusui",
    title: "Ibu Hamil & Menyusui",
    description: "Menu khusus ibu hamil dan menyusui",
    href: "/ibu-hamil-menyusui",
    icon: "🤰",
  },
  {
    key: "balita",
    title: "Balita",
    description: "Menu sehat untuk balita",
    href: "/balita",
    icon: "👶",
  },
];

const SUPABASE_URL = "https://zqnpgjmejaetafgahzlw.supabase.co";

type MenuPhotoRow = {
  category: string;
  image_url: string | null;
};

async function loadPhotos() {
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error("PUBLIC HOME ERROR: Supabase publishable key is missing");
    return {} as Record<string, string>;
  }

  const query = new URLSearchParams({
    select: "category,image_url",
    order: "category.asc",
  });

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/menu_photos?${query.toString()}`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "PUBLIC HOME SUPABASE ERROR:",
        response.status,
        await response.text()
      );
      return {} as Record<string, string>;
    }

    const rows = (await response.json()) as MenuPhotoRow[];
    const photos: Record<string, string> = {};

    for (const row of rows) {
      if (row.category && row.image_url) {
        photos[row.category] = row.image_url;
      }
    }

    return photos;
  } catch (error) {
    console.error("PUBLIC HOME FETCH ERROR:", error);
    return {} as Record<string, string>;
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const photos = await loadPhotos();

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
          <div className="brandText">
            <p className="eyebrow">SPPG SEMARANG JAMBU JAMBU 02</p>
            <h1>Menu Hari Ini</h1>
            <p className="subtitle">
              Pilih kategori untuk melihat menu terbaru.
            </p>
          </div>
        </header>

        <section className="introPanel" aria-label="Informasi menu">
          <div>
            <p className="eyebrow">INFORMASI MENU</p>
            <h2>Menu terbaru SPPG</h2>
            <p>
              Foto menu diperbarui oleh admin. QR setiap kategori tetap sama,
              sehingga QR yang sudah dicetak dapat digunakan kembali.
            </p>
          </div>
        </section>

        <section className="cards" aria-label="Kategori menu">
          {categories.map((category) => (
            <Link key={category.href} href={category.href} className="card">
              <div className="icon" aria-hidden="true">{category.icon}</div>
              <div className="cardContent">
                <h2>{category.title}</h2>
                <p>{category.description}</p>
                <span className={photos[category.key] ? "photoStatus" : "photoStatus muted"}>
                  {photos[category.key] ? "● Foto tersedia" : "○ Foto belum tersedia"}
                </span>
              </div>
              <div className="arrow" aria-hidden="true">→</div>
            </Link>
          ))}
        </section>

        <section className="qrSection" aria-label="QR Menu per kategori">
          <div className="sectionHeading">
            <p className="eyebrow">AKSES CEPAT</p>
            <h2>QR Menu per Kategori</h2>
            <p>
              QR ini tetap. Saat admin mengganti foto, QR yang sama otomatis
              membuka foto terbaru.
            </p>
          </div>
          <div className="qrGrid">
            {categories.map((category) => (
              <CategoryQr
                key={category.key}
                categoryPath={category.href}
                title={category.title}
              />
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
