export interface RegistrationPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  client?: {
    contactNumber?: string;
    address?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth?: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyAccountPayload {
  email: string;
  otp: string;
}

export interface LawyerApplicationPayload {
  user: { name: string; email: string };
  lawyer: {
    address?: string;
    licenseNumber: string;
    qualifications: string;
    experienceYears: number;
    bio?: string;
    consultationFee?: number;
    contactNumber?: string;
    specializationIds: string[];
    newPracticeArea?: string;
  };
  resume?: File;
  additionalFiles?: File[];
}
