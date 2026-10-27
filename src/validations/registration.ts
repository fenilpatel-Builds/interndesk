import { z } from "zod";
import { isEmailDomainAllowed, INSTITUTE_CONFIG } from "../lib/institute/config";

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .refine((val) => isEmailDomainAllowed(val), {
      message: `Email domain is not authorized. Permitted: ${INSTITUTE_CONFIG.allowedEmailDomains.join(", ")}`,
    }),
  studentId: z
    .string()
    .min(3, "Student ID / Enrollment Number must be at least 3 characters.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Student ID can only contain letters, numbers, hyphens, and underscores."),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be a valid 10-digit number."),
  dateOfBirth: z.string().optional().default(""),
  address: z.string().optional().default(""),
});

export const academicInfoSchema = z.object({
  department: z.string().min(2, "Please select your academic department."),
  course: z.string().min(2, "Academic course or degree program is required."),
  semester: z.string().min(1, "Academic semester or year is required."),
  college: z.string().optional().default(INSTITUTE_CONFIG.name),
  university: z.string().optional().default("Gujarat Technological University"),
  technology: z.string().min(2, "Primary technology track or domain is required."),
});

export const internshipInfoSchema = z.object({
  duration: z.string().optional().default("6 Months"),
  startDate: z.string().optional().default("2026-07-01"),
  category: z.string().optional().default("Academic Activity & Project Practicum"),
});

export const registrationSchema = personalInfoSchema
  .merge(academicInfoSchema)
  .merge(internshipInfoSchema);

export type RegistrationFormData = z.infer<typeof registrationSchema>;
