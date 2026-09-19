// Production Module: TSG-Based Cigarette Manufacturing (Giling Meja, Afval Reclaim, Meja Packing & Cukai)
import React, { useState } from 'react';
import {
  Factory,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Layers,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { dbService } from '../services/mockDatabase';
import { WorkOrder } from '../types/erp';

export const ProductionModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'flow' | 'giling' | 'packing' | 'waste'>('giling');
  const [showNewGilingModal, setShowNewGilingModal] = useState(false);
  const [showCompleteGilingModal, setShowCompleteGilingModal] = useState(false);
  const [selectedGilingWo, setSelectedGilingWo] = useState<WorkOrder | null>(null);

  const [showNewPackingModal, setShowNewPackingModal] = useState(false);

  // Form states for New Giling WO
  const [plannedBatang, setPlannedBatang] = useState(100000);

  // Form states for Complete Giling WO
  const [actualGoodBatang, setActualGoodBatang] = useState(99850);
  const [rejectBatang, setRejectBatang] = useState(150);

  // Form states for New Packing WO
  const [packingProductId, setPackingProductId] = useState('item-fg-kng12');
  const [packingPacks, setPackingPacks] = useState(5000);
  const [selectedPcrId, setSelectedPcrId] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);
  const state = dbService.getState();

  const gilingOrders = state.workOrders.filter((w) => w.processStage === 'GILING');
  const packingOrders = state.workOrders.filter((w) => w.processStage === 'PACKING');

  const handleCreateGiling = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.createWorkOrderGiling(plannedBatang, 'RM-TSG-01');
    setShowNewGilingModal(false);
    setRefreshKey((k) => k + 1);
  };

  const handleCompleteGiling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGilingWo) return;
    try {
      dbService.completeWorkOrderGiling(selectedGilingWo.id, actualGoodBatang, rejectBatang);
      setShowCompleteGilingModal(false);
      setSelectedGilingWo(null);
      setRefreshKey((k) => k + 1);
      alert('WO Giling Selesai! Batangan masuk ke Gudang WIP, Reclaim TSG masuk ke WH-WASTE, dan Jurnal Akuntansi otomatis dibuat.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCompletePacking = (e: React.FormEvent) => {
    e.preventDefault();
    const pcrId = selectedPcrId || (state.pitaCukaiReceipts[0]?.id || '');
    if (!pcrId) {
      alert('Pita Cukai belum tersedia!');
      return;
    }

    try {
      dbService.completeWorkOrderPacking(packingProductId, packingPacks, pcrId);
      setShowNewPackingModal(false);
      setRefreshKey((k) => k + 1);
      alert('Produksi Packing & Pelekatan Pita Cukai Selesai! Finished Goods bertambah di WH-FG dan saldo Cukai terpotong.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Workflow Notice */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" /> ALUR PRODUKSI TSG KRETEK TANGAN
            </div>
            <h2 className="text-base font-black text-slate-900 mt-1">
              Manufaktur Rokok SKT dengan Tembakau Siap Giling (TSG Langsung dari Pembelian)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewGilingModal(true)}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Rilis WO Meja Giling
            </button>
            <button
              onClick={() => setShowNewPackingModal(true)}
              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Rilis WO Meja Packing & Cukai
            </button>
          </div>
        </div>

        {/* 3-Step Interactive Process Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900">1. Pengadaan TSG & Kemasan</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-200 text-amber-900">
                WH-MATERIAL
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Tembakau Siap Giling dibeli dalam kondisi siap olah (tanpa peram/blending pabrik). Diuji kadar air di timbangan gudang.
            </p>
            <div className="text-[10px] text-amber-800 font-medium">Input: TSG (Kg), Papir, Bungkus, Slop, Bal</div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-900">2. Meja Giling & Gunting</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-purple-200 text-purple-900">
                WH-WIP & WH-WASTE
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Pekerja borongan giling & gunting membentuk batangan rokok (1 gram TSG/batang). Batangan reject dikupas di meja QC dan tembakau direclaim.
            </p>
            <div className="text-[10px] text-purple-800 font-medium">Output: Batangan Rokok (WIP) + Reclaim TSG (Afval)</div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900">3. Meja Packing & Pelekatan Cukai</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-indigo-200 text-indigo-900">
                WH-FG (Produk Jadi)
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Batangan dimasukkan ke dalam bungkus etiket (12/16 batang) lalu wajib dilekatkan Pita Cukai resmi DJBC Republik Indonesia sebelum disegel OPP.
            </p>
            <div className="text-[10px] text-indigo-800 font-medium">Output: Rokok Jadi Berpita Cukai Siap Distribusi</div>
          </div>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold w-fit">
        <button
          onClick={() => setActiveSubTab('giling')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeSubTab === 'giling' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Meja Giling & Batangan ({gilingOrders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('packing')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeSubTab === 'packing' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Meja Packing & Pelekatan Cukai ({packingOrders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('waste')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeSubTab === 'waste' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Catatan Afval & Reclaim TSG ({state.wasteRecords.length})
        </button>
      </div>

      {/* SUBTAB 1: GILING WORK ORDERS */}
      {activeSubTab === 'giling' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">No. WO Giling</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Target Produk</th>
                <th className="py-2.5 px-3 text-right">Rencana (Batang)</th>
                <th className="py-2.5 px-3 text-right">Hasil Baik (WIP)</th>
                <th className="py-2.5 px-3 text-right">Reject Batang</th>
                <th className="py-2.5 px-3 text-right">Reclaim TSG (Kg)</th>
                <th className="py-2.5 px-3 text-right">Biaya Bahan Baku</th>
                <th className="py-2.5 px-3 text-right">Upah Borongan</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gilingOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{wo.woNumber}</td>
                  <td className="py-2.5 px-3 text-slate-600">{wo.startDate}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{wo.productName}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">
                    {wo.plannedQty.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                    {wo.actualOutputQty.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-600 font-medium">
                    {wo.rejectQty > 0 ? wo.rejectQty.toLocaleString() : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">
                    {wo.reclaimQty > 0 ? `${wo.reclaimQty} Kg` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    Rp {wo.allocatedMaterialCost.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-purple-700 font-medium">
                    Rp {wo.allocatedLaborCost.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        wo.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {wo.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {wo.status !== 'COMPLETED' && (
                      <button
                        onClick={() => {
                          setSelectedGilingWo(wo);
                          setActualGoodBatang(wo.plannedQty - 150);
                          setRejectBatang(150);
                          setShowCompleteGilingModal(true);
                        }}
                        className="px-2.5 py-1 rounded bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] transition"
                      >
                        Selesaikan WO
                      </button>
                    )}
                    {wo.status === 'COMPLETED' && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 2: PACKING WORK ORDERS */}
      {activeSubTab === 'packing' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">No. WO Packing</th>
                <th className="py-2.5 px-3">Tanggal Selesai</th>
                <th className="py-2.5 px-3">Merek / Varian</th>
                <th className="py-2.5 px-3 text-right">Output Jadi (Bungkus)</th>
                <th className="py-2.5 px-3 text-right">Batangan Dikonsumsi</th>
                <th className="py-2.5 px-3 text-right">Pita Cukai Dilekatkan</th>
                <th className="py-2.5 px-3 text-right">Upah Borongan Packing</th>
                <th className="py-2.5 px-3 text-right">HPP Satuan</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packingOrders.map((wo) => {
                const sticks = wo.actualOutputQty * (wo.productName.includes('16') ? 16 : 12);
                return (
                  <tr key={wo.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{wo.woNumber}</td>
                    <td className="py-2.5 px-3 text-slate-600">{wo.startDate}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{wo.productName}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      {wo.actualOutputQty.toLocaleString()} Bungkus
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-purple-700">
                      {sticks.toLocaleString()} Batang
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                      {wo.actualOutputQty.toLocaleString()} Keping
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      Rp {wo.allocatedLaborCost.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      Rp {wo.unitHpp.toLocaleString()} / Bungkus
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        COMPLETED
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 3: WASTE & RECLAIM */}
      {activeSubTab === 'waste' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Manajemen Afval & Tembakau Reclaim (Gudang WH-WASTE):</div>
              <p className="text-slate-500 mt-0.5">
                Batangan cacat/reject dikupas bersih di meja QC. Tembakau yang lolos sortasi direclaim dan ditimbang ulang
                untuk dapat dimanfaatkan kembali secara sah dan tercatat di dokumen LACK-11 & CSCK-1.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500">Total Stok Reclaim di WH-WASTE</div>
              <div className="text-lg font-black text-amber-700">
                {state.stockInventory
                  .filter((s) => s.warehouseCode === 'WH-WASTE' && s.itemCode.includes('TSG'))
                  .reduce((sum, s) => sum + s.qty, 0)}{' '}
                Kg TSG
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Ref. No. WO</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Nama Material</th>
                  <th className="py-2.5 px-3 text-right">Kuantitas</th>
                  <th className="py-2.5 px-3">Gudang Asal → Tujuan</th>
                  <th className="py-2.5 px-3">Status Reclaim</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.wasteRecords.map((wr) => (
                  <tr key={wr.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-600">{wr.date}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{wr.woNumber}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          wr.category === 'RECLAIM' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {wr.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{wr.itemName}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {wr.quantity} {wr.uom}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                      {wr.sourceWarehouse} → {wr.destinationWarehouse}
                    </td>
                    <td className="py-2.5 px-3">
                      {wr.isReclaimed ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Reclaimed ke TSG
                        </span>
                      ) : (
                        <span className="text-slate-400">Scrap Pemusnahan</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{wr.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: NEW GILING WO */}
      {showNewGilingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Rilis Perintah Kerja Meja Giling</h3>
            <p className="text-xs text-slate-500 mb-4">
              Bahan baku TSG (Tembakau Siap Giling) dan Papir akan dialokasikan ke meja-meja giling.
            </p>

            <form onSubmit={handleCreateGiling} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rencana Jumlah Output (Batang)</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={plannedBatang}
                  onChange={(e) => setPlannedBatang(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-base focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 space-y-1.5">
                <div className="font-bold text-purple-900">Perhitungan Kebutuhan Bahan (BOM Giling):</div>
                <div className="flex justify-between text-slate-700">
                  <span>Kebutuhan TSG (1 gram/batang):</span>
                  <span className="font-mono font-bold">{(plannedBatang * 0.001).toLocaleString()} Kg</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Kebutuhan Papir Cetak Manis (+0.5% scrap):</span>
                  <span className="font-mono font-bold">{Math.round((plannedBatang * 1.005)).toLocaleString()} Lembar</span>
                </div>
                <div className="flex justify-between text-purple-900 font-bold border-t border-purple-200 pt-1">
                  <span>Estimasi Biaya Bahan Baku:</span>
                  <span className="font-mono">
                    Rp {(plannedBatang * 0.001 * 95000 + Math.round((plannedBatang * 1.005)) * 20).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewGilingModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-sm"
                >
                  Rilis WO Giling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPLETE GILING WO */}
      {showCompleteGilingModal && selectedGilingWo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Penyelesaian WO Meja Giling</h3>
            <p className="text-xs text-slate-500 mb-4">
              Konfirmasi hasil pemeriksaan meja mandor dan QC untuk <span className="font-bold">{selectedGilingWo.woNumber}</span>.
            </p>

            <form onSubmit={handleCompleteGiling} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hasil Batangan Rokok Lolos Uji (Good Output)</label>
                <input
                  type="number"
                  min="0"
                  value={actualGoodBatang}
                  onChange={(e) => setActualGoodBatang(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  required
                />
                <div className="text-[11px] text-slate-400 mt-0.5">Akan ditransfer ke Gudang WIP (WH-WIP)</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Batangan Reject / Cacat Meja</label>
                <input
                  type="number"
                  min="0"
                  value={rejectBatang}
                  onChange={(e) => setRejectBatang(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  required
                />
                <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
                  Estimasi Reclaim TSG Otomatis: {Number(((rejectBatang * 0.0009)).toFixed(2))} Kg TSG ke WH-WASTE
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">Alokasi Beban Borongan (Tarif Resmi):</div>
                <div className="flex justify-between text-slate-600">
                  <span>Upah Borongan Giling (Rp 26.000 / 1.000 btg):</span>
                  <span className="font-mono">Rp {Math.round((actualGoodBatang * 0.026 * 1000)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Upah Borongan Gunting (Rp 8.000 / 1.000 btg):</span>
                  <span className="font-mono">Rp {Math.round((actualGoodBatang * 0.008 * 1000)).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCompleteGilingModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                >
                  Posting Selesai & Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW PACKING & CUKAI WO */}
      {showNewPackingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Packing & Pelekatan Pita Cukai</h3>
            <p className="text-xs text-slate-500 mb-4">
              Pengemasan batangan rokok WIP ke bungkus etiket dan pelekatan Pita Cukai resmi Republik Indonesia.
            </p>

            <form onSubmit={handleCompletePacking} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Merek Rokok Jadi (FG)</label>
                <select
                  value={packingProductId}
                  onChange={(e) => setPackingProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  required
                >
                  {state.items
                    .filter((i) => i.itemType === 'FINISHED_GOODS')
                    .map((fg) => (
                      <option key={fg.id} value={fg.id}>
                        {fg.itemName} ({fg.itemCode})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Batch Pita Cukai (CK-1)</label>
                <select
                  value={selectedPcrId}
                  onChange={(e) => setSelectedPcrId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                  required
                >
                  {state.pitaCukaiReceipts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.docNumber} — {p.brand} (Sisa: {p.piecesAvailable.toLocaleString()} Keping)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jumlah Bungkus yang Diproduksi</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={packingPacks}
                  onChange={(e) => setPackingPacks(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 space-y-1">
                <div className="font-bold text-indigo-900">Konsumsi Sediaan:</div>
                <div className="flex justify-between text-slate-700">
                  <span>Batangan Dikonsumsi:</span>
                  <span className="font-mono font-bold">
                    {(packingPacks * (packingProductId.includes('16') ? 16 : 12)).toLocaleString()} Batang
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Pita Cukai Dilekatkan:</span>
                  <span className="font-mono font-bold">{packingPacks.toLocaleString()} Keping</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Kemasan (Bungkus/Slop/Bal):</span>
                  <span className="font-mono font-bold">{packingPacks.toLocaleString()} Bungkus</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPackingModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold transition shadow-sm"
                >
                  Simpan & Lekatkan Cukai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
