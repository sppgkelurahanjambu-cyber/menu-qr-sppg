import Link from "next/link";

function BigPortionIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="10" y="18" width="44" height="34" rx="6" />
      <path d="M18 18c1-8 6-12 14-12s13 4 14 12" />
      <path d="M22 29h20M22 38h14" />
    </svg>
  );
}

function SmallPortionIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="22" />
      <path d="M18 34c5-7 10-7 14 0s9 7 14 0" />
      <path d="M24 22c2-3 5-4 8-4M40 22c-2-3-5-4-8-4" />
    </svg>
  );
}

function PregnantIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="14" r="7" />
      <path d="M24 25c-5 5-7 12-5 20l3 11h20l3-11c2-8 0-15-5-20" />
      <circle cx="37" cy="42" r="5" />
      <path d="M32 29c7 0 12 5 12 12" />
    </svg>
  );
}

function BabyIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="31" r="21" />
      <path d="M19 27c2-9 8-14 13-14s11 5 13 14" />
      <circle cx="25" cy="32" r="2" />
      <circle cx="39" cy="32" r="2" />
      <path d="M27 41c3 3 7 3 10 0" />
      <path d="M22 17c-5 1-8 4-9 8M42 17c5 1 8 4 9 8" />
    </svg>
  );
}

const categories = [
  {
    href: "/porsi-besar",
    title: "Porsi Besar",
    description: "Menu untuk porsi besar",
    className: "green",
    icon: <BigPortionIcon />,
  },
  {
    href: "/porsi-kecil",
    title: "Porsi Kecil",
    description: "Menu untuk porsi kecil",
    className: "blue",
    icon: <SmallPortionIcon />,
  },
  {
    href: "/ibu-hamil-menyusui",
    title: "Ibu Hamil & Menyusui",
    description: "Menu khusus ibu dan menyusui",
    className: "gold",
    icon: <PregnantIcon />,
  },
  {
    href: "/balita",
    title: "Balita",
    description: "Menu untuk kebutuhan balita",
    className: "navy",
    icon: <BabyIcon />,
  },
];

export default function Home() {
  return (
    <main className="home">
      <div className="container">

        <header className="header">
          <img
            src="/logo-bgn.png"
            alt="Badan Gizi Nasional"
            className="logo"
          />

          <div className="brand">
            <h1>MENU HARI INI</h1>
            <p>SPPG Kelurahan Jambu</p>
          </div>

          <div className="divider" />

          <p className="intro">
            Silakan pilih kategori menu sesuai kebutuhan.
          </p>
        </header>

        <section className="category-grid">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className={`category-card ${category.className}`}
            >
              <div className="icon-box">
                {category.icon}
              </div>

              <div className="card-content">
                <h2>{category.title}</h2>
                <p>{category.description}</p>
              </div>

              <div className="arrow">→</div>
            </Link>
          ))}
        </section>

        <footer className="footer">
          <p>
            Badan Gizi Nasional
          </p>

          <span>SPPG Kelurahan Jambu</span>

          <Link href="/admin" className="admin-link">
            Admin
          </Link>
        </footer>

      </div>
    </main>
  );
}
