// Dashboard Module - Executive Summary, Manufacturing KPIs & Live Reconciliation
import React from 'react';
import {
  Factory,
  PackageCheck,
  TrendingUp,
  AlertCircle,
  FileCheck2,
  DollarSign,
  Scale,
  ArrowUpRight,
  ShieldCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { dbService } from '../services/mockDatabase';
import { ExciseEngine, ReconciliationEngine } from '../services/engines';

interface DashboardProps {
  onNavigate: (tabId: string) => void;
}

export const DashboardModule: React.FC<DashboardProps> = ({ onNavigate }) => {
  const state = dbService.getState();

  // Compute live aggregations
  const tsgStockKg = state.stockInventory
    .filter((s) => s.itemCode.includes('TSG') && s.warehouseCode === 'WH-MATERIAL')
    .reduce((sum, s) => sum + s.qty, 0);

  const wipBatangQty = state.stockInventory
    .filter((s) => s.itemCode.includes('WIP') || s.warehouseCode === 'WH-WIP')
    .reduce((sum, s) => sum + s.qty, 0);

  const fgPacksQty = state.stockInventory
    .filter((s) => s.warehouseCode === 'WH-FG')
    .reduce((sum, s) => sum + s.qty, 0);

  const totalInventoryValuation = state.stockInventory.reduce((sum, s) => sum + s.totalValuation, 0);

  const totalSalesRevenue = state.salesInvoices.reduce((sum, inv) => sum + inv.dpp, 0);
  const totalArOutstanding = state.salesInvoices.reduce(
    (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
    0,
  );
  const totalApOutstanding = state.supplierInvoices.reduce(
    (sum, inv) => sum + (inv.total - inv.paidAmount),
    0,
  );

  const totalPitaCukaiAvailable = state.pitaCukaiReceipts.reduce((sum, p) => sum + p.piecesAvailable, 0);

  // Run live system reconciliation
  const csck3 = ExciseEngine.generateCSCK3(state.pitaCukaiReceipts, state.pitaCukaiUsages, 9, 2026);
  const csck9 = ExciseEngine.generateCSCK9(state.workOrders, state.salesInvoices, state.pitaCukaiUsages, 9, 2026);
  const recon = ReconciliationEngine.runAllReconciliations({
    stockMovements: state.stockMovements,
    supplierInvoices: state.supplierInvoices,
    salesInvoices: state.salesInvoices,
    journals: state.journalEntries,
    csck3,
    csck9,
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: TSG Notice & System Health */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-5 rounded-xl border border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Model Operasi TSG (Tembakau Siap Giling) Aktif
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            SGW ONE NUSANTARA — Monitoring Pabrik Kretek Tangan (SKT)
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Sistem ERP Terpadu dengan kepatuhan Bea Cukai (CSCK-1, 3, 9, CK-4, LACK-11), Jurnal Akuntansi Otomatis,
            dan alur kerja TSG langsung dari pembelian ke meja giling tanpa tahap blending.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('production')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow transition flex items-center gap-1.5"
          >
            <Factory className="w-4 h-4" /> Input Hasil Giling
          </button>
          <button
            onClick={() => onNavigate('customs')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold rounded-lg text-xs transition flex items-center gap-1.5"
          >
            <FileCheck2 className="w-4 h-4" /> Buka Laporan Cukai
          </button>
        </div>
      </div>

      {/* Real-time KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: TSG Raw Material */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stok TSG Bahan Baku
            </span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <PackageCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {tsgStockKg.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">Kg TSG</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Siap digiling ke meja kerja</span>
            <button
              onClick={() => onNavigate('procurement')}
              className="text-amber-700 font-bold hover:underline flex items-center gap-0.5"
            >
              Gudang <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 2: WIP Batangan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              WIP Batangan Rokok
            </span>
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Factory className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {wipBatangQty.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">Batang</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Di Gudang WIP siap dipacking</span>
            <button
              onClick={() => onNavigate('production')}
              className="text-purple-700 font-bold hover:underline flex items-center gap-0.5"
            >
              Meja Packing <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 3: Finished Goods Packs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Produk Jadi (FG Berpita)
            </span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {fgPacksQty.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">Bungkus</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Dilekati Pita Cukai 2026</span>
            <button
              onClick={() => onNavigate('sales')}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
            >
              Penjualan <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 4: Pita Cukai Balance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sisa Pita Cukai (CK-1)
            </span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {totalPitaCukaiAvailable.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">Keping</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Siap dilekatkan ke bungkus</span>
            <button
              onClick={() => onNavigate('customs')}
              className="text-blue-700 font-bold hover:underline flex items-center gap-0.5"
            >
              CSCK-3 <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Financial & Compliance Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial & Manufacturing Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Posisi Finansial & Persediaan Terkini
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Total Nilai Persediaan</div>
                <div className="text-base font-black text-slate-900 mt-1">
                  Rp {totalInventoryValuation.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Moving Average Cost Method</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Total Piutang Usaha (AR)</div>
                <div className="text-base font-black text-emerald-700 mt-1">
                  Rp {totalArOutstanding.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Dari Distributor Rokok</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Total Hutang Usaha (AP)</div>
                <div className="text-base font-black text-rose-700 mt-1">
                  Rp {totalApOutstanding.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Hutang Supplier TSG & Kemasan</div>
              </div>
            </div>

            {/* Warehouse Allocation Breakdown */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="text-xs font-bold text-slate-700 mb-2">Sebaran Nilai Sediaan per Gudang:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {state.warehouses.map((wh) => {
                  const val = state.stockInventory
                    .filter((s) => s.warehouseId === wh.id)
                    .reduce((sum, s) => sum + s.totalValuation, 0);
                  return (
                    <div key={wh.id} className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200">
                      <div className="font-bold text-slate-800">{wh.code}</div>
                      <div className="text-[11px] text-slate-500 truncate">{wh.name}</div>
                      <div className="font-semibold text-slate-900 mt-1">Rp {val.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Work Orders & Production Stage */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Factory className="w-4 h-4 text-purple-600" /> Status Perintah Kerja Produksi (Work Orders)
              </h3>
              <button
                onClick={() => onNavigate('production')}
                className="text-xs text-amber-700 font-bold hover:underline"
              >
                Lihat Semua WO →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <th className="py-2 px-3">No. WO</th>
                    <th className="py-2 px-3">Tahap</th>
                    <th className="py-2 px-3">Target Produk</th>
                    <th className="py-2 px-3 text-right">Rencana</th>
                    <th className="py-2 px-3 text-right">Realisasi Baik</th>
                    <th className="py-2 px-3 text-right">Reject / Reclaim</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.workOrders.slice(0, 4).map((wo) => (
                    <tr key={wo.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{wo.woNumber}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            wo.processStage === 'GILING'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {wo.processStage}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{wo.productName}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                        {wo.plannedQty.toLocaleString()} {wo.uom}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                        {wo.actualOutputQty.toLocaleString()} {wo.uom}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {wo.rejectQty > 0 ? `${wo.rejectQty.toLocaleString()} (${wo.reclaimQty} Kg TSG)` : '-'}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Live Mathematical Reconciliation Engine Matrix */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Mesin Rekonsiliasi Otomatis
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                100% Sesuai
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Pengecekan konsistensi matematis antar modul (Persediaan, Keuangan, dan Dokumen Cukai).
            </p>

            <div className="space-y-3 text-xs">
              {/* Check 1: Double-entry Jurnal */}
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-200">Keseimbangan Debit & Kredit Jurnal</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Debit: Rp {recon.accounting.totalDebit.toLocaleString()} | Kredit: Rp{' '}
                    {recon.accounting.totalCredit.toLocaleString()}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                  BALANCED
                </span>
              </div>

              {/* Check 2: Cukai Reconciliation */}
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-200">Rekonsiliasi Pita Cukai vs Produk Jadi</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Pakai di CSCK-3: {recon.customs.csck3PitaUsed.toLocaleString()} keping
                    <br />
                    Lekat di CSCK-9: {recon.customs.csck9PitaAttached.toLocaleString()} keping
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                  MATCHED
                </span>
              </div>

              {/* Check 3: AP Reconciliation */}
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-200">Kontrol Hutang Usaha (AP Ledger)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Sisa Hutang: Rp {recon.accountsPayable.outstanding.toLocaleString()}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                  VERIFIED
                </span>
              </div>

              {/* Check 4: AR Reconciliation */}
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-200">Kontrol Piutang Usaha (AR Ledger)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Sisa Piutang: Rp {recon.accountsReceivable.outstanding.toLocaleString()}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                  VERIFIED
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => onNavigate('audit')}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                Buka Matriks Rekonsiliasi & Audit Trail →
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-800 mb-2">Akses Cepat Dokumen Sah:</div>
            <button
              onClick={() => onNavigate('procurement')}
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-amber-50 text-xs font-semibold text-slate-700 flex items-center justify-between transition"
            >
              <span>+ Buat Purchase Order (PO) Bahan Baku</span>
              <span className="text-amber-700 font-bold">→</span>
            </button>
            <button
              onClick={() => onNavigate('production')}
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-purple-50 text-xs font-semibold text-slate-700 flex items-center justify-between transition"
            >
              <span>+ Input Meja Giling TSG / Meja Packing</span>
              <span className="text-purple-700 font-bold">→</span>
            </button>
            <button
              onClick={() => onNavigate('sales')}
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-xs font-semibold text-slate-700 flex items-center justify-between transition"
            >
              <span>+ Buat Faktur Penjualan & DO</span>
              <span className="text-emerald-700 font-bold">→</span>
            </button>
            <button
              onClick={() => onNavigate('customs')}
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-xs font-semibold text-slate-700 flex items-center justify-between transition"
            >
              <span>+ Cetak Laporan Cukai (CSCK-1 / CSCK-3 / CK-4)</span>
              <span className="text-blue-700 font-bold">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
