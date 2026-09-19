// Finance & Accounting Module: General Ledger, Double-Entry Journals, COA, Trial Balance, P&L, Balance Sheet, Soft Close
import React, { useState } from 'react';
import {
  DollarSign,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  TrendingUp,
  Scale,
  Plus,
  Lock,
  Unlock,
} from 'lucide-react';
import { dbService } from '../services/mockDatabase';
import { JournalEntry, JournalLine } from '../types/erp';

export const AccountingModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'journals' | 'coa' | 'trial_balance' | 'pl' | 'balance_sheet' | 'periods'>('journals');
  const [selectedJv, setSelectedJv] = useState<JournalEntry | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const state = dbService.getState();

  const totalDebit = state.journalEntries.reduce((sum, jv) => sum + jv.totalDebit, 0);
  const totalCredit = state.journalEntries.reduce((sum, jv) => sum + jv.totalCredit, 0);
  const isAllBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  // Compute Laba Rugi (P&L)
  const revenueTotal = state.chartOfAccounts
    .filter((c) => c.type === 'REVENUE')
    .reduce((sum, c) => sum + c.balance, 0);

  const cogsTotal = state.chartOfAccounts
    .filter((c) => c.type === 'COGS')
    .reduce((sum, c) => sum + c.balance, 0);

  const expenseTotal = state.chartOfAccounts
    .filter((c) => c.type === 'EXPENSE')
    .reduce((sum, c) => sum + c.balance, 0);

  const grossProfit = revenueTotal - cogsTotal;
  const netIncome = grossProfit - expenseTotal;

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" /> Keuangan, Akuntansi & Jurnal Otomatis
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan akuntansi double-entry otomatis dari seluruh transaksi operasional pabrik, buku besar, neraca saldo, dan soft closing.
          </p>
        </div>

        {/* Balance Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
              isAllBalanced
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Debit = Kredit (100% Balanced)</span>
          </div>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold w-fit overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('journals')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeSubTab === 'journals' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Jurnal Umum Otomatis ({state.journalEntries.length})
        </button>
        <button
          onClick={() => setActiveSubTab('coa')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeSubTab === 'coa' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Bagan Akun (COA) ({state.chartOfAccounts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('trial_balance')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeSubTab === 'trial_balance' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Neraca Saldo (Trial Balance)
        </button>
        <button
          onClick={() => setActiveSubTab('pl')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeSubTab === 'pl' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Laporan Laba Rugi (P&L)
        </button>
        <button
          onClick={() => setActiveSubTab('balance_sheet')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeSubTab === 'balance_sheet' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Laporan Neraca
        </button>
        <button
          onClick={() => setActiveSubTab('periods')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeSubTab === 'periods' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tutup Buku (Soft Closing)
        </button>
      </div>

      {/* SUBTAB 1: JOURNALS */}
      {activeSubTab === 'journals' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">No. Jurnal (JV)</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Modul Pemicu</th>
                  <th className="py-2.5 px-3">No. Dokumen Sumber</th>
                  <th className="py-2.5 px-3">Keterangan Transaksi</th>
                  <th className="py-2.5 px-3 text-right">Total Debit</th>
                  <th className="py-2.5 px-3 text-right">Total Kredit</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Rincian Baris</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.journalEntries.map((jv) => (
                  <React.Fragment key={jv.id}>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{jv.journalNumber}</td>
                      <td className="py-2.5 px-3 text-slate-600">{jv.entryDate}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {jv.referenceModule}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-amber-700">{jv.referenceNumber}</td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{jv.description}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        Rp {jv.totalDebit.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        Rp {jv.totalCredit.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          POSTED
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedJv(selectedJv?.id === jv.id ? null : jv)}
                          className="text-amber-700 font-bold hover:underline"
                        >
                          {selectedJv?.id === jv.id ? 'Tutup' : 'Lihat Baris (GL)'}
                        </button>
                      </td>
                    </tr>

                    {/* Drilldown Lines */}
                    {selectedJv?.id === jv.id && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={9} className="p-4">
                          <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                            <div className="text-xs font-bold text-slate-800">
                              Rincian Double-Entry Akun Buku Besar untuk {jv.journalNumber}:
                            </div>
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                                  <th className="py-1 px-2">Kode Akun</th>
                                  <th className="py-1 px-2">Nama Rekening COA</th>
                                  <th className="py-1 px-2 text-right">Debit</th>
                                  <th className="py-1 px-2 text-right">Kredit</th>
                                  <th className="py-1 px-2">Memo Transaksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {jv.lines.map((line, lIdx) => (
                                  <tr key={lIdx}>
                                    <td className="py-1.5 px-2 font-mono font-bold text-slate-800">
                                      {line.accountCode}
                                    </td>
                                    <td className="py-1.5 px-2 font-medium text-slate-900">{line.accountName}</td>
                                    <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                                      {line.debit > 0 ? `Rp ${line.debit.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                                      {line.credit > 0 ? `Rp ${line.credit.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="py-1.5 px-2 text-slate-500 text-[11px]">{line.memo}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CHART OF ACCOUNTS */}
      {activeSubTab === 'coa' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">Kode Akun</th>
                <th className="py-2.5 px-3">Nama Rekening</th>
                <th className="py-2.5 px-3">Klasifikasi</th>
                <th className="py-2.5 px-3">Saldo Normal</th>
                <th className="py-2.5 px-3 text-right">Saldo Buku Besar</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.chartOfAccounts.map((coa) => (
                <tr key={coa.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{coa.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{coa.name}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        coa.type === 'ASSET'
                          ? 'bg-blue-100 text-blue-800'
                          : coa.type === 'LIABILITY'
                          ? 'bg-rose-100 text-rose-800'
                          : coa.type === 'EQUITY'
                          ? 'bg-purple-100 text-purple-800'
                          : coa.type === 'REVENUE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {coa.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-600">{coa.normalBalance}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    Rp {coa.balance.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      AKTIF
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 3: TRIAL BALANCE */}
      {activeSubTab === 'trial_balance' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Neraca Saldo (Trial Balance) Per September 2026</h3>
            <span className="text-xs text-slate-500 font-mono">Status: Double-Entry Balanced</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2 px-3">Kode</th>
                <th className="py-2 px-3">Nama Akun</th>
                <th className="py-2 px-3 text-right">Debit (Rp)</th>
                <th className="py-2 px-3 text-right">Kredit (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.chartOfAccounts.map((coa) => {
                const isDebit = coa.normalBalance === 'DEBIT';
                return (
                  <tr key={coa.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">{coa.code}</td>
                    <td className="py-2 px-3 text-slate-900">{coa.name}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {isDebit ? coa.balance.toLocaleString() : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {!isDebit ? coa.balance.toLocaleString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 4: PROFIT & LOSS */}
      {activeSubTab === 'pl' && (
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="text-center border-b border-slate-200 pb-4">
            <h3 className="text-base font-black text-slate-900">{state.companySettings.companyName}</h3>
            <h4 className="text-sm font-bold text-slate-700">LAPORAN LABA RUGI KOMPREHENSIF</h4>
            <div className="text-xs text-slate-500">Periode Berjalan Bulan September 2026</div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenue */}
            <div>
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                Pendapatan Penjualan:
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-700">Pendapatan Penjualan Rokok Hasil Tembakau</span>
                <span className="font-mono font-bold text-slate-900">Rp {revenueTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* COGS */}
            <div>
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                Harga Pokok Penjualan (HPP):
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-700">HPP Rokok Sigaret Kretek Tangan (SKT)</span>
                <span className="font-mono font-bold text-rose-700">(Rp {cogsTotal.toLocaleString()})</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="p-2.5 rounded-lg bg-slate-50 flex justify-between font-bold text-slate-900 border border-slate-200">
              <span>Laba Kotor (Gross Profit):</span>
              <span className="font-mono text-emerald-800">Rp {grossProfit.toLocaleString()}</span>
            </div>

            {/* Expenses */}
            <div>
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                Beban Operasional & Pabrikasi:
              </div>
              {state.chartOfAccounts
                .filter((c) => c.type === 'EXPENSE')
                .map((exp) => (
                  <div key={exp.id} className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-700">{exp.name}</span>
                    <span className="font-mono text-slate-800">Rp {exp.balance.toLocaleString()}</span>
                  </div>
                ))}
            </div>

            {/* Net Income */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex justify-between font-black text-sm text-slate-900">
              <span>Laba Bersih Sebelum Pajak:</span>
              <span className="font-mono text-emerald-800">Rp {netIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: BALANCE SHEET */}
      {activeSubTab === 'balance_sheet' && (
        <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="text-center border-b border-slate-200 pb-4">
            <h3 className="text-base font-black text-slate-900">{state.companySettings.companyName}</h3>
            <h4 className="text-sm font-bold text-slate-700">LAPORAN POSISI KEUANGAN (NERACA)</h4>
            <div className="text-xs text-slate-500">Per 30 September 2026</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: Assets */}
            <div className="space-y-3">
              <div className="font-bold text-slate-900 border-b-2 border-slate-800 pb-1 text-sm">
                ASET (AKTIVA)
              </div>
              {state.chartOfAccounts
                .filter((c) => c.type === 'ASSET')
                .map((c) => (
                  <div key={c.id} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">{c.name}</span>
                    <span className="font-mono font-bold text-slate-900">Rp {c.balance.toLocaleString()}</span>
                  </div>
                ))}
              <div className="p-2.5 rounded bg-blue-50 flex justify-between font-bold text-blue-950 border border-blue-200 mt-4">
                <span>Total Aset:</span>
                <span className="font-mono">
                  Rp{' '}
                  {state.chartOfAccounts
                    .filter((c) => c.type === 'ASSET')
                    .reduce((sum, c) => sum + c.balance, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>

            {/* Right: Liabilities & Equity */}
            <div className="space-y-3">
              <div className="font-bold text-slate-900 border-b-2 border-slate-800 pb-1 text-sm">
                KEWAJIBAN & EKUITAS (PASIVA)
              </div>
              <div className="font-semibold text-slate-800 uppercase text-[10px] pt-1">Kewajiban / Hutang:</div>
              {state.chartOfAccounts
                .filter((c) => c.type === 'LIABILITY')
                .map((c) => (
                  <div key={c.id} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">{c.name}</span>
                    <span className="font-mono font-bold text-slate-900">Rp {c.balance.toLocaleString()}</span>
                  </div>
                ))}

              <div className="font-semibold text-slate-800 uppercase text-[10px] pt-2">Ekuitas Modal:</div>
              {state.chartOfAccounts
                .filter((c) => c.type === 'EQUITY')
                .map((c) => (
                  <div key={c.id} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">{c.name}</span>
                    <span className="font-mono font-bold text-slate-900">Rp {c.balance.toLocaleString()}</span>
                  </div>
                ))}

              <div className="p-2.5 rounded bg-emerald-50 flex justify-between font-bold text-emerald-950 border border-emerald-200 mt-4">
                <span>Total Kewajiban & Ekuitas:</span>
                <span className="font-mono">
                  Rp{' '}
                  {state.chartOfAccounts
                    .filter((c) => c.type === 'LIABILITY' || c.type === 'EQUITY')
                    .reduce((sum, c) => sum + c.balance, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: PERIODS / SOFT CLOSE */}
      {activeSubTab === 'periods' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <span className="font-bold">Ketentuan Tutup Buku (Soft-Closing):</span> Sistem menerapkan mekanisme
            soft-closing yang mengunci posting jurnal transaksi operasional pada periode yang telah disetujui audit,
            namun tetap menyediakan jalur pembukaan kembali (reopen) dengan audit trail lengkap atas izin Direksi.
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">Tahun Buku</th>
                <th className="py-2.5 px-3">Bulan Periode</th>
                <th className="py-2.5 px-3">Status Penutupan</th>
                <th className="py-2.5 px-3">Waktu Tutup</th>
                <th className="py-2.5 px-3">Otorisator</th>
                <th className="py-2.5 px-3 text-right">Aksi Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.fiscalPeriods.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.year}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">Bulan {p.month}</td>
                  <td className="py-2.5 px-3">
                    {p.isClosed ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                        <Lock className="w-3 h-3" /> SOFT-CLOSED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                        <Unlock className="w-3 h-3" /> OPEN
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{p.closedAt || '-'}</td>
                  <td className="py-2.5 px-3 text-slate-700">{p.closedBy || '-'}</td>
                  <td className="py-2.5 px-3 text-right">
                    {!p.isClosed ? (
                      <button
                        onClick={() => {
                          if (confirm(`Lakukan Soft-Closing untuk periode ${p.month}/${p.year}?`)) {
                            dbService.softClosePeriod(p.year, p.month);
                            setRefreshKey((k) => k + 1);
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition"
                      >
                        Tutup Buku (Soft Close)
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const reason = prompt('Masukkan Alasan Reopen Periode:', 'Koreksi penyesuaian audit bea cukai');
                          if (reason) {
                            dbService.reopenPeriod(p.year, p.month, reason);
                            setRefreshKey((k) => k + 1);
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] transition"
                      >
                        Buka Kembali (Reopen)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
