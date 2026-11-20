import fs from "fs";
import path from "path";
import { resolveDataFilePath } from "../data/storage-path";

export type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "FILL_BLANKS"
  | "SHORT_ANSWER"
  | "DESCRIPTIVE"
  | "CODING"
  | "MATCHING";

export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD" | "ADVANCED";

export interface MatchingPair {
  left: string;
  right: string;
}

export interface TestCase {
  input: string;
  expected_output: string;
}

export interface BankQuestion {
  id: string;
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  question: string;
  options?: string[];
  correct_answer?: string | string[]; // Single string or array of correct answers
  explanation: string;
  marks: number;
  negative_marks?: number;
  tags?: string[];
  code_language?: "python" | "javascript" | "java" | "cpp" | "sql";
  starter_code?: string;
  test_cases?: TestCase[];
  matching_pairs?: MatchingPair[];
  rubric?: string;
  created_at: string;
}

const BANK_FILE = resolveDataFilePath("question-bank.json");

function ensureDirectory(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
}

export const SEED_BANK_QUESTIONS: BankQuestion[] = [
  // --- AI & Machine Learning ---
  {
    id: "qb_aiml_01",
    subject: "AI & Machine Learning",
    topic: "Deep Learning Regularization",
    difficulty: "MEDIUM",
    type: "SINGLE_CHOICE",
    question: "In Supervised Learning, which technique is specifically designed to prevent deep neural networks from overfitting on training data?",
    options: [
      "Dropout and L2 (Ridge) Weight Regularization",
      "Increasing the number of fully connected hidden layers",
      "Removing validation dataset splits",
      "Setting learning rate to infinity"
    ],
    correct_answer: "Dropout and L2 (Ridge) Weight Regularization",
    explanation: "Dropout randomly deactivates neurons during forward passes, and L2 regularization penalizes large weights, preventing individual feature co-adaptation and overfitting.",
    marks: 10,
    negative_marks: 2.5,
    tags: ["deep-learning", "regularization", "overfitting"],
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "qb_aiml_02",
    subject: "AI & Machine Learning",
    topic: "Transformers & Attention",
    difficulty: "HARD",
    type: "MULTIPLE_CHOICE",
    question: "Which of the following statements regarding the Transformer Attention mechanism are correct? (Select all that apply)",
    options: [
      "Self-Attention calculates dynamic dot-product affinity between Query and Key vectors",
      "Multi-Head Attention allows the model to attend to information from different representation subspaces jointly",
      "Scaled Dot-Product divides by sqrt(d_k) to prevent softmax gradients from vanishing in high dimensions",
      "Transformers require recurrent loops to pass hidden states sequentially between time steps"
    ],
    correct_answer: [
      "Self-Attention calculates dynamic dot-product affinity between Query and Key vectors",
      "Multi-Head Attention allows the model to attend to information from different representation subspaces jointly",
      "Scaled Dot-Product divides by sqrt(d_k) to prevent softmax gradients from vanishing in high dimensions"
    ],
    explanation: "Transformers operate fully in parallel without sequential recurrent loops. Queries, Keys, and Values are scaled by 1/sqrt(d_k) to maintain gradient stability.",
    marks: 15,
    negative_marks: 3,
    tags: ["transformers", "attention", "nlp"],
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "qb_aiml_03",
    subject: "AI & Machine Learning",
    topic: "Model Evaluation",
    difficulty: "EASY",
    type: "TRUE_FALSE",
    question: "The Receiver Operating Characteristic (ROC) curve evaluates the trade-off between True Positive Rate and False Positive Rate across all classification thresholds.",
    options: ["True", "False"],
    correct_answer: "True",
    explanation: "ROC plots Sensitivity (TPR) vs 1-Specificity (FPR) across various discrimination thresholds, and AUC indicates overall discriminatory power.",
    marks: 5,
    negative_marks: 1,
    tags: ["roc", "metrics", "classification"],
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "qb_aiml_04",
    subject: "AI & Machine Learning",
    topic: "Clustering Algorithms",
    difficulty: "MEDIUM",
    type: "FILL_BLANKS",
    question: "In the K-Means clustering algorithm, the optimization algorithm iteratively assigns points to the nearest cluster _____ and recomputes their positions.",
    correct_answer: ["centroid", "centroids", "center", "centers"],
    explanation: "K-Means alternates between cluster assignment based on Euclidean distance to centroids and updating centroids to the mean of their assigned points.",
    marks: 10,
    negative_marks: 0,
    tags: ["unsupervised-learning", "k-means", "clustering"],
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "qb_aiml_05",
    subject: "AI & Machine Learning",
    topic: "Convolutional Neural Networks",
    difficulty: "HARD",
    type: "MATCHING",
    question: "Match each deep learning layer with its primary operational function:",
    matching_pairs: [
      { left: "Convolutional Layer", right: "Extracts local spatial feature maps using learnable kernels" },
      { left: "Max Pooling Layer", right: "Reduces spatial dimensions while preserving translational invariance" },
      { left: "Batch Normalization", right: "Stabilizes training by zero-centering and re-scaling activations" },
      { left: "Softmax Layer", right: "Converts raw logits into a normalized probability distribution" }
    ],
    explanation: "Convolution extracts spatial features, Pooling performs spatial downsampling, BatchNorm accelerates convergence, and Softmax yields categorical probabilities.",
    marks: 20,
    negative_marks: 0,
    tags: ["cnn", "architecture", "layers"],
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "qb_aiml_06",
    subject: "AI & Machine Learning",
    topic: "Neural Network Implementation",
    difficulty: "ADVANCED",
    type: "CODING",
    question: "Implement a Python function `relu_activation(values)` that takes a list of numeric floats and returns a new list applying the Rectified Linear Unit (ReLU) function `max(0, x)` for each element.",
    code_language: "python",
    starter_code: "def relu_activation(values: list[float]) -> list[float]:\n    # Write your solution here\n    pass",
    test_cases: [
      { input: "[-2.5, 0.0, 3.2, -1.0, 5.0]", expected_output: "[0.0, 0.0, 3.2, 0.0, 5.0]" },
      { input: "[-5.0, -10.0]", expected_output: "[0.0, 0.0]" }
    ],
    explanation: "ReLU sets all negative inputs to 0 while keeping positive values unchanged: f(x) = max(0, x).",
    marks: 25,
    rubric: "5 marks for correct signature, 10 marks for handling negative values, 10 marks for test case execution.",
    tags: ["python", "relu", "activation-functions"],
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "qb_aiml_07",
    subject: "AI & Machine Learning",
    topic: "Ethical AI & Bias Mitigation",
    difficulty: "HARD",
    type: "DESCRIPTIVE",
    question: "Explain the concept of Algorithmic Bias in production Machine Learning systems. Discuss three primary sources of bias (data collection, feature selection, historical proxies) and formulate two actionable engineering strategies to audit and mitigate disparate impact.",
    explanation: "Model answers should address sampling bias, label noise, proxy variables, demographic parity, equalized odds, and ongoing post-deployment drift monitoring.",
    marks: 20,
    rubric: "5 marks for defining algorithmic bias, 6 marks for identifying 3 sources, 6 marks for 2 mitigation strategies, 3 marks for clarity and terminology.",
    tags: ["ethics", "fairness", "essay"],
    created_at: "2026-10-01T08:00:00.000Z",
  },

  // --- Full-Stack & Next.js Enterprise Systems ---
  {
    id: "qb_fullstack_01",
    subject: "Full-Stack Enterprise Systems",
    topic: "Next.js App Router Architecture",
    difficulty: "MEDIUM",
    type: "SINGLE_CHOICE",
    question: "By default, React components created within the Next.js App Router (app directory) execute as which component type?",
    options: [
      "React Server Components (RSC) rendered on the server",
      "Client Components with hydrateRoot automatically injected",
      "Static Web Workers running in browser background threads",
      "WebAssembly binaries compiled on the edge"
    ],
    correct_answer: "React Server Components (RSC) rendered on the server",
    explanation: "Next.js App Router components default to Server Components, reducing client bundle size by keeping heavy dependencies and secrets on the server.",
    marks: 10,
    negative_marks: 2.5,
    tags: ["nextjs", "app-router", "rsc"],
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "qb_fullstack_02",
    subject: "Full-Stack Enterprise Systems",
    topic: "Database Concurrency & ACID",
    difficulty: "HARD",
    type: "MULTIPLE_CHOICE",
    question: "Which of the following phenomena are prevented under the 'SERIALIZABLE' transaction isolation level in relational SQL databases? (Select all that apply)",
    options: [
      "Dirty Reads",
      "Non-Repeatable Reads",
      "Phantom Reads",
      "Deadlock Immunity"
    ],
    correct_answer: [
      "Dirty Reads",
      "Non-Repeatable Reads",
      "Phantom Reads"
    ],
    explanation: "Serializable isolation prevents Dirty Reads, Non-Repeatable Reads, and Phantom Reads. It does not prevent deadlocks; in fact, serialization failures and deadlocks can occur and require application-level retry logic.",
    marks: 15,
    negative_marks: 3,
    tags: ["database", "acid", "transactions", "sql"],
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "qb_fullstack_03",
    subject: "Full-Stack Enterprise Systems",
    topic: "REST & HTTP Protocols",
    difficulty: "EASY",
    type: "TRUE_FALSE",
    question: "According to RFC 9110 HTTP Semantics, the HTTP PUT method is defined as idempotent, meaning making multiple identical requests has the same outcome as a single request.",
    options: ["True", "False"],
    correct_answer: "True",
    explanation: "PUT replaces the target resource entirely with the request payload, making repeated identical requests idempotent, unlike POST which can create multiple resources.",
    marks: 5,
    negative_marks: 1,
    tags: ["http", "rest", "idempotency"],
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "qb_fullstack_04",
    subject: "Full-Stack Enterprise Systems",
    topic: "Asynchronous JavaScript",
    difficulty: "MEDIUM",
    type: "CODING",
    question: "Write a JavaScript function `flattenArray(nested)` that recursively flattens an array of arbitrarily deeply nested arrays into a single 1-dimensional array.",
    code_language: "javascript",
    starter_code: "function flattenArray(nested) {\n  // Implement recursive flattening\n}",
    test_cases: [
      { input: "[1, [2, [3, [4]], 5]]", expected_output: "[1, 2, 3, 4, 5]" },
      { input: "[[['a']], 'b', ['c', ['d']]]", expected_output: "['a', 'b', 'c', 'd']" }
    ],
    explanation: "Recursion or Array.prototype.flat(Infinity) flattens nested structures into a linear list.",
    marks: 20,
    rubric: "10 marks for recursion/flat logic, 10 marks for matching test cases.",
    tags: ["javascript", "recursion", "algorithms"],
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "qb_fullstack_05",
    subject: "Full-Stack Enterprise Systems",
    topic: "System Architecture & Scalability",
    difficulty: "HARD",
    type: "DESCRIPTIVE",
    question: "Compare horizontal vs vertical database scaling in enterprise web applications. Detail how read replicas, connection pooling (e.g., PgBouncer), and multi-tenant row-level security (RLS) preserve database throughput under high traffic spikes.",
    explanation: "Evaluation checks explanation of CQRS read/write splitting, replication lag, connection saturation, and partitioned tenant query indexing.",
    marks: 20,
    rubric: "5 marks horizontal vs vertical, 5 marks read replicas, 5 marks connection poolers, 5 marks RLS security.",
    tags: ["architecture", "scaling", "postgres"],
    created_at: "2026-10-01T08:00:00.000Z",
  },

  // --- Cybersecurity & Zero-Trust Architecture ---
  {
    id: "qb_sec_01",
    subject: "Zero-Trust Cybersecurity",
    topic: "Web Application Security",
    difficulty: "MEDIUM",
    type: "SINGLE_CHOICE",
    question: "Which HTTP cookie attribute is the primary defense against Cross-Site Scripting (XSS) attacks attempting to exfiltrate session tokens via document.cookie?",
    options: [
      "HttpOnly",
      "SameSite=None",
      "Path=/",
      "Domain=example.com"
    ],
    correct_answer: "HttpOnly",
    explanation: "The HttpOnly flag forbids client-side JavaScript from accessing document.cookie, thwarting session token exfiltration through XSS injection.",
    marks: 10,
    negative_marks: 2.5,
    tags: ["security", "xss", "cookies"],
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "qb_sec_02",
    subject: "Zero-Trust Cybersecurity",
    topic: "Public Key Cryptography",
    difficulty: "HARD",
    type: "MATCHING",
    question: "Match each cryptographic primitive with its authentic mathematical application:",
    matching_pairs: [
      { left: "ECDH (Elliptic Curve Diffie-Hellman)", right: "Asymmetric shared secret key exchange over untrusted channels" },
      { left: "AES-256-GCM", right: "Authenticated symmetric block cipher with integrity tags" },
      { left: "Argon2id", right: "Memory-hard password hashing resistant to GPU/ASIC cracking" },
      { left: "HMAC-SHA256", right: "Keyed-hash message authentication code verifying data integrity" }
    ],
    explanation: "ECDH enables key agreement, AES-GCM provides authenticated encryption, Argon2id handles password derivation, and HMAC verifies signatures.",
    marks: 20,
    tags: ["cryptography", "encryption", "hashing"],
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "qb_sec_03",
    subject: "Zero-Trust Cybersecurity",
    topic: "Authentication Architecture",
    difficulty: "MEDIUM",
    type: "FILL_BLANKS",
    question: "In OAuth 2.0 authorization code flows for Single Page Applications (SPAs), the _____ extension is mandatory to protect against authorization code interception.",
    correct_answer: ["PKCE", "Proof Key for Code Exchange"],
    explanation: "PKCE (Proof Key for Code Exchange) uses code verifiers and challenges to authenticate public clients without exposing client secrets.",
    marks: 10,
    tags: ["oauth", "pkce", "authentication"],
    created_at: "2026-10-01T08:00:00.000Z",
  },

  // --- UI/UX & Human-Centered Design ---
  {
    id: "qb_uiux_01",
    subject: "UI/UX Design Systems",
    topic: "WCAG Accessibility Standards",
    difficulty: "MEDIUM",
    type: "SINGLE_CHOICE",
    question: "Under WCAG 2.1 Level AA standards, what is the minimum required contrast ratio for standard body text against its background?",
    options: [
      "4.5:1",
      "3.0:1",
      "7.0:1",
      "2.0:1"
    ],
    correct_answer: "4.5:1",
    explanation: "WCAG 2.1 Level AA requires at least 4.5:1 contrast for normal body text and 3:1 for large text (18pt or 14pt bold).",
    marks: 10,
    negative_marks: 2.5,
    tags: ["wcag", "accessibility", "contrast"],
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "qb_uiux_02",
    subject: "UI/UX Design Systems",
    topic: "Design Systems & Tokens",
    difficulty: "EASY",
    type: "TRUE_FALSE",
    question: "Design tokens are platform-agnostic key-value pairs (representing color, typography, spacing, and elevation) that sync unified styling across Web, iOS, and Android applications.",
    options: ["True", "False"],
    correct_answer: "True",
    explanation: "Design tokens serve as the single source of truth across platforms, enabling centralized maintenance of brand themes.",
    marks: 5,
    tags: ["design-systems", "tokens", "figma"],
    created_at: "2026-10-01T08:00:00.000Z",
  }
];

