/*
 Isi data kontak sebelum website dipublikasikan.
 Nomor WhatsApp gunakan format internasional tanpa +, spasi, atau strip.
 Contoh: 6281234567890
*/
const SITE_CONFIG = {
  whatsapp: "", // Contoh: "6281234567890"
  phone: "",    // Contoh: "+6281234567890"
  area: "",     // Contoh: "Batara Parkview dan perumahan sekitar, Kabupaten Tangerang"
  hours: "Berdasarkan konfirmasi dan ketersediaan",
  mapUrl: ""    // Link Google Maps jika ada
};

const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  });
  siteNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Buka menu");
  }));
}

function whatsappUrl(message) {
  const number = SITE_CONFIG.whatsapp.replace(/\D/g, "");
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : "";
}

document.querySelectorAll(".js-whatsapp").forEach(link => {
  const url = whatsappUrl("Halo Bantuin, saya ingin bertanya tentang layanan yang tersedia.");
  if (url) { link.href = url; link.target = "_blank"; link.rel = "noopener"; }
  else link.addEventListener("click", event => {
    event.preventDefault();
    alert("Nomor WhatsApp belum diatur. Isi SITE_CONFIG.whatsapp di file javascript.js terlebih dahulu.");
  });
});

document.querySelectorAll(".js-service").forEach(link => {
  const service = link.dataset.service || "Bantuan lainnya";
  const url = whatsappUrl(`Halo Bantuin, saya ingin bertanya tentang layanan: ${service}.\n\nLokasi saya: \nDetail pekerjaan: \nWaktu yang diinginkan: `);
  if (url) { link.href = url; link.target = "_blank"; link.rel = "noopener"; }
  else link.addEventListener("click", event => {
    event.preventDefault();
    alert("Nomor WhatsApp belum diatur. Isi SITE_CONFIG.whatsapp di file javascript.js terlebih dahulu.");
  });
});

document.querySelectorAll(".js-phone").forEach(link => {
  if (SITE_CONFIG.phone.trim()) {
    link.textContent = SITE_CONFIG.phone;
    link.href = `tel:${SITE_CONFIG.phone.replace(/[^\d+]/g, "")}`;
  } else { link.textContent = "Nomor belum diatur"; link.href = "#kontak"; }
});
document.querySelectorAll(".js-area").forEach(el => el.textContent = SITE_CONFIG.area.trim() || "Isi area perumahan atau wilayah layanan Anda.");
document.querySelectorAll(".js-hours").forEach(el => el.textContent = SITE_CONFIG.hours);
document.querySelectorAll(".js-map").forEach(link => {
  if (SITE_CONFIG.mapUrl.trim()) link.href = SITE_CONFIG.mapUrl;
  else link.addEventListener("click", event => {
    event.preventDefault();
    alert("Link Google Maps belum diatur. Isi SITE_CONFIG.mapUrl di file javascript.js jika diperlukan.");
  });
});
const year = document.getElementById("currentYear");
if (year) year.textContent = new Date().getFullYear();
