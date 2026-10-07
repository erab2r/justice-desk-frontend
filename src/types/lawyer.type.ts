export type LawyerVerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

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
  createdAt?: string;
  verificationStatus?: LawyerVerificationStatus;
  rejectionReason?: string | null;
  user?: {
    email: string;
    emailVerified: boolean;
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
