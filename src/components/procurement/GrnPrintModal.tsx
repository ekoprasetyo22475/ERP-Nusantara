import React from 'react';
import { X, Printer, Truck, CheckCircle, Scale } from 'lucide-react';
import { GoodsReceiptNote, CompanySettings } from '../../types/erp';

interface GrnPrintModalProps {
  grn: GoodsReceiptNote | null;
  onClose: () => void;
  companySettings: CompanySettings;
}

export const GrnPrintModal: React.FC<GrnPrintModalProps> = ({
  grn,
  onClose,
  companySettings,
}) => {
  if (!grn) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:border-none print:shadow-none print:m-0 print:w-full">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Pratinjau Cetak Surat Penerimaan Barang Gudang (GRN)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-lg shadow-sm flex items-center gap-1.5 transition"
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

        {/* Printable Document Paper Area */}
        <div className="p-8 md:p-10 font-sans text-slate-900 bg-white" id="printable-grn">
          {/* Header Kop Surat Perusahaan */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black text-sm">
                    SGW
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase leading-none">
                      {companySettings.companyName}
                    </h1>
                    <p className="text-[11px] text-slate-600 font-semibold tracking-wide">
                      {companySettings.subTitle || companySettings.companySubtitle || 'Pabrik Hasil Tembakau & Sigaret Kretek Tangan'}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 leading-tight pt-1">
                  {companySettings.address || companySettings.factoryAddress}
                  {companySettings.city ? `, ${companySettings.city}` : ''}{' '}
                  {companySettings.postalCode ? `Kode Pos ${companySettings.postalCode}` : ''}
                  <br />
                  Telp: {companySettings.phone} | Email: {companySettings.email}
                </p>
              </div>

              <div className="text-right border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-[10px] space-y-0.5">
                <div className="font-bold text-slate-900">LEGALITAS PABRIK</div>
                <div>
                  NPPBKC:{' '}
                  <span className="font-mono font-bold text-slate-950">
                    {companySettings.nppbkc}
                  </span>
                </div>
                <div>
                  NPWP:{' '}
                  <span className="font-mono text-slate-800">{companySettings.npwp}</span>
                </div>
                <div>
                  KPPBC:{' '}
                  <span className="font-medium text-slate-700">
                    {companySettings.customsOffice}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Title & Reference */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-black tracking-wider uppercase underline underline-offset-4 text-slate-950">
              SURAT BUKTI PENERIMAAN BARANG GUDANG
            </h2>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              GOODS RECEIPT NOTE (GRN)
            </div>
            <div className="text-xs font-mono font-bold text-blue-900 mt-1">
              NOMOR BUKTI: {grn.grnNumber}
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
            {/* Left: Supplier & Delivery */}
            <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50/60 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                PENGIRIM BARANG (REKANAN)
              </div>
              <div className="font-bold text-sm text-slate-900">{grn.supplierName}</div>
              <div className="text-[11px] text-slate-600 pt-1">
                No. Surat Jalan Vendor:{' '}
                <strong className="font-mono text-slate-900">{grn.vendorDeliveryRef}</strong>
              </div>
              <div className="text-[11px] text-slate-600">
                No. Referensi PO:{' '}
                <strong className="font-mono text-slate-900">{grn.poNumber}</strong>
              </div>
            </div>

            {/* Right: Warehouse Info */}
            <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50/60 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                LOKASI & WAKTU PENERIMAAN
              </div>
              <div className="grid grid-cols-2 gap-y-1 text-[11px]">
                <span className="text-slate-500">Tanggal Diterima:</span>
                <span className="font-bold text-slate-900">{grn.receiptDate}</span>

                <span className="text-slate-500">Gudang Penyimpanan:</span>
                <span className="font-bold text-slate-900">WH-MATERIAL (Gudang Bahan Baku)</span>

                <span className="text-slate-500">Status Fisik:</span>
                <span className="font-bold text-emerald-700">DITERIMA & MASUK KARTU STOK</span>

                <span className="text-slate-500">Waktu Input:</span>
                <span className="font-mono text-slate-600">
                  {new Date(grn.createdAt).toLocaleTimeString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center border-r border-slate-300">No</th>
                  <th className="py-2.5 px-3 w-28 border-r border-slate-300">Kode Barang</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Nama Bahan Baku / Kemasan</th>
                  <th className="py-2.5 px-3 w-24 text-right border-r border-slate-300">Qty Pesanan</th>
                  <th className="py-2.5 px-3 w-24 text-right border-r border-slate-300 bg-blue-50/60 text-blue-950 font-black">
                    Qty Diterima
                  </th>
                  <th className="py-2.5 px-3 w-16 text-center border-r border-slate-300">Satuan</th>
                  <th className="py-2.5 px-3 w-36 text-right">Nilai Estimasi (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900 text-[11px]">
                {grn.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold">
                      {item.itemCode}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-semibold">
                      {item.itemName}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-mono text-slate-600">
                      {item.qtyOrdered.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-mono font-black text-blue-900 bg-blue-50/20">
                      {item.qtyReceived.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 text-slate-600">
                      {item.uom}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      Rp {item.subtotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-300 font-bold text-xs">
                <tr>
                  <td colSpan={6} className="py-2 px-3 text-right border-r border-slate-300 text-slate-700">
                    TOTAL NILAI FISIK BARANG DITERIMA:
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-black text-blue-900 text-sm">
                    Rp {grn.totalValue.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* QC Inspection Box */}
          <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-3.5 mb-6 text-xs space-y-1">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-700" />
              <span>Catatan Pemeriksaan Mutu & Timbangan Gudang:</span>
            </div>
            <p className="text-[11px] text-slate-700 italic">
              {grn.notes || 'Penerimaan fisik barang dalam kondisi baik, segel utuh, lolos uji mutu.'}
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-2 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="border border-slate-300 rounded-xl p-3 space-y-12">
              <div className="font-bold text-slate-700">Diserahkan Oleh:</div>
              <div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  ( .................................... )
                </div>
                <div className="text-[10px] text-slate-500">Sopir / Ekspedisi Vendor</div>
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 space-y-12">
              <div className="font-bold text-slate-700">Diperiksa Oleh:</div>
              <div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  ( .................................... )
                </div>
                <div className="text-[10px] text-slate-500">Quality Control (QC Tembakau)</div>
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 space-y-12">
              <div className="font-bold text-slate-700">Diterima Oleh:</div>
              <div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  ( .................................... )
                </div>
                <div className="text-[10px] text-slate-500">Kepala Gudang Bahan (WH-MATERIAL)</div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
            <div>{companySettings.footerText}</div>
            <div>Dicetak melalui Sistem SGW ONE Enterprise pada: {new Date().toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
