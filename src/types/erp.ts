// SGW ONE NUSANTARA - Complete ERP Types & Data Models

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMINISTRATOR'
  | 'MANAGEMENT'
  | 'PURCHASING'
  | 'WAREHOUSE'
  | 'PRODUCTION'
  | 'SALES'
  | 'FINANCE'
  | 'ACCOUNTING'
  | 'TAX'
  | 'HRGA'
  | 'BEA_CUKAI'
  | 'AUDITOR';

export interface CompanySettings {
  id: string;
  companyName: string;
  subTitle: string;
  companySubtitle?: string;
  address: string;
  factoryAddress?: string;
  city?: string;
  postalCode?: string;
  npwp: string;
  nib: string;
  nppbkc: string; // Nomor Pokok Pengusaha Barang Kena Cukai (Bea Cukai)
  customsOffice: string; // e.g., KPPBC TMP C KUDUS / MALANG / KEDIRI
  phone: string;
  email: string;
  directorName: string;
  headerText: string;
  footerText: string;
  ppnRate: number; // default 11 or 12 (%)
  bankName?: string;
  bankAccountNo?: string;
  bankAccountHolder?: string;
  logoUrl?: string;
}

// Master Data: Items
export type ItemType =
  | 'RAW_MATERIAL' // e.g. TSG (Tembakau Siap Giling)
  | 'PACKAGING' // e.g. Papir, Bungkus/Etiket, Slop, Bal, OPP
  | 'SEMI_FINISHED' // e.g. Batangan Rokok
  | 'FINISHED_GOODS' // e.g. SGW Kuning SKT12
  | 'SUPPORTING' // Lem, Lakban, dll.
  | 'EXCISE_STAMP' // Pita Cukai
  | 'FIXED_ASSET'
  | 'OTHER';

export type CigaretteCategory = 'SKT' | 'SKM' | 'SKPT' | 'HERBAL' | 'NON_CIGARETTE';

export interface Item {
  id: string;
  itemCode: string;
  itemName: string;
  itemType: ItemType;
  category: CigaretteCategory;
  brand?: string;
  stockUom: string; // Kg, Lembar, Batang, Bungkus, Slop, Bal, Keping
  purchaseUom: string;
  salesUom: string;
  conversionFactor: number; // e.g. 1 Slop = 10 Bungkus, 1 Bungkus = 12 Batang
  standardCost: number;
  averageCost: number;
  minStock: number;
  maxStock: number;
  taxCategoryId?: string;
  exciseTariffId?: string;
  isActive: boolean;
  notes?: string;
}

// Master Data: Warehouse
export interface Warehouse {
  id: string;
  code: 'WH-MATERIAL' | 'WH-WIP' | 'WH-FG' | 'WH-WASTE';
  name: string;
  description: string;
  isActive: boolean;
}

// Master Data: BOM (Bill of Materials)
export interface BOMComponent {
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number; // Qty per 1 unit of finished/semi-finished
  uom: string;
  scrapPercentage: number;
}

export interface BOM {
  id: string;
  bomNumber: string;
  productId: string; // Reference to Item (e.g. Batangan or FG)
  productName: string;
  processStage: 'GILING' | 'PACKING';
  version: string;
  effectiveDate: string;
  components: BOMComponent[];
  standardOutputQty: number; // e.g. 10.000 batang or 1.000 bungkus
  standardOutputUom: string;
  isActive: boolean;
}

// Master Data: Customers & Suppliers
export interface Customer {
  id: string;
  code: string;
  name: string;
  address: string;
  npwp: string;
  nik: string;
  phone: string;
  email: string;
  paymentTermDays: number;
  creditLimit: number;
  taxStatus: 'TAXABLE' | 'NON_TAXABLE';
  isActive: boolean;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  address: string;
  npwp: string;
  nik: string;
  phone: string;
  email: string;
  paymentTermDays: number;
  taxStatus: 'TAXABLE' | 'NON_TAXABLE';
  supplyCategory: 'TSG' | 'PACKAGING' | 'EXCISE' | 'GENERAL';
  isActive: boolean;
}

