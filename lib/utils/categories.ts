// /**
//  * lib/utils/categories.ts
//  * Definisi semua kategori transaksi dan konfigurasinya.
//  *
//  * File ini menjadi sumber kebenaran tunggal (Single Source of Truth) untuk data kategori,
//  * digunakan oleh UI, AI classifier, dan backend.
//  */

// import { Category, CategoryId } from "@/types";

// /** Daftar semua kategori yang tersedia di Spendly */
// export const CATEGORIES: Category[] = [
//   {
//     id: "food",
//     label: "Food & Drinks",
//     icon: "🍜",
//     color: "#F59E0B",   // amber
//     type: "expense",
//   },
//   {
//     id: "transport",
//     label: "Transport",
//     icon: "🚗",
//     color: "#3B82F6",   // blue
//     type: "expense",
//   },
//   {
//     id: "bills",
//     label: "Bills & Utilities",
//     icon: "💡",
//     color: "#EF4444",   // red
//     type: "expense",
//   },
//   {
//     id: "shopping",
//     label: "Shopping",
//     icon: "🛍️",
//     color: "#EC4899",   // pink
//     type: "expense",
//   },
//   {
//     id: "entertainment",
//     label: "Entertainment",
//     icon: "🎮",
//     color: "#8B5CF6",   // violet
//     type: "expense",
//   },
//   {
//     id: "health",
//     label: "Health",
//     icon: "💊",
//     color: "#10B981",   // emerald
//     type: "expense",
//   },
//   {
//     id: "education",
//     label: "Education",
//     icon: "📚",
//     color: "#06B6D4",   // cyan
//     type: "expense",
//   },
//   {
//     id: "salary",
//     label: "Salary",
//     icon: "💼",
//     color: "#10B981",   // emerald
//     type: "income",
//   },
//   {
//     id: "freelance",
//     label: "Freelance",
//     icon: "💻",
//     color: "#34D399",   // lighter emerald
//     type: "income",
//   },
//   {
//     id: "other",
//     label: "Other",
//     icon: "📦",
//     color: "#6B7280",   // gray
//     type: "both",
//   },
// ];

// /** Map dari ID ke objek Category untuk lookup cepat O(1) */
// export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
//   (acc, cat) => ({ ...acc, [cat.id]: cat }),
//   {} as Record<CategoryId, Category>
// );

// /**
//  * Ambil objek Category berdasarkan ID.
//  * Mengembalikan kategori "other" jika ID tidak ditemukan (defensive programming).
//  */
// export function getCategoryById(id: CategoryId): Category {
//   return CATEGORY_MAP[id] ?? CATEGORY_MAP["other"];
// }

// /**
//  * Filter kategori berdasarkan tipe transaksi.
//  * Income categories: salary, freelance, other
//  * Expense categories: food, transport, bills, shopping, entertainment, health, education, other
//  */
// export function getCategoriesByType(type: "expense" | "income"): Category[] {
//   return CATEGORIES.filter(
//     (cat) => cat.type === type || cat.type === "both"
//   );
// }

// /**
//  * Label kandidat untuk AI zero-shot classification.
//  * Ini yang dikirim ke model HuggingFace sebagai candidate_labels.
//  * Deskripsi yang kaya konteks membantu model memahami setiap kategori.
//  */
// export const AI_CATEGORY_LABELS: Record<CategoryId, string[]> = {
//   food: [
//     "food",
//     "drinks",
//     "restaurant",
//     "meal",
//     "eating",
//     "makanan",
//     "minuman",
//     "makan",
//     "kopi",
//     "coffee",
//     "snack",
//     "groceries",
//     "belanja bahan makanan",
//   ],
//   transport: [
//     "transport",
//     "transportation",
//     "fuel",
//     "gasoline",
//     "bensin",
//     "commute",
//     "grab",
//     "gojek",
//     "taxi",
//     "bus",
//     "kereta",
//     "parkir",
//     "parking",
//     "toll",
//     "tol",
//   ],
//   bills: [
//     "bill",
//     "utility",
//     "electricity",
//     "water",
//     "internet",
//     "listrik",
//     "air",
//     "wifi",
//     "phone",
//     "pulsa",
//     "token",
//     "PLN",
//     "PDAM",
//   ],
//   shopping: [
//     "shopping",
//     "clothes",
//     "fashion",
//     "belanja",
//     "baju",
//     "sepatu",
//     "tokopedia",
//     "shopee",
//     "lazada",
//     "marketplace",
//   ],
//   entertainment: [
//     "entertainment",
//     "game",
//     "gaming",
//     "netflix",
//     "spotify",
//     "streaming",
//     "cinema",
//     "bioskop",
//     "hiburan",
//     "concert",
//     "konser",
//   ],
//   health: [
//     "health",
//     "medicine",
//     "doctor",
//     "hospital",
//     "pharmacy",
//     "obat",
//     "dokter",
//     "apotek",
//     "rumah sakit",
//     "klinik",
//     "gym",
//     "fitness",
//   ],
//   education: [
//     "education",
//     "course",
//     "book",
//     "tuition",
//     "kuliah",
//     "SPP",
//     "buku",
//     "kursus",
//     "seminar",
//     "workshop",
//     "school",
//     "sekolah",
//   ],
//   salary: [
//     "salary",
//     "paycheck",
//     "gaji",
//     "upah",
//     "THR",
//     "bonus",
//     "income",
//     "pemasukan",
//   ],
//   freelance: [
//     "freelance",
//     "project",
//     "client",
//     "payment received",
//     "bayaran",
//     "honor",
//     "fee",
//   ],
//   other: ["other", "miscellaneous", "lainnya", "dll"],
// };
