import React from 'react';
import { X, Printer, Layers, FileText, CheckCircle2 } from 'lucide-react';
import { BOM, Item } from '../../types/erp';

interface BomPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bom: BOM | null;
  items: Item[];
}

export const BomPrintPreviewModal: React.FC<BomPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  bom,
  items,
}) => {
  if (!isOpen || !bom) return null;

  const handlePrint = () => {
    window.print();
  };

  const isGiling = bom.processStage === 'GILING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 space-y-6 border border-slate-200 my-6 print:border-none print:shadow-none print:p-0 print:my-0">
        {/* Actions bar (Hidden in Print) */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            <Printer className="w-5 h-5 text-amber-600" />
            <span>Preview Cetak — Lembar Spesifikasi Formula BOM ({bom.bomNumber})</span>
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
        <div className="space-y-6 text-slate-900" id="printable-bom">
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
                LEMBAR SPESIFIKASI FORMULA PRODUKSI (BOM)
              </div>
              <div className="text-slate-500 text-[11px]">
                No. Formula: <span className="font-mono font-bold text-slate-900">{bom.bomNumber}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Versi: <span className="font-bold text-slate-800">{bom.version}</span> • Tanggal Efektif: <span className="font-semibold text-slate-800">{bom.effectiveDate}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Status Dokumen: <span className="font-bold text-emerald-700">RESMI & TERVERIFIKASI</span>
              </div>
            </div>
          </div>

          {/* Product & Stage Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Tahapan Proses:</span>
              <span
                className={`font-black text-xs px-2 py-0.5 rounded inline-block mt-0.5 ${
                  isGiling ? 'bg-purple-100 text-purple-900' : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                {isGiling ? 'TIER 1 - GILING & GUNTING' : 'TIER 2 - PACKING & CUKAI'}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block text-[11px]">Produk Hasil Output:</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{bom.productName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Standar Batch Output:</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                {bom.standardOutputQty.toLocaleString()} {bom.standardOutputUom}
              </span>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="space-y-2">
            <div className="font-bold text-slate-800 text-xs uppercase tracking-wide">
              A. Rincian Kebutuhan Bahan Konsumsi per Batch:
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Kode Bahan</th>
                    <th className="py-2.5 px-3">Nama Bahan / Material</th>
                    <th className="py-2.5 px-3 text-right">Kebutuhan Netto</th>
                    <th className="py-2.5 px-3">Satuan</th>
                    <th className="py-2.5 px-3 text-right">Toleransi Scrap</th>
                    <th className="py-2.5 px-3 text-right">Kebutuhan Bruto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bom.components.map((comp, idx) => {
                    const gross = comp.quantity * (1 + comp.scrapPercentage / 100);
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{comp.itemCode}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{comp.itemName}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                          {comp.quantity.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-600">{comp.uom}</td>
                        <td className="py-2 px-3 text-right font-mono text-amber-700 font-semibold text-[11px]">
                          {comp.scrapPercentage}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {gross.toLocaleString(undefined, { maximumFractionDigits: 3 })} {comp.uom}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Standard Operating Conditions */}
          <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs space-y-1.5">
            <div className="font-bold text-amber-950">B. Instruksi Mutu & Toleransi Produksi SKT:</div>
            <ul className="list-disc list-inside text-[11px] text-amber-900 space-y-0.5">
              <li>Kadar air Tembakau Siap Giling (TSG) harus dijaga pada rentang 13.5% - 14.5% sebelum masuk ke meja giling.</li>
              <li>Pelekatan pita cukai wajib simetris di bagian atas bungkus sesuai regulasi PMK / Peraturan Dirjen Bea Cukai.</li>
              <li>Penyusutan bahan di atas toleransi scrap yang tercantum wajib dilaporkan dalam Berita Acara Susut Produksi.</li>
            </ul>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-8 pt-8 text-center text-xs border-t border-slate-200 mt-8">
            <div className="space-y-14">
              <div className="text-slate-600 font-medium">Disusun oleh RnD / PPIC</div>
              <div>
                <div className="font-bold text-slate-900 underline">Agus Prasetyo, S.TP</div>
                <div className="text-[10px] text-slate-500 font-mono">Formulator Produk & PPIC</div>
              </div>
            </div>

            <div className="space-y-14">
              <div className="text-slate-600 font-medium">Diperiksa oleh Quality Assurance</div>
              <div>
                <div className="font-bold text-slate-900 underline">Dewi Kusuma, S.Si</div>
                <div className="text-[10px] text-slate-500 font-mono">Kepala Pengendalian Mutu (QA)</div>
              </div>
            </div>

            <div className="space-y-14">
              <div className="text-slate-600 font-medium">Disetujui oleh Kepala Pabrik</div>
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