// Master Data: Chart of Accounts (COA)
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COGS' | 'EXPENSE';

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  normalBalance: 'DEBIT' | 'CREDIT';
  isParent: boolean;
  parentId?: string;
  balance: number;
  isActive: boolean;
}

// Master Data: Tax Master
export interface TaxMaster {
  id: string;
  taxCode: string; // PPN11, PPN12, PPH21, PPH22, PPH23
  name: string;
  rate: number; // Percentage
  effectiveDate: string;
  accountId: string; // Link to COA
  description: string;
  isActive: boolean;
}

// Master Data: Excise Tariff (Bea Cukai)
export interface ExciseTariff {
  id: string;
  tariffCode: string;
  brand: string;
  type?: 'SKT' | 'SKM' | 'SKPT';
  productType?: string;
  golongan: 'GOL_I' | 'GOL_II' | 'GOL_III' | 'III_B' | string;
  packSize: number; // 10, 12, 16
  hjePerStick?: number; // Harga Jual Eceran per Batang
  hjePerPack: number; // HJE per Bungkus (e.g. 8.750, 10.325, 13.775)
  excisePerStick?: number; // Cukai per Batang (Rp)
  excisePerPack: number; // Cukai per Bungkus (Rp)
  sheetsToPiecesConversion: number; // e.g. 120 keping / lembar
  ppnPerPack?: number; // PPN Hasil Tembakau
  year?: number;
  effectiveYear?: number;
  effectiveDate?: string;
  isActive: boolean;
}

// Master Data: Production Labor Tariff
export interface ProductionLaborTariff {
  id: string;
  code: string;
  name?: string; // e.g. 'Paket Borong Giling + Gunting SKT 12'
  position: 'GILING' | 'GUNTING' | 'GILING_GUNTING' | 'PACKING' | 'MANDOR' | 'QC' | 'HELPER' | 'BANDROL' | string;
  processType: 'GILING' | 'PACKING' | string;
  laborType: 'BORONGAN' | 'HARIAN' | 'PIECE_RATE' | 'DAILY' | 'MONTHLY';
  rate: number; // e.g. Rp 34 per batang or Rp 150 per bungkus
  uom: string; // 'Batang', 'Bungkus', '1.000 Batang', 'Slop', 'Hari'
  effectiveDate: string;
  isActive: boolean;
}

// Master Data: Employees
export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: 'PRODUCTION_GILING' | 'PRODUCTION_PACKING' | 'WAREHOUSE' | 'FINANCE' | 'ADMIN' | 'HRGA';
  employmentStatus: 'BORONGAN' | 'HARIAN' | 'TETAP' | 'KONTRAK';
  phone: string;
  npwp: string;
  nik: string;
  bankAccount: string;
  bankName: string;
  baseSalaryOrRate: number;
  isActive: boolean;
}

export interface PayrollRecord {
  id: string;
  payrollNumber: string;
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
  paymentDate?: string;
  createdAt?: string;
}

// PROCUREMENT TRANSACTIONS
export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  ppnRate: number;
  ppnAmount: number;
  totalAmount: number;
  notes?: string;
  status: 'DRAFT' | 'POSTED' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface GoodsReceiptItem {
  id: string;
  poItemId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  qtyOrdered: number;
  qtyReceived: number;
  uom: string;
  unitPrice: number;
  subtotal: number;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  receiptDate: string;
  vendorDeliveryRef: string; // Nomor Surat Jalan Supplier
  items: GoodsReceiptItem[];
  totalValue: number;
  status: 'POSTED' | 'CANCELLED';
  notes?: string;
  moisturePercent?: number; // Kadar air tembakau/cengkeh (%)
  impurityPercent?: number; // Kadar kotoran / debu (%)
  qcPassed?: boolean; // Status Lolos Uji QC Laboratorium
  qcInspectorName?: string;
  createdAt: string;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  vendorInvoiceNo: string; // No Faktur Supplier
  supplierId: string;
  supplierName: string;
  poId: string;
  poNumber: string;
  grnId: string;
  grnNumber: string;
  invoiceDate: string;
  dueDate: string;
  dpp: number; // Dasar Pengenaan Pajak
  ppn: number; // Pajak Masukan
  total: number;
  paidAmount: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  status: 'POSTED' | 'CANCELLED';
  fakturPajakNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  paymentNumber: string;
  supplierInvoiceId: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  paymentDate: string;
  bankAccountId: string;
  bankAccountName: string;
  amountPaid: number;
  referenceNo: string;
  notes?: string;
  createdAt: string;
}

