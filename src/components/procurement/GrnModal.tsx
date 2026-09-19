import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Package,
  Calendar,
  Truck,
  FileCheck,
  AlertTriangle,
  Scale,
  Droplets,
} from 'lucide-react';
import { PurchaseOrder, GoodsReceiptNote } from '../../types/erp';

interface GrnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (
    poId: string,
    vendorDeliveryRef: string,
    notes: string,
    receivedQuantities: Record<string, number>,
    receiptDate: string,
    qcData?: {
      moisturePercent?: number;
      impurityPercent?: number;
      qcPassed?: boolean;
      qcInspectorName?: string;
    },
  ) => void;
  po: PurchaseOrder | null;
  existingGrns: GoodsReceiptNote[];
}

export const GrnModal: React.FC<GrnModalProps> = ({
  isOpen,
  onClose,
  onPost,
  po,
  existingGrns,
}) => {
  if (!isOpen || !po) return null;

  // Calculate previously received quantity per PO item
  const alreadyReceivedMap: Record<string, number> = {};
  existingGrns
    .filter((g) => g.poId === po.id)
    .forEach((g) => {
      g.items.forEach((it) => {
        alreadyReceivedMap[it.poItemId] =
          (alreadyReceivedMap[it.poItemId] || 0) + it.qtyReceived;
      });
    });

  const [vendorDeliveryRef, setVendorDeliveryRef] = useState<string>(
    `SJ-${po.supplierName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
  );
  const [receiptDate, setReceiptDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [moisturePercent, setMoisturePercent] = useState<number>(12.8);
  const [impurityPercent, setImpurityPercent] = useState<number>(0.8);
  const [qcPassed, setQcPassed] = useState<boolean>(true);
  const [qcInspectorName, setQcInspectorName] = useState<string>('Wahyu Setiawan (Lab QC)');
  const [qcNotes, setQcNotes] = useState<string>(
    'Lolos uji visual fisik, timbangan bruto cocok, dan kadar air memenuhi batas SNI (maks 14%).',
  );

  // Initial received quantities defaults to remaining outstanding qty
  const [receivedQtyMap, setReceivedQtyMap] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    po.items.forEach((it) => {
      const already = alreadyReceivedMap[it.id] || 0;
      const remaining = Math.max(0, it.qty - already);
      init[it.id] = remaining;
    });
    return init;
  });

  const handleQtyChange = (poItemId: string, val: number) => {
    setReceivedQtyMap((prev) => ({
      ...prev,
      [poItemId]: Math.max(0, val),
    }));
  };

  const handleSetFull = () => {
    const full: Record<string, number> = {};
    po.items.forEach((it) => {
      const already = alreadyReceivedMap[it.id] || 0;
      full[it.id] = Math.max(0, it.qty - already);
    });
    setReceivedQtyMap(full);
  };

  const totalCurrentValue = po.items.reduce((acc, it) => {
    const qty = receivedQtyMap[it.id] || 0;
    return acc + qty * it.unitPrice;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorDeliveryRef.trim()) {
      alert('Nomor Surat Jalan Vendor wajib diisi!');
      return;
    }

    const hasAnyQty = Object.values(receivedQtyMap).some((qty) => qty > 0);
    if (!hasAnyQty) {
      alert('Minimal harus ada 1 barang dengan kuantitas terima > 0!');
      return;
    }

    onPost(po.id, vendorDeliveryRef, qcNotes, receivedQtyMap, receiptDate, {
      moisturePercent: Number(moisturePercent),
      impurityPercent: Number(impurityPercent),
      qcPassed,
      qcInspectorName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500 text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                Penerimaan Fisik Barang Gudang (GRN)
              </h3>
              <p className="text-xs text-slate-400">
                Pencatatan Surat Jalan Supplier, Timbangan Fisik, dan Pengujian Mutu Masuk.
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* PO Quick Info Header */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div>
              <div className="text-[10px] uppercase font-black text-blue-600 tracking-wider">
                REFERENSI PURCHASE ORDER
              </div>
              <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>{po.poNumber}</span>
                <span className="text-slate-400">|</span>
                <span>{po.supplierName}</span>
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Tanggal Order: <strong>{po.orderDate}</strong> | Gudang Masuk:{' '}
                <strong>WH-MATERIAL</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSetFull}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] shadow-xs transition shrink-0"
            >
              Isi Sisa Pesanan Penuh
            </button>
          </div>

          {/* Reference Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Nomor Surat Jalan Supplier (DO/SJ)</span>{' '}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={vendorDeliveryRef}
                onChange={(e) => setVendorDeliveryRef(e.target.value)}
                placeholder="Contoh: SJ-TEM-2026/091"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Nomor yang tertera pada lembar jalan dari supir pengantar.
              </span>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Tanggal Terima Fisik</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Items Receipt Table */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              <span>Verifikasi Kuantitas Barang Datang</span>
            </label>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Kode & Nama Barang</th>
                    <th className="py-2.5 px-3 w-24 text-right">Qty PO</th>
                    <th className="py-2.5 px-3 w-24 text-right">Telah Terima</th>
                    <th className="py-2.5 px-3 w-24 text-right text-blue-800">Sisa PO</th>
                    <th className="py-2.5 px-3 w-32 text-right bg-blue-50/50">Diterima Saat Ini</th>
                    <th className="py-2.5 px-3 w-16 text-center">Satuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {po.items.map((item) => {
                    const already = alreadyReceivedMap[item.id] || 0;
                    const outstanding = Math.max(0, item.qty - already);
                    const currentInput = receivedQtyMap[item.id] ?? outstanding;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold text-slate-900">{item.itemCode}</div>
                          <div className="text-[11px] text-slate-600">{item.itemName}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {item.qty.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                          {already.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                          {outstanding.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 bg-blue-50/40">
                          <input
                            type="number"
                            min="0"
                            max={outstanding * 1.5}
                            step="any"
                            value={currentInput}
                            onChange={(e) => handleQtyChange(item.id, Number(e.target.value))}
                            className="w-full px-2 py-1 border border-blue-300 rounded-lg text-right font-mono font-black text-xs text-blue-950 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500 text-[11px]">
                          {item.uom}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* QC Inspection and Moisture Check Inputs */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>Pemeriksaan Mutu Masuk (Quality Control & Kadar Air)</span>
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${qcPassed ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                {qcPassed ? 'STATUS: LOLOS QC' : 'STATUS: DITOLAK QC'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">
                  Kadar Air (% MC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={moisturePercent}
                    onChange={(e) => setMoisturePercent(Number(e.target.value))}
                    className={`w-full px-2.5 py-1.5 border rounded-lg font-mono font-bold text-xs ${moisturePercent > 14 ? 'border-amber-500 text-amber-900 bg-amber-50' : 'border-slate-300 text-slate-900 bg-white'}`}
                  />
                  <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Standar tembakau: maks 14%</span>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">
                  Kadar Gagang / Kotoran
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={impurityPercent}
                    onChange={(e) => setImpurityPercent(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white text-xs"
                  />
                  <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Batas toleransi: maks 2%</span>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">
                  Inspektur / Analis QC
                </label>
                <input
                  type="text"
                  value={qcInspectorName}
                  onChange={(e) => setQcInspectorName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-900 bg-white text-xs"
                  placeholder="Nama petugas lab"
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">
                  Keputusan Kelulusan Mutu
                </label>
                <select
                  value={qcPassed ? 'true' : 'false'}
                  onChange={(e) => setQcPassed(e.target.value === 'true')}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white text-xs"
                >
                  <option value="true">Lolos Standar Mutu Masuk</option>
                  <option value="false">Tidak Lolos (Ajukan Retur)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">
                Catatan Hasil Analisis Fisik & Organoleptik
              </label>
              <textarea
                rows={2}
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Catatan hasil timbang jembatan, uji kelembaban tembakau, aroma, keutuhan kemasan..."
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-600">
              Nilai Fisik Diterima:{' '}
              <span className="font-mono font-black text-slate-900 text-sm">
                Rp {totalCurrentValue.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition active:scale-98 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Posting Bukti Penerimaan (GRN)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
