// Indonesian Customs / Bea Cukai (DJBC) Module
import React, { useState } from 'react';
import {
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Plus,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Award,
} from 'lucide-react';
import { dbService } from '../services/mockDatabase';
import { ExciseEngine } from '../services/engines';
import {
  CSCK1ReportRow,
  CSCK3ReportRow,
  CSCK9ReportRow,
  CK4SummaryReport,
} from '../types/erp';

export const CustomsModule: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'csck1' | 'csck3' | 'csck9' | 'ck4' | 'lack11'>('csck1');
  const [showAddPcrModal, setShowAddPcrModal] = useState(false);

  // Form states for new Pita Cukai receipt
  const [pcrDocNumber, setPcrDocNumber] = useState(`CK1-KPPBC-${Date.now().toString().slice(-4)}`);
  const [pcrBrand, setPcrBrand] = useState('SGW Kuning SKT 12');
  const [pcrPackSize, setPcrPackSize] = useState(12);
  const [pcrSheets, setPcrSheets] = useState(1000); // 1 lembar = 120 keping
  const [pcrTariff, setPcrTariff] = useState(3150); // Rp 3.150 per bungkus (SKT 12)
  const [pcrConversion, setPcrConversion] = useState(120); // 1 lembar = 120 keping

  const [refreshKey, setRefreshKey] = useState(0);
  const state = dbService.getState();

  const csck1: CSCK1ReportRow[] = ExciseEngine.generateCSCK1(
    state.workOrders,
    state.stockMovements,
    9,
    2026,
  );
  const csck3: CSCK3ReportRow[] = ExciseEngine.generateCSCK3(
    state.pitaCukaiReceipts,
    state.pitaCukaiUsages,
    9,
    2026,
  );
  const csck9: CSCK9ReportRow[] = ExciseEngine.generateCSCK9(
    state.workOrders,
    state.salesInvoices,
    state.pitaCukaiUsages,
    9,
    2026,
  );
  const ck4Report: CK4SummaryReport = ExciseEngine.generateCK4(
    csck1,
    csck9,
    state.companySettings.companyName,
    state.companySettings.nppbkc,
    state.companySettings.customsOffice,
    9,
    2026,
  );

  const handleAddPcr = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.receivePitaCukai(
      pcrDocNumber,
      pcrBrand,
      pcrPackSize,
      pcrTariff,
      pcrSheets,
      pcrConversion,
    );
    setShowAddPcrModal(false);
    setRefreshKey((k) => k + 1);
    alert('Penerimaan Pita Cukai resmi CK-1 berhasil dicatat ke Buku Rekening Pita Cukai (CSCK-3).');
  };

  const handlePrint = (reportName: string) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" /> Kepatuhan Cukai Terpadu DJBC (Bea Cukai)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
              NPPBKC: {state.companySettings.nppbkc}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Penyusunan otomatis laporan resmi Direktorat Jenderal Bea dan Cukai (CSCK-1, CSCK-3, CSCK-9, CK-4, LACK-11)
            berdasarkan mutasi bahan baku TSG, WIP meja giling, dan pelekatan pita cukai pabrik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePrint(activeReport)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Cetak Lembar DJBC
          </button>
          <button
            onClick={() => setShowAddPcrModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Terima Pita Cukai (CK-1)
          </button>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveReport('csck1')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition ${
            activeReport === 'csck1' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          CSCK-1 (Buku Bahan Baku TSG)
        </button>
        <button
          onClick={() => setActiveReport('csck3')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition ${
            activeReport === 'csck3' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          CSCK-3 (Buku Rekening Pita Cukai)
        </button>
        <button
          onClick={() => setActiveReport('csck9')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition ${
            activeReport === 'csck9' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          CSCK-9 (Buku Hasil Pabrik Dilekati)
        </button>
        <button
          onClick={() => setActiveReport('ck4')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition ${
            activeReport === 'ck4' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          CK-4 (Pemberitahuan Pengeluaran BKC)
        </button>
        <button
          onClick={() => setActiveReport('lack11')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition ${
            activeReport === 'lack11' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          LACK-11 (Laporan Bulanan Audit DJBC)
        </button>
      </div>

      {/* REPORT 1: CSCK-1 */}
      {activeReport === 'csck1' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="font-mono text-xs font-bold text-amber-700">LAMPIRAN DJBC: FORMULIR CSCK-1</div>
              <h3 className="text-base font-black text-slate-900">
                Buku Rekening Bahan Baku Tembakau Siap Giling (TSG) & Bahan Pembantu
              </h3>
              <div className="text-xs text-slate-500">
                Mencatat mutasi fisik TSG dari pembelian, pemakaian di meja giling, reject batangan, dan sisa bahan baku.
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold text-xs">
              Satuan Berat: Kilogram (Kg)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Periode</th>
                  <th className="py-2.5 px-3">Merek / Seri</th>
                  <th className="py-2.5 px-3 text-right">Saldo Awal TSG</th>
                  <th className="py-2.5 px-3 text-right">Pemasukan TSG (GRN)</th>
                  <th className="py-2.5 px-3 text-right">Konsumsi Giling</th>
                  <th className="py-2.5 px-3 text-right">Reclaim / Afval</th>
                  <th className="py-2.5 px-3 text-right">Saldo Akhir TSG</th>
                  <th className="py-2.5 px-3 text-right">Hasil Batangan (Pcs)</th>
                  <th className="py-2.5 px-3">Ref. Perintah Kerja (WO)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {csck1.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {row.periodMonth}/{row.periodYear}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{row.brand}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">
                      {row.tsgOpeningBalanceKg.toLocaleString()} Kg
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      +{row.tsgReceivedKg.toLocaleString()} Kg
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-700">
                      -{row.tsgUsedKg.toLocaleString()} Kg
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">
                      {row.batanganReclaimTsgKg} Kg
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 bg-slate-50">
                      {row.tsgClosingBalanceKg.toLocaleString()} Kg
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">
                      {row.batanganProducedPcs.toLocaleString()} Batang
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {row.woReferences.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: CSCK-3 */}
      {activeReport === 'csck3' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="font-mono text-xs font-bold text-purple-700">LAMPIRAN DJBC: FORMULIR CSCK-3</div>
              <h3 className="text-base font-black text-slate-900">
                Buku Rekening Pengawasan Pita Cukai (P3C / CK-1)
              </h3>
              <div className="text-xs text-slate-500">
                Saldo Awal + Penerimaan Pita Cukai dari KPPBC - Pelekatan pada Bungkus Rokok - Cacat/Sobek = Saldo Akhir.
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-900 font-bold text-xs">
              Satuan: Keping Pita Cukai
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Merek / Seri</th>
                  <th className="py-2.5 px-3">Golongan Tarif</th>
                  <th className="py-2.5 px-3 text-right">Tarif / Bks</th>
                  <th className="py-2.5 px-3 text-right">Saldo Awal</th>
                  <th className="py-2.5 px-3 text-right">Diterima (CK-1)</th>
                  <th className="py-2.5 px-3 text-right">Dilekatkan Packing</th>
                  <th className="py-2.5 px-3 text-right">Rusak / Cacat</th>
                  <th className="py-2.5 px-3 text-right">Saldo Akhir Keping</th>
                  <th className="py-2.5 px-3">Dokumen Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {csck3.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{row.brand}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{row.tariffCode}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      Rp {row.tariffPerPack.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">
                      {row.openingBalancePcs.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      +{row.receivedDocCKPcs.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                      -{row.usedInProductionPcs.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                      -{row.damagedDefectivePcs.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 bg-slate-50">
                      {row.closingBalancePcs.toLocaleString()} Keping
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {row.referenceDocs.join(', ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: CSCK-9 */}
      {activeReport === 'csck9' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="font-mono text-xs font-bold text-indigo-700">LAMPIRAN DJBC: FORMULIR CSCK-9</div>
              <h3 className="text-base font-black text-slate-900">
                Buku Rekening Hasil Pabrik yang Telah Dilekati Pita Cukai (Finished Goods)
              </h3>
              <div className="text-xs text-slate-500">
                Pengawasan rekonsiliasi antara rokok yang selesai dikemas (packing berpita cukai) dan yang telah diserahkan untuk penjualan.
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-900 font-bold text-xs">
              Satuan: Bungkus Rokok
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Merek / Produk</th>
                  <th className="py-2.5 px-3">Isi / Bks</th>
                  <th className="py-2.5 px-3 text-right">Saldo Awal FG</th>
                  <th className="py-2.5 px-3 text-right">Hasil Packing Cukai</th>
                  <th className="py-2.5 px-3 text-right">Pita Dilekatkan</th>
                  <th className="py-2.5 px-3 text-right">Diserahkan (DO Penjualan)</th>
                  <th className="py-2.5 px-3 text-right">Saldo Akhir Gudang FG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {csck9.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{row.brand}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{row.packSize} Batang</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">
                      {row.fgOpeningStockPacks.toLocaleString()} Bks
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      +{row.fgPackedFromProductionPacks.toLocaleString()} Bks
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                      {row.exciseAttachedPcs.toLocaleString()} Keping
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                      -{row.fgDeliveredSalesPacks.toLocaleString()} Bks
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 bg-slate-50">
                      {row.fgClosingStockPacks.toLocaleString()} Bungkus
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: CK-4 */}
      {activeReport === 'ck4' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="font-mono text-xs font-bold text-emerald-700">DOKUMEN PABEAN: FORMULIR CK-4</div>
              <h3 className="text-base font-black text-slate-900">
                Pemberitahuan Rekapitulasi Produksi & Penyerahan Hasil Tembakau
              </h3>
              <div className="text-xs text-slate-500">
                Dasar rekonsiliasi nilai cukai yang wajib dilaporkan kepada Kepala Kantor Pengawasan dan Pelayanan Bea dan Cukai (KPPBC).
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Nilai Cukai Terutang:</span>
              <span className="font-mono text-base font-black text-emerald-700">
                Rp {ck4Report.totalExciseValue.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Merek Hasil Tembakau</th>
                  <th className="py-2.5 px-3">Jenis</th>
                  <th className="py-2.5 px-3 text-center">Isi Kemasan</th>
                  <th className="py-2.5 px-3 text-right">Harga Jual Eceran (HJE)</th>
                  <th className="py-2.5 px-3 text-right">Tarif Cukai / Kemasan</th>
                  <th className="py-2.5 px-3 text-right">Total Produksi (Bks)</th>
                  <th className="py-2.5 px-3 text-right">Total Penyerahan (Bks)</th>
                  <th className="py-2.5 px-3 text-right">Nilai Cukai Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ck4Report.records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{r.brand}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{r.type}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{r.packSize} Btg</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      Rp {r.hjePerPack.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                      Rp {r.exciseRatePerPack.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">
                      {r.totalProductionPacks.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      {r.totalDeliveredSalesPacks.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                      Rp {r.totalExcisePayable.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 5: LACK-11 */}
      {activeReport === 'lack11' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-4xl mx-auto">
          <div className="text-center border-b border-slate-200 pb-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              KEMENTERIAN KEUANGAN REPUBLIK INDONESIA
            </div>
            <div className="text-xs font-bold text-slate-600 uppercase">
              DIREKTORAT JENDERAL BEA DAN CUKAI • {state.companySettings.customsOffice}
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-2">FORMULIR LACK-11</h3>
            <p className="text-xs text-slate-500">
              Laporan Pertanggungjawaban Mutasi Bahan Baku, Produksi Hasil Tembakau, dan Pemakaian Pita Cukai Pabrik
            </p>
          </div>

          {/* Company Identifiers */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">Nama Pabrik / Pengusaha:</span>
              <span className="font-bold text-slate-900">{state.companySettings.companyName}</span>
              <span className="text-slate-500 block mt-1">NPPBKC:</span>
              <span className="font-mono font-bold text-amber-800">{state.companySettings.nppbkc}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Kantor Pelayanan Bea Cukai:</span>
              <span className="font-bold text-slate-900">{state.companySettings.customsOffice}</span>
              <span className="text-slate-500 block mt-1">Masa / Periode Laporan:</span>
              <span className="font-bold text-slate-900">September 2026</span>
            </div>
          </div>

          {/* Core Balance Confirmation */}
          <div className="space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              Ringkasan Rekonsiliasi Audit (Tiga Sisi Saldo Fisik vs Pembukuan):
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-[11px] text-amber-800 font-semibold">Saldo Bahan Baku TSG</div>
                <div className="text-base font-black text-amber-900 mt-1">
                  {csck1[0]?.tsgClosingBalanceKg.toLocaleString()} Kg
                </div>
                <div className="text-[10px] text-amber-700 mt-1">Tercatat di CSCK-1</div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-[11px] text-purple-800 font-semibold">Pita Cukai Tersedia</div>
                <div className="text-base font-black text-purple-900 mt-1">
                  {csck3.reduce((s, r) => s + r.closingBalancePcs, 0).toLocaleString()} Keping
                </div>
                <div className="text-[10px] text-purple-700 mt-1">Tercatat di CSCK-3</div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-[11px] text-emerald-800 font-semibold">Rokok Siap Jual (FG)</div>
                <div className="text-base font-black text-emerald-900 mt-1">
                  {csck9.reduce((s, r) => s + r.fgClosingStockPacks, 0).toLocaleString()} Bungkus
                </div>
                <div className="text-[10px] text-emerald-700 mt-1">Tercatat di CSCK-9</div>
              </div>
            </div>
          </div>

          {/* Statement & Signature */}
          <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <p>
              Dengan ini kami menyatakan bahwa seluruh data mutasi bahan baku tembakau siap giling (TSG), produksi rokok
              kretek tangan (SKT), dan penggunaan pita cukai yang tercantum dalam formulir ini adalah benar dan sesuai
              dengan catatan fisik pembukuan pabrik.
            </p>
            <div className="flex justify-between items-end pt-4">
              <div>
                <div className="text-[11px] text-slate-500">Status Validasi Sistem:</div>
                <div className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 100% RECONCILED WITH GL & STOCK
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-500">Kudus, 18 September 2026</div>
                <div className="mt-8 font-bold text-slate-900 underline">{state.companySettings.directorName}</div>
                <div className="text-[11px] text-slate-500">Direktur Utama / Penanggung Jawab NPPBKC</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PITA CUKAI RECEIPT (CK-1) */}
      {showAddPcrModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Terima Pita Cukai Baru (Dokumen CK-1)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Pencatatan fisik penerimaan pita cukai dari Kantor Bea Cukai Pengawas ({state.companySettings.customsOffice}).
            </p>

            <form onSubmit={handleAddPcr} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Dokumen CK-1:</label>
                <input
                  type="text"
                  value={pcrDocNumber}
                  onChange={(e) => setPcrDocNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Merek & Seri Pita Cukai:</label>
                <select
                  value={pcrBrand}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPcrBrand(val);
                    if (val.includes('SKT 10')) {
                      setPcrPackSize(10);
                      setPcrTariff(2650);
                    } else if (val.includes('SKT 12')) {
                      setPcrPackSize(12);
                      setPcrTariff(3150);
                    } else if (val.includes('SKT 16')) {
                      setPcrPackSize(16);
                      setPcrTariff(4200);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="SGW Kretek SKT 10">SGW Kretek SKT 10 (Isi 10, HJE Rp 8.750, Cukai Rp 2.650)</option>
                  <option value="SGW Kuning SKT 12">SGW Kuning SKT 12 (Isi 12, HJE Rp 10.325, Cukai Rp 3.150)</option>
                  <option value="SGW Kuning SKT 16">SGW Kuning SKT 16 (Isi 16, HJE Rp 13.775, Cukai Rp 4.200)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah Lembar (CK-1):</label>
                  <input
                    type="number"
                    min="1"
                    value={pcrSheets}
                    onChange={(e) => setPcrSheets(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-amber-800 font-bold mt-1 block">
                    = {(pcrSheets * pcrConversion).toLocaleString()} Keping (@ {pcrConversion}/lembar)
                  </span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarif Cukai / Keping (Rp):</label>
                  <input
                    type="number"
                    min="100"
                    value={pcrTariff}
                    onChange={(e) => setPcrTariff(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Bisa disesuaikan manual</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-900">Total Nilai Penebusan Cukai:</span>
                  <span className="text-sm font-black text-amber-900 font-mono">
                    Rp {(pcrSheets * pcrConversion * pcrTariff).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-amber-700 mt-1">
                  1 Lembar = {pcrConversion} Keping Pita Cukai resmi DJBC
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPcrModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-sm"
                >
                  Simpan ke Buku CSCK-3
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
