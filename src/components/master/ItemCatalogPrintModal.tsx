import React from 'react';
import { X, Printer, FileSpreadsheet, Building2, Calendar, CheckCircle2 } from 'lucide-react';
import { Item } from '../../types/erp';

interface ItemCatalogPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  categoryFilter: string;
}

export const ItemCatalogPrintModal: React.FC<ItemCatalogPrintModalProps> = ({
  isOpen,
  onClose,
  items,
  categoryFilter,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 space-y-6 border border-slate-200 my-6 print:border-none print:shadow-none print:p-0 print:my-0">
        {/* Controls - Hidden on Print */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            <Printer className="w-5 h-5 text-amber-600" />
            <span>Preview Cetak — Lembar Katalog Master Barang & Material</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-6 text-slate-900" id="printable-catalog">
          {/* Header Kop Surat Pabrik */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-black text-sm">
                  SGW
                </div>
                <h1 className="text-lg font-black tracking-tight text-slate-900">
                  PT SGW ONE NUSANTARA
                </h1>
              </div>
              <p className="text-xs text-slate-600">
                Pabrik Sigaret Kretek Tangan (SKT) Golongan III B • NPPBKC: 0601.1.3.00892
              </p>
              <p className="text-[11px] text-slate-500">
                Kawasan Industri Hasil Tembakau (KIHT), Kudus, Jawa Tengah • Telp: (0291) 438812
              </p>
            </div>
            <div className="text-right space-y-1 text-xs">
              <div className="font-bold text-slate-800 uppercase tracking-wide">
                Daftar Katalog Master Barang
              </div>
              <div className="text-[11px] text-slate-500">
                Tanggal Cetak: <span className="font-semibold text-slate-800">{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Kategori: <span className="font-semibold text-slate-800">{categoryFilter === 'ALL' ? 'Semua Material' : categoryFilter}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Total Record: <span className="font-bold text-slate-900">{items.length} Item</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100/90 text-slate-800 font-bold uppercase text-[10px]">
                  <th className="py-2 px-2.5">No</th>
                  <th className="py-2 px-2.5">Kode Item</th>
                  <th className="py-2 px-2.5">Nama Barang & Merek</th>
                  <th className="py-2 px-2.5">Kategori</th>
                  <th className="py-2 px-2.5">Satuan Stok</th>
                  <th className="py-2 px-2.5">Satuan Beli / Konversi</th>
                  <th className="py-2 px-2.5 text-right">Standard Cost</th>
                  <th className="py-2 px-2.5 text-right">Ambang Min/Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2 px-2.5 text-slate-500 font-mono text-[11px]">{index + 1}</td>
                    <td className="py-2 px-2.5 font-mono font-bold text-slate-900">{item.itemCode}</td>
                    <td className="py-2 px-2.5">
                      <div className="font-bold text-slate-900">{item.itemName}</div>
                      {item.brand && <div className="text-[10px] text-amber-800">{item.brand}</div>}
                    </td>
                    <td className="py-2 px-2.5 text-slate-700 text-[11px]">
                      {item.itemType.replace('_', ' ')}
                    </td>
                    <td className="py-2 px-2.5 font-bold text-slate-800">{item.stockUom}</td>
                    <td className="py-2 px-2.5 text-slate-600 text-[11px]">
                      {item.purchaseUom !== item.stockUom
                        ? `1 ${item.purchaseUom} = ${item.conversionFactor} ${item.stockUom}`
                        : item.purchaseUom}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                      Rp {item.standardCost.toLocaleString()}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-slate-600 text-[11px]">
                      {item.minStock} / {item.maxStock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature & Approval Block */}
          <div className="grid grid-cols-3 gap-8 pt-8 text-center text-xs border-t border-slate-200 mt-8">
            <div className="space-y-14">
              <div className="text-slate-600 font-medium">Petugas Master Data / Gudang</div>
              <div>
                <div className="font-bold text-slate-900 underline">Budi Santoso</div>
                <div className="text-[10px] text-slate-500 font-mono">Bagian Administrasi Logistik</div>
              </div>
            </div>

            <div className="space-y-14">
              <div className="text-slate-600 font-medium">Diperiksa oleh QA / PPIC</div>
              <div>
                <div className="font-bold text-slate-900 underline">Siti Rahayu, S.T.</div>
                <div className="text-[10px] text-slate-500 font-mono">Kepala PPIC & Formula</div>
              </div>
            </div>

            <div className="space-y-14">
              <div className="text-slate-600 font-medium">Mengetahui & Menyetujui</div>
              <div>
                <div className="font-bold text-slate-900 underline">Ir. H. Gunawan Wibowo</div>
                <div className="text-[10px] text-slate-500 font-mono">Kepala Pabrik (Factory Manager)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
