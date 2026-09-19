import React, { useState } from 'react';
import {
  X,
  Receipt,
  FileCheck,
  Calendar,
  Building,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { PurchaseOrder, GoodsReceiptNote } from '../../types/erp';

interface SupplierInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (
    poId: string,
    vendorInvoiceNo: string,
    fakturPajakNumber?: string,
  ) => void;
  po: PurchaseOrder | null;
  grn?: GoodsReceiptNote | null;
}

export const SupplierInvoiceModal: React.FC<SupplierInvoiceModalProps> = ({
  isOpen,
  onClose,
  onPost,
  po,
  grn,
}) => {
  if (!isOpen || !po) return null;

  const [vendorInvoiceNo, setVendorInvoiceNo] = useState<string>(
    `INV/${po.supplierName.substring(0, 3).toUpperCase()}/2026/${Date.now().toString().slice(-4)}`,
  );
  const [fakturPajakNumber, setFakturPajakNumber] = useState<string>(
    `010.000-26.${Math.floor(10000000 + Math.random() * 90000000)}`,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorInvoiceNo.trim()) {
      alert('Nomor Faktur Komersial Vendor wajib diisi!');
      return;
    }

    onPost(po.id, vendorInvoiceNo, fakturPajakNumber || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-slate-950">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                Pencatatan Tagihan Supplier (AP Invoice)
              </h3>
              <p className="text-xs text-slate-400">
                Verifikasi Dokumen Penagihan Vendor, Faktur Pajak Masukan (e-Faktur), dan Pengakuan Hutang Usaha.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* PO & GRN Match Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
              DOKUMEN DASAR PENAGIHAN (3-WAY MATCHING)
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
              <div>
                <span className="text-slate-500">Nomor PO Acuan:</span>
                <span className="font-mono font-bold text-slate-900 ml-1.5">{po.poNumber}</span>
              </div>
              <div>
                <span className="text-slate-500">Supplier:</span>
                <span className="font-bold text-slate-900 ml-1.5">{po.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-500">Bukti Terima GRN:</span>
                <span className="font-mono font-bold text-blue-700 ml-1.5">
                  {grn ? grn.grnNumber : 'Tersedia di Sistem'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Surat Jalan:</span>
                <span className="font-mono text-slate-800 ml-1.5">
                  {grn ? grn.vendorDeliveryRef : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Nomor Faktur / Invoice Supplier <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={vendorInvoiceNo}
                onChange={(e) => setVendorInvoiceNo(e.target.value)}
                placeholder="Contoh: INV/TEM/2026/089"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Nomor invoice resmi yang tercetak dari rekanan.
              </span>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Nomor Faktur Pajak Masukan (e-Faktur)
              </label>
              <input
                type="text"
                value={fakturPajakNumber}
                onChange={(e) => setFakturPajakNumber(e.target.value)}
                placeholder="010.000-26.XXXXXXXX"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Kode 010 (Penyerahan BKP) untuk SPT Masa PPN 1111.
              </span>
            </div>
          </div>

          {/* Value Breakdown */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span>Dasar Pengenaan Pajak (DPP):</span>
              <span className="font-mono font-bold text-slate-900">
                Rp {po.subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>PPN Masukan ({po.ppnRate}%):</span>
              <span className="font-mono font-bold text-slate-900">
                Rp {po.ppnAmount.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-emerald-200 pt-2 flex justify-between items-center font-black text-sm text-slate-950">
              <span>Total Tagihan Hutang Usaha (AP):</span>
              <span className="text-emerald-800 font-mono text-base">
                Rp {po.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Automatic Accounting Preview */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/80 text-[11px] space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>Simulasi Jurnal Otomatis (Double-Entry Engine):</span>
            </div>
            <div className="font-mono text-slate-600 pl-5 space-y-0.5">
              <div>[Dr] 1201 Persediaan Bahan Baku & Kemasan: Rp {po.subtotal.toLocaleString()}</div>
              <div>[Dr] 1151 PPN Masukan (Input VAT): Rp {po.ppnAmount.toLocaleString()}</div>
              <div>[Cr] 2001 Hutang Usaha (AP): Rp {po.totalAmount.toLocaleString()}</div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition active:scale-98 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Posting Faktur & Bentuk Hutang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
