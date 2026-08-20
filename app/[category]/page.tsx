import { notFound } from "next/navigation";
import { supabase } from "../../lib/supabase";

const categories: Record<string, { key: string; title: string }> = {
  "porsi-besar": { key: "porsi_besar", title: "Porsi Besar" },
  "porsi-kecil": { key: "porsi_kecil", title: "Porsi Kecil" },
  "ibu-hamil-menyusui": { key: "ibu_hamil_menyusui", title: "Ibu Hamil & Menyusui" },
  "balita": { key: "balita", title: "Balita" }
};

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const meta = categories[category];
  if (!meta) notFound();

  const { data } = await supabase
    .from("menu_photos")
    .select("image_url, updated_at")
    .eq("category", meta.key)
    .single();

  return (
    <main>
      <h1>{meta.title}</h1>
      {data?.image_url ? (
        <>
          <img className="preview" src={data.image_url} alt={`Menu ${meta.title}`} />
          <p className="small">Foto menu terbaru.</p>
        </>
      ) : (
        <div className="card"><p>Foto menu hari ini belum diunggah.</p></div>
      )}
    </main>
  );
}
