import Link from "next/link";

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

type Category = (typeof categories)[keyof typeof categories];

type MenuPhotoRow = {
  image_url: string | null;
};

const SUPABASE_URL = "https://zqnpgjmejaetafgahzlw.supabase.co";

async function getMenuPhoto(category: Category) {
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error("PUBLIC MENU ERROR: Supabase publishable key is missing");
    return { imageUrl: "", error: "Konfigurasi Supabase belum tersedia." };
  }

  const query = new URLSearchParams({
    select: "image_url",
    category: `eq.${category.key}`,
    limit: "1",
  });

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/menu_photos?${query.toString()}`,
      {
        method: "GET",
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "PUBLIC MENU REST ERROR:",
        response.status,
        errorText
      );
      return {
        imageUrl: "",
        error: `Menu belum dapat dimuat (${response.status}).`,
      };
    }

    const rows = (await response.json()) as MenuPhotoRow[];
    const imageUrl = rows[0]?.image_url || "";

    return {
      imageUrl,
      error: imageUrl ? "" : "Foto menu untuk kategori ini belum tersedia.",
    };
  } catch (error) {
    console.error("PUBLIC MENU FETCH ERROR:", error);
    return {
      imageUrl: "",
      error: "Menu belum dapat dimuat.",
    };
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = categories[slug as keyof typeof categories];

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

  const { imageUrl, error } = await getMenuPhoto(category);

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

          {imageUrl ? (
            <div className="image-preview">
              <img
                src={imageUrl}
                alt={`Menu ${category.title}`}
                loading="eager"
              />
            </div>
          ) : (
            <p className="save-message">{error}</p>
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
