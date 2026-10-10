export type LawyerVerificationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LawyerAccountStatus = "ACTIVE" | "BLOCKED";
export type LawyerDocumentType = "resume" | "additionalFile";

export interface Specialization {
  id: string;
  name: string;
  description?: string | null;
}

export interface LawyerSpecialization {
  specialization: Specialization;
}

export interface Lawyer {
  id: string;
  name: string;
  email?: string;
  licenseNumber?: string;
  qualifications?: string;
  experienceYears?: number;
  bio?: string | null;
  consultationFee?: number | string | null;
  contactNumber?: string | null;
  address?: string | null;
  resume?: string | null;
  additionalFiles?: Array<{ url: string; publicId?: string }> | null;
  createdAt?: string;
  verificationStatus?: LawyerVerificationStatus;
  rejectionReason?: string | null;
  user?: {
    email: string;
    emailVerified: boolean;
    status?: LawyerAccountStatus;
  };
  specializations?: LawyerSpecialization[];
}

export type PublicLawyerProfile = Pick<
  Lawyer,
  | "id"
  | "name"
  | "licenseNumber"
  | "qualifications"
  | "experienceYears"
  | "bio"
  | "consultationFee"
  | "createdAt"
  | "specializations"
>;

export interface LawyerParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  email?: string;
  licenseNumber?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  verificationStatus?: LawyerVerificationStatus;
}

export interface PublicLawyerParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApproveLawyerPayload {
  lawyerId: string;
  verificationStatus: LawyerVerificationStatus;
  rejectionReason?: string;
}

export interface UpdateLawyerProfilePayload {
  address?: string;
  bio?: string;
  consultationFee?: number;
  contactNumber?: string;
  qualifications?: string;
  experienceYears?: number;
  specializationIds?: string[];
}

export interface UpdateLawyerStatusPayload {
  status: LawyerAccountStatus;
}

export interface LawyerDocuments {
  resume: { url: string; publicId?: string | null } | null;
  additionalFiles: Array<{ url: string; publicId: string }>;
}
