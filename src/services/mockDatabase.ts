// SGW ONE NUSANTARA - Central In-Memory Relational Database & State Engine
import {
  AuditLog,
  BOM,
  ChartOfAccount,
  CompanySettings,
  Customer,
  CustomerPayment,
  Employee,
  ExciseTariff,
  FiscalPeriod,
  GoodsReceiptItem,
  GoodsReceiptNote,
  Item,
  JournalEntry,
  PayrollRecord,
  PitaCukaiReceipt,
  PitaCukaiUsage,
  ProductionLaborTariff,
  PurchaseOrder,
  PurchaseReturn,
  PurchaseReturnItem,
  SalesInvoice,
  StockInventory,
  StockMovement,
  StockOpname,
  StockOpnameItem,
  StockTransfer,
  StockTransferItem,
  Supplier,
  SupplierInvoice,
  SupplierPayment,
  TaxMaster,
  TaxTransaction,
  UserRole,
  Warehouse,
  WasteRecord,
  WorkOrder,
} from '../types/erp';
import { JournalEngine } from './engines';

const STORAGE_KEY = 'sgw_one_nusantara_db_v2';

export interface DatabaseState {
  companySettings: CompanySettings;
  currentUserRole: UserRole;
  currentUserName: string;
  items: Item[];
  warehouses: Warehouse[];
  customers: Customer[];
  suppliers: Supplier[];
  boms: BOM[];
  laborTariffs: ProductionLaborTariff[];
  employees: Employee[];
  chartOfAccounts: ChartOfAccount[];
  taxMasters: TaxMaster[];
  exciseTariffs: ExciseTariff[];
  // Transactions
  purchaseOrders: PurchaseOrder[];
  goodsReceiptNotes: GoodsReceiptNote[];
  purchaseReturns: PurchaseReturn[];
  supplierInvoices: SupplierInvoice[];
  supplierPayments: SupplierPayment[];
  stockInventory: StockInventory[];
  stockMovements: StockMovement[];
  stockTransfers: StockTransfer[];
  stockOpnames: StockOpname[];
  workOrders: WorkOrder[];
  wasteRecords: WasteRecord[];
  salesInvoices: SalesInvoice[];
  customerPayments: CustomerPayment[];
  journalEntries: JournalEntry[];
  taxTransactions: TaxTransaction[];
  pitaCukaiReceipts: PitaCukaiReceipt[];
  pitaCukaiUsages: PitaCukaiUsage[];
  payrollRecords: PayrollRecord[];
  auditLogs: AuditLog[];
  fiscalPeriods: FiscalPeriod[];
}

