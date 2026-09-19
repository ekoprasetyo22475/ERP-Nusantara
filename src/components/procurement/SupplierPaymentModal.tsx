import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { SupplierInvoice, ChartOfAccount } from '../../types/erp';

interface SupplierPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (
    invoiceId: string,
    amount: number,
    bankCode: string,
    referenceNo: string,
  ) => void;
  invoice: SupplierInvoice | null;
  bankAccounts: ChartOfAccount[];
}

export const SupplierPaymentModal: React.FC<SupplierPaymentModalProps> = ({
  isOpen,
  onClose,
  onPost,
  invoice,
  bankAccounts,
}) => {
  if (!isOpen || !invoice) return null;

  const remainingBalance = Math.max(0, invoice.total - invoice.paidAmount);

  const [amount, setAmount] = useState<number>(remainingBalance);
  const [bankCode, setBankCode] = useState<string>('1002'); // Default Bank BCA
  const [referenceNo, setReferenceNo] = useState<string>(
    `TRF-BCA-${Date.now().toString().slice(-5)}`,
  );

  const handleBankChange = (code: string) => {
    setBankCode(code);
    const prefix = code === '1001' ? 'BKK-KAS' : code === '1003' ? 'TRF-MDR' : 'TRF-BCA';
    setReferenceNo(`${prefix}-${Date.now().toString().slice(-5)}`);
  };

  const handlePayFull = () => {
    setAmount(remainingBalance);
  };

  const selectedBank = bankAccounts.find((b) => b.code === bankCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Jumlah pembayaran harus lebih besar dari 0!');
      return;
    }
    if (amount > remainingBalance) {
      alert(
        `Jumlah pembayaran (Rp ${amount.toLocaleString()}) melebihi sisa hutang (Rp ${remainingBalance.toLocaleString()})!`,
      );
      return;
    }
    if (!referenceNo.trim()) {
      alert('Nomor Referensi Pembayaran / Bukti Kas Keluar wajib diisi!');
      return;
    }

    onPost(invoice.id, amount, bankCode, referenceNo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                Pembayaran Hutang Usaha Supplier (Disbursement)
              </h3>
              <p className="text-xs text-slate-400">
                Pencairan Kas / Transfer Bank untuk Pelunasan Tagihan Pembelian Bahan Baku & Kemasan.
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Invoice Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
              RINCIAN TAGIHAN VENDOR
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
              <div>
                <span className="text-slate-500">No. Tagihan Sistem:</span>
                <span className="font-mono font-bold text-slate-900 ml-1.5">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Supplier:</span>
                <span className="font-bold text-slate-900 ml-1.5">{invoice.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-500">No. Faktur Vendor:</span>
                <span className="font-mono font-bold text-slate-800 ml-1.5">
                  {invoice.vendorInvoiceNo}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Jatuh Tempo:</span>
                <span className="font-medium text-slate-700 ml-1.5">{invoice.dueDate}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
              <span className="text-slate-600">Sisa Tagihan yang Belum Terbayar:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-rose-700 text-sm">
                  Rp {remainingBalance.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={handlePayFull}
                  className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded text-[10px] transition"
                >
                  Lunasi Penuh
                </button>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Jumlah Pembayaran (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={remainingBalance}
                step="any"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-black text-sm text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Rekening Sumber Pembayaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={bankCode}
                onChange={(e) => handleBankChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                required
              >
                {bankAccounts.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} - {b.name} (Saldo: Rp {b.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-slate-700 font-bold block mb-1">
                Nomor Referensi Transfer / Cek / Giro / Bukti Kas Keluar (BKK){' '}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="Contoh: TRF-BCA-99821 / CHQ-MDR-0012"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Nomor referensi bukti transfer bank atau nomor lembar cek pembayaran.
              </span>
            </div>
          </div>

          {/* Automatic Accounting Preview */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/80 text-[11px] space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>Simulasi Jurnal Pengeluaran Bank (Double-Entry Engine):</span>
            </div>
            <div className="font-mono text-slate-600 pl-5 space-y-0.5">
              <div>[Dr] 2001 Hutang Usaha (AP): Rp {amount.toLocaleString()}</div>
              <div>
                [Cr] {bankCode} {selectedBank?.name || 'Bank'}: Rp {amount.toLocaleString()}
              </div>
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
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition active:scale-98 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Proses Pengeluaran Kas & Bayar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
