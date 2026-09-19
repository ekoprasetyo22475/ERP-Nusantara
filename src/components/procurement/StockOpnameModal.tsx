import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ClipboardCheck,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Item, Warehouse, StockInventory, StockOpname } from '../../types/erp';

interface StockOpnameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (data: {
    warehouseId: string;
    opnameDate: string;
    auditorName: string;
    witnessName?: string;
    items: {
      itemId: string;
      physicalQty: number;
      systemQty: number;
      reason: string;
      notes?: string;
    }[];
    notes?: string;
  }) => StockOpname | void;
  items: Item[];
  warehouses: Warehouse[];
  stockInventory: StockInventory[];
  currentUserName: string;
}

export const StockOpnameModal: React.FC<StockOpnameModalProps> = ({
  isOpen,
  onClose,
  onPost,
  items,
  warehouses,
  stockInventory,
  currentUserName,
}) => {
  if (!isOpen) return null;

  const [warehouseId, setWarehouseId] = useState<string>(
    warehouses[0]?.id || 'wh-1',
  );
  const [opnameDate, setOpnameDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [auditorName, setAuditorName] = useState<string>(
    `Tim Audit Internal (${currentUserName})`,
  );
  const [witnessName, setWitnessName] = useState<string>(
    'Agus Subagyo (Kepala Gudang)',
  );
  const [notes, setNotes] = useState<string>(
    'Pelaksanaan Stock Opname berkala rekonsiliasi fisik persediaan pabrik tembakau dan kemasan.',
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterVarianceOnly, setFilterVarianceOnly] = useState<boolean>(false);

  // Table state: map of itemId -> { physicalQty, reason, notes }
  const [counts, setCounts] = useState<
    Record<
      string,
      {
        physicalQty: number;
        reason: string;
        notes: string;
      }
    >
  >({});

  // Reset or initialize counts when warehouseId changes
  useEffect(() => {
    const init: Record<
      string,
      { physicalQty: number; reason: string; notes: string }
    > = {};
    items.forEach((it) => {
      const inv = stockInventory.find(
        (si) => si.itemId === it.id && si.warehouseId === warehouseId,
      );
      const curSys = inv ? inv.qty : 0;
      init[it.id] = {
        physicalQty: curSys, // default matches system
        reason: 'COCOK',
        notes: '',
      };
    });
    setCounts(init);
  }, [warehouseId, items, stockInventory]);

  // Compute table rows
  const tableData = useMemo(() => {
    return items.map((it) => {
      const inv = stockInventory.find(
        (si) => si.itemId === it.id && si.warehouseId === warehouseId,
      );
      const systemQty = inv ? inv.qty : 0;
      const countData = counts[it.id] || {
        physicalQty: systemQty,
        reason: 'COCOK',
        notes: '',
      };
      const physicalQty = Number(countData.physicalQty) || 0;
      const varianceQty = physicalQty - systemQty;
      const unitCost = inv && inv.averageCost > 0 ? inv.averageCost : it.standardCost || 0;
      const varianceCost = varianceQty * unitCost;

      return {
        item: it,
        systemQty,
        physicalQty,
        varianceQty,
        unitCost,
        varianceCost,
        reason: countData.reason,
        notes: countData.notes,
      };
    });
  }, [items, stockInventory, warehouseId, counts]);

  // Filtered rows for viewing
  const filteredRows = useMemo(() => {
    return tableData.filter((row) => {
      const matchSearch =
        row.item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (filterVarianceOnly && row.varianceQty === 0) return false;
      return true;
    });
  }, [tableData, searchQuery, filterVarianceOnly]);

  // Totals
  const totalCounted = tableData.length;
  const itemsWithVariance = tableData.filter((r) => r.varianceQty !== 0);
  const totalVarianceCost = tableData.reduce((acc, r) => acc + r.varianceCost, 0);

  const handlePhysicalChange = (itemId: string, val: number) => {
    setCounts((prev) => {
      const existing = prev[itemId] || {
        physicalQty: 0,
        reason: 'COCOK',
        notes: '',
      };
      const inv = stockInventory.find(
        (si) => si.itemId === itemId && si.warehouseId === warehouseId,
      );
      const sysQty = inv ? inv.qty : 0;
      const diff = val - sysQty;
      let newReason = existing.reason;
      if (diff === 0) {
        newReason = 'COCOK';
      } else if (existing.reason === 'COCOK') {
        newReason = diff < 0 ? 'SUSUT_ALAMI_KADAR_AIR' : 'SELISIH_ADMINISTRASI';
      }

      return {
        ...prev,
        [itemId]: {
          ...existing,
          physicalQty: val,
          reason: newReason,
        },
      };
    });
  };

  const handleReasonChange = (itemId: string, val: string) => {
    setCounts((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { physicalQty: 0, notes: '', reason: 'COCOK' }),
        reason: val,
      },
    }));
  };

  const handleNotesChange = (itemId: string, val: string) => {
    setCounts((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { physicalQty: 0, reason: 'COCOK', notes: '' }),
        notes: val,
      },
    }));
  };

  const handleApplyQuickZeroDifference = () => {
    // sets all items to match system stock
    const resetObj: Record<
      string,
      { physicalQty: number; reason: string; notes: string }
    > = {};
    items.forEach((it) => {
      const inv = stockInventory.find(
        (si) => si.itemId === it.id && si.warehouseId === warehouseId,
      );
      resetObj[it.id] = {
        physicalQty: inv ? inv.qty : 0,
        reason: 'COCOK',
        notes: '',
      };
    });
    setCounts(resetObj);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      onPost({
        warehouseId,
        opnameDate,
        auditorName,
        witnessName,
        items: tableData.map((row) => ({
          itemId: row.item.id,
          physicalQty: row.physicalQty,
          systemQty: row.systemQty,
          reason: row.reason,
          notes: row.notes,
        })),
        notes,
      });
      onClose();
    } catch (err: any) {
      alert(`Gagal menyimpan Berita Acara Stock Opname: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/30 rounded-xl border border-emerald-400/30 text-emerald-300">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Berita Acara Stock Opname (BASO)
              </h3>
              <p className="text-xs text-emerald-200">
                Pemeriksaan fisik persediaan gudang, penyesuaian selisih ke buku besar & jurnal otomatis
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
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Lokasi Gudang yang Dihitung
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 text-xs"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    [{w.code}] {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Tanggal Pelaksanaan Opname
              </label>
              <input
                type="date"
                value={opnameDate}
                onChange={(e) => setOpnameDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Ketua Tim Auditor / Pemeriksa
              </label>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                placeholder="Nama auditor internal"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Saksi / Penanggung Jawab Gudang
              </label>
              <input
                type="text"
                value={witnessName}
                onChange={(e) => setWitnessName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                placeholder="Nama kepala gudang"
              />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Total Item Terdaftar</span>
                <p className="text-base font-black text-slate-900 font-mono mt-0.5">{totalCounted} Jenis Barang</p>
              </div>
              <FileSpreadsheet className="w-6 h-6 text-slate-400" />
            </div>

            <div className={`border rounded-xl p-3 flex items-center justify-between ${itemsWithVariance.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Item Mengalami Selisih</span>
                <p className={`text-base font-black font-mono mt-0.5 ${itemsWithVariance.length > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                  {itemsWithVariance.length} Barang
                </p>
              </div>
              {itemsWithVariance.length > 0 ? (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-700">Net Valuasi Selisih (Penyesuaian)</span>
                <p className={`text-base font-black font-mono mt-0.5 ${totalVarianceCost < 0 ? 'text-rose-700' : totalVarianceCost > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {totalVarianceCost > 0 ? '+' : ''}Rp {totalVarianceCost.toLocaleString()}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-blue-300 rounded text-blue-800">
                {totalVarianceCost < 0 ? 'Beban Susut' : totalVarianceCost > 0 ? 'Surplus' : 'Seimbang'}
              </span>
            </div>
          </div>

          {/* Filtering & Table Toolbars */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kode atau nama barang..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={filterVarianceOnly}
                  onChange={(e) => setFilterVarianceOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Hanya Tampilkan yang Selisih ({itemsWithVariance.length})</span>
              </label>

              <button
                type="button"
                onClick={handleApplyQuickZeroDifference}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs transition"
              >
                Cocokkan Semua dg Sistem
              </button>
            </div>
          </div>

          {/* Inventory Count Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs max-h-[360px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10">
                <tr className="text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3 w-28">Kode Barang</th>
                  <th className="py-2.5 px-3">Nama Barang</th>
                  <th className="py-2.5 px-3 text-right w-24">Stok Sistem</th>
                  <th className="py-2.5 px-3 text-right w-28">Hitung Fisik</th>
                  <th className="py-2.5 px-3 text-center w-16">Satuan</th>
                  <th className="py-2.5 px-3 text-right w-24">Selisih Qty</th>
                  <th className="py-2.5 px-3 text-right w-28">Valuasi Selisih</th>
                  <th className="py-2.5 px-3 w-40">Alasan Selisih</th>
                  <th className="py-2.5 px-3 w-36">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRows.map((row, idx) => {
                  const isDiff = row.varianceQty !== 0;
                  const isLoss = row.varianceQty < 0;

                  return (
                    <tr
                      key={row.item.id}
                      className={
                        isDiff
                          ? isLoss
                            ? 'bg-rose-50/40 hover:bg-rose-50/70'
                            : 'bg-emerald-50/40 hover:bg-emerald-50/70'
                          : 'hover:bg-slate-50'
                      }
                    >
                      <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">
                        {row.item.itemCode}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {row.item.itemName}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-600">
                        {row.systemQty.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          step="any"
                          value={row.physicalQty}
                          onChange={(e) =>
                            handlePhysicalChange(row.item.id, Number(e.target.value))
                          }
                          className="w-full text-right font-mono font-black border border-slate-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-600">
                        {row.item.stockUom}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-mono font-black ${
                          row.varianceQty === 0
                            ? 'text-slate-400'
                            : row.varianceQty < 0
                            ? 'text-rose-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {row.varianceQty > 0 ? `+${row.varianceQty}` : row.varianceQty}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-mono font-bold text-[11px] ${
                          row.varianceCost === 0
                            ? 'text-slate-400'
                            : row.varianceCost < 0
                            ? 'text-rose-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {row.varianceCost === 0
                          ? 'Rp 0'
                          : `Rp ${row.varianceCost.toLocaleString()}`}
                      </td>
                      <td className="py-1.5 px-2">
                        <select
                          disabled={row.varianceQty === 0}
                          value={row.reason}
                          onChange={(e) =>
                            handleReasonChange(row.item.id, e.target.value)
                          }
                          className={`w-full text-xs font-semibold rounded border px-1.5 py-1 ${
                            row.varianceQty === 0
                              ? 'bg-slate-100 text-slate-400 border-slate-200'
                              : 'bg-white text-slate-800 border-slate-300'
                          }`}
                        >
                          <option value="COCOK">Cocok (Sesuai)</option>
                          <option value="SUSUT_ALAMI_KADAR_AIR">Susut Kadar Air / Cuaca</option>
                          <option value="RUSAK_AFKIR">Rusak / Sobek / Afkir</option>
                          <option value="SELISIH_ADMINISTRASI">Selisih Administrasi / Catat</option>
                          <option value="SAMPLE_LAB_QC">Pemakaian Sampel Lab QC</option>
                          <option value="HILANG">Kehilangan Fisik</option>
                        </select>
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={row.notes}
                          onChange={(e) =>
                            handleNotesChange(row.item.id, e.target.value)
                          }
                          placeholder="Penjelasan..."
                          className="w-full border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Catatan Berita Acara & Kesimpulan Audit Fisik
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Contoh: Stok opname dilakukan bersama oleh tim internal audit dan disaksikan kepala gudang..."
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
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-98 rounded-xl font-bold text-white shadow-md transition flex items-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Posting BASO & Sesuaikan Saldo Stok Otomatis</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
