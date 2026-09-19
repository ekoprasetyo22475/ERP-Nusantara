import React, { useState } from 'react';
import {
  X,
  ArrowRightLeft,
  Warehouse as WarehouseIcon,
  Truck,
  UserCheck,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Item, Warehouse, StockInventory, StockTransfer } from '../../types/erp';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (data: {
    originWarehouseId: string;
    destinationWarehouseId: string;
    transferDate: string;
    items: {
      itemId: string;
      qty: number;
      notes?: string;
    }[];
    driverName?: string;
    vehicleNo?: string;
    dispatcherName?: string;
    recipientName?: string;
    notes?: string;
  }) => StockTransfer | void;
  items: Item[];
  warehouses: Warehouse[];
  stockInventory: StockInventory[];
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({
  isOpen,
  onClose,
  onPost,
  items,
  warehouses,
  stockInventory,
}) => {
  if (!isOpen) return null;

  const [originWhId, setOriginWhId] = useState<string>(
    warehouses[0]?.id || 'wh-1',
  );
  const [destWhId, setDestWhId] = useState<string>(
    warehouses.length > 1 ? warehouses[1].id : 'wh-2',
  );
  const [transferDate, setTransferDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [driverName, setDriverName] = useState<string>('Pak Joko (Internal)');
  const [vehicleNo, setVehicleNo] = useState<string>('K 8421 BB (Forklift / Tossa)');
  const [dispatcherName, setDispatcherName] = useState<string>('Agus Subagyo (Logistik)');
  const [recipientName, setRecipientName] = useState<string>('Bambang Irawan (Mandor Lantai)');
  const [notes, setNotes] = useState<string>(
    'Pemindahan bahan baku & pembantu untuk pemenuhan jadwal kerja shift harian.',
  );

  // Transfer item lines
  const [lines, setLines] = useState<
    { itemId: string; qty: number; notes: string }[]
  >([
    {
      itemId: items[0]?.id || '',
      qty: 100,
      notes: 'Permintaan bahan baku lantai giling/linting',
    },
  ]);

  const handleAddLine = () => {
    const nextItem = items.find((it) => !lines.some((l) => l.itemId === it.id)) || items[0];
    if (nextItem) {
      setLines([
        ...lines,
        {
          itemId: nextItem.id,
          qty: 10,
          notes: '',
        },
      ]);
    }
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) {
      alert('Minimal 1 baris barang harus ditransfer.');
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  // Helper to get stock in origin warehouse
  const getOriginStock = (itemId: string): number => {
    const inv = stockInventory.find(
      (si) => si.itemId === itemId && si.warehouseId === originWhId,
    );
    return inv ? inv.qty : 0;
  };

  const getOriginAvgCost = (itemId: string): number => {
    const inv = stockInventory.find(
      (si) => si.itemId === itemId && si.warehouseId === originWhId,
    );
    if (inv && inv.averageCost > 0) return inv.averageCost;
    const it = items.find((i) => i.id === itemId);
    return it?.standardCost || 0;
  };

  // Check validation
  let hasStockError = false;
  let errorMessage = '';

  if (originWhId === destWhId) {
    hasStockError = true;
    errorMessage = 'Gudang asal dan gudang tujuan tidak boleh sama.';
  } else {
    for (const l of lines) {
      const avail = getOriginStock(l.itemId);
      const it = items.find((i) => i.id === l.itemId);
      if (l.qty <= 0) {
        hasStockError = true;
        errorMessage = `Kuantitas untuk ${it?.itemName || 'barang'} harus lebih besar dari 0.`;
        break;
      }
      if (l.qty > avail) {
        hasStockError = true;
        errorMessage = `Stok ${it?.itemName} tidak cukup di gudang asal (Tersedia: ${avail.toLocaleString()} ${it?.stockUom}, Diminta: ${l.qty.toLocaleString()}).`;
        break;
      }
    }
  }

  const totalTransferQty = lines.reduce((acc, l) => acc + (Number(l.qty) || 0), 0);
  const totalValuation = lines.reduce((acc, l) => {
    const cost = getOriginAvgCost(l.itemId);
    return acc + (Number(l.qty) || 0) * cost;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasStockError) {
      alert(errorMessage);
      return;
    }

    try {
      onPost({
        originWarehouseId: originWhId,
        destinationWarehouseId: destWhId,
        transferDate,
        items: lines.map((l) => ({
          itemId: l.itemId,
          qty: Number(l.qty),
          notes: l.notes,
        })),
        driverName,
        vehicleNo,
        dispatcherName,
        recipientName,
        notes,
      });
      onClose();
    } catch (err: any) {
      alert(`Gagal memproses mutasi antar gudang: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-xl border border-blue-400/30 text-blue-300">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Surat Jalan Transfer Antar Gudang (SJT)
              </h3>
              <p className="text-xs text-blue-200">
                Pemindahan fisik bahan baku, kemasan, atau produk antar fasilitas penyimpanan pabrik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-800">
          {/* Header Row: Origin, Destination & Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <WarehouseIcon className="w-3.5 h-3.5 text-blue-700" />
                Gudang Asal (Keluar -)
              </label>
              <select
                value={originWhId}
                onChange={(e) => setOriginWhId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    [{w.code}] {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <WarehouseIcon className="w-3.5 h-3.5 text-emerald-700" />
                Gudang Tujuan (Masuk +)
              </label>
              <select
                value={destWhId}
                onChange={(e) => setDestWhId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    [{w.code}] {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Tanggal Pemindahan
              </label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Expedited logistics info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                <Truck className="w-3 h-3 text-slate-500" />
                No. Polisi / Armada
              </label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                placeholder="cth: Forklift 01 / K 8421 BB"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                <Truck className="w-3 h-3 text-slate-500" />
                Nama Petugas / Sopir
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                placeholder="cth: Budi Susanto"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-slate-500" />
                Petugas Pengirim
              </label>
              <input
                type="text"
                value={dispatcherName}
                onChange={(e) => setDispatcherName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                placeholder="cth: Agus Subagyo"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-slate-500" />
                Penerima Tujuan
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                placeholder="cth: Mandor Giling"
              />
            </div>
          </div>

          {/* Transfer Item Lines Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Daftar Barang yang Dipindahkan
              </span>
              <button
                type="button"
                onClick={handleAddLine}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-xs border border-blue-200 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Baris Barang
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2 px-3 w-8">#</th>
                    <th className="py-2 px-3">Pilih Barang</th>
                    <th className="py-2 px-3 text-right w-28">Stok Asal</th>
                    <th className="py-2 px-3 text-right w-32">Kuantitas Transfer</th>
                    <th className="py-2 px-3 text-center w-20">Satuan</th>
                    <th className="py-2 px-3 text-right w-32">Estimasi Nilai (Rp)</th>
                    <th className="py-2 px-3 w-40">Catatan Khusus</th>
                    <th className="py-2 px-2 text-center w-10">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {lines.map((line, idx) => {
                    const selItem = items.find((i) => i.id === line.itemId);
                    const stockAvail = getOriginStock(line.itemId);
                    const avgCost = getOriginAvgCost(line.itemId);
                    const lineValuation = (Number(line.qty) || 0) * avgCost;
                    const isExceed = Number(line.qty) > stockAvail;

                    return (
                      <tr key={idx} className={isExceed ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={line.itemId}
                            onChange={(e) =>
                              handleLineChange(idx, 'itemId', e.target.value)
                            }
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-900"
                          >
                            {items.map((it) => (
                              <option key={it.id} value={it.id}>
                                [{it.itemCode}] {it.itemName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-700">
                          {stockAvail.toLocaleString()}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={line.qty}
                            onChange={(e) =>
                              handleLineChange(idx, 'qty', Number(e.target.value))
                            }
                            className={`w-full text-right font-mono font-black border rounded px-2 py-1 text-xs ${
                              isExceed
                                ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-400'
                                : 'border-slate-300 text-slate-900'
                            }`}
                          />
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-600">
                          {selItem?.stockUom || '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                          Rp {lineValuation.toLocaleString()}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={line.notes}
                            onChange={(e) =>
                              handleLineChange(idx, 'notes', e.target.value)
                            }
                            className="w-full border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
                            placeholder="Alasan / tujuan..."
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <td colSpan={3} className="py-2 px-3 text-right text-[11px] uppercase">
                      Total Kuantitas & Valuasi:
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-black text-blue-900 text-sm">
                      {totalTransferQty.toLocaleString()}
                    </td>
                    <td></td>
                    <td className="py-2 px-3 text-right font-mono font-black text-emerald-900 text-sm">
                      Rp {totalValuation.toLocaleString()}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Validation Alert */}
          {hasStockError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span className="font-semibold text-xs">{errorMessage}</span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Catatan Dokumen / Alasan Mutasi
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Tambahkan rujukan instruksi kerja, nomor SPK, atau memo internal..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={hasStockError}
              className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md transition flex items-center gap-2 ${
                hasStockError
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Posting & Terbitkan Surat Jalan Transfer (SJT)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
