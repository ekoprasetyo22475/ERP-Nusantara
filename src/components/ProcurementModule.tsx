// Procurement & Inventory Management Module
import React, { useState } from 'react';
import {
  Package,
  ShoppingCart,
  Receipt,
  FileCheck,
  CheckCircle2,
  DollarSign,
  Plus,
  ArrowRight,
  TrendingDown,
  Warehouse as WarehouseIcon,
  History,
  Printer,
  SlidersHorizontal,
  FileSpreadsheet,
  AlertCircle,
  AlertTriangle,
  Clock,
  Eye,
  XCircle,
  CreditCard,
  Building,
  RotateCcw,
  Award,
  ShieldAlert,
  Sliders,
  ArrowRightLeft,
  ClipboardCheck,
  Truck,
  Droplets,
} from 'lucide-react';
import { dbService } from '../services/mockDatabase';
import {
  PurchaseOrder,
  GoodsReceiptNote,
  SupplierInvoice,
  SupplierPayment,
  Item,
  PurchaseReturn,
  StockTransfer,
  StockOpname,
} from '../types/erp';

// Modals & New Subviews
import { PoModal } from './procurement/PoModal';
import { PoPrintModal } from './procurement/PoPrintModal';
import { GrnModal } from './procurement/GrnModal';
import { GrnPrintModal } from './procurement/GrnPrintModal';
import { SupplierInvoiceModal } from './procurement/SupplierInvoiceModal';
import { SupplierPaymentModal } from './procurement/SupplierPaymentModal';
import { PaymentVoucherPrintModal } from './procurement/PaymentVoucherPrintModal';
import { StockAdjustmentModal } from './procurement/StockAdjustmentModal';
import { StockCardPrintModal } from './procurement/StockCardPrintModal';
import { SafetyStockWidget } from './procurement/SafetyStockWidget';
import { PurchaseReturnModal } from './procurement/PurchaseReturnModal';
import { DebitNotePrintModal } from './procurement/DebitNotePrintModal';
import { ThreeWayMatchingView } from './procurement/ThreeWayMatchingView';
import { VendorPerformanceView } from './procurement/VendorPerformanceView';
import { StockTransferModal } from './procurement/StockTransferModal';
import { StockTransferPrintModal } from './procurement/StockTransferPrintModal';
import { StockOpnameModal } from './procurement/StockOpnameModal';
import { StockOpnamePrintModal } from './procurement/StockOpnamePrintModal';

interface ProcurementProps {
  onOpenPrintModal?: (docType: string, docId: string) => void;
}

