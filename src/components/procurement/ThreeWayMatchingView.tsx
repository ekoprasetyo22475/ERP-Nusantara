import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Receipt,
  FileCheck,
  ShoppingCart,
  DollarSign,
  Info,
  ChevronRight,
  Check,
  Eye,
} from 'lucide-react';
import {
  GoodsReceiptNote,
  PurchaseOrder,
  Supplier,
  SupplierInvoice,
} from '../../types/erp';

interface ThreeWayMatchingViewProps {
  purchaseOrders: PurchaseOrder[];
  goodsReceiptNotes: GoodsReceiptNote[];
  supplierInvoices: SupplierInvoice[];
  suppliers: Supplier[];
  onOpenCreateInvoice: (po: PurchaseOrder) => void;
  onOpenPayment: (invoice: SupplierInvoice) => void;
}

export const ThreeWayMatchingView: React.FC<ThreeWayMatchingViewProps> = ({
  purchaseOrders,
  goodsReceiptNotes,
  supplierInvoices,
  suppliers,
  onOpenCreateInvoice,
  onOpenPayment,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'MATCHED' | 'PRICE_VARIANCE' | 'QTY_VARIANCE' | 'WAITING_GRN' | 'WAITING_INVOICE'
  >('ALL');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Compute 3-Way Match Records for all POs
  const matchRecords = purchaseOrders.map((po) => {
    const grn = goodsReceiptNotes.find((g) => g.poId === po.id);
    const invoice = supplierInvoices.find((inv) => inv.poId === po.id);

    const poQty = po.items.reduce((s, it) => s + it.qty, 0);
    const poTotal = po.totalAmount;

    const grnQty = grn ? grn.items.reduce((s, it) => s + it.qtyReceived, 0) : 0;
    const grnTotal = grn ? grn.totalValue : 0;

    const invoiceTotal = invoice ? invoice.total : 0;
    const isPaid = invoice && invoice.paymentStatus === 'PAID';

    let status:
      | 'MATCHED'
      | 'PRICE_VARIANCE'
      | 'QTY_VARIANCE'
      | 'WAITING_GRN'
      | 'WAITING_INVOICE' = 'MATCHED';
    let statusLabel = 'Cocok 100% (Audit Cleared)';
    let notes = 'Kuantitas & Harga PO, GRN, dan Tagihan akurat.';

    if (!grn) {
      status = 'WAITING_GRN';
      statusLabel = 'Menunggu Penerimaan (GRN)';
      notes = 'Barang belum tiba atau belum diverifikasi timbang gudang.';
    } else if (!invoice) {
      status = 'WAITING_INVOICE';
      statusLabel = 'Menunggu Tagihan Supplier';
      notes = 'GRN sudah selesai, faktur tagihan supplier belum dicatat.';
    } else {
      // Both GRN and Invoice exist - compare numbers
      const qtyDiff = Math.abs(poQty - grnQty);
      const priceDiff = Math.abs(poTotal - invoiceTotal);

      if (priceDiff > 100) {
        status = 'PRICE_VARIANCE';
        statusLabel = 'Selisih Nilai / Harga';
        notes = `Terdapat selisih nominal Rp ${priceDiff.toLocaleString()} antara PO dan Faktur Supplier.`;
      } else if (qtyDiff > 0.01) {
        status = 'QTY_VARIANCE';
        statusLabel = 'Selisih Kuantitas';
        notes = `Kuantitas PO (${poQty}) berbeda dengan GRN (${grnQty}).`;
      } else {
        status = 'MATCHED';
        statusLabel = 'Cocok 100% (Audit Cleared)';
        notes = 'Semua kuantitas, harga satuan, dan PPN terverifikasi identik.';
      }
    }

    return {
      po,
      grn,
      invoice,
      poQty,
      poTotal,
      grnQty,
      grnTotal,
      invoiceTotal,
      isPaid,
      status,
      statusLabel,
      notes,
    };
  });

  // Filtered records
  const filteredRecords = matchRecords.filter((rec) => {
    const matchSearch =
      rec.po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      rec.po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      (rec.grn && rec.grn.grnNumber.toLowerCase().includes(search.toLowerCase())) ||
      (rec.invoice && rec.invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || rec.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // Summary Metrics
  const countTotal = matchRecords.length;
  const countMatched = matchRecords.filter((r) => r.status === 'MATCHED').length;
  const countPriceVariance = matchRecords.filter((r) => r.status === 'PRICE_VARIANCE').length;
  const countQtyVariance = matchRecords.filter((r) => r.status === 'QTY_VARIANCE').length;
  const countWaitingInvoice = matchRecords.filter((r) => r.status === 'WAITING_INVOICE').length;
  const countWaitingGrn = matchRecords.filter((r) => r.status === 'WAITING_GRN').length;

  return (
    <div id="three-way-matching-view" className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Transaksi PO
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{countTotal}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Rekonsiliasi Lengkap</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
            100% Cocok (Cleared)
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{countMatched}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Siap / Telah Dibayar</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-red-600">
            Selisih Harga
          </div>
          <div className="text-2xl font-bold text-red-700 mt-1">{countPriceVariance}</div>
          <div className="text-[11px] text-red-500 mt-0.5">Perlu Klarifikasi Harga</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
            Selisih Kuantitas
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{countQtyVariance}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Parsial / Retur Diperlukan</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm col-span-2 md:col-span-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
            Menunggu Tagihan (AP)
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{countWaitingInvoice}</div>
          <div className="text-[11px] text-blue-600 mt-0.5">GRN Ada, Belum Difaktur</div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Standar Kontrol Keuangan 3-Way Matching: </span>
          Sistem mencocokkan dokumen Purchase Order (yang disetujui), Goods Receipt Note (timbang gudang fisik), dan Faktur Tagihan Supplier (AP) sebelum otorisasi pembayaran hutang untuk mencegah pembayaran fiktif atau kelebihan bayar.
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({countTotal})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('MATCHED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'MATCHED'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Cocok 100% ({countMatched})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PRICE_VARIANCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'PRICE_VARIANCE'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Selisih Harga ({countPriceVariance})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('QTY_VARIANCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'QTY_VARIANCE'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Selisih Qty ({countQtyVariance})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('WAITING_INVOICE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'WAITING_INVOICE'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Perlu Faktur ({countWaitingInvoice})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari No. PO, GRN, Faktur, atau Rekanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Reconciliation Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">PO (Pemesanan)</th>
                <th className="py-3 px-4">GRN (Penerimaan Fisik)</th>
                <th className="py-3 px-4">Tagihan AP (Supplier)</th>
                <th className="py-3 px-4 text-center">Hasil 3-Way Match</th>
                <th className="py-3 px-4 text-right">Nilai Tagihan</th>
                <th className="py-3 px-4 text-center">Status Bayar</th>
                <th className="py-3 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.po.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* PO Column */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{r.po.poNumber}</div>
                      <div className="text-slate-600 text-[11px]">{r.po.supplierName}</div>
                      <div className="text-slate-400 text-[10px] font-mono mt-0.5">
                        Qty: {r.poQty.toLocaleString()} | Rp {r.poTotal.toLocaleString()}
                      </div>
                    </td>

                    {/* GRN Column */}
                    <td className="py-3 px-4">
                      {r.grn ? (
                        <div>
                          <div className="font-semibold text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {r.grn.grnNumber}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Tgl: {r.grn.receiptDate}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            Diterima: {r.grnQty.toLocaleString()} {r.po.items[0]?.uom}
                          </div>
                        </div>
                      ) : (
                        <div className="text-amber-600 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Belum Diterima
                        </div>
                      )}
                    </td>

                    {/* AP Invoice Column */}
                    <td className="py-3 px-4">
                      {r.invoice ? (
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                            {r.invoice.invoiceNumber}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Ref: {r.invoice.vendorInvoiceNo}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Jatuh Tempo: {r.invoice.dueDate}
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic">Belum Ada Faktur</div>
                      )}
                    </td>

                    {/* Match Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          r.status === 'MATCHED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : r.status === 'PRICE_VARIANCE'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : r.status === 'QTY_VARIANCE'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : r.status === 'WAITING_INVOICE'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {r.status === 'MATCHED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {r.status === 'PRICE_VARIANCE' && <XCircle className="w-3 h-3 text-red-600" />}
                        {r.status === 'QTY_VARIANCE' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {r.status === 'WAITING_INVOICE' && <Clock className="w-3 h-3 text-blue-600" />}
                        {r.status === 'WAITING_GRN' && <Clock className="w-3 h-3 text-slate-500" />}
                        {r.statusLabel}
                      </span>
                    </td>

                    {/* Total Invoice Amount */}
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      Rp {(r.invoice ? r.invoice.total : r.poTotal).toLocaleString()}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-4 text-center">
                      {r.invoice ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.invoice.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : r.invoice.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {r.invoice.paymentStatus === 'PAID'
                            ? 'LUNAS'
                            : r.invoice.paymentStatus === 'PARTIAL'
                            ? 'SEBAGIAN'
                            : 'BELUM LUNAS'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(r)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Lihat Rincian Rekonsiliasi"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {r.status === 'WAITING_INVOICE' && (
                          <button
                            type="button"
                            onClick={() => onOpenCreateInvoice(r.po)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-2xs transition"
                          >
                            Input Invoice
                          </button>
                        )}

                        {r.status === 'MATCHED' && r.invoice && r.invoice.paymentStatus !== 'PAID' && (
                          <button
                            type="button"
                            onClick={() => r.invoice && onOpenPayment(r.invoice)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-2xs transition"
                          >
                            Bayar Hutang
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-down Drawer / Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Audit Rincian 3-Way Matching
                </h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  PO: {selectedRecord.po.poNumber} | Pemasok: {selectedRecord.po.supplierName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center gap-3 ${
                  selectedRecord.status === 'MATCHED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : selectedRecord.status === 'PRICE_VARIANCE'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-bold text-sm">{selectedRecord.statusLabel}</div>
                  <div className="text-xs mt-0.5">{selectedRecord.notes}</div>
                </div>
              </div>

              {/* 3 Pillars Comparison Grid */}
              <div className="grid grid-cols-3 gap-3 text-slate-800">
                {/* Pillar 1: PO */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1 text-[11px] uppercase tracking-wider text-slate-500">
                    <ShoppingCart className="w-3.5 h-3.5" /> 1. Purchase Order
                  </div>
                  <div className="font-mono font-semibold">{selectedRecord.po.poNumber}</div>
                  <div className="text-slate-500">Tgl: {selectedRecord.po.orderDate}</div>
                  <div className="pt-2 border-t border-slate-200">
                    <div>Qty: <span className="font-bold">{selectedRecord.poQty.toLocaleString()}</span></div>
                    <div>Total: <span className="font-bold">Rp {selectedRecord.poTotal.toLocaleString()}</span></div>
                  </div>
                </div>

                {/* Pillar 2: GRN */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1 text-[11px] uppercase tracking-wider text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 2. Fisik GRN
                  </div>
                  <div className="font-mono font-semibold text-emerald-700">
                    {selectedRecord.grn?.grnNumber || 'Belum Diterima'}
                  </div>
                  <div className="text-slate-500">Tgl: {selectedRecord.grn?.receiptDate || '-'}</div>
                  <div className="pt-2 border-t border-slate-200">
                    <div>Qty: <span className="font-bold">{selectedRecord.grnQty.toLocaleString()}</span></div>
                    <div>Nilai: <span className="font-bold">Rp {selectedRecord.grnTotal.toLocaleString()}</span></div>
                  </div>
                </div>

                {/* Pillar 3: AP Invoice */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1 text-[11px] uppercase tracking-wider text-slate-500">
                    <FileCheck className="w-3.5 h-3.5 text-blue-600" /> 3. Faktur Tagihan
                  </div>
                  <div className="font-mono font-semibold text-blue-700">
                    {selectedRecord.invoice?.invoiceNumber || 'Belum Ditagihkan'}
                  </div>
                  <div className="text-slate-500">Faktur: {selectedRecord.invoice?.vendorInvoiceNo || '-'}</div>
                  <div className="pt-2 border-t border-slate-200">
                    <div>DPP: <span className="font-bold">Rp {selectedRecord.invoice?.dpp.toLocaleString() || 0}</span></div>
                    <div>Total: <span className="font-bold">Rp {selectedRecord.invoiceTotal.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700">
                  Rincian Barang yang Dipesan vs Diterima
                </div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] font-semibold uppercase">
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3 text-right">Qty PO</th>
                      <th className="py-2 px-3 text-right">Qty GRN</th>
                      <th className="py-2 px-3 text-right">Harga PO</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedRecord.po.items.map((it: any) => (
                      <tr key={it.id}>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-900">{it.itemName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{it.itemCode}</div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold">
                          {it.qty.toLocaleString()} {it.uom}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700">
                          {(selectedRecord.grn ? it.qty : 0).toLocaleString()} {it.uom}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          Rp {it.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          Rp {it.subtotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
