import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Package,
  Calendar,
  Building,
  DollarSign,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Item, PurchaseOrder, Supplier } from '../../types/erp';

interface PoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (poData: {
    supplierId: string;
    supplierName: string;
    orderDate: string;
    expectedDate: string;
    items: {
      itemId: string;
      itemCode: string;
      itemName: string;
      qty: number;
      uom: string;
      unitPrice: number;
      subtotal: number;
    }[];
    subtotal: number;
    ppnRate: number;
    ppnAmount: number;
    totalAmount: number;
    notes?: string;
  }) => void;
  suppliers: Supplier[];
  items: Item[];
  poToEdit?: PurchaseOrder | null;
  initialItemId?: string;
  initialQty?: number;
  initialSupplierId?: string;
}

interface ItemRow {
  itemId: string;
  qty: number;
  unitPrice: number;
}

export const PoModal: React.FC<PoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  suppliers,
  items,
  poToEdit,
  initialItemId,
  initialQty,
  initialSupplierId,
}) => {
  if (!isOpen) return null;

  const activeSuppliers = suppliers.filter((s) => s.isActive);
  const purchasableItems = items.filter(
    (i) => i.itemType !== 'FINISHED_GOODS' && i.itemType !== 'SEMI_FINISHED' && i.isActive,
  );

  const [supplierId, setSupplierId] = useState<string>(
    poToEdit
      ? poToEdit.supplierId
      : initialSupplierId || activeSuppliers[0]?.id || '',
  );
  const [orderDate, setOrderDate] = useState<string>(
    poToEdit ? poToEdit.orderDate : new Date().toISOString().split('T')[0],
  );
  const [expectedDate, setExpectedDate] = useState<string>(
    poToEdit
      ? poToEdit.expectedDate
      : new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
  );
  const [ppnRate, setPpnRate] = useState<number>(poToEdit ? poToEdit.ppnRate : 11);
  const [notes, setNotes] = useState<string>(poToEdit?.notes || '');

  // Item rows state
  const [rows, setRows] = useState<ItemRow[]>(() => {
    if (poToEdit && poToEdit.items.length > 0) {
      return poToEdit.items.map((it) => ({
        itemId: it.itemId,
        qty: it.qty,
        unitPrice: it.unitPrice,
      }));
    }
    if (initialItemId) {
      const selected = purchasableItems.find((it) => it.id === initialItemId);
      return [
        {
          itemId: initialItemId,
          qty: initialQty || selected?.minStock || 100,
          unitPrice: selected?.standardCost || 50000,
        },
      ];
    }
    const defaultItem = purchasableItems[0];
    return [
      {
        itemId: defaultItem?.id || '',
        qty: 100,
        unitPrice: defaultItem?.standardCost || 50000,
      },
    ];
  });

  const handleAddRow = () => {
    const firstItem = purchasableItems[0];
    setRows((prev) => [
      ...prev,
      {
        itemId: firstItem?.id || '',
        qty: 10,
        unitPrice: firstItem?.standardCost || 10000,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, selectedItemId: string) => {
    const found = items.find((i) => i.id === selectedItemId);
    setRows((prev) =>
      prev.map((r, idx) => {
        if (idx !== index) return r;
        return {
          ...r,
          itemId: selectedItemId,
          unitPrice: found?.standardCost || 0,
        };
      }),
    );
  };

  const handleQtyChange = (index: number, qty: number) => {
    setRows((prev) =>
      prev.map((r, idx) => (idx === index ? { ...r, qty: Math.max(0, qty) } : r)),
    );
  };

  const handlePriceChange = (index: number, price: number) => {
    setRows((prev) =>
      prev.map((r, idx) => (idx === index ? { ...r, unitPrice: Math.max(0, price) } : r)),
    );
  };

  // Calculations
  const processedItems = rows.map((r, idx) => {
    const it = items.find((i) => i.id === r.itemId);
    const subtotal = Math.round(r.qty * r.unitPrice);
    return {
      itemId: r.itemId,
      itemCode: it?.itemCode || `ITEM-${idx}`,
      itemName: it?.itemName || 'Barang',
      qty: r.qty,
      uom: it?.stockUom || 'Kg',
      unitPrice: r.unitPrice,
      subtotal,
    };
  });

  const subtotalDPP = processedItems.reduce((acc, it) => acc + it.subtotal, 0);
  const ppnAmount = Math.round((subtotalDPP * ppnRate) / 100);
  const grandTotal = subtotalDPP + ppnAmount;

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) {
      alert('Pilih supplier terlebih dahulu!');
      return;
    }
    if (processedItems.some((it) => it.qty <= 0)) {
      alert('Semua baris item harus memiliki kuantitas lebih dari 0!');
      return;
    }

    onSave({
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      orderDate,
      expectedDate,
      items: processedItems,
      subtotal: subtotalDPP,
      ppnRate,
      ppnAmount,
      totalAmount: grandTotal,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                {poToEdit ? `Edit Purchase Order (${poToEdit.poNumber})` : 'Penerbitan Purchase Order (PO) Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                Pemesanan Bahan Baku (TSG, Cengkeh), Kemasan (Papir, Etiket, OPP), dan Bahan Pembantu ke Rekanan.
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
          {/* Supplier & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Rekanan / Supplier <span className="text-rose-500">*</span>
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                required
              >
                {activeSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name} ({s.supplyCategory})
                  </option>
                ))}
              </select>
              {selectedSupplier && (
                <div className="mt-1 text-[11px] text-slate-500">
                  TOP: <strong>{selectedSupplier.paymentTermDays} Hari</strong> | NPWP:{' '}
                  <span className="font-mono">{selectedSupplier.npwp}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Tanggal Order PO <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Estimasi Tiba di Gudang <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-600" />
                <span>Rincian Barang yang Dipesan ({rows.length} Item)</span>
              </label>
              <button
                type="button"
                onClick={handleAddRow}
                className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Item</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center">No</th>
                    <th className="py-2.5 px-3 min-w-[240px]">Pilih Barang / Bahan</th>
                    <th className="py-2.5 px-3 w-28 text-right">Kuantitas</th>
                    <th className="py-2.5 px-3 w-20 text-center">Satuan</th>
                    <th className="py-2.5 px-3 w-36 text-right">Harga Satuan (Rp)</th>
                    <th className="py-2.5 px-3 w-36 text-right">Subtotal DPP (Rp)</th>
                    <th className="py-2.5 px-3 w-12 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {rows.map((row, index) => {
                    const selectedItem = items.find((i) => i.id === row.itemId);
                    const rowSubtotal = Math.round(row.qty * row.unitPrice);

                    return (
                      <tr key={index} className="hover:bg-slate-50/70 transition">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={row.itemId}
                            onChange={(e) => handleItemChange(index, e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            required
                          >
                            {purchasableItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                [{item.itemCode}] {item.itemName} ({item.itemType})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={row.qty}
                            onChange={(e) => handleQtyChange(index, Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-right font-mono font-bold text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            required
                          />
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-600">
                          {selectedItem?.stockUom || 'Kg'}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={row.unitPrice}
                            onChange={(e) => handlePriceChange(index, Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-right font-mono text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            required
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                          Rp {rowSubtotal.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            disabled={rows.length <= 1}
                            onClick={() => handleRemoveRow(index)}
                            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 transition"
                            title="Hapus Baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Section: Notes & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            <div className="md:col-span-7 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan Khusus PO / Instruksi Pengiriman
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  placeholder="Contoh: Pengiriman ke Gudang WH-MATERIAL, kadar air tembakau maksimal 14%, kemasan wajib bersih."
                />
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  PO yang berstatus <strong>POSTED</strong> akan langsung muncul di antrean penerimaan gudang (GRN) dan dapat dicetak sebagai dokumen resmi bertanda tangan.
                </p>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal DPP:</span>
                <span className="font-mono font-bold text-slate-900">
                  Rp {subtotalDPP.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span>PPN Masukan:</span>
                  <select
                    value={ppnRate}
                    onChange={(e) => setPpnRate(Number(e.target.value))}
                    className="px-1.5 py-0.5 border border-slate-300 rounded text-[10px] font-bold bg-white"
                  >
                    <option value={11}>11%</option>
                    <option value={12}>12%</option>
                    <option value={0}>0% (Bebas)</option>
                  </select>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  Rp {ppnAmount.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Nilai PO:</span>
                <span className="text-amber-700 font-mono text-base">
                  Rp {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition active:scale-98"
            >
              {poToEdit ? 'Simpan Perubahan PO' : 'Terbitkan Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
