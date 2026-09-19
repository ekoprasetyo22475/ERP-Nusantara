import React from 'react';
import { X, Printer, Building2, CreditCard } from 'lucide-react';
import { SupplierPayment, CompanySettings } from '../../types/erp';

interface PaymentVoucherPrintModalProps {
  payment: SupplierPayment | null;
  onClose: () => void;
  companySettings: CompanySettings;
}

export const PaymentVoucherPrintModal: React.FC<PaymentVoucherPrintModalProps> = ({
  payment,
  onClose,
  companySettings,
}) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:border-none print:shadow-none print:m-0 print:w-full">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Pratinjau Cetak Bukti Pengeluaran Kas / Bank (Payment Voucher)
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

        {/* Printable Document Paper Area */}
        <div className="p-8 md:p-10 font-sans text-slate-900 bg-white" id="printable-voucher">
          {/* Header Kop Surat Perusahaan */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-900 text-white flex items-center justify-center font-black text-sm">
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
              </div>
            </div>
          </div>

          {/* Document Title & Reference */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-black tracking-wider uppercase underline underline-offset-4 text-slate-950">
              BUKTI PENGELUARAN KAS / BANK
            </h2>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              PAYMENT VOUCHER (DISBURSEMENT)
            </div>
            <div className="text-xs font-mono font-bold text-emerald-900 mt-1">
              NOMOR VOUCHER: {payment.paymentNumber}
            </div>
          </div>

          {/* Payment Detail Grid */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/60 mb-6 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-y-2 text-[11px]">
              <div>
                <span className="text-slate-500">Dibayarkan Kepada:</span>
                <div className="font-bold text-sm text-slate-950 mt-0.5">{payment.supplierName}</div>
              </div>
              <div>
                <span className="text-slate-500">Tanggal Pembayaran:</span>
                <div className="font-bold text-slate-900 mt-0.5">{payment.paymentDate}</div>
              </div>
              <div>
                <span className="text-slate-500">Sumber Dana / Rekening:</span>
                <div className="font-bold text-slate-900 mt-0.5">{payment.bankAccountName}</div>
              </div>
              <div>
                <span className="text-slate-500">No. Referensi / Cek / BKK:</span>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{payment.referenceNo}</div>
              </div>
              <div className="col-span-2 border-t border-slate-200 pt-2">
                <span className="text-slate-500">Untuk Pembayaran Tagihan:</span>
                <div className="font-mono font-bold text-slate-900 mt-0.5">
                  Faktur Pembelian No. {payment.invoiceNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Amount Box */}
          <div className="border-2 border-emerald-600 bg-emerald-50/60 rounded-xl p-4 mb-6 text-center space-y-1">
            <div className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
              JUMLAH YANG DIBAYARKAN (NET PAYABLE)
            </div>
            <div className="text-2xl font-black font-mono text-emerald-950">
              Rp {payment.amountPaid.toLocaleString()}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-2 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="border border-slate-300 rounded-xl p-3 space-y-12">
              <div className="font-bold text-slate-700">Dibuat Oleh:</div>
              <div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  ( .................................... )
                </div>
                <div className="text-[10px] text-slate-500">Kasir / Treasury</div>
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 space-y-12">
              <div className="font-bold text-slate-700">Diperiksa Oleh:</div>
              <div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  ( .................................... )
                </div>
                <div className="text-[10px] text-slate-500">Akuntansi (Accounting)</div>
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
                <div className="text-[10px] text-slate-500">Direksi / Penanggung Jawab</div>
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
