import React, { useState } from 'react';
import {
  X,
  SlidersHorizontal,
  Package,
  Building2,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Droplets,
  Scale,
} from 'lucide-react';
import { Item, Warehouse, StockInventory } from '../../types/erp';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (data: {
    itemId: string;
    warehouseId: string;
    adjustmentType: 'IN' | 'OUT';
    qty: number;
    reason: string;
    notes?: string;
  }) => void;
  items: Item[];
  warehouses: Warehouse[];
  stockInventory: StockInventory[];
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onPost,
  items,
  warehouses,
  stockInventory,
}) => {
  if (!isOpen) return null;

  const [itemId, setItemId] = useState<string>(items[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || 'wh-1');
  const [adjustmentType, setAdjustmentType] = useState<'IN' | 'OUT'>('OUT');
  const [qty, setQty] = useState<number>(5);
  const [reason, setReason] = useState<string>('SUSUT_ALAMIAH_TEMBAKAU');
  const [notes, setNotes] = useState<string>(
    'Penyesuaian susut penguapan kadar air tembakau hasil uji laboratorium pengeringan.',
  );

  const selectedItem = items.find((i) => i.id === itemId);
  const selectedWarehouse = warehouses.find((w) => w.id === warehouseId);
  const currentInv = stockInventory.find(
    (si) => si.itemId === itemId && si.warehouseId === warehouseId,
  );
  const currentQty = currentInv?.qty || 0;
  const currentAvgCost = currentInv?.averageCost || selectedItem?.standardCost || 50000;
  const totalValue = Math.round(qty * currentAvgCost);

  const reasonsList = [
    {
      id: 'SUSUT_ALAMIAH_TEMBAKAU',
      label: 'Susut Penguapan Alamiah Tembakau / Kadar Air',
      badge: 'Bahan Baku TSG',
    },
    {
      id: 'SELISIH_OPNAME_FISIK',
      label: 'Selisih Hitung Fisik Stock Opname Berkala',
      badge: 'Opname Fisik',
    },
    {
      id: 'KERUSAKAN_KEMASAN',
      label: 'Kerusakan Bahan Kemasan / Etiket Rusak / OPP Sobek',
      badge: 'Kemasan',
    },
    {
      id: 'KOREKSI_ADMINISTRASI',
      label: 'Koreksi Salah Catat Administrasi Gudang',
      badge: 'Administrasi',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0) {
      alert('Kuantitas penyesuaian harus lebih dari 0!');
      return;
    }
    if (adjustmentType === 'OUT' && qty > currentQty) {
      alert(
        `Kuantitas pengurangan (${qty} ${selectedItem?.stockUom}) melebihi stok yang ada di gudang (${currentQty} ${selectedItem?.stockUom})!`,
      );
      return;
    }

    const reasonObj = reasonsList.find((r) => r.id === reason);
    onPost({
      itemId,
      warehouseId,
      adjustmentType,
      qty,
      reason: reasonObj?.label || reason,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500 text-white">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                Penyesuaian Stok Persediaan & Stock Opname
              </h3>
              <p className="text-xs text-slate-400">
                Pencatatan Susut Alamiah Tembakau, Selisih Hasil Timbang Opname, dan Kerusakan Kemasan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item & Warehouse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Pilih Barang / Bahan Baku <span className="text-rose-500">*</span>
              </label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                required
              >
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    [{i.itemCode}] {i.itemName} ({i.itemType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Lokasi Gudang Penyimpanan <span className="text-rose-500">*</span>
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                required
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Stock Banner */}
          <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] uppercase font-black text-purple-700">
                SALDO FISIK SAAT INI DI GUDANG
              </div>
              <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                {currentQty.toLocaleString()} {selectedItem?.stockUom || 'Kg'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Harga Perolehan Rata-Rata:</div>
              <div className="font-mono font-bold text-slate-800 text-xs">
                Rp {currentAvgCost.toLocaleString()} / {selectedItem?.stockUom || 'Kg'}
              </div>
            </div>
          </div>

          {/* Adjustment Type & Qty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Arah Penyesuaian <span className="text-rose-500">*</span>
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-300 p-0.5 bg-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('OUT')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                    adjustmentType === 'OUT'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kurang (-)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('IN')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                    adjustmentType === 'IN'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tambah (+)
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Kuantitas Selisih <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-black text-slate-900 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  required
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                  {selectedItem?.stockUom || 'Kg'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Estimasi Nilai Koreksi</label>
              <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs">
                Rp {totalValue.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-700 font-bold block mb-1">
              Alasan Penyesuaian Persediaan <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              required
            >
              {reasonsList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label} [{r.badge}]
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-700 font-bold block mb-1">
              Rincian Keterangan Penyesuaian
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              placeholder="Sebutkan dasar pengujian kadar air, nomor berita acara opname, dll."
            />
          </div>

          {/* Accounting Journal Preview */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/80 text-[11px] space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-700" />
              <span>Simulasi Jurnal Selisih Persediaan (Akuntansi):</span>
            </div>
            <div className="font-mono text-slate-600 pl-5 space-y-0.5">
              {adjustmentType === 'OUT' ? (
                <>
                  <div>[Dr] 5003 Beban Selisih / Susut Persediaan: Rp {totalValue.toLocaleString()}</div>
                  <div>[Cr] 1201 Persediaan Bahan Baku & Kemasan: Rp {totalValue.toLocaleString()}</div>
                </>
              ) : (
                <>
                  <div>[Dr] 1201 Persediaan Bahan Baku & Kemasan: Rp {totalValue.toLocaleString()}</div>
                  <div>
                    [Cr] 8002 Pendapatan Lain-lain / Koreksi Persediaan: Rp {totalValue.toLocaleString()}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl shadow-md transition active:scale-98 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Posting Penyesuaian Stok</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
