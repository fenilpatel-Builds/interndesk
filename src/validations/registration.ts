import { z } from "zod";

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be a valid 10-digit number."),
  dateOfBirth: z.string().optional().default(""),
  address: z.string().optional().default(""),
});

export const academicInfoSchema = z.object({
  college: z.string().min(2, "College name is required."),
  university: z.string().min(2, "University name is required."),
  technology: z.string().min(2, "Technology specialization is required."),
  course: z.string().optional().default("B.Tech / Bachelor Degree"),
  semester: z.string().optional().default("Final Year"),
});

export const internshipInfoSchema = z.object({
  duration: z.string().optional().default("3 Months"),
  startDate: z.string().optional().default("2026-10-08"),
  category: z.string().optional().default("Academic Internship"),
});

export const registrationSchema = personalInfoSchema
  .merge(academicInfoSchema)
  .merge(internshipInfoSchema);

export type RegistrationFormData = z.infer<typeof registrationSchema>;
