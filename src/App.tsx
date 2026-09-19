// SGW ONE NUSANTARA - Integrated Enterprise Resource Planning Application
import React, { useState } from 'react';
import { Header } from './components/Header';
import { DashboardModule } from './components/DashboardModule';
import { MasterDataModule } from './components/MasterDataModule';
import { ProcurementModule } from './components/ProcurementModule';
import { ProductionModule } from './components/ProductionModule';
import { SalesModule } from './components/SalesModule';
import { AccountingModule } from './components/AccountingModule';
import { TaxModule } from './components/TaxModule';
import { CustomsModule } from './components/CustomsModule';
import { HrisModule } from './components/HrisModule';
import { AuditTrailModule } from './components/AuditTrailModule';
import { UserRole } from './types/erp';
import { dbService } from './services/mockDatabase';
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('SUPER_ADMIN');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const state = dbService.getState();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Universal Header with RBAC Switcher & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onRefresh={handleRefresh}
      />

      {/* Role Notice & Sub-bar */}
      <section aria-label="Status Sistem" className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-800">Alur Spesifik:</span>
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
              TSG (Tembakau Siap Giling)
            </span>
            <span className="text-slate-400">→</span>
            <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold">
              Meja Giling & WIP Batangan
            </span>
            <span className="text-slate-400">→</span>
            <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-bold">
              Meja Packing & Pita Cukai (P3C/CK-1)
            </span>
            <span className="text-slate-400">→</span>
            <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
              Finished Goods (WH-FG)
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> DJBC Bea Cukai Terpadu
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-blue-700 font-semibold">
              <FileCheck2 className="w-3.5 h-3.5" /> PPN 11% & PPh 21 Otomatis
            </span>
            <span>•</span>
            <span className="font-mono text-slate-600">Versi 1.0.4-PROD</span>
          </div>
        </div>
      </section>

      {/* Main Module Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6" key={refreshKey}>
        {activeTab === 'dashboard' && (
          <DashboardModule onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'master' && <MasterDataModule />}

        {activeTab === 'procurement' && (
          <ProcurementModule
            onOpenPrintModal={(docType, docId) => {
              alert(`Mencetak ${docType} #${docId}`);
            }}
          />
        )}

        {activeTab === 'production' && <ProductionModule />}

        {activeTab === 'sales' && <SalesModule />}

        {activeTab === 'finance' && <AccountingModule />}

        {activeTab === 'tax' && <TaxModule />}

        {activeTab === 'customs' && <CustomsModule />}

        {activeTab === 'hris' && <HrisModule />}

        {activeTab === 'audit' && <AuditTrailModule />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-4 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-200">SGW ONE NUSANTARA</span> • Integrated Enterprise Resource Planning
            System for Cigarette Manufacturing.
            <div className="text-[11px] text-slate-500">
              Hak Cipta © 2026 PT Sumber Gunung Wangi. Sesuai Regulasi DJBC RI & DJP Kementerian Keuangan RI.
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>Server: CLOUD-ID-01</span>
            <span>Database: POSTGRESQL DRIZZLE READY</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> SYSTEM HEALTHY
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
