const { z } = require("zod");

// Auth Validators
exports.registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").trim(),
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password too long"),
    role: z.enum(["admin", "donee", "donor"]).default("donor"),
    phone: z.string().trim().optional(),
  }),
});

exports.loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    password: z.string().min(1, "Password is required"),
  }),
});

// Case Validators
exports.createCaseSchema = z.object({
  body: z.object({
    applicantName: z.string().min(2, "Name must be at least 2 characters").trim(),
    phone: z.string().min(10, "Phone number is required").trim(),
    cnic: z.string().min(13, "CNIC must be at least 13 characters").trim(),
    city: z.string().min(2, "City is required").trim(),
    address: z.string().min(10, "Address is required").trim(),
    familyMembers: z.number().int().min(1, "Family members must be at least 1"),
    dependents: z.string().min(1, "Dependents information is required").trim(),
    income: z.number().min(0, "Income cannot be negative"),
    expenses: z.number().min(0, "Expenses cannot be negative"),
    description: z
      .string()
      .min(50, "Description must be at least 50 characters")
      .max(5000, "Description cannot exceed 5000 characters")
      .trim(),
    amountRequired: z
      .number()
      .positive("Amount must be greater than 0")
      .max(10000000, "Amount exceeds maximum limit"),
    bankDetails: z
      .object({
        accountNumber: z.string().optional(),
        accountTitle: z.string().optional(),
        bankName: z.string().optional(),
        iban: z.string().optional(),
      })
      .optional(),
    videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),
  }),
});

exports.updateCaseSchema = z.object({
  body: z.object({
    description: z
      .string()
      .trim()
      .min(50, "Description must be at least 50 characters")
      .max(5000, "Description cannot exceed 5000 characters")
      .optional(),
    amountRequired: z
      .number()
      .positive("Amount must be greater than 0")
      .optional(),
    bankDetails: z
      .object({
        accountNumber: z.string().optional(),
        accountTitle: z.string().optional(),
        bankName: z.string().optional(),
        iban: z.string().optional(),
      })
      .optional(),
  }),
});

// Donation Validators
exports.pledgeDonationSchema = z.object({
  body: z.object({
    caseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid case ID"),
    pledgedAmount: z
      .number()
      .positive("Pledged amount must be greater than 0")
      .max(1000000, "Amount exceeds maximum limit"),
  }),
});

// Peer Review Validators
exports.createReviewSchema = z.object({
  body: z.object({
    caseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid case ID"),
    comment: z
      .string()
      .trim()
      .max(1000, "Comment cannot exceed 1000 characters")
      .optional(),
    supportVote: z.boolean().optional(),
    flagged: z.boolean().default(false),
    flagReason: z.string().trim().optional(),
  }),
});

// Query Validators
exports.createQuerySchema = z.object({
  body: z.object({
    caseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid case ID"),
    message: z
      .string()
      .min(10, "Message must be at least 10 characters")
      .max(2000, "Message cannot exceed 2000 characters")
      .trim(),
  }),
});

exports.replyQuerySchema = z.object({
  body: z.object({
    adminReply: z
      .string()
      .min(10, "Reply must be at least 10 characters")
      .max(2000, "Reply cannot exceed 2000 characters")
      .trim(),
  }),
});

// Admin Validators
exports.approveCaseSchema = z.object({
  body: z.object({
    status: z.enum(["approved", "rejected", "peer_review"]),
    adminNote: z.string().trim().optional(),
  }),
});

// Charity Calculator Validator
exports.charityCalculatorSchema = z.object({
  body: z.object({
    savings: z.number().min(0, "Savings cannot be negative").default(0),
    gold: z.number().min(0, "Gold value cannot be negative").default(0),
    silver: z.number().min(0, "Silver value cannot be negative").default(0),
    investments: z.number().min(0, "Investments cannot be negative").default(0),
    debts: z.number().min(0, "Debts cannot be negative").default(0),
  }),
});

// Validation middleware
exports.validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

