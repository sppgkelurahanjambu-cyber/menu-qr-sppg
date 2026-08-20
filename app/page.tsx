export default function AdminPage() {
  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">SPPG KELURAHAN JAMBU</p>
          <h1>Admin Menu</h1>
          <p>Kelola menu makanan yang tampil pada halaman publik.</p>
        </div>

        <a href="/" className="back-button">
          ← Lihat Halaman Menu
        </a>
      </div>

      <section className="admin-grid">
        <div className="admin-card">
          <div className="admin-icon">🍽️</div>
          <h2>Porsi Besar</h2>
          <p>Kelola menu untuk penerima manfaat porsi besar.</p>
          <button>Kelola Menu</button>
        </div>

        <div className="admin-card">
          <div className="admin-icon">🥣</div>
          <h2>Porsi Kecil</h2>
          <p>Kelola menu untuk penerima manfaat porsi kecil.</p>
          <button>Kelola Menu</button>
        </div>

        <div className="admin-card">
          <div className="admin-icon">🤰</div>
          <h2>Ibu Hamil & Menyusui</h2>
          <p>Kelola menu khusus ibu hamil dan menyusui.</p>
          <button>Kelola Menu</button>
        </div>

        <div className="admin-card">
          <div className="admin-icon">👶</div>
          <h2>Balita</h2>
          <p>Kelola menu khusus balita.</p>
          <button>Kelola Menu</button>
        </div>
      </section>
    </main>
  );
}
