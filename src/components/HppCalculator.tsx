// HPP (Cost of Goods Sold / COGS) Estimation Calculator for Sigaret Kretek Tangan (SKT)
import React, { useState, useEffect } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Layers,
  Package,
  Stamp,
  Percent,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Sparkles,
  Save,
  Info,
  Coins,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { dbService } from '../services/mockDatabase';

interface HppCalculatorProps {
  initialProductId?: string;
  onSaved?: (msg: string) => void;
}

interface ProductPreset {
  id: string;
  itemId: string;
  name: string;
  code: string;
  packSize: number;
  hjeBanderol: number;
  sellingPrice: number; // Harga Jual Produsen / Pabrik ke Distributor
  tsgKgPerBatch: number; // Kg per 10.000 batang (e.g. 11.5 kg = 1.15 gr/batang)
  tsgPricePerKg: number;
  tsgScrap: number; // %
  papirPrice: number; // per lembar
  papirScrap: number; // %
  gilingRatePerStick: number; // Borong giling+gunting per batang
  etiketPrice: number; // Bungkus etiket
  slopPrice: number; // 1 slop = 10 bungkus
  balPrice: number; // 1 bal = 20 slop = 200 bungkus
  auxPrice: number; // Lem, plastik OPP cellophane
  exciseRate: number; // Tarif pita cukai per bungkus
  packingRate: number; // Borong packing per bungkus
  bopRate: number; // Biaya Overhead Pabrik (BOP) per bungkus
}

const PRESETS: ProductPreset[] = [
  {
    id: 'skt-10',
    itemId: 'item-fg-kng10',
    name: 'SGW Kuning SKT 10',
    code: 'FG-SGW-KNG10',
    packSize: 10,
    hjeBanderol: 8750,
    sellingPrice: 6250,
    tsgKgPerBatch: 11.5,
    tsgPricePerKg: 95000,
    tsgScrap: 0.5,
    papirPrice: 20,
    papirScrap: 0.5,
    gilingRatePerStick: 30,
    etiketPrice: 400,
    slopPrice: 1200,
    balPrice: 7500,
    auxPrice: 20,
    exciseRate: 2650,
    packingRate: 150,
    bopRate: 120,
  },
  {
    id: 'skt-12',
    itemId: 'item-fg-kng12',
    name: 'SGW Kuning SKT 12',
    code: 'FG-SGW-KNG12',
    packSize: 12,
    hjeBanderol: 10325,
    sellingPrice: 7500,
    tsgKgPerBatch: 11.5,
    tsgPricePerKg: 95000,
    tsgScrap: 0.5,
    papirPrice: 20,
    papirScrap: 0.5,
    gilingRatePerStick: 34,
    etiketPrice: 450,
    slopPrice: 1200,
    balPrice: 7500,
    auxPrice: 20,
    exciseRate: 3150,
    packingRate: 150,
    bopRate: 120,
  },
  {
    id: 'skt-16',
    itemId: 'item-fg-kng16',
    name: 'SGW Kuning SKT 16',
    code: 'FG-SGW-KNG16',
    packSize: 16,
    hjeBanderol: 13775,
    sellingPrice: 9800,
    tsgKgPerBatch: 11.5,
    tsgPricePerKg: 95000,
    tsgScrap: 0.5,
    papirPrice: 20,
    papirScrap: 0.5,
    gilingRatePerStick: 42,
    etiketPrice: 550,
    slopPrice: 1200,
    balPrice: 7500,
    auxPrice: 25,
    exciseRate: 4200,
    packingRate: 150,
    bopRate: 130,
  },
];