// Initial Seed Data Generator
function getInitialDatabaseState(): DatabaseState {
  const companySettings: CompanySettings = {
    id: 'comp-1',
    companyName: 'PT SGW NUSANTARA MAKMUR',
    subTitle: 'Pabrik Hasil Tembakau & Sigaret Kretek Tangan',
    address: 'Kawasan Industri Kretek Terpadu, Jl. Lingkar Timur No. 88, Kudus, Jawa Tengah',
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
  };

  const warehouses: Warehouse[] = [
    {
      id: 'wh-1',
      code: 'WH-MATERIAL',
      name: 'Gudang Bahan Baku & Kemasan',
      description: 'Penyimpanan TSG (Tembakau Siap Giling), Papir, Saus, Etiket, Slop, Bal',
      isActive: true,
    },
    {
      id: 'wh-2',
      code: 'WH-WIP',
      name: 'Gudang Barang Dalam Proses (WIP)',
      description: 'Penyimpanan Batangan Rokok hasil meja giling siap ke meja packing',
      isActive: true,
    },
    {
      id: 'wh-3',
      code: 'WH-FG',
      name: 'Gudang Produk Jadi (Finished Goods)',
      description: 'Penyimpanan Hasil Tembakau yang telah dilekati Pita Cukai siap didistribusikan',
      isActive: true,
    },
    {
      id: 'wh-4',
      code: 'WH-WASTE',
      name: 'Gudang Afval & Reclaim (Waste)',
      description: 'Penyimpanan tembakau reject kupas (reclaim), scrap papir, dan etiket rusak',
      isActive: true,
    },
  ];

  const items: Item[] = [
    {
      id: 'item-tsg-01',
      itemCode: 'RM-TSG-01',
      itemName: 'Tembakau Siap Giling (TSG) Grade A SKT',
      itemType: 'RAW_MATERIAL',
      category: 'SKT',
      brand: 'SGW Series',
      stockUom: 'Kg',
      purchaseUom: 'Kg',
      salesUom: 'Kg',
      conversionFactor: 1,
      standardCost: 95000,
      averageCost: 95000,
      minStock: 500,
      maxStock: 10000,
      isActive: true,
      notes: 'Bahan baku utama siap digiling dari supplier (tanpa proses blending/peram pabrik)',
    },
    {
      id: 'item-tsg-02',
      itemCode: 'RM-TSG-02',
      itemName: 'Tembakau Siap Giling (TSG) Remix Clove Blend',
      itemType: 'RAW_MATERIAL',
      category: 'SKT',
      brand: 'SGW Remix',
      stockUom: 'Kg',
      purchaseUom: 'Kg',
      salesUom: 'Kg',
      conversionFactor: 1,
      standardCost: 88000,
      averageCost: 88000,
      minStock: 400,
      maxStock: 8000,
      isActive: true,
      notes: 'Bahan baku siap giling racikan kretek cengkeh beraroma harum manis',
    },
    {
      id: 'item-papir-01',
      itemCode: 'PM-PAPIR-01',
      itemName: 'Papir SKT Manis Cetak SGW',
      itemType: 'PACKAGING',
      category: 'SKT',
      stockUom: 'Lembar',
      purchaseUom: 'Rim',
      salesUom: 'Lembar',
      conversionFactor: 500,
      standardCost: 20,
      averageCost: 20,
      minStock: 50000,
      maxStock: 1000000,
      isActive: true,
    },
    {
      id: 'item-bks-kng10',
      itemCode: 'PM-BKS-KNG10',
      itemName: 'Bungkus / Etiket SGW Kuning SKT 10',
      itemType: 'PACKAGING',
      category: 'SKT',
      stockUom: 'Bungkus',
      purchaseUom: 'Pack',
      salesUom: 'Bungkus',
      conversionFactor: 100,
      standardCost: 400,
      averageCost: 400,
      minStock: 10000,
      maxStock: 200000,
      isActive: true,
    },
    {
      id: 'item-bks-kng12',
      itemCode: 'PM-BKS-KNG12',
      itemName: 'Bungkus / Etiket SGW Kuning SKT 12',
      itemType: 'PACKAGING',
      category: 'SKT',
      stockUom: 'Bungkus',
      purchaseUom: 'Pack',
      salesUom: 'Bungkus',
      conversionFactor: 100,
      standardCost: 450,
      averageCost: 450,
      minStock: 10000,
      maxStock: 200000,
      isActive: true,
    },
    {
      id: 'item-bks-kng16',
      itemCode: 'PM-BKS-KNG16',
      itemName: 'Bungkus / Etiket SGW Kuning SKT 16',
      itemType: 'PACKAGING',
      category: 'SKT',
      stockUom: 'Bungkus',
      purchaseUom: 'Pack',
      salesUom: 'Bungkus',
      conversionFactor: 100,
      standardCost: 550,
      averageCost: 550,
      minStock: 8000,
      maxStock: 150000,
      isActive: true,
    },
    {
      id: 'item-slp-01',
      itemCode: 'PM-SLP-01',
      itemName: 'Slop Karton SGW (Isi 10 Bungkus)',
      itemType: 'PACKAGING',
      category: 'SKT',
      stockUom: 'Slop',
      purchaseUom: 'Pack',
      salesUom: 'Slop',
      conversionFactor: 50,
      standardCost: 1200,
      averageCost: 1200,
      minStock: 1000,
      maxStock: 20000,
      isActive: true,
    },
    {
      id: 'item-bal-01',
      itemCode: 'PM-BAL-01',
      itemName: 'Bal Karton Master Box (Isi 20 Slop)',
      itemType: 'PACKAGING',
      category: 'SKT',
      stockUom: 'Bal',
      purchaseUom: 'Pcs',
      salesUom: 'Bal',
      conversionFactor: 1,
      standardCost: 7500,
      averageCost: 7500,
      minStock: 100,
      maxStock: 2000,
      isActive: true,
    },
    {
      id: 'item-btg-kng',
      itemCode: 'WIP-BTG-KNG',
      itemName: 'Batangan Rokok SGW Kuning',
      itemType: 'SEMI_FINISHED',
      category: 'SKT',
      stockUom: 'Batang',
      purchaseUom: 'Batang',
      salesUom: 'Batang',
      conversionFactor: 1,
      standardCost: 125,
      averageCost: 125,
      minStock: 20000,
      maxStock: 500000,
      isActive: true,
    },
    {
      id: 'item-fg-kng12',
      itemCode: 'FG-SGW-KNG12',
      itemName: 'SGW Kuning SKT 12',
      itemType: 'FINISHED_GOODS',
      category: 'SKT',
      brand: 'SGW Kuning',
      stockUom: 'Bungkus',
      purchaseUom: 'Bungkus',
      salesUom: 'Bungkus',
      conversionFactor: 1,
      standardCost: 5800,
      averageCost: 5800,
      minStock: 2000,
      maxStock: 50000,
      isActive: true,
    },
    {
      id: 'item-fg-kng16',
      itemCode: 'FG-SGW-KNG16',
      itemName: 'SGW Kuning SKT 16',
      itemType: 'FINISHED_GOODS',
      category: 'SKT',
      brand: 'SGW Kuning',
      stockUom: 'Bungkus',
      purchaseUom: 'Bungkus',
      salesUom: 'Bungkus',
      conversionFactor: 1,
      standardCost: 7400,
      averageCost: 7400,
      minStock: 1500,
      maxStock: 40000,
      isActive: true,
    },
    {
      id: 'item-fg-ckt12',
      itemCode: 'FG-SGW-CKT12',
      itemName: 'SGW Coklat SKT 12',
      itemType: 'FINISHED_GOODS',
      category: 'SKT',
      brand: 'SGW Coklat',
      stockUom: 'Bungkus',
      purchaseUom: 'Bungkus',
      salesUom: 'Bungkus',
      conversionFactor: 1,
      standardCost: 5600,
      averageCost: 5600,
      minStock: 1000,
      maxStock: 30000,
      isActive: true,
    },
    {
      id: 'item-fg-rmx12',
      itemCode: 'FG-SGW-RMX12',
      itemName: 'SGW Remix SKT 12',
      itemType: 'FINISHED_GOODS',
      category: 'SKT',
      brand: 'SGW Remix',
      stockUom: 'Bungkus',
      purchaseUom: 'Bungkus',
      salesUom: 'Bungkus',
      conversionFactor: 1,
      standardCost: 6100,
      averageCost: 6100,
      minStock: 1000,
      maxStock: 25000,
      isActive: true,
    },
    {
      id: 'item-fg-rmx16',
      itemCode: 'FG-SGW-RMX16',
      itemName: 'SGW Remix SKT 16',
      itemType: 'FINISHED_GOODS',
      category: 'SKT',
      brand: 'SGW Remix',
      stockUom: 'Bungkus',
      purchaseUom: 'Bungkus',
      salesUom: 'Bungkus',
      conversionFactor: 1,
      standardCost: 7800,
      averageCost: 7800,
      minStock: 1000,
      maxStock: 25000,
      isActive: true,
    },
    {
      id: 'item-fg-kng10',
      itemCode: 'FG-SGW-KNG10',
      itemName: 'SGW Kuning SKT 10',
      itemType: 'FINISHED_GOODS',
      category: 'SKT',
      brand: 'SGW Kuning',
      stockUom: 'Bungkus',
      purchaseUom: 'Bungkus',
      salesUom: 'Bungkus',
      conversionFactor: 1,
      standardCost: 4900,
      averageCost: 4900,
      minStock: 2000,
      maxStock: 50000,
      isActive: true,
      notes: 'Rokok SKT Isi 10 Batang, HJE Banderol Rp 8.750',
    },
    {
      id: 'item-pc-skt10',
      itemCode: 'PC-SKT-10',
      itemName: 'Pita Cukai SKT 10 (HJE Rp 8.750)',
      itemType: 'EXCISE_STAMP',
      category: 'SKT',
      brand: 'Pita Cukai Resmi DJBC',
      stockUom: 'Keping',
      purchaseUom: 'Lembar',
      salesUom: 'Keping',
      conversionFactor: 120, // 1 lembar = 120 keping
      standardCost: 2650,
      averageCost: 2650,
      minStock: 10000,
      maxStock: 500000,
      isActive: true,
      notes: 'Pita Cukai Seri II 2026, Isi 10 Batang, Konversi: 1 Lembar = 120 Keping, HJE Rp 8.750',
    },
    {
      id: 'item-pc-skt12',
      itemCode: 'PC-SKT-12',
      itemName: 'Pita Cukai SKT 12 (HJE Rp 10.325)',
      itemType: 'EXCISE_STAMP',
      category: 'SKT',
      brand: 'Pita Cukai Resmi DJBC',
      stockUom: 'Keping',
      purchaseUom: 'Lembar',
      salesUom: 'Keping',
      conversionFactor: 120, // 1 lembar = 120 keping
      standardCost: 3150,
      averageCost: 3150,
      minStock: 10000,
      maxStock: 500000,
      isActive: true,
      notes: 'Pita Cukai Seri II 2026, Isi 12 Batang, Konversi: 1 Lembar = 120 Keping, HJE Rp 10.325',
    },
    {
      id: 'item-pc-skt16',
      itemCode: 'PC-SKT-16',
      itemName: 'Pita Cukai SKT 16 (HJE Rp 13.775)',
      itemType: 'EXCISE_STAMP',
      category: 'SKT',
      brand: 'Pita Cukai Resmi DJBC',
      stockUom: 'Keping',
      purchaseUom: 'Lembar',
      salesUom: 'Keping',
      conversionFactor: 120, // 1 lembar = 120 keping
      standardCost: 4200,
      averageCost: 4200,
      minStock: 10000,
      maxStock: 500000,
      isActive: true,
      notes: 'Pita Cukai Seri II 2026, Isi 16 Batang, Konversi: 1 Lembar = 120 Keping, HJE Rp 13.775',
    },
  ];

  const suppliers: Supplier[] = [
    {
      id: 'supp-1',
      code: 'SUP-001',
      name: 'PT Agro Tembakau Nusantara Mandiri',
      address: 'Jl. Raya Temanggung - Parakan KM 7, Temanggung',
      npwp: '01.998.776.5-502.000',
      nik: '3323010908810002',
      phone: '+62 293 491822',
      email: 'sales@agronusantara.id',
      paymentTermDays: 30,
      taxStatus: 'TAXABLE',
      supplyCategory: 'TSG',
      isActive: true,
    },
    {
      id: 'supp-2',
      code: 'SUP-002',
      name: 'PT Percetakan Kemasan Surya Grafika',
      address: 'Kawasan Industri Rungkut Industri III No. 12, Surabaya',
      npwp: '02.445.667.8-601.000',
      nik: '3578011204780004',
      phone: '+62 31 8439011',
      email: 'order@suryagrafika.com',
      paymentTermDays: 14,
      taxStatus: 'TAXABLE',
      supplyCategory: 'PACKAGING',
      isActive: true,
    },
    {
      id: 'supp-3',
      code: 'SUP-003',
      name: 'KPPBC TMP C KUDUS / Perum Peruri',
      address: 'Jl. Mayor Kusmanto No. 1, Kudus, Jawa Tengah',
      npwp: '00.000.000.0-000.000',
      nik: '-',
      phone: '+62 291 437155',
      email: 'cukai.kudus@customs.go.id',
      paymentTermDays: 0,
      taxStatus: 'NON_TAXABLE',
      supplyCategory: 'EXCISE',
      isActive: true,
    },
  ];

  const customers: Customer[] = [
    {
      id: 'cust-1',
      code: 'CUST-001',
      name: 'PT Distribusi Kretek Makmur Jateng',
      address: 'Jl. Brigjen Katamso No. 45, Semarang, Jawa Tengah',
      npwp: '01.234.888.7-503.000',
      nik: '3374011506820005',
      phone: '+62 24 8419200',
      email: 'purchasing@kretekmakmur.co.id',
      paymentTermDays: 14,
      creditLimit: 250000000,
      taxStatus: 'TAXABLE',
      isActive: true,
    },
    {
      id: 'cust-2',
      code: 'CUST-002',
      name: 'CV Barokah Sumber Niaga Jatim',
      address: 'Jl. Raya Manyar No. 89, Gresik, Jawa Timur',
      npwp: '02.345.999.1-602.000',
      nik: '3525010309850001',
      phone: '+62 31 3951122',
      email: 'barokahniaga@gmail.com',
      paymentTermDays: 21,
      creditLimit: 150000000,
      taxStatus: 'TAXABLE',
      isActive: true,
    },
    {
      id: 'cust-3',
      code: 'CUST-003',
      name: 'Toko Berkah Subur (Grosir Pantura)',
      address: 'Jl. Raya Sunan Kudus No. 120, Kudus',
      npwp: '03.888.777.2-506.000',
      nik: '3319012201880003',
      phone: '+62 291 438811',
      email: 'berkahsubur@yahoo.com',
      paymentTermDays: 0,
      creditLimit: 50000000,
      taxStatus: 'TAXABLE',
      isActive: true,
    },
  ];

  const boms: BOM[] = [
    {
      id: 'bom-giling-kng',
      bomNumber: 'BOM-GILING-KNG-V1',
      productId: 'item-btg-kng',
      productName: 'Batangan Rokok SGW Kuning',
      processStage: 'GILING',
      version: '1.0',
      effectiveDate: '2026-01-01',
      standardOutputQty: 10000, // Per 10.000 batang
      standardOutputUom: 'Batang',
      isActive: true,
      components: [
        {
          itemId: 'item-tsg-01',
          itemCode: 'RM-TSG-01',
          itemName: 'Tembakau Siap Giling (TSG) Grade A SKT',
          quantity: 11.5, // 11.5 Kg per 10.000 batang (1.15 gram/batang)
          uom: 'Kg',
          scrapPercentage: 0.5,
        },
        {
          itemId: 'item-papir-01',
          itemCode: 'PM-PAPIR-01',
          itemName: 'Papir SKT Manis Cetak SGW',
          quantity: 10050, // 10.050 lembar per 10.000 batang (0.5% scrap)
          uom: 'Lembar',
          scrapPercentage: 0.5,
        },
      ],
    },
    {
      id: 'bom-packing-kng10',
      bomNumber: 'BOM-PACK-KNG10-V1',
      productId: 'item-fg-kng10',
      productName: 'SGW Kuning SKT 10',
      processStage: 'PACKING',
      version: '1.0',
      effectiveDate: '2026-01-01',
      standardOutputQty: 1000, // Per 1.000 bungkus
      standardOutputUom: 'Bungkus',
      isActive: true,
      components: [
        {
          itemId: 'item-btg-kng',
          itemCode: 'WIP-BTG-KNG',
          itemName: 'Batangan Rokok SGW Kuning',
          quantity: 10000, // 10 batang per bungkus x 1.000 = 10.000 batang
          uom: 'Batang',
          scrapPercentage: 0.2,
        },
        {
          itemId: 'item-bks-kng10',
          itemCode: 'PM-BKS-KNG10',
          itemName: 'Bungkus / Etiket SGW Kuning SKT 10',
          quantity: 1002, // 1.002 bungkus (0.2% scrap)
          uom: 'Bungkus',
          scrapPercentage: 0.2,
        },
        {
          itemId: 'item-pc-skt10',
          itemCode: 'PC-SKT-10',
          itemName: 'Pita Cukai SKT 10 (HJE Rp 8.750)',
          quantity: 1000, // 1.000 keping pita cukai
          uom: 'Keping',
          scrapPercentage: 0,
        },
        {
          itemId: 'item-slp-01',
          itemCode: 'PM-SLP-01',
          itemName: 'Slop Karton SGW (Isi 10 Bungkus)',
          quantity: 100, // 100 slop
          uom: 'Slop',
          scrapPercentage: 0,
        },
        {
          itemId: 'item-bal-01',
          itemCode: 'PM-BAL-01',
          itemName: 'Bal Karton Master Box (Isi 20 Slop)',
          quantity: 5, // 5 bal
          uom: 'Bal',
          scrapPercentage: 0,
        },
      ],
    },
    {
      id: 'bom-packing-kng12',
      bomNumber: 'BOM-PACK-KNG12-V1',
      productId: 'item-fg-kng12',
      productName: 'SGW Kuning SKT 12',
      processStage: 'PACKING',
      version: '1.0',
      effectiveDate: '2026-01-01',
      standardOutputQty: 1000, // Per 1.000 bungkus
      standardOutputUom: 'Bungkus',
      isActive: true,
      components: [
        {
          itemId: 'item-btg-kng',
          itemCode: 'WIP-BTG-KNG',
          itemName: 'Batangan Rokok SGW Kuning',
          quantity: 12000, // 12 batang per bungkus x 1.000 = 12.000 batang
          uom: 'Batang',
          scrapPercentage: 0.2,
        },
        {
          itemId: 'item-bks-kng12',
          itemCode: 'PM-BKS-KNG12',
          itemName: 'Bungkus / Etiket SGW Kuning SKT 12',
          quantity: 1002, // 1.002 bungkus (0.2% scrap)
          uom: 'Bungkus',
          scrapPercentage: 0.2,
        },
        {
          itemId: 'item-pc-skt12',
          itemCode: 'PC-SKT-12',
          itemName: 'Pita Cukai SKT 12 (HJE Rp 10.325)',
          quantity: 1000, // 1.000 keping pita cukai
          uom: 'Keping',
          scrapPercentage: 0,
        },
        {
          itemId: 'item-slp-01',
          itemCode: 'PM-SLP-01',
          itemName: 'Slop Karton SGW (Isi 10 Bungkus)',
          quantity: 100, // 100 slop
          uom: 'Slop',
          scrapPercentage: 0,
        },
        {
          itemId: 'item-bal-01',
          itemCode: 'PM-BAL-01',
          itemName: 'Bal Karton Master Box (Isi 20 Slop)',
          quantity: 5, // 5 bal
          uom: 'Bal',
          scrapPercentage: 0,
        },
      ],
    },
    {
      id: 'bom-packing-kng16',
      bomNumber: 'BOM-PACK-KNG16-V1',
      productId: 'item-fg-kng16',
      productName: 'SGW Kuning SKT 16',
      processStage: 'PACKING',
      version: '1.0',
      effectiveDate: '2026-01-01',
      standardOutputQty: 1000, // Per 1.000 bungkus
      standardOutputUom: 'Bungkus',
      isActive: true,
      components: [
        {
          itemId: 'item-btg-kng',
          itemCode: 'WIP-BTG-KNG',
          itemName: 'Batangan Rokok SGW Kuning',
          quantity: 16000, // 16 batang per bungkus x 1.000 = 16.000 batang
          uom: 'Batang',
          scrapPercentage: 0.2,
        },
        {
          itemId: 'item-bks-kng16',
          itemCode: 'PM-BKS-KNG16',
          itemName: 'Bungkus / Etiket SGW Kuning SKT 16',
          quantity: 1002, // 1.002 bungkus (0.2% scrap)
          uom: 'Bungkus',
          scrapPercentage: 0.2,
        },
        {
          itemId: 'item-pc-skt16',
          itemCode: 'PC-SKT-16',
          itemName: 'Pita Cukai SKT 16 (HJE Rp 13.775)',
          quantity: 1000, // 1.000 keping pita cukai
          uom: 'Keping',
          scrapPercentage: 0,
        },
        {
          itemId: 'item-slp-01',
          itemCode: 'PM-SLP-01',
          itemName: 'Slop Karton SGW (Isi 10 Bungkus)',
          quantity: 100, // 100 slop
          uom: 'Slop',
          scrapPercentage: 0,
        },
        {
          itemId: 'item-bal-01',
          itemCode: 'PM-BAL-01',
          itemName: 'Bal Karton Master Box (Isi 20 Slop)',
          quantity: 5, // 5 bal
          uom: 'Bal',
          scrapPercentage: 0,
        },
      ],
    },
  ];

  const laborTariffs: ProductionLaborTariff[] = [
    {
      id: 'tariff-gl-skt10',
      code: 'TRF-GL-SKT10',
      name: 'Paket Borong Giling + Gunting SKT 10',
      position: 'GILING_GUNTING',
      processType: 'GILING',
      laborType: 'BORONGAN',
      rate: 30, // Rp 30 per Batang (Satuan Terkecil)
      uom: 'Batang',
      effectiveDate: '2026-01-01',
      isActive: true,
    },
    {
      id: 'tariff-gl-skt12',
      code: 'TRF-GL-SKT12',
      name: 'Paket Borong Giling + Gunting SKT 12',
      position: 'GILING_GUNTING',
      processType: 'GILING',
      laborType: 'BORONGAN',
      rate: 34, // Rp 34 per Batang (Satuan Terkecil)
      uom: 'Batang',
      effectiveDate: '2026-01-01',
      isActive: true,
    },
    {
      id: 'tariff-gl-skt16',
      code: 'TRF-GL-SKT16',
      name: 'Paket Borong Giling + Gunting SKT 16',
      position: 'GILING_GUNTING',
      processType: 'GILING',
      laborType: 'BORONGAN',
      rate: 42, // Rp 42 per Batang (Satuan Terkecil)
      uom: 'Batang',
      effectiveDate: '2026-01-01',
      isActive: true,
    },
    {
      id: 'tariff-packing',
      code: 'TRF-PC-01',
      name: 'Borong Packing & Pelekatan Cukai',
      position: 'PACKING',
      processType: 'PACKING',
      laborType: 'BORONGAN',
      rate: 150, // Rp 150 per Bungkus (Satuan Terkecil)
      uom: 'Bungkus',
      effectiveDate: '2026-01-01',
      isActive: true,
    },
    {
      id: 'tariff-mandor',
      code: 'TRF-MDR-01',
      name: 'Mandor Pengawas Meja Pabrik',
      position: 'MANDOR',
      processType: 'GILING',
      laborType: 'HARIAN',
      rate: 130000, // Rp 130.000 / Hari
      uom: 'Hari',
      effectiveDate: '2026-01-01',
      isActive: true,
    },
    {
      id: 'tariff-qc',
      code: 'TRF-QC-01',
      name: 'Quality Control (QC) Meja',
      position: 'QC',
      processType: 'PACKING',
      laborType: 'HARIAN',
      rate: 115000, // Rp 115.000 / Hari
      uom: 'Hari',
      effectiveDate: '2026-01-01',
      isActive: true,
    },
  ];

  const employees: Employee[] = [
    {
      id: 'emp-1',
      employeeId: 'EMP-GL-001',
      name: 'Siti Aminah',
      position: 'Pekerja Giling Meja 1',
      department: 'PRODUCTION_GILING',
      employmentStatus: 'BORONGAN',
      phone: '+62 812 3456 7891',
      npwp: '78.112.334.5-506.000',
      nik: '3319025508890001',
      bankAccount: '1430098811',
      bankName: 'BCA',
      baseSalaryOrRate: 26000,
      isActive: true,
    },
    {
      id: 'emp-2',
      employeeId: 'EMP-GT-001',
      name: 'Rukmini',
      position: 'Pekerja Gunting Meja 1',
      department: 'PRODUCTION_GILING',
      employmentStatus: 'BORONGAN',
      phone: '+62 813 4455 6677',
      npwp: '79.223.445.6-506.000',
      nik: '3319024410910002',
      bankAccount: '1430098822',
      bankName: 'BCA',
      baseSalaryOrRate: 8000,
      isActive: true,
    },
    {
      id: 'emp-3',
      employeeId: 'EMP-PC-001',
      name: 'Khotimah',
      position: 'Pekerja Packing Meja 1',
      department: 'PRODUCTION_PACKING',
      employmentStatus: 'BORONGAN',
      phone: '+62 815 6677 8899',
      npwp: '80.334.556.7-506.000',
      nik: '3319026703880003',
      bankAccount: '1430098833',
      bankName: 'BCA',
      baseSalaryOrRate: 1800,
      isActive: true,
    },
    {
      id: 'emp-4',
      employeeId: 'EMP-MDR-001',
      name: 'Bambang Supriyanto',
      position: 'Mandor Produksi Giling',
      department: 'PRODUCTION_GILING',
      employmentStatus: 'TETAP',
      phone: '+62 811 2233 4455',
      npwp: '01.554.332.1-506.000',
      nik: '3319011402800004',
      bankAccount: '1430011223',
      bankName: 'BCA',
      baseSalaryOrRate: 4500000,
      isActive: true,
    },
  ];

  const chartOfAccounts: ChartOfAccount[] = [
    { id: 'coa-1001', code: '1001', name: 'Kas Tunai Kantor', type: 'ASSET', normalBalance: 'DEBIT', isParent: false, balance: 45000000, isActive: true },
    { id: 'coa-1002', code: '1002', name: 'Bank BCA Operasional (A/C 143-888-999)', type: 'ASSET', normalBalance: 'DEBIT', isParent: false, balance: 385000000, isActive: true },
    { id: 'coa-1003', code: '1003', name: 'Bank Mandiri Giro Cukai', type: 'ASSET', normalBalance: 'DEBIT', isParent: false, balance: 120000000, isActive: true },
    { id: 'coa-1101', code: '1101', name: 'Piutang Usaha (AR)', type: 'ASSET', normalBalance: 'DEBIT', isParent: false, balance: 84000000, isActive: true },
    { id: 'coa-1151', code: '1151', name: 'PPN Masukan (Input VAT)', type: 'ASSET', normalBalance: 'DEBIT', isParent: false, balance: 18700000, isActive: true },
    { id: 'coa-1161', code: '1161', name: 'Persediaan Pita Cukai', type: 'ASSET', normalBalance: 'DEBIT', isParent: false, balance: 180000000, isActive: true },
    { id: 'coa-1201', code: '1201', name: 'Persediaan Bahan Baku (TSG & Papir)', type: 'ASSET', normalBalance: 'DEBIT', isParent: false, balance: 285000000, isActive: true },
    { id: 'coa-1202', code: '1202', name: 'Persediaan Bahan Kemasan', type: 'ASSET', normalBalance: 'DEBIT', isParent: false, balance: 42000000, isActive: true },
    { id: 'coa-1205', code: '1205', name: 'Persediaan Barang Dalam Proses (WIP)', type: 'ASSET', normalBalance: 'DEBIT', isParent: false, balance: 35000000, isActive: true },
    { id: 'coa-1206', code: '1206', name: 'Persediaan Produk Jadi (FG)', type: 'ASSET', normalBalance: 'DEBIT', isParent: false, balance: 116000000, isActive: true },
    { id: 'coa-2001', code: '2001', name: 'Hutang Usaha (AP)', type: 'LIABILITY', normalBalance: 'CREDIT', isParent: false, balance: 145000000, isActive: true },
    { id: 'coa-2151', code: '2151', name: 'PPN Keluaran (Output VAT)', type: 'LIABILITY', normalBalance: 'CREDIT', isParent: false, balance: 26400000, isActive: true },
    { id: 'coa-2155', code: '2155', name: 'Hutang PPh 21 Karyawan', type: 'LIABILITY', normalBalance: 'CREDIT', isParent: false, balance: 4200000, isActive: true },
    { id: 'coa-2201', code: '2201', name: 'Hutang Upah Borongan Produksi', type: 'LIABILITY', normalBalance: 'CREDIT', isParent: false, balance: 18500000, isActive: true },
    { id: 'coa-3001', code: '3001', name: 'Modal Disetor Pemegang Saham', type: 'EQUITY', normalBalance: 'CREDIT', isParent: false, balance: 800000000, isActive: true },
    { id: 'coa-3101', code: '3101', name: 'Laba Ditahan (Retained Earnings)', type: 'EQUITY', normalBalance: 'CREDIT', isParent: false, balance: 165600000, isActive: true },
    { id: 'coa-4001', code: '4001', name: 'Pendapatan Penjualan Rokok', type: 'REVENUE', normalBalance: 'CREDIT', isParent: false, balance: 420000000, isActive: true },
    { id: 'coa-5001', code: '5001', name: 'Harga Pokok Penjualan (HPP)', type: 'COGS', normalBalance: 'DEBIT', isParent: false, balance: 252000000, isActive: true },
    { id: 'coa-6001', code: '6001', name: 'Beban Gaji & Upah Borongan', type: 'EXPENSE', normalBalance: 'DEBIT', isParent: false, balance: 34500000, isActive: true },
    { id: 'coa-6002', code: '6002', name: 'Beban Operasional & Listrik Pabrik', type: 'EXPENSE', normalBalance: 'DEBIT', isParent: false, balance: 12500000, isActive: true },
    { id: 'coa-6003', code: '6003', name: 'Beban Susut & Afval Produksi', type: 'EXPENSE', normalBalance: 'DEBIT', isParent: false, balance: 1800000, isActive: true },
  ];

  const taxMasters: TaxMaster[] = [
    { id: 'tax-1', taxCode: 'PPN11', name: 'PPN Hasil Tembakau / Standar 11%', rate: 11, effectiveDate: '2022-04-01', accountId: 'coa-2151', description: 'Tarif PPN UU HPP 11%', isActive: true },
    { id: 'tax-2', taxCode: 'PPN12', name: 'PPN Penyesuaian 12%', rate: 12, effectiveDate: '2025-01-01', accountId: 'coa-2151', description: 'Opsi tarif PPN 12%', isActive: true },
    { id: 'tax-3', taxCode: 'PPH21', name: 'PPh Pasal 21 Karyawan & Borongan', rate: 5, effectiveDate: '2024-01-01', accountId: 'coa-2155', description: 'PPh 21 Pemotongan Upah', isActive: true },
    { id: 'tax-4', taxCode: 'PPH22', name: 'PPh Pasal 22 Rokok (0.15%)', rate: 0.15, effectiveDate: '2024-01-01', accountId: 'coa-2151', description: 'PPh 22 Penjualan ke Distributor', isActive: true },
  ];

  const exciseTariffs: ExciseTariff[] = [
    {
      id: 'excise-skt10',
      tariffCode: 'SKT-10',
      brand: 'SGW Kretek / Kuning SKT 10',
      type: 'SKT',
      golongan: 'GOL_II',
      packSize: 10,
      hjePerStick: 875,
      hjePerPack: 8750, // Banderol resmi SKT 10
      excisePerStick: 265,
      excisePerPack: 2650,
      sheetsToPiecesConversion: 120, // 1 Lembar = 120 Keping
      ppnPerPack: 962.5,
      year: 2026,
      effectiveDate: '2026-01-01',
      isActive: true,
    },
    {
      id: 'excise-skt12',
      tariffCode: 'SKT-12',
      brand: 'SGW Kuning / Coklat SKT 12',
      type: 'SKT',
      golongan: 'GOL_II',
      packSize: 12,
      hjePerStick: 860.4,
      hjePerPack: 10325, // Banderol resmi SKT 12
      excisePerStick: 262.5,
      excisePerPack: 3150,
      sheetsToPiecesConversion: 120, // 1 Lembar = 120 Keping
      ppnPerPack: 1135.75,
      year: 2026,
      effectiveDate: '2026-01-01',
      isActive: true,
    },
    {
      id: 'excise-skt16',
      tariffCode: 'SKT-16',
      brand: 'SGW Kuning / Remix SKT 16',
      type: 'SKT',
      golongan: 'GOL_II',
      packSize: 16,
      hjePerStick: 860.9,
      hjePerPack: 13775, // Banderol resmi SKT 16
      excisePerStick: 262.5,
      excisePerPack: 4200,
      sheetsToPiecesConversion: 120, // 1 Lembar = 120 Keping
      ppnPerPack: 1515.25,
      year: 2026,
      effectiveDate: '2026-01-01',
      isActive: true,
    },
  ];

  // Stock inventory per warehouse
  const stockInventory: StockInventory[] = [
    { itemId: 'item-tsg-01', itemCode: 'RM-TSG-01', itemName: 'Tembakau Siap Giling (TSG) Grade A SKT', warehouseId: 'wh-1', warehouseCode: 'WH-MATERIAL', qty: 2500, uom: 'Kg', averageCost: 95000, totalValuation: 237500000 },
    { itemId: 'item-tsg-02', itemCode: 'RM-TSG-02', itemName: 'Tembakau Siap Giling (TSG) Remix Clove Blend', warehouseId: 'wh-1', warehouseCode: 'WH-MATERIAL', qty: 1200, uom: 'Kg', averageCost: 88000, totalValuation: 105600000 },
    { itemId: 'item-papir-01', itemCode: 'PM-PAPIR-01', itemName: 'Papir SKT Manis Cetak SGW', warehouseId: 'wh-1', warehouseCode: 'WH-MATERIAL', qty: 450000, uom: 'Lembar', averageCost: 20, totalValuation: 9000000 },
    { itemId: 'item-bks-kng12', itemCode: 'PM-BKS-KNG12', itemName: 'Bungkus / Etiket SGW Kuning SKT 12', warehouseId: 'wh-1', warehouseCode: 'WH-MATERIAL', qty: 48000, uom: 'Bungkus', averageCost: 450, totalValuation: 21600000 },
    { itemId: 'item-bks-kng16', itemCode: 'PM-BKS-KNG16', itemName: 'Bungkus / Etiket SGW Kuning SKT 16', warehouseId: 'wh-1', warehouseCode: 'WH-MATERIAL', qty: 32000, uom: 'Bungkus', averageCost: 550, totalValuation: 17600000 },
    { itemId: 'item-slp-01', itemCode: 'PM-SLP-01', itemName: 'Slop Karton SGW (Isi 10 Bungkus)', warehouseId: 'wh-1', warehouseCode: 'WH-MATERIAL', qty: 5400, uom: 'Slop', averageCost: 1200, totalValuation: 6480000 },
    { itemId: 'item-bal-01', itemCode: 'PM-BAL-01', itemName: 'Bal Karton Master Box (Isi 20 Slop)', warehouseId: 'wh-1', warehouseCode: 'WH-MATERIAL', qty: 260, uom: 'Bal', averageCost: 7500, totalValuation: 1950000 },
    { itemId: 'item-btg-kng', itemCode: 'WIP-BTG-KNG', itemName: 'Batangan Rokok SGW Kuning', warehouseId: 'wh-2', warehouseCode: 'WH-WIP', qty: 280000, uom: 'Batang', averageCost: 125, totalValuation: 35000000 },
    { itemId: 'item-fg-kng12', itemCode: 'FG-SGW-KNG12', itemName: 'SGW Kuning SKT 12', warehouseId: 'wh-3', warehouseCode: 'WH-FG', qty: 12500, uom: 'Bungkus', averageCost: 5800, totalValuation: 72500000 },
    { itemId: 'item-fg-kng16', itemCode: 'FG-SGW-KNG16', itemName: 'SGW Kuning SKT 16', warehouseId: 'wh-3', warehouseCode: 'WH-FG', qty: 5800, uom: 'Bungkus', averageCost: 7400, totalValuation: 42920000 },
    { itemId: 'item-tsg-01', itemCode: 'RM-TSG-01', itemName: 'Tembakau Reclaim Kupas (TSG)', warehouseId: 'wh-4', warehouseCode: 'WH-WASTE', qty: 28.5, uom: 'Kg', averageCost: 45000, totalValuation: 1282500 },
  ];

  const stockMovements: StockMovement[] = [
    {
      id: 'sm-1',
      date: '2026-09-10',
      movementType: 'PURCHASE_GRN',
      referenceNumber: 'GRN-2026-000001',
      itemId: 'item-tsg-01',
      itemCode: 'RM-TSG-01',
      itemName: 'Tembakau Siap Giling (TSG) Grade A SKT',
      warehouseId: 'wh-1',
      warehouseCode: 'WH-MATERIAL',
      qtyIn: 2000,
      qtyOut: 0,
      balanceQty: 2500,
      unitCost: 95000,
      totalCost: 190000000,
      notes: 'Penerimaan TSG Grade A dari PT Agro Tembakau Nusantara Mandiri',
      createdAt: '2026-09-10T09:30:00Z',
    },
    {
      id: 'sm-2',
      date: '2026-09-12',
      movementType: 'PROD_GILING_ISSUE',
      referenceNumber: 'WO-2026-GL001',
      itemId: 'item-tsg-01',
      itemCode: 'RM-TSG-01',
      itemName: 'Tembakau Siap Giling (TSG) Grade A SKT',
      warehouseId: 'wh-1',
      warehouseCode: 'WH-MATERIAL',
      qtyIn: 0,
      qtyOut: 120,
      balanceQty: 2380,
      unitCost: 95000,
      totalCost: 11400000,
      notes: 'Pengeluaran TSG ke Meja Giling 1-6 (120.000 Batang)',
      createdAt: '2026-09-12T07:45:00Z',
    },
    {
      id: 'sm-3',
      date: '2026-09-12',
      movementType: 'PROD_GILING_RECEIPT',
      referenceNumber: 'WO-2026-GL001',
      itemId: 'item-btg-kng',
      itemCode: 'WIP-BTG-KNG',
      itemName: 'Batangan Rokok SGW Kuning',
      warehouseId: 'wh-2',
      warehouseCode: 'WH-WIP',
      qtyIn: 119820,
      qtyOut: 0,
      balanceQty: 280000,
      unitCost: 125,
      totalCost: 14977500,
      notes: 'Hasil Giling Baik diterima di Gudang WIP (180 Batang reject dipisahkan)',
      createdAt: '2026-09-12T16:15:00Z',
    },
    {
      id: 'sm-4',
      date: '2026-09-14',
      movementType: 'PROD_PACKING_RECEIPT',
      referenceNumber: 'WO-2026-PK001',
      itemId: 'item-fg-kng12',
      itemCode: 'FG-SGW-KNG12',
      itemName: 'SGW Kuning SKT 12',
      warehouseId: 'wh-3',
      warehouseCode: 'WH-FG',
      qtyIn: 8000,
      qtyOut: 0,
      balanceQty: 12500,
      unitCost: 5800,
      totalCost: 46400000,
      notes: 'Penerimaan Hasil Packing Dilekati Pita Cukai 2026',
      createdAt: '2026-09-14T17:00:00Z',
    },
    {
      id: 'sm-5',
      date: '2026-09-15',
      movementType: 'SALES_ISSUE',
      referenceNumber: 'INV-2026-000001',
      itemId: 'item-fg-kng12',
      itemCode: 'FG-SGW-KNG12',
      itemName: 'SGW Kuning SKT 12',
      warehouseId: 'wh-3',
      warehouseCode: 'WH-FG',
      qtyIn: 0,
      qtyOut: 4000,
      balanceQty: 8500,
      unitCost: 5800,
      totalCost: 23200000,
      notes: 'Pengiriman Penjualan ke PT Distribusi Kretek Makmur Jateng (DO-2026-001)',
      createdAt: '2026-09-15T11:00:00Z',
    },
  ];

  const pitaCukaiReceipts: PitaCukaiReceipt[] = [
    {
      id: 'pcr-1',
      docNumber: 'CK-1-2026-0001',
      receiptDate: '2026-09-02',
      brand: 'SGW Kuning SKT 12',
      exciseType: 'SKT',
      year: 2026,
      packSize: 12,
      tariffPerPack: 3600,
      sheetsReceived: 1000, // 1000 lembar x 50 keping
      piecesPerSheet: 50,
      totalPieces: 50000,
      totalValue: 180000000,
      supplierVendor: 'KPPBC TMP C KUDUS',
      piecesAvailable: 34000,
      piecesUsed: 15980,
      piecesDamaged: 20,
      status: 'AVAILABLE',
      notes: 'Penebusan CK-1 Periode September 2026 Seri III SKT Golongan II',
    },
    {
      id: 'pcr-2',
      docNumber: 'CK-1-2026-0002',
      receiptDate: '2026-09-05',
      brand: 'SGW Kuning SKT 16',
      exciseType: 'SKT',
      year: 2026,
      packSize: 16,
      tariffPerPack: 4800,
      sheetsReceived: 500,
      piecesPerSheet: 50,
      totalPieces: 25000,
      totalValue: 120000000,
      supplierVendor: 'KPPBC TMP C KUDUS',
      piecesAvailable: 17000,
      piecesUsed: 7990,
      piecesDamaged: 10,
      status: 'AVAILABLE',
      notes: 'Penebusan CK-1 SKT 16 Batang',
    },
  ];

  const pitaCukaiUsages: PitaCukaiUsage[] = [
    {
      id: 'pcu-1',
      woPackingId: 'wo-pack-1',
      woNumber: 'WO-2026-PK001',
      date: '2026-09-14',
      brand: 'SGW Kuning SKT 12',
      finishedGoodsId: 'item-fg-kng12',
      finishedGoodsName: 'SGW Kuning SKT 12',
      receiptId: 'pcr-1',
      packsProduced: 8000,
      piecesUsed: 8000,
      piecesDamaged: 12,
      damageReportRef: 'BA-PC-2026-001',
    },
  ];

  const workOrders: WorkOrder[] = [
    {
      id: 'wo-giling-1',
      woNumber: 'WO-2026-GL001',
      processStage: 'GILING',
      productId: 'item-btg-kng',
      productCode: 'WIP-BTG-KNG',
      productName: 'Batangan Rokok SGW Kuning',
      bomId: 'bom-giling-kng',
      plannedQty: 120000,
      actualOutputQty: 119820,
      rejectQty: 180,
      scrapQty: 60,
      reclaimQty: 1.2, // Kg TSG tembakau reclaim dari reject batang kupas
      uom: 'Batang',
      startDate: '2026-09-12',
      endDate: '2026-09-12',
      status: 'COMPLETED',
      moistureShrinkagePercent: 0.15,
      allocatedLaborCost: 4073880, // Borongan giling & gunting
      allocatedMaterialCost: 11400000,
      unitHpp: 129.1,
      createdAt: '2026-09-12T07:00:00Z',
    },
    {
      id: 'wo-pack-1',
      woNumber: 'WO-2026-PK001',
      processStage: 'PACKING',
      productId: 'item-fg-kng12',
      productCode: 'FG-SGW-KNG12',
      productName: 'SGW Kuning SKT 12',
      bomId: 'bom-packing-kng12',
      plannedQty: 8000,
      actualOutputQty: 8000,
      rejectQty: 15,
      scrapQty: 10,
      reclaimQty: 0,
      uom: 'Bungkus',
      startDate: '2026-09-14',
      endDate: '2026-09-14',
      status: 'COMPLETED',
      allocatedLaborCost: 1440000,
      allocatedMaterialCost: 16000000,
      unitHpp: 5800,
      createdAt: '2026-09-14T08:00:00Z',
    },
    {
      id: 'wo-giling-2',
      woNumber: 'WO-2026-GL002',
      processStage: 'GILING',
      productId: 'item-btg-kng',
      productCode: 'WIP-BTG-KNG',
      productName: 'Batangan Rokok SGW Kuning',
      bomId: 'bom-giling-kng',
      plannedQty: 150000,
      actualOutputQty: 0,
      rejectQty: 0,
      scrapQty: 0,
      reclaimQty: 0,
      uom: 'Batang',
      startDate: '2026-09-18',
      status: 'IN_PROGRESS',
      allocatedLaborCost: 0,
      allocatedMaterialCost: 14250000,
      unitHpp: 0,
      createdAt: '2026-09-18T07:30:00Z',
    },
  ];

  const wasteRecords: WasteRecord[] = [
    {
      id: 'wst-1',
      date: '2026-09-12',
      woId: 'wo-giling-1',
      woNumber: 'WO-2026-GL001',
      itemId: 'item-tsg-01',
      itemCode: 'RM-TSG-01',
      itemName: 'Tembakau Reclaim Kupas (TSG)',
      category: 'RECLAIM',
      quantity: 1.2,
      uom: 'Kg',
      sourceWarehouse: 'WH-WIP',
      destinationWarehouse: 'WH-WASTE',
      isReclaimed: true,
      reclaimTargetItemId: 'item-tsg-01',
      notes: 'Reclaim tembakau dari 180 batang reject yang dikupas rapi di meja QC',
    },
    {
      id: 'wst-2',
      date: '2026-09-12',
      woId: 'wo-giling-1',
      woNumber: 'WO-2026-GL001',
      itemId: 'item-papir-01',
      itemCode: 'PM-PAPIR-01',
      itemName: 'Papir Rusak / Sobek',
      category: 'SCRAP',
      quantity: 180,
      uom: 'Lembar',
      sourceWarehouse: 'WH-WIP',
      destinationWarehouse: 'WH-WASTE',
      isReclaimed: false,
      notes: 'Scrap papir dari batangan reject',
    },
  ];

  const purchaseOrders: PurchaseOrder[] = [
    {
      id: 'po-1',
      poNumber: 'PO-2026-000001',
      supplierId: 'supp-1',
      supplierName: 'PT Agro Tembakau Nusantara Mandiri',
      orderDate: '2026-09-08',
      expectedDate: '2026-09-10',
      items: [
        {
          id: 'poi-1',
          itemId: 'item-tsg-01',
          itemCode: 'RM-TSG-01',
          itemName: 'Tembakau Siap Giling (TSG) Grade A SKT',
          qty: 2000,
          uom: 'Kg',
          unitPrice: 95000,
          subtotal: 190000000,
        },
      ],
      subtotal: 190000000,
      ppnRate: 11,
      ppnAmount: 20900000,
      totalAmount: 210900000,
      notes: 'Pengadaan TSG Grade A Kering Siap Pakai',
      status: 'COMPLETED',
      createdAt: '2026-09-08T10:00:00Z',
    },
    {
      id: 'po-2',
      poNumber: 'PO-2026-000002',
      supplierId: 'supp-2',
      supplierName: 'PT Percetakan Kemasan Surya Grafika',
      orderDate: '2026-09-11',
      expectedDate: '2026-09-15',
      items: [
        {
          id: 'poi-2',
          itemId: 'item-bks-kng12',
          itemCode: 'PM-BKS-KNG12',
          itemName: 'Bungkus / Etiket SGW Kuning SKT 12',
          qty: 50000,
          uom: 'Bungkus',
          unitPrice: 450,
          subtotal: 22500000,
        },
        {
          id: 'poi-3',
          itemId: 'item-slp-01',
          itemCode: 'PM-SLP-01',
          itemName: 'Slop Karton SGW (Isi 10 Bungkus)',
          qty: 5000,
          uom: 'Slop',
          unitPrice: 1200,
          subtotal: 6000000,
        },
      ],
      subtotal: 28500000,
      ppnRate: 11,
      ppnAmount: 3135000,
      totalAmount: 31635000,
      notes: 'Cetak Kemasan Batch September 2026',
      status: 'COMPLETED',
      createdAt: '2026-09-11T14:30:00Z',
    },
  ];

  const goodsReceiptNotes: GoodsReceiptNote[] = [
    {
      id: 'grn-1',
      grnNumber: 'GRN-2026-000001',
      poId: 'po-1',
      poNumber: 'PO-2026-000001',
      supplierId: 'supp-1',
      supplierName: 'PT Agro Tembakau Nusantara Mandiri',
      warehouseId: 'wh-1',
      receiptDate: '2026-09-10',
      vendorDeliveryRef: 'SJ-ATN-2026-091',
      items: [
        {
          id: 'grni-1',
          poItemId: 'poi-1',
          itemId: 'item-tsg-01',
          itemCode: 'RM-TSG-01',
          itemName: 'Tembakau Siap Giling (TSG) Grade A SKT',
          qtyOrdered: 2000,
          qtyReceived: 2000,
          uom: 'Kg',
          unitPrice: 95000,
          subtotal: 190000000,
        },
      ],
      totalValue: 190000000,
      status: 'POSTED',
      notes: 'Diterima utuh dan lulus uji kelembaban kadar air di timbangan gudang',
      createdAt: '2026-09-10T09:30:00Z',
    },
  ];

  const purchaseReturns: PurchaseReturn[] = [
    {
      id: 'prt-1',
      returnNumber: 'PRT-2026-000001',
      debitNoteNumber: 'DN-2026-000001',
      poId: 'po-2',
      poNumber: 'PO-2026-000002',
      grnId: 'grn-1',
      grnNumber: 'GRN-2026-000001',
      supplierInvoiceId: 'si-2',
      supplierInvoiceNumber: 'SI-2026-000002',
      supplierId: 'supp-2',
      supplierName: 'PT Percetakan Kemasan Surya Grafika',
      warehouseId: 'wh-1',
      returnDate: '2026-09-16',
      items: [
        {
          id: 'prti-1',
          itemId: 'item-bks-kng12',
          itemCode: 'PM-BKS-KNG12',
          itemName: 'Bungkus Rokok SGW Kuning SKT 12',
          qtyReturned: 2000,
          uom: 'Lembar',
          unitPrice: 285,
          subtotal: 570000,
          reason: 'Cacat cetak etiket kemasan: warna pudar pada lipatan lidah bungkus',
        },
      ],
      subtotalDpp: 570000,
      ppnAmount: 62700,
      totalDebitNote: 632700,
      reason: 'Cacat cetak etiket kemasan (retur ke percetakan)',
      status: 'POSTED',
      notes: 'Nota Debet memotong saldo hutang tagihan SI-2026-000002',
      createdAt: '2026-09-16T14:30:00Z',
    },
  ];

  const supplierInvoices: SupplierInvoice[] = [
    {
      id: 'si-1',
      invoiceNumber: 'SI-2026-000001',
      vendorInvoiceNo: 'INV/ATN/2026/09/014',
      supplierId: 'supp-1',
      supplierName: 'PT Agro Tembakau Nusantara Mandiri',
      poId: 'po-1',
      poNumber: 'PO-2026-000001',
      grnId: 'grn-1',
      grnNumber: 'GRN-2026-000001',
      invoiceDate: '2026-09-11',
      dueDate: '2026-10-11',
      dpp: 190000000,
      ppn: 20900000,
      total: 210900000,
      paidAmount: 210900000,
      paymentStatus: 'PAID',
      status: 'POSTED',
      fakturPajakNumber: '010.000-26.11223344',
      createdAt: '2026-09-11T11:00:00Z',
    },
    {
      id: 'si-2',
      invoiceNumber: 'SI-2026-000002',
      vendorInvoiceNo: 'SURYA/2026/09/88',
      supplierId: 'supp-2',
      supplierName: 'PT Percetakan Kemasan Surya Grafika',
      poId: 'po-2',
      poNumber: 'PO-2026-000002',
      grnId: 'grn-1',
      grnNumber: 'GRN-2026-000001',
      invoiceDate: '2026-09-15',
      dueDate: '2026-09-29',
      dpp: 28500000,
      ppn: 3135000,
      total: 31635000,
      paidAmount: 0,
      paymentStatus: 'UNPAID',
      status: 'POSTED',
      fakturPajakNumber: '010.000-26.99887766',
      createdAt: '2026-09-15T15:00:00Z',
    },
  ];

  const supplierPayments: SupplierPayment[] = [
    {
      id: 'sp-1',
      paymentNumber: 'PAY-2026-000001',
      supplierInvoiceId: 'si-1',
      invoiceNumber: 'SI-2026-000001',
      supplierId: 'supp-1',
      supplierName: 'PT Agro Tembakau Nusantara Mandiri',
      paymentDate: '2026-09-16',
      bankAccountId: 'coa-1002',
      bankAccountName: 'Bank BCA Operasional',
      amountPaid: 210900000,
      referenceNo: 'TRF-BCA-992140',
      notes: 'Pelunasan faktur pembelian TSG 2.000 Kg',
      createdAt: '2026-09-16T10:15:00Z',
    },
  ];

  const salesInvoices: SalesInvoice[] = [
    {
      id: 'inv-1',
      invoiceNumber: 'INV-2026-000001',
      customerId: 'cust-1',
      customerName: 'PT Distribusi Kretek Makmur Jateng',
      customerNpwp: '01.234.888.7-503.000',
      invoiceDate: '2026-09-15',
      dueDate: '2026-09-29',
      paymentType: 'CREDIT',
      items: [
        {
          id: 'sii-1',
          itemId: 'item-fg-kng12',
          itemCode: 'FG-SGW-KNG12',
          itemName: 'SGW Kuning SKT 12',
          qty: 4000,
          uom: 'Bungkus',
          unitPrice: 16500, // Harga Grosir DPP
          cogsUnit: 5800,
          totalCogs: 23200000,
          subtotal: 66000000,
        },
      ],
      dpp: 66000000,
      ppn: 7260000,
      totalAmount: 73260000,
      paidAmount: 73260000,
      paymentStatus: 'PAID',
      status: 'POSTED',
      fakturPajakNumber: '010.000-26.55667788',
      deliveryOrderNo: 'DO-2026-000001',
      notes: 'Pengiriman 400 Slop (40 Bal)',
      createdAt: '2026-09-15T11:00:00Z',
    },
    {
      id: 'inv-2',
      invoiceNumber: 'INV-2026-000002',
      customerId: 'cust-2',
      customerName: 'CV Barokah Sumber Niaga Jatim',
      customerNpwp: '02.345.999.1-602.000',
      invoiceDate: '2026-09-17',
      dueDate: '2026-10-08',
      paymentType: 'CREDIT',
      items: [
        {
          id: 'sii-2',
          itemId: 'item-fg-kng12',
          itemCode: 'FG-SGW-KNG12',
          itemName: 'SGW Kuning SKT 12',
          qty: 3000,
          uom: 'Bungkus',
          unitPrice: 16500,
          cogsUnit: 5800,
          totalCogs: 17400000,
          subtotal: 49500000,
        },
        {
          id: 'sii-3',
          itemId: 'item-fg-kng16',
          itemCode: 'FG-SGW-KNG16',
          itemName: 'SGW Kuning SKT 16',
          qty: 1500,
          uom: 'Bungkus',
          unitPrice: 22000,
          cogsUnit: 7400,
          totalCogs: 11100000,
          subtotal: 33000000,
        },
      ],
      dpp: 82500000,
      ppn: 9075000,
      totalAmount: 91575000,
      paidAmount: 0,
      paymentStatus: 'UNPAID',
      status: 'POSTED',
      fakturPajakNumber: '010.000-26.55667799',
      deliveryOrderNo: 'DO-2026-000002',
      notes: 'Pengiriman Gudang Gresik Term 21 Hari',
      createdAt: '2026-09-17T14:00:00Z',
    },
  ];

  const customerPayments: CustomerPayment[] = [
    {
      id: 'cp-1',
      paymentNumber: 'CR-2026-000001',
      salesInvoiceId: 'inv-1',
      invoiceNumber: 'INV-2026-000001',
      customerId: 'cust-1',
      customerName: 'PT Distribusi Kretek Makmur Jateng',
      paymentDate: '2026-09-18',
      bankAccountId: 'coa-1002',
      bankAccountName: 'Bank BCA Operasional',
      amountPaid: 73260000,
      referenceNo: 'TRF-BCA-100293',
      notes: 'Pelunasan tagihan INV-2026-000001 via BCA',
      createdAt: '2026-09-18T10:00:00Z',
    },
  ];

  const taxTransactions: TaxTransaction[] = [
    {
      id: 'tt-1',
      date: '2026-09-11',
      taxType: 'PPN_MASUKAN',
      sourceModule: 'PURCHASE',
      referenceNumber: 'SI-2026-000001',
      entityName: 'PT Agro Tembakau Nusantara Mandiri',
      entityNpwp: '01.998.776.5-502.000',
      dpp: 190000000,
      taxRate: 11,
      taxAmount: 20900000,
      fakturPajakNumber: '010.000-26.11223344',
      taxPeriodMonth: 9,
      taxPeriodYear: 2026,
      status: 'REPORTED',
    },
    {
      id: 'tt-2',
      date: '2026-09-15',
      taxType: 'PPN_MASUKAN',
      sourceModule: 'PURCHASE',
      referenceNumber: 'SI-2026-000002',
      entityName: 'PT Percetakan Kemasan Surya Grafika',
      entityNpwp: '02.445.667.8-601.000',
      dpp: 28500000,
      taxRate: 11,
      taxAmount: 3135000,
      fakturPajakNumber: '010.000-26.99887766',
      taxPeriodMonth: 9,
      taxPeriodYear: 2026,
      status: 'UNREPORTED',
    },
    {
      id: 'tt-3',
      date: '2026-09-15',
      taxType: 'PPN_KELUARAN',
      sourceModule: 'SALES',
      referenceNumber: 'INV-2026-000001',
      entityName: 'PT Distribusi Kretek Makmur Jateng',
      entityNpwp: '01.234.888.7-503.000',
      dpp: 66000000,
      taxRate: 11,
      taxAmount: 7260000,
      fakturPajakNumber: '010.000-26.55667788',
      taxPeriodMonth: 9,
      taxPeriodYear: 2026,
      status: 'REPORTED',
    },
    {
      id: 'tt-4',
      date: '2026-09-17',
      taxType: 'PPN_KELUARAN',
      sourceModule: 'SALES',
      referenceNumber: 'INV-2026-000002',
      entityName: 'CV Barokah Sumber Niaga Jatim',
      entityNpwp: '02.345.999.1-602.000',
      dpp: 82500000,
      taxRate: 11,
      taxAmount: 9075000,
      fakturPajakNumber: '010.000-26.55667799',
      taxPeriodMonth: 9,
      taxPeriodYear: 2026,
      status: 'UNREPORTED',
    },
  ];

  // Pre-generate balanced initial journals
  const journalEntries: JournalEntry[] = [
    {
      id: 'jv-1',
      journalNumber: 'JV-2026-000001',
      entryDate: '2026-09-11',
      referenceModule: 'PURCHASE_INVOICE',
      referenceId: 'si-1',
      referenceNumber: 'SI-2026-000001',
      description: 'Pencatatan Tagihan Pembelian Supplier PT Agro Tembakau Nusantara Mandiri',
      costCenter: 'LOGISTIK',
      lines: [
        { accountId: 'coa-1201', accountCode: '1201', accountName: 'Persediaan Bahan Baku (TSG)', debit: 190000000, credit: 0, memo: 'Pembelian 2000 Kg TSG' },
        { accountId: 'coa-1151', accountCode: '1151', accountName: 'PPN Masukan (Input VAT)', debit: 20900000, credit: 0, memo: 'PPN Masukan 11%' },
        { accountId: 'coa-2001', accountCode: '2001', accountName: 'Hutang Usaha (AP)', debit: 0, credit: 210900000, memo: 'Hutang Tagihan PT Agro Tembakau' },
      ],
      totalDebit: 210900000,
      totalCredit: 210900000,
      isBalanced: true,
      status: 'POSTED',
      createdAt: '2026-09-11T11:00:00Z',
    },
    {
      id: 'jv-2',
      journalNumber: 'JV-2026-000002',
      entryDate: '2026-09-14',
      referenceModule: 'PRODUCTION_PACKING',
      referenceId: 'wo-pack-1',
      referenceNumber: 'WO-2026-PK001',
      description: 'Hasil Produksi Packing Dilekati Cukai SGW Kuning SKT 12',
      costCenter: 'PRODUKSI',
      lines: [
        { accountId: 'coa-1206', accountCode: '1206', accountName: 'Persediaan Produk Jadi (FG)', debit: 46400000, credit: 0, memo: 'Penerimaan 8.000 Bungkus FG' },
        { accountId: 'coa-1205', accountCode: '1205', accountName: 'Persediaan Barang Dalam Proses (WIP)', debit: 0, credit: 38400000, memo: 'Konsumsi 96.000 Batang' },
        { accountId: 'coa-1202', accountCode: '1202', accountName: 'Persediaan Bahan Kemasan', debit: 0, credit: 6560000, memo: 'Konsumsi Bungkus/Slop' },
        { accountId: 'coa-2201', accountCode: '2201', accountName: 'Hutang Upah Borongan Produksi', debit: 0, credit: 1440000, memo: 'Upah Borongan Packing' },
      ],
      totalDebit: 46400000,
      totalCredit: 46400000,
      isBalanced: true,
      status: 'POSTED',
      createdAt: '2026-09-14T17:00:00Z',
    },
    {
      id: 'jv-3',
      journalNumber: 'JV-2026-000003',
      entryDate: '2026-09-15',
      referenceModule: 'SALES_INVOICE',
      referenceId: 'inv-1',
      referenceNumber: 'INV-2026-000001',
      description: 'Penjualan Hasil Tembakau ke PT Distribusi Kretek Makmur Jateng',
      costCenter: 'PENJUALAN',
      lines: [
        { accountId: 'coa-1101', accountCode: '1101', accountName: 'Piutang Usaha (AR)', debit: 73260000, credit: 0, memo: 'Tagihan Piutang Penjualan' },
        { accountId: 'coa-4001', accountCode: '4001', accountName: 'Pendapatan Penjualan Rokok', debit: 0, credit: 66000000, memo: 'DPP Penjualan Rokok SKT' },
        { accountId: 'coa-2151', accountCode: '2151', accountName: 'PPN Keluaran (Output VAT)', debit: 0, credit: 7260000, memo: 'PPN Keluaran 11%' },
        { accountId: 'coa-5001', accountCode: '5001', accountName: 'Harga Pokok Penjualan (HPP)', debit: 23200000, credit: 0, memo: 'HPP 4.000 Bungkus SGW Kuning 12' },
        { accountId: 'coa-1206', accountCode: '1206', accountName: 'Persediaan Produk Jadi (FG)', debit: 0, credit: 23200000, memo: 'Pengurangan Persediaan FG' },
      ],
      totalDebit: 96460000,
      totalCredit: 96460000,
      isBalanced: true,
      status: 'POSTED',
      createdAt: '2026-09-15T11:00:00Z',
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud-1',
      timestamp: '2026-09-01T08:00:00Z',
      userRole: 'SUPER_ADMIN',
      userName: 'Administrator Sistem',
      action: 'CREATE',
      entity: 'COMPANY_SETTINGS',
      recordId: 'comp-1',
      recordNumber: 'SGW-CFG-01',
      description: 'Inisialisasi Konfigurasi Pabrik PT SGW Nusantara Makmur',
    },
    {
      id: 'aud-2',
      timestamp: '2026-09-15T11:00:00Z',
      userRole: 'SALES',
      userName: 'Staf Penjualan & Distribusi',
      action: 'POST',
      entity: 'SALES_INVOICE',
      recordId: 'inv-1',
      recordNumber: 'INV-2026-000001',
      description: 'Posting Faktur Penjualan 4.000 Bungkus SGW Kuning SKT 12',
    },
  ];

  const fiscalPeriods: FiscalPeriod[] = [
    { year: 2026, month: 8, isClosed: true, closedAt: '2026-09-01T00:00:00Z', closedBy: 'Finance Director' },
    { year: 2026, month: 9, isClosed: false },
    { year: 2026, month: 10, isClosed: false },
  ];

  const payrollRecords: PayrollRecord[] = [
    {
      id: 'pr-1',
      payrollNumber: 'PAY-2026-09001',
      employeeId: 'emp-1',
      employeeName: 'Siti Aminah',
      department: 'PRODUCTION_GILING',
      period: '2026-09',
      baseSalaryOrWage: 26000,
      outputPieces: 100000,
      pieceRate: 26000,
      allowances: 0,
      overtime: 0,
      pph21Deduction: 6500,
      bpjsDeduction: 0,
      grossTotal: 2600000,
      netPayable: 2593500,
      status: 'PAID',
      paymentDate: '2026-09-15',
    },
  ];

  const stockTransfers: StockTransfer[] = [
    {
      id: 'trf-1',
      transferNumber: 'SJT-2026-000001',
      transferDate: '2026-09-14',
      originWarehouseId: 'wh-1',
      originWarehouseCode: 'WH-MATERIAL',
      originWarehouseName: 'Gudang Bahan Baku & Kemasan',
      destinationWarehouseId: 'wh-2',
      destinationWarehouseCode: 'WH-WIP',
      destinationWarehouseName: 'Gudang WIP & Lantai Produksi',
      items: [
        {
          id: 'trfi-1',
          itemId: 'item-1',
          itemCode: 'RM-TSG-01',
          itemName: 'Tembakau Siap Giling (TSG) Madura Grade A',
          qty: 500,
          uom: 'Kg',
          unitCost: 95000,
          totalCost: 47500000,
          notes: 'Transfer bahan racikan untuk rencana giling shift pagi',
        },
      ],
      totalQty: 500,
      totalValuation: 47500000,
      driverName: 'Pak Joko (Internal)',
      vehicleNo: 'K 8421 BB (Forklift/Tossa)',
      dispatcherName: 'Agus Subagyo (Logistik)',
      recipientName: 'Bambang Irawan (Mandor WIP)',
      status: 'COMPLETED',
      notes: 'Transfer rutin bahan baku ke lantai giling',
      createdAt: '2026-09-14T08:30:00Z',
    },
  ];

  const stockOpnames: StockOpname[] = [
    {
      id: 'opn-1',
      opnameNumber: 'BASO-2026-000001',
      opnameDate: '2026-08-31',
      warehouseId: 'wh-1',
      warehouseCode: 'WH-MATERIAL',
      warehouseName: 'Gudang Bahan Baku & Kemasan',
      auditorName: 'Tim Audit Internal (Hendri & Wahyu)',
      witnessName: 'Kepala Gudang (Agus Subagyo)',
      items: [
        {
          id: 'opni-1',
          itemId: 'item-1',
          itemCode: 'RM-TSG-01',
          itemName: 'Tembakau Siap Giling (TSG) Madura Grade A',
          uom: 'Kg',
          systemQty: 1205,
          physicalQty: 1200,
          varianceQty: -5,
          unitCost: 95000,
          varianceCost: -475000,
          reason: 'SUSUT_ALAMI_KADAR_AIR',
          notes: 'Penyusutan penguapan kelembaban tembakau selama penyimpanan gudang 14 hari',
        },
      ],
      totalItemsCounted: 1,
      totalItemsWithVariance: 1,
      totalVarianceCost: -475000,
      status: 'POSTED',
      notes: 'Berita Acara Stock Opname Tutup Buku Agustus 2026',
      createdAt: '2026-08-31T17:00:00Z',
    },
  ];

  return {
    companySettings,
    currentUserRole: 'SUPER_ADMIN',
    currentUserName: 'Prasetyo Utomo (Super Admin)',
    items,
    warehouses,
    customers,
    suppliers,
    boms,
    laborTariffs,
    employees,
    chartOfAccounts,
    taxMasters,
    exciseTariffs,
    purchaseOrders,
    goodsReceiptNotes,
    purchaseReturns,
    supplierInvoices,
    supplierPayments,
    stockInventory,
    stockMovements,
    stockTransfers,
    stockOpnames,
    workOrders,
    wasteRecords,
    salesInvoices,
    customerPayments,
    journalEntries,
    taxTransactions,
    pitaCukaiReceipts,
    pitaCukaiUsages,
    payrollRecords,
    auditLogs,
    fiscalPeriods,
  };
}

