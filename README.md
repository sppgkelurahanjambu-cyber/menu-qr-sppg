# Menu QR SPPG

Website publik SPPG Semarang Jambu Jambu 02 dengan 4 QR permanen untuk menampilkan 1 foto menu aktif per kategori.

## Tampilan publik
Halaman utama menggunakan desain sederhana bernuansa biru BGN, menampilkan alamat SPPG, tanggal dan jam real-time WIB, empat kategori menu, QR permanen, standar Angka Kecukupan Gizi Harian, serta komitmen layanan.

## Setup
1. Buat project Next.js dengan file pada repository ini.
2. Salin `.env.local.example` menjadi `.env.local`.
3. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Jalankan `npm install` lalu `npm run dev`.
5. Buat satu akun admin di Supabase Authentication > Users.
6. Deploy repository ini ke Vercel dan masukkan dua environment variable yang sama.

## URL publik
- `/porsi-besar`
- `/porsi-kecil`
- `/ibu-hamil-menyusui`
- `/balita`

## Admin
- `/admin`

QR selalu menunjuk ke URL kategori dan tidak berubah saat admin mengganti foto. Foto lama di Storage dihapus setelah foto baru berhasil tersimpan.
