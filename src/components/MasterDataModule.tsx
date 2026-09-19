// Master Data Management Module: Items, 2-Tier BOM, Excise Tariffs (Pita Cukai), Unified Labor Tariffs, Partners, & COA
import React, { useState } from 'react';
import {
  Layers,
  Package,
  Users,
  Building2,
  DollarSign,
  Search,
  CheckCircle2,
  Filter,
  Stamp,
  Edit2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Info,
  Check,
  X,
  Plus,
  Calculator,
  Printer,
  Eye,
  Trash2,
} from 'lucide-react';
import { dbService } from '../services/mockDatabase';
import { Item, BOM, Customer, Supplier, ProductionLaborTariff, ExciseTariff } from '../types/erp';
import { HppCalculator } from './HppCalculator';
import { ItemModal } from './master/ItemModal';
import { ItemDetailModal } from './master/ItemDetailModal';
import { ItemCatalogPrintModal } from './master/ItemCatalogPrintModal';
import { BomModal } from './master/BomModal';
import { BomPrintPreviewModal } from './master/BomPrintPreviewModal';
import { ExciseModal } from './master/ExciseModal';
import { LaborTariffModal } from './master/LaborTariffModal';
import { PartnerModal } from './master/PartnerModal';
import { CompanyProfileTab } from './master/CompanyProfileTab';

