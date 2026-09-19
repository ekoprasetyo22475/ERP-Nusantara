import React from 'react';
import { X, Printer, Building2, RotateCcw, AlertTriangle, FileText } from 'lucide-react';
import { PurchaseReturn, CompanySettings, Supplier } from '../../types/erp';

interface DebitNotePrintModalProps {
  purchaseReturn: PurchaseReturn | null;
  onClose: () => void;
  companySettings: CompanySettings;
  supplier?: Supplier;
}

export const DebitNotePrintModal: React.FC<DebitNotePrintModalProps> = ({
  purchaseReturn,
  onClose,
  companySettings,
  supplier,
}) => {
  if (!purchaseReturn) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:border-none print:shadow-none print:m-0 print:w-full">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Pratinjau Cetak Surat Jalan Retur & Nota Debet Resmi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-lg shadow-sm flex items-center gap-1.5 transition"
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

        {/* Printable Document Area */}
        <div className="p-8 md:p-12 text-slate-900 bg-white font-sans text-xs">
          {/* Header Kop Surat Perusahaan */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-lg font-black tracking-tight uppercase text-slate-900">
                  {companySettings.companyName || 'PT SGW NUSANTARA MAKMUR'}
                </h1>
                <p className="text-xs font-medium text-slate-600">
                  {companySettings.subTitle || companySettings.companySubtitle || 'Pabrik Hasil Tembakau & Sigaret Kretek Tangan'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-lg">
                  {companySettings.address || companySettings.factoryAddress}
                </p>
                <div className="flex flex-wrap gap-x-4 text-[11px] font-mono text-slate-600 mt-1">
                  <span>NPWP: {companySettings.npwp}</span>
                  <span>NPPBKC: {companySettings.nppbkc}</span>
                  <span>KPPBC: {companySettings.customsOffice}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-sm mb-1">
                  NOTA DEBET & SURAT JALAN RETUR
                </div>
                <div className="font-mono font-bold text-sm text-slate-900 mt-1">
                  {purchaseReturn.debitNoteNumber}
                </div>
                <div className="text-[11px] text-slate-500">
                  No. Retur: {purchaseReturn.returnNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Document Information Grid */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Ditujukan Kepada Pemasok (Vendor):
              </div>
              <div className="font-bold text-sm text-slate-900">{purchaseReturn.supplierName}</div>
              {supplier && (
                <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                  <div>{supplier.address}</div>
                  <div>NPWP: {supplier.npwp || '-'}</div>
                  <div>Kontak: {supplier.phone} ({supplier.email})</div>
                </div>
              )}
            </div>

            <div className="text-right space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Atribut Dokumen Transaksi:
              </div>
              <div className="text-xs">
                <span className="text-slate-500">Tanggal Terbit Retur: </span>
                <span className="font-bold font-mono text-slate-900">{purchaseReturn.returnDate}</span>
              </div>
              {purchaseReturn.poNumber && (
                <div className="text-xs">
                  <span className="text-slate-500">Referensi PO: </span>
                  <span className="font-mono font-semibold text-slate-800">{purchaseReturn.poNumber}</span>
                </div>
              )}
              {purchaseReturn.grnNumber && (
                <div className="text-xs">
                  <span className="text-slate-500">Referensi GRN: </span>
                  <span className="font-mono font-semibold text-slate-800">{purchaseReturn.grnNumber}</span>
                </div>
              )}
              {purchaseReturn.supplierInvoiceNumber && (
                <div className="text-xs">
                  <span className="text-slate-500">Memotong Faktur AP: </span>
                  <span className="font-mono font-semibold text-red-700">{purchaseReturn.supplierInvoiceNumber}</span>
                </div>
              )}
              <div className="text-xs">
                <span className="text-slate-500">Gudang Pengeluaran: </span>
                <span className="font-semibold text-slate-800">{purchaseReturn.warehouseId}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 text-left w-10">No</th>
                  <th className="py-2.5 px-3 text-left">Kode & Nama Bahan</th>
                  <th className="py-2.5 px-3 text-right">Qty Dikembalikan</th>
                  <th className="py-2.5 px-3 text-right">Harga Satuan DPP</th>
                  <th className="py-2.5 px-3 text-left">Alasan Kerusakan / Retur</th>
                  <th className="py-2.5 px-3 text-right">Subtotal DPP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {purchaseReturn.items.map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{it.itemName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{it.itemCode}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono">
                      {it.qtyReturned.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">{it.uom}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      Rp {it.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 italic">
                      {it.reason || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">
                      Rp {it.subtotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary & Totals */}
          <div className="grid grid-cols-2 gap-6 pt-2 mb-8">
            <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">Catatan Dokumen & Instruksi:</div>
              <p className="text-[11px] leading-relaxed">
                {purchaseReturn.notes || 'Barang tersebut di atas dikembalikan ke pihak pemasok karena cacat mutu / tidak memenuhi spesifikasi pabrik SKT. Nilai pada Nota Debet ini memotong kewajiban hutang usaha perusahaan kepada pemasok yang bersangkutan.'}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-right bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal DPP Retur:</span>
                <span className="font-mono font-semibold text-slate-800">
                  Rp {purchaseReturn.subtotalDpp.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pengurangan PPN Masukan (11%):</span>
                <span className="font-mono font-semibold text-slate-800">
                  Rp {purchaseReturn.ppnAmount.toLocaleString()}
                </span>
              </div>
              <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-center text-sm">
                <span className="font-black uppercase tracking-wider text-slate-900">
                  Total Nilai Nota Debet (DN):
                </span>
                <span className="font-black font-mono text-base text-red-700">
                  Rp {purchaseReturn.totalDebitNote.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Signature Grid */}
          <div className="grid grid-cols-4 gap-4 text-center pt-4 border-t border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Petugas Gudang (Pengirim)</div>
              <div className="h-16 flex items-end justify-center">
                <div className="w-28 border-b border-slate-400"></div>
              </div>
              <div className="text-[11px] font-bold text-slate-800 mt-1">Bagian Gudang Material</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Bagian Pembelian (PO)</div>
              <div className="h-16 flex items-end justify-center">
                <div className="w-28 border-b border-slate-400"></div>
              </div>
              <div className="text-[11px] font-bold text-slate-800 mt-1">Purchasing Officer</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Bagian Akuntansi (AP)</div>
              <div className="h-16 flex items-end justify-center">
                <div className="w-28 border-b border-slate-400"></div>
              </div>
              <div className="text-[11px] font-bold text-slate-800 mt-1">Finance & Accounting</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Pemasok / Ekspedisi</div>
              <div className="h-16 flex items-end justify-center">
                <div className="w-28 border-b border-slate-400"></div>
              </div>
              <div className="text-[11px] font-bold text-slate-800 mt-1">Nama Jelas & Cap</div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-slate-400 mt-8 pt-4 border-t border-slate-100">
            {companySettings.footerText || 'Dokumen Sah Resmi Pabrik Hasil Tembakau — SGW ONE NUSANTARA'}
          </div>
        </div>
      </div>
    </div>
  );
};
