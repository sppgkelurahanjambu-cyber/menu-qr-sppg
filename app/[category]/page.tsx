import Link from "next/link";

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

export default function Home() {
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
            <h1>Menu Hari Ini</h1>
            <p className="subtitle">
              Pilih kategori penerima manfaat untuk melihat menu hari ini.
            </p>
          </div>
        </header>

        <section className="cards">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="card"
            >
              <div className="icon">
                {category.icon}
              </div>

              <div className="cardContent">
                <h2>{category.title}</h2>
                <p>{category.description}</p>
              </div>

              <div className="arrow">→</div>
            </Link>
          ))}
        </section>

        <footer>
          <Link href="/admin" className="adminLink">
            Admin
          </Link>
        </footer>

      </div>
    </main>
  );
}