export const MasterDataModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'items' | 'bom' | 'hpp' | 'excise' | 'tariffs' | 'partners' | 'coa' | 'company'>('items');
  const [selectedHppProduct, setSelectedHppProduct] = useState<string>('item-fg-kng12');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('ALL');

  // Rerender trigger after mutations
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  // Items Modals & Actions
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [previewItem, setPreviewItem] = useState<Item | null>(null);
  const [isItemPrintOpen, setIsItemPrintOpen] = useState(false);

  // BOM Modals & Actions
  const [isBomModalOpen, setIsBomModalOpen] = useState(false);
  const [bomToEdit, setBomToEdit] = useState<BOM | null>(null);
  const [previewBom, setPreviewBom] = useState<BOM | null>(null);

  // Excise Modals & Actions
  const [isExciseModalOpen, setIsExciseModalOpen] = useState(false);
  const [tariffToEdit, setTariffToEdit] = useState<ExciseTariff | null>(null);

  // Labor Modals & Actions
  const [isLaborModalOpen, setIsLaborModalOpen] = useState(false);
  const [laborToEdit, setLaborToEdit] = useState<ProductionLaborTariff | null>(null);

  // Partner Modals & Actions
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerType, setPartnerType] = useState<'SUPPLIER' | 'CUSTOMER'>('SUPPLIER');
  const [partnerToEdit, setPartnerToEdit] = useState<Supplier | Customer | null>(null);

  // Quick edit state for labor/excise inline
  const [editingLaborTariff, setEditingLaborTariff] = useState<ProductionLaborTariff | null>(null);
  const [laborRateInput, setLaborRateInput] = useState<number>(0);

  const [editingExciseTariff, setEditingExciseTariff] = useState<ExciseTariff | null>(null);
  const [exciseHjeInput, setExciseHjeInput] = useState<number>(0);
  const [exciseRateInput, setExciseRateInput] = useState<number>(0);
  const [sheetsConvInput, setSheetsConvInput] = useState<number>(120);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const state = dbService.getState();

  const filteredItems = state.items.filter((it) => {
    const matchesSearch =
      it.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = itemTypeFilter === 'ALL' || it.itemType === itemTypeFilter;
    return matchesSearch && matchesType;
  });

  // ITEM CRUD HANDLERS
  const handleSaveItem = (itemData: Omit<Item, 'id'>, editId?: string) => {
    if (editId) {
      dbService.updateItem(editId, itemData);
      showToast(`Data barang ${itemData.itemName} berhasil diperbarui.`);
    } else {
      dbService.addItem(itemData);
      showToast(`Item baru ${itemData.itemName} (${itemData.itemCode}) berhasil ditambahkan.`);
    }
    refresh();
  };

  const handleDeleteItem = (item: Item) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus item ${item.itemName} (${item.itemCode})?`)) {
      const res = dbService.deleteItem(item.id);
      if (res.success) {
        showToast(res.message);
        refresh();
      } else {
        alert(res.message);
      }
    }
  };

  // BOM CRUD HANDLERS
  const handleSaveBOM = (bomData: Omit<BOM, 'id'>, editId?: string) => {
    if (editId) {
      dbService.updateBOM(editId, bomData);
      showToast(`Formula BOM ${bomData.productName} (${bomData.bomNumber}) berhasil diperbarui.`);
    } else {
      dbService.addBOM(bomData);
      showToast(`Formula BOM baru ${bomData.productName} berhasil dibuat.`);
    }
    refresh();
  };

  const handleDeleteBOM = (bom: BOM) => {
    if (window.confirm(`Hapus formula BOM ${bom.productName} (${bom.bomNumber})?`)) {
      const res = dbService.deleteBOM(bom.id);
      showToast(res.message);
      refresh();
    }
  };

  // EXCISE CRUD HANDLERS
  const handleSaveExcise = (tariffData: Omit<ExciseTariff, 'id'>, editId?: string) => {
    if (editId) {
      dbService.updateExciseTariff(editId, tariffData);
      showToast(`Tarif cukai ${tariffData.brand} berhasil diperbarui.`);
    } else {
      dbService.addExciseTariff(tariffData);
      showToast(`Tarif cukai baru ${tariffData.brand} (${tariffData.tariffCode}) berhasil ditambahkan.`);
    }
    refresh();
  };

  const handleDeleteExcise = (t: ExciseTariff) => {
    if (window.confirm(`Hapus konfigurasi pita cukai ${t.brand} (${t.tariffCode})?`)) {
      const res = dbService.deleteExciseTariff(t.id);
      showToast(res.message);
      refresh();
    }
  };

  // LABOR TARIFF CRUD HANDLERS
  const handleSaveLabor = (tariffData: Omit<ProductionLaborTariff, 'id'>, editId?: string) => {
    if (editId) {
      dbService.updateLaborTariff(editId, tariffData.rate);
      showToast(`Tarif ${tariffData.name} berhasil diperbarui.`);
    } else {
      dbService.addLaborTariff(tariffData);
      showToast(`Tarif upah baru ${tariffData.name} berhasil ditambahkan.`);
    }
    refresh();
  };

  const handleDeleteLabor = (t: ProductionLaborTariff) => {
    if (window.confirm(`Hapus tarif upah ${t.name || t.code}?`)) {
      const res = dbService.deleteLaborTariff(t.id);
      showToast(res.message);
      refresh();
    }
  };

  // PARTNER CRUD HANDLERS
  const handleSaveSupplier = (data: Omit<Supplier, 'id'>, editId?: string) => {
    if (editId) {
      dbService.updateSupplier(editId, data);
      showToast(`Data supplier ${data.name} berhasil diperbarui.`);
    } else {
      dbService.addSupplier(data);
      showToast(`Supplier ${data.name} berhasil ditambahkan.`);
    }
    refresh();
  };

  const handleSaveCustomer = (data: Omit<Customer, 'id'>, editId?: string) => {
    if (editId) {
      dbService.updateCustomer(editId, data);
      showToast(`Data pelanggan ${data.name} berhasil diperbarui.`);
    } else {
      dbService.addCustomer(data);
      showToast(`Pelanggan ${data.name} berhasil ditambahkan.`);
    }
    refresh();
  };

  const handleDeleteSupplier = (s: Supplier) => {
    if (window.confirm(`Hapus rekanan supplier ${s.name}?`)) {
      const res = dbService.deleteSupplier(s.id);
      showToast(res.message);
      refresh();
    }
  };

  const handleDeleteCustomer = (c: Customer) => {
    if (window.confirm(`Hapus data pelanggan ${c.name}?`)) {
      const res = dbService.deleteCustomer(c.id);
      showToast(res.message);
      refresh();
    }
  };

  const handleSaveLaborTariff = () => {
    if (!editingLaborTariff) return;
    dbService.updateLaborTariff(editingLaborTariff.id, laborRateInput);
    showToast(`Tarif ${editingLaborTariff.name || editingLaborTariff.code} berhasil diperbarui menjadi Rp ${laborRateInput.toLocaleString()} / ${editingLaborTariff.uom}`);
    setEditingLaborTariff(null);
  };

  const handleSaveExciseTariff = () => {
    if (!editingExciseTariff) return;
    dbService.updateExciseTariff(editingExciseTariff.id, {
      hjePerPack: exciseHjeInput,
      excisePerPack: exciseRateInput,
      sheetsToPiecesConversion: sheetsConvInput,
    });
    showToast(`Konfigurasi Pita Cukai ${editingExciseTariff.brand} berhasil disimpan.`);
    setEditingExciseTariff(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-800 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold animate-fade-in border border-emerald-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" /> Master Data Pabrik & Konfigurasi SGW ONE
          </h2>
          <p className="text-xs text-slate-500">
            Katalog terpadu bahan baku TSG, Kemasan, WIP Batangan, Produk Jadi, 2-Tier BOM, Tarif Pita Cukai DJBC, dan Tarif Borongan.
          </p>
        </div>

        {/* Subtab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold flex-wrap">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'items' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Katalog Barang ({state.items.length})
          </button>
          <button
            onClick={() => setActiveTab('bom')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'bom' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Formula 2-Tier BOM ({state.boms.length})
          </button>
          <button
            onClick={() => setActiveTab('hpp')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'hpp'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-amber-600" />
            <span>Kalkulator HPP</span>
          </button>
          <button
            onClick={() => setActiveTab('excise')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'excise' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pita Cukai & HJE (3)
          </button>
          <button
            onClick={() => setActiveTab('tariffs')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'tariffs' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tarif Upah Meja ({state.laborTariffs.length})
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'partners' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mitra Usaha
          </button>
          <button
            onClick={() => setActiveTab('coa')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'coa' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bagan Akun ({state.chartOfAccounts.length})
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'company'
                ? 'bg-indigo-600 text-white shadow-sm font-black'
                : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70 font-semibold'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Profil Pabrik (Kop Dokumen)</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: ITEMS CATALOG */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode atau nama item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none shadow-xs"
                />
              </div>

              <select
                value={itemTypeFilter}
                onChange={(e) => setItemTypeFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-1 focus:ring-amber-500 focus:outline-none shadow-xs"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="RAW_MATERIAL">Bahan Baku (TSG & Papir)</option>
                <option value="PACKAGING">Bahan Kemasan (Etiket/Slop/Bal)</option>
                <option value="EXCISE_STAMP">Pita Cukai Resmi</option>
                <option value="SEMI_FINISHED">WIP (Batangan Rokok)</option>
                <option value="FINISHED_GOODS">Produk Jadi (FG)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setIsItemPrintOpen(true)}
                className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                title="Cetak atau Export Katalog Barang"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Cetak Katalog (Print)</span>
              </button>

              <button
                onClick={() => {
                  setItemToEdit(null);
                  setIsItemModalOpen(true);
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-amber-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Item Baru</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Daftar item inventory, bahan baku, pita cukai & produk jadi SKT</span>
            <span>
              Menampilkan <strong className="text-slate-900">{filteredItems.length}</strong> dari{' '}
              {state.items.length} item
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Kode Item</th>
                  <th className="py-2.5 px-3">Nama Barang & Merek</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Satuan Stok</th>
                  <th className="py-2.5 px-3">Satuan Beli / Rasio</th>
                  <th className="py-2.5 px-3 text-right">Biaya Rata-Rata</th>
                  <th className="py-2.5 px-3 text-right">Min/Max Stok</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{item.itemCode}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{item.itemName}</div>
                      {item.brand && <div className="text-[10px] text-amber-700 font-semibold">{item.brand}</div>}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.itemType === 'RAW_MATERIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : item.itemType === 'PACKAGING'
                            ? 'bg-blue-100 text-blue-800'
                            : item.itemType === 'EXCISE_STAMP'
                            ? 'bg-rose-100 text-rose-800'
                            : item.itemType === 'SEMI_FINISHED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.itemType === 'EXCISE_STAMP' ? 'PITA CUKAI' : item.itemType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{item.stockUom}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {item.purchaseUom !== item.stockUom ? (
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[11px]">
                          1 {item.purchaseUom} = {item.conversionFactor} {item.stockUom}
                        </span>
                      ) : (
                        item.purchaseUom
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      Rp {item.averageCost.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 font-mono text-[11px]">
                      {item.minStock.toLocaleString()} / {item.maxStock.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Lihat Detail Item"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setItemToEdit(item);
                            setIsItemModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: 2-TIER BOM */}
      {activeTab === 'bom' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border border-amber-200">
            <div className="flex items-start gap-3">
              <Calculator className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950 text-xs">Simulasi HPP Standar (Cost Roll-up)</span>
                <p className="text-[11px] text-amber-900 mt-0.5">
                  Hitung estimasi biaya bahan riil, upah giling/packing, pita cukai per batang, bungkus, slop, atau bal.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setBomToEdit(null);
                  setIsBomModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-amber-700" />
                <span>Tambah Formula BOM</span>
              </button>
              <button
                onClick={() => setActiveTab('hpp')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 shrink-0 transition"
              >
                <span>Kalkulator HPP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-amber-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Arsitektur 2-Tier BOM Sigaret Kretek Tangan (SKT):</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-slate-600">
                <li><span className="font-semibold text-slate-800">Tier 1 - BOM Giling:</span> Tembakau Siap Giling (TSG) langsung dikonsumsi bersama Papir untuk memproduksi <span className="font-semibold text-slate-800">Batangan Rokok (WIP)</span>. Tidak ada proses blending internal.</li>
                <li><span className="font-semibold text-slate-800">Tier 2 - BOM Packing:</span> Mengemas Batangan Rokok (WIP) bersama Bungkus Etiket, Pelekatan <span className="font-semibold text-slate-800">Pita Cukai Resmi</span>, Slop Karton, dan Bal Master Box menjadi <span className="font-semibold text-slate-800">Produk Jadi (Finished Goods)</span>.</li>
                <li>Penentuan status WIP vs Finished Good ditentukan secara fleksibel saat operator melakukan input hasil kerja harian di modul produksi.</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {state.boms.map((bom) => {
              const isGiling = bom.processStage === 'GILING';
              return (
                <div
                  key={bom.id}
                  className={`bg-white rounded-xl border ${
                    isGiling ? 'border-purple-200 shadow-purple-50/50' : 'border-emerald-200 shadow-emerald-50/50'
                  } shadow-sm p-5 space-y-4 flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isGiling ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isGiling ? 'TIER 1: PROSES GILING & GUNTING' : 'TIER 2: PROSES PACKING & CUKAI'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{bom.bomNumber}</span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 mt-1.5">{bom.productName}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Standar Batch Output</div>
                        <div className="text-sm font-bold text-slate-900">
                          {bom.standardOutputQty.toLocaleString()} {bom.standardOutputUom}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Rincian Komponen Bahan:</span>
                        <span className="text-[11px] text-slate-400 font-normal">Toleransi Scrap / Susut</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-100/80 text-[10px] uppercase font-bold text-slate-600">
                              <th className="py-1.5 px-3">Kode</th>
                              <th className="py-1.5 px-3">Komponen</th>
                              <th className="py-1.5 px-3 text-right">Kebutuhan Standar</th>
                              <th className="py-1.5 px-3 text-right">Scrap</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {bom.components.map((c, idx) => (
                              <tr key={idx} className="hover:bg-white/60">
                                <td className="py-2 px-3 font-mono font-medium text-slate-800">{c.itemCode}</td>
                                <td className="py-2 px-3 font-medium text-slate-900">{c.itemName}</td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900">
                                  {c.quantity.toLocaleString()} {c.uom}
                                </td>
                                <td className="py-2 px-3 text-right text-slate-500 font-mono text-[11px]">
                                  {c.scrapPercentage}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* BOM Card Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewBom(bom)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1 transition text-[11px]"
                        title="Preview Spesifikasi & Cetak Lembar Kerja BOM"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>Preview & Cetak</span>
                      </button>
                      <button
                        onClick={() => {
                          setBomToEdit(bom);
                          setIsBomModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold flex items-center gap-1 transition text-[11px]"
                        title="Edit Formula BOM"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBOM(bom)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Formula BOM"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedHppProduct(bom.productId);
                        setActiveTab('hpp');
                      }}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Simulasi HPP</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: HPP ESTIMATION CALCULATOR */}
      {activeTab === 'hpp' && (
        <HppCalculator
          initialProductId={selectedHppProduct}
          onSaved={(msg) => showToast(msg)}
        />
      )}

      {/* SUBTAB 3: PITA CUKAI & HJE */}
      {activeTab === 'excise' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
            <div className="flex items-start gap-3">
              <Stamp className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-950">Spesifikasi Pita Cukai Resmi DJBC (Tahun Fiskal 2026):</span>
                <p className="mt-1 text-[11px]">
                  Pembelian pita cukai diperhitungkan dalam satuan <span className="font-bold">Lembaran</span>. 
                  Penerapan kemasan menggunakan satuan <span className="font-bold">Keping</span> (<span className="font-bold underline">1 Lembar = 120 Keping</span>).
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setTariffToEdit(null);
                setIsExciseModalOpen(true);
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-600/20 flex items-center gap-1.5 shrink-0 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Seri Cukai</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {state.exciseTariffs.map((tariff) => (
              <div
                key={tariff.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-rose-300 transition"
              >
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                      KODE: {tariff.tariffCode}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-1.5">{tariff.brand}</h3>
                    <div className="text-xs text-slate-500">Isi kemasan: <span className="font-bold text-slate-800">{tariff.packSize} Batang</span> / bungkus</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setTariffToEdit(tariff);
                        setIsExciseModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Edit Spesifikasi Tarif Cukai"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExcise(tariff)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Tarif Cukai"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500">Harga Jual Eceran (HJE):</span>
                    <span className="font-bold font-mono text-slate-900 text-sm">
                      Rp {tariff.hjePerPack.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500">Tarif Cukai per Bungkus:</span>
                    <span className="font-bold font-mono text-rose-700">
                      Rp {tariff.excisePerPack.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500">Konversi Lembar ke Keping:</span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      1 Lembar = {tariff.sheetsToPiecesConversion || 120} Keping
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500">Tarif Cukai per Lembar (120 keping):</span>
                    <span className="font-bold font-mono text-slate-900">
                      Rp {(tariff.excisePerPack * (tariff.sheetsToPiecesConversion || 120)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Tahun Tarif / Golongan:</span>
                    <span className="font-bold text-slate-700 font-mono">{tariff.effectiveYear || tariff.year || 2026} / {tariff.golongan}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Edit Tarif Cukai */}
          {editingExciseTariff && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">Penyesuaian Tarif Cukai & HJE</h3>
                  <button onClick={() => setEditingExciseTariff(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-500 font-medium">Merek / Seri Pita Cukai</label>
                    <div className="font-bold text-slate-900 mt-0.5">{editingExciseTariff.brand} ({editingExciseTariff.tariffCode})</div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Harga Jual Eceran (HJE) Banderol (Rp)</label>
                    <input
                      type="number"
                      value={exciseHjeInput}
                      onChange={(e) => setExciseHjeInput(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Tarif Cukai per Bungkus (Rp)</label>
                    <input
                      type="number"
                      value={exciseRateInput}
                      onChange={(e) => setExciseRateInput(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Konversi Lembar ke Keping</label>
                    <input
                      type="number"
                      value={sheetsConvInput}
                      onChange={(e) => setSheetsConvInput(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Standar resmi DJBC: 120 keping per lembar</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setEditingExciseTariff(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveExciseTariff}
                    className="px-4 py-1.5 text-xs bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: TARIF UPAH MEJA */}
      {activeTab === 'tariffs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-950">Skema Pengupahan Satuan Terkecil & Borongan Terpadu:</span>
                <p className="mt-1 text-[11px]">
                  Borong Giling & Gunting dihitung per 1 <span className="font-bold">Batang</span>. 
                  Borong Packing dihitung per 1 <span className="font-bold">Bungkus</span>. 
                  Terhubung langsung dengan simulasi HPP dan penggajian pekerja lantai pabrik.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setLaborToEdit(null);
                setIsLaborModalOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 shrink-0 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tarif Upah</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Kode Tarif</th>
                  <th className="py-2.5 px-3">Nama Paket Upah / Posisi</th>
                  <th className="py-2.5 px-3">Proses</th>
                  <th className="py-2.5 px-3">Skema Upah</th>
                  <th className="py-2.5 px-3 text-right">Tarif Efektif</th>
                  <th className="py-2.5 px-3">Satuan Terkecil</th>
                  <th className="py-2.5 px-3">Mulai Berlaku</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.laborTariffs.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{t.code}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{t.name || t.position}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{t.position}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.processType === 'GILING' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {t.processType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.laborType === 'PIECE_RATE' || t.laborType === ('BORONGAN' as any)
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {t.laborType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                      Rp {t.rate.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">per {t.uom}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{t.effectiveDate}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setLaborToEdit(t);
                            setIsLaborModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit Tarif Upah"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLabor(t)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Tarif"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 5: PARTNERS (SUPPLIERS & CUSTOMERS) */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          {/* Suppliers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-600" /> Daftar Rekanan Supplier (Pemasok TSG, Kemasan, & Pita Cukai)
              </h3>
              <button
                onClick={() => {
                  setPartnerType('SUPPLIER');
                  setPartnerToEdit(null);
                  setIsPartnerModalOpen(true);
                }}
                className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Supplier</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-3">Kode</th>
                    <th className="py-2.5 px-3">Nama Perusahaan Rekanan</th>
                    <th className="py-2.5 px-3">Kategori Pasokan</th>
                    <th className="py-2.5 px-3">NPWP</th>
                    <th className="py-2.5 px-3">Term Pembayaran</th>
                    <th className="py-2.5 px-3">Kontak & Alamat</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.suppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{sup.code}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{sup.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800">
                          {sup.supplyCategory}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{sup.npwp}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{sup.paymentTermDays} Hari</td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        <div>{sup.phone} • {sup.email}</div>
                        <div className="truncate max-w-xs">{sup.address}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setPartnerType('SUPPLIER');
                              setPartnerToEdit(sup);
                              setIsPartnerModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition"
                            title="Edit Data Supplier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(sup)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Supplier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" /> Daftar Pelanggan & Distributor Rokok
              </h3>
              <button
                onClick={() => {
                  setPartnerType('CUSTOMER');
                  setPartnerToEdit(null);
                  setIsPartnerModalOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pelanggan</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-3">Kode</th>
                    <th className="py-2.5 px-3">Nama Distributor / Grosir</th>
                    <th className="py-2.5 px-3">NPWP</th>
                    <th className="py-2.5 px-3">Term Pembayaran</th>
                    <th className="py-2.5 px-3 text-right">Limit Kredit</th>
                    <th className="py-2.5 px-3">Alamat</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{cust.code}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{cust.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{cust.npwp}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{cust.paymentTermDays} Hari</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        Rp {cust.creditLimit.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-xs truncate">{cust.address}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setPartnerType('CUSTOMER');
                              setPartnerToEdit(cust);
                              setIsPartnerModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit Data Pelanggan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(cust)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Pelanggan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* SUBTAB 6: CHART OF ACCOUNTS (COA) */}
      {activeTab === 'coa' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Bagan Akun Standar Pabrik Rokok (COA):</span>
              <p className="mt-1 text-[11px] text-slate-600">
                Struktur akun sederhana dan standar pembukuan rokok kretek, mencakup pengakuan Aset Lancar, Persediaan Bahan Baku (TSG & Papir), Persediaan Pita Cukai, WIP, Produk Jadi, Hutang Usaha & Pajak (PPh 21, PPN), serta HPP dan Beban Operasional.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Kode Akun</th>
                  <th className="py-2.5 px-3">Nama Rekening / Akun</th>
                  <th className="py-2.5 px-3">Klasifikasi</th>
                  <th className="py-2.5 px-3">Posisi Normal</th>
                  <th className="py-2.5 px-3 text-right">Saldo Terkini (Trial Balance)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.chartOfAccounts.map((coa) => (
                  <tr key={coa.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{coa.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{coa.name}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          coa.type === 'ASSET'
                            ? 'bg-blue-100 text-blue-800'
                            : coa.type === 'LIABILITY'
                            ? 'bg-rose-100 text-rose-800'
                            : coa.type === 'EQUITY'
                            ? 'bg-indigo-100 text-indigo-800'
                            : coa.type === 'REVENUE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : coa.type === 'COGS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {coa.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 font-medium">
                      {coa.normalBalance}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      Rp {coa.balance.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        AKTIF
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 8: MASTER PROFIL PABRIK & KOP DOKUMEN */}
      {activeTab === 'company' && (
        <CompanyProfileTab
          initialSettings={state.companySettings}
          onSaved={(msg) => {
            showToast(msg);
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* MODAL DIALOGS */}
      {/* 1. Item Add / Edit Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
      />

      {/* 2. Item Preview / Detail Modal */}
      <ItemDetailModal
        onClose={() => setPreviewItem(null)}
        item={previewItem}
        onEdit={(item) => {
          setPreviewItem(null);
          setItemToEdit(item);
          setIsItemModalOpen(true);
        }}
      />

      {/* 3. Item Catalog Print / Export Modal */}
      <ItemCatalogPrintModal
        isOpen={isItemPrintOpen}
        onClose={() => setIsItemPrintOpen(false)}
        items={state.items}
        categoryFilter={itemTypeFilter}
      />

      {/* 4. BOM Add / Edit Modal */}
      <BomModal
        isOpen={isBomModalOpen}
        onClose={() => setIsBomModalOpen(false)}
        onSave={handleSaveBOM}
        bomToEdit={bomToEdit}
        availableItems={state.items}
      />

      {/* 5. BOM Print / Preview Spec Modal */}
      <BomPrintPreviewModal
        isOpen={!!previewBom}
        onClose={() => setPreviewBom(null)}
        bom={previewBom}
        items={state.items}
      />

      {/* 6. Excise Tariff Add / Edit Modal */}
      <ExciseModal
        isOpen={isExciseModalOpen}
        onClose={() => setIsExciseModalOpen(false)}
        onSave={handleSaveExcise}
        tariffToEdit={tariffToEdit}
      />

      {/* 7. Labor Tariff Add / Edit Modal */}
      <LaborTariffModal
        isOpen={isLaborModalOpen}
        onClose={() => setIsLaborModalOpen(false)}
        onSave={handleSaveLabor}
        tariffToEdit={laborToEdit}
      />

      {/* 8. Partner (Supplier / Customer) Add / Edit Modal */}
      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        partnerType={partnerType}
        onSaveSupplier={handleSaveSupplier}
        onSaveCustomer={handleSaveCustomer}
        partnerToEdit={partnerToEdit}
      />
    </div>
  );
};