export const HppCalculator: React.FC<HppCalculatorProps> = ({ initialProductId, onSaved }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    initialProductId
      ? PRESETS.find((p) => p.itemId === initialProductId || p.id === initialProductId)?.id || 'skt-12'
      : 'skt-12',
  );

  // Active form parameters
  const [productName, setProductName] = useState('');
  const [packSize, setPackSize] = useState(12);
  const [hjeBanderol, setHjeBanderol] = useState(10325);
  const [sellingPrice, setSellingPrice] = useState(7500);

  // Raw Materials parameters
  const [tsgKgPerBatch, setTsgKgPerBatch] = useState(11.5);
  const [tsgPricePerKg, setTsgPricePerKg] = useState(95000);
  const [tsgScrap, setTsgScrap] = useState(0.5);
  const [papirPrice, setPapirPrice] = useState(20);
  const [papirScrap, setPapirScrap] = useState(0.5);

  // Direct Labor parameters
  const [gilingRatePerStick, setGilingRatePerStick] = useState(34);
  const [packingRate, setPackingRate] = useState(150);

  // Packaging parameters
  const [etiketPrice, setEtiketPrice] = useState(450);
  const [slopPrice, setSlopPrice] = useState(1200);
  const [balPrice, setBalPrice] = useState(7500);
  const [auxPrice, setAuxPrice] = useState(20);

  // Excise & BOP
  const [exciseRate, setExciseRate] = useState(3150);
  const [bopRate, setBopRate] = useState(120);

  // Production batch simulation scale
  const [simulationBatchPacks, setSimulationBatchPacks] = useState(10000); // 10.000 bungkus (1 batch)
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Load preset data
  const loadPreset = (preset: ProductPreset) => {
    setSelectedPresetId(preset.id);
    setProductName(preset.name);
    setPackSize(preset.packSize);
    setHjeBanderol(preset.hjeBanderol);
    setSellingPrice(preset.sellingPrice);
    setTsgKgPerBatch(preset.tsgKgPerBatch);
    setTsgPricePerKg(preset.tsgPricePerKg);
    setTsgScrap(preset.tsgScrap);
    setPapirPrice(preset.papirPrice);
    setPapirScrap(preset.papirScrap);
    setGilingRatePerStick(preset.gilingRatePerStick);
    setPackingRate(preset.packingRate);
    setEtiketPrice(preset.etiketPrice);
    setSlopPrice(preset.slopPrice);
    setBalPrice(preset.balPrice);
    setAuxPrice(preset.auxPrice);
    setExciseRate(preset.exciseRate);
    setBopRate(preset.bopRate);
    setIsSavedSuccess(false);
  };

  useEffect(() => {
    const preset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[1];
    loadPreset(preset);
  }, [selectedPresetId]);

  // Calculations
  // 1. Raw Materials
  const tsgEffectiveKgPer10k = tsgKgPerBatch * (1 + tsgScrap / 100);
  const tsgCostPerStick = (tsgEffectiveKgPer10k * tsgPricePerKg) / 10000;
  const papirCostPerStick = papirPrice * (1 + papirScrap / 100);
  const rawMaterialPerStick = tsgCostPerStick + papirCostPerStick;
  const rawMaterialPerPack = rawMaterialPerStick * packSize;

  // 2. Direct Labor Giling-Gunting (Tier 1)
  const laborGilingPerStick = gilingRatePerStick;
  const laborGilingPerPack = laborGilingPerStick * packSize;

  // WIP Batangan Cost per Pack (Raw Material + Giling)
  const wipBatanganPerPack = rawMaterialPerPack + laborGilingPerPack;

  // 3. Packaging Materials
  const packagingEtiketPerPack = etiketPrice * 1.002; // 0.2% scrap
  const packagingSlopPerPack = slopPrice / 10; // 1 slop = 10 bungkus
  const packagingBalPerPack = balPrice / 200; // 1 bal = 20 slop = 200 bungkus
  const packagingAuxPerPack = auxPrice; // lem & plastik OPP
  const totalPackagingPerPack =
    packagingEtiketPerPack + packagingSlopPerPack + packagingBalPerPack + packagingAuxPerPack;

  // 4. Excise Duty (Pita Cukai DJBC)
  const totalExcisePerPack = exciseRate;

  // 5. Packing Labor & BOP
  const laborPackingPerPack = packingRate;
  const totalBopPerPack = bopRate;

  // Total Labor (Giling + Packing)
  const totalLaborPerPack = laborGilingPerPack + laborPackingPerPack;

  // TOTAL HPP STANDAR (COGS) PER BUNGKUS
  const totalHppPerPack =
    rawMaterialPerPack + totalPackagingPerPack + totalExcisePerPack + totalLaborPerPack + totalBopPerPack;

  // Units of Sale Calculations
  const hppPerSlop = totalHppPerPack * 10;
  const hppPerBal = totalHppPerPack * 200;
  const hppPerKarton = totalHppPerPack * 800; // 4 bal = 800 bungkus
  const hppTotalBatch = totalHppPerPack * simulationBatchPacks;

  // Profitability Analysis
  const grossProfitPerPack = sellingPrice - totalHppPerPack;
  const grossMarginPercent = sellingPrice > 0 ? (grossProfitPerPack / sellingPrice) * 100 : 0;
  const grossProfitPerBal = grossProfitPerPack * 200;
  const distributorMarginPerPack = hjeBanderol - sellingPrice;

  // Percentage Breakdown
  const pctExcise = (totalExcisePerPack / totalHppPerPack) * 100;
  const pctRawMaterial = (rawMaterialPerPack / totalHppPerPack) * 100;
  const pctPackaging = (totalPackagingPerPack / totalHppPerPack) * 100;
  const pctLabor = (totalLaborPerPack / totalHppPerPack) * 100;
  const pctBop = (totalBopPerPack / totalHppPerPack) * 100;

  // Handle Save to Master Data
  const handleApplyToMaster = () => {
    const currentPreset = PRESETS.find((p) => p.id === selectedPresetId);
    if (!currentPreset) return;

    const roundedHpp = Math.round(totalHppPerPack);
    dbService.updateItemStandardCost(currentPreset.itemId, roundedHpp);
    setIsSavedSuccess(true);
    if (onSaved) {
      onSaved(
        `Standard Cost ${currentPreset.name} berhasil diperbarui di Master Item menjadi Rp ${roundedHpp.toLocaleString()} / Bungkus`,
      );
    }
    setTimeout(() => setIsSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-amber-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" /> Standar Akuntansi Biaya SKT
              </span>
              <span className="text-xs text-amber-200/70 font-mono">Cost Roll-up & Pricing Simulator</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Calculator className="w-6 h-6 text-amber-400" /> Kalkulator Estimasi HPP Standar (COGS)
            </h2>
            <p className="text-xs text-amber-100/70 max-w-2xl leading-relaxed">
              Simulasi menyeluruh 5 pilar biaya produksi pabrik rokok kretek: Bahan Baku (TSG & Papir), Upah Borongan Meja (Giling & Packing), Bahan Kemasan Bertingkat, Penebusan Pita Cukai DJBC, dan Alokasi Overhead Pabrik (BOP).
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPresetId(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedPresetId === p.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Result Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-amber-200/70 block">Estimasi HPP / Bungkus:</span>
            <span className="text-lg font-black font-mono text-amber-300">
              Rp {Math.round(totalHppPerPack).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Isi {packSize} Batang</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-amber-200/70 block">Harga Jual Pabrik (HJP):</span>
            <span className="text-lg font-black font-mono text-white">
              Rp {sellingPrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">HJE Banderol: Rp {hjeBanderol.toLocaleString()}</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-amber-200/70 block">Gross Profit Pabrik:</span>
            <span
              className={`text-lg font-black font-mono ${
                grossProfitPerPack >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              Rp {Math.round(grossProfitPerPack).toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-300 block mt-0.5 font-bold">
              Margin: {grossMarginPercent.toFixed(1)}%
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-amber-200/70 block">Estimasi HPP / Bal (200 Bks):</span>
              <span className="text-base font-bold font-mono text-amber-100">
                Rp {Math.round(hppPerBal).toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleApplyToMaster}
              className={`mt-2 w-full py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                isSavedSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
              }`}
            >
              {isSavedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Tersimpan ke Master!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Simpan Standard Cost
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Composition Progress Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Komposisi Struktur Biaya HPP per Bungkus
            </h3>
            <p className="text-xs text-slate-600">
              Pita Cukai merupakan komponen biaya terbesar (~{pctExcise.toFixed(1)}%), disusul Tembakau TSG & Papir (~{pctRawMaterial.toFixed(1)}%).
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-slate-700">
            Total 100% = Rp {Math.round(totalHppPerPack).toLocaleString()}
          </div>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${pctExcise}%` }}
            className="bg-rose-500 hover:bg-rose-600 transition"
            title={`Pita Cukai: Rp ${Math.round(totalExcisePerPack).toLocaleString()} (${pctExcise.toFixed(1)}%)`}
          />
          <div
            style={{ width: `${pctRawMaterial}%` }}
            className="bg-amber-500 hover:bg-amber-600 transition"
            title={`Bahan Baku (TSG & Papir): Rp ${Math.round(rawMaterialPerPack).toLocaleString()} (${pctRawMaterial.toFixed(1)}%)`}
          />
          <div
            style={{ width: `${pctPackaging}%` }}
            className="bg-blue-500 hover:bg-blue-600 transition"
            title={`Kemasan (Etiket/Slop/Bal): Rp ${Math.round(totalPackagingPerPack).toLocaleString()} (${pctPackaging.toFixed(1)}%)`}
          />
          <div
            style={{ width: `${pctLabor}%` }}
            className="bg-emerald-500 hover:bg-emerald-600 transition"
            title={`Upah Borongan Meja: Rp ${Math.round(totalLaborPerPack).toLocaleString()} (${pctLabor.toFixed(1)}%)`}
          />
          <div
            style={{ width: `${pctBop}%` }}
            className="bg-purple-500 hover:bg-purple-600 transition"
            title={`Overhead Pabrik (BOP): Rp ${Math.round(totalBopPerPack).toLocaleString()} (${pctBop.toFixed(1)}%)`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-rose-500 shrink-0" />
            <div>
              <span className="text-slate-500 block">Pita Cukai DJBC</span>
              <span className="font-mono font-bold text-slate-900">
                Rp {Math.round(totalExcisePerPack).toLocaleString()} ({pctExcise.toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" />
            <div>
              <span className="text-slate-500 block">TSG & Papir</span>
              <span className="font-mono font-bold text-slate-900">
                Rp {Math.round(rawMaterialPerPack).toLocaleString()} ({pctRawMaterial.toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-blue-500 shrink-0" />
            <div>
              <span className="text-slate-500 block">Kemasan & Slop</span>
              <span className="font-mono font-bold text-slate-900">
                Rp {Math.round(totalPackagingPerPack).toLocaleString()} ({pctPackaging.toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0" />
            <div>
              <span className="text-slate-500 block">Upah Borongan</span>
              <span className="font-mono font-bold text-slate-900">
                Rp {Math.round(totalLaborPerPack).toLocaleString()} ({pctLabor.toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-purple-500 shrink-0" />
            <div>
              <span className="text-slate-500 block">Overhead (BOP)</span>
              <span className="font-mono font-bold text-slate-900">
                Rp {Math.round(totalBopPerPack).toLocaleString()} ({pctBop.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Parameters & Multi-Unit Scale Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 5 Pillars of Cost Parameters (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" /> Parameter Input Biaya & Simulasi Real-Time
            </h3>
            <button
              onClick={() => {
                const preset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[1];
                loadPreset(preset);
              }}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" /> Reset Nilai Standar
            </button>
          </div>

          {/* Pillar 1: Tembakau & Papir */}
          <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-bold text-slate-900">Bahan Baku: Tembakau Siap Giling (TSG) & Papir</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-800">
                Rp {Math.round(rawMaterialPerPack).toLocaleString()} / bks
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1 text-[11px]">Harga TSG / Kg</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-[11px]">Rp</span>
                  <input
                    type="number"
                    value={tsgPricePerKg}
                    onChange={(e) => setTsgPricePerKg(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 text-[11px]">TSG per 10.000 Batang</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={tsgKgPerBatch}
                    onChange={(e) => setTsgKgPerBatch(Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-1.5 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2 text-slate-400 font-mono text-[11px]">Kg</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  = {(tsgKgPerBatch / 10).toFixed(2)} gr / batang
                </span>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 text-[11px]">Harga Papir / Lembar</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-[11px]">Rp</span>
                  <input
                    type="number"
                    value={papirPrice}
                    onChange={(e) => setPapirPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 2: Direct Labor Giling & Gunting */}
          <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-bold text-slate-900">Upah Borongan Giling & Gunting (Meja Lantai 1)</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800">
                Rp {Math.round(laborGilingPerPack).toLocaleString()} / bks
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1 text-[11px]">Tarif Borong Giling-Gunting / Batang</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-[11px]">Rp</span>
                  <input
                    type="number"
                    value={gilingRatePerStick}
                    onChange={(e) => setGilingRatePerStick(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  x {packSize} batang = Rp {(gilingRatePerStick * packSize).toLocaleString()} / bungkus
                </span>
              </div>

              <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 flex flex-col justify-center">
                <span className="text-[10px] text-emerald-800 font-bold uppercase">Subtotal HPP Batangan (WIP):</span>
                <span className="text-sm font-black font-mono text-emerald-900">
                  Rp {Math.round(wipBatanganPerPack).toLocaleString()} / bungkus
                </span>
                <span className="text-[10px] text-slate-500">
                  (= Rp {(wipBatanganPerPack / packSize).toFixed(1)} / batang batangan rokok)
                </span>
              </div>
            </div>
          </div>

          {/* Pillar 3: Bahan Kemasan */}
          <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-bold text-slate-900">Bahan Kemasan: Etiket Bungkus, Slop, Bal & Lem</span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-800">
                Rp {Math.round(totalPackagingPerPack).toLocaleString()} / bks
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1 text-[11px]">Etiket / Bungkus</label>
                <input
                  type="number"
                  value={etiketPrice}
                  onChange={(e) => setEtiketPrice(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1 text-[11px]">Slop Karton (10 bks)</label>
                <input
                  type="number"
                  value={slopPrice}
                  onChange={(e) => setSlopPrice(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  = Rp {Math.round(slopPrice / 10)} / bks
                </span>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 text-[11px]">Bal Karton (200 bks)</label>
                <input
                  type="number"
                  value={balPrice}
                  onChange={(e) => setBalPrice(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  = Rp {Math.round(balPrice / 200)} / bks
                </span>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 text-[11px]">Lem & OPP Plastik</label>
                <input
                  type="number"
                  value={auxPrice}
                  onChange={(e) => setAuxPrice(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Bahan pembantu</span>
              </div>
            </div>
          </div>

          {/* Pillar 4 & 5: Pita Cukai & Packing + BOP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pillar 4: Pita Cukai */}
            <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold flex items-center justify-center">
                    4
                  </span>
                  <span className="text-xs font-bold text-slate-900">Pita Cukai Resmi DJBC</span>
                </div>
                <span className="text-xs font-mono font-bold text-rose-800">
                  Rp {exciseRate.toLocaleString()} / bks
                </span>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 text-[11px]">Tarif Cukai / Bungkus (CK-1)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-[11px]">Rp</span>
                  <input
                    type="number"
                    value={exciseRate}
                    onChange={(e) => setExciseRate(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  1 Lembar = 120 Keping (Rp {(exciseRate * 120).toLocaleString()} / lembar)
                </span>
              </div>
            </div>

            {/* Pillar 5: Borong Packing & BOP */}
            <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold flex items-center justify-center">
                    5
                  </span>
                  <span className="text-xs font-bold text-slate-900">Upah Packing & Overhead (BOP)</span>
                </div>
                <span className="text-xs font-mono font-bold text-purple-800">
                  Rp {(packingRate + bopRate).toLocaleString()} / bks
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1 text-[11px]">Borong Packing / Bks</label>
                  <input
                    type="number"
                    value={packingRate}
                    onChange={(e) => setPackingRate(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 text-[11px]">Alokasi BOP / Bks</label>
                  <input
                    type="number"
                    value={bopRate}
                    onChange={(e) => setBopRate(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Mencakup QC, Mandor, listrik pabrik & depresiasi meja
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Scale Conversion & Profitability Table (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Target Selling Price Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Target Penjualan & Margin Keuntungan
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1 text-[11px]">
                  Harga Jual Pabrik (Netto)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-[11px]">Rp</span>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-1.5 border border-slate-300 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Ke Distributor / Grosir</span>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1 text-[11px]">
                  HJE Banderol Kemenkeu
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-[11px]">Rp</span>
                  <input
                    type="number"
                    value={hjeBanderol}
                    onChange={(e) => setHjeBanderol(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-1.5 border border-slate-300 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Banderol pita cukai</span>
              </div>
            </div>

            {/* Profitability Highlight */}
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-emerald-900 font-medium">Laba Kotor Pabrik per Bungkus:</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  Rp {Math.round(grossProfitPerPack).toLocaleString()} ({grossMarginPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-900 font-medium">Laba Kotor Pabrik per Bal (200 bks):</span>
                <span className="font-mono font-black text-emerald-900">
                  Rp {Math.round(grossProfitPerBal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-emerald-200/60 text-[11px] text-slate-600">
                <span>Porsi Margin Saluran Distribusi & Retail:</span>
                <span className="font-mono font-semibold text-slate-700">
                  Rp {distributorMarginPerPack.toLocaleString()} / bungkus
                </span>
              </div>
            </div>
          </div>

          {/* Multi-Scale Cost Conversion Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" /> Matriks Konversi HPP Bertingkat
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Standar Kemasan Rokok</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="p-3 flex justify-between items-center hover:bg-slate-50">
                <div>
                  <div className="font-bold text-slate-900">Per 1 Bungkus (Pack)</div>
                  <div className="text-[10px] text-slate-500">Satuan dasar ritel ({packSize} Batang)</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    Rp {Math.round(totalHppPerPack).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Margin: Rp {Math.round(grossProfitPerPack).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-3 flex justify-between items-center hover:bg-slate-50">
                <div>
                  <div className="font-bold text-slate-900">Per 1 Slop / Press</div>
                  <div className="text-[10px] text-slate-500">1 Slop = 10 Bungkus</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    Rp {Math.round(hppPerSlop).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    HJP: Rp {(sellingPrice * 10).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-3 flex justify-between items-center hover:bg-slate-50 bg-amber-50/20">
                <div>
                  <div className="font-bold text-amber-950">Per 1 Bal Karton</div>
                  <div className="text-[10px] text-amber-700">1 Bal = 20 Slop = 200 Bungkus</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-amber-950 text-sm">
                    Rp {Math.round(hppPerBal).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold font-mono">
                    Laba: Rp {Math.round(grossProfitPerBal).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-3 flex justify-between items-center hover:bg-slate-50">
                <div>
                  <div className="font-bold text-slate-900">Per 1 Master Box / Karton</div>
                  <div className="text-[10px] text-slate-500">1 Karton = 4 Bal = 800 Bungkus</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    Rp {Math.round(hppPerKarton).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold font-mono">
                    Laba: Rp {Math.round(grossProfitPerPack * 800).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Simulator Input */}
            <div className="p-3 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between gap-2">
              <div className="text-xs">
                <span className="text-slate-600 block text-[11px] font-semibold">Simulasi 1 Batch Order:</span>
                <input
                  type="number"
                  step="1000"
                  value={simulationBatchPacks}
                  onChange={(e) => setSimulationBatchPacks(Number(e.target.value))}
                  className="w-28 px-2 py-1 border border-slate-300 rounded font-mono text-xs font-bold text-slate-800 mt-0.5"
                />
                <span className="text-[10px] text-slate-400 ml-1">Bungkus</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total HPP Batch:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  Rp {Math.round(hppTotalBatch).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
