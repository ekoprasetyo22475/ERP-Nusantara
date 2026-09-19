// HRIS & Payroll Module: Cigarette Production Labor (Borongan Giling/Gunting/Packing & Staff Tetap)
import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Award,
  Plus,
  Briefcase,
} from 'lucide-react';
import { dbService } from '../services/mockDatabase';
import { Employee, PayrollRecord } from '../types/erp';

export const HrisModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'payroll' | 'summary'>('employees');
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const [outputPieces, setOutputPieces] = useState(100000);
  const [daysWorked, setDaysWorked] = useState(25);

  const [refreshKey, setRefreshKey] = useState(0);
  const state = dbService.getState();

  const handleProcessPayroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    let gross = 0;
    if (selectedEmp.employmentStatus === 'BORONGAN') {
      // Borongan rate calculation (e.g. per 1000 sticks or packs)
      gross = Math.round((outputPieces / 1000) * selectedEmp.baseSalaryOrRate);
    } else {
      gross = selectedEmp.baseSalaryOrRate;
    }

    const pph21 = Math.round(gross * (selectedEmp.employmentStatus === 'TETAP' ? 0.005 : 0.0025));
    const bpjs = selectedEmp.employmentStatus === 'TETAP' ? Math.round(gross * 0.03) : 0;
    const net = gross - pph21 - bpjs;

    dbService.processPayroll({
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.name,
      department: selectedEmp.department,
      period: '2026-09',
      baseSalaryOrWage: selectedEmp.baseSalaryOrRate,
      outputPieces: selectedEmp.employmentStatus === 'BORONGAN' ? outputPieces : undefined,
      pieceRate: selectedEmp.employmentStatus === 'BORONGAN' ? selectedEmp.baseSalaryOrRate : undefined,
      allowances: selectedEmp.employmentStatus === 'TETAP' ? 500000 : 0,
      overtime: 0,
      pph21Deduction: pph21,
      bpjsDeduction: bpjs,
      grossTotal: gross,
      netPayable: net,
      status: 'PAID',
    });

    setShowPayrollModal(false);
    setSelectedEmp(null);
    setRefreshKey((k) => k + 1);
    alert('Slip Gaji berhasil diproses! Jurnal Penggajian dan pemotongan PPh 21 telah dicatat otomatis ke Buku Besar.');
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" /> SDM & Penggajian Tenaga Kerja Pabrik (HRIS)
          </h2>
          <p className="text-xs text-slate-500">
            Pengelolaan tenaga kerja Sigaret Kretek Tangan (Borongan Giling, Borongan Gunting, Packing, Mandor Meja, QC) & Penggajian Otomatis.
          </p>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold w-fit">
        <button
          onClick={() => setActiveSubTab('employees')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeSubTab === 'employees' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Data Karyawan & Pekerja Meja ({state.employees.length})
        </button>
        <button
          onClick={() => setActiveSubTab('payroll')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeSubTab === 'payroll' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Riwayat Slip Gaji ({state.payrollRecords.length})
        </button>
      </div>

      {/* SUBTAB 1: EMPLOYEES */}
      {activeSubTab === 'employees' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">NIK</th>
                <th className="py-2.5 px-3">Nama Tenaga Kerja</th>
                <th className="py-2.5 px-3">Departemen / Meja</th>
                <th className="py-2.5 px-3">Jabatan</th>
                <th className="py-2.5 px-3">Skema Upah</th>
                <th className="py-2.5 px-3 text-right">Tarif / Gaji Pokok</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{emp.nik}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{emp.name}</td>
                  <td className="py-2.5 px-3 text-slate-700">{emp.department}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{emp.position}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        emp.employmentStatus === 'BORONGAN'
                          ? 'bg-amber-100 text-amber-800'
                          : emp.employmentStatus === 'HARIAN'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {emp.employmentStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    Rp {emp.baseSalaryOrRate.toLocaleString()} {emp.employmentStatus === 'BORONGAN' ? '/ 1.000' : '/ Bln'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      AKTIF
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedEmp(emp);
                        setShowPayrollModal(true);
                      }}
                      className="px-2.5 py-1 rounded bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] transition"
                    >
                      Hitung Gaji
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 2: PAYROLL RECORDS */}
      {activeSubTab === 'payroll' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">Periode</th>
                <th className="py-2.5 px-3">Nama Karyawan</th>
                <th className="py-2.5 px-3">Departemen</th>
                <th className="py-2.5 px-3 text-right">Penghasilan Bruto</th>
                <th className="py-2.5 px-3 text-right">Potongan PPh 21</th>
                <th className="py-2.5 px-3 text-right">Potongan BPJS</th>
                <th className="py-2.5 px-3 text-right">Gaji Bersih (Take Home Pay)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.payrollRecords.map((pr) => (
                <tr key={pr.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-600">{pr.period}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{pr.employeeName}</td>
                  <td className="py-2.5 px-3 text-slate-700">{pr.department}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    Rp {pr.grossTotal.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-600 font-medium">
                    Rp {pr.pph21Deduction.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 font-medium">
                    Rp {pr.bpjsDeduction.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800">
                    Rp {pr.netPayable.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {pr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: PROCESS PAYROLL */}
      {showPayrollModal && selectedEmp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Proses Penggajian & Upah</h3>
            <p className="text-xs text-slate-500 mb-4">
              Perhitungan slip gaji untuk <span className="font-bold text-slate-900">{selectedEmp.name}</span> ({selectedEmp.position} -{' '}
              {selectedEmp.employmentStatus}).
            </p>

            <form onSubmit={handleProcessPayroll} className="space-y-4 text-xs">
              {selectedEmp.employmentStatus === 'BORONGAN' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Realisasi Hasil Kerja (Batang / Bungkus):
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={outputPieces}
                    onChange={(e) => setOutputPieces(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    Tarif Borongan: Rp {selectedEmp.baseSalaryOrRate.toLocaleString()} per 1.000 output
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hari Kerja Masuk (Presensi):</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={daysWorked}
                    onChange={(e) => setDaysWorked(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 space-y-1">
                <div className="font-bold text-purple-900">Simulasi Gaji & Pemotongan Pajak:</div>
                <div className="flex justify-between text-slate-700">
                  <span>Estimasi Bruto:</span>
                  <span className="font-mono font-bold">
                    Rp{' '}
                    {(selectedEmp.employmentStatus === 'BORONGAN'
                      ? (outputPieces / 1000) * selectedEmp.baseSalaryOrRate
                      : selectedEmp.baseSalaryOrRate
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Potongan PPh 21 (PP 58/2023):</span>
                  <span className="font-mono text-rose-700 font-bold">
                    -Rp{' '}
                    {Math.round(
                      (selectedEmp.employmentStatus === 'BORONGAN'
                        ? (outputPieces / 1000) * selectedEmp.baseSalaryOrRate
                        : selectedEmp.baseSalaryOrRate) * 0.0025
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPayrollModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-sm"
                >
                  Posting Slip Gaji & Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