// PURCHASE RETURN & DEBIT NOTE
export interface PurchaseReturnItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  qtyReturned: number;
  uom: string;
  unitPrice: number;
  subtotal: number;
  reason: string;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string; // e.g. PRT-2026-000001
  debitNoteNumber: string; // e.g. DN-2026-000001
  poId?: string;
  poNumber?: string;
  grnId?: string;
  grnNumber?: string;
  supplierInvoiceId?: string;
  supplierInvoiceNumber?: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  returnDate: string;
  items: PurchaseReturnItem[];
  subtotalDpp: number;
  ppnAmount: number;
  totalDebitNote: number;
  reason: string;
  status: 'POSTED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

// INVENTORY & STOCK
export interface StockInventory {
  itemId: string;
  itemCode: string;
  itemName: string;
  warehouseId: string;
  warehouseCode: string;
  qty: number;
  uom: string;
  averageCost: number;
  totalValuation: number;
}

export type StockMovementType =
  | 'PURCHASE_GRN'
  | 'PURCHASE_RETURN'
  | 'PROD_GILING_ISSUE'
  | 'PROD_GILING_RECEIPT'
  | 'PROD_PACKING_ISSUE'
  | 'PROD_PACKING_RECEIPT'
  | 'SALES_ISSUE'
  | 'TRANSFER'
  | 'ADJUSTMENT'
  | 'WASTE_SCRAP'
  | 'WASTE_RECLAIM'
  | 'PITA_CUKAI_RECEIPT'
  | 'PITA_CUKAI_USAGE';

export interface StockMovement {
  id: string;
  date: string;
  movementType: StockMovementType;
  referenceNumber: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  warehouseId: string;
  warehouseCode: string;
  qtyIn: number;
  qtyOut: number;
  balanceQty: number;
  uom?: string;
  unitCost: number;
  totalCost: number;
  notes?: string;
  createdAt: string;
}

// WAREHOUSE: INTER-WAREHOUSE TRANSFERS (MUTASI ANTAR GUDANG)
export interface StockTransferItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string; // SJT-2026-000001
  transferDate: string;
  originWarehouseId: string;
  originWarehouseCode: string;
  originWarehouseName: string;
  destinationWarehouseId: string;
  destinationWarehouseCode: string;
  destinationWarehouseName: string;
  items: StockTransferItem[];
  totalQty: number;
  totalValuation: number;
  driverName?: string;
  vehicleNo?: string;
  dispatcherName?: string;
  recipientName?: string;
  status: 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

// WAREHOUSE: PHYSICAL STOCK OPNAME & RECONCILIATION (BASO)
export interface StockOpnameItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  uom: string;
  systemQty: number;
  physicalQty: number;
  varianceQty: number; // physical - system (bisa minus atau plus)
  unitCost: number;
  varianceCost: number; // varianceQty * unitCost
  reason: string; // e.g. SUSUT_ALAMI_KADAR_AIR, RUSAK_AFKIR, SELISIH_ADMINISTRASI, COCOK
  notes?: string;
}

export interface StockOpname {
  id: string;
  opnameNumber: string; // BASO-2026-000001
  opnameDate: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  auditorName: string;
  witnessName?: string;
  items: StockOpnameItem[];
  totalItemsCounted: number;
  totalItemsWithVariance: number;
  totalVarianceCost: number;
  status: 'POSTED' | 'DRAFT';
  notes?: string;
  createdAt: string;
}