let bankMemoryCache: BankQuestion[] | null = null;

function loadBankFromDisk(): BankQuestion[] {
  try {
    ensureDirectory(BANK_FILE);
    if (!fs.existsSync(BANK_FILE)) {
      if (bankMemoryCache && bankMemoryCache.length > 0) return bankMemoryCache;
      fs.writeFileSync(BANK_FILE, JSON.stringify(SEED_BANK_QUESTIONS, null, 2), "utf-8");
      bankMemoryCache = [...SEED_BANK_QUESTIONS];
      return bankMemoryCache;
    }
    const content = fs.readFileSync(BANK_FILE, "utf-8");
    if (!content || !content.trim()) return bankMemoryCache || SEED_BANK_QUESTIONS;
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      bankMemoryCache = parsed;
      return parsed;
    }
    bankMemoryCache = [...SEED_BANK_QUESTIONS];
    return bankMemoryCache;
  } catch {
    return bankMemoryCache || SEED_BANK_QUESTIONS;
  }
}

function saveBankToDisk(data: BankQuestion[]) {
  bankMemoryCache = [...data];
  try {
    ensureDirectory(BANK_FILE);
    fs.writeFileSync(BANK_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[QuestionBankStore] Save error:", err);
  }
}

export class QuestionBankStore {
  private questions: BankQuestion[] = [];

  constructor() {
    this.questions = loadBankFromDisk();
  }

  public getAll(): BankQuestion[] {
    this.questions = loadBankFromDisk();
    return this.questions;
  }

  public getById(id: string): BankQuestion | null {
    this.questions = loadBankFromDisk();
    const clean = id.toLowerCase().trim();
    return this.questions.find((q) => q.id === id || q.id.toLowerCase().trim() === clean) || null;
  }

  public search(params: {
    subject?: string;
    topic?: string;
    difficulty?: string;
    type?: string;
    query?: string;
  }): BankQuestion[] {
    this.questions = loadBankFromDisk();
    return this.questions.filter((q) => {
      if (params.subject && params.subject !== "ALL" && q.subject !== params.subject) return false;
      if (params.difficulty && params.difficulty !== "ALL" && q.difficulty !== params.difficulty) return false;
      if (params.type && params.type !== "ALL" && q.type !== params.type) return false;
      if (params.query && params.query.trim()) {
        const qStr = params.query.toLowerCase().trim();
        const matchesText = q.question.toLowerCase().includes(qStr);
        const matchesTopic = q.topic.toLowerCase().includes(qStr);
        const matchesTags = q.tags?.some((t) => t.toLowerCase().includes(qStr));
        if (!matchesText && !matchesTopic && !matchesTags) return false;
      }
      return true;
    });
  }

  public createQuestion(data: Omit<BankQuestion, "id" | "created_at">): BankQuestion {
    this.questions = loadBankFromDisk();
    const newQ: BankQuestion = {
      ...data,
      id: `qb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    this.questions.unshift(newQ);
    saveBankToDisk(this.questions);
    return newQ;
  }

  public updateQuestion(id: string, updates: Partial<BankQuestion>): BankQuestion | null {
    this.questions = loadBankFromDisk();
    const idx = this.questions.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    const updated = {
      ...this.questions[idx],
      ...updates,
      id: this.questions[idx].id,
      created_at: this.questions[idx].created_at,
    };
    this.questions[idx] = updated;
    saveBankToDisk(this.questions);
    return updated;
  }

  public deleteQuestion(id: string): boolean {
    this.questions = loadBankFromDisk();
    const idx = this.questions.findIndex((q) => q.id === id);
    if (idx === -1) return false;
    this.questions.splice(idx, 1);
    saveBankToDisk(this.questions);
    return true;
  }

  public importBulk(questions: Array<Omit<BankQuestion, "id" | "created_at">>): BankQuestion[] {
    this.questions = loadBankFromDisk();
    const created: BankQuestion[] = questions.map((q, idx) => ({
      ...q,
      id: `qb_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 5)}`,
      created_at: new Date().toISOString(),
    }));
    this.questions.unshift(...created);
    saveBankToDisk(this.questions);
    return created;
  }
}

export const questionBankStore = new QuestionBankStore();
