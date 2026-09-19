import React from 'react';
import { X, Printer, ClipboardCheck, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StockOpname, CompanySettings } from '../../types/erp';

interface StockOpnamePrintModalProps {
  opname: StockOpname | null;
  onClose: () => void;
  companySettings: CompanySettings;
}

export const StockOpnamePrintModal: React.FC<StockOpnamePrintModalProps> = ({
  opname,
  onClose,
  companySettings,
}) => {
  if (!opname) return null;

  const handlePrint = () => {
    window.print();
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'COCOK':
        return 'Sesuai / Cocok';
      case 'SUSUT_ALAMI_KADAR_AIR':
        return 'Susut Kadar Air / Cuaca';
      case 'RUSAK_AFKIR':
        return 'Rusak / Afkir / Sobek';
      case 'SELISIH_ADMINISTRASI':
        return 'Selisih Administrasi / Catat';
      case 'SAMPLE_LAB_QC':
        return 'Sampel Pengujian Lab QC';
      case 'HILANG':
        return 'Kehilangan Fisik';
      default:
        return reason;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:border-none print:shadow-none print:m-0 print:w-full">
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Pratinjau Berita Acara Stock Opname (BASO) Resmi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak / Unduh PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 sm:p-10 text-slate-900 font-sans space-y-6 bg-white text-xs leading-relaxed">
          {/* Header Kop Surat Perusahaan */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl tracking-tighter">
                SGW
              </div>
              <div>
                <h1 className="text-base font-black text-slate-950 uppercase tracking-tight">
                  {companySettings.companyName}
                </h1>
                <p className="text-[11px] font-bold text-emerald-900">{companySettings.subTitle}</p>
                <p className="text-[10px] text-slate-600 max-w-md mt-0.5">{companySettings.address}</p>
                <div className="flex flex-wrap items-center gap-x-3 text-[10px] text-slate-500 mt-1 font-mono">
                  <span>NPWP: {companySettings.npwp}</span>
                  <span>NPPBKC: {companySettings.nppbkc}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-black text-xs uppercase tracking-wider">
                BERITA ACARA STOCK OPNAME
              </div>
              <div className="text-base font-black font-mono text-slate-950 mt-1.5">
                {opname.opnameNumber}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Tanggal: <span className="font-bold text-slate-800">{opname.opnameDate}</span>
              </div>
            </div>
          </div>

          {/* Location & Auditor Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1.5 border-r border-slate-200 pr-4">
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Lokasi Audit & Fisik Gudang
              </div>
              <div className="font-black text-slate-950 text-sm">
                {opname.warehouseName}
              </div>
              <div className="text-slate-600 font-mono text-[11px]">
                Kode Fasilitas: {opname.warehouseCode}
              </div>
            </div>

            <div className="space-y-1 pl-2 text-[11px]">
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Tim Pemeriksa & Penanggung Jawab
              </div>
              <div>
                <span className="text-slate-500">Ketua Pemeriksa / Auditor:</span>{' '}
                <span className="font-bold text-slate-900">{opname.auditorName}</span>
              </div>
              <div>
                <span className="text-slate-500">Saksi / Kepala Gudang:</span>{' '}
                <span className="font-bold text-slate-900">{opname.witnessName || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500">Hasil Rekonsiliasi:</span>{' '}
                <span className="font-bold text-slate-900">
                  {opname.totalItemsCounted} item dihitung, {opname.totalItemsWithVariance} item selisih
                </span>
              </div>
            </div>
          </div>

          {/* Table Items */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-300">
                  <th className="py-2.5 px-3 w-8 text-center">No</th>
                  <th className="py-2.5 px-3 w-28">Kode Barang</th>
                  <th className="py-2.5 px-3">Nama Barang</th>
                  <th className="py-2.5 px-3 text-right w-20">Stok Sistem</th>
                  <th className="py-2.5 px-3 text-right w-20">Fisik Nyata</th>
                  <th className="py-2.5 px-3 text-right w-20">Selisih</th>
                  <th className="py-2.5 px-3 text-center w-14">Satuan</th>
                  <th className="py-2.5 px-3 text-right w-28">Valuasi Selisih</th>
                  <th className="py-2.5 px-3 w-36">Keterangan / Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {opname.items.map((item, idx) => {
                  const isDiff = item.varianceQty !== 0;
                  return (
                    <tr key={idx} className={isDiff ? 'bg-amber-50/40' : 'hover:bg-slate-50/50'}>
                      <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                        {item.itemCode}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{item.itemName}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        {item.systemQty.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">
                        {item.physicalQty.toLocaleString()}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-mono font-black ${
                          item.varianceQty === 0
                            ? 'text-slate-400'
                            : item.varianceQty < 0
                            ? 'text-rose-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {item.varianceQty > 0 ? `+${item.varianceQty}` : item.varianceQty}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-600">
                        {item.uom}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-mono font-bold ${
                          item.varianceCost === 0
                            ? 'text-slate-400'
                            : item.varianceCost < 0
                            ? 'text-rose-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {item.varianceCost === 0
                          ? 'Rp 0'
                          : `Rp ${item.varianceCost.toLocaleString()}`}
                      </td>
                      <td className="py-2 px-3 text-[10px] text-slate-700">
                        <span className="font-semibold block">{getReasonLabel(item.reason)}</span>
                        {item.notes && <span className="text-slate-500 italic">{item.notes}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                  <td colSpan={7} className="py-2.5 px-3 text-right text-[11px] uppercase">
                    Total Dampak Keuangan Varian Opname (Beban/Pendapatan Koreksi):
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-black text-sm ${
                      opname.totalVarianceCost < 0
                        ? 'text-rose-700'
                        : opname.totalVarianceCost > 0
                        ? 'text-emerald-700'
                        : 'text-slate-900'
                    }`}
                  >
                    {opname.totalVarianceCost > 0 ? '+' : ''}Rp {opname.totalVarianceCost.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {opname.notes && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-700">
              <span className="font-bold text-slate-900">Catatan & Rekomendasi Audit:</span> {opname.notes}
            </div>
          )}

          {/* Legal Instruction */}
          <div className="text-[10px] text-slate-500 italic border-l-2 border-emerald-500 pl-3 py-1">
            * Berita acara ini sah dan telah dilakukan penyesuaian otomatis ke Kartu Stok fisik serta Jurnal Penyesuaian Persediaan (Akun 5003 / 1201) pada sistem akuntansi pabrik.
          </div>

          {/* 3-Box Signatures: Auditor, Kepala Gudang, Bagian Akuntansi */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-center">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Pemeriksa Fisik (Auditor)</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-900 border-t border-slate-300 pt-1 text-xs">
                ( {opname.auditorName} )
              </div>
              <div className="text-[9px] text-slate-400">Tim Audit Internal</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Saksi (Kepala Gudang)</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-900 border-t border-slate-300 pt-1 text-xs">
                ( {opname.witnessName || 'Agus Subagyo'} )
              </div>
              <div className="text-[9px] text-slate-400">Penanggung Jawab Gudang</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Mengetahui (Akuntansi / Direksi)</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-900 border-t border-slate-300 pt-1 text-xs">
                ( {companySettings.directorName || 'Direktur Operasional'} )
              </div>
              <div className="text-[9px] text-slate-400">Finance & Operations Manager</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
