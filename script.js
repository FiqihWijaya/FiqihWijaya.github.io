/* =====================================================================
   JASA VAROKAH - script.js
   Berisi FUNGSI website:
   1. CONFIG      -> data yang sering diganti (WhatsApp, email, sosmed)
   2. Carousel    -> geser layanan & portfolio dengan tombol panah
   3. Form        -> kirim permintaan ke WhatsApp
   4. Musik       -> tombol putar/jeda musik latar
   5. Lain-lain   -> tahun otomatis di footer
   ===================================================================== */

'use strict';


/* ---------------------------------------------------------------------
   1. CONFIG - GANTI DATA DI SINI SAJA
   --------------------------------------------------------------------- */
const CONFIG = {
  // Nomor WhatsApp: format internasional, tanpa +, spasi, atau 0 di depan.
  // Contoh nomor 0812-3456-7890 -> "6281234567890"
  waNumber: '6289654082548',

  // Email yang tampil pada tombol "Email"
  email: 'fiqihwijaya86@gmail.com',

  // Link sosial media. Ganti USERNAME_ANDA dengan username Anda.
  social: {
    instagram: 'https://www.instagram.com/USERNAME_ANDA',
    facebook:  'https://www.facebook.com/USERNAME_ANDA',
    linkedin:  'https://www.linkedin.com/in/USERNAME_ANDA',
    github:    'https://github.com/USERNAME_ANDA',
    threads:   'https://www.threads.net/@USERNAME_ANDA'
  }
};


/* ---------------------------------------------------------------------
   Fungsi bantu: membuat link WhatsApp dengan pesan terisi otomatis
   --------------------------------------------------------------------- */
function buatLinkWA(pesan) {
  const base = 'https://wa.me/' + CONFIG.waNumber;
  return pesan ? base + '?text=' + encodeURIComponent(pesan) : base;
}


/* ---------------------------------------------------------------------
   Pasang data CONFIG ke tombol-tombol di halaman
   --------------------------------------------------------------------- */
function pasangKontak() {
  // Semua link bertanda data-wa memakai nomor WhatsApp dari CONFIG
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = buatLinkWA('Halo Jasa Varokah, saya ingin bertanya tentang layanan.');
  });

  // Tombol sosmed (data-social="instagram", dst.)
  document.querySelectorAll('[data-social]').forEach(function (a) {
    const nama = a.dataset.social;
    if (nama === 'email') {
      a.href = 'mailto:' + CONFIG.email;
    } else if (CONFIG.social[nama]) {
      a.href = CONFIG.social[nama];
    }
  });
}


/* ---------------------------------------------------------------------
   2. CAROUSEL - geser kartu ke kiri/kanan
   Setiap elemen dengan atribut data-carousel akan diaktifkan.
   Pengunjung bisa menggeser dengan jari, mouse, atau tombol panah.
   --------------------------------------------------------------------- */
function aktifkanCarousel(root) {
  const track = root.querySelector('.track');
  const prev = root.querySelector('.prev');
  const next = root.querySelector('.next');
  if (!track || !prev || !next) return;

  // Jarak geser = lebar satu kartu + jarak antar kartu
  function jarakGeser() {
    const kartu = track.querySelector('.slide');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    return kartu ? kartu.getBoundingClientRect().width + gap : track.clientWidth;
  }

  // Nonaktifkan tombol panah saat sudah di ujung awal/akhir
  function perbaruiTombol() {
    const maks = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= maks;
  }

  prev.addEventListener('click', function () {
    track.scrollBy({ left: -jarakGeser(), behavior: 'smooth' });
  });
  next.addEventListener('click', function () {
    track.scrollBy({ left: jarakGeser(), behavior: 'smooth' });
  });

  // Tombol keyboard: panah kiri/kanan saat carousel difokuskan
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev.click(); }
  });

  track.addEventListener('scroll', perbaruiTombol, { passive: true });
  window.addEventListener('resize', perbaruiTombol);
  perbaruiTombol();
}


/* ---------------------------------------------------------------------
   3. FORM PERMINTAAN -> WHATSAPP
   Data form disusun menjadi pesan, lalu WhatsApp dibuka.
   (Tidak butuh server; pesan dikirim lewat aplikasi WhatsApp pengunjung.)
   --------------------------------------------------------------------- */
