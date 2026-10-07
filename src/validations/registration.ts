import { z } from "zod";

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be a valid 10-digit number."),
  dateOfBirth: z.string().min(1, "Date of birth is required."),
  address: z.string().min(5, "Address must be at least 5 characters."),
});

export const academicInfoSchema = z.object({
  college: z.string().min(2, "College name is required."),
  university: z.string().min(2, "University name is required."),
  course: z.string().min(2, "Course / Degree is required (e.g., B.Tech, MCA, BCA)."),
  semester: z.string().min(1, "Current semester / year is required."),
});

export const internshipInfoSchema = z.object({
  technology: z.enum([
    "Modern Fullstack Web Development",
    "Python for Enterprise & Automation",
    "Data Science & Analytics",
    "Applied AI & Machine Learning",
    "Enterprise Java Development",
  ], {
    error: "Please select an internship technology domain.",
  }),
  duration: z.enum(["1 Month", "2 Months", "3 Months", "6 Months"], {
    error: "Please select an internship duration.",
  }),
  startDate: z.string().min(1, "Preferred start date is required."),
  category: z.enum(["Academic Internship", "Skill Enhancement", "Graduation Capstone"], {
    error: "Please select an internship category.",
  }),
});

export const registrationSchema = personalInfoSchema
  .merge(academicInfoSchema)
  .merge(internshipInfoSchema);

export type RegistrationFormData = z.infer<typeof registrationSchema>;
