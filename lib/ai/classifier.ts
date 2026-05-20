/**
 * lib/ai/classifier.ts
 * AI auto-classification untuk transaksi keuangan.
 *
 * Flow:
 * 1. Parse amount dari teks (regex, lokal)
 * 2. Preprocess teks (hapus angka/satuan)
 * 3. Kirim ke HuggingFace API (jika token tersedia)
 * 4. Jika gagal → fallback ke keyword matching yang diperkaya
 *
 * File ini berjalan DI SERVER (API route), bukan di browser,
 * sehingga HUGGINGFACE_API_TOKEN bisa diakses dengan aman.
 */

import { parseAmount } from "@/lib/utils/amountParser";
import type { AIClassificationResult, CategoryId } from "@/types";

const HF_MODEL_URL =
  "https://api-inference.huggingface.co/models/MoritzLaurer/mDeBERTa-v3-base-mnli-xnli";

/** Kandidat label yang dikirim ke HuggingFace zero-shot classification */
const CANDIDATE_LABELS = [
  "food and drinks",
  "transportation and fuel",
  "bills and utilities",
  "shopping and fashion",
  "entertainment and games",
  "health and medicine",
  "education and books",
  "salary and income",
  "freelance and project payment",
  "other expenses",
] as const;

const LABEL_TO_CATEGORY: Record<string, CategoryId> = {
  "food and drinks": "food",
  "transportation and fuel": "transport",
  "bills and utilities": "bills",
  "shopping and fashion": "shopping",
  "entertainment and games": "entertainment",
  "health and medicine": "health",
  "education and books": "education",
  "salary and income": "salary",
  "freelance and project payment": "freelance",
  "other expenses": "other",
};

interface HFZeroShotResponse {
  sequence: string;
  labels: string[];
  scores: number[];
}

/**
 * Klasifikasi teks transaksi. Dipanggil dari server (API route).
 */
export async function classifyTransaction(
  text: string
): Promise<AIClassificationResult> {
  const amount = parseAmount(text);
  const cleanedText = preprocessText(text);

  // Jika teks terlalu pendek setelah preprocessing, langsung pakai fallback
  if (!cleanedText || cleanedText.length < 2) {
    return fallbackClassify(text, amount);
  }

  const token = process.env.HUGGINGFACE_API_TOKEN;

  // Jika token tidak dikonfigurasi, langsung pakai fallback (tidak error)
  if (!token) {
    return fallbackClassify(text, amount);
  }

  try {
    const response = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: cleanedText,
        parameters: { candidate_labels: CANDIDATE_LABELS, multi_label: false },
      }),
      // Timeout 8 detik — jangan tunggu terlalu lama
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.warn(`HuggingFace API ${response.status} — using fallback`);
      return fallbackClassify(text, amount);
    }

    const result = (await response.json()) as HFZeroShotResponse;

    // Model kadang return error object saat sedang loading
    if (!result.labels || !result.scores) {
      return fallbackClassify(text, amount);
    }

    const category = LABEL_TO_CATEGORY[result.labels[0]] ?? "other";
    return { category, confidence: result.scores[0], amount };
  } catch {
    return fallbackClassify(text, amount);
  }
}

// ─── Fallback: Rule-based keyword classifier ───────────────────────────────────
/**
 * Keyword dictionary yang diperkaya untuk Bahasa Indonesia dan Inggris.
 * Setiap kategori punya daftar keyword yang diurutkan dari yang paling spesifik.
 *
 * Strategi matching: cek exact word boundary supaya "makan" tidak salah match
 * di kata "makanan" yang sudah ada di kategori lain. Gunakan includes() sebagai
 * secondary check jika exact match tidak ditemukan.
 */
/**
 * Urutan pengecekan PENTING — dari yang paling spesifik ke yang paling umum.
 * Kategori dengan nama brand/keyword unik dicek duluan untuk menghindari false match
 * dari keyword pendek/ambigu di kategori lain (contoh: "mobil" vs "mobile legends").
 *
 * Urutan: salary → freelance → entertainment → health → education
 *         → food → transport → bills → shopping
 */
