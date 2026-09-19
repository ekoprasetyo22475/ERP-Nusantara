import React, { useState, useEffect } from 'react';
import { X, Save, Users, AlertCircle } from 'lucide-react';
import { ProductionLaborTariff } from '../../types/erp';

interface LaborTariffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tariffData: Omit<ProductionLaborTariff, 'id'>, editId?: string) => void;
  tariffToEdit?: ProductionLaborTariff | null;
}

export const LaborTariffModal: React.FC<LaborTariffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tariffToEdit,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [processType, setProcessType] = useState<string>('GILING');
  const [laborType, setLaborType] = useState<ProductionLaborTariff['laborType']>('BORONGAN');
  const [rate, setRate] = useState(30);
  const [uom, setUom] = useState('Batang');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tariffToEdit) {
      setCode(tariffToEdit.code);
      setName(tariffToEdit.name || tariffToEdit.position);
      setProcessType(tariffToEdit.processType);
      setLaborType(tariffToEdit.laborType);
      setRate(tariffToEdit.rate);
      setUom(tariffToEdit.uom);
      setEffectiveDate(tariffToEdit.effectiveDate);
    } else {
      setCode(`UPH-${Date.now().toString().slice(-4)}`);
      setName('');
      setProcessType('GILING');
      setLaborType('BORONGAN');
      setRate(30);
      setUom('Batang');
      setEffectiveDate(new Date().toISOString().split('T')[0]);
    }
    setError('');
  }, [tariffToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Kode dan Nama Tarif Upah wajib diisi.');
      return;
    }

    onSave(
      {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        position: name.trim(),
        processType,
        laborType,
        rate: Number(rate) || 0,
        uom,
        effectiveDate,
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
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {tariffToEdit ? 'Edit Tarif Upah Kerja Meja' : 'Tambah Tarif Upah Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Standar biaya tenaga kerja langsung (borongan & harian lantai produksi)
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
              <label className="block font-semibold text-slate-700 mb-1">Kode Tarif *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Berlaku</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Tarif / Posisi Kerja *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              placeholder="misal: Borongan Giling & Gunting Meja 12 Batang"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tahapan Proses</label>
              <select
                value={processType}
                onChange={(e) => setProcessType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white"
              >
                <option value="GILING">GILING (Meja Pelinting)</option>
                <option value="GUNTING">GUNTING (Perapian Batang)</option>
                <option value="PACKING">PACKING (Pengepakan Bungkus)</option>
                <option value="BANDROL">BANDROL (Pelekatan Cukai)</option>
                <option value="MANDOR">MANDOR (Supervisi)</option>
                <option value="QC">QC (Pemeriksaan Kualitas)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipe Upah</label>
              <select
                value={laborType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setLaborType(val);
                  if (val === 'DAILY') setUom('Hari');
                  else if (val === 'MONTHLY') setUom('Bulan');
                  else setUom('Batang');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white"
              >
                <option value="PIECE_RATE">PIECE_RATE (Borongan Output)</option>
                <option value="DAILY">DAILY (Harian Tetap)</option>
                <option value="MONTHLY">MONTHLY (Bulanan)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
            <div>
              <label className="block font-semibold text-amber-950 mb-1">Nominal Tarif (Rp)</label>
              <input
                type="number"
                min="0"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg font-mono font-bold text-slate-900 bg-white text-base"
              />
            </div>
            <div>
              <label className="block font-semibold text-amber-950 mb-1">Satuan Basis (UOM)</label>
              <input
                type="text"
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg font-bold text-slate-900 bg-white"
                placeholder="Batang, Bungkus, Hari"
              />
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
              <span>{tariffToEdit ? 'Simpan Tarif' : 'Tambahkan Tarif'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
