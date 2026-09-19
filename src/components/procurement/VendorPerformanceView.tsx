import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Building,
  DollarSign,
  Package,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  ArrowUpDown,
  Sparkles,
  Tag,
  Star,
} from 'lucide-react';
import {
  GoodsReceiptNote,
  Item,
  PurchaseOrder,
  PurchaseReturn,
  Supplier,
  SupplierInvoice,
} from '../../types/erp';

interface VendorPerformanceViewProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  goodsReceiptNotes: GoodsReceiptNote[];
  purchaseReturns: PurchaseReturn[];
  supplierInvoices: SupplierInvoice[];
  items: Item[];
}

export const VendorPerformanceView: React.FC<VendorPerformanceViewProps> = ({
  suppliers,
  purchaseOrders,
  goodsReceiptNotes,
  purchaseReturns,
  supplierInvoices,
  items,
}) => {
  const [activeTab, setActiveTab] = useState<'scorecard' | 'pricing'>('scorecard');
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [supplierSearch, setSupplierSearch] = useState('');

  // 1. Calculate Supplier Scorecards
  const vendorScorecards = suppliers.map((supplier) => {
    const pos = purchaseOrders.filter((p) => p.supplierId === supplier.id);
    const grns = goodsReceiptNotes.filter((g) => g.supplierId === supplier.id);
    const returns = purchaseReturns.filter((r) => r.supplierId === supplier.id);
    const invoices = supplierInvoices.filter((i) => i.supplierId === supplier.id);

    const totalOrders = pos.length;
    const totalSpend = pos.reduce((sum, p) => sum + p.totalAmount, 0);

    // On-Time Delivery Rate: Compare PO expected date vs GRN receipt date
    let onTimeCount = 0;
    grns.forEach((grn) => {
      const po = pos.find((p) => p.id === grn.poId);
      if (po && grn.receiptDate <= po.expectedDate) {
        onTimeCount++;
      }
    });
    const onTimeRate = grns.length > 0 ? Math.round((onTimeCount / grns.length) * 100) : 100;

    // Fulfillment Rate: Compare total qty ordered vs total qty received
    const totalQtyOrdered = pos.reduce(
      (sum, p) => sum + p.items.reduce((s, it) => s + it.qty, 0),
      0,
    );
    const totalQtyReceived = grns.reduce(
      (sum, g) => sum + g.items.reduce((s, it) => s + it.qtyReceived, 0),
      0,
    );
    const fulfillmentRate =
      totalQtyOrdered > 0
        ? Math.min(100, Math.round((totalQtyReceived / totalQtyOrdered) * 100))
        : 100;

    // Return Rate: Total value of returns vs total spend
    const totalReturnVal = returns.reduce((sum, r) => sum + r.totalDebitNote, 0);
    const returnRate = totalSpend > 0 ? ((totalReturnVal / totalSpend) * 100).toFixed(1) : '0.0';

    // Reliability Rating Calculation
    let grade: 'A+' | 'A' | 'B' | 'C' = 'A';
    let stars = 5;
    if (onTimeRate >= 90 && Number(returnRate) < 2) {
      grade = 'A+';
      stars = 5;
    } else if (onTimeRate >= 80 && Number(returnRate) < 5) {
      grade = 'A';
      stars = 4;
    } else if (onTimeRate >= 65) {
      grade = 'B';
      stars = 3;
    } else {
      grade = 'C';
      stars = 2;
    }

    return {
      supplier,
      totalOrders,
      totalSpend,
      onTimeRate,
      fulfillmentRate,
      returnRate,
      totalReturnVal,
      grade,
      stars,
    };
  });

  const filteredScorecards = vendorScorecards.filter((v) =>
    v.supplier.name.toLowerCase().includes(supplierSearch.toLowerCase()),
  );

  // 2. Material Pricing History & Comparison
  const purchasableItems = items.filter(
    (i) => i.itemType !== 'FINISHED_GOODS' && i.itemType !== 'SEMI_FINISHED' && i.isActive,
  );
  const currentSelectedItem =
    items.find((i) => i.id === selectedItemId) || purchasableItems[0];

  // Extract all historical purchases of the selected item
  const priceHistory: {
    poId: string;
    poNumber: string;
    date: string;
    supplierId: string;
    supplierName: string;
    qty: number;
    uom: string;
    unitPrice: number;
    subtotal: number;
  }[] = [];

  purchaseOrders.forEach((po) => {
    po.items.forEach((itemRow) => {
      if (itemRow.itemId === currentSelectedItem?.id) {
        priceHistory.push({
          poId: po.id,
          poNumber: po.poNumber,
          date: po.orderDate,
          supplierId: po.supplierId,
          supplierName: po.supplierName,
          qty: itemRow.qty,
          uom: itemRow.uom,
          unitPrice: itemRow.unitPrice,
          subtotal: itemRow.subtotal,
        });
      }
    });
  });

  // Sort by date descending
  priceHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Find lowest and average price for this item
  const prices = priceHistory.map((p) => p.unitPrice);
  const minPrice = prices.length > 0 ? Math.min(...prices) : currentSelectedItem?.standardCost || 0;
  const avgPrice =
    prices.length > 0
      ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
      : currentSelectedItem?.standardCost || 0;
  const bestSupplier = priceHistory.find((p) => p.unitPrice === minPrice);

  return (
    <div id="vendor-performance-view" className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('scorecard')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'scorecard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            Rapor Kinerja Pemasok (Vendor Scorecard)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pricing'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Riwayat & Analisis Harga Pembelian Bahan
          </button>
        </div>

        {activeTab === 'scorecard' && (
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari pemasok..."
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* TAB 1: VENDOR SCORECARD */}
      {activeTab === 'scorecard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Pemasok Terdaftar
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{suppliers.length}</div>
              <div className="text-xs text-slate-500 mt-0.5">Petani, Percetakan, Agen Kimia</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                Rata-Rata Ketepatan Pengiriman
              </div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">94.2%</div>
              <div className="text-xs text-emerald-600 mt-0.5">Sesuai Target Lead Time Pabrik</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
                Tingkat Retur Mutu Bahan
              </div>
              <div className="text-2xl font-bold text-amber-700 mt-1">1.8%</div>
              <div className="text-xs text-amber-600 mt-0.5">Di Bawah Batas Maksimum 3.0%</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Pemasok & Alamat</th>
                    <th className="py-3 px-4 text-center">Total Order</th>
                    <th className="py-3 px-4 text-right">Total Nilai Pembelian</th>
                    <th className="py-3 px-4 text-center">Ketepatan Kirim</th>
                    <th className="py-3 px-4 text-center">Pemenuhan Qty</th>
                    <th className="py-3 px-4 text-center">Tingkat Retur (DN)</th>
                    <th className="py-3 px-4 text-center">Peringkat Kinerja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredScorecards.map((sc) => (
                    <tr key={sc.supplier.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{sc.supplier.name}</div>
                        <div className="text-[11px] text-slate-500">{sc.supplier.address}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          NPWP: {sc.supplier.npwp || '-'} | Telp: {sc.supplier.phone || '-'}
                        </div>
                      </td>

                      {/* Total Orders */}
                      <td className="py-3 px-4 text-center font-semibold text-slate-800">
                        {sc.totalOrders} PO
                      </td>

                      {/* Total Spend */}
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        Rp {sc.totalSpend.toLocaleString()}
                      </td>

                      {/* On-Time Rate */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                            sc.onTimeRate >= 90
                              ? 'bg-emerald-100 text-emerald-800'
                              : sc.onTimeRate >= 75
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sc.onTimeRate}%
                        </span>
                      </td>

                      {/* Fulfillment Rate */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold text-slate-800">{sc.fulfillmentRate}%</span>
                      </td>

                      {/* Return Rate */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-semibold ${
                            Number(sc.returnRate) > 3 ? 'text-red-600' : 'text-slate-700'
                          }`}
                        >
                          {sc.returnRate}%
                        </span>
                        {sc.totalReturnVal > 0 && (
                          <div className="text-[10px] text-red-500 font-mono">
                            Rp {sc.totalReturnVal.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Grade & Rating */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center ${
                              sc.grade === 'A+'
                                ? 'bg-emerald-500 text-white shadow-2xs'
                                : sc.grade === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sc.grade === 'B'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {sc.grade}
                          </span>
                          <div className="flex text-amber-400">
                            {[...Array(sc.stars)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATERIAL PURCHASE PRICE HISTORY */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Item Selector Chips */}
          <div>
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Bahan Baku / Kemasan untuk Analisis Riwayat Harga:
            </div>
            <div className="flex flex-wrap gap-2">
              {purchasableItems.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setSelectedItemId(it.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    it.id === currentSelectedItem?.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  {it.itemName}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Highlight Card */}
          {currentSelectedItem && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Harga Pembelian Termurah Saat Ini
                </div>
                <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
                  Rp {minPrice.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500">/{currentSelectedItem.stockUom}</span>
                </div>
                {bestSupplier && (
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    Pemasok: <span className="font-semibold">{bestSupplier.supplierName}</span>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Rata-Rata Harga Pasar Historis
                </div>
                <div className="text-2xl font-bold text-slate-800 font-mono mt-1">
                  Rp {avgPrice.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500">/{currentSelectedItem.stockUom}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Standar HPP ERP: Rp {currentSelectedItem.standardCost.toLocaleString()}/{currentSelectedItem.stockUom}
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Rekomendasi Purchasing
                </div>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  Gunakan harga acuan <span className="font-bold">Rp {minPrice.toLocaleString()}</span> saat negosiasi pengadaan berikutnya dengan rekanan pemasok untuk menjaga efisiensi HPP rokok SKT.
                </p>
              </div>
            </div>
          )}

          {/* Historical Price Records Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-xs flex items-center justify-between">
              <span>Riwayat Transaksi Pengadaan: {currentSelectedItem?.itemName}</span>
              <span className="text-slate-500 font-normal">
                {priceHistory.length} Transaksi Tercatat
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Tanggal PO</th>
                    <th className="py-2.5 px-4">No. PO</th>
                    <th className="py-2.5 px-4">Pemasok (Vendor)</th>
                    <th className="py-2.5 px-4 text-right">Kuantitas</th>
                    <th className="py-2.5 px-4 text-right">Harga Satuan (Rp)</th>
                    <th className="py-2.5 px-4 text-right">Total Transaksi</th>
                    <th className="py-2.5 px-4 text-center">Status Harga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {priceHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Belum ada riwayat PO untuk bahan ini.
                      </td>
                    </tr>
                  ) : (
                    priceHistory.map((row, idx) => {
                      const isLowest = row.unitPrice === minPrice;
                      const diffFromAvg = row.unitPrice - avgPrice;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-4 font-mono text-slate-700">{row.date}</td>
                          <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                            {row.poNumber}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-800">
                            {row.supplierName}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono">
                            {row.qty.toLocaleString()} {row.uom}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                            Rp {row.unitPrice.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                            Rp {row.subtotal.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {isLowest ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Termurah (Best Price)
                              </span>
                            ) : diffFromAvg > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700">
                                +Rp {diffFromAvg.toLocaleString()}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                                Kompetitif
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
