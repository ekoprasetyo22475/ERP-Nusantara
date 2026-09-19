import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Package,
  Calendar,
  Building,
  RotateCcw,
  FileText,
  AlertCircle,
  Warehouse as WarehouseIcon,
  CheckCircle2,
} from 'lucide-react';
import {
  GoodsReceiptNote,
  Item,
  PurchaseOrder,
  StockInventory,
  Supplier,
  SupplierInvoice,
  Warehouse,
} from '../../types/erp';

interface PurchaseReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (returnData: {
    poId?: string;
    grnId?: string;
    supplierInvoiceId?: string;
    supplierId: string;
    warehouseId: string;
    items: {
      itemId: string;
      qtyReturned: number;
      unitPrice: number;
      reason: string;
    }[];
    notes?: string;
    returnDate: string;
  }) => void;
  suppliers: Supplier[];
  warehouses: Warehouse[];
  items: Item[];
  stockInventory: StockInventory[];
  supplierInvoices: SupplierInvoice[];
  goodsReceiptNotes: GoodsReceiptNote[];
  purchaseOrders: PurchaseOrder[];
}

interface ReturnRow {
  itemId: string;
  qtyReturned: number;
  unitPrice: number;
  reason: string;
}

const COMMON_REASONS = [
  'Kadar Air Tinggi / Tembakau Lembab / Berjamur',
  'Papir Sobek / Tidak Rata / Lem Pudar',
  'Kemasan Rusak / Lipatan Pudar / Cacat Cetak',
  'Ukuran Tidak Presisi / Standar QC Tidak Lolos',
  'Salah Kirim Varian / Tidak Sesuai PO',
  'Kualitas Bahan Menurun / Busuk',
  'Kelebihan Kirim dari Pemasok',
];

