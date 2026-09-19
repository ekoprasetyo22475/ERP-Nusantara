// Tax Compliance Module: PPN Masukan, PPN Keluaran, SPT Masa PPN 1111, PPh 21 & PPh 22
import React, { useState } from 'react';
import {
  Receipt,
  FileCheck2,
  TrendingDown,
  TrendingUp,
  Scale,
  Calendar,
  AlertCircle,
  Download,
} from 'lucide-react';
import { dbService } from '../services/mockDatabase';

export const TaxModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ppn' | 'spt_masa' | 'pph21' | 'masters'>('ppn');
  const state = dbService.getState();

  const ppnMasukan = state.taxTransactions.filter((t) => t.taxType === 'PPN_MASUKAN');
  const ppnKeluaran = state.taxTransactions.filter((t) => t.taxType === 'PPN_KELUARAN');

  const totalPpnMasukan = ppnMasukan.reduce((sum, t) => sum + t.taxAmount, 0);
  const totalPpnKeluaran = ppnKeluaran.reduce((sum, t) => sum + t.taxAmount, 0);
  const netPpnPayable = totalPpnKeluaran - totalPpnMasukan;

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" /> Perpajakan Terpadu (PPN & PPh)
          </h2>
          <p className="text-xs text-slate-500">
            Kepatuhan perpajakan Indonesia: Rekapitulasi Faktur Pajak Masukan, Faktur Pajak Keluaran, SPT Masa PPN 1111, dan PPh 21 Karyawan Pabrik.
          </p>
        </div>

        {/* SPT PPN Net Summary Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs">
            <span className="text-slate-500 font-medium">Status SPT PPN Bulan Ini: </span>
            <span className="font-mono font-bold text-blue-900">
              {netPpnPayable > 0
                ? `Kurang Bayar (KB): Rp ${netPpnPayable.toLocaleString()}`
                : `Lebih Bayar (LB): Rp ${Math.abs(netPpnPayable).toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold w-fit">
        <button
          onClick={() => setActiveTab('ppn')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeTab === 'ppn' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Register Faktur Pajak ({state.taxTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('spt_masa')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeTab === 'spt_masa' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Kalkulasi SPT Masa PPN 1111
        </button>
        <button
          onClick={() => setActiveTab('pph21')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeTab === 'pph21' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pemotongan PPh 21 Karyawan & Borongan
        </button>
        <button
          onClick={() => setActiveTab('masters')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeTab === 'masters' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Master Tarif Pajak
        </button>
      </div>

      {/* SUBTAB 1: PPN REGISTER */}
      {activeTab === 'ppn' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-[11px] text-slate-500 font-medium">Total PPN Masukan (Bahan Baku TSG & Kemasan)</div>
              <div className="text-xl font-black text-blue-700 mt-1">Rp {totalPpnMasukan.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{ppnMasukan.length} Dokumen Faktur Masukan</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-[11px] text-slate-500 font-medium">Total PPN Keluaran (Penjualan Rokok)</div>
              <div className="text-xl font-black text-emerald-700 mt-1">Rp {totalPpnKeluaran.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{ppnKeluaran.length} Dokumen Faktur Keluaran</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-[11px] text-slate-500 font-medium">Selisih PPN (Kurang/Lebih Bayar)</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                Rp {Math.abs(netPpnPayable).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                {netPpnPayable >= 0 ? 'PPN Kurang Bayar disetor ke Kas Negara' : 'PPN Lebih Bayar dapat dikompensasi'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Jenis Pajak</th>
                  <th className="py-2.5 px-3">No. Faktur Pajak</th>
                  <th className="py-2.5 px-3">Ref. Dokumen</th>
                  <th className="py-2.5 px-3">Nama Entitas Rekanan</th>
                  <th className="py-2.5 px-3">NPWP</th>
                  <th className="py-2.5 px-3 text-right">DPP</th>
                  <th className="py-2.5 px-3 text-right">Tarif</th>
                  <th className="py-2.5 px-3 text-right">Pajak (PPN)</th>
                  <th className="py-2.5 px-3 text-center">Status SPT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.taxTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{tx.date}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.taxType === 'PPN_MASUKAN'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {tx.taxType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{tx.fakturPajakNumber || '-'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{tx.referenceNumber}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{tx.entityName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{tx.entityNpwp}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">Rp {tx.dpp.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">{tx.taxRate}%</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      Rp {tx.taxAmount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'REPORTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SPT MASA PPN 1111 */}
      {activeTab === 'spt_masa' && (
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="text-center border-b border-slate-200 pb-4">
            <h3 className="text-base font-black text-slate-900">{state.companySettings.companyName}</h3>
            <h4 className="text-sm font-bold text-slate-700">FORMULIR SPT MASA PPN 1111 (INDUK)</h4>
            <div className="text-xs text-slate-500 font-mono">Masa Pajak: September 2026 | NPWP: {state.companySettings.npwp}</div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 uppercase text-[11px]">I. PENYERAHAN BARANG DAN JASA (PPN KELUARAN)</div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-700">Penyerahan yang PPN-nya harus dipungut sendiri (Faktur Pajak A2):</span>
                <span className="font-mono font-bold text-slate-900">Rp {totalPpnKeluaran.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1">
                <span>Jumlah Pajak Keluaran:</span>
                <span className="font-mono text-emerald-700">Rp {totalPpnKeluaran.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 uppercase text-[11px]">II. PENGHITUNGAN PPN KURANG ATAU LEBIH BAYAR</div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-700">Pajak Masukan yang dapat dikreditkan (Faktur Pajak B2):</span>
                <span className="font-mono font-bold text-slate-900">Rp {totalPpnMasukan.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1">
                <span>PPN Kurang / (Lebih) Bayar:</span>
                <span className="font-mono text-blue-900">Rp {netPpnPayable.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PPH 21 */}
      {activeTab === 'pph21' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Perhitungan Pemotongan PPh 21 Tenaga Kerja Pabrik Rokok (Tetap & Borongan)
            </h3>
            <span className="text-xs text-slate-500">Berdasarkan Tarif Efektif Rata-Rata (TER) PP 58/2023</span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">NIK</th>
                <th className="py-2.5 px-3">Nama Pekerja</th>
                <th className="py-2.5 px-3">Departemen</th>
                <th className="py-2.5 px-3">Status Kerja</th>
                <th className="py-2.5 px-3 text-right">Penghasilan Bruto (Bulan Ini)</th>
                <th className="py-2.5 px-3 text-right">Tarif PPh 21</th>
                <th className="py-2.5 px-3 text-right">Potongan PPh 21</th>
                <th className="py-2.5 px-3 text-right">Gaji Bersih Diterima</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.employees.map((emp) => {
                const gross = emp.employmentStatus === 'TETAP' ? emp.baseSalaryOrRate : 3850000;
                const pphRate = emp.employmentStatus === 'TETAP' ? 0.5 : 0.25;
                const pph = Math.round((gross * pphRate) / 100);
                const net = gross - pph;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-600">{emp.nik}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{emp.name}</td>
                    <td className="py-2.5 px-3 text-slate-700">{emp.department}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      Rp {gross.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">{pphRate}%</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                      Rp {pph.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      Rp {net.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 4: MASTERS */}
      {activeTab === 'masters' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">Kode Pajak</th>
                <th className="py-2.5 px-3">Nama Pajak</th>
                <th className="py-2.5 px-3 text-right">Tarif (%)</th>
                <th className="py-2.5 px-3">Mulai Berlaku</th>
                <th className="py-2.5 px-3">Akun Penampung (COA)</th>
                <th className="py-2.5 px-3">Deskripsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.taxTransactions && state.taxMasters.map((tax) => (
                <tr key={tax.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{tax.taxCode}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{tax.name}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">{tax.rate}%</td>
                  <td className="py-2.5 px-3 text-slate-600">{tax.effectiveDate}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{tax.accountId}</td>
                  <td className="py-2.5 px-3 text-slate-500">{tax.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
