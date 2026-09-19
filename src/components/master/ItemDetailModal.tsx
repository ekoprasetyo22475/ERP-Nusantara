import React from 'react';
import { X, Package, Tag, ShieldCheck, BarChart3, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Item } from '../../types/erp';

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  onEdit?: (item: Item) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onEdit }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 border border-slate-200 my-8">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  {item.itemCode}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {item.isActive ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>
              <h3 className="font-black text-slate-900 text-lg mt-1">{item.itemName}</h3>
              {item.brand && (
                <div className="text-xs text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                  <Tag className="w-3 h-3" /> Merek: {item.brand} ({item.category})
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Specification Card */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px] uppercase font-bold">Kategori Material</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {item.itemType.replace('_', ' ')}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px] uppercase font-bold">Satuan Dasar (UOM)</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {item.stockUom}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px] uppercase font-bold">Standard Cost</span>
            <span className="font-bold text-emerald-700 font-mono text-sm mt-0.5 block">
              Rp {item.standardCost.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px] uppercase font-bold">Harga Rata-Rata (Moving Avg)</span>
            <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">
              Rp {item.averageCost.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Conversion & Inventory Safety */}
        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 space-y-2 text-xs">
          <div className="font-bold text-amber-950 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-amber-600" /> Parameter Pengadaan & Gudang
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <span className="text-slate-500 block text-[11px]">Satuan Pembelian (PO):</span>
              <span className="font-bold text-slate-800">
                1 {item.purchaseUom} = {item.conversionFactor} {item.stockUom}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Batas Ambang Persediaan:</span>
              <span className="font-mono text-slate-800 font-semibold">
                Min: {item.minStock.toLocaleString()} / Max: {item.maxStock.toLocaleString()} {item.stockUom}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5 text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" /> Catatan Spesifikasi Teknis:
          </span>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 italic">
            {item.notes || 'Tidak ada catatan spesifikasi khusus.'}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            ID Sistem: {item.id}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-bold"
            >
              Tutup
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition shadow-sm"
              >
                Edit Item Ini
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
