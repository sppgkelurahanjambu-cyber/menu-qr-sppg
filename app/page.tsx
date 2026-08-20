import CategoryQr from "./components/CategoryQr";
import RealTimeDate from "./components/RealTimeDate";

const categories = [
  {
    key: "porsi_besar",
    title: "Porsi Besar",
    href: "/porsi-besar",
    icon: "🍽️",
  },
  {
    key: "porsi_kecil",
    title: "Porsi Kecil",
    href: "/porsi-kecil",
    icon: "🥣",
  },
  {
    key: "ibu_hamil_menyusui",
    title: "Ibu Hamil & Menyusui",
    href: "/ibu-hamil-menyusui",
    icon: "🤰",
  },
  {
    key: "balita",
    title: "Balita",
    href: "/balita",
    icon: "👶",
  },
];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
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
            <p className="subtitle">.</p>
            <div className="addressLine" aria-label="Alamat SPPG">
              <span className="addressIcon" aria-hidden="true">●</span>
              <span></span>
            </div>
          </div>
        </header>

        <section className="introPanel" aria-label="Informasi menu">
          <div className="introInfo">
            <div className="infoIcon" aria-hidden="true">▦</div>
            <div>
              <p className="eyebrow">INFORMASI MENU</p>
              <h2>Menu terbaru SPPG</h2>
              <p>
                
              </p>
            </div>
          </div>
          <RealTimeDate />
        </section>

        <section className="categorySection" aria-label="Kategori menu">
          <div className="sectionTitle">
            <h2>Kategori Menu</h2>
            <span aria-hidden="true" />
          </div>

          <div className="qrGrid categoryGrid">
            {categories.map((category) => (
              <CategoryQr
                key={category.key}
                categoryPath={category.href}
                title={category.title}
                icon={category.icon}
              />
            ))}
          </div>

          <div className="akgBanner">
            <div className="akgBannerIcon" aria-hidden="true">✚</div>
            <div>
              <h3>Sesuai Angka Kecukupan Gizi Harian</h3>
              <p>
                Menu yang disajikan disusun berdasarkan kebutuhan gizi harian
                sesuai standar Angka Kecukupan Gizi (AKG) untuk setiap kelompok sasaran.
              </p>
            </div>
          </div>
        </section>

        <section className="commitment" aria-label="Komitmen SPPG">
          <div className="commitmentIntro">
            <div className="commitmentIcon" aria-hidden="true">✓</div>
            <div>
              <h3>Komitmen Kami</h3>
              <p>Menyediakan makanan bergizi seimbang setiap hari untuk mendukung generasi sehat dan cerdas.</p>
            </div>
          </div>
          <div className="commitmentItems">
            <span>♥ <b>Bergizi</b></span>
            <span>◈ <b>Aman</b></span>
            <span>● <b>Berkualitas</b></span>
            <span>⌁ <b>Halal</b></span>
          </div>
        </section>

        <footer>
          <p>© {new Date().getFullYear()} SPPG Semarang Jambu Jambu 02. Semua Hak Dilindungi.</p>
        </footer>
      </div>
    </main>
  );
}
