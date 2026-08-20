import Link from "next/link";
import CategoryQr from "./components/CategoryQr";

const categories = [
  {
    title: "Porsi Besar",
    description: "Menu untuk penerima manfaat porsi besar",
    href: "/porsi-besar",
    icon: "🍽️",
  },
  {
    title: "Porsi Kecil",
    description: "Menu untuk penerima manfaat porsi kecil",
    href: "/porsi-kecil",
    icon: "🥣",
  },
  {
    title: "Ibu Hamil & Menyusui",
    description: "Menu khusus ibu hamil dan menyusui",
    href: "/ibu-hamil-menyusui",
    icon: "🤰",
  },
  {
    title: "Balita",
    description: "Menu sehat untuk balita",
    href: "/balita",
    icon: "👶",
  },
];

export default function HomePage() {
  return (
    <main className="home">
      <div className="container">
        <header className="header">
          <div className="logoBox">
            <img src="/logo-bgn.png" alt="Logo BGN" className="logo" />
          </div>
          <div className="brandText">
            <p className="eyebrow">SPPG SEMARANG JAMBU JAMBU 02</p>
            <h1>Menu Hari Ini</h1>
            <p className="subtitle">Pilih kategori untuk melihat menu.</p>
          </div>
        </header>

        <section className="cards" aria-label="Kategori menu">
          {categories.map((category) => (
            <Link key={category.href} href={category.href} className="card">
              <div className="icon" aria-hidden="true">{category.icon}</div>
              <div className="cardContent">
                <h2>{category.title}</h2>
                <p>{category.description}</p>
              </div>
              <div className="arrow" aria-hidden="true">→</div>
            </Link>
          ))}
        </section>

        <section className="qrSection" aria-label="QR Menu per kategori">
          <div className="sectionHeading">
            <p className="eyebrow">AKSES CEPAT</p>
            <h2>QR Menu per Kategori</h2>
            <p>Scan QR untuk langsung membuka menu kategori yang dipilih.</p>
          </div>

          <div className="qrGrid">
            {categories.map((category) => (
              <CategoryQr key={category.href} href={category.href} title={category.title} />
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
