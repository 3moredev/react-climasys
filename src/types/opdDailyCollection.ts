/**
 * TypeScript interfaces for OPD Daily Collection
 * Matches the backend OPDDailyCollectionDTO
 */

export interface OPDDailyCollectionRecord {
  visitDate: string;
  name: string;
  patientId: string;
  statusDescription: string | null;
  statusId: number | null;
  feesToCollect: number | null;
  feesCollected: number | null;
  adhocFees: number | null;
  originalBilledAmount: number | null;
  folderNo: string;
  comment: string | null;
  difference: number | null;
  dues: number | null;
  originalDiscount: number | null;
  discount: number | null;
  net: number | null;
  inPerson: boolean;
  attendedBy: string;
  paymentById: number | null;
  paymentRemark: string | null;
  paymentDescription: string | null;
  partialName: string;
  ageYearsIntRound: number | null;
  genderDescription: string;
  patientVisitNo: number | null;
  doctorId: string;
  doctorName: string;
  isFollowUp: string;
  baseLocation: string | null;
}

export interface OPDDailyCollectionResponse {
  success: boolean;
  data: OPDDailyCollectionRecord[];
  count: number;
  fromDate: string;
  toDate: string;
  clinicId: string;
  doctorId: string;
}

export interface OPDDailyCollectionFilters {
  fromDate: Date;
  toDate: Date;
  clinicId: string;
  doctorId?: string;
  roleId?: number;
  languageId?: number;
}

export interface OPDDailyCollectionTotals {
  totalOriginalBilledAmount: number;
  totalFeesToCollect: number;
  totalDifference: number;
  totalOriginalDiscount: number;
  totalDiscount: number;
  totalNet: number;
  totalFeesCollected: number;
  totalDues: number;
  totalAdhocFees: number;
  totalCollection: number; // C + A
}
