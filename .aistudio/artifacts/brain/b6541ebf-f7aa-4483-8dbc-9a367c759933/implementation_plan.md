# VORVAN — Private Selection Tray (Multi-Fragrance WhatsApp Bundle Inquiry)

Menambahkan fitur **Private Selection Tray (Baki Kurasi Privat)** pada butik parfum mewah **VORVAN** agar kolektor dapat memilih beberapa botol parfum sekaligus (lintas *brand*, gender, dan ukuran volume `ml`) lalu mengirimkan satu pesan **Penawaran Paket (Bundle Quotation)** terstruktur ke WhatsApp Concierge VORVAN.

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan diskusi pada tahap klarifikasi, fokus pengembangan ini adalah menghadirkan **Private Selection Tray** tanpa mengubah tata letak atau aturan bisnis yang sudah berjalan (*Price on Request*, *Email Gateway*, *Private Invoice*, *Lacak Resi*, dan *Multi-Bahasa*).

- **Confirmed Decision 1 (Private Tray Multi-Parfum via WhatsApp)**: Setiap kartu parfum dan modal *Olfactory Dossier* akan dilengkapi tombol untuk menambahkan/menghapus parfum beserta volume pilihannya (`50ml`, `70ml`, `100ml`, dll.) ke dalam **Private Tray**.
- **Confirmed Decision 2 (Slide-Over Luxury Drawer & Floating Tray Bar)**: Saat minimal 1 parfum berada di dalam *Private Tray*, muncul bar melayang (*Floating Vault Tray Bar*) yang ramping dan elegan untuk membuka *Slide-Over Drawer* berisi daftar parfum pilihan, pengatur jumlah unit (*quantity stepper*), catatan khusus kolektor, serta tombol utama **"Minta Penawaran Paket via WhatsApp"** (terintegrasi dengan *Passwordless Email Gateway*).

---

## 1. Overview & Core Concept

- **What It Does**: Memungkinkan pengunjung mengumpulkan beberapa parfum dari **11 Rumah Parfum**, **Apex Prestige**, maupun **Urban Signatures** ke dalam satu baki kurasi pribadi (*Private Selection Tray*), mengatur jumlah botol atau ukuran `ml`, lalu mengirim permintaan kuotasi harga kolektif ke WhatsApp Concierge VORVAN dalam satu klik.
- **Target Audience / Persona**: Kolektor parfum *niche/designer* yang ingin membandingkan 2–5 parfum sekaligus atau membeli beberapa botol untuk mendapatkan *privilege* harga paket (*bundle valuation*).
- **Key Value**: Menghilangkan friksi harus bolak-balik mengirim pesan WhatsApp satu per satu untuk setiap parfum, sekaligus meningkatkan nilai transaksi rata-rata (*Average Order Value*) bagi VORVAN.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Menambahkan ke Private Tray**: Pada setiap kartu parfum (di sebelah atau di atas area kuotasi) serta di dalam modal *Olfactory Dossier*, pengguna dapat menekan tombol **`+ Simpan ke Private Tray`** (berubah menjadi **`✓ Dalam Private Tray`** dengan aksen *Champagne Gold* saat terpilih).
  2. **Floating Private Tray Trigger**: Ketika *Private Tray* berisi $\ge 1$ parfum, muncul indikator elegan yang ringkas (menampilkan jumlah flacon terpilih) untuk membuka laci kurasi (*Slide-Over Drawer*).
  3. **Mengelola Daftar di Slide-Over Drawer**: Di dalam laci **Private Selection Tray**, pengguna melihat foto mini botol, nama rumah parfum, nama varian, konsentrasi, ukuran volume (`ml`), tombol tambah/kurang kuantitas (`-` / `+`), tombol hapus item, serta kolom opsional *Catatan Kurasi / Permintaan Khusus*.
  4. **Kirim Penawaran Paket ke WhatsApp**: Saat pengguna menekan **"Tanya Penawaran Paket via WhatsApp"**, sistem memeriksa apakah email sudah terdaftar di *Email Gateway*. Jika belum, modal *Email Gateway* muncul terlebih dahulu lalu otomatis meneruskan seluruh daftar parfum ke WhatsApp Concierge VORVAN dengan format daftar bernomor yang rapi.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Dark Luxury Minimalist / Haute Parfumerie Vault Drawer.
  - *Color Palette & Mood*: Latar belakang `#0B0A0E` / `#121118` dengan bingkai tipis *Champagne Semi-Gold* (`#D4AF37` / `#E5C87E`), teks putih gading (`#FAF8F5`), dan tombol utama `.btn-luxury-gold`.
  - *Typography & Hierarchy*: Judul menggunakan `Playfair Display` & aksen kaligrafi `Great Vibes`, label kontrol menggunakan `Cinzel` (`whitespace-nowrap`), serta angka kuantitas/volume menggunakan `JetBrains Mono` (`tabular-nums`).
  - *Component Styling & Layout*: Kartu parfum tetap mempertahankan tinggi seragam (`h-full flex flex-col justify-between`) dan bingkai bawah/samping yang sejajar presisi tanpa tumpang tindih.

