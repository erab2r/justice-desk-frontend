export type UserRole = "SUPER_ADMIN" | "ADMIN" | "LAWYER" | "CLIENT";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "BLOCKED" | "DELETED";
  emailVerified: boolean;
  needPasswordChange?: boolean;
  imageUrl?: string;
  client?: {
    id: string;
    contactNumber?: string | null;
    address?: string | null;
  } | null;
  lawyer?: {
    id: string;
    licenseNumber?: string;
    qualifications?: string;
    experienceYears?: number;
    bio?: string | null;
    contactNumber?: string | null;
    address?: string | null;
    verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
    consultationFee?: number | string | null;
    specializations?: Array<{
      specialization: { id: string; name: string };
    }>;
  } | null;
}