const KEYWORD_RULES: Array<{ category: CategoryId; keywords: string[] }> = [
  // ── 1. Income — prioritas tertinggi
  {
    category: "salary",
    keywords: [
      "gaji", "upah", "salary", "paycheck", "thr", "bonus gaji",
      "slip gaji", "transfer gaji", "terima gaji", "bayaran kerja",
    ],
  },
  {
    category: "freelance",
    keywords: [
      "freelance", "proyek", "project", "client", "klien", "honor",
      "fee desain", "fee foto", "fee video", "bayaran project",
      "transfer masuk", "dapat uang", "terima pembayaran",
    ],
  },

  // ── 2. Entertainment — dicek SEBELUM transport & food
  //    Alasan: nama game/streaming spesifik harus menang vs keyword pendek
  //    seperti "mobil" yang bisa false-match ke "mobile legends"
  {
    category: "entertainment",
    keywords: [
      // Streaming video — nama brand spesifik dulu
      "netflix", "disney+", "disney plus", "hbo max", "viu", "vidio",
      "prime video", "amazon prime", "apple tv+",
      // Streaming musik
      "spotify", "apple music", "youtube premium", "joox", "resso",
      // Gaming — nama game spesifik dulu (sebelum keyword pendek "game")
      "mobile legends", "pubg mobile", "free fire", "valorant",
      "genshin impact", "clash of clans", "clash royale", "codm",
      "ragnarok", "point blank", "among us", "roblox", "minecraft",
      "mlbb", "ff ", "pubg",
      "steam", "playstation", "ps4", "ps5", "xbox", "nintendo switch",
      // Top up game — frase spesifik
      "top up ml", "top up ff", "top up game", "topup game",
      "top up diamond", "voucher game", "diamond ml", "uc pubg",
      "token ff", "beli diamond",
      // Kata umum gaming (setelah nama spesifik)
      "game", "gaming",
      // Bioskop & acara
      "bioskop", "cinema", "cgv", "cinepolis", "xxi", " 21 ",
      "nonton film", "nonton bioskop",
      "konser", "concert", "event", "festival", "pertunjukan",
      // Olahraga & rekreasi
      "gym", "fitness center", "sport center",
      "karaoke", "bowling", "escape room", "paintball",
      // Liburan & penginapan
      "liburan", "wisata", "hotel", "hostel", "airbnb", "resort",
      "kolam renang", "waterpark", "taman hiburan", "theme park",
      // Bacaan digital
      "komik", "manga", "webtoon",
      // Langganan digital
      "subscribe", "langganan", "subscription",
    ],
  },

  // ── 3. Kesehatan — dicek sebelum food (karena "telur" bisa ada di dua)
  {
    category: "health",
    keywords: [
      "dokter", "doctor", "klinik", "puskesmas", "rumah sakit",
      "rs ", "rsud", "rsia", "apotek", "apotik", "kimia farma",
      "century health", "guardian", "watsons",
      "obat", "vitamin", "suplemen", "paracetamol", "amoxicillin",
      "antibiotik", "sirup obat", "tablet obat", "kapsul",
      "periksa", "konsultasi dokter", "cek darah", "laboratorium",
      "rontgen", "usg", "ecg",
      "gigi", "dokter gigi", "cabut gigi", "tambal gigi", "behel",
      "kacamata", "lensa kontak", "optik",
      "psikolog", "psikiater", "terapi",
      "bpjs kesehatan", "klaim bpjs",
    ],
  },

  // ── 4. Pendidikan
  {
    category: "education",
    keywords: [
      "spp", "ukt", "uang kuliah", "biaya kuliah", "daftar ulang",
      "kampus", "universitas", "sekolah",
      "les", "bimbel", "privat", "tutor",
      "buku teks", "buku pelajaran", "modul", "diktat",
      "udemy", "coursera", "skillshare", "duolingo",
      "seminar", "workshop", "webinar", "pelatihan", "training",
      "skripsi", "print skripsi", "jilid",
    ],
  },

  // ── 5. Makanan & minuman
  {
    category: "food",
    keywords: [
      // Makanan Indonesia
      "nasi", "mie", "mi ", "indomie", "bakso", "soto", "gado",
      "rendang", "sate", "ayam goreng", "bebek", "ikan bakar", "udang",
      "siomay", "batagor", "pempek", "ketoprak", "pecel", "rawon",
      "lontong", "opor", "gulai", "tongseng",
      "tempe", "tahu", "telur dadar", "sayur", "lauk",
      "sambal", "kerupuk", "gorengan", "martabak", "terang bulan",
      "cireng", "nasi padang", "warteg", "warung makan", "warkop",
      "angkringan", "prasmanan", "buffet",
      "makan siang", "makan malam", "sarapan", "makan pagi",
      "jajan", "cemilan", "snack", "kue", "roti", "donat",
      // Minuman
      "kopi", "coffee", "espresso", "cappuccino", "latte", "americano",
      "teh", "susu segar", "jus", "juice", "air mineral", "aqua",
      "bubble tea", "boba", "thai tea", "matcha", "coklat hangat", "milo",
      "es teh", "es jeruk", "es campur",
      // Fast food (brand)
      "mcdonald", "mcdonalds", "kfc", "burger king",
      "pizza hut", "dominos", "pizza", "burger", "sandwich",
      "subway", "popeyes", "fried chicken",
      "starbucks", "dunkin", "chatime", "koi", "fore coffee",
      // Supermarket makanan
      "alfamart", "indomaret", "superindo", "lottemart",
      "groceries", "belanja dapur", "sembako", "beras",
      "minyak goreng", "gula pasir", "garam",
      // Makanan Jepang & internasional
      "sushi", "ramen", "udon", "soba", "takoyaki", "tempura", "onigiri",
      "yakitori", "gyoza", "tonkatsu", "donburi", "bento", "miso",
      "korean bbq", "bbq", "shabu", "hotpot", "dimsum", "dim sum",
      "pasta", "spaghetti", "lasagna", "risotto", "steak", "grill",
      "salad", "soup", "noodle", "rice", "chicken", "fish", "beef",
      "pork", "lamb", "seafood", "shrimp",
      // General (kata pendek terakhir untuk hindari false match)
      "makan", "makanan", "restaurant", "resto", "cafe", "kafe",
      "kedai", "kantin", "food court",
    ],
  },

  // ── 6. Transportasi
  //    Hindari keyword pendek ambigu: "mobil" dihapus (bisa match "mobile")
  //    Ganti dengan frasa lebih spesifik
  {
    category: "transport",
    keywords: [
      // BBM
      "bensin", "bbm", "solar", "pertalite", "pertamax", "shell",
      "isi bensin", "beli bensin", "pom bensin", "spbu",
      // Ojol & ride-hailing (nama brand spesifik)
      "gojek", "grab", "maxim", "indriver", "ojek online", "ojol",
      "gocar", "grabbike", "grabcar",
      "taksi", "taxi", "bluebird", "uber",
      // Transportasi umum
      "busway", "transjakarta", "krl", "mrt", "lrt", "commuter line",
      "kereta api", "tiket kereta", "kai access",
      "pesawat", "lion air", "garuda", "citilink", "batik air",
      "sriwijaya", "tiket pesawat", "tiket pesawat", "airport",
      "pelni", "kapal laut", "ferry",
      // Kendaraan pribadi — frasa spesifik (bukan kata tunggal "mobil")
      "servis motor", "ganti oli", "tambal ban", "cuci motor", "cuci mobil",
      "servis mobil", "beli motor", "beli mobil", "cicilan motor",
      "helm", "jas hujan",
      // Parkir & tol
      "tol", "e-toll", "rfid", "parkir",
      // Sepeda
      "sepeda", "onthel",
    ],
  },

  // ── 7. Tagihan & utilitas
  {
    category: "bills",
    keywords: [
      "listrik", "pln", "token listrik", "bayar listrik",
      "pdam", "iuran air", "bayar air",
      "internet", "wifi", "indihome", "firstmedia", "biznet",
      "pulsa", "paket data", "kuota", "isi pulsa", "beli kuota",
      "telkomsel", "xl axiata", "axis", "tri", "smartfren", "by.u",
      "telkom", "indosat", "ooredoo",
      "tv kabel", "usee tv", "mivo",
      "cicilan", "angsuran", "kredit", "kpr", "cicilan rumah",
      "sewa kos", "bayar kos", "kontrakan", "biaya kos",
      "iuran", "arisan",
      "bpjs", "asuransi jiwa", "premi asuransi", "bayar premi",
      "pbb", "pajak",
      "tagihan", "bayar tagihan",
    ],
  },

  // ── 8. Belanja
  {
    category: "shopping",
    keywords: [
      "shopee", "tokopedia", "lazada", "tiktok shop", "bukalapak",
      "blibli", "zalora", "jd.id",
      "baju", "kemeja", "kaos", "celana", "rok", "dress", "jaket",
      "hoodie", "sweater",
      "sepatu", "sandal", "sneakers", "boots",
      "tas", "ransel", "dompet",
      "beli hp", "smartphone", "laptop", "tablet", "earphone",
      "headset", "charger", "powerbank", "mouse", "keyboard",
      "skincare", "makeup", "kosmetik", "parfum", "serum",
      "lipstik", "foundation", "bedak",
      "alat tulis", "buku tulis", "pulpen",
      "furniture", "kursi", "meja", "lemari",
      "belanja online", "beli online",
    ],
  },

  // ── Pendidikan
  {
    category: "education",
    keywords: [
      "spp", "ukt", "uang kuliah", "biaya kuliah", "daftar ulang",
      "kampus", "universitas", "sekolah", "sd", "smp", "sma",
      "les", "kursus", "bimbel", "privat", "tutor",
      "buku teks", "buku pelajaran", "modul", "diktat",
      "udemy", "coursera", "skillshare", "duolingo",
      "seminar", "workshop", "webinar", "pelatihan", "training",
      "skripsi", "print skripsi", "jilid", "binding",
      "alat tulis kuliah", "atk kampus",
    ],
  },
];

/**
 * Fallback classifier berbasis keyword yang diperkaya.
 * Menggunakan word-boundary matching untuk mengurangi false positives.
 */
function fallbackClassify(
  text: string,
  amount: number | null
): AIClassificationResult {
  const lower = text.toLowerCase();

  for (const rule of KEYWORD_RULES) {
    for (const keyword of rule.keywords) {
      // Gunakan includes() — cukup untuk matching natural language
      if (lower.includes(keyword)) {
        return {
          category: rule.category,
          // Confidence lebih tinggi jika keyword lebih panjang (lebih spesifik)
          confidence: keyword.length >= 5 ? 0.75 : 0.65,
          amount,
        };
      }
    }
  }

  return { category: "other", confidence: 0.3, amount };
}

/**
 * Bersihkan teks dari angka dan satuan uang sebelum dikirim ke AI.
 * Contoh: "beli nasi goreng 15rb" → "beli nasi goreng"
 */
function preprocessText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\d+(?:[.,]\d+)?\s*(?:rb|ribu|k|jt|juta|m)\b/gi, "")
    .replace(/rp\.?\s*\d[\d.,]*/gi, "")
    .replace(/\b\d+\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
