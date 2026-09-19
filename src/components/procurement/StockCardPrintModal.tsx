import React, { useState } from 'react';
import {
  X,
  Printer,
  FileSpreadsheet,
  Building2,
  Calendar,
  Filter,
  Layers,
} from 'lucide-react';
import {
  Item,
  StockInventory,
  StockMovement,
  CompanySettings,
  Warehouse,
} from '../../types/erp';

interface StockCardPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  warehouses: Warehouse[];
  stockInventory: StockInventory[];
  stockMovements: StockMovement[];
  companySettings: CompanySettings;
  initialItemId?: string;
}

export const StockCardPrintModal: React.FC<StockCardPrintModalProps> = ({
  isOpen,
  onClose,
  items,
  warehouses,
  stockInventory,
  stockMovements,
  companySettings,
  initialItemId,
}) => {
  if (!isOpen) return null;

  const [selectedItemId, setSelectedItemId] = useState<string>(
    initialItemId || items[0]?.id || '',
  );
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('ALL');

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const selectedInv = stockInventory.find((s) => s.itemId === selectedItemId);

  // Filter movements
  const movements = stockMovements
    .filter((m) => {
      const matchItem = m.itemId === selectedItemId;
      const matchWh =
        selectedWarehouseId === 'ALL' || m.warehouseId === selectedWarehouseId;
      return matchItem && matchWh;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalIn = movements.reduce((acc, m) => acc + m.qtyIn, 0);
  const totalOut = movements.reduce((acc, m) => acc + m.qtyOut, 0);
  const currentBalance = selectedInv?.qty || 0;
  const currentValuation = selectedInv?.totalValuation || 0;
  const averageCost = selectedInv?.averageCost || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:border-none print:shadow-none print:m-0 print:w-full">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Buku Kartu Stok Gudang (Stock Card Ledger)
              </span>
            </div>

            {/* Quick Filter Item & Warehouse */}
            <div className="flex items-center gap-2">
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    [{it.itemCode}] {it.itemName}
                  </option>
                ))}
              </select>

              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <option value="ALL">Semua Gudang</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.code} - {wh.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak / Unduh PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper Area */}
        <div className="p-8 md:p-10 font-sans text-slate-900 bg-white" id="printable-stockcard">
          {/* Header Kop Surat Perusahaan */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-900 text-white flex items-center justify-center font-black text-sm">
                    SGW
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase leading-none">
                      {companySettings.companyName}
                    </h1>
                    <p className="text-[11px] text-slate-600 font-semibold tracking-wide">
                      {companySettings.subTitle || companySettings.companySubtitle || 'Pabrik Hasil Tembakau & Sigaret Kretek Tangan'}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 leading-tight pt-1">
                  {companySettings.address || companySettings.factoryAddress}
                  {companySettings.city ? `, ${companySettings.city}` : ''}{' '}
                  {companySettings.postalCode ? `Kode Pos ${companySettings.postalCode}` : ''}
                  <br />
                  Telp: {companySettings.phone} | Email: {companySettings.email}
                </p>
              </div>

              <div className="text-right border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-[10px] space-y-0.5">
                <div className="font-bold text-slate-900">LEGALITAS PABRIK</div>
                <div>
                  NPPBKC:{' '}
                  <span className="font-mono font-bold text-slate-950">
                    {companySettings.nppbkc}
                  </span>
                </div>
                <div>
                  NPWP:{' '}
                  <span className="font-mono text-slate-800">{companySettings.npwp}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-black tracking-wider uppercase underline underline-offset-4 text-slate-950">
              KARTU STOK PERSEDIAAN GUDANG
            </h2>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              STOCK LEDGER CARD & MUTASI HISTORIS
            </div>
          </div>

          {/* Item Specification Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-slate-300 bg-slate-50/80 rounded-xl mb-6 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">KODE BARANG</span>
              <div className="font-mono font-black text-sm text-slate-900">
                {selectedItem?.itemCode || '-'}
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">NAMA BARANG</span>
              <div className="font-bold text-sm text-slate-900">
                {selectedItem?.itemName || '-'}
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">KATEGORI & SATUAN</span>
              <div className="font-medium text-slate-800">
                {selectedItem?.itemType} ({selectedItem?.stockUom})
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">BIAYA RATA-RATA (HPP)</span>
              <div className="font-mono font-bold text-emerald-800">
                Rp {averageCost.toLocaleString()} / {selectedItem?.stockUom}
              </div>
            </div>
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-6 text-center text-xs">
            <div className="border border-slate-200 rounded-xl p-3 bg-blue-50/40">
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Masuk</span>
              <div className="font-mono font-black text-blue-900 text-base mt-0.5">
                +{totalIn.toLocaleString()} {selectedItem?.stockUom}
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl p-3 bg-rose-50/40">
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Keluar</span>
              <div className="font-mono font-black text-rose-900 text-base mt-0.5">
                -{totalOut.toLocaleString()} {selectedItem?.stockUom}
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl p-3 bg-emerald-50/40">
              <span className="text-[10px] uppercase font-bold text-slate-500">Saldo Akhir Fisik</span>
              <div className="font-mono font-black text-emerald-950 text-base mt-0.5">
                {currentBalance.toLocaleString()} {selectedItem?.stockUom}
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl p-3 bg-amber-50/40">
              <span className="text-[10px] uppercase font-bold text-slate-500">Nilai Valuasi Total</span>
              <div className="font-mono font-black text-amber-950 text-base mt-0.5">
                Rp {currentValuation.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Chronological Movements Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center border-r border-slate-300">No</th>
                  <th className="py-2.5 px-3 w-24 border-r border-slate-300">Tanggal</th>
                  <th className="py-2.5 px-3 w-28 border-r border-slate-300">Jenis Mutasi</th>
                  <th className="py-2.5 px-3 w-36 border-r border-slate-300">No. Dokumen</th>
                  <th className="py-2.5 px-3 w-24 text-right border-r border-slate-300 text-blue-900">
                    Masuk (+)
                  </th>
                  <th className="py-2.5 px-3 w-24 text-right border-r border-slate-300 text-rose-900">
                    Keluar (-)
                  </th>
                  <th className="py-2.5 px-3 w-24 text-right border-r border-slate-300 bg-slate-50 font-black">
                    Saldo
                  </th>
                  <th className="py-2.5 px-3">Keterangan / Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900 text-[11px]">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                      Belum ada catatan mutasi stok untuk barang ini.
                    </td>
                  </tr>
                ) : (
                  movements.map((m, index) => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-center border-r border-slate-200 font-mono text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono">{m.date}</td>
                      <td className="py-2 px-3 border-r border-slate-200 font-bold text-[10px]">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            m.qtyIn > 0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {m.movementType}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-slate-800">
                        {m.referenceNumber}
                      </td>
                      <td className="py-2 px-3 text-right border-r border-slate-200 font-mono font-bold text-blue-700">
                        {m.qtyIn > 0 ? `+${m.qtyIn.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right border-r border-slate-200 font-mono font-bold text-rose-700">
                        {m.qtyOut > 0 ? `-${m.qtyOut.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right border-r border-slate-200 font-mono font-black text-slate-900 bg-slate-50/80">
                        {m.balanceQty.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-slate-600 text-[10px]">{m.notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-2 grid grid-cols-2 gap-12 text-center text-xs">
            <div className="border border-slate-300 rounded-xl p-3 space-y-12">
              <div className="font-bold text-slate-700">Penanggung Jawab Gudang:</div>
              <div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  ( .................................... )
                </div>
                <div className="text-[10px] text-slate-500">Kepala Gudang Bahan & Hasil Olah</div>
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 space-y-12">
              <div className="font-bold text-slate-700">Pemeriksa Pembukuan (Auditor Internal):</div>
              <div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  {companySettings.directorName
                    ? companySettings.directorName
                    : '( .................................... )'}
                </div>
                <div className="text-[10px] text-slate-500">Penanggung Jawab Pabrik / NPPBKC</div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
            <div>{companySettings.footerText}</div>
            <div>Dicetak melalui Sistem SGW ONE Enterprise pada: {new Date().toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
