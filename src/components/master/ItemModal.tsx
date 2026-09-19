import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Package, Layers, AlertCircle } from 'lucide-react';
import { Item, ItemType, CigaretteCategory } from '../../types/erp';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<Item, 'id'>, editId?: string) => void;
  itemToEdit?: Item | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, onSave, itemToEdit }) => {
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<ItemType>('RAW_MATERIAL');
  const [category, setCategory] = useState<CigaretteCategory>('SKT');
  const [brand, setBrand] = useState('SGW Kuning');
  const [stockUom, setStockUom] = useState('Kg');
  const [purchaseUom, setPurchaseUom] = useState('Kg');
  const [salesUom, setSalesUom] = useState('Kg');
  const [conversionFactor, setConversionFactor] = useState(1);
  const [standardCost, setStandardCost] = useState(0);
  const [minStock, setMinStock] = useState(100);
  const [maxStock, setMaxStock] = useState(1000);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setItemCode(itemToEdit.itemCode);
      setItemName(itemToEdit.itemName);
      setItemType(itemToEdit.itemType);
      setCategory(itemToEdit.category);
      setBrand(itemToEdit.brand || '');
      setStockUom(itemToEdit.stockUom);
      setPurchaseUom(itemToEdit.purchaseUom);
      setSalesUom(itemToEdit.salesUom || itemToEdit.stockUom);
      setConversionFactor(itemToEdit.conversionFactor || 1);
      setStandardCost(itemToEdit.standardCost || 0);
      setMinStock(itemToEdit.minStock || 0);
      setMaxStock(itemToEdit.maxStock || 0);
      setNotes(itemToEdit.notes || '');
    } else {
      // Default new item
      const randomCode = `ITM-${Date.now().toString().slice(-4)}`;
      setItemCode(randomCode);
      setItemName('');
      setItemType('RAW_MATERIAL');
      setCategory('SKT');
      setBrand('SGW Kuning');
      setStockUom('Kg');
      setPurchaseUom('Kg');
      setSalesUom('Kg');
      setConversionFactor(1);
      setStandardCost(10000);
      setMinStock(50);
      setMaxStock(500);
      setNotes('');
    }
    setError('');
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode.trim() || !itemName.trim()) {
      setError('Kode Item dan Nama Barang wajib diisi.');
      return;
    }

    onSave(
      {
        itemCode: itemCode.trim().toUpperCase(),
        itemName: itemName.trim(),
        itemType,
        category,
        brand: brand.trim() || undefined,
        stockUom,
        purchaseUom,
        salesUom,
        conversionFactor: Number(conversionFactor) || 1,
        standardCost: Number(standardCost) || 0,
        averageCost: Number(standardCost) || 0,
        minStock: Number(minStock) || 0,
        maxStock: Number(maxStock) || 0,
        isActive: true,
        notes: notes.trim() || undefined,
      },
      itemToEdit?.id,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 my-8">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {itemToEdit ? 'Edit Data Master Barang' : 'Tambah Master Barang Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan material bahan baku, kemasan, pita cukai, WIP, atau produk jadi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Item *</label>
              <input
                type="text"
                required
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                placeholder="misal: MAT-TSG-01"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Barang / Material *</label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                placeholder="misal: Tembakau Siap Giling (TSG) Grade Super"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Tipe Barang</label>
              <select
                value={itemType}
                onChange={(e) => {
                  const val = e.target.value as ItemType;
                  setItemType(val);
                  if (val === 'RAW_MATERIAL') setStockUom('Kg');
                  else if (val === 'PACKAGING') setStockUom('Lembar');
                  else if (val === 'SEMI_FINISHED') setStockUom('Batang');
                  else if (val === 'FINISHED_GOODS') setStockUom('Bungkus');
                  else if (val === 'EXCISE_STAMP') setStockUom('Keping');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="RAW_MATERIAL">Bahan Baku (Raw Material)</option>
                <option value="PACKAGING">Bahan Kemasan (Packaging)</option>
                <option value="SEMI_FINISHED">WIP / Batangan Rokok</option>
                <option value="FINISHED_GOODS">Produk Jadi (Finished Goods)</option>
                <option value="EXCISE_STAMP">Pita Cukai Resmi DJBC</option>
                <option value="SUPPORTING">Bahan Pembantu (Lem/OPP)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Rokok</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CigaretteCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="SKT">SKT (Sigaret Kretek Tangan)</option>
                <option value="SKM">SKM (Sigaret Kretek Mesin)</option>
                <option value="SKPT">SKPT (Sigaret Kelembak Menyan)</option>
                <option value="NON_CIGARETTE">Non-Cigarette (Umum)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Merek Hasil Tembakau</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                placeholder="misal: SGW Kuning"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" /> Satuan Inventaris & Rasio Konversi
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Satuan Dasar Stok (Stock UOM)</label>
                <select
                  value={stockUom}
                  onChange={(e) => setStockUom(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold bg-white text-slate-900"
                >
                  <option value="Kg">Kg (Kilogram)</option>
                  <option value="Batang">Batang</option>
                  <option value="Bungkus">Bungkus (Pack)</option>
                  <option value="Lembar">Lembar</option>
                  <option value="Keping">Keping (Pita Cukai)</option>
                  <option value="Slop">Slop (10 Bungkus)</option>
                  <option value="Bal">Bal (200 Bungkus)</option>
                  <option value="Karton">Karton / Master Box</option>
                  <option value="Roll">Roll</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Satuan Pembelian (PO)</label>
                <input
                  type="text"
                  value={purchaseUom}
                  onChange={(e) => setPurchaseUom(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  placeholder="misal: Bal, Lembar, Kg"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Faktor Konversi ke Stok</label>
                <input
                  type="number"
                  step="any"
                  min="0.001"
                  value={conversionFactor}
                  onChange={(e) => setConversionFactor(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  1 {purchaseUom} = {conversionFactor} {stockUom}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Biaya Standar / HPP (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono">Rp</span>
                <input
                  type="number"
                  min="0"
                  value={standardCost}
                  onChange={(e) => setStandardCost(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stok Minimum (Alert)</label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kapasitas Maksimum</label>
              <input
                type="number"
                min="0"
                value={maxStock}
                onChange={(e) => setMaxStock(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan / Spesifikasi Teknis</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              placeholder="Kadar air tembakau, dimensi etiket, standar gramatur, dll."
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>{itemToEdit ? 'Simpan Perubahan' : 'Tambahkan Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
