import z from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number")
  .regex(/[^A-Za-z0-9]/, "Include at least one special character");

export const loginSchema = z.object({
  email: z.email(),
  password: passwordSchema,
});

export const clientRegistrationSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(100, "Name cannot exceed 100 characters"),
    email: z.email("Please provide a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    contactNumber: z.string().min(5).max(20).optional().or(z.literal("")),
    address: z.string().max(500).optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    dateOfBirth: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"],
  });

export const verifyAccountSchema = z.object({
  email: z.email("Please provide a valid email address"),
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/),
});

