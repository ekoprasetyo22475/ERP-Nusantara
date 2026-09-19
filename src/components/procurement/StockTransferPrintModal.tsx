import React from 'react';
import { X, Printer, Building2, ArrowRightLeft, Truck, FileText } from 'lucide-react';
import { StockTransfer, CompanySettings } from '../../types/erp';

interface StockTransferPrintModalProps {
  transfer: StockTransfer | null;
  onClose: () => void;
  companySettings: CompanySettings;
}

export const StockTransferPrintModal: React.FC<StockTransferPrintModalProps> = ({
  transfer,
  onClose,
  companySettings,
}) => {
  if (!transfer) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:border-none print:shadow-none print:m-0 print:w-full">
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Pratinjau Surat Jalan Transfer Antar Gudang (SJT)
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
                <p className="text-[11px] font-bold text-blue-900">{companySettings.subTitle}</p>
                <p className="text-[10px] text-slate-600 max-w-md mt-0.5">{companySettings.address}</p>
                <div className="flex flex-wrap items-center gap-x-3 text-[10px] text-slate-500 mt-1 font-mono">
                  <span>NPWP: {companySettings.npwp}</span>
                  <span>NPPBKC: {companySettings.nppbkc}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-black text-xs uppercase tracking-wider">
                SURAT JALAN TRANSFER
              </div>
              <div className="text-base font-black font-mono text-slate-950 mt-1.5">
                {transfer.transferNumber}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Tanggal: <span className="font-bold text-slate-800">{transfer.transferDate}</span>
              </div>
            </div>
          </div>

          {/* Transfer Route & Logistics Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1.5 border-r border-slate-200 pr-4">
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Rute Pemindahan Persediaan
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded text-[10px]">
                  ASAL
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {transfer.originWarehouseName} ({transfer.originWarehouseCode})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                  TUJUAN
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {transfer.destinationWarehouseName} ({transfer.destinationWarehouseCode})
                </span>
              </div>
            </div>

            <div className="space-y-1 pl-2">
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Informasi Pengangkutan
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Armada / Nopol:</span>{' '}
                  <span className="font-mono font-bold text-slate-800">{transfer.vehicleNo || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Sopir / Angkut:</span>{' '}
                  <span className="font-bold text-slate-800">{transfer.driverName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Petugas Pengirim:</span>{' '}
                  <span className="font-bold text-slate-800">{transfer.dispatcherName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Penerima Tujuan:</span>{' '}
                  <span className="font-bold text-slate-800">{transfer.recipientName || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Items */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-300">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 w-28">Kode Barang</th>
                  <th className="py-2.5 px-3">Deskripsi Barang / Bahan</th>
                  <th className="py-2.5 px-3 text-right w-28">Kuantitas</th>
                  <th className="py-2.5 px-3 text-center w-16">Satuan</th>
                  <th className="py-2.5 px-3 text-right w-32">Harga Rata2 (HPP)</th>
                  <th className="py-2.5 px-3 text-right w-32">Total Nilai</th>
                  <th className="py-2.5 px-3 w-40">Catatan Penggunaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transfer.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {item.itemCode}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.itemName}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-950">
                      {item.qty.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                      {item.uom}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      Rp {item.unitCost.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-950">
                      Rp {item.totalCost.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      {item.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                  <td colSpan={3} className="py-2.5 px-3 text-right text-[11px] uppercase">
                    Total Kuantitas Fisik & Total Valuasi Mutasi:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-slate-950 text-sm">
                    {transfer.totalQty.toLocaleString()}
                  </td>
                  <td></td>
                  <td></td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-blue-950 text-sm">
                    Rp {transfer.totalValuation.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Document Notes */}
          {transfer.notes && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-700">
              <span className="font-bold text-slate-900">Keterangan / Memo:</span> {transfer.notes}
            </div>
          )}

          {/* Legal Instruction */}
          <div className="text-[10px] text-slate-500 italic border-l-2 border-blue-400 pl-3 py-1">
            * Barang yang tercantum pada surat jalan ini telah diperiksa kesesuaian fisik dan mutasinya telah dibukukan pada Kartu Stok Gudang kedua belah pihak secara sistematis.
          </div>

          {/* 4-Box Signatures: Dispatched, Approved, Transported, Received */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-slate-200 text-center">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Petugas Logistik</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-900 border-t border-slate-300 pt-1 text-xs">
                ( {transfer.dispatcherName || '....................'} )
              </div>
              <div className="text-[9px] text-slate-400">Pengirim Gudang Asal</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Kepala Gudang Asal</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-900 border-t border-slate-300 pt-1 text-xs">
                ( .................... )
              </div>
              <div className="text-[9px] text-slate-400">Pemberi Persetujuan</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Petugas Angkut / Sopir</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-900 border-t border-slate-300 pt-1 text-xs">
                ( {transfer.driverName || '....................'} )
              </div>
              <div className="text-[9px] text-slate-400">Pembawa Muatan</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Penerima Gudang Tujuan</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-900 border-t border-slate-300 pt-1 text-xs">
                ( {transfer.recipientName || '....................'} )
              </div>
              <div className="text-[9px] text-slate-400">Pemeriksa & Penerima Fisik</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