// PRODUCTION MODULE: CIGARETTE SPECIFIC
export interface WorkOrder {
  id: string;
  woNumber: string;
  processStage: 'GILING' | 'PACKING';
  productId: string; // Batangan for GILING, Finished Goods for PACKING
  productCode: string;
  productName: string;
  bomId: string;
  plannedQty: number; // Planned Batangan or Planned Packs
  actualOutputQty: number;
  rejectQty: number;
  scrapQty: number;
  reclaimQty: number; // TSG Reclaimed from stripped reject batangan
  uom: string;
  startDate: string;
  endDate?: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  // Tobacco specific notes
  moistureShrinkagePercent?: number; // Susut alami timbangan
  allocatedLaborCost: number;
  allocatedMaterialCost: number;
  unitHpp: number;
  createdAt: string;
}

export interface WOMaterialIssue {
  id: string;
  woId: string;
  woNumber: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  warehouseId: string;
  plannedQty: number;
  actualIssuedQty: number;
  uom: string;
  unitCost: number;
  totalCost: number;
}

export interface WOLaborAllocation {
  id: string;
  woId: string;
  employeeId: string;
  employeeName: string;
  position: 'GILING' | 'GUNTING' | 'PACKING' | 'MANDOR' | 'QC';
  laborType: 'BORONGAN' | 'HARIAN';
  unitsProduced: number; // e.g. 10.000 batang
  ratePerUnit: number;
  totalPayable: number;
}

export interface WasteRecord {
  id: string;
  date: string;
  woId: string;
  woNumber: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: 'SCRAP' | 'REJECT' | 'REWORK' | 'RECLAIM';
  quantity: number;
  uom: string;
  sourceWarehouse: string;
  destinationWarehouse: 'WH-WASTE';
  isReclaimed: boolean;
  reclaimTargetItemId?: string; // TSG if reclaimed from reject batangan
  notes?: string;
}

// SALES & DISTRIBUTION
export interface SalesInvoiceItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  unitPrice: number;
  cogsUnit: number;
  totalCogs: number;
  subtotal: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerNpwp?: string;
  invoiceDate: string;
  dueDate: string;
  paymentType: 'CASH' | 'CREDIT';
  items: SalesInvoiceItem[];
  dpp: number; // Dasar Pengenaan Pajak
  ppn: number; // Pajak Pertambahan Nilai
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  status: 'POSTED' | 'CANCELLED';
  fakturPajakNumber?: string;
  deliveryOrderNo?: string;
  notes?: string;
  createdAt: string;
}

export interface CustomerPayment {
  id: string;
  paymentNumber: string;
  salesInvoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  paymentDate: string;
  bankAccountId: string;
  bankAccountName: string;
  amountPaid: number;
  referenceNo: string;
  notes?: string;
  createdAt: string;
}

// FINANCE & ACCOUNTING
export interface JournalLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  journalNumber: string;
  entryDate: string;
  referenceModule:
    | 'PURCHASE_INVOICE'
    | 'PURCHASE_RETURN'
    | 'SUPPLIER_PAYMENT'
    | 'PRODUCTION_GILING'
    | 'PRODUCTION_PACKING'
    | 'SALES_INVOICE'
    | 'CUSTOMER_PAYMENT'
    | 'PAYROLL'
    | 'INVENTORY_ADJUSTMENT'
    | 'EXCISE_RECEIPT';
  referenceId: string;
  referenceNumber: string;
  description: string;
  costCenter: 'PRODUKSI' | 'LOGISTIK' | 'PENJUALAN' | 'FINANCE' | 'HRGA';
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  status: 'POSTED' | 'REVERSED';
  createdAt: string;
}

// TAX ENGINE
export interface TaxTransaction {
  id: string;
  date: string;
  taxType: 'PPN_MASUKAN' | 'PPN_KELUARAN' | 'PPH21' | 'PPH22' | 'PPH23';
  sourceModule: 'PURCHASE' | 'SALES' | 'PAYROLL';
  referenceNumber: string;
  entityName: string; // Customer / Supplier / Employee
  entityNpwp: string;
  dpp: number;
  taxRate: number;
  taxAmount: number;
  fakturPajakNumber?: string;
  taxPeriodMonth: number;
  taxPeriodYear: number;
  status: 'REPORTED' | 'UNREPORTED';
}

