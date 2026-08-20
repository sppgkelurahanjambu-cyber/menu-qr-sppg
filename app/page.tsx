import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Menu Hari Ini</h1>
      <p>Silakan pilih jenis porsi.</p>
      <div className="grid">
        <Link className="card" href="/porsi-besar"><h2>Porsi Besar</h2><p>Lihat menu hari ini.</p></Link>
        <Link className="card" href="/porsi-kecil"><h2>Porsi Kecil</h2><p>Lihat menu hari ini.</p></Link>
        <Link className="card" href="/ibu-hamil-menyusui"><h2>Ibu Hamil & Menyusui</h2><p>Lihat menu hari ini.</p></Link>
        <Link className="card" href="/balita"><h2>Balita</h2><p>Lihat menu hari ini.</p></Link>
      </div>
      <p className="small">Admin: <Link href="/admin">buka halaman admin</Link></p>
    </main>
  );
}
