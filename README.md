# Menu QR SPPG

Aplikasi 4 QR permanen untuk menampilkan 1 foto menu aktif per kategori.

## Setup
1. Buat project Next.js dengan file pada repository ini.
2. Salin `.env.local.example` menjadi `.env.local`.
3. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Jalankan `npm install` lalu `npm run dev`.
5. Buat satu akun admin di Supabase Authentication > Users.
6. Deploy repository ini ke Vercel dan masukkan dua environment variable yang sama.

URL publik:
- `/porsi-besar`
- `/porsi-kecil`
- `/ibu-hamil-menyusui`
- `/balita`

Admin:
- `/admin`
