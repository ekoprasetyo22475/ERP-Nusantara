// Navigation bar, role switcher, and company status header
import React from 'react';
import {
  Building2,
  FileCheck,
  ShieldCheck,
  Users,
  Layers,
  Factory,
  Package,
  ShoppingCart,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { UserRole } from '../types/erp';
import { dbService } from '../services/mockDatabase';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  onRefresh,
}) => {
  const state = dbService.getState();
  const settings = state.companySettings;

  const roleLabels: Record<UserRole, { label: string; badgeColor: string }> = {
    SUPER_ADMIN: { label: 'Super Admin / Direksi', badgeColor: 'bg-red-700 text-white' },
    ADMINISTRATOR: { label: 'Administrator TI', badgeColor: 'bg-slate-700 text-white' },
    MANAGEMENT: { label: 'Manajemen Eksekutif', badgeColor: 'bg-amber-700 text-white' },
    PURCHASING: { label: 'Pengadaan (Purchasing)', badgeColor: 'bg-cyan-700 text-white' },
    WAREHOUSE: { label: 'Kepala Gudang (WH)', badgeColor: 'bg-blue-700 text-white' },
    PRODUCTION: { label: 'Produksi (Giling & Packing)', badgeColor: 'bg-purple-700 text-white' },
    SALES: { label: 'Sales & Distribusi', badgeColor: 'bg-rose-700 text-white' },
    FINANCE: { label: 'Keuangan (Finance)', badgeColor: 'bg-emerald-700 text-white' },
    ACCOUNTING: { label: 'Akuntansi (Accounting)', badgeColor: 'bg-teal-700 text-white' },
    TAX: { label: 'Pajak (Tax Specialist)', badgeColor: 'bg-indigo-700 text-white' },
    HRGA: { label: 'HRGA & Personalia', badgeColor: 'bg-pink-700 text-white' },
    BEA_CUKAI: { label: 'Kepatuhan Bea Cukai (DJBC)', badgeColor: 'bg-amber-600 text-white' },
    AUDITOR: { label: 'Auditor Internal', badgeColor: 'bg-neutral-700 text-white' },
  };

  const navItems = [
    { id: 'dashboard', label: 'Ringkasan Eksekutif', icon: Building2 },
    { id: 'master', label: 'Master Data & BOM', icon: Layers },
    { id: 'procurement', label: 'Pengadaan & Gudang', icon: Package },
    { id: 'production', label: 'Produksi Rokok (TSG)', icon: Factory },
    { id: 'sales', label: 'Penjualan & Distribusi', icon: ShoppingCart },
    { id: 'finance', label: 'Akuntansi & Jurnal', icon: DollarSign },
    { id: 'tax', label: 'Pajak (PPN & PPh)', icon: Receipt },
    { id: 'customs', label: 'Bea Cukai (CSCK & CK-4)', icon: FileSpreadsheet },
    { id: 'hris', label: 'SDM & Penggajian', icon: Users },
    { id: 'audit', label: 'Audit & Rekonsiliasi', icon: ShieldCheck },
  ];

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Banner: Enterprise Info & Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-base shadow-sm">
            SGW
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>{settings.companyName}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                NPPBKC: {settings.nppbkc}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {settings.subTitle} • KPPBC: <span className="text-slate-300 font-medium">{settings.customsOffice}</span>
            </div>
          </div>
        </div>

        {/* User Role Simulation Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Peran Pengguna (RBAC):</span>
          <select
            value={currentRole}
            onChange={(e) => {
              const r = e.target.value as UserRole;
              setCurrentRole(r);
              dbService.setUserRole(r, `${roleLabels[r].label}`);
            }}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            {(Object.keys(roleLabels) as UserRole[]).map((r) => (
              <option key={r} value={r}>
                {roleLabels[r].label}
              </option>
            ))}
          </select>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleLabels[currentRole].badgeColor}`}>
            Active Role
          </span>
          <button
            onClick={() => {
              if (confirm('Reset ulang data demo SGW ONE NUSANTARA ke default pabrik?')) {
                dbService.resetToDefault();
                onRefresh();
              }
            }}
            title="Reset Data Demo"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