// BEA CUKAI / EXCISE MANAGEMENT
export interface PitaCukaiReceipt {
  id: string;
  docNumber: string; // Nomor Dokumen CK-1 / Pemesanan Pita Cukai
  receiptDate: string;
  brand: string;
  exciseType: 'SKT' | 'SKM' | 'SKPT';
  year: number;
  packSize: number; // 12, 16
  tariffPerPack: number;
  sheetsReceived: number; // Kuantitas Lembar (misal: 1 lembar = 50 keping pita cukai)
  piecesPerSheet: number;
  totalPieces: number; // Total Keping Pita Cukai
  totalValue: number; // Nilai Tebus Cukai
  supplierVendor: string; // KPPBC Pengawas
  piecesAvailable: number;
  piecesUsed: number;
  piecesDamaged: number; // Berita Acara Rusak/Cacat
  status: 'RECEIVED' | 'AVAILABLE' | 'DEPLETED' | 'CANCELLED';
  notes?: string;
}

export interface PitaCukaiUsage {
  id: string;
  woPackingId: string;
  woNumber: string;
  date: string;
  brand: string;
  finishedGoodsId: string;
  finishedGoodsName: string;
  receiptId: string; // Link to PitaCukaiReceipt
  packsProduced: number;
  piecesUsed: number;
  piecesDamaged: number; // Sobek / cacat saat perekatan
  damageReportRef?: string; // Berita Acara Kerusakan
}

// CUSTOMS REPORTS (DJBC)
export interface CSCK1ReportRow {
  periodMonth: number;
  periodYear: number;
  brand: string;
  // Bahan Baku TSG
  tsgOpeningBalanceKg: number;
  tsgReceivedKg: number;
  tsgUsedKg: number;
  tsgClosingBalanceKg: number;
  // Bahan Pembantu Papir
  papirUsedSheets: number;
  // Hasil Giling (Batangan)
  batanganProducedPcs: number;
  batanganRejectPcs: number;
  batanganReclaimTsgKg: number;
  // Hasil Packing (Finished Goods)
  fgProducedPacks: number;
  fgRejectPacks: number;
  woReferences: string[];
}

export interface CSCK3ReportRow {
  periodMonth: number;
  periodYear: number;
  brand: string;
  tariffCode: string;
  packSize: number;
  tariffPerPack: number;
  openingBalancePcs: number;
  receivedDocCKPcs: number;
  usedInProductionPcs: number;
  damagedDefectivePcs: number;
  closingBalancePcs: number;
  referenceDocs: string[];
}

export interface CSCK9ReportRow {
  periodMonth: number;
  periodYear: number;
  brand: string;
  packSize: number;
  fgOpeningStockPacks: number;
  fgPackedFromProductionPacks: number;
  exciseAttachedPcs: number;
  fgDeliveredSalesPacks: number;
  fgClosingStockPacks: number;
  salesInvoiceRefs: string[];
  woPackingRefs: string[];
}

export interface CK4SummaryReport {
  periodMonth: number;
  periodYear: number;
  companyName: string;
  nppbkc: string;
  customsOffice: string;
  records: {
    brand: string;
    type: string;
    packSize: number;
    hjePerPack: number;
    exciseRatePerPack: number;
    totalProductionPacks: number;
    totalDeliveredSalesPacks: number;
    totalExcisePayable: number;
  }[];
  totalExciseValue: number;
}

// AUDIT TRAIL & SYSTEM
export interface AuditLog {
  id: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'POST' | 'CANCEL' | 'REVERSE' | 'PAYMENT' | 'SOFT_CLOSE' | 'REOPEN_PERIOD';
  entity: string;
  recordId: string;
  recordNumber: string;
  description: string;
  oldValues?: string;
  newValues?: string;
}

export interface FiscalPeriod {
  year: number;
  month: number;
  isClosed: boolean;
  closedAt?: string;
  closedBy?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  reopenReason?: string;
}