class ERPDatabaseService {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.companySettings && parsed.companySettings.directorName === 'H. Sudarsono Prasetyo') {
          parsed.companySettings.directorName = '';
        }
        if (!parsed.purchaseReturns) {
          parsed.purchaseReturns = [];
        }
        if (!parsed.stockTransfers) {
          parsed.stockTransfers = [];
        }
        if (!parsed.stockOpnames) {
          parsed.stockOpnames = [];
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial seed', e);
    }
    const initial = getInitialDatabaseState();
    this.saveState(initial);
    return initial;
  }

  private saveState(newState?: DatabaseState): void {
    if (newState) this.state = newState;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public resetToDefault(): void {
    const initial = getInitialDatabaseState();
    this.saveState(initial);
  }

  public setUserRole(role: UserRole, name: string): void {
    this.state.currentUserRole = role;
    this.state.currentUserName = name;
    this.saveState();
  }

  public logAudit(
    action: AuditLog['action'],
    entity: string,
    recordId: string,
    recordNumber: string,
    description: string,
  ): void {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      userRole: this.state.currentUserRole,
      userName: this.state.currentUserName,
      action,
      entity,
      recordId,
      recordNumber,
      description,
    };
    this.state.auditLogs.unshift(log);
    this.saveState();
  }

  // --- PROCUREMENT TRANSACTIONS ---
  public createPurchaseOrder(data: Omit<PurchaseOrder, 'id' | 'poNumber' | 'status' | 'createdAt'>): PurchaseOrder {
    const nextSeq = this.state.purchaseOrders.length + 1;
    const poNumber = `PO-2026-${String(nextSeq).padStart(6, '0')}`;
    const newPO: PurchaseOrder = {
      ...data,
      id: `po-${Date.now()}`,
      poNumber,
      status: 'POSTED',
      createdAt: new Date().toISOString(),
    };

    this.state.purchaseOrders.unshift(newPO);
    this.logAudit('POST', 'PURCHASE_ORDER', newPO.id, newPO.poNumber, `Membuat PO ke ${newPO.supplierName}`);
    this.saveState();
    return newPO;
  }

  public cancelPurchaseOrder(poId: string, reason?: string): { success: boolean; message: string } {
    const po = this.state.purchaseOrders.find((p) => p.id === poId);
    if (!po) return { success: false, message: 'PO tidak ditemukan' };
    if (po.status === 'COMPLETED' || po.status === 'PARTIALLY_RECEIVED') {
      return { success: false, message: 'PO yang sudah diterima (GRN) tidak dapat dibatalkan.' };
    }
    po.status = 'CANCELLED';
    if (reason) po.notes = (po.notes ? po.notes + ' | ' : '') + `Batal: ${reason}`;
    this.logAudit('CANCEL', 'PURCHASE_ORDER', po.id, po.poNumber, `Batalkan PO ${po.poNumber} (${reason || 'Dibatalkan'})`);
    this.saveState();
    return { success: true, message: `PO ${po.poNumber} berhasil dibatalkan` };
  }

  public updatePurchaseOrder(poId: string, updates: Partial<PurchaseOrder>): { success: boolean; message: string } {
    const po = this.state.purchaseOrders.find((p) => p.id === poId);
    if (!po) return { success: false, message: 'PO tidak ditemukan' };
    if (po.status === 'COMPLETED') {
      return { success: false, message: 'PO yang sudah selesai tidak dapat diubah' };
    }
    Object.assign(po, updates);
    this.logAudit('UPDATE', 'PURCHASE_ORDER', po.id, po.poNumber, `Update PO ${po.poNumber}`);
    this.saveState();
    return { success: true, message: `PO ${po.poNumber} berhasil diperbarui` };
  }

  public postGoodsReceiptNote(
    poId: string,
    vendorDeliveryRef: string,
    notes?: string,
    receivedQuantities?: Record<string, number>,
    receiptDate?: string,
    qcData?: {
      moisturePercent?: number;
      impurityPercent?: number;
      qcPassed?: boolean;
      qcInspectorName?: string;
    },
  ): GoodsReceiptNote {
    const po = this.state.purchaseOrders.find((p) => p.id === poId);
    if (!po) throw new Error('PO tidak ditemukan');

    const nextSeq = this.state.goodsReceiptNotes.length + 1;
    const grnNumber = `GRN-2026-${String(nextSeq).padStart(6, '0')}`;
    const warehouseId = 'wh-1'; // WH-MATERIAL

    const grnItems: GoodsReceiptItem[] = po.items
      .map((it) => {
        const qtyToReceive =
          receivedQuantities && receivedQuantities[it.id] !== undefined
            ? Number(receivedQuantities[it.id])
            : it.qty;
        return {
          id: `grni-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          poItemId: it.id,
          itemId: it.itemId,
          itemCode: it.itemCode,
          itemName: it.itemName,
          qtyOrdered: it.qty,
          qtyReceived: qtyToReceive,
          uom: it.uom,
          unitPrice: it.unitPrice,
          subtotal: qtyToReceive * it.unitPrice,
        };
      })
      .filter((it) => it.qtyReceived > 0);

    if (grnItems.length === 0) {
      throw new Error('Tidak ada kuantitas barang yang diterima (> 0)');
    }

    const totalValue = grnItems.reduce((acc, it) => acc + it.subtotal, 0);

    const grn: GoodsReceiptNote = {
      id: `grn-${Date.now()}`,
      grnNumber,
      poId: po.id,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      warehouseId,
      receiptDate: receiptDate || new Date().toISOString().split('T')[0],
      vendorDeliveryRef,
      items: grnItems,
      totalValue,
      status: 'POSTED',
      notes,
      moisturePercent: qcData?.moisturePercent,
      impurityPercent: qcData?.impurityPercent,
      qcPassed: qcData?.qcPassed,
      qcInspectorName: qcData?.qcInspectorName,
      createdAt: new Date().toISOString(),
    };

    // Update physical inventory & calculate Moving Average Cost
    grn.items.forEach((item) => {
      const inv = this.state.stockInventory.find(
        (si) => si.itemId === item.itemId && si.warehouseId === warehouseId,
      );

      const oldQty = inv ? inv.qty : 0;
      const oldAvgCost = inv ? inv.averageCost : item.unitPrice;
      const newQty = oldQty + item.qtyReceived;
      const newAvgCost = Math.round((oldQty * oldAvgCost + item.qtyReceived * item.unitPrice) / newQty);

      if (inv) {
        inv.qty = newQty;
        inv.averageCost = newAvgCost;
        inv.totalValuation = newQty * newAvgCost;
      } else {
        this.state.stockInventory.push({
          itemId: item.itemId,
          itemCode: item.itemCode,
          itemName: item.itemName,
          warehouseId,
          warehouseCode: 'WH-MATERIAL',
          qty: newQty,
          uom: item.uom,
          averageCost: newAvgCost,
          totalValuation: newQty * newAvgCost,
        });
      }

      // Record Stock Movement
      this.state.stockMovements.unshift({
        id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        date: grn.receiptDate,
        movementType: 'PURCHASE_GRN',
        referenceNumber: grn.grnNumber,
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        warehouseId,
        warehouseCode: 'WH-MATERIAL',
        qtyIn: item.qtyReceived,
        qtyOut: 0,
        balanceQty: newQty,
        unitCost: newAvgCost,
        totalCost: item.subtotal,
        notes: `Penerimaan Barang PO ${po.poNumber} (${grn.vendorDeliveryRef})${notes ? ` - ${notes}` : ''}`,
        createdAt: new Date().toISOString(),
      });
    });

    // Check if fully or partially received
    const allGrnsForPo = [...this.state.goodsReceiptNotes, grn].filter((g) => g.poId === po.id);
    const totalReceivedPerItem: Record<string, number> = {};
    allGrnsForPo.forEach((g) => {
      g.items.forEach((it) => {
        totalReceivedPerItem[it.poItemId] = (totalReceivedPerItem[it.poItemId] || 0) + it.qtyReceived;
      });
    });

    const isFullyReceived = po.items.every((it) => (totalReceivedPerItem[it.id] || 0) >= it.qty);
    po.status = isFullyReceived ? 'COMPLETED' : 'PARTIALLY_RECEIVED';

    this.state.goodsReceiptNotes.unshift(grn);
    this.logAudit('POST', 'GOODS_RECEIPT', grn.id, grn.grnNumber, `Penerimaan GRN PO ${po.poNumber} (${grn.vendorDeliveryRef})`);
    this.saveState();
    return grn;
  }

  public postStockAdjustment(data: {
    itemId: string;
    warehouseId: string;
    adjustmentType: 'IN' | 'OUT';
    qty: number;
    reason: string;
    notes?: string;
  }): { success: boolean; message: string } {
    const item = this.state.items.find((i) => i.id === data.itemId);
    if (!item) return { success: false, message: 'Barang tidak ditemukan' };

    const warehouse = this.state.warehouses.find((w) => w.id === data.warehouseId) || {
      id: data.warehouseId,
      code: 'WH-MATERIAL',
      name: 'Gudang',
      description: '',
      isActive: true,
    };

    let inv = this.state.stockInventory.find(
      (s) => s.itemId === data.itemId && s.warehouseId === data.warehouseId,
    );

    if (!inv && data.adjustmentType === 'OUT') {
      return { success: false, message: 'Stok barang tidak ditemukan di gudang yang dipilih.' };
    }

    if (inv && data.adjustmentType === 'OUT' && inv.qty < data.qty) {
      return {
        success: false,
        message: `Kuantitas penyesuaian berkurang (${data.qty} ${item.stockUom}) melebihi stok yang tersedia (${inv.qty} ${item.stockUom}).`,
      };
    }

    const currentCost = inv ? inv.averageCost : item.standardCost || 1000;
    const totalCost = data.qty * currentCost;
    const nextSeq = this.state.stockMovements.filter((m) => m.movementType === 'ADJUSTMENT').length + 1;
    const adjNumber = `ADJ-2026-${String(nextSeq).padStart(5, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    let newBalanceQty = 0;
    if (inv) {
      if (data.adjustmentType === 'IN') {
        inv.qty += data.qty;
      } else {
        inv.qty -= data.qty;
      }
      inv.totalValuation = inv.qty * inv.averageCost;
      newBalanceQty = inv.qty;
    } else {
      newBalanceQty = data.qty;
      inv = {
        itemId: item.id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        warehouseId: warehouse.id,
        warehouseCode: warehouse.code,
        qty: data.qty,
        uom: item.stockUom,
        averageCost: currentCost,
        totalValuation: totalCost,
      };
      this.state.stockInventory.push(inv);
    }

    // Record stock movement
    this.state.stockMovements.unshift({
      id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      date: today,
      movementType: 'ADJUSTMENT',
      referenceNumber: adjNumber,
      itemId: item.id,
      itemCode: item.itemCode,
      itemName: item.itemName,
      warehouseId: warehouse.id,
      warehouseCode: warehouse.code,
      qtyIn: data.adjustmentType === 'IN' ? data.qty : 0,
      qtyOut: data.adjustmentType === 'OUT' ? data.qty : 0,
      balanceQty: newBalanceQty,
      unitCost: currentCost,
      totalCost,
      notes: `Penyesuaian Stok: ${data.reason}${data.notes ? ` - ${data.notes}` : ''}`,
      createdAt: new Date().toISOString(),
    });

    // Generate balanced adjustment journal entry
    const jv = JournalEngine.createStockAdjustmentJournal(
      adjNumber,
      item.itemName,
      data.adjustmentType,
      totalCost,
      data.reason,
      today,
    );
    this.state.journalEntries.unshift(jv);

    this.logAudit(
      'POST',
      'STOCK_ADJUSTMENT',
      adjNumber,
      adjNumber,
      `Penyesuaian stok ${item.itemName} (${data.adjustmentType === 'IN' ? '+' : '-'}${data.qty} ${item.stockUom}): ${data.reason}`,
    );
    this.saveState();
    return { success: true, message: `Penyesuaian stok ${adjNumber} berhasil dicatat dan dijurnal.` };
  }

  public createSupplierInvoice(
    poId: string,
    vendorInvoiceNo: string,
    fakturPajakNumber?: string,
  ): SupplierInvoice {
    const po = this.state.purchaseOrders.find((p) => p.id === poId);
    if (!po) throw new Error('PO tidak ditemukan');

    const grn = this.state.goodsReceiptNotes.find((g) => g.poId === poId);
    const grnId = grn ? grn.id : '';
    const grnNumber = grn ? grn.grnNumber : '';

    const nextSeq = this.state.supplierInvoices.length + 1;
    const invoiceNumber = `SI-2026-${String(nextSeq).padStart(6, '0')}`;
    const invoiceDate = new Date().toISOString().split('T')[0];

    const d = new Date();
    d.setDate(d.getDate() + 30);
    const dueDate = d.toISOString().split('T')[0];

    const invoice: SupplierInvoice = {
      id: `si-${Date.now()}`,
      invoiceNumber,
      vendorInvoiceNo,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      poId: po.id,
      poNumber: po.poNumber,
      grnId,
      grnNumber,
      invoiceDate,
      dueDate,
      dpp: po.subtotal,
      ppn: po.ppnAmount,
      total: po.totalAmount,
      paidAmount: 0,
      paymentStatus: 'UNPAID',
      status: 'POSTED',
      fakturPajakNumber,
      createdAt: new Date().toISOString(),
    };

    // Automatic Journal Engine Call
    const nextJvSeq = this.state.journalEntries.length + 1;
    const jvNumber = `JV-2026-${String(nextJvSeq).padStart(6, '0')}`;
    const jv = JournalEngine.createSupplierInvoiceJournal(invoice, jvNumber);
    this.state.journalEntries.unshift(jv);

    // Automatic Tax Record Call (PPN Masukan)
    this.state.taxTransactions.unshift({
      id: `tt-${Date.now()}`,
      date: invoice.invoiceDate,
      taxType: 'PPN_MASUKAN',
      sourceModule: 'PURCHASE',
      referenceNumber: invoice.invoiceNumber,
      entityName: invoice.supplierName,
      entityNpwp: '01.998.776.5-502.000',
      dpp: invoice.dpp,
      taxRate: 11,
      taxAmount: invoice.ppn,
      fakturPajakNumber: invoice.fakturPajakNumber,
      taxPeriodMonth: new Date().getMonth() + 1,
      taxPeriodYear: new Date().getFullYear(),
      status: 'UNREPORTED',
    });

    this.state.supplierInvoices.unshift(invoice);
    this.logAudit('POST', 'SUPPLIER_INVOICE', invoice.id, invoice.invoiceNumber, `Posting Tagihan Supplier ${vendorInvoiceNo}`);
    this.saveState();
    return invoice;
  }

  public postSupplierPayment(
    invoiceId: string,
    amount: number,
    bankCode: string,
    referenceNo: string,
  ): SupplierPayment {
    const inv = this.state.supplierInvoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error('Tagihan supplier tidak ditemukan');

    const nextSeq = this.state.supplierPayments.length + 1;
    const paymentNumber = `PAY-2026-${String(nextSeq).padStart(6, '0')}`;
    const date = new Date().toISOString().split('T')[0];

    const coaBank = this.state.chartOfAccounts.find((c) => c.code === bankCode);
    const bankName = coaBank ? coaBank.name : 'Kas / Bank';

    const payment: SupplierPayment = {
      id: `sp-${Date.now()}`,
      paymentNumber,
      supplierInvoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      supplierId: inv.supplierId,
      supplierName: inv.supplierName,
      paymentDate: date,
      bankAccountId: `coa-${bankCode}`,
      bankAccountName: bankName,
      amountPaid: amount,
      referenceNo,
      createdAt: new Date().toISOString(),
    };

    inv.paidAmount += amount;
    if (inv.paidAmount >= inv.total - 1) {
      inv.paymentStatus = 'PAID';
    } else {
      inv.paymentStatus = 'PARTIAL';
    }

    // Jurnal Otomatis Pembayaran Hutang
    const jv = JournalEngine.createSupplierPaymentJournal(
      payment.paymentNumber,
      inv.invoiceNumber,
      inv.supplierName,
      amount,
      bankCode,
      bankName,
      date,
    );
    this.state.journalEntries.unshift(jv);

    this.state.supplierPayments.unshift(payment);
    this.logAudit('PAYMENT', 'SUPPLIER_PAYMENT', payment.id, payment.paymentNumber, `Pembayaran ${amount.toLocaleString()} ke ${inv.supplierName}`);
    this.saveState();
    return payment;
  }

  /**
   * Update Minimum / Safety Stock (ROP) for an item
   */
  public updateItemMinStock(itemId: string, minStock: number, maxStock?: number): { success: boolean; message: string } {
    const item = this.state.items.find((it) => it.id === itemId);
    if (!item) throw new Error('Item tidak ditemukan');

    const oldMin = item.minStock;
    item.minStock = minStock;
    if (typeof maxStock === 'number' && maxStock > 0) {
      item.maxStock = maxStock;
    }

    this.logAudit(
      'UPDATE',
      'ITEM_SAFETY_STOCK',
      item.id,
      item.itemCode,
      `Perubahan Safety Stock/ROP ${item.itemName}: dari ${oldMin} menjadi ${minStock} ${item.stockUom}`,
    );
    this.saveState();
    return { success: true, message: `Batas Safety Stock ${item.itemName} berhasil diperbarui.` };
  }

  /**
   * Post Purchase Return & Issue Debit Note (DN)
   * Decrements warehouse stock, updates stock card / movements,
   * reduces AP on linked supplier invoice, and automatically journals double-entry.
   */
  public postPurchaseReturn(data: {
    poId?: string;
    grnId?: string;
    supplierInvoiceId?: string;
    supplierId: string;
    warehouseId: string;
    items: {
      itemId: string;
      qtyReturned: number;
      unitPrice: number;
      reason: string;
    }[];
    notes?: string;
    returnDate: string;
  }): PurchaseReturn {
    const supplier = this.state.suppliers.find((s) => s.id === data.supplierId);
    if (!supplier) throw new Error('Pemasok (Supplier) tidak ditemukan');

    const warehouse = this.state.warehouses.find((w) => w.id === data.warehouseId);
    if (!warehouse) throw new Error('Gudang asal retur tidak ditemukan');

    if (!data.items || data.items.length === 0) {
      throw new Error('Minimal 1 barang harus dipilih untuk retur pembelian');
    }

    const nextSeq = this.state.purchaseReturns.length + 1;
    const returnNumber = `PRT-2026-${String(nextSeq).padStart(6, '0')}`;
    const debitNoteNumber = `DN-2026-${String(nextSeq).padStart(6, '0')}`;

    let subtotalDpp = 0;
    const returnItems: PurchaseReturnItem[] = [];

    for (const itemData of data.items) {
      const item = this.state.items.find((it) => it.id === itemData.itemId);
      if (!item) throw new Error(`Barang ID ${itemData.itemId} tidak ditemukan`);

      // Check stock availability in warehouse
      const inv = this.state.stockInventory.find(
        (i) => i.itemId === item.id && i.warehouseId === data.warehouseId,
      );
      if (!inv || inv.qty < itemData.qtyReturned) {
        const available = inv ? inv.qty : 0;
        throw new Error(
          `Stok tidak mencukupi untuk retur ${item.itemName}. Tersedia di gudang: ${available} ${item.stockUom}, diminta retur: ${itemData.qtyReturned} ${item.stockUom}`,
        );
      }

      // Deduct inventory
      inv.qty -= itemData.qtyReturned;
      inv.totalValuation = Math.max(0, inv.qty * inv.averageCost);

      const lineSubtotal = itemData.qtyReturned * itemData.unitPrice;
      subtotalDpp += lineSubtotal;

      returnItems.push({
        id: `prti-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        itemId: item.id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        qtyReturned: itemData.qtyReturned,
        uom: item.stockUom,
        unitPrice: itemData.unitPrice,
        subtotal: lineSubtotal,
        reason: itemData.reason || 'Retur ke Pemasok',
      });

      // Add Stock Movement record
      this.state.stockMovements.unshift({
        id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: data.returnDate,
        movementType: 'PURCHASE_RETURN',
        referenceNumber: returnNumber,
        itemId: item.id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        warehouseId: warehouse.id,
        warehouseCode: warehouse.code,
        qtyIn: 0,
        qtyOut: itemData.qtyReturned,
        balanceQty: inv.qty,
        uom: item.stockUom,
        unitCost: itemData.unitPrice,
        totalCost: lineSubtotal,
        notes: `Retur Pembelian ${returnNumber} (${debitNoteNumber}): ${itemData.reason}`,
        createdAt: new Date().toISOString(),
      });
    }

    // PPN calculation: check supplier or linked invoice
    let ppnRate = supplier.taxStatus === 'TAXABLE' ? 11 : 0;
    const linkedInvoice = data.supplierInvoiceId
      ? this.state.supplierInvoices.find((si) => si.id === data.supplierInvoiceId)
      : undefined;

    if (linkedInvoice && linkedInvoice.ppn > 0) {
      ppnRate = 11;
    }

    const ppnAmount = Math.round((subtotalDpp * ppnRate) / 100);
    const totalDebitNote = subtotalDpp + ppnAmount;

    // Optional references
    const linkedPo = data.poId ? this.state.purchaseOrders.find((p) => p.id === data.poId) : undefined;
    const linkedGrn = data.grnId ? this.state.goodsReceiptNotes.find((g) => g.id === data.grnId) : undefined;

    const purchaseReturn: PurchaseReturn = {
      id: `prt-${Date.now()}`,
      returnNumber,
      debitNoteNumber,
      poId: linkedPo ? linkedPo.id : undefined,
      poNumber: linkedPo ? linkedPo.poNumber : undefined,
      grnId: linkedGrn ? linkedGrn.id : undefined,
      grnNumber: linkedGrn ? linkedGrn.grnNumber : undefined,
      supplierInvoiceId: linkedInvoice ? linkedInvoice.id : undefined,
      supplierInvoiceNumber: linkedInvoice ? linkedInvoice.invoiceNumber : undefined,
      supplierId: supplier.id,
      supplierName: supplier.name,
      warehouseId: warehouse.id,
      returnDate: data.returnDate,
      items: returnItems,
      subtotalDpp,
      ppnAmount,
      totalDebitNote,
      reason: returnItems.map((r) => r.reason).join('; ') || 'Retur Pembelian Bahan',
      status: 'POSTED',
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    // If linked to an invoice, reduce total or mark offset
    if (linkedInvoice) {
      linkedInvoice.total = Math.max(0, linkedInvoice.total - totalDebitNote);
      linkedInvoice.dpp = Math.max(0, linkedInvoice.dpp - subtotalDpp);
      linkedInvoice.ppn = Math.max(0, linkedInvoice.ppn - ppnAmount);
      if (linkedInvoice.paidAmount >= linkedInvoice.total) {
        linkedInvoice.paymentStatus = 'PAID';
      }
      linkedInvoice.notes = (linkedInvoice.notes ? linkedInvoice.notes + ' | ' : '') + `Dipotong DN ${debitNoteNumber} sebesar Rp ${totalDebitNote.toLocaleString()}`;
    }

    // Auto Journal Entry
    const nextJvSeq = this.state.journalEntries.length + 1;
    const jvNumber = `JV-2026-${String(nextJvSeq).padStart(6, '0')}`;
    const jv = JournalEngine.createPurchaseReturnJournal(purchaseReturn, jvNumber);
    this.state.journalEntries.unshift(jv);

    // Save to state & Audit Trail
    this.state.purchaseReturns.unshift(purchaseReturn);
    this.logAudit(
      'POST',
      'PURCHASE_RETURN',
      purchaseReturn.id,
      purchaseReturn.returnNumber,
      `Posting Retur Pembelian ${returnNumber} & Nota Debet ${debitNoteNumber} ke ${supplier.name} (Rp ${totalDebitNote.toLocaleString()})`,
    );

    this.saveState();
    return purchaseReturn;
  }

  /**
   * Inter-Warehouse Stock Transfer (Mutasi Antar Gudang)
   * Decrements origin warehouse stock, increments destination warehouse stock,
   * records 2 stock movements (TRANSFER out and in), and issues Surat Jalan Transfer (SJT).
   */
  public postStockTransfer(data: {
    originWarehouseId: string;
    destinationWarehouseId: string;
    transferDate: string;
    items: {
      itemId: string;
      qty: number;
      notes?: string;
    }[];
    driverName?: string;
    vehicleNo?: string;
    dispatcherName?: string;
    recipientName?: string;
    notes?: string;
  }): StockTransfer {
    if (data.originWarehouseId === data.destinationWarehouseId) {
      throw new Error('Gudang asal dan gudang tujuan pemindahan tidak boleh sama.');
    }

    const originWh = this.state.warehouses.find((w) => w.id === data.originWarehouseId);
    if (!originWh) throw new Error('Gudang asal tidak ditemukan.');

    const destWh = this.state.warehouses.find((w) => w.id === data.destinationWarehouseId);
    if (!destWh) throw new Error('Gudang tujuan tidak ditemukan.');

    if (!data.items || data.items.length === 0) {
      throw new Error('Minimal 1 barang harus dipilih untuk transfer.');
    }

    const nextSeq = this.state.stockTransfers.length + 1;
    const transferNumber = `SJT-2026-${String(nextSeq).padStart(6, '0')}`;
    const transferDate = data.transferDate || new Date().toISOString().split('T')[0];

    const transferItems: StockTransferItem[] = [];
    let totalValuation = 0;
    let totalQty = 0;

    for (const line of data.items) {
      if (line.qty <= 0) continue;
      const item = this.state.items.find((it) => it.id === line.itemId);
      if (!item) throw new Error(`Barang ID ${line.itemId} tidak ditemukan.`);

      // Check stock in origin
      const originInv = this.state.stockInventory.find(
        (si) => si.itemId === line.itemId && si.warehouseId === data.originWarehouseId,
      );

      if (!originInv || originInv.qty < line.qty) {
        const avail = originInv ? originInv.qty : 0;
        throw new Error(
          `Stok ${item.itemName} di ${originWh.name} tidak mencukupi. Tersedia: ${avail.toLocaleString()} ${item.stockUom}, Diminta: ${line.qty.toLocaleString()} ${item.stockUom}`,
        );
      }

      const unitCost = originInv.averageCost || item.standardCost || 0;
      const lineCost = line.qty * unitCost;

      // 1. Decrement origin inventory
      originInv.qty -= line.qty;
      originInv.totalValuation = Math.max(0, originInv.qty * originInv.averageCost);

      // 2. Increment destination inventory (with moving average cost update)
      const destInv = this.state.stockInventory.find(
        (si) => si.itemId === line.itemId && si.warehouseId === data.destinationWarehouseId,
      );

      if (destInv) {
        const oldDestQty = destInv.qty;
        const oldDestCost = destInv.averageCost;
        const newDestQty = oldDestQty + line.qty;
        const newDestAvgCost = Math.round((oldDestQty * oldDestCost + lineCost) / newDestQty);

        destInv.qty = newDestQty;
        destInv.averageCost = newDestAvgCost;
        destInv.totalValuation = newDestQty * newDestAvgCost;
      } else {
        const newDestInv: StockInventory = {
          itemId: item.id,
          itemCode: item.itemCode,
          itemName: item.itemName,
          warehouseId: destWh.id,
          warehouseCode: destWh.code,
          qty: line.qty,
          uom: item.stockUom,
          averageCost: unitCost,
          totalValuation: lineCost,
        };
        this.state.stockInventory.push(newDestInv);
      }

      // 3. Record Movement OUT at Origin
      this.state.stockMovements.unshift({
        id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: transferDate,
        movementType: 'TRANSFER',
        referenceNumber: transferNumber,
        itemId: item.id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        warehouseId: originWh.id,
        warehouseCode: originWh.code,
        qtyIn: 0,
        qtyOut: line.qty,
        balanceQty: originInv.qty,
        uom: item.stockUom,
        unitCost,
        totalCost: lineCost,
        notes: `Transfer Keluar ke ${destWh.name} (SJT ${transferNumber})${line.notes ? ` - ${line.notes}` : ''}`,
        createdAt: new Date().toISOString(),
      });

      // 4. Record Movement IN at Destination
      const currentDestBalance = destInv ? destInv.qty : line.qty;
      this.state.stockMovements.unshift({
        id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: transferDate,
        movementType: 'TRANSFER',
        referenceNumber: transferNumber,
        itemId: item.id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        warehouseId: destWh.id,
        warehouseCode: destWh.code,
        qtyIn: line.qty,
        qtyOut: 0,
        balanceQty: currentDestBalance,
        uom: item.stockUom,
        unitCost,
        totalCost: lineCost,
        notes: `Transfer Masuk dari ${originWh.name} (SJT ${transferNumber})${line.notes ? ` - ${line.notes}` : ''}`,
        createdAt: new Date().toISOString(),
      });

      transferItems.push({
        id: `trfi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        itemId: item.id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        qty: line.qty,
        uom: item.stockUom,
        unitCost,
        totalCost: lineCost,
        notes: line.notes,
      });

      totalValuation += lineCost;
      totalQty += line.qty;
    }

    const transferRecord: StockTransfer = {
      id: `trf-${Date.now()}`,
      transferNumber,
      transferDate,
      originWarehouseId: originWh.id,
      originWarehouseCode: originWh.code,
      originWarehouseName: originWh.name,
      destinationWarehouseId: destWh.id,
      destinationWarehouseCode: destWh.code,
      destinationWarehouseName: destWh.name,
      items: transferItems,
      totalQty,
      totalValuation,
      driverName: data.driverName || 'Petugas Angkut Logistik',
      vehicleNo: data.vehicleNo || 'Armada Internal Gudang',
      dispatcherName: data.dispatcherName || this.state.currentUserName,
      recipientName: data.recipientName || 'Petugas Gudang Tujuan',
      status: 'COMPLETED',
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    this.state.stockTransfers.unshift(transferRecord);
    this.logAudit(
      'POST',
      'STOCK_TRANSFER',
      transferRecord.id,
      transferRecord.transferNumber,
      `Mutasi Antar Gudang ${transferNumber}: ${originWh.name} -> ${destWh.name} (${totalQty} unit / Rp ${totalValuation.toLocaleString()})`,
    );

    this.saveState();
    return transferRecord;
  }

  /**
   * Bulk Physical Stock Opname (Penghitungan Fisik Gudang & BASO)
   * Reconciles physical count with system stock, generates variance movements,
   * balances adjustments to COA 5003/1201 via journal entry, and saves BASO document.
   */
  public postBulkStockOpname(data: {
    warehouseId: string;
    opnameDate: string;
    auditorName: string;
    witnessName?: string;
    items: {
      itemId: string;
      physicalQty: number;
      systemQty: number;
      reason: string;
      notes?: string;
    }[];
    notes?: string;
  }): StockOpname {
    const warehouse = this.state.warehouses.find((w) => w.id === data.warehouseId);
    if (!warehouse) throw new Error('Gudang Stock Opname tidak ditemukan.');

    const nextSeq = this.state.stockOpnames.length + 1;
    const opnameNumber = `BASO-2026-${String(nextSeq).padStart(6, '0')}`;
    const opnameDate = data.opnameDate || new Date().toISOString().split('T')[0];

    const opnameItems: StockOpnameItem[] = [];
    let totalItemsWithVariance = 0;
    let totalVarianceCost = 0;

    for (const row of data.items) {
      const item = this.state.items.find((it) => it.id === row.itemId);
      if (!item) continue;

      let inv = this.state.stockInventory.find(
        (si) => si.itemId === row.itemId && si.warehouseId === data.warehouseId,
      );

      const systemQty = inv ? inv.qty : 0;
      const physicalQty = row.physicalQty;
      const varianceQty = physicalQty - systemQty;
      const unitCost = inv ? inv.averageCost : item.standardCost || 0;
      const varianceCost = varianceQty * unitCost;

      if (varianceQty !== 0) {
        totalItemsWithVariance++;
        totalVarianceCost += varianceCost;

        // Update inventory record
        if (inv) {
          inv.qty = physicalQty;
          inv.totalValuation = physicalQty * inv.averageCost;
        } else if (physicalQty > 0) {
          inv = {
            itemId: item.id,
            itemCode: item.itemCode,
            itemName: item.itemName,
            warehouseId: warehouse.id,
            warehouseCode: warehouse.code,
            qty: physicalQty,
            uom: item.stockUom,
            averageCost: unitCost,
            totalValuation: physicalQty * unitCost,
          };
          this.state.stockInventory.push(inv);
        }

        // Record stock movement
        this.state.stockMovements.unshift({
          id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: opnameDate,
          movementType: 'ADJUSTMENT',
          referenceNumber: opnameNumber,
          itemId: item.id,
          itemCode: item.itemCode,
          itemName: item.itemName,
          warehouseId: warehouse.id,
          warehouseCode: warehouse.code,
          qtyIn: varianceQty > 0 ? varianceQty : 0,
          qtyOut: varianceQty < 0 ? Math.abs(varianceQty) : 0,
          balanceQty: physicalQty,
          uom: item.stockUom,
          unitCost,
          totalCost: Math.abs(varianceCost),
          notes: `Stock Opname (${row.reason}): Selisih ${varianceQty > 0 ? '+' : ''}${varianceQty} ${item.stockUom}${row.notes ? ` - ${row.notes}` : ''}`,
          createdAt: new Date().toISOString(),
        });

        // Journal Entry for variance
        const jv = JournalEngine.createStockAdjustmentJournal(
          opnameNumber,
          item.itemName,
          varianceQty < 0 ? 'OUT' : 'IN',
          Math.abs(varianceCost),
          `Stock Opname: ${row.reason}`,
          opnameDate,
        );
        this.state.journalEntries.unshift(jv);
      }

      opnameItems.push({
        id: `opni-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        itemId: item.id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        uom: item.stockUom,
        systemQty,
        physicalQty,
        varianceQty,
        unitCost,
        varianceCost,
        reason: varianceQty === 0 ? 'COCOK' : row.reason || 'PENYESUAIAN_OPNAME',
        notes: row.notes,
      });
    }

    const opnameRecord: StockOpname = {
      id: `opn-${Date.now()}`,
      opnameNumber,
      opnameDate,
      warehouseId: warehouse.id,
      warehouseCode: warehouse.code,
      warehouseName: warehouse.name,
      auditorName: data.auditorName || this.state.currentUserName,
      witnessName: data.witnessName || 'Kepala Gudang',
      items: opnameItems,
      totalItemsCounted: opnameItems.length,
      totalItemsWithVariance,
      totalVarianceCost,
      status: 'POSTED',
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    this.state.stockOpnames.unshift(opnameRecord);
    this.logAudit(
      'POST',
      'STOCK_OPNAME',
      opnameRecord.id,
      opnameRecord.opnameNumber,
      `Posting Berita Acara Stock Opname ${opnameNumber} (${warehouse.name}): ${totalItemsWithVariance} item selisih, net varian Rp ${totalVarianceCost.toLocaleString()}`,
    );

    this.saveState();
    return opnameRecord;
  }

  // --- CIGARETTE PRODUCTION TRANSACTIONS (TSG BASED) ---
  /**
   * Work Order GILING:
   * Input: TSG (Kg) + Papir (Lembar)
   * Output: Batangan Rokok (Batang) ke WH-WIP
   * Reject: Reclaim TSG (Kg) ke WH-WASTE
   */
  public createWorkOrderGiling(
    plannedBatang: number,
    tsgItemCode: string = 'RM-TSG-01',
  ): WorkOrder {
    const nextSeq = this.state.workOrders.filter((w) => w.processStage === 'GILING').length + 1;
    const woNumber = `WO-2026-GL${String(nextSeq).padStart(3, '0')}`;

    const tsgItem = this.state.items.find((it) => it.itemCode === tsgItemCode);
    const tsgCost = tsgItem ? tsgItem.averageCost : 95000;

    // 1 batang = 1 gram (0.001 Kg) TSG
    const tsgRequiredKg = plannedBatang * 0.001;
    const papirRequired = Math.round(plannedBatang * 1.005); // 0.5% scrap

    const materialCost = tsgRequiredKg * tsgCost + papirRequired * 20;

    const wo: WorkOrder = {
      id: `wo-${Date.now()}`,
      woNumber,
      processStage: 'GILING',
      productId: 'item-btg-kng',
      productCode: 'WIP-BTG-KNG',
      productName: 'Batangan Rokok SGW Kuning',
      bomId: 'bom-giling-kng',
      plannedQty: plannedBatang,
      actualOutputQty: 0,
      rejectQty: 0,
      scrapQty: 0,
      reclaimQty: 0,
      uom: 'Batang',
      startDate: new Date().toISOString().split('T')[0],
      status: 'IN_PROGRESS',
      allocatedLaborCost: 0,
      allocatedMaterialCost: materialCost,
      unitHpp: 0,
      createdAt: new Date().toISOString(),
    };

    this.state.workOrders.unshift(wo);
    this.logAudit('CREATE', 'WORK_ORDER', wo.id, wo.woNumber, `WO Giling dibuat rencana ${plannedBatang.toLocaleString()} Batang`);
    this.saveState();
    return wo;
  }

  public completeWorkOrderGiling(
    woId: string,
    actualGoodBatang: number,
    rejectBatang: number,
  ): WorkOrder {
    const wo = this.state.workOrders.find((w) => w.id === woId);
    if (!wo) throw new Error('Work order tidak ditemukan');

    wo.actualOutputQty = actualGoodBatang;
    wo.rejectQty = rejectBatang;
    wo.status = 'COMPLETED';
    wo.endDate = new Date().toISOString().split('T')[0];

    // Reclaim calculation: 1 batang reject = ~0.9 gram TSG reclaimed to WH-WASTE
    const reclaimTsgKg = Number(((rejectBatang * 0.0009)).toFixed(2));
    wo.reclaimQty = reclaimTsgKg;

    // Labor calculation: Rp 26.000 (giling) + Rp 8.000 (gunting) per 1.000 batang = Rp 34 per batang
    const laborCost = Math.round(actualGoodBatang * 0.034 * 1000);
    wo.allocatedLaborCost = laborCost;

    // Material consumption
    const tsgUsedKg = (actualGoodBatang + rejectBatang) * 0.001;
    const papirUsed = Math.round((actualGoodBatang + rejectBatang) * 1.005);
    const materialCost = tsgUsedKg * 95000 + papirUsed * 20;
    wo.allocatedMaterialCost = materialCost;

    const totalCost = materialCost + laborCost;
    wo.unitHpp = Number((totalCost / (actualGoodBatang || 1)).toFixed(2));

    // Deduct TSG and Papir from WH-MATERIAL
    const tsgInv = this.state.stockInventory.find(
      (si) => si.itemCode === 'RM-TSG-01' && si.warehouseCode === 'WH-MATERIAL',
    );
    if (tsgInv) {
      tsgInv.qty = Math.max(0, tsgInv.qty - tsgUsedKg);
      tsgInv.totalValuation = tsgInv.qty * tsgInv.averageCost;
    }

    // Add Batangan to WH-WIP
    const btgInv = this.state.stockInventory.find(
      (si) => si.itemCode === 'WIP-BTG-KNG' && si.warehouseCode === 'WH-WIP',
    );
    if (btgInv) {
      btgInv.qty += actualGoodBatang;
      btgInv.totalValuation = btgInv.qty * btgInv.averageCost;
    }

    // Add Reclaim TSG to WH-WASTE
    if (reclaimTsgKg > 0) {
      const wasteInv = this.state.stockInventory.find(
        (si) => si.warehouseCode === 'WH-WASTE' && si.itemCode === 'RM-TSG-01',
      );
      if (wasteInv) {
        wasteInv.qty += reclaimTsgKg;
        wasteInv.totalValuation = wasteInv.qty * wasteInv.averageCost;
      }
      this.state.wasteRecords.unshift({
        id: `wst-${Date.now()}`,
        date: wo.endDate,
        woId: wo.id,
        woNumber: wo.woNumber,
        itemId: 'item-tsg-01',
        itemCode: 'RM-TSG-01',
        itemName: 'Tembakau Reclaim Kupas (TSG)',
        category: 'RECLAIM',
        quantity: reclaimTsgKg,
        uom: 'Kg',
        sourceWarehouse: 'WH-WIP',
        destinationWarehouse: 'WH-WASTE',
        isReclaimed: true,
        notes: `Reclaim dari ${rejectBatang} batang reject WO ${wo.woNumber}`,
      });
    }

    // Record movements
    this.state.stockMovements.unshift({
      id: `sm-${Date.now()}-1`,
      date: wo.endDate,
      movementType: 'PROD_GILING_ISSUE',
      referenceNumber: wo.woNumber,
      itemId: 'item-tsg-01',
      itemCode: 'RM-TSG-01',
      itemName: 'Tembakau Siap Giling (TSG) Grade A SKT',
      warehouseId: 'wh-1',
      warehouseCode: 'WH-MATERIAL',
      qtyIn: 0,
      qtyOut: tsgUsedKg,
      balanceQty: tsgInv ? tsgInv.qty : 0,
      unitCost: 95000,
      totalCost: tsgUsedKg * 95000,
      notes: `Pemakaian TSG WO Giling ${wo.woNumber}`,
      createdAt: new Date().toISOString(),
    });

    this.state.stockMovements.unshift({
      id: `sm-${Date.now()}-2`,
      date: wo.endDate,
      movementType: 'PROD_GILING_RECEIPT',
      referenceNumber: wo.woNumber,
      itemId: 'item-btg-kng',
      itemCode: 'WIP-BTG-KNG',
      itemName: 'Batangan Rokok SGW Kuning',
      warehouseId: 'wh-2',
      warehouseCode: 'WH-WIP',
      qtyIn: actualGoodBatang,
      qtyOut: 0,
      balanceQty: btgInv ? btgInv.qty : actualGoodBatang,
      unitCost: 125,
      totalCost: actualGoodBatang * 125,
      notes: `Hasil Giling Lolos Meja Meja Mandor ${wo.woNumber}`,
      createdAt: new Date().toISOString(),
    });

    // Jurnal Otomatis Giling
    const nextJv = this.state.journalEntries.length + 1;
    const jv = JournalEngine.createProductionGilingJournal(
      wo,
      materialCost,
      laborCost,
      `JV-2026-${String(nextJv).padStart(6, '0')}`,
    );
    this.state.journalEntries.unshift(jv);

    this.logAudit('POST', 'WORK_ORDER', wo.id, wo.woNumber, `Selesai WO Giling: ${actualGoodBatang.toLocaleString()} Batang`);
    this.saveState();
    return wo;
  }

  /**
   * Work Order PACKING:
   * Input: Batangan Rokok (WIP) + Bungkus/Slop + Pita Cukai
   * Output: Finished Goods (Bungkus) ke WH-FG
   */
  public completeWorkOrderPacking(
    productId: string,
    packsProduced: number,
    pitaCukaiReceiptId: string,
  ): WorkOrder {
    const fgItem = this.state.items.find((it) => it.id === productId);
    if (!fgItem) throw new Error('Produk FG tidak ditemukan');

    const nextSeq = this.state.workOrders.filter((w) => w.processStage === 'PACKING').length + 1;
    const woNumber = `WO-2026-PK${String(nextSeq).padStart(3, '0')}`;
    const date = new Date().toISOString().split('T')[0];

    const pcr = this.state.pitaCukaiReceipts.find((p) => p.id === pitaCukaiReceiptId);
    if (!pcr) throw new Error('Pita cukai tidak ditemukan');
    if (pcr.piecesAvailable < packsProduced) {
      throw new Error(`Saldo pita cukai tidak cukup! Tersedia: ${pcr.piecesAvailable}, Dibutuhkan: ${packsProduced}`);
    }

    const sticksPerPack = fgItem.itemCode.includes('16') ? 16 : 12;
    const totalSticksConsumed = packsProduced * sticksPerPack;
    const batanganCost = totalSticksConsumed * 125;
    const packagingCost = packsProduced * (fgItem.itemCode.includes('16') ? 700 : 600);
    const laborCost = Math.round((packsProduced / 10) * 1800); // Rp 1.800 per slop

    const totalFgCost = batanganCost + packagingCost + laborCost;
    const unitHpp = Math.round(totalFgCost / packsProduced);

    const wo: WorkOrder = {
      id: `wo-${Date.now()}`,
      woNumber,
      processStage: 'PACKING',
      productId: fgItem.id,
      productCode: fgItem.itemCode,
      productName: fgItem.itemName,
      bomId: 'bom-packing-kng12',
      plannedQty: packsProduced,
      actualOutputQty: packsProduced,
      rejectQty: 0,
      scrapQty: 0,
      reclaimQty: 0,
      uom: 'Bungkus',
      startDate: date,
      endDate: date,
      status: 'COMPLETED',
      allocatedLaborCost: laborCost,
      allocatedMaterialCost: batanganCost + packagingCost,
      unitHpp,
      createdAt: new Date().toISOString(),
    };

    // Deduct Pita Cukai
    pcr.piecesUsed += packsProduced;
    pcr.piecesAvailable -= packsProduced;

    // Record Pita Cukai Usage
    this.state.pitaCukaiUsages.unshift({
      id: `pcu-${Date.now()}`,
      woPackingId: wo.id,
      woNumber: wo.woNumber,
      date,
      brand: fgItem.brand || fgItem.itemName,
      finishedGoodsId: fgItem.id,
      finishedGoodsName: fgItem.itemName,
      receiptId: pcr.id,
      packsProduced,
      piecesUsed: packsProduced,
      piecesDamaged: 0,
    });

    // Deduct batangan from WH-WIP
    const btgInv = this.state.stockInventory.find((si) => si.itemCode === 'WIP-BTG-KNG');
    if (btgInv) {
      btgInv.qty = Math.max(0, btgInv.qty - totalSticksConsumed);
      btgInv.totalValuation = btgInv.qty * btgInv.averageCost;
    }

    // Add Finished Goods to WH-FG
    const fgInv = this.state.stockInventory.find((si) => si.itemId === fgItem.id && si.warehouseCode === 'WH-FG');
    if (fgInv) {
      const oldQty = fgInv.qty;
      const oldVal = fgInv.totalValuation;
      const newQty = oldQty + packsProduced;
      fgInv.qty = newQty;
      fgInv.averageCost = Math.round((oldVal + totalFgCost) / newQty);
      fgInv.totalValuation = newQty * fgInv.averageCost;
    }

    // Record Stock Movements
    this.state.stockMovements.unshift({
      id: `sm-${Date.now()}-fg`,
      date,
      movementType: 'PROD_PACKING_RECEIPT',
      referenceNumber: wo.woNumber,
      itemId: fgItem.id,
      itemCode: fgItem.itemCode,
      itemName: fgItem.itemName,
      warehouseId: 'wh-3',
      warehouseCode: 'WH-FG',
      qtyIn: packsProduced,
      qtyOut: 0,
      balanceQty: fgInv ? fgInv.qty : packsProduced,
      unitCost: unitHpp,
      totalCost: totalFgCost,
      notes: `Hasil Packing Siap Jual Dilekati Cukai ${pcr.docNumber}`,
      createdAt: new Date().toISOString(),
    });

    // Jurnal Otomatis Packing
    const nextJv = this.state.journalEntries.length + 1;
    const jv = JournalEngine.createProductionPackingJournal(
      wo,
      batanganCost,
      packagingCost,
      laborCost,
      `JV-2026-${String(nextJv).padStart(6, '0')}`,
    );
    this.state.journalEntries.unshift(jv);

    this.state.workOrders.unshift(wo);
    this.logAudit('POST', 'WORK_ORDER', wo.id, wo.woNumber, `Selesai Packing & Pelekatan Pita Cukai: ${packsProduced.toLocaleString()} Bungkus`);
    this.saveState();
    return wo;
  }

  // --- SALES & DISTRIBUTION TRANSACTIONS ---
  public createSalesInvoice(
    customerId: string,
    paymentType: 'CASH' | 'CREDIT',
    items: { itemId: string; qty: number; unitPrice: number }[],
    notes?: string,
  ): SalesInvoice {
    const customer = this.state.customers.find((c) => c.id === customerId);
    if (!customer) throw new Error('Pelanggan tidak ditemukan');

    const nextSeq = this.state.salesInvoices.length + 1;
    const invoiceNumber = `INV-2026-${String(nextSeq).padStart(6, '0')}`;
    const invoiceDate = new Date().toISOString().split('T')[0];

    const d = new Date();
    d.setDate(d.getDate() + (paymentType === 'CASH' ? 0 : customer.paymentTermDays || 14));
    const dueDate = d.toISOString().split('T')[0];

    let dpp = 0;
    const invoiceItems = items.map((it) => {
      const item = this.state.items.find((i) => i.id === it.itemId);
      if (!item) throw new Error(`Item ${it.itemId} tidak ditemukan`);

      // Check stock in WH-FG
      const stock = this.state.stockInventory.find((s) => s.itemId === it.itemId && s.warehouseCode === 'WH-FG');
      if (!stock || stock.qty < it.qty) {
        throw new Error(`Stok produk jadi ${item.itemName} di WH-FG tidak cukup! Tersedia: ${stock ? stock.qty : 0}`);
      }

      const subtotal = it.qty * it.unitPrice;
      const cogsUnit = stock.averageCost || item.averageCost;
      const totalCogs = it.qty * cogsUnit;
      dpp += subtotal;

      // Deduct stock from WH-FG
      stock.qty -= it.qty;
      stock.totalValuation = stock.qty * stock.averageCost;

      // Record Stock Movement
      this.state.stockMovements.unshift({
        id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        date: invoiceDate,
        movementType: 'SALES_ISSUE',
        referenceNumber: invoiceNumber,
        itemId: item.id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        warehouseId: 'wh-3',
        warehouseCode: 'WH-FG',
        qtyIn: 0,
        qtyOut: it.qty,
        balanceQty: stock.qty,
        unitCost: cogsUnit,
        totalCost: totalCogs,
        notes: `Pengiriman Penjualan ke ${customer.name}`,
        createdAt: new Date().toISOString(),
      });

      return {
        id: `sii-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        itemId: item.id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        qty: it.qty,
        uom: item.stockUom,
        unitPrice: it.unitPrice,
        cogsUnit,
        totalCogs,
        subtotal,
      };
    });

    const ppnRate = this.state.companySettings.ppnRate || 11;
    const ppn = Math.round((dpp * ppnRate) / 100);
    const totalAmount = dpp + ppn;

    const invoice: SalesInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerNpwp: customer.npwp,
      invoiceDate,
      dueDate,
      paymentType,
      items: invoiceItems,
      dpp,
      ppn,
      totalAmount,
      paidAmount: paymentType === 'CASH' ? totalAmount : 0,
      paymentStatus: paymentType === 'CASH' ? 'PAID' : 'UNPAID',
      status: 'POSTED',
      fakturPajakNumber: `010.000-26.${Math.floor(10000000 + Math.random() * 90000000)}`,
      deliveryOrderNo: `DO-2026-${String(nextSeq).padStart(6, '0')}`,
      notes,
      createdAt: new Date().toISOString(),
    };

    // Jurnal Otomatis Penjualan & COGS
    const nextJv = this.state.journalEntries.length + 1;
    const jv = JournalEngine.createSalesInvoiceJournal(
      invoice,
      `JV-2026-${String(nextJv).padStart(6, '0')}`,
    );
    this.state.journalEntries.unshift(jv);

    // Pajak Keluaran (PPN Keluaran)
    this.state.taxTransactions.unshift({
      id: `tt-${Date.now()}`,
      date: invoice.invoiceDate,
      taxType: 'PPN_KELUARAN',
      sourceModule: 'SALES',
      referenceNumber: invoice.invoiceNumber,
      entityName: invoice.customerName,
      entityNpwp: invoice.customerNpwp || '-',
      dpp: invoice.dpp,
      taxRate: ppnRate,
      taxAmount: invoice.ppn,
      fakturPajakNumber: invoice.fakturPajakNumber,
      taxPeriodMonth: new Date().getMonth() + 1,
      taxPeriodYear: new Date().getFullYear(),
      status: 'UNREPORTED',
    });

    this.state.salesInvoices.unshift(invoice);
    this.logAudit('POST', 'SALES_INVOICE', invoice.id, invoice.invoiceNumber, `Faktur Penjualan Rp ${totalAmount.toLocaleString()} ke ${customer.name}`);
    this.saveState();
    return invoice;
  }

  public postCustomerPayment(
    invoiceId: string,
    amount: number,
    bankCode: string,
    referenceNo: string,
  ): CustomerPayment {
    const inv = this.state.salesInvoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error('Faktur penjualan tidak ditemukan');

    const nextSeq = this.state.customerPayments.length + 1;
    const paymentNumber = `CR-2026-${String(nextSeq).padStart(6, '0')}`;
    const date = new Date().toISOString().split('T')[0];

    const coaBank = this.state.chartOfAccounts.find((c) => c.code === bankCode);
    const bankName = coaBank ? coaBank.name : 'Kas / Bank';

    const payment: CustomerPayment = {
      id: `cp-${Date.now()}`,
      paymentNumber,
      salesInvoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      paymentDate: date,
      bankAccountId: `coa-${bankCode}`,
      bankAccountName: bankName,
      amountPaid: amount,
      referenceNo,
      createdAt: new Date().toISOString(),
    };

    inv.paidAmount += amount;
    if (inv.paidAmount >= inv.totalAmount - 1) {
      inv.paymentStatus = 'PAID';
    } else {
      inv.paymentStatus = 'PARTIAL';
    }

    // Jurnal Otomatis Pelunasan Piutang
    const jv = JournalEngine.createCustomerPaymentJournal(
      payment.paymentNumber,
      inv.invoiceNumber,
      inv.customerName,
      amount,
      bankCode,
      bankName,
      date,
    );
    this.state.journalEntries.unshift(jv);

    this.state.customerPayments.unshift(payment);
    this.logAudit('PAYMENT', 'CUSTOMER_PAYMENT', payment.id, payment.paymentNumber, `Penerimaan Pelunasan Rp ${amount.toLocaleString()} dari ${inv.customerName}`);
    this.saveState();
    return payment;
  }

  // --- PITA CUKAI TRANSACTIONS (BEA CUKAI) ---
  public receivePitaCukai(
    docNumber: string,
    brand: string,
    packSize: number,
    tariffPerPack: number,
    sheetsReceived: number,
    piecesPerSheet: number = 120,
  ): PitaCukaiReceipt {
    const totalPieces = sheetsReceived * piecesPerSheet;
    const totalValue = totalPieces * tariffPerPack;

    const receipt: PitaCukaiReceipt = {
      id: `pcr-${Date.now()}`,
      docNumber,
      receiptDate: new Date().toISOString().split('T')[0],
      brand,
      exciseType: 'SKT',
      year: 2026,
      packSize,
      tariffPerPack,
      sheetsReceived,
      piecesPerSheet,
      totalPieces,
      totalValue,
      supplierVendor: this.state.companySettings.customsOffice || 'KPPBC TMP C KUDUS',
      piecesAvailable: totalPieces,
      piecesUsed: 0,
      piecesDamaged: 0,
      status: 'AVAILABLE',
      notes: `Penerimaan Dokumen Cukai CK-1 Resmi KPPBC (${sheetsReceived} Lembar x ${piecesPerSheet} = ${totalPieces.toLocaleString()} Keping)`,
    };

    this.state.pitaCukaiReceipts.unshift(receipt);

    // Auto Journal: Pengakuan Nilai Tebus Pita Cukai (Kas Keluar / Hutang Cukai -> Persediaan Pita Cukai)
    const nextJv = this.state.journalEntries.length + 1;
    this.state.journalEntries.unshift({
      id: `jv-pcr-${Date.now()}`,
      journalNumber: `JV-CK1-2026-${String(nextJv).padStart(5, '0')}`,
      entryDate: receipt.receiptDate,
      referenceModule: 'EXCISE_RECEIPT',
      referenceId: receipt.id,
      referenceNumber: receipt.docNumber,
      description: `Penerimaan Pita Cukai CK-1 ${receipt.brand} (${receipt.totalPieces.toLocaleString()} Keping @ Rp ${tariffPerPack.toLocaleString()})`,
      costCenter: 'LOGISTIK',
      lines: [
        {
          accountId: 'coa-1161',
          accountCode: '1161',
          accountName: 'Persediaan Pita Cukai',
          debit: totalValue,
          credit: 0,
          memo: `Pita Cukai CK-1 ${brand}`,
        },
        {
          accountId: 'coa-1002',
          accountCode: '1002',
          accountName: 'Bank BCA Operasional (A/C 143-888-999)',
          debit: 0,
          credit: totalValue,
          memo: `Penebusan CK-1 ke Bank Persepsi / Kas Negara`,
        },
      ],
      totalDebit: totalValue,
      totalCredit: totalValue,
      isBalanced: true,
      status: 'POSTED',
      createdAt: new Date().toISOString(),
    });

    this.logAudit('POST', 'PITA_CUKAI_RECEIPT', receipt.id, receipt.docNumber, `Penerimaan ${totalPieces.toLocaleString()} Keping Pita Cukai ${brand} (Nilai Tebus: Rp ${totalValue.toLocaleString()})`);
    this.saveState();
    return receipt;
  }

  // --- MASTER DATA MANAGEMENT METHODS ---
  public addItem(itemData: Omit<Item, 'id'>): Item {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      ...itemData,
    };
    this.state.items.push(newItem);
    this.logAudit('CREATE', 'ITEM', newItem.id, newItem.itemCode, `Tambah item master baru ${newItem.itemName} (${newItem.itemCode})`);
    this.saveState();
    return newItem;
  }

  public updateItem(itemId: string, updates: Partial<Item>): void {
    const item = this.state.items.find((i) => i.id === itemId);
    if (item) {
      Object.assign(item, updates);
      this.logAudit('UPDATE', 'ITEM', item.id, item.itemCode, `Update data master item ${item.itemName}`);
      this.saveState();
    }
  }

  public deleteItem(itemId: string): { success: boolean; message: string } {
    const idx = this.state.items.findIndex((i) => i.id === itemId);
    if (idx === -1) {
      return { success: false, message: 'Item tidak ditemukan' };
    }
    const item = this.state.items[idx];
    // Check if used in inventory with positive stock
    const inv = this.state.stockInventory.find((inv) => inv.itemId === itemId && inv.qty > 0);
    if (inv) {
      return { success: false, message: `Tidak dapat menghapus item ${item.itemName} karena masih memiliki stok aktif (${inv.qty} ${item.stockUom}) di ${inv.warehouseCode}` };
    }
    this.state.items.splice(idx, 1);
    this.logAudit('DELETE', 'ITEM', item.id, item.itemCode, `Hapus item master ${item.itemName}`);
    this.saveState();
    return { success: true, message: `Item ${item.itemName} berhasil dihapus` };
  }

  public addBOM(bomData: Omit<BOM, 'id'>): BOM {
    const newBom: BOM = {
      id: `bom-${Date.now()}`,
      ...bomData,
    };
    this.state.boms.push(newBom);
    this.logAudit('CREATE', 'BOM', newBom.id, newBom.bomNumber, `Tambah formula BOM baru ${newBom.productName} (${newBom.bomNumber})`);
    this.saveState();
    return newBom;
  }

  public deleteBOM(bomId: string): { success: boolean; message: string } {
    const idx = this.state.boms.findIndex((b) => b.id === bomId);
    if (idx === -1) {
      return { success: false, message: 'BOM tidak ditemukan' };
    }
    const bom = this.state.boms[idx];
    this.state.boms.splice(idx, 1);
    this.logAudit('DELETE', 'BOM', bom.id, bom.bomNumber, `Hapus formula BOM ${bom.productName}`);
    this.saveState();
    return { success: true, message: `Formula BOM ${bom.productName} berhasil dihapus` };
  }

  public addExciseTariff(tariffData: Omit<ExciseTariff, 'id'>): ExciseTariff {
    const newTariff: ExciseTariff = {
      id: `exc-${Date.now()}`,
      ...tariffData,
    };
    this.state.exciseTariffs.push(newTariff);
    this.logAudit('CREATE', 'EXCISE_TARIFF', newTariff.id, newTariff.tariffCode, `Tambah konfigurasi tarif cukai ${newTariff.brand}`);
    this.saveState();
    return newTariff;
  }

  public deleteExciseTariff(tariffId: string): { success: boolean; message: string } {
    const idx = this.state.exciseTariffs.findIndex((t) => t.id === tariffId);
    if (idx === -1) {
      return { success: false, message: 'Tarif cukai tidak ditemukan' };
    }
    const t = this.state.exciseTariffs[idx];
    this.state.exciseTariffs.splice(idx, 1);
    this.logAudit('DELETE', 'EXCISE_TARIFF', t.id, t.tariffCode, `Hapus konfigurasi tarif cukai ${t.brand}`);
    this.saveState();
    return { success: true, message: `Tarif cukai ${t.brand} berhasil dihapus` };
  }

  public addLaborTariff(tariffData: Omit<ProductionLaborTariff, 'id'>): ProductionLaborTariff {
    const newTariff: ProductionLaborTariff = {
      id: `lt-${Date.now()}`,
      ...tariffData,
    };
    this.state.laborTariffs.push(newTariff);
    this.logAudit('CREATE', 'LABOR_TARIFF', newTariff.id, newTariff.code, `Tambah master tarif upah ${newTariff.name}`);
    this.saveState();
    return newTariff;
  }

  public deleteLaborTariff(tariffId: string): { success: boolean; message: string } {
    const idx = this.state.laborTariffs.findIndex((t) => t.id === tariffId);
    if (idx === -1) {
      return { success: false, message: 'Tarif upah tidak ditemukan' };
    }
    const t = this.state.laborTariffs[idx];
    this.state.laborTariffs.splice(idx, 1);
    this.logAudit('DELETE', 'LABOR_TARIFF', t.id, t.code, `Hapus tarif upah ${t.name}`);
    this.saveState();
    return { success: true, message: `Tarif upah ${t.name} berhasil dihapus` };
  }

  public addCustomer(custData: Omit<Customer, 'id'>): Customer {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      ...custData,
    };
    this.state.customers.push(newCust);
    this.logAudit('CREATE', 'CUSTOMER', newCust.id, newCust.code, `Tambah pelanggan ${newCust.name}`);
    this.saveState();
    return newCust;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): void {
    const cust = this.state.customers.find((c) => c.id === id);
    if (cust) {
      Object.assign(cust, updates);
      this.logAudit('UPDATE', 'CUSTOMER', cust.id, cust.code, `Update data pelanggan ${cust.name}`);
      this.saveState();
    }
  }

  public deleteCustomer(id: string): { success: boolean; message: string } {
    const idx = this.state.customers.findIndex((c) => c.id === id);
    if (idx === -1) return { success: false, message: 'Pelanggan tidak ditemukan' };
    const c = this.state.customers[idx];
    this.state.customers.splice(idx, 1);
    this.logAudit('DELETE', 'CUSTOMER', c.id, c.code, `Hapus data pelanggan ${c.name}`);
    this.saveState();
    return { success: true, message: `Pelanggan ${c.name} berhasil dihapus` };
  }

  public addSupplier(suppData: Omit<Supplier, 'id'>): Supplier {
    const newSupp: Supplier = {
      id: `supp-${Date.now()}`,
      ...suppData,
    };
    this.state.suppliers.push(newSupp);
    this.logAudit('CREATE', 'SUPPLIER', newSupp.id, newSupp.code, `Tambah supplier ${newSupp.name}`);
    this.saveState();
    return newSupp;
  }

  public updateSupplier(id: string, updates: Partial<Supplier>): void {
    const supp = this.state.suppliers.find((s) => s.id === id);
    if (supp) {
      Object.assign(supp, updates);
      this.logAudit('UPDATE', 'SUPPLIER', supp.id, supp.code, `Update supplier ${supp.name}`);
      this.saveState();
    }
  }

  public deleteSupplier(id: string): { success: boolean; message: string } {
    const idx = this.state.suppliers.findIndex((s) => s.id === id);
    if (idx === -1) return { success: false, message: 'Supplier tidak ditemukan' };
    const s = this.state.suppliers[idx];
    this.state.suppliers.splice(idx, 1);
    this.logAudit('DELETE', 'SUPPLIER', s.id, s.code, `Hapus supplier ${s.name}`);
    this.saveState();
    return { success: true, message: `Supplier ${s.name} berhasil dihapus` };
  }

  public updateItemStandardCost(itemId: string, newCost: number): void {
    const item = this.state.items.find((i) => i.id === itemId);
    if (item) {
      const oldCost = item.standardCost;
      item.standardCost = newCost;
      item.averageCost = newCost;
      this.logAudit('UPDATE', 'ITEM', item.id, item.itemCode, `Update standard cost ${item.itemName} dari Rp ${oldCost.toLocaleString()} ke Rp ${newCost.toLocaleString()}`);
      this.saveState();
    }
  }

  public updateLaborTariff(tariffId: string, newRate: number): void {
    const tariff = this.state.laborTariffs.find((t) => t.id === tariffId);
    if (tariff) {
      const oldRate = tariff.rate;
      tariff.rate = newRate;
      this.logAudit('UPDATE', 'LABOR_TARIFF', tariff.id, tariff.code, `Update tarif ${tariff.name || tariff.code} dari Rp ${oldRate} ke Rp ${newRate} / ${tariff.uom}`);
      this.saveState();
    }
  }

  public updateExciseTariff(tariffId: string, updates: Partial<ExciseTariff>): void {
    const tariff = this.state.exciseTariffs.find((t) => t.id === tariffId);
    if (tariff) {
      Object.assign(tariff, updates);
      this.logAudit('UPDATE', 'EXCISE_TARIFF', tariff.id, tariff.tariffCode, `Update konfigurasi tarif cukai ${tariff.brand}`);
      this.saveState();
    }
  }

  public updateBOM(bomId: string, updates: Partial<BOM>): void {
    const bom = this.state.boms.find((b) => b.id === bomId);
    if (bom) {
      Object.assign(bom, updates);
      this.logAudit('UPDATE', 'BOM', bom.id, bom.bomNumber, `Update formula BOM ${bom.productName}`);
      this.saveState();
    }
  }

  // --- FISCAL CLOSING ENGINE (SOFT CLOSING) ---
  public softClosePeriod(year: number, month: number): void {
    const period = this.state.fiscalPeriods.find((p) => p.year === year && p.month === month);
    if (period) {
      period.isClosed = true;
      period.closedAt = new Date().toISOString();
      period.closedBy = this.state.currentUserName;
    } else {
      this.state.fiscalPeriods.push({
        year,
        month,
        isClosed: true,
        closedAt: new Date().toISOString(),
        closedBy: this.state.currentUserName,
      });
    }
    this.logAudit('SOFT_CLOSE', 'FISCAL_PERIOD', `${year}-${month}`, `${year}-${month}`, `Soft Closing Periode ${month}/${year}`);
    this.saveState();
  }

  public reopenPeriod(year: number, month: number, reason: string): void {
    const period = this.state.fiscalPeriods.find((p) => p.year === year && p.month === month);
    if (period) {
      period.isClosed = false;
      period.reopenedAt = new Date().toISOString();
      period.reopenedBy = this.state.currentUserName;
      period.reopenReason = reason;
    }
    this.logAudit('REOPEN_PERIOD', 'FISCAL_PERIOD', `${year}-${month}`, `${year}-${month}`, `Reopen Periode ${month}/${year}: ${reason}`);
    this.saveState();
  }

  public processPayroll(data: {
    employeeId: string;
    employeeName: string;
    department: string;
    period: string;
    baseSalaryOrWage: number;
    outputPieces?: number;
    pieceRate?: number;
    allowances: number;
    overtime: number;
    pph21Deduction: number;
    bpjsDeduction: number;
    grossTotal: number;
    netPayable: number;
    status: 'DRAFT' | 'APPROVED' | 'PAID';
  }): PayrollRecord {
    const nextSeq = this.state.payrollRecords.length + 1;
    const payrollNumber = `PAY-2026-${String(nextSeq).padStart(5, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const record: PayrollRecord = {
      id: `pr-${Date.now()}`,
      payrollNumber,
      ...data,
      paymentDate: today,
      createdAt: new Date().toISOString(),
    };

    this.state.payrollRecords.unshift(record);

    // Auto Journal for Labor Cost & Payroll
    const nextJv = this.state.journalEntries.length + 1;
    const jvNumber = `JV-2026-${String(nextJv).padStart(6, '0')}`;
    this.state.journalEntries.unshift({
      id: `jv-${Date.now()}`,
      journalNumber: jvNumber,
      entryDate: today,
      referenceModule: 'PAYROLL',
      referenceId: record.id,
      referenceNumber: record.payrollNumber,
      description: `Beban Gaji & Upah Tenaga Kerja ${record.employeeName} (${record.department})`,
      costCenter: record.department.includes('GILING') || record.department.includes('PACKING') ? 'PRODUKSI' : 'HRGA',
      lines: [
        {
          accountId: 'coa-5001',
          accountCode: '5001',
          accountName: 'Beban Tenaga Kerja Langsung Pabrik',
          debit: record.grossTotal,
          credit: 0,
          memo: `Gaji Bruto ${record.employeeName}`,
        },
        {
          accountId: 'coa-2152',
          accountCode: '2152',
          accountName: 'Hutang PPh Pasal 21',
          debit: 0,
          credit: record.pph21Deduction,
          memo: `Potongan PPh 21 ${record.employeeName}`,
        },
        {
          accountId: 'coa-1002',
          accountCode: '1002',
          accountName: 'Bank Mandiri Operasional',
          debit: 0,
          credit: record.netPayable + record.bpjsDeduction,
          memo: `Pembayaran Netto ${record.employeeName}`,
        },
      ],
      totalDebit: record.grossTotal,
      totalCredit: record.grossTotal,
      isBalanced: true,
      status: 'POSTED',
      createdAt: new Date().toISOString(),
    });

    // PPh 21 Tax Ledger Entry
    if (record.pph21Deduction > 0) {
      this.state.taxTransactions.unshift({
        id: `tt-${Date.now()}`,
        date: today,
        taxType: 'PPH21',
        sourceModule: 'PAYROLL',
        referenceNumber: record.payrollNumber,
        entityName: record.employeeName,
        entityNpwp: '78.112.334.5-506.000',
        dpp: record.grossTotal,
        taxRate: Math.round((record.pph21Deduction / (record.grossTotal || 1)) * 100),
        taxAmount: record.pph21Deduction,
        taxPeriodMonth: new Date().getMonth() + 1,
        taxPeriodYear: new Date().getFullYear(),
        status: 'UNREPORTED',
      });
    }

    this.logAudit('POST', 'PAYROLL', record.id, record.payrollNumber, `Pembayaran Upah/Gaji Rp ${record.grossTotal.toLocaleString()} untuk ${record.employeeName}`);
    this.saveState();
    return record;
  }

  public updateCompanySettings(settings: Partial<CompanySettings>): void {
    this.state.companySettings = { ...this.state.companySettings, ...settings };
    this.logAudit('UPDATE', 'COMPANY_SETTINGS', 'comp-1', 'SGW-CFG-01', 'Memperbarui Konfigurasi Perusahaan');
    this.saveState();
  }
}

export const dbService = new ERPDatabaseService();