export const PurchaseReturnModal: React.FC<PurchaseReturnModalProps> = ({
  isOpen,
  onClose,
  onSave,
  suppliers,
  warehouses,
  items,
  stockInventory,
  supplierInvoices,
  goodsReceiptNotes,
  purchaseOrders,
}) => {
  if (!isOpen) return null;

  const activeSuppliers = suppliers.filter((s) => s.isActive);
  const purchasableItems = items.filter(
    (i) => i.itemType !== 'FINISHED_GOODS' && i.itemType !== 'SEMI_FINISHED' && i.isActive,
  );

  const [returnDate, setReturnDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [supplierId, setSupplierId] = useState<string>(activeSuppliers[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Rows of items being returned
  const [rows, setRows] = useState<ReturnRow[]>([
    {
      itemId: purchasableItems[0]?.id || '',
      qtyReturned: 10,
      unitPrice: purchasableItems[0]?.standardCost || 50000,
      reason: COMMON_REASONS[0],
    },
  ]);

  // When supplier invoice is selected, automatically set supplier and suggest items
  const handleInvoiceSelect = (invId: string) => {
    setSelectedInvoiceId(invId);
    if (!invId) return;

    const inv = supplierInvoices.find((i) => i.id === invId);
    if (!inv) return;

    setSupplierId(inv.supplierId);

    // If invoice linked to a PO, inspect items from that PO
    if (inv.poId) {
      const po = purchaseOrders.find((p) => p.id === inv.poId);
      if (po && po.items.length > 0) {
        setRows(
          po.items.map((it) => ({
            itemId: it.itemId,
            qtyReturned: Math.min(10, it.qty),
            unitPrice: it.unitPrice,
            reason: COMMON_REASONS[0],
          })),
        );
      }
    }
  };

  const handleAddRow = () => {
    const firstItem = purchasableItems[0];
    setRows((prev) => [
      ...prev,
      {
        itemId: firstItem?.id || '',
        qtyReturned: 1,
        unitPrice: firstItem?.standardCost || 10000,
        reason: COMMON_REASONS[0],
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, itemId: string) => {
    const selectedItem = items.find((i) => i.id === itemId);
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      itemId,
      unitPrice: selectedItem?.standardCost || 10000,
    };
    setRows(updated);
  };

  const handleQtyChange = (index: number, val: number) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], qtyReturned: Math.max(0, val) };
    setRows(updated);
  };

  const handlePriceChange = (index: number, val: number) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], unitPrice: Math.max(0, val) };
    setRows(updated);
  };

  const handleReasonChange = (index: number, val: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], reason: val };
    setRows(updated);
  };

  // Calculations
  const subtotalDpp = rows.reduce(
    (sum, r) => sum + (r.qtyReturned || 0) * (r.unitPrice || 0),
    0,
  );
  const selectedSupplier = suppliers.find((s) => s.id === supplierId);
  const ppnRate = selectedSupplier?.taxStatus === 'TAXABLE' ? 11 : 0;
  const ppnAmount = Math.round((subtotalDpp * ppnRate) / 100);
  const totalDebitNote = subtotalDpp + ppnAmount;

  // Available invoices for this supplier
  const eligibleInvoices = supplierInvoices.filter(
    (inv) => !supplierId || inv.supplierId === supplierId,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      alert('Silakan pilih pemasok terlebih dahulu.');
      return;
    }

    if (rows.length === 0 || rows.some((r) => !r.itemId || r.qtyReturned <= 0)) {
      alert('Semua baris barang retur harus diisi dengan kuantitas lebih dari 0.');
      return;
    }

    // Stock sufficiency check
    for (const r of rows) {
      const inv = stockInventory.find(
        (i) => i.itemId === r.itemId && i.warehouseId === warehouseId,
      );
      const available = inv ? inv.qty : 0;
      if (r.qtyReturned > available) {
        const it = items.find((i) => i.id === r.itemId);
        alert(
          `Stok tidak mencukupi untuk retur ${it?.itemName || 'Barang'}. Tersedia: ${available}, retur: ${r.qtyReturned}`,
        );
        return;
      }
    }

    const linkedInvoice = supplierInvoices.find((i) => i.id === selectedInvoiceId);

    onSave({
      supplierId,
      warehouseId,
      supplierInvoiceId: selectedInvoiceId || undefined,
      poId: linkedInvoice?.poId,
      grnId: linkedInvoice?.grnId,
      returnDate,
      items: rows.map((r) => ({
        itemId: r.itemId,
        qtyReturned: r.qtyReturned,
        unitPrice: r.unitPrice,
        reason: r.reason,
      })),
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Terbitkan Retur Pembelian & Nota Debet (Debit Note)
              </h2>
              <p className="text-xs text-slate-500">
                Pengembalian barang rusak / cacat ke pemasok, pengurangan stok gudang & pemotongan hutang usaha (AP)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Return Date */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Tanggal Retur
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Supplier */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Pemasok (Supplier)
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={supplierId}
                  onChange={(e) => {
                    setSupplierId(e.target.value);
                    setSelectedInvoiceId('');
                  }}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                >
                  <option value="">-- Pilih Pemasok --</option>
                  {activeSuppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.taxStatus === 'TAXABLE' ? '(PKP)' : '(Non-PKP)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Warehouse Origin */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Gudang Asal Barang Retur
              </label>
              <div className="relative">
                <WarehouseIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} - {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Linked Invoice */}
            <div className="md:col-span-3 pt-2 border-t border-slate-200 flex flex-col md:flex-row items-start md:items-center gap-3">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                <FileText className="w-4 h-4 text-slate-500" />
                Potong Langsung Tagihan (AP):
              </span>
              <select
                value={selectedInvoiceId}
                onChange={(e) => handleInvoiceSelect(e.target.value)}
                className="w-full md:w-auto flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-red-500 focus:outline-hidden"
              >
                <option value="">-- Tidak Memotong Faktur Tertentu (Catat Saldo Debet) --</option>
                {eligibleInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} ({inv.vendorInvoiceNo}) — Total: Rp {inv.total.toLocaleString()} [Status: {inv.paymentStatus}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-100/75 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-500" />
                Daftar Bahan Baku / Kemasan yang Dikembalikan
              </span>
              <button
                type="button"
                onClick={handleAddRow}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Bahan
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item Bahan</th>
                    <th className="py-2.5 px-3 text-center">Stok Gudang</th>
                    <th className="py-2.5 px-3 text-right">Qty Retur</th>
                    <th className="py-2.5 px-3 text-right">Harga Satuan (Rp)</th>
                    <th className="py-2.5 px-3">Alasan Kerusakan / Retur</th>
                    <th className="py-2.5 px-3 text-right">Subtotal (Rp)</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows.map((r, idx) => {
                    const it = items.find((i) => i.id === r.itemId);
                    const inv = stockInventory.find(
                      (i) => i.itemId === r.itemId && i.warehouseId === warehouseId,
                    );
                    const availableStock = inv ? inv.qty : 0;
                    const lineSubtotal = (r.qtyReturned || 0) * (r.unitPrice || 0);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        {/* Item select */}
                        <td className="py-2 px-3 min-w-[200px]">
                          <select
                            value={r.itemId}
                            onChange={(e) => handleItemChange(idx, e.target.value)}
                            required
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                          >
                            {purchasableItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.itemCode} - {item.itemName} ({item.stockUom})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Available Stock */}
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`font-semibold ${
                              availableStock < r.qtyReturned ? 'text-red-600' : 'text-slate-700'
                            }`}
                          >
                            {availableStock.toLocaleString()} {it?.stockUom}
                          </span>
                        </td>

                        {/* Qty Returned */}
                        <td className="py-2 px-3 text-right w-24">
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={r.qtyReturned}
                            onChange={(e) => handleQtyChange(idx, parseFloat(e.target.value) || 0)}
                            required
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-right text-xs font-semibold focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                          />
                        </td>

                        {/* Unit Price */}
                        <td className="py-2 px-3 text-right w-32">
                          <input
                            type="number"
                            min="0"
                            value={r.unitPrice}
                            onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value) || 0)}
                            required
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-right text-xs focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                          />
                        </td>

                        {/* Reason */}
                        <td className="py-2 px-3 min-w-[220px]">
                          <input
                            type="text"
                            list={`reasons-${idx}`}
                            value={r.reason}
                            onChange={(e) => handleReasonChange(idx, e.target.value)}
                            placeholder="Alasan pengembalian barang..."
                            required
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                          />
                          <datalist id={`reasons-${idx}`}>
                            {COMMON_REASONS.map((reason, i) => (
                              <option key={i} value={reason} />
                            ))}
                          </datalist>
                        </td>

                        {/* Line Subtotal */}
                        <td className="py-2 px-3 text-right font-bold text-slate-800">
                          {lineSubtotal.toLocaleString()}
                        </td>

                        {/* Delete button */}
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            disabled={rows.length <= 1}
                            className="text-slate-400 hover:text-red-600 p-1 disabled:opacity-30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Catatan Berita Acara Retur / Nomor Surat Pengantar Pemasok
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Sesuai Berita Acara Kerusakan Bahan No. BA-QC-2026-09/01..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal DPP Retur:</span>
                <span className="font-semibold text-slate-800">Rp {subtotalDpp.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Koreksi PPN Masukan ({ppnRate}%):</span>
                <span className="font-semibold text-slate-800">Rp {ppnAmount.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Total Nilai Nota Debet (DN):</span>
                <span className="font-bold text-red-700 text-base">
                  Rp {totalDebitNote.toLocaleString()}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                * Sistem otomatis menjurnal: Debit Hutang Usaha (2001) / Kredit Persediaan (1201) & PPN Masukan (1151).
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Posting Retur & Terbitkan Nota Debet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