export const ProcurementModule: React.FC<ProcurementProps> = () => {
  const [subTab, setSubTab] = useState<
    | 'po'
    | 'grn'
    | 'matching'
    | 'invoice'
    | 'returns'
    | 'safety'
    | 'inventory'
    | 'performance'
    | 'movements'
    | 'adjustments'
    | 'transfers'
    | 'opnames'
  >('po');

  // Modals state
  const [showPoModal, setShowPoModal] = useState(false);
  const [poToEdit, setPoToEdit] = useState<PurchaseOrder | null>(null);
  const [quickReorderItem, setQuickReorderItem] = useState<Item | null>(null);
  const [quickReorderQty, setQuickReorderQty] = useState<number | undefined>(undefined);

  const [showPoPrintModal, setShowPoPrintModal] = useState(false);
  const [selectedPoForPrint, setSelectedPoForPrint] = useState<PurchaseOrder | null>(null);

  const [showGrnModal, setShowGrnModal] = useState(false);
  const [selectedPoForGrn, setSelectedPoForGrn] = useState<PurchaseOrder | null>(null);

  const [showGrnPrintModal, setShowGrnPrintModal] = useState(false);
  const [selectedGrnForPrint, setSelectedGrnForPrint] = useState<GoodsReceiptNote | null>(null);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedPoForInvoice, setSelectedPoForInvoice] = useState<PurchaseOrder | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<SupplierInvoice | null>(null);

  const [showVoucherPrintModal, setShowVoucherPrintModal] = useState(false);
  const [selectedPaymentForVoucher, setSelectedPaymentForVoucher] = useState<SupplierPayment | null>(null);

  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  const [showStockCardModal, setShowStockCardModal] = useState(false);
  const [stockCardItemId, setStockCardItemId] = useState<string | undefined>(undefined);

  // Return & Debit Note states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDebitNotePrintModal, setShowDebitNotePrintModal] = useState(false);
  const [selectedReturnForPrint, setSelectedReturnForPrint] = useState<PurchaseReturn | null>(null);

  // Transfer Antar Gudang states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTransferPrintModal, setShowTransferPrintModal] = useState(false);
  const [selectedTransferForPrint, setSelectedTransferForPrint] = useState<StockTransfer | null>(null);

  // Stock Opname & BASO states
  const [showBulkOpnameModal, setShowBulkOpnameModal] = useState(false);
  const [showOpnamePrintModal, setShowOpnamePrintModal] = useState(false);
  const [selectedOpnameForPrint, setSelectedOpnameForPrint] = useState<StockOpname | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [refreshKey, setRefreshKey] = useState(0);
  const state = dbService.getState();

  // Handlers
  const handleSavePo = (poData: any) => {
    try {
      if (poToEdit) {
        dbService.updatePurchaseOrder(poToEdit.id, poData);
        alert(`PO ${poToEdit.poNumber} berhasil diperbarui.`);
      } else {
        const newPo = dbService.createPurchaseOrder(poData);
        alert(`Purchase Order ${newPo.poNumber} berhasil diterbitkan.`);
      }
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert(`Gagal menyimpan PO: ${err.message}`);
    }
  };

  const handleCancelPo = (poId: string) => {
    const reason = prompt('Masukkan alasan pembatalan PO:');
    if (!reason) return;
    const res = dbService.cancelPurchaseOrder(poId, reason);
    if (res.success) {
      alert(res.message);
      setRefreshKey((k) => k + 1);
    } else {
      alert(res.message);
    }
  };

  const handlePostGrn = (
    poId: string,
    vendorDeliveryRef: string,
    notes: string,
    receivedQuantities: Record<string, number>,
    receiptDate: string,
    qcData?: any,
  ) => {
    try {
      const grn = dbService.postGoodsReceiptNote(
        poId,
        vendorDeliveryRef,
        notes,
        receivedQuantities,
        receiptDate,
        qcData,
      );
      setRefreshKey((k) => k + 1);
      alert(`Penerimaan barang ${grn.grnNumber} berhasil diposting! Stok gudang dan nilai moving average telah diperbarui.`);
      // Offer printing
      setSelectedGrnForPrint(grn);
      setShowGrnPrintModal(true);
    } catch (err: any) {
      alert(`Gagal posting GRN: ${err.message}`);
    }
  };

  const handlePostTransfer = (data: any) => {
    try {
      const record = dbService.postStockTransfer(data);
      setRefreshKey((k) => k + 1);
      alert(`Mutasi Antar Gudang ${record.transferNumber} berhasil diposting! Stok gudang asal dikurangi dan stok gudang tujuan ditambahkan.`);
      setSelectedTransferForPrint(record);
      setShowTransferPrintModal(true);
      return record;
    } catch (err: any) {
      alert(`Gagal posting mutasi transfer: ${err.message}`);
    }
  };

  const handlePostOpname = (data: any) => {
    try {
      const record = dbService.postBulkStockOpname(data);
      setRefreshKey((k) => k + 1);
      alert(`Berita Acara Stock Opname ${record.opnameNumber} berhasil diposting! Saldo stok fisik dan jurnal penyesuaian telah dibukukan.`);
      setSelectedOpnameForPrint(record);
      setShowOpnamePrintModal(true);
      return record;
    } catch (err: any) {
      alert(`Gagal posting Stock Opname: ${err.message}`);
    }
  };

  const handlePostInvoice = (
    poId: string,
    vendorInvoiceNo: string,
    fakturPajakNumber?: string,
  ) => {
    try {
      const inv = dbService.createSupplierInvoice(poId, vendorInvoiceNo, fakturPajakNumber);
      setRefreshKey((k) => k + 1);
      alert(
        `Tagihan Supplier ${inv.invoiceNumber} berhasil diposting! Jurnal Akuntansi Hutang Usaha dan PPN Masukan telah dicatat otomatis.`,
      );
    } catch (err: any) {
      alert(`Gagal posting invoice: ${err.message}`);
    }
  };

  const handlePostPayment = (
    invoiceId: string,
    amount: number,
    bankCode: string,
    referenceNo: string,
  ) => {
    try {
      const payment = dbService.postSupplierPayment(invoiceId, amount, bankCode, referenceNo);
      setRefreshKey((k) => k + 1);
      alert(
        `Pembayaran ${payment.paymentNumber} sebesar Rp ${amount.toLocaleString()} berhasil diproses! Jurnal pengeluaran bank dan pelunasan hutang telah dibukukan.`,
      );
      // Prompt print voucher
      setSelectedPaymentForVoucher(payment);
      setShowVoucherPrintModal(true);
    } catch (err: any) {
      alert(`Gagal proses pembayaran: ${err.message}`);
    }
  };

  const handlePostStockAdjustment = (data: {
    itemId: string;
    warehouseId: string;
    adjustmentType: 'IN' | 'OUT';
    qty: number;
    reason: string;
    notes?: string;
  }) => {
    const res = dbService.postStockAdjustment(data);
    if (res.success) {
      alert(res.message);
      setRefreshKey((k) => k + 1);
    } else {
      alert(res.message);
    }
  };

  const handlePostReturn = (returnData: any) => {
    try {
      const res = dbService.postPurchaseReturn(returnData);
      setRefreshKey((k) => k + 1);
      alert(
        `Retur Pembelian ${res.returnNumber} dan Nota Debet ${res.debitNoteNumber} sebesar Rp ${res.totalDebitNote.toLocaleString()} berhasil diposting! Stok gudang telah dikurangi dan jurnal akuntansi telah dibukukan.`,
      );
      setShowReturnModal(false);
      setSelectedReturnForPrint(res);
      setShowDebitNotePrintModal(true);
    } catch (err: any) {
      alert(`Gagal posting retur pembelian: ${err.message}`);
    }
  };

  const handleQuickReorder = (item: Item, suggestedQty: number, preferredSupplierId?: string) => {
    setPoToEdit(null);
    setQuickReorderItem(item);
    setQuickReorderQty(suggestedQty);
    setShowPoModal(true);
  };

  // Filtered Lists
  const filteredPOs = state.purchaseOrders.filter((po) => {
    const matchSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || po.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredGRNs = state.goodsReceiptNotes.filter((grn) => {
    return (
      grn.grnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grn.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grn.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grn.vendorDeliveryRef.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredInvoices = state.supplierInvoices.filter((inv) => {
    return (
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.vendorInvoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate high-level KPIs
  const totalOpenPoValue = state.purchaseOrders
    .filter((p) => p.status === 'POSTED' || p.status === 'PARTIALLY_RECEIVED')
    .reduce((acc, p) => acc + p.totalAmount, 0);

  const totalOutstandingAp = state.supplierInvoices
    .filter((si) => si.paymentStatus !== 'PAID')
    .reduce((acc, si) => acc + (si.total - si.paidAmount), 0);

  const totalRawInventoryValuation = state.stockInventory.reduce(
    (acc, si) => acc + si.totalValuation,
    0,
  );

  // Low stock check for alert banner
  const lowStockMaterials = state.items.filter((i) => {
    if (i.itemType === 'FINISHED_GOODS' || i.itemType === 'SEMI_FINISHED' || !i.isActive) return false;
    const currentStock = state.stockInventory
      .filter((inv) => inv.itemId === i.id)
      .reduce((sum, inv) => sum + inv.qty, 0);
    return currentStock < i.minStock;
  });

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <span>Pengadaan (Procurement) & Pengendalian Persediaan</span>
          </h2>
          <p className="text-xs text-slate-500">
            Siklus pengadaan terpadu: PO → Penerimaan GRN → Rekonsiliasi 3-Way Matching → Tagihan AP & Pelunasan → Retur & Nota Debet → Safety Stock ROP & Rapor Vendor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setPoToEdit(null);
              setQuickReorderItem(null);
              setQuickReorderQty(undefined);
              setShowPoModal(true);
            }}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Buat PO Baru</span>
          </button>

          <button
            onClick={() => setShowReturnModal(true)}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retur & Nota Debet (DN)</span>
          </button>

          <button
            onClick={() => setShowAdjustmentModal(true)}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition active:scale-98"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Penyesuaian Stok (Opname)</span>
          </button>

          <button
            onClick={() => {
              setStockCardItemId(undefined);
              setShowStockCardModal(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition active:scale-98"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Buku Kartu Stok</span>
          </button>
        </div>
      </div>

      {/* Safety Stock Alert Banner (When any raw material is below ROP) */}
      {lowStockMaterials.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-950 text-xs flex items-center gap-2">
                Peringatan Stok Pengadaan: {lowStockMaterials.length} Bahan Baku / Kemasan di Bawah Safety Stock (ROP)
                <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Perlu PO
                </span>
              </div>
              <div className="text-[11px] text-amber-800 mt-0.5">
                Bahan: {lowStockMaterials.map((m) => m.itemName).slice(0, 3).join(', ')}
                {lowStockMaterials.length > 3 && ` dan ${lowStockMaterials.length - 3} lainnya`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubTab('safety')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
            >
              Lihat & Kalibrasi Safety Stock
            </button>
            <button
              onClick={() => handleQuickReorder(lowStockMaterials[0], lowStockMaterials[0].minStock * 2)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              PO Cepat ({lowStockMaterials[0].itemCode})
            </button>
          </div>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
              Pesanan Pembelian Aktif (Open PO)
            </div>
            <div className="text-xl font-black font-mono text-amber-950 mt-1">
              Rp {totalOpenPoValue.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5">
              {state.purchaseOrders.filter((p) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED').length} Dokumen Menunggu Penerimaan
            </div>
          </div>
          <div className="p-3 bg-amber-500/20 text-amber-800 rounded-xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">
              Total Hutang Usaha Supplier (AP)
            </div>
            <div className="text-xl font-black font-mono text-rose-950 mt-1">
              Rp {totalOutstandingAp.toLocaleString()}
            </div>
            <div className="text-[10px] text-rose-700 mt-0.5">
              {state.supplierInvoices.filter((s) => s.paymentStatus !== 'PAID').length} Faktur Belum Lunas
            </div>
          </div>
          <div className="p-3 bg-rose-500/20 text-rose-800 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
              Valuasi Persediaan Gudang (Moving Avg)
            </div>
            <div className="text-xl font-black font-mono text-emerald-950 mt-1">
              Rp {totalRawInventoryValuation.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">
              {state.stockInventory.length} Jenis Bahan Baku, Kemasan & Pembantu
            </div>
          </div>
          <div className="p-3 bg-emerald-500/20 text-emerald-800 rounded-xl">
            <WarehouseIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setSubTab('po')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'po'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Purchase Orders ({state.purchaseOrders.length})
          </button>
          <button
            onClick={() => setSubTab('grn')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'grn'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Penerimaan Fisik (GRN) ({state.goodsReceiptNotes.length})
          </button>
          <button
            onClick={() => setSubTab('matching')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              subTab === 'matching'
                ? 'bg-white text-blue-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            3-Way Matching (Audit AP)
          </button>
          <button
            onClick={() => setSubTab('invoice')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'invoice'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tagihan Supplier (AP) ({state.supplierInvoices.length})
          </button>
          <button
            onClick={() => setSubTab('returns')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              subTab === 'returns'
                ? 'bg-white text-red-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-600" />
            Retur & Nota Debet ({state.purchaseReturns?.length || 0})
          </button>
          <button
            onClick={() => setSubTab('safety')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              subTab === 'safety'
                ? 'bg-white text-amber-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Safety Stock (ROP)
            {lowStockMaterials.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-bold">
                {lowStockMaterials.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab('performance')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              subTab === 'performance'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Kinerja & Harga Rekanan
          </button>
          <button
            onClick={() => setSubTab('inventory')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'inventory'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monitor Stok Gudang ({state.stockInventory.length})
          </button>
          <button
            onClick={() => setSubTab('movements')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'movements'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mutasi & Kartu Stok ({state.stockMovements.length})
          </button>
        </div>

        {/* Search input in toolbar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Cari dokumen / rekanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: PURCHASE ORDERS */}
      {/* ========================================================================= */}
      {subTab === 'po' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3 w-32">No. PO</th>
                  <th className="py-2.5 px-3 w-24">Tanggal</th>
                  <th className="py-2.5 px-3">Pemasok (Supplier)</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Rincian Item Dipesan</th>
                  <th className="py-2.5 px-3 text-right w-28">DPP (Rp)</th>
                  <th className="py-2.5 px-3 text-right w-24">PPN (11%)</th>
                  <th className="py-2.5 px-3 text-right w-32">Total Nilai</th>
                  <th className="py-2.5 px-3 text-center w-28">Status</th>
                  <th className="py-2.5 px-3 text-right w-48">Aksi Terintegrasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPOs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                      Tidak ada data Purchase Order yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredPOs.map((po) => {
                    const hasGrn = state.goodsReceiptNotes.some((g) => g.poId === po.id);
                    const hasInvoice = state.supplierInvoices.some((si) => si.poId === po.id);

                    return (
                      <tr key={po.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {po.poNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{po.orderDate}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {po.supplierName}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="space-y-1">
                            {po.items.map((it, i) => (
                              <div key={i} className="text-slate-700 text-[11px]">
                                <span className="font-semibold text-slate-900">{it.itemName}</span>{' '}
                                <span className="text-slate-500">
                                  ({it.qty.toLocaleString()} {it.uom} @ Rp {it.unitPrice.toLocaleString()})
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">
                          Rp {po.subtotal.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-500">
                          Rp {po.ppnAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-950">
                          Rp {po.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              po.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : po.status === 'PARTIALLY_RECEIVED'
                                ? 'bg-blue-100 text-blue-800'
                                : po.status === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {po.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Print PO */}
                            <button
                              onClick={() => {
                                setSelectedPoForPrint(po);
                                setShowPoPrintModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                              title="Cetak Surat Purchase Order Resmi"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Terima Barang (GRN) */}
                            {po.status !== 'COMPLETED' && po.status !== 'CANCELLED' && (
                              <button
                                onClick={() => {
                                  setSelectedPoForGrn(po);
                                  setShowGrnModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-xs transition"
                              >
                                Terima GRN
                              </button>
                            )}

                            {/* Buat Faktur AP */}
                            {hasGrn && !hasInvoice && (
                              <button
                                onClick={() => {
                                  setSelectedPoForInvoice(po);
                                  setShowInvoiceModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs transition"
                              >
                                Faktur AP
                              </button>
                            )}

                            {/* Status jika sudah faktur */}
                            {hasInvoice && (
                              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Terfaktur
                              </span>
                            )}

                            {/* Batalkan PO */}
                            {po.status === 'POSTED' && !hasGrn && (
                              <button
                                onClick={() => handleCancelPo(po.id)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                                title="Batalkan PO"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: GOODS RECEIPT NOTES */}
      {/* ========================================================================= */}
      {subTab === 'grn' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3 w-32">No. GRN</th>
                  <th className="py-2.5 px-3 w-24">Tanggal Terima</th>
                  <th className="py-2.5 px-3 w-28">Ref. PO</th>
                  <th className="py-2.5 px-3">Surat Jalan Supplier</th>
                  <th className="py-2.5 px-3">Pemasok</th>
                  <th className="py-2.5 px-3 w-28">Gudang</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Rincian Fisik Diterima</th>
                  <th className="py-2.5 px-3 text-right w-32">Nilai Masuk (Rp)</th>
                  <th className="py-2.5 px-3 text-center w-28">Aksi Cetak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGRNs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                      Belum ada dokumen Penerimaan Barang (GRN).
                    </td>
                  </tr>
                ) : (
                  filteredGRNs.map((grn) => (
                    <tr key={grn.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {grn.grnNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{grn.receiptDate}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-amber-700">
                        {grn.poNumber}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {grn.vendorDeliveryRef}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {grn.supplierName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          WH-MATERIAL
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="space-y-0.5">
                          {grn.items.map((it, idx) => (
                            <div key={idx} className="text-slate-700 font-medium text-[11px]">
                              {it.itemName}:{' '}
                              <strong className="text-blue-900">
                                {it.qtyReceived.toLocaleString()} {it.uom}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        Rp {grn.totalValue.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedGrnForPrint(grn);
                            setShowGrnPrintModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak GRN</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2B: 3-WAY MATCHING RECONCILIATION */}
      {/* ========================================================================= */}
      {subTab === 'matching' && (
        <ThreeWayMatchingView
          purchaseOrders={state.purchaseOrders}
          goodsReceiptNotes={state.goodsReceiptNotes}
          supplierInvoices={state.supplierInvoices}
          suppliers={state.suppliers}
          onOpenCreateInvoice={(po) => {
            setSelectedPoForInvoice(po);
            setShowInvoiceModal(true);
          }}
          onOpenPayment={(invoice) => {
            setSelectedInvoiceForPayment(invoice);
            setShowPaymentModal(true);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: SUPPLIER INVOICES (AP) */}
      {/* ========================================================================= */}
      {subTab === 'invoice' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3 w-32">No. Tagihan (SI)</th>
                  <th className="py-2.5 px-3 w-36">No. Invoice Vendor</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3 w-28">Tgl / Jatuh Tempo</th>
                  <th className="py-2.5 px-3 text-right w-28">DPP (Rp)</th>
                  <th className="py-2.5 px-3 text-right w-24">PPN Masukan</th>
                  <th className="py-2.5 px-3 text-right w-32">Total Tagihan</th>
                  <th className="py-2.5 px-3 text-right w-28">Dibayar</th>
                  <th className="py-2.5 px-3 text-center w-24">Status Bayar</th>
                  <th className="py-2.5 px-3 text-right w-36">Aksi Bayar / Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                      Belum ada Tagihan Supplier (AP).
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const relatedPayment = state.supplierPayments.find(
                      (p) => p.supplierInvoiceId === inv.id,
                    );

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          <div>{inv.vendorInvoiceNo}</div>
                          {inv.fakturPajakNumber && (
                            <div className="text-[10px] font-mono text-slate-500">
                              FP: {inv.fakturPajakNumber}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{inv.supplierName}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <div>{inv.invoiceDate}</div>
                          <div className="text-[10px] text-rose-600 font-semibold">
                            Jatuh: {inv.dueDate}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          Rp {inv.dpp.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-blue-700">
                          Rp {inv.ppn.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                          Rp {inv.total.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          Rp {inv.paidAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.paymentStatus === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.paymentStatus !== 'PAID' && (
                              <button
                                onClick={() => {
                                  setSelectedInvoiceForPayment(inv);
                                  setShowPaymentModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs transition"
                              >
                                Bayar
                              </button>
                            )}
                            {relatedPayment && (
                              <button
                                onClick={() => {
                                  setSelectedPaymentForVoucher(relatedPayment);
                                  setShowVoucherPrintModal(true);
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                                title="Cetak Voucher Pembayaran Kas/Bank"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3B: PURCHASE RETURNS & DEBIT NOTES (RETUR & NOTA DEBET) */}
      {/* ========================================================================= */}
      {subTab === 'returns' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50/50 border border-red-200 p-4 rounded-xl">
            <div>
              <h3 className="text-sm font-black text-red-950 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-red-600" />
                <span>Pengembalian Barang ke Pemasok (Purchase Returns & Debit Notes)</span>
              </h3>
              <p className="text-xs text-red-800 mt-0.5">
                Penerbitan Nota Debet (DN) memotong saldo Hutang Usaha (AP), mengurangi kuantitas stok gudang secara otomatis, dan menerbitkan jurnal penyesuaian PPN Masukan.
              </p>
            </div>
            <button
              onClick={() => setShowReturnModal(true)}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition active:scale-98 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Retur Pembelian (+DN)</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-3 w-32">No. Retur</th>
                    <th className="py-2.5 px-3 w-32">No. Nota Debet (DN)</th>
                    <th className="py-2.5 px-3 w-24">Tanggal</th>
                    <th className="py-2.5 px-3">Pemasok</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Rincian Item Dikembalikan</th>
                    <th className="py-2.5 px-3">Alasan Retur</th>
                    <th className="py-2.5 px-3 text-right w-28">DPP Retur</th>
                    <th className="py-2.5 px-3 text-right w-24">PPN (11%)</th>
                    <th className="py-2.5 px-3 text-right w-32">Total Nota Debet</th>
                    <th className="py-2.5 px-3 text-center w-28">Cetak Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!state.purchaseReturns || state.purchaseReturns.length === 0) ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                        Belum ada dokumen Retur Pembelian & Nota Debet yang diterbitkan.
                      </td>
                    </tr>
                  ) : (
                    state.purchaseReturns
                      .filter(
                        (pr) =>
                          pr.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pr.debitNoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pr.supplierName.toLowerCase().includes(searchQuery.toLowerCase()),
                      )
                      .map((pr) => (
                        <tr key={pr.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {pr.returnNumber}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-red-700">
                            {pr.debitNoteNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{pr.returnDate}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{pr.supplierName}</td>
                          <td className="py-2.5 px-3">
                            <div className="space-y-1">
                              {pr.items.map((it, idx) => (
                                <div key={idx} className="text-slate-700 text-[11px]">
                                  <span className="font-semibold text-slate-900">{it.itemName}</span>{' '}
                                  <span className="text-red-700 font-bold">
                                    (-{it.qtyReturned.toLocaleString()} {it.uom})
                                  </span>{' '}
                                  <span className="text-slate-500">
                                    @ Rp {it.unitPrice.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs">
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-semibold text-[10px]">
                              {pr.reason}
                            </span>
                            {pr.notes && <div className="text-[10px] text-slate-500 mt-0.5">{pr.notes}</div>}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">
                            Rp {pr.subtotalDpp.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-500">
                            Rp {pr.ppnAmount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-red-700">
                            Rp {pr.totalDebitNote.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedReturnForPrint(pr);
                                setShowDebitNotePrintModal(true);
                              }}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 transition border border-red-200"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Nota Debet</span>
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3C: SAFETY STOCK & REORDER POINT (ROP) ALERTS */}
      {/* ========================================================================= */}
      {subTab === 'safety' && (
        <SafetyStockWidget
          items={state.items}
          stockInventory={state.stockInventory}
          suppliers={state.suppliers}
          onQuickReorder={handleQuickReorder}
          onRefresh={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3D: VENDOR PERFORMANCE & PRICE HISTORY */}
      {/* ========================================================================= */}
      {subTab === 'performance' && (
        <VendorPerformanceView
          suppliers={state.suppliers}
          purchaseOrders={state.purchaseOrders}
          goodsReceiptNotes={state.goodsReceiptNotes}
          purchaseReturns={state.purchaseReturns || []}
          supplierInvoices={state.supplierInvoices}
          items={state.items}
        />
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: INVENTORY MONITOR */}
      {/* ========================================================================= */}
      {subTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-3 w-28">Gudang</th>
                    <th className="py-2.5 px-3 w-28">Kode Barang</th>
                    <th className="py-2.5 px-3">Nama Barang</th>
                    <th className="py-2.5 px-3 text-right w-28">Kuantitas Fisik</th>
                    <th className="py-2.5 px-3 text-center w-16">Satuan</th>
                    <th className="py-2.5 px-3 text-right w-36">Harga Rata-Rata (HPP)</th>
                    <th className="py-2.5 px-3 text-right w-36">Total Valuasi</th>
                    <th className="py-2.5 px-3 text-center w-32">Aksi Kartu Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.stockInventory.map((stock, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {stock.warehouseCode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {stock.itemCode}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{stock.itemName}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-slate-950">
                        {stock.qty.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-600">
                        {stock.uom}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        Rp {stock.averageCost.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800">
                        Rp {stock.totalValuation.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setStockCardItemId(stock.itemId);
                            setShowStockCardModal(true);
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px] border border-emerald-200 transition flex items-center gap-1 mx-auto"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Kartu Stok</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: STOCK MOVEMENTS (KARTU STOK) */}
      {/* ========================================================================= */}
      {subTab === 'movements' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3 w-24">Tanggal</th>
                  <th className="py-2.5 px-3 w-28">Tipe Mutasi</th>
                  <th className="py-2.5 px-3 w-36">No. Referensi Dokumen</th>
                  <th className="py-2.5 px-3 w-24">Gudang</th>
                  <th className="py-2.5 px-3">Nama Barang</th>
                  <th className="py-2.5 px-3 text-right w-24">Masuk (+)</th>
                  <th className="py-2.5 px-3 text-right w-24">Keluar (-)</th>
                  <th className="py-2.5 px-3 text-right w-28">Saldo Akhir</th>
                  <th className="py-2.5 px-3">Keterangan / Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.stockMovements.map((sm) => (
                  <tr key={sm.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{sm.date}</td>
                    <td className="py-2.5 px-3 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          sm.movementType.includes('RECEIPT') || sm.movementType.includes('GRN')
                            ? 'bg-emerald-100 text-emerald-800'
                            : sm.movementType.includes('ADJUSTMENT')
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sm.movementType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {sm.referenceNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{sm.warehouseCode}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{sm.itemName}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                      {sm.qtyIn > 0 ? `+${sm.qtyIn.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                      {sm.qtyOut > 0 ? `-${sm.qtyOut.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                      {sm.balanceQty.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{sm.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ALL MODAL INTEGRATIONS */}
      {/* ========================================================================= */}

      {/* 1. Multi-Item Purchase Order Modal */}
      <PoModal
        isOpen={showPoModal}
        onClose={() => {
          setShowPoModal(false);
          setPoToEdit(null);
          setQuickReorderItem(null);
          setQuickReorderQty(undefined);
        }}
        onSave={handleSavePo}
        suppliers={state.suppliers}
        items={state.items}
        poToEdit={poToEdit}
        initialItemId={quickReorderItem?.id}
        initialQty={quickReorderQty}
      />

      {/* 2. Official PO Print Modal */}
      <PoPrintModal
        po={selectedPoForPrint}
        onClose={() => {
          setShowPoPrintModal(false);
          setSelectedPoForPrint(null);
        }}
        companySettings={state.companySettings}
        supplier={state.suppliers.find((s) => s.id === selectedPoForPrint?.supplierId)}
      />

      {/* 3. Modal-Based Goods Receipt Note (GRN) */}
      <GrnModal
        isOpen={showGrnModal}
        onClose={() => {
          setShowGrnModal(false);
          setSelectedPoForGrn(null);
        }}
        onPost={handlePostGrn}
        po={selectedPoForGrn}
        existingGrns={state.goodsReceiptNotes}
      />

      {/* 4. Official GRN Print Modal */}
      <GrnPrintModal
        grn={selectedGrnForPrint}
        onClose={() => {
          setShowGrnPrintModal(false);
          setSelectedGrnForPrint(null);
        }}
        companySettings={state.companySettings}
      />

      {/* 5. Supplier Invoice AP Modal */}
      <SupplierInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setSelectedPoForInvoice(null);
        }}
        onPost={handlePostInvoice}
        po={selectedPoForInvoice}
        grn={state.goodsReceiptNotes.find((g) => g.poId === selectedPoForInvoice?.id)}
      />

      {/* 6. Supplier Debt Payment Modal */}
      <SupplierPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedInvoiceForPayment(null);
        }}
        onPost={handlePostPayment}
        invoice={selectedInvoiceForPayment}
        bankAccounts={state.chartOfAccounts.filter(
          (c) => c.code.startsWith('100') && !c.isParent && c.isActive,
        )}
      />

      {/* 7. Official Payment Voucher Print Modal */}
      <PaymentVoucherPrintModal
        payment={selectedPaymentForVoucher}
        onClose={() => {
          setShowVoucherPrintModal(false);
          setSelectedPaymentForVoucher(null);
        }}
        companySettings={state.companySettings}
      />

      {/* 8. Stock Adjustment / Stock Opname Modal */}
      <StockAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        onPost={handlePostStockAdjustment}
        items={state.items}
        warehouses={state.warehouses}
        stockInventory={state.stockInventory}
      />

      {/* 9. Detailed Stock Ledger Card Print Modal */}
      <StockCardPrintModal
        isOpen={showStockCardModal}
        onClose={() => setShowStockCardModal(false)}
        items={state.items}
        warehouses={state.warehouses}
        stockInventory={state.stockInventory}
        stockMovements={state.stockMovements}
        companySettings={state.companySettings}
        initialItemId={stockCardItemId}
      />

      {/* 10. Purchase Return (Retur Pembelian & Nota Debet) Modal */}
      <PurchaseReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onSave={handlePostReturn}
        purchaseOrders={state.purchaseOrders}
        goodsReceiptNotes={state.goodsReceiptNotes}
        supplierInvoices={state.supplierInvoices}
        suppliers={state.suppliers}
        items={state.items}
        stockInventory={state.stockInventory}
        warehouses={state.warehouses}
      />

      {/* 11. Official Debit Note & Retur Surat Jalan Print Modal */}
      <DebitNotePrintModal
        purchaseReturn={selectedReturnForPrint}
        onClose={() => {
          setShowDebitNotePrintModal(false);
          setSelectedReturnForPrint(null);
        }}
        companySettings={state.companySettings}
        supplier={state.suppliers.find((s) => s.id === selectedReturnForPrint?.supplierId)}
      />
    </div>
  );
};
