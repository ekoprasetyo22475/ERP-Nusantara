import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Edit3,
  ShoppingCart,
  Search,
  ArrowUpDown,
  Filter,
  Package,
  TrendingDown,
  Info,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Item, StockInventory, Supplier } from '../../types/erp';
import { dbService } from '../../services/mockDatabase';

interface SafetyStockWidgetProps {
  items: Item[];
  stockInventory: StockInventory[];
  suppliers: Supplier[];
  onQuickReorder: (item: Item, suggestedQty: number, preferredSupplierId?: string) => void;
  onRefresh: () => void;
}

export const SafetyStockWidget: React.FC<SafetyStockWidgetProps> = ({
  items,
  stockInventory,
  suppliers,
  onQuickReorder,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'SAFE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'RAW_MATERIAL' | 'PACKAGING' | 'SPAREPART'>('ALL');
  const [safetyMultiplier, setSafetyMultiplier] = useState<number>(1.0); // 1.0x, 1.25x, 1.5x

  // Modal edit threshold state
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editMinStock, setEditMinStock] = useState<number>(0);
  const [editMaxStock, setEditMaxStock] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>('');

  // Filter items to only materials, packaging, and spareparts
  const materialItems = items.filter(
    (i) =>
      i.itemType !== 'FINISHED_GOODS' &&
      i.itemType !== 'SEMI_FINISHED' &&
      i.isActive,
  );

  // Calculate current stock aggregated across warehouses
  const itemStockData = materialItems.map((item) => {
    const totalCurrentStock = stockInventory
      .filter((inv) => inv.itemId === item.id)
      .reduce((sum, inv) => sum + inv.qty, 0);

    const effectiveMinStock = Math.round(item.minStock * safetyMultiplier);
    const effectiveMaxStock = Math.max(item.maxStock || item.minStock * 3, effectiveMinStock * 2);

    let status: 'CRITICAL' | 'WARNING' | 'SAFE' = 'SAFE';
    if (totalCurrentStock <= 0) {
      status = 'CRITICAL';
    } else if (totalCurrentStock < effectiveMinStock) {
      status = 'WARNING';
    } else {
      status = 'SAFE';
    }

    // Suggested order qty to reach max stock
    const deficit = Math.max(0, effectiveMaxStock - totalCurrentStock);
    const suggestedReorderQty = Math.max(deficit, effectiveMinStock);

    // Estimate daily consumption (SKT giling benchmark: 120 kg TSG / day, etc.)
    const estDailyConsumption = item.itemCode.includes('TSG')
      ? 120
      : item.itemCode.includes('PAPIR')
      ? 120000
      : item.itemCode.includes('BKS')
      ? 10000
      : Math.max(1, Math.round(effectiveMinStock / 14));

    const estDaysRemaining = totalCurrentStock > 0 ? (totalCurrentStock / estDailyConsumption).toFixed(1) : '0';

    return {
      item,
      currentStock: totalCurrentStock,
      effectiveMinStock,
      effectiveMaxStock,
      baseMinStock: item.minStock,
      status,
      suggestedReorderQty,
      estDaysRemaining,
      estDailyConsumption,
    };
  });

  // Filtered items
  const filteredData = itemStockData.filter((data) => {
    const matchSearch =
      data.item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      data.item.itemCode.toLowerCase().includes(search.toLowerCase());

    const matchStatus = filterStatus === 'ALL' || data.status === filterStatus;
    const matchCategory = categoryFilter === 'ALL' || (data.item.itemType as string) === categoryFilter;

    return matchSearch && matchStatus && matchCategory;
  });

  // Aggregated KPI Stats
  const totalMonitored = itemStockData.length;
  const criticalCount = itemStockData.filter((d) => d.status === 'CRITICAL').length;
  const warningCount = itemStockData.filter((d) => d.status === 'WARNING').length;
  const safeCount = itemStockData.filter((d) => d.status === 'SAFE').length;

  const handleOpenEdit = (data: typeof itemStockData[0]) => {
    setEditingItem(data.item);
    setEditMinStock(data.baseMinStock);
    setEditMaxStock(data.item.maxStock || data.baseMinStock * 3);
    setEditReason('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      dbService.updateItemMinStock(editingItem.id, editMinStock, editMaxStock);
      setEditingItem(null);
      onRefresh();
    } catch (err: any) {
      alert(`Gagal memperbarui batas safety stock: ${err.message}`);
    }
  };

  return (
    <div id="safety-stock-widget" className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total SKU Dipantau
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalMonitored}</div>
            <div className="text-xs text-slate-400 mt-1">Bahan Baku & Kemasan</div>
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-red-600">
              Stok Habis / Kritis (0)
            </div>
            <div className="text-2xl font-bold text-red-700 mt-1">{criticalCount}</div>
            <div className="text-xs text-red-500 mt-1 font-medium">Darurat Operasional Pabrik</div>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Di Bawah Reorder Point
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{warningCount}</div>
            <div className="text-xs text-amber-600 mt-1">Perlu Terbitkan PO Segera</div>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Stok Aman Di Atas ROP
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{safeCount}</div>
            <div className="text-xs text-emerald-600 mt-1">Stok Memadai Sesuai Target</div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Operator Adjustment Bar */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-amber-200/80 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                Kalibrasi Parameter Buffer Stock (Sesuai Keinginan Operator)
                <span className="text-[11px] font-normal px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                  Fleksibel
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Operator dapat menyesuaikan batas Safety Stock (ROP) per item atau mengaplikasikan pengali musiman secara instan.
              </div>
            </div>
          </div>

          {/* Quick Multiplier Buttons */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-xs">
            <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Mode Penyangga:
            </span>
            <button
              type="button"
              onClick={() => setSafetyMultiplier(1.0)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                safetyMultiplier === 1.0
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              1.0x (Normal)
            </button>
            <button
              type="button"
              onClick={() => setSafetyMultiplier(1.25)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                safetyMultiplier === 1.25
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              1.25x (Peak Season)
            </button>
            <button
              type="button"
              onClick={() => setSafetyMultiplier(1.5)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                safetyMultiplier === 1.5
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              1.5x (Musim Hujan/Ekstra)
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filters */}
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Status ({totalMonitored})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              filterStatus === 'CRITICAL'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Kritis ({criticalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('WARNING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              filterStatus === 'WARNING'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Di Bawah ROP ({warningCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('SAFE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              filterStatus === 'SAFE'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aman ({safeCount})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="RAW_MATERIAL">Bahan Baku (TSG & Saus)</option>
            <option value="PACKAGING">Bahan Kemasan (Papir & Bungkus)</option>
            <option value="SPAREPART">Sparepart & Logistik</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kode / nama bahan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Materials Safety Stock Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Item & Spesifikasi</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Stok Aktual</th>
                <th className="py-3 px-4 text-center">Safety Stock (ROP)</th>
                <th className="py-3 px-4 text-center">Status & Buffer Level</th>
                <th className="py-3 px-4 text-center">Estimasi Ketahanan</th>
                <th className="py-3 px-4 text-right">Saran Order (PO)</th>
                <th className="py-3 px-4 text-center">Aksi Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Tidak ada data bahan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((d) => {
                  const percentOfMin = d.effectiveMinStock > 0
                    ? Math.min(200, Math.round((d.currentStock / d.effectiveMinStock) * 100))
                    : 100;

                  return (
                    <tr key={d.item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Item info */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{d.item.itemName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {d.item.itemCode}
                          </span>
                          <span>UOM: {d.item.stockUom}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {d.item.category.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-sm text-slate-900">
                          {d.currentStock.toLocaleString()}{' '}
                          <span className="text-xs font-normal text-slate-500">{d.item.stockUom}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Standar: Rp {d.item.standardCost.toLocaleString()}/{d.item.stockUom}
                        </div>
                      </td>

                      {/* Safety Stock / ROP */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">
                            {d.effectiveMinStock.toLocaleString()}{' '}
                            <span className="text-[11px] text-slate-500">{d.item.stockUom}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(d)}
                            title="Sesuaikan Batas Safety Stock Operator"
                            className="p-1 hover:bg-amber-100 text-amber-700 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {safetyMultiplier !== 1.0 && (
                          <div className="text-[10px] text-amber-600 font-medium">
                            (Base: {d.baseMinStock.toLocaleString()} × {safetyMultiplier}x)
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          Maks: {d.effectiveMaxStock.toLocaleString()}
                        </div>
                      </td>

                      {/* Status and visual gauge */}
                      <td className="py-3 px-4">
                        <div className="w-36 mx-auto">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span
                              className={`font-semibold ${
                                d.status === 'CRITICAL'
                                  ? 'text-red-700'
                                  : d.status === 'WARNING'
                                  ? 'text-amber-700'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {d.status === 'CRITICAL'
                                ? 'KRITIS (0)'
                                : d.status === 'WARNING'
                                ? 'DI BAWAH ROP'
                                : 'AMAN'}
                            </span>
                            <span className="text-slate-500">{percentOfMin}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                d.status === 'CRITICAL'
                                  ? 'bg-red-600'
                                  : d.status === 'WARNING'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, percentOfMin)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Estimated days */}
                      <td className="py-3 px-4 text-center">
                        <div className="font-semibold text-slate-800">
                          {d.estDaysRemaining}{' '}
                          <span className="text-[11px] font-normal text-slate-500">Hari</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ~{d.estDailyConsumption.toLocaleString()} {d.item.stockUom}/hari
                        </div>
                      </td>

                      {/* Suggested Order */}
                      <td className="py-3 px-4 text-right font-medium">
                        {d.status !== 'SAFE' ? (
                          <div>
                            <span className="font-bold text-amber-700">
                              +{d.suggestedReorderQty.toLocaleString()} {d.item.stockUom}
                            </span>
                            <div className="text-[10px] text-slate-500">
                              ~Rp {(d.suggestedReorderQty * d.item.standardCost).toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {d.status !== 'SAFE' ? (
                            <button
                              type="button"
                              onClick={() => onQuickReorder(d.item, d.suggestedReorderQty)}
                              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium shadow-xs flex items-center gap-1 transition-all"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Buat PO
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(d)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors"
                            >
                              Sesuaikan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Threshold Safety Stock Operator */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Sesuaikan Batas Safety Stock (ROP)
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Diatur langsung oleh operator persediaan
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-800 text-sm">{editingItem.itemName}</div>
                <div className="text-slate-500 font-mono text-xs mt-0.5">
                  Kode: {editingItem.itemCode} | Satuan: {editingItem.stockUom}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Batas Minimum / Reorder Point (ROP) ({editingItem.stockUom})
                </label>
                <input
                  type="number"
                  min="0"
                  value={editMinStock}
                  onChange={(e) => setEditMinStock(Number(e.target.value))}
                  required
                  className="w-full text-sm font-semibold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Pabrik akan mengeluarkan peringatan saat stok jatuh di bawah angka ini.
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Batas Maksimum Kapasitas Gudang ({editingItem.stockUom})
                </label>
                <input
                  type="number"
                  min={editMinStock}
                  value={editMaxStock}
                  onChange={(e) => setEditMaxStock(Number(e.target.value))}
                  required
                  className="w-full text-sm font-semibold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Catatan / Alasan Penyesuaian (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: Persiapan peningkatan kapasitas giling SKT..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium shadow-xs transition-colors"
                >
                  Simpan Batas ROP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
