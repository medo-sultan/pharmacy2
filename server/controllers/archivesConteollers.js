// archivesControllers.js
import staffLogModel from "../models/staffLog.js";

// ═══════════════════════════════════════════════════════
//  الأرشيف — بيقرأ من staffLog ويفلتر عمليات المخزون
// ═══════════════════════════════════════════════════════

const INVENTORY_ACTIONS = [
  "ADD_MEDICINE",
  "DELETE_MEDICINE",
  "RESTOCK_MEDICINE",
];

// @route GET /api/archives/inventory
// جيب كل عمليات المخزون (إضافة / حذف / شحن)
export const getInventoryArchive = async (req, res) => {
  try {
    const { from, to, action, page = 1, limit = 50 } = req.query;

    const filter = { action: { $in: INVENTORY_ACTIONS } };

    if (action && INVENTORY_ACTIONS.includes(action)) {
      filter.action = action;
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      staffLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      staffLogModel.countDocuments(filter),
    ]);

    // شكّل الـ response عشان يكون واضح للـ frontend
    const entries = logs.map((log) => ({
      _id: log._id,
      action: log.action,
      actionLabel: ACTION_LABELS[log.action] || log.action,
      performedBy: log.staffName || "غير معروف",
      medicineName: log.details?.medicineName || "—",
      medicineId: log.details?.medicineId || null,
      details: buildDetails(log.action, log.details),
      createdAt: log.createdAt,
    }));

    res.json({
      success: true,
      entries,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch archive" });
  }
};

// ── Helpers ──────────────────────────────────────────────

const ACTION_LABELS = {
  ADD_MEDICINE: "إضافة دواء",
  DELETE_MEDICINE: "حذف دواء",
  RESTOCK_MEDICINE: "شحن مخزون",
};

// بيبني جملة وصفية لكل عملية
function buildDetails(action, d = {}) {
  switch (action) {
    case "ADD_MEDICINE":
      return `سعر: ${d.price ?? "—"} ج | مخزون: ${d.stock ?? "—"} وحدة`;
    case "DELETE_MEDICINE":
      return `تم إخفاء الدواء من النظام`;
    case "RESTOCK_MEDICINE":
      return `${d.oldStock ?? "?"} ← ${d.newStock ?? "?"} وحدة (+${d.addedQuantity ?? "?"})`;
    default:
      return "";
  }
}
