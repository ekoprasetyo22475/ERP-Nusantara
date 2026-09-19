import React, { useState } from 'react';
import {
  Building,
  Save,
  RotateCcw,
  CheckCircle2,
  FileText,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Printer,
  Sparkles,
  Eye,
} from 'lucide-react';
import { CompanySettings } from '../../types/erp';
import { dbService } from '../../services/mockDatabase';

interface CompanyProfileTabProps {
  initialSettings: CompanySettings;
  onSaved: (msg: string) => void;
}

export const CompanyProfileTab: React.FC<CompanyProfileTabProps> = ({
  initialSettings,
  onSaved,
}) => {
  const [formData, setFormData] = useState<CompanySettings>({
    ...initialSettings,
    city: initialSettings.city || 'Kudus',
    postalCode: initialSettings.postalCode || '59341',
    bankName: initialSettings.bankName || 'Bank Mandiri KC Kudus',
    bankAccountNo: initialSettings.bankAccountNo || '135-00-1928374-1',
    bankAccountHolder: initialSettings.bankAccountHolder || initialSettings.companyName,
  });

  const [previewDocType, setPreviewDocType] = useState<'PO' | 'GRN' | 'INVOICE' | 'CK4'>('PO');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.updateCompanySettings(formData);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
    onSaved('Profil perusahaan & format kop dokumen berhasil disimpan!');
  };

  const handleReset = () => {
    if (window.confirm('Reset data profil perusahaan kembali ke data bawaan PT SGW Nusantara?')) {
      const defaultData: CompanySettings = {
        id: 'comp-1',
        companyName: 'PT SGW NUSANTARA MAKMUR',
        subTitle: 'Pabrik Hasil Tembakau & Sigaret Kretek Tangan',
        address: 'Kawasan Industri Kretek Terpadu, Jl. Lingkar Timur No. 88, Kudus, Jawa Tengah',
        city: 'Kudus',
        postalCode: '59341',
        npwp: '01.345.678.9-506.000',
        nib: '9120003418291',
        nppbkc: '0123456789-SKT-II',
        customsOffice: 'KPPBC TMP C KUDUS',
        phone: '+62 291 432188',
        email: 'finance@sgw-nusantara.co.id',
        directorName: '',
        headerText: 'PT SGW NUSANTARA MAKMUR — SISTEM INFORMASI ENTERPRISE TERPADU',
        footerText: 'Dokumen Sah Resmi Pabrik Hasil Tembakau — SGW ONE NUSANTARA',
        ppnRate: 11,
        bankName: 'Bank Mandiri KC Kudus',
        bankAccountNo: '135-00-1928374-1',
        bankAccountHolder: 'PT SGW NUSANTARA MAKMUR',
      };
      setFormData(defaultData);
      dbService.updateCompanySettings(defaultData);
      onSaved('Data profil perusahaan dikembalikan ke konfigurasi standar.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-3.5 shadow-xs">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
          <Building className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-indigo-950 text-sm">
              Master Profil Perusahaan & Konfigurasi Kop Surat Resmi
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-200 text-indigo-800">
              Single Source of Truth
            </span>
          </div>
          <p className="text-indigo-900/90 text-xs leading-relaxed">
            Data profil di bawah ini menjadi identitas hukum resmi pabrik dan otomatis dicetak sebagai 
            <strong> Kop Dokumen (Letterhead)</strong> pada seluruh modul: <strong>Purchase Order (PO)</strong>, 
            <strong> Surat Penerimaan Barang (GRN)</strong>, <strong>Faktur Tagihan (AP & AR)</strong>, 
            <strong> Surat Jalan Pengiriman (DO)</strong>, <strong>SPK Produksi</strong>, serta 
            <strong> Laporan Cukai Resmi DJBC (CSCK-3, CSCK-9, CK-4)</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORM SECTION (7 cols on lg) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
          {/* Card 1: Identitas Pokok & Merek Perusahaan */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Identitas Entitas & Legalitas Pokok</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Badan Usaha</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="text-slate-700 font-bold block mb-1">
                  Nama Badan Usaha / PT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Contoh: PT SGW NUSANTARA MAKMUR"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-700 font-bold block mb-1">
                  Sub-Judul / Klasifikasi Industri
                </label>
                <input
                  type="text"
                  value={formData.subTitle}
                  onChange={(e) => handleChange('subTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Contoh: Pabrik Hasil Tembakau & Sigaret Kretek Tangan"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Penanggung Jawab Pabrik / NPPBKC
                </label>
                <input
                  type="text"
                  value={formData.directorName || ''}
                  onChange={(e) => handleChange('directorName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Kosongkan jika belum ditentukan"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Tercetak pada kolom tanda tangan dokumen resmi</span>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Nomor Induk Berusaha (NIB)
                </label>
                <input
                  type="text"
                  value={formData.nib}
                  onChange={(e) => handleChange('nib', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="13 Digit NIB OSS"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Legalitas Kepabeanan (Bea Cukai) & Perpajakan */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-black text-slate-900">Legalitas Cukai (DJBC) & Pajak (DJP)</h3>
              </div>
              <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">Wajib di Dokumen Cukai</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  NPPBKC (Nomor Izin Cukai Pabrik) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nppbkc}
                  onChange={(e) => handleChange('nppbkc', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs font-bold text-rose-800 focus:ring-1 focus:ring-rose-500 focus:outline-none bg-rose-50/30"
                  placeholder="Contoh: 0123456789-SKT-II"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Wajib tercantum di Faktur, Surat Jalan, dan Laporan CK</span>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Kantor Pengawasan Bea Cukai (KPPBC) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customsOffice}
                  onChange={(e) => handleChange('customsOffice', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Contoh: KPPBC TMP C KUDUS"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  NPWP Perusahaan (16 Digit) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.npwp}
                  onChange={(e) => handleChange('npwp', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="01.345.678.9-506.000"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Tarif Standar PPN (%)
                </label>
                <input
                  type="number"
                  value={formData.ppnRate}
                  onChange={(e) => handleChange('ppnRate', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  min="0"
                  max="100"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Tarif PPN umum transaksi komersial (11% atau 12%)</span>
              </div>
            </div>
          </div>

          {/* Card 3: Lokasi Pabrik & Kontak */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900">Alamat Pabrik & Kontak Resmi</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Head Office & Factory</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-3">
                <label className="text-slate-700 font-bold block mb-1">
                  Alamat Lengkap Pabrik / Gudang Pusat <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Nama jalan, nomor, kawasan industri, kelurahan, kecamatan"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Kota / Kabupaten</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Kudus"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Kode Pos</label>
                <input
                  type="text"
                  value={formData.postalCode || ''}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="59341"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">No. Telepon Pabrik</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="+62 291 432188"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-slate-700 font-bold block mb-1">Email Resmi Perusahaan</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="finance@sgw-nusantara.co.id"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Rekening Resmi Pembayaran & Catatan Kop Dokumen */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-black text-slate-900">Rekening Bank Resmi & Slogan Dokumen</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Payment Instruction</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Nama Bank</label>
                <input
                  type="text"
                  value={formData.bankName || ''}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  placeholder="Bank Mandiri / BCA / BRI"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  value={formData.bankAccountNo || ''}
                  onChange={(e) => handleChange('bankAccountNo', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  placeholder="135-00-1928374-1"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Atas Nama Rekening</label>
                <input
                  type="text"
                  value={formData.bankAccountHolder || ''}
                  onChange={(e) => handleChange('bankAccountHolder', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  placeholder="PT SGW NUSANTARA MAKMUR"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-slate-700 font-bold block mb-1">Teks Header Dokumen (Kop Surat)</label>
                <input
                  type="text"
                  value={formData.headerText}
                  onChange={(e) => handleChange('headerText', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  placeholder="Slogan atau teks penegas di kop atas dokumen"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-slate-700 font-bold block mb-1">Teks Catatan Kaki (Footer Dokumen)</label>
                <input
                  type="text"
                  value={formData.footerText}
                  onChange={(e) => handleChange('footerText', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  placeholder="Pernyataan keabsahan dokumen di bagian bawah cetakan"
                />
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Standar SGW</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-700/20 flex items-center gap-2 transition active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Konfigurasi Profil</span>
            </button>
          </div>
        </form>

        {/* LIVE LETTERHEAD PREVIEW SECTION (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-black text-slate-900">Live Preview Kop Dokumen Resmi</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Hasil Cetak Otomatis
            </span>
          </div>

          {/* Document Type Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setPreviewDocType('PO')}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                previewDocType === 'PO' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PO
            </button>
            <button
              type="button"
              onClick={() => setPreviewDocType('GRN')}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                previewDocType === 'GRN' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              GRN
            </button>
            <button
              type="button"
              onClick={() => setPreviewDocType('INVOICE')}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                previewDocType === 'INVOICE' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faktur / Inv
            </button>
            <button
              type="button"
              onClick={() => setPreviewDocType('CK4')}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                previewDocType === 'CK4' ? 'bg-white text-rose-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bea Cukai
            </button>
          </div>

          {/* Realistic Paper Preview Card */}
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-lg p-6 space-y-5 text-slate-900 relative overflow-hidden font-sans">
            {/* Paper Corner Watermark / Tag */}
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-amber-500/10 rotate-45 pointer-events-none" />

            {/* Official Letterhead Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xl shrink-0 shadow-xs border border-amber-400/30">
                SGW
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm tracking-tight truncate">
                    {formData.companyName || 'PT SGW NUSANTARA MAKMUR'}
                  </h4>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    NPPBKC: {formData.nppbkc || '-'}
                  </span>
                </div>

                <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wide mt-0.5">
                  {formData.subTitle || 'Pabrik Hasil Tembakau & Sigaret Kretek Tangan'}
                </div>

                <div className="text-[10px] text-slate-600 mt-1 leading-snug">
                  {formData.address || 'Alamat Pabrik'} {formData.city ? `, ${formData.city}` : ''} {formData.postalCode || ''}
                </div>

                <div className="text-[9px] text-slate-500 mt-0.5 flex flex-wrap gap-x-2">
                  <span>Telp: {formData.phone || '-'}</span>
                  <span>•</span>
                  <span>Email: {formData.email || '-'}</span>
                  <span>•</span>
                  <span>NPWP: {formData.npwp || '-'}</span>
                </div>
              </div>
            </div>

            {/* Document Title Bar */}
            <div className="text-center py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                {previewDocType === 'PO' && 'SURAT PESANAN PEMBELIAN (PURCHASE ORDER)'}
                {previewDocType === 'GRN' && 'SURAT BUKTI PENERIMAAN BARANG (GOODS RECEIPT NOTE)'}
                {previewDocType === 'INVOICE' && 'FAKTUR PENJUALAN & PENYERAHAN BARANG (COMMERCIAL INVOICE)'}
                {previewDocType === 'CK4' && 'DOKUMEN PRODUKSI & PITA CUKAI HASIL TEMBAKAU (CK-4)'}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                Nomor: {previewDocType}-2026/09/0082 • Tanggal: 18 September 2026
              </div>
            </div>

            {/* Simulated Body Content */}
            <div className="space-y-2 text-[11px] text-slate-700 border border-dashed border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Instansi Pengawas: <strong>{formData.customsOffice}</strong></span>
                <span>NIB: <strong>{formData.nib}</strong></span>
              </div>
              
              <div className="bg-white rounded border border-slate-200 overflow-hidden text-[10px]">
                <div className="grid grid-cols-12 bg-slate-100 font-bold p-1.5 text-slate-700 border-b border-slate-200">
                  <div className="col-span-1">No</div>
                  <div className="col-span-6">Uraian Barang / Spesifikasi</div>
                  <div className="col-span-2 text-right">Kuantitas</div>
                  <div className="col-span-3 text-right">Subtotal (Rp)</div>
                </div>
                <div className="grid grid-cols-12 p-1.5 border-b border-slate-100 text-slate-800">
                  <div className="col-span-1 font-mono">1</div>
                  <div className="col-span-6 font-semibold">Tembakau Siap Giling (TSG) Grade A Kudus</div>
                  <div className="col-span-2 text-right font-mono">500 Kg</div>
                  <div className="col-span-3 text-right font-mono font-bold">45.000.000</div>
                </div>
                <div className="grid grid-cols-12 p-1.5 text-slate-800">
                  <div className="col-span-1 font-mono">2</div>
                  <div className="col-span-6 font-semibold">Papir / Kertas Rokok Bobbin 4000m</div>
                  <div className="col-span-2 text-right font-mono">20 Roll</div>
                  <div className="col-span-3 text-right font-mono font-bold">7.000.000</div>
                </div>
              </div>

              {/* Payment Instruction box in invoice/PO */}
              <div className="p-2 rounded bg-slate-100/70 border border-slate-200 text-[9px] text-slate-600 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800">Instruksi Pembayaran Resmi:</span>{' '}
                  {formData.bankName} No. Rek: <span className="font-mono font-bold text-slate-900">{formData.bankAccountNo}</span> a.n {formData.bankAccountHolder}
                </div>
                <span className="text-slate-500 font-mono">PPN: {formData.ppnRate}%</span>
              </div>
            </div>

            {/* Official Signatures Section */}
            <div className="grid grid-cols-2 gap-6 pt-2 text-[10px] text-center">
              <div>
                <div className="text-slate-500 mb-10">Penerima / Rekanan,</div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  ( .................................... )
                </div>
              </div>
              <div>
                <div className="text-slate-500 mb-10">
                  {formData.city || 'Kudus'}, 18 September 2026<br />
                  <strong>{formData.companyName}</strong>
                </div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  {formData.directorName ? formData.directorName : '( .................................... )'}
                </div>
                <div className="text-[8px] text-slate-400">Penanggung Jawab Pabrik / NPPBKC</div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="border-t border-slate-200 pt-2 text-[8px] text-slate-400 text-center uppercase tracking-wider">
              {formData.footerText || 'Dokumen Sah Resmi Pabrik Hasil Tembakau — SGW ONE NUSANTARA'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
