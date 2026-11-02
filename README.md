# FeriVault — Simple Supabase version

Versi ini sengaja dibuat tanpa `SUPABASE_SERVICE_ROLE_KEY` dan tanpa environment variable WhatsApp.

## Supabase
1. SQL Editor → New query.
2. Paste seluruh `supabase/schema.sql` → Run.
3. Vercel hanya membutuhkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Redeploy.

## Referral
- `FERIDEVADM` = akun admin, default hanya 1 kali.
- `FERI-REF` = contoh referral user tanpa batas.
- Admin bisa membuat referral baru dari Admin Center.

## Admin
Admin dapat melihat profil user, mencari user, menandai banned/unbanned, menghapus profil, mengirim email reset password, dan mengelola referral.

Catatan: tanpa service-role key, tombol Reset PW mengirim link reset ke email user (tidak mengganti password secara langsung), dan hapus user hanya menghapus profil aplikasi, bukan akun Auth. Ini sengaja supaya project tetap sederhana dan tidak menyimpan secret admin di Vercel.

## WhatsApp
Nomor WhatsApp tidak lagi memakai environment variable. Nomor ada sebagai konstanta di `components/Auth.tsx`; ganti sekali di sana jika mau tombol Get Code langsung ke nomor lo.