function aktifkanForm() {
  const form = document.getElementById('formPermintaan');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault(); // cegah halaman dimuat ulang

    // Cek kolom wajib; kolom kosong diberi garis merah
    let valid = true;
    form.querySelectorAll('[required]').forEach(function (el) {
      const kosong = !el.value.trim();
      el.classList.toggle('invalid', kosong);
      if (kosong) valid = false;
    });
    if (!valid) {
      form.querySelector('.invalid').focus();
      return;
    }

    // Ambil isi form
    const d = new FormData(form);
    const baris = [
      'Halo Jasa Varokah, saya ingin mengajukan permintaan layanan:',
      '',
      '*Nama:* ' + d.get('nama').trim(),
      '*Layanan:* ' + d.get('layanan'),
      '*Tanggal/Waktu:* ' + (d.get('waktu').trim() || '-'),
      '*Lokasi/Alamat:* ' + d.get('lokasi').trim(),
      '*Catatan:* ' + (d.get('catatan').trim() || '-')
    ];

    // Buka WhatsApp di tab baru
    window.open(buatLinkWA(baris.join('\n')), '_blank', 'noopener');
  });

  // Hapus garis merah saat pengunjung mulai mengetik
  form.addEventListener('input', function (e) {
    e.target.classList.remove('invalid');
  });
}


/* ---------------------------------------------------------------------
   4. MUSIK LATAR
   - Browser melarang musik otomatis, jadi musik baru bunyi setelah
     tombol ditekan.
   - Prioritas 1: file assets/musik-latar.mp3 (jika Anda menaruhnya).
   - Prioritas 2: melodi lembut buatan sendiri (Web Audio), dipakai
     otomatis bila file MP3 tidak ada.
   --------------------------------------------------------------------- */
function aktifkanMusik() {
  const tombol = document.getElementById('musicBtn');
  const audio = document.getElementById('bgm');
  if (!tombol) return;

  let sedangPutar = false;
  let ctx = null;        // AudioContext untuk melodi buatan
  let master = null;     // pengatur volume melodi
  let timer = null;      // pengulang tiap pergantian akord
  let pakaiSintetis = false;

  // Urutan akord hangat (frekuensi nada dalam Hz): Cmaj7 - Am7 - Fmaj7 - G
  const akord = [
    [261.63, 329.63, 392.00, 493.88],
    [220.00, 261.63, 329.63, 392.00],
    [174.61, 220.00, 261.63, 329.63],
    [196.00, 246.94, 293.66, 392.00]
  ];
  let urutan = 0;

  // Mainkan satu akord: nada naik pelan lalu turun pelan (lembut)
  function mainkanAkord(nada) {
    const t = ctx.currentTime;
    nada.forEach(function (f) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 1.2);
      gain.gain.linearRampToValueAtTime(0, t + 4.2);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 4.3);
    });
  }

  function mulaiSintetis() {
    pakaiSintetis = true;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;           // browser terlalu lama, tanpa musik
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.07;        // volume kecil agar tidak mengganggu
      master.connect(ctx.destination);
    }
    ctx.resume();
    mainkanAkord(akord[urutan % akord.length]);
    timer = setInterval(function () {
      urutan++;
      mainkanAkord(akord[urutan % akord.length]);
    }, 4000);
    return true;
  }

  function hentikanSintetis() {
    clearInterval(timer);
    if (ctx) ctx.suspend();
  }

  // Ubah tampilan tombol sesuai status
  function setTampilan(putar) {
    sedangPutar = putar;
    tombol.setAttribute('aria-pressed', String(putar));
    tombol.setAttribute('aria-label', putar ? 'Jeda musik latar' : 'Putar musik latar');
    tombol.querySelector('.music-txt').textContent = putar ? 'Jeda' : 'Musik';
  }

  tombol.addEventListener('click', function () {
    // Sedang bunyi -> jeda
    if (sedangPutar) {
      if (pakaiSintetis) hentikanSintetis(); else audio.pause();
      setTampilan(false);
      return;
    }

    // Belum bunyi -> coba MP3 dulu, kalau gagal pakai melodi buatan
    audio.volume = 0.4;
    audio.play().then(function () {
      pakaiSintetis = false;
      setTampilan(true);
    }).catch(function () {
      if (mulaiSintetis()) setTampilan(true);
    });
  });
}


/* ---------------------------------------------------------------------
   5. LAIN-LAIN: tahun otomatis di footer
   --------------------------------------------------------------------- */
function isiTahun() {
  const el = document.getElementById('tahun');
  if (el) el.textContent = new Date().getFullYear();
}


/* ---------------------------------------------------------------------
   Jalankan semua fungsi setelah halaman siap
   --------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  pasangKontak();
  document.querySelectorAll('[data-carousel]').forEach(aktifkanCarousel);
  aktifkanForm();
  aktifkanMusik();
  isiTahun();
});
