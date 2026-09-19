import React, { useState, useEffect } from 'react';
import { X, Save, Stamp, AlertCircle } from 'lucide-react';
import { ExciseTariff } from '../../types/erp';

interface ExciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tariffData: Omit<ExciseTariff, 'id'>, editId?: string) => void;
  tariffToEdit?: ExciseTariff | null;
}

export const ExciseModal: React.FC<ExciseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tariffToEdit,
}) => {
  const [tariffCode, setTariffCode] = useState('');
  const [brand, setBrand] = useState('');
  const [packSize, setPackSize] = useState(12);
  const [hjePerPack, setHjePerPack] = useState(12000);
  const [excisePerPack, setExcisePerPack] = useState(3150);
  const [sheetsToPiecesConversion, setSheetsToPiecesConversion] = useState(120);
  const [effectiveYear, setEffectiveYear] = useState(2026);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tariffToEdit) {
      setTariffCode(tariffToEdit.tariffCode);
      setBrand(tariffToEdit.brand);
      setPackSize(tariffToEdit.packSize);
      setHjePerPack(tariffToEdit.hjePerPack);
      setExcisePerPack(tariffToEdit.excisePerPack);
      setSheetsToPiecesConversion(tariffToEdit.sheetsToPiecesConversion || 120);
      setEffectiveYear(tariffToEdit.effectiveYear || tariffToEdit.year || 2026);
    } else {
      setTariffCode(`CK-${Date.now().toString().slice(-4)}`);
      setBrand('');
      setPackSize(12);
      setHjePerPack(12000);
      setExcisePerPack(3150);
      setSheetsToPiecesConversion(120);
      setEffectiveYear(2026);
    }
    setError('');
  }, [tariffToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tariffCode.trim() || !brand.trim()) {
      setError('Kode Seri dan Merek Rokok wajib diisi.');
      return;
    }

    onSave(
      {
        tariffCode: tariffCode.trim().toUpperCase(),
        brand: brand.trim(),
        productType: 'SKT',
        golongan: 'III_B',
        packSize: Number(packSize) || 12,
        hjePerPack: Number(hjePerPack) || 0,
        excisePerPack: Number(excisePerPack) || 0,
        sheetsToPiecesConversion: Number(sheetsToPiecesConversion) || 120,
        effectiveYear: Number(effectiveYear) || 2026,
        isActive: true,
      },
      tariffToEdit?.id,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 my-8">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {tariffToEdit ? 'Edit Tarif Pita Cukai & HJE' : 'Tambah Seri Pita Cukai Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Ketetapan Tarif Cukai Hasil Tembakau & HJE Banderol Kemenkeu
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Tarif Bea Cukai *</label>
              <input
                type="text"
                required
                value={tariffCode}
                onChange={(e) => setTariffCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tahun Efektif DJBC</label>
              <input
                type="number"
                value={effectiveYear}
                onChange={(e) => setEffectiveYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Merek Rokok / Seri Banderol *</label>
            <input
              type="text"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              placeholder="misal: SGW Kuning SKT 12"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Isi Kemasan (Batang/Bks)</label>
              <input
                type="number"
                min="1"
                value={packSize}
                onChange={(e) => setPackSize(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Konversi 1 Lembar (Keping)</label>
              <input
                type="number"
                min="1"
                value={sheetsToPiecesConversion}
                onChange={(e) => setSheetsToPiecesConversion(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-200">
            <div>
              <label className="block font-semibold text-rose-950 mb-1">HJE Banderol (Rp/Bks)</label>
              <input
                type="number"
                min="0"
                value={hjePerPack}
                onChange={(e) => setHjePerPack(Number(e.target.value))}
                className="w-full px-3 py-2 border border-rose-300 rounded-lg font-mono font-bold text-rose-950 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-rose-950 mb-1">Tarif Cukai (Rp/Bks)</label>
              <input
                type="number"
                min="0"
                value={excisePerPack}
                onChange={(e) => setExcisePerPack(Number(e.target.value))}
                className="w-full px-3 py-2 border border-rose-300 rounded-lg font-mono font-bold text-rose-950 bg-white"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            Nilai tebusan per 1 Lembar pita cukai ({sheetsToPiecesConversion} keping):{' '}
            <span className="font-bold text-rose-800 font-mono">
              Rp {(excisePerPack * sheetsToPiecesConversion).toLocaleString()}
            </span>
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>{tariffToEdit ? 'Simpan Tarif' : 'Tambahkan Seri'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
