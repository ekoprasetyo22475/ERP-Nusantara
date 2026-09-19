import React, { useState, useEffect } from 'react';
import { X, Save, Users, Building, AlertCircle } from 'lucide-react';
import { Supplier, Customer } from '../../types/erp';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerType: 'SUPPLIER' | 'CUSTOMER';
  onSaveSupplier: (data: Omit<Supplier, 'id'>, editId?: string) => void;
  onSaveCustomer: (data: Omit<Customer, 'id'>, editId?: string) => void;
  partnerToEdit?: Supplier | Customer | null;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({
  isOpen,
  onClose,
  partnerType,
  onSaveSupplier,
  onSaveCustomer,
  partnerToEdit,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [npwp, setNpwp] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentTermDays, setPaymentTermDays] = useState(30);
  const [taxStatus, setTaxStatus] = useState<'TAXABLE' | 'NON_TAXABLE'>('TAXABLE');
  // Supplier specific
  const [supplyCategory, setSupplyCategory] = useState<'TSG' | 'PACKAGING' | 'EXCISE' | 'GENERAL'>('TSG');
  // Customer specific
  const [creditLimit, setCreditLimit] = useState(50000000);
  const [nik, setNik] = useState('');
  const [error, setError] = useState('');

  const isCustomer = partnerType === 'CUSTOMER';

  useEffect(() => {
    if (partnerToEdit) {
      setCode(partnerToEdit.code);
      setName(partnerToEdit.name);
      setAddress(partnerToEdit.address);
      setNpwp(partnerToEdit.npwp);
      setPhone(partnerToEdit.phone);
      setEmail(partnerToEdit.email);
      setPaymentTermDays(partnerToEdit.paymentTermDays);
      setTaxStatus(partnerToEdit.taxStatus);
      if ('supplyCategory' in partnerToEdit) {
        setSupplyCategory(partnerToEdit.supplyCategory);
      }
      if ('creditLimit' in partnerToEdit) {
        setCreditLimit(partnerToEdit.creditLimit);
      }
      if ('nik' in partnerToEdit) {
        setNik(partnerToEdit.nik || '');
      }
    } else {
      setCode(`${isCustomer ? 'CUST' : 'SUPP'}-${Date.now().toString().slice(-4)}`);
      setName('');
      setAddress('');
      setNpwp('');
      setPhone('');
      setEmail('');
      setPaymentTermDays(30);
      setTaxStatus('TAXABLE');
      setSupplyCategory('TSG');
      setCreditLimit(50000000);
      setNik('');
    }
    setError('');
  }, [partnerToEdit, partnerType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Kode dan Nama Rekanan wajib diisi.');
      return;
    }

    if (isCustomer) {
      onSaveCustomer(
        {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          address: address.trim(),
          npwp: npwp.trim(),
          nik: nik.trim(),
          phone: phone.trim(),
          email: email.trim(),
          paymentTermDays: Number(paymentTermDays) || 0,
          creditLimit: Number(creditLimit) || 0,
          taxStatus,
          isActive: true,
        },
        partnerToEdit?.id,
      );
    } else {
      onSaveSupplier(
        {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          address: address.trim(),
          npwp: npwp.trim(),
          nik: nik.trim(),
          phone: phone.trim(),
          email: email.trim(),
          paymentTermDays: Number(paymentTermDays) || 0,
          taxStatus,
          supplyCategory,
          isActive: true,
        },
        partnerToEdit?.id,
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 my-8">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isCustomer ? 'bg-emerald-100 text-emerald-800' : 'bg-cyan-100 text-cyan-800'
              }`}
            >
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {partnerToEdit
                  ? `Edit Data ${isCustomer ? 'Pelanggan / Distributor' : 'Supplier Rekanan'}`
                  : `Tambah ${isCustomer ? 'Pelanggan Baru' : 'Supplier Baru'}`}
              </h3>
              <p className="text-xs text-slate-500">
                Informasi legalitas pajak, kontak, dan ketentuan kredit
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
              <label className="block font-semibold text-slate-700 mb-1">Kode Rekanan *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Pajak</label>
              <select
                value={taxStatus}
                onChange={(e) => setTaxStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white"
              >
                <option value="TAXABLE">PKP (Pengusaha Kena Pajak)</option>
                <option value="NON_TAXABLE">Non-PKP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Lengkap Perusahaan / Toko / Perorangan *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              placeholder={isCustomer ? 'misal: PT Distribusi Rokok Nusantara' : 'misal: CV Tembakau Sejahtera'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NPWP Perusahaan</label>
              <input
                type="text"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                placeholder="00.000.000.0-000.000"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIK (Jika Perorangan)</label>
              <input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                placeholder="33190..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                placeholder="0812..."
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                placeholder="kontak@perusahaan.com"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alamat Kantor / Gudang</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              placeholder="Jl. Raya Kudus - Pati Km. 5..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Term Pembayaran (Hari)</label>
              <input
                type="number"
                min="0"
                value={paymentTermDays}
                onChange={(e) => setPaymentTermDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                placeholder="30"
              />
            </div>

            {isCustomer ? (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plafon Limit Kredit (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                />
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Pasokan</label>
                <select
                  value={supplyCategory}
                  onChange={(e) => setSupplyCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-cyan-800 bg-white"
                >
                  <option value="TSG">TSG (Tembakau Siap Giling)</option>
                  <option value="PACKAGING">Packaging (Kemasan/Papir)</option>
                  <option value="EXCISE">Bea Cukai (Pita Cukai)</option>
                  <option value="GENERAL">General / Logistik Umum</option>
                </select>
              </div>
            )}
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
              className={`px-5 py-2 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5 transition ${
                isCustomer
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-cyan-700 hover:bg-cyan-800 shadow-cyan-700/20'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Rekanan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
