import React from 'react';
import { X, Printer, Building2, Package, CheckCircle2 } from 'lucide-react';
import { PurchaseOrder, CompanySettings, Supplier } from '../../types/erp';

interface PoPrintModalProps {
  po: PurchaseOrder | null;
  onClose: () => void;
  companySettings: CompanySettings;
  supplier?: Supplier;
}

export const PoPrintModal: React.FC<PoPrintModalProps> = ({
  po,
  onClose,
  companySettings,
  supplier,
}) => {
  if (!po) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:border-none print:shadow-none print:m-0 print:w-full">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Pratinjau Cetak Lembar Purchase Order Resmi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg shadow-sm flex items-center gap-1.5 transition"
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
        <div className="p-8 md:p-10 font-sans text-slate-900 bg-white" id="printable-po">
          {/* Header Kop Surat Perusahaan */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
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
              SURAT PESANAN PEMBELIAN (PURCHASE ORDER)
            </h2>
            <div className="text-xs font-mono font-bold text-slate-700 mt-1">
              NOMOR: {po.poNumber}
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
            {/* Left: Supplier Info */}
            <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50/60 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                DITUJUKAN KEPADA REKANAN (SUPPLIER)
              </div>
              <div className="font-bold text-sm text-slate-900">{po.supplierName}</div>
              {supplier && (
                <>
                  <div className="text-[11px] text-slate-600">{supplier.address}</div>
                  <div className="text-[11px] text-slate-600">
                    NPWP: <span className="font-mono font-semibold">{supplier.npwp}</span> | Telp:{' '}
                    {supplier.phone}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Syarat Pembayaran (TOP): <strong>{supplier.paymentTermDays} Hari</strong>
                  </div>
                </>
              )}
            </div>

            {/* Right: PO Details */}
            <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50/60 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                RINCIAN PESANAN & PENGIRIMAN
              </div>
              <div className="grid grid-cols-2 gap-y-1 text-[11px]">
                <span className="text-slate-500">Tanggal Pesanan:</span>
                <span className="font-bold text-slate-900">{po.orderDate}</span>

                <span className="text-slate-500">Estimasi Tiba:</span>
                <span className="font-bold text-slate-900">{po.expectedDate}</span>

                <span className="text-slate-500">Gudang Penerima:</span>
                <span className="font-bold text-slate-900">WH-MATERIAL (Gudang Bahan Baku)</span>

                <span className="text-slate-500">Status Dokumen:</span>
                <span className="font-mono font-black text-emerald-700">{po.status}</span>
              </div>
            </div>
          </div>

          {/* Item Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center border-r border-slate-300">No</th>
                  <th className="py-2.5 px-3 w-28 border-r border-slate-300">Kode Barang</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Nama Barang & Spesifikasi</th>
                  <th className="py-2.5 px-3 w-24 text-right border-r border-slate-300">Kuantitas</th>
                  <th className="py-2.5 px-3 w-16 text-center border-r border-slate-300">Satuan</th>
                  <th className="py-2.5 px-3 w-32 text-right border-r border-slate-300">
                    Harga Satuan (Rp)
                  </th>
                  <th className="py-2.5 px-3 w-36 text-right">Subtotal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900 text-[11px]">
                {po.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="py-2 px-3 text-center border-r border-slate-200 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold">
                      {item.itemCode}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold">
                      {item.itemName}
                    </td>
                    <td className="py-2 px-3 text-right border-r border-slate-200 font-mono font-bold">
                      {item.qty.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-slate-200 text-slate-600">
                      {item.uom}
                    </td>
                    <td className="py-2 px-3 text-right border-r border-slate-200 font-mono">
                      Rp {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      Rp {item.subtotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-300 font-bold text-xs">
                <tr>
                  <td colSpan={5} rowSpan={3} className="p-3 align-top border-r border-slate-300">
                    <div className="text-[10px] text-slate-500 uppercase font-black mb-0.5">
                      Catatan / Instruksi Pengiriman:
                    </div>
                    <p className="text-[11px] text-slate-700 italic">
                      {po.notes ||
                        'Barang wajib dilampiri Surat Jalan Asli bermaterai/berstempel. Pengujian kadar air tembakau maksimal 14% di laboratorium uji pabrik.'}
                    </p>
                  </td>
                  <td className="py-1.5 px-3 text-right border-r border-slate-300 text-slate-600">
                    Subtotal DPP:
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-900">
                    Rp {po.subtotal.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-right border-r border-slate-300 text-slate-600">
                    PPN Masukan ({po.ppnRate}%):
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-900">
                    Rp {po.ppnAmount.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-amber-50/70 border-t border-slate-300">
                  <td className="py-2 px-3 text-right border-r border-slate-300 text-slate-950 font-black">
                    TOTAL NILAI PO:
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-black text-amber-800 text-sm">
                    Rp {po.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-4 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="border border-slate-300 rounded-xl p-3 space-y-12">
              <div className="font-bold text-slate-700">Dibuat Oleh:</div>
              <div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  ( .................................... )
                </div>
                <div className="text-[10px] text-slate-500">Bagian Pengadaan (Purchasing)</div>
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 space-y-12">
              <div className="font-bold text-slate-700">Disetujui Oleh:</div>
              <div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  {companySettings.directorName
                    ? companySettings.directorName
                    : '( .................................... )'}
                </div>
                <div className="text-[10px] text-slate-500">
                  Penanggung Jawab Pabrik / NPPBKC
                </div>
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 space-y-12">
              <div className="font-bold text-slate-700">Dikonfirmasi Supplier:</div>
              <div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  ( .................................... )
                </div>
                <div className="text-[10px] text-slate-500">{po.supplierName}</div>
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
