"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const categories = [
  ["porsi_besar", "Porsi Besar"],
  ["porsi_kecil", "Porsi Kecil"],
  ["ibu_hamil_menyusui", "Ibu Hamil & Menyusui"],
  ["balita", "Balita"]
] as const;

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("porsi_besar");
  const [file, setFile] = useState<File | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    const { data: row } = await supabase.from("menu_photos").select("image_url").eq("category", category).single();
    setCurrent(row?.image_url ?? null);
  }

  useEffect(() => { load(); }, [category]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else setSession(data.session);
  }

  async function upload() {
    if (!file || !session) return;
    setBusy(true); setMessage("");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${category}/menu.${ext}`;
    const { error: uploadError } = await supabase.storage.from("menu-photos").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) { setMessage(uploadError.message); setBusy(false); return; }

    const { data: publicData } = supabase.storage.from("menu-photos").getPublicUrl(path);
    const url = `${publicData.publicUrl}?v=${Date.now()}`;
    const { error: dbError } = await supabase.from("menu_photos").update({ image_url: url, updated_at: new Date().toISOString() }).eq("category", category);
    if (dbError) setMessage(dbError.message);
    else { setCurrent(url); setFile(null); setMessage("Foto berhasil diperbarui."); }
    setBusy(false);
  }

  if (!session) return (
    <main>
      <h1>Admin Menu</h1>
      <div className="card">
        <form onSubmit={login}>
          <p>Masuk untuk mengunggah foto menu.</p>
          <input type="email" placeholder="Email admin" value={email} onChange={e => setEmail(e.target.value)} required />
          <br /><br />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <br /><br />
          <button type="submit">Masuk</button>
        </form>
        {message && <p className="error">{message}</p>}
      </div>
    </main>
  );

  return (
    <main>
      <h1>Admin Menu Hari Ini</h1>
      <div className="card">
        <label><b>Kategori</b></label>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{width:"100%", minHeight:48, marginTop:8, borderRadius:12, padding:10}}>
          {categories.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <br /><br />
        <label><b>Pilih 1 foto</b></label>
        <input type="file" accept="image/*" capture="environment" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        <br /><br />
        <button onClick={upload} disabled={!file || busy}>{busy ? "Mengunggah..." : "Upload Foto"}</button>
        {message && <p className={message.startsWith("Foto") ? "success" : "error"}>{message}</p>}
      </div>
      {current && <div className="card"><h2>Foto aktif</h2><img className="preview" src={current} alt="Foto menu aktif" /></div>}
      <button className="secondary" onClick={() => supabase.auth.signOut()}>Keluar</button>
    </main>
  );
}