- **Interactive Feedback & Motion**:
  - Transisi buka/tutup *Slide-Over Drawer* yang mulus (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Indikator status tombol pada kartu parfum langsung berubah secara instan saat item ditambahkan atau dikeluarkan dari *Private Tray*.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Integrasi dengan Passwordless Email Gateway yang Sudah Ada**
  - *Chosen Approach*: Menggunakan state `registeredEmail` yang sama dengan tombol *Tanya Penawaran* tunggal. Jika pengunjung belum memasukkan email, klik *Checkout Penawaran Paket* di *Private Tray* akan membuka *Email Gateway* terlebih dahulu, lalu langsung mengarahkan ke WhatsApp dengan daftar seluruh parfum di *Tray*.
  - *Why*: Menjaga aturan bisnis utama VORVAN agar setiap prospek tetap tercatat di Log Admin Concierge sebelum masuk ke WhatsApp.

- **Decision 2: Persistensi Private Tray di Penyimpanan Lokal (`localStorage`) & Dukungan 5 Bahasa**
  - *Chosen Approach*: Menyimpan isi *Private Tray* ke `localStorage` (`vorvan_private_tray_v1`) dan menambahkan kamus terjemahan *Private Tray* ke dalam 5 bahasa (`ID`, `EN`, `FR`, `AR`, `ZH`).
  - *Why*: Pilihan parfum pengunjung tidak hilang saat mereka berpindah dari halaman *Showroom* ke *Lacak Resi* atau *Private Invoice*, dan seluruh antarmuka *Tray* ikut berubah bahasa saat *Language Switcher* diubah.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       VORVAN Main Application                           │
│  (State: privateTrayItems, isTrayDrawerOpen, registeredEmail, locale)   │
└───────────────┬─────────────────────────────────────────┬───────────────┘
                │                                         │
                ▼                                         ▼
┌───────────────────────────────────┐     ┌───────────────────────────────┐
│   FragranceCard & DossierModal    │     │   PrivateTrayDrawer & Bar     │
│  - Toggle Add/Remove (id + ml)    │     │  - Itemized Flacon List       │
│  - Flush Equal-Height Card Frame  │     │  - Quantity Steppers (- / +)  │
│  - Direct Single WA Inquiry       │     │  - Bespoke Client Note Input  │
└───────────────┬───────────────────┘     └───────────────┬───────────────┘
                │                                         │
                └───────────────────┬─────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               WhatsApp Bundle URL Builder & Email Gateway               │
│  - buildWhatsAppTrayInquiryUrl(items, clientNote, registeredEmail)      │
│  - Formats multi-fragrance numbered list + volume + quantity for WA     │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `PrivateTrayItem`: Menyimpan `fragrance: FragranceItem`, `volume: string`, dan `quantity: number` (diidentifikasi secara unik oleh kombinasi `${fragrance.id}__${volume}`).
  - Fungsi murni `buildWhatsAppTrayInquiryUrl` untuk memformat daftar parfum, ukuran `ml`, kuantitas botol, email klien, dan catatan tambahan menjadi tautan WhatsApp resmi VORVAN beserta pengujian unit (*unit test*).
