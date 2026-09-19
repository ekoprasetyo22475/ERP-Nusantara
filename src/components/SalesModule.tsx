// Sales & Distribution Module: Sales Invoices, Delivery Orders, Customer Payments, AR Aging
import React, { useState } from 'react';
import {
  ShoppingCart,
  Receipt,
  FileCheck,
  CheckCircle2,
  DollarSign,
  Plus,
  Truck,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { dbService } from '../services/mockDatabase';
import { SalesInvoice } from '../types/erp';

export const SalesModule: React.FC = () => {
  const [subTab, setSubTab] = useState<'invoices' | 'payments' | 'delivery' | 'ar_aging'>('invoices');
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);

  // Form states for new invoice
  const [customerId, setCustomerId] = useState('');
  const [paymentType, setPaymentType] = useState<'CASH' | 'CREDIT'>('CREDIT');
  const [selectedItemId, setSelectedItemId] = useState('item-fg-kng12');
  const [orderQty, setOrderQty] = useState(2000);
  const [unitPrice, setUnitPrice] = useState(16500);
  const [invoiceNotes, setInvoiceNotes] = useState('Pengiriman ke Gudang Distributor');

  const [refreshKey, setRefreshKey] = useState(0);
  const state = dbService.getState();

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const custId = customerId || state.customers[0]?.id;
    if (!custId) {
      alert('Pelanggan belum dipilih!');
      return;
    }

    try {
      dbService.createSalesInvoice(
        custId,
        paymentType,
        [{ itemId: selectedItemId, qty: orderQty, unitPrice }],
        invoiceNotes,
      );
      setShowNewInvoiceModal(false);
      setRefreshKey((k) => k + 1);
      alert('Faktur Penjualan & DO berhasil dibuat! Stok Produk Jadi di WH-FG telah berkurang dan Jurnal Penjualan + HPP telah tercatat otomatis.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReceivePayment = (inv: SalesInvoice) => {
    const unPaid = inv.totalAmount - inv.paidAmount;
    const amount = Number(prompt(`Penerimaan Pembayaran dari ${inv.customerName} (Sisa Piutang: Rp ${unPaid.toLocaleString()}):`, String(unPaid)));
    if (!amount || amount <= 0) return;

    try {
      dbService.postCustomerPayment(inv.id, amount, '1002', `TRF-BCA-${Date.now().toString().slice(-5)}`);
      setRefreshKey((k) => k + 1);
      alert('Pembayaran piutang berhasil dicatat! Saldo bank dan piutang telah diperbarui.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-600" /> Penjualan & Distribusi Hasil Tembakau
          </h2>
          <p className="text-xs text-slate-500">
            Faktur Penjualan Hasil Tembakau, Surat Jalan (DO), Pengurangan Stok WH-FG, Pencatatan HPP, PPN Keluaran, dan Pelunasan Piutang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewInvoiceModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> Buat Faktur Penjualan Baru
          </button>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold w-fit">
        <button
          onClick={() => setSubTab('invoices')}
          className={`px-3 py-1.5 rounded-md transition ${
            subTab === 'invoices' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Faktur Penjualan ({state.salesInvoices.length})
        </button>
        <button
          onClick={() => setSubTab('payments')}
          className={`px-3 py-1.5 rounded-md transition ${
            subTab === 'payments' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Penerimaan Piutang ({state.customerPayments.length})
        </button>
        <button
          onClick={() => setSubTab('delivery')}
          className={`px-3 py-1.5 rounded-md transition ${
            subTab === 'delivery' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Surat Jalan / Delivery Order (DO)
        </button>
      </div>

      {/* SUBTAB 1: INVOICES */}
      {subTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">No. Faktur</th>
                <th className="py-2.5 px-3">Tanggal / Tempo</th>
                <th className="py-2.5 px-3">Pelanggan (Distributor)</th>
                <th className="py-2.5 px-3">Item Rokok Terjual</th>
                <th className="py-2.5 px-3 text-right">DPP Penjualan</th>
                <th className="py-2.5 px-3 text-right">PPN Keluaran (11%)</th>
                <th className="py-2.5 px-3 text-right">Total Tagihan</th>
                <th className="py-2.5 px-3 text-right">Terbayar</th>
                <th className="py-2.5 px-3 text-center">Status Piutang</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.salesInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <div>{inv.invoiceDate}</div>
                    <div className="text-[10px] text-slate-400">Tempo: {inv.dueDate}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{inv.customerName}</div>
                    <div className="text-[10px] font-mono text-slate-500">{inv.customerNpwp || '-'}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    {inv.items.map((it, idx) => (
                      <div key={idx} className="text-slate-700">
                        {it.itemName}: {it.qty.toLocaleString()} {it.uom}
                      </div>
                    ))}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    Rp {inv.dpp.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-blue-700">
                    Rp {inv.ppn.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    Rp {inv.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                    Rp {inv.paidAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {inv.paymentStatus !== 'PAID' ? (
                      <button
                        onClick={() => handleReceivePayment(inv)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition"
                      >
                        Terima Bayar
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 2: PAYMENTS */}
      {subTab === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">No. Bukti Kas Masuk</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Ref. Faktur</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3">Rekening Bank</th>
                <th className="py-2.5 px-3 text-right">Jumlah Diterima</th>
                <th className="py-2.5 px-3">Ref. Transfer / Setoran</th>
                <th className="py-2.5 px-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.customerPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.paymentNumber}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.paymentDate}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">{p.invoiceNumber}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{p.customerName}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{p.bankAccountName}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                    Rp {p.amountPaid.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{p.referenceNo}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{p.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 3: DELIVERY ORDERS */}
      {subTab === 'delivery' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">No. Surat Jalan (DO)</th>
                <th className="py-2.5 px-3">Tanggal Kirim</th>
                <th className="py-2.5 px-3">Ref. Faktur</th>
                <th className="py-2.5 px-3">Tujuan Pengiriman</th>
                <th className="py-2.5 px-3">Rincian Muatan Rokok</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.salesInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{inv.deliveryOrderNo}</td>
                  <td className="py-2.5 px-3 text-slate-600">{inv.invoiceDate}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{inv.customerName}</td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {inv.items.map((it, idx) => (
                      <span key={idx} className="font-medium">
                        {it.itemName} ({it.qty.toLocaleString()} Bungkus)
                      </span>
                    ))}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      DELIVERED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: NEW SALES INVOICE */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Buat Faktur Penjualan Hasil Tembakau</h3>
            <p className="text-xs text-slate-500 mb-4">
              Barang akan langsung dikurangkan dari Gudang Produk Jadi (WH-FG) dan dicatat HPP-nya.
            </p>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pelanggan / Distributor</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  required
                >
                  {state.customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Term: {c.paymentTermDays} Hari, Limit: Rp {c.creditLimit.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Pembayaran</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="CREDIT">KREDIT (Term Sesuai Rekanan)</option>
                    <option value="CASH">TUNAI / TRANSFER LANGSUNG</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Produk Jadi (WH-FG)</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => {
                      setSelectedItemId(e.target.value);
                      if (e.target.value.includes('16')) setUnitPrice(22000);
                      else setUnitPrice(16500);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium"
                    required
                  >
                    {state.items
                      .filter((i) => i.itemType === 'FINISHED_GOODS')
                      .map((fg) => {
                        const stock = state.stockInventory.find((s) => s.itemId === fg.id && s.warehouseCode === 'WH-FG');
                        return (
                          <option key={fg.id} value={fg.id}>
                            {fg.itemName} (Stok: {stock ? stock.qty.toLocaleString() : 0} Bungkus)
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kuantitas Penjualan (Bungkus)</label>
                  <input
                    type="number"
                    min="1"
                    value={orderQty}
                    onChange={(e) => setOrderQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Satuan DPP (Rp/Bungkus)</label>
                  <input
                    type="number"
                    min="1"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 space-y-1">
                <div className="flex justify-between font-medium text-slate-700">
                  <span>Subtotal DPP:</span>
                  <span className="font-mono">Rp {(orderQty * unitPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-700">
                  <span>PPN Keluaran 11%:</span>
                  <span className="font-mono text-blue-700">
                    Rp {Math.round((orderQty * unitPrice * 0.11)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-emerald-200 pt-1 text-sm">
                  <span>Total Tagihan Faktur:</span>
                  <span className="font-mono text-emerald-800">
                    Rp {Math.round((orderQty * unitPrice * 1.11)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Dokumen DO</label>
                <input
                  type="text"
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                >
                  Posting Faktur & Rilis DO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
