import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { BOM, BOMComponent, Item } from '../../types/erp';

interface BomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bomData: Omit<BOM, 'id'>, editId?: string) => void;
  bomToEdit?: BOM | null;
  availableItems: Item[];
}

export const BomModal: React.FC<BomModalProps> = ({
  isOpen,
  onClose,
  onSave,
  bomToEdit,
  availableItems,
}) => {
  const [bomNumber, setBomNumber] = useState('');
  const [processStage, setProcessStage] = useState<'GILING' | 'PACKING'>('GILING');
  const [productId, setProductId] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [standardOutputQty, setStandardOutputQty] = useState(10000);
  const [standardOutputUom, setStandardOutputUom] = useState('Batang');
  const [components, setComponents] = useState<BOMComponent[]>([]);
  const [error, setError] = useState('');

  // Target products depending on stage
  const eligibleProducts = availableItems.filter((i) =>
    processStage === 'GILING' ? i.itemType === 'SEMI_FINISHED' : i.itemType === 'FINISHED_GOODS',
  );

  useEffect(() => {
    if (bomToEdit) {
      setBomNumber(bomToEdit.bomNumber);
      setProcessStage(bomToEdit.processStage);
      setProductId(bomToEdit.productId);
      setVersion(bomToEdit.version);
      setStandardOutputQty(bomToEdit.standardOutputQty);
      setStandardOutputUom(bomToEdit.standardOutputUom);
      setComponents(bomToEdit.components ? [...bomToEdit.components] : []);
    } else {
      const isG = processStage === 'GILING';
      setBomNumber(`BOM-${processStage}-${Date.now().toString().slice(-4)}`);
      setVersion('v1.0');
      setStandardOutputQty(isG ? 10000 : 1000);
      setStandardOutputUom(isG ? 'Batang' : 'Bungkus');
      const defaultProd = eligibleProducts[0];
      setProductId(defaultProd ? defaultProd.id : '');

      // Suggest initial ingredients
      if (isG) {
        const tsg = availableItems.find((i) => i.itemCode.includes('TSG') || i.itemType === 'RAW_MATERIAL');
        const papir = availableItems.find((i) => i.itemCode.includes('PPR') || i.itemName.toLowerCase().includes('papir'));
        const initComps: BOMComponent[] = [];
        if (tsg) {
          initComps.push({
            itemId: tsg.id,
            itemCode: tsg.itemCode,
            itemName: tsg.itemName,
            quantity: 11.5,
            uom: tsg.stockUom,
            scrapPercentage: 2.0,
          });
        }
        if (papir) {
          initComps.push({
            itemId: papir.id,
            itemCode: papir.itemCode,
            itemName: papir.itemName,
            quantity: 10000,
            uom: papir.stockUom,
            scrapPercentage: 1.5,
          });
        }
        setComponents(initComps);
      } else {
        const wip = availableItems.find((i) => i.itemType === 'SEMI_FINISHED');
        const pack = availableItems.find((i) => i.itemCode.includes('ETK') || i.itemName.toLowerCase().includes('bungkus') || i.itemName.toLowerCase().includes('etiket'));
        const cukai = availableItems.find((i) => i.itemType === 'EXCISE_STAMP');
        const slop = availableItems.find((i) => i.itemCode.includes('SLP') || i.itemName.toLowerCase().includes('slop'));
        const initComps: BOMComponent[] = [];
        if (wip) {
          initComps.push({
            itemId: wip.id,
            itemCode: wip.itemCode,
            itemName: wip.itemName,
            quantity: 12000,
            uom: 'Batang',
            scrapPercentage: 0.5,
          });
        }
        if (pack) {
          initComps.push({
            itemId: pack.id,
            itemCode: pack.itemCode,
            itemName: pack.itemName,
            quantity: 1000,
            uom: pack.stockUom,
            scrapPercentage: 1.0,
          });
        }
        if (cukai) {
          initComps.push({
            itemId: cukai.id,
            itemCode: cukai.itemCode,
            itemName: cukai.itemName,
            quantity: 1000,
            uom: 'Keping',
            scrapPercentage: 0.2,
          });
        }
        if (slop) {
          initComps.push({
            itemId: slop.id,
            itemCode: slop.itemCode,
            itemName: slop.itemName,
            quantity: 100,
            uom: 'Lembar',
            scrapPercentage: 0.5,
          });
        }
        setComponents(initComps);
      }
    }
    setError('');
  }, [bomToEdit, isOpen, processStage]);

  if (!isOpen) return null;

  const handleAddComponent = () => {
    const candidate = availableItems[0];
    if (!candidate) return;
    setComponents([
      ...components,
      {
        itemId: candidate.id,
        itemCode: candidate.itemCode,
        itemName: candidate.itemName,
        quantity: 1,
        uom: candidate.stockUom,
        scrapPercentage: 0,
      },
    ]);
  };

  const handleRemoveComponent = (idx: number) => {
    setComponents(components.filter((_, i) => i !== idx));
  };

  const handleComponentItemChange = (idx: number, newItemId: string) => {
    const found = availableItems.find((i) => i.id === newItemId);
    if (!found) return;
    const updated = [...components];
    updated[idx] = {
      ...updated[idx],
      itemId: found.id,
      itemCode: found.itemCode,
      itemName: found.itemName,
      uom: found.stockUom,
    };
    setComponents(updated);
  };

  const handleComponentQtyChange = (idx: number, qty: number) => {
    const updated = [...components];
    updated[idx].quantity = qty;
    setComponents(updated);
  };

  const handleComponentScrapChange = (idx: number, scrap: number) => {
    const updated = [...components];
    updated[idx].scrapPercentage = scrap;
    setComponents(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bomNumber.trim()) {
      setError('Nomor BOM wajib diisi.');
      return;
    }
    if (!productId) {
      setError('Produk hasil output wajib dipilih.');
      return;
    }
    if (components.length === 0) {
      setError('Daftar komponen bahan minimal 1 item.');
      return;
    }

    const selectedProd = availableItems.find((i) => i.id === productId);

    onSave(
      {
        bomNumber: bomNumber.trim().toUpperCase(),
        productId,
        productName: selectedProd ? selectedProd.itemName : 'Produk',
        processStage,
        version: version.trim() || 'v1.0',
        effectiveDate: new Date().toISOString().split('T')[0],
        components,
        standardOutputQty: Number(standardOutputQty) || 1,
        standardOutputUom,
        isActive: true,
      },
      bomToEdit?.id,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-5 border border-slate-200 my-8">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                processStage === 'GILING' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {bomToEdit ? 'Edit Formula 2-Tier BOM' : 'Buat Formula BOM Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Konfigurasi standar takaran bahan konsumsi per batch produksi Sigaret Kretek Tangan
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
          {/* Stage selection */}
          {!bomToEdit && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProcessStage('GILING')}
                className={`p-3 rounded-xl border text-left transition ${
                  processStage === 'GILING'
                    ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-black text-purple-900 text-xs">TIER 1: PROSES GILING & GUNTING</div>
                <div className="text-[11px] text-purple-700 mt-0.5">
                  Konsumsi TSG & Papir menghasilkan Batangan Rokok (WIP)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProcessStage('PACKING')}
                className={`p-3 rounded-xl border text-left transition ${
                  processStage === 'PACKING'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-black text-emerald-900 text-xs">TIER 2: PROSES PACKING & CUKAI</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  WIP Batangan + Etiket + Cukai + Slop menjadi Produk Jadi (FG)
                </div>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Formula BOM *</label>
              <input
                type="text"
                required
                value={bomNumber}
                onChange={(e) => setBomNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Produk Hasil Output *</label>
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="">Pilih Produk...</option>
                {eligibleProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.itemName} ({p.itemCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Versi Dokumen</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standar Batch Output (Qty)</label>
              <input
                type="number"
                min="1"
                required
                value={standardOutputQty}
                onChange={(e) => setStandardOutputQty(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Satuan Output (UOM)</label>
              <input
                type="text"
                value={standardOutputUom}
                onChange={(e) => setStandardOutputUom(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900"
                placeholder="Batang, Bungkus, Slop"
              />
            </div>
          </div>

          {/* Component table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800">
                Rincian Bahan Baku & Kemasan ({components.length} Komponen):
              </span>
              <button
                type="button"
                onClick={handleAddComponent}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Bahan</span>
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2 px-3">Komponen Material</th>
                    <th className="py-2 px-3 text-right">Kebutuhan Standar</th>
                    <th className="py-2 px-3">Satuan</th>
                    <th className="py-2 px-3 text-right">Scrap (%)</th>
                    <th className="py-2 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {components.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-white/60">
                      <td className="py-2 px-3">
                        <select
                          value={comp.itemId}
                          onChange={(e) => handleComponentItemChange(idx, e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs font-medium text-slate-900 bg-white"
                        >
                          {availableItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              [{item.itemCode}] {item.itemName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={comp.quantity}
                          onChange={(e) => handleComponentQtyChange(idx, Number(e.target.value))}
                          className="w-24 px-2 py-1 border border-slate-300 rounded-md font-mono font-bold text-right text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-700">{comp.uom}</td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={comp.scrapPercentage}
                          onChange={(e) => handleComponentScrapChange(idx, Number(e.target.value))}
                          className="w-16 px-2 py-1 border border-slate-300 rounded-md font-mono text-right text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              <span>{bomToEdit ? 'Simpan Formula BOM' : 'Buat Formula BOM'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
