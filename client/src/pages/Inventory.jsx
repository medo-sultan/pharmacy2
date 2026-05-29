// Inventory.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Plus, Search, Package2, AlertTriangle } from "lucide-react";

export default function Inventory() {
  const { apiFetch, isAdmin } = useAuth();

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  // Add Medicine
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);

  const [form, setForm] = useState({
    name: "",
    genericName: "",
    category: "general",
    manufacturer: "",
    price: "",
    stock: "",
    lowStockThreshold: "",
    expiryDate: "",
    description: "",
    requiresPrescription: false,
  });

  const [image, setImage] = useState(null);

  // Restock
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState("");
  const [restockExpiry, setRestockExpiry] = useState("");

  const load = async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/pharmacy/inventory");

      setMedicines(data.medicines || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // Add Medicine
  // =========================

  const addMedicine = async () => {
    try {
      setAdding(true);

      // ✅ JSON بدون FormData — على route الجديد
      await apiFetch("/pharmacy/medicine/add-json", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock || 0),
          lowStockThreshold: Number(form.lowStockThreshold || 10),
        }),
      });

      setShowAddModal(false);
      setForm({
        name: "",
        genericName: "",
        category: "general",
        manufacturer: "",
        price: "",
        stock: "",
        lowStockThreshold: "",
        expiryDate: "",
        description: "",
        requiresPrescription: false,
      });
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setAdding(false);
    }
  };

  // =========================
  // Restock
  // =========================

  const doRestock = async () => {
    try {
      await apiFetch(`/pharmacy/inventory/restock/${restockId}`, {
        method: "PUT",
        body: JSON.stringify({
          addQuantity: Number(restockQty),
          newExpiryDate: restockExpiry || undefined,
        }),
      });

      setRestockId(null);
      setRestockQty("");
      setRestockExpiry("");

      load();
    } catch (e) {
      alert(e.message);
    }
  };

  // =========================
  // Filters
  // =========================

  const filtered = medicines.filter((m) => {
    if (tab === "low" && !m.isLowStock) return false;
    if (tab === "expired" && !m.isExpired) return false;

    return m.name.toLowerCase().includes(search.toLowerCase());
  });

  const tabs = [
    {
      key: "all",
      label: "الكل",
    },
    {
      key: "low",
      label: "مخزون منخفض",
    },
    {
      key: "expired",
      label: "منتهي",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <p className="text-slate-500 text-sm uppercase tracking-widest">
            Pharmacy
          </p>

          <h1 className="text-4xl font-bold mt-1">المخزون</h1>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="h-12 px-6 rounded-2xl bg-cyan-400 text-black font-bold flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Plus size={18} />
            إضافة دواء
          </button>
        )}
      </div>

      {/* Filters */}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />

          <input
            placeholder="ابحث عن دواء..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 rounded-2xl bg-slate-900 border border-white/10 pl-12 pr-4 outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 rounded-2xl border transition-all ${
                tab === t.key
                  ? "bg-cyan-400/20 border-cyan-400 text-cyan-400"
                  : "bg-slate-900 border-white/10 text-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}

      <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-right p-4">الدواء</th>
                <th className="text-right p-4">الفئة</th>
                <th className="text-right p-4">السعر</th>
                <th className="text-right p-4">المخزون</th>
                <th className="text-right p-4">الصلاحية</th>
                <th className="text-right p-4"></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-10 text-slate-500">
                    جارٍ التحميل...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-10 text-slate-500">
                    لا توجد أدوية
                  </td>
                </tr>
              ) : (
                filtered.map((med) => (
                  <tr
                    key={med._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center">
                          <Package2 className="text-cyan-400" size={20} />
                        </div>

                        <div>
                          <p className="font-semibold">{med.name}</p>

                          <p className="text-xs text-slate-500">
                            {med.genericName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-300">{med.category}</td>

                    <td className="p-4 text-emerald-400 font-bold">
                      {med.price} ج
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            med.isLowStock ? "text-amber-400" : "text-slate-300"
                          }`}
                        >
                          {med.stock}
                        </span>

                        {med.isLowStock && (
                          <AlertTriangle className="text-amber-400" size={16} />
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-slate-400">
                      {med.expiryDate
                        ? new Date(med.expiryDate).toLocaleDateString("ar-EG")
                        : "—"}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => setRestockId(med._id)}
                        className="px-4 py-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 hover:scale-105 transition-all"
                      >
                        شحن
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-[#0f172a] border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">إضافة دواء جديد</h2>

              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="اسم الدواء"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 rounded-2xl bg-slate-900 border border-white/10 px-4 outline-none"
              />

              <input
                placeholder="الاسم العلمي"
                value={form.genericName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    genericName: e.target.value,
                  })
                }
                className="h-12 rounded-2xl bg-slate-900 border border-white/10 px-4 outline-none"
              />

              {/* ✅ select بدلاً من input حر — English values للـ model */}
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-12 rounded-2xl bg-slate-900 border border-white/10 px-4 outline-none text-slate-300"
              >
                <option value="general">عام (general)</option>
                <option value="antibiotic">مضاد حيوي (antibiotic)</option>
                <option value="vitamin">فيتامين (vitamin)</option>
                <option value="painkiller">مسكن (painkiller)</option>
                <option value="chronic">أمراض مزمنة (chronic)</option>
                <option value="topical">موضعي (topical)</option>
                <option value="other">أخرى (other)</option>
              </select>

              <input
                placeholder="الشركة المصنعة"
                value={form.manufacturer}
                onChange={(e) =>
                  setForm({
                    ...form,
                    manufacturer: e.target.value,
                  })
                }
                className="h-12 rounded-2xl bg-slate-900 border border-white/10 px-4 outline-none"
              />

              <input
                type="number"
                placeholder="السعر"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
                className="h-12 rounded-2xl bg-slate-900 border border-white/10 px-4 outline-none"
              />

              <input
                type="number"
                placeholder="المخزون"
                value={form.stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stock: e.target.value,
                  })
                }
                className="h-12 rounded-2xl bg-slate-900 border border-white/10 px-4 outline-none"
              />

              <input
                type="number"
                placeholder="حد التنبيه"
                value={form.lowStockThreshold}
                onChange={(e) =>
                  setForm({
                    ...form,
                    lowStockThreshold: e.target.value,
                  })
                }
                className="h-12 rounded-2xl bg-slate-900 border border-white/10 px-4 outline-none"
              />

              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    expiryDate: e.target.value,
                  })
                }
                className="h-12 rounded-2xl bg-slate-900 border border-white/10 px-4 outline-none"
              />

              <div className="md:col-span-2">
                <textarea
                  rows={4}
                  placeholder="الوصف"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl bg-slate-900 border border-white/10 p-4 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full text-slate-400"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.requiresPrescription}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      requiresPrescription: e.target.checked,
                    })
                  }
                />

                <span className="text-slate-300">يحتاج وصفة طبية</span>
              </div>
            </div>

            <button
              onClick={addMedicine}
              disabled={adding}
              className="w-full h-12 rounded-2xl bg-cyan-400 text-black font-bold mt-6 hover:scale-[1.02] transition-all"
            >
              {adding ? "جارٍ الإضافة..." : "إضافة الدواء"}
            </button>
          </div>
        </div>
      )}

      {/* Restock Modal */}

      {restockId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0f172a] border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-6">شحن المخزون</h2>

            <div className="space-y-4">
              <input
                type="number"
                placeholder="الكمية"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                className="w-full h-12 rounded-2xl bg-slate-900 border border-white/10 px-4 outline-none"
              />

              <input
                type="date"
                value={restockExpiry}
                onChange={(e) => setRestockExpiry(e.target.value)}
                className="w-full h-12 rounded-2xl bg-slate-900 border border-white/10 px-4 outline-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={doRestock}
                className="flex-1 h-12 rounded-2xl bg-cyan-400 text-black font-bold"
              >
                تأكيد
              </button>

              <button
                onClick={() => setRestockId(null)}
                className="flex-1 h-12 rounded-2xl border border-white/10 text-slate-400"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
