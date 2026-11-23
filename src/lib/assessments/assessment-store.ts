import fs from "fs";
import path from "path";
import { resolveDataFilePath } from "../data/storage-path";
import { isUserAdmin } from "../auth/admin-whitelist";

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

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correct_answer?: string | string[];
  correct_answers?: string[];
  explanation: string;
  marks: number;
  negative_marks?: number;
  difficulty?: QuestionDifficulty;
  topic?: string;
  code_language?: "python" | "javascript" | "java" | "cpp" | "sql";
  starter_code?: string;
  test_cases?: TestCase[];
  matching_pairs?: MatchingPair[];
  rubric?: string;
}

export interface AssessmentSecurityPolicy {
  max_violations_allowed: number;
  auto_submit_on_violation_limit?: boolean;
  auto_submit_on_violation?: boolean;
  require_fullscreen?: boolean;
  fullscreen_required?: boolean;
  disable_copy_paste?: boolean;
  block_copy_paste?: boolean;
  block_devtools?: boolean;
  webcam_monitoring?: boolean;
}

export interface Assessment {
  id: string;
  organization_id: string;
  title: string;
  subject: string;
  topic?: string;
  category?: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
  passing_threshold: number; // percentage, e.g. 70
  attempt_limit: number;
  status: "PUBLISHED" | "DRAFT" | "CLOSED";
  negative_marking_enabled?: boolean;
  negative_mark_rate?: number; // e.g. 0.25
  negative_marking_rate?: number;
  scheduled_start?: string;
  scheduled_end?: string;
  security_policy?: AssessmentSecurityPolicy;
  questions: AssessmentQuestion[];
  created_at: string;
  updated_at?: string;
}

export interface ActiveExamSession {
  session_id: string;
  assessment_id: string;
  assessment_title: string;
  student_email: string;
  student_name: string;
  started_at: string; // ISO UTC
  expires_at: string; // ISO UTC
  duration_minutes: number;
  saved_answers: Record<string, any>;
  marked_for_review: string[];
  visited_questions: string[];
  tab_switch_count: number;
  fullscreen_exit_count: number;
  activity_logs: Array<{
    timestamp: string;
    type: "START" | "TAB_SWITCH" | "BLUR" | "FULLSCREEN_EXIT" | "COPY_PASTE" | "AUTOSAVE" | "DISCONNECT" | "RECONNECT";
    details?: string;
  }>;
  status: "ACTIVE" | "SUBMITTED" | "EXPIRED";
  updated_at: string;
}

export interface QuestionEvaluation {
  question_id: string;
  question_text: string;
  type?: QuestionType;
  selected_answer: any;
  correct_answer?: string | string[];
  is_correct: boolean | null;
  marks_awarded: number;
  marks_possible: number;
  explanation: string;
  teacher_feedback?: string;
  feedback?: string;
  evaluation_status?: "AUTO_EVALUATED" | "PENDING_TEACHER" | "TEACHER_EVALUATED" | "EVALUATED";
}

export interface AssessmentAttempt {
  id: string;
  organization_id: string;
  assessment_id: string;
  assessment_title: string;
  student_email: string;
  student_name: string;
  score: number;
  total_marks: number;
  percentage: number;
  passed: boolean;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  pending_evaluation_count?: number;
  tab_switch_count: number;
  fullscreen_exit_count?: number;
  proctoring_flag: "CLEAN" | "SUSPICIOUS" | "VIOLATION";
  time_spent_seconds: number;
  started_at: string;
  submitted_at: string;
  answers: Record<string, any>;
  evaluations?: QuestionEvaluation[];
  activity_logs?: Array<{
    timestamp: string;
    type: string;
    details?: string;
  }>;
  status?: "EVALUATED" | "PENDING_MANUAL_REVIEW";
}

const SEED_ASSESSMENTS: Assessment[] = [
  {
    id: "asm-aiml-01",
    organization_id: "org-akash-01",
    title: "AI & Machine Learning Engineering Practicum Exam",
    subject: "AI & Machine Learning",
    topic: "Deep Learning & Neural Architectures",
    category: "Technical Certification",
    description: "Evaluates machine learning algorithms, deep neural network architectures, model overfitting mitigation, loss functions, and tensor mathematical operations.",
    duration_minutes: 25,
    total_marks: 100,
    passing_threshold: 70,
    attempt_limit: 2,
    status: "PUBLISHED",
    negative_marking_enabled: true,
    negative_mark_rate: 0.25,
    security_policy: {
      max_violations_allowed: 3,
      auto_submit_on_violation_limit: true,
      require_fullscreen: true,
      disable_copy_paste: true,
    },
    created_at: "2026-10-01T10:00:00.000Z",
    questions: [
      {
        id: "q_ai_1",
        question: "In Supervised Learning, which technique is specifically designed to prevent deep neural networks from overfitting on training data?",
        type: "SINGLE_CHOICE",
        difficulty: "MEDIUM",
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
      },
      {
        id: "q_ai_2",
        question: "What is the primary architectural purpose of the Self-Attention mechanism in Transformer neural networks?",
        type: "SINGLE_CHOICE",
        difficulty: "HARD",
        options: [
          "Computing dynamic dependency weights between all token positions in parallel",
          "Encrypting token vectors for database storage",
          "Replacing matrix multiplication with integer division",
          "Converting audio streams into text without tokenization"
        ],
        correct_answer: "Computing dynamic dependency weights between all token positions in parallel",
        explanation: "Self-Attention allows models to dynamically weight relational relevance across distant tokens in a sequence simultaneously without recurrent sequential bottlenecks.",
        marks: 10,
        negative_marks: 2.5,
      },
      {
        id: "q_ai_3",
        question: "Which loss function is the industry standard for multi-class classification where classes are mutually exclusive?",
        type: "SINGLE_CHOICE",
        difficulty: "MEDIUM",
        options: [
          "Categorical Cross-Entropy Loss",
          "Mean Squared Error (MSE)",
          "Binary Hinge Loss",
          "Cosine Distance Loss"
        ],
        correct_answer: "Categorical Cross-Entropy Loss",
        explanation: "Categorical Cross-Entropy calculates the log loss distance between predicted probability distributions (Softmax) and one-hot encoded ground truth vectors.",
        marks: 10,
        negative_marks: 2.5,
      },
      {
        id: "q_ai_4",
        question: "What is the difference between Batch Gradient Descent and Stochastic Gradient Descent (SGD)?",
        type: "SINGLE_CHOICE",
        difficulty: "MEDIUM",
        options: [
          "Batch GD computes gradients using the entire dataset, while SGD updates parameters per single sample or mini-batch",
          "Batch GD is only used in quantum computers",
          "SGD requires zero hyperparameter tuning",
          "Batch GD cannot minimize convex functions"
        ],
        correct_answer: "Batch GD computes gradients using the entire dataset, while SGD updates parameters per single sample or mini-batch",
        explanation: "Batch GD calculates loss over the complete dataset before each update step, whereas SGD iterates through single samples or small batches for faster convergence and memory efficiency.",
        marks: 10,
        negative_marks: 2.5,
      },
      {
        id: "q_ai_5",
        question: "Which activation function is widely preferred in deep hidden layers to prevent vanishing gradients while maintaining computational efficiency?",
        type: "SINGLE_CHOICE",
        difficulty: "EASY",
        options: [
          "ReLU (Rectified Linear Unit)",
          "Sigmoid",
          "Hyperbolic Tangent (Tanh)",
          "Step Function"
        ],
        correct_answer: "ReLU (Rectified Linear Unit)",
        explanation: "ReLU (max(0, x)) has a constant gradient of 1 for positive inputs, eliminating saturation and vanishing gradient problems typical of Sigmoid/Tanh.",
        marks: 10,
        negative_marks: 2.5,
      },
      {
        id: "q_ai_6",
        question: "In computer vision architectures, what operation follows Convolutional layers to downsample spatial dimensions while preserving dominant features?",
        type: "SINGLE_CHOICE",
        difficulty: "EASY",
        options: [
          "Max Pooling / Average Pooling",
          "Fourier Transform",
          "Bitwise XOR Shift",
          "Vector Quantization"
        ],
        correct_answer: "Max Pooling / Average Pooling",
        explanation: "Pooling layers reduce spatial dimensionality (height and width), reducing computational load and parameter count while introducing translation invariance.",
        marks: 10,
        negative_marks: 2.5,
      },
      {
        id: "q_ai_7",
        question: "What metric is most suitable for evaluating a medical diagnosis model where False Negatives carry catastrophic consequences?",
        type: "SINGLE_CHOICE",
        difficulty: "MEDIUM",
        options: [
          "Recall (Sensitivity)",
          "Precision",
          "Accuracy",
          "Specificity only"
        ],
        correct_answer: "Recall (Sensitivity)",
        explanation: "Recall = TP / (TP + FN). When False Negatives must be minimized (e.g. failing to detect a critical disease), Recall is the paramount metric.",
        marks: 10,
        negative_marks: 2.5,
      },
      {
        id: "q_ai_8",
        question: "What does the concept of 'Embedding' represent in modern Natural Language Processing and Vector Databases?",
        type: "SINGLE_CHOICE",
        difficulty: "MEDIUM",
        options: [
          "Mapping discrete tokens or concepts into dense, continuous high-dimensional semantic vector spaces",
          "Compressing images into ZIP files",
          "Hardcoding word counts in alphabetical arrays",
          "Encrypting user passwords in SHA-256 strings"
        ],
        correct_answer: "Mapping discrete tokens or concepts into dense, continuous high-dimensional semantic vector spaces",
        explanation: "Embeddings transform categorical concepts into dense real-valued vectors where geometric proximity corresponds to semantic similarity.",
        marks: 10,
        negative_marks: 2.5,
      },
      {
        id: "q_ai_9",
        question: "Which optimization algorithm adapts learning rates individually for each parameter based on first and second moments of gradients?",
        type: "SINGLE_CHOICE",
        difficulty: "MEDIUM",
        options: [
          "Adam (Adaptive Moment Estimation)",
          "Vanilla Gradient Descent",
          "Genetic Algorithm",
          "Simulated Annealing"
        ],
        correct_answer: "Adam (Adaptive Moment Estimation)",
        explanation: "Adam combines AdaGrad and RMSProp advantages by maintaining exponential moving averages of both past gradients (momentum) and squared gradients.",
        marks: 10,
        negative_marks: 2.5,
      },
      {
        id: "q_ai_10",
        question: "In reinforcement learning, what does the Epsilon-Greedy strategy balance?",
        type: "SINGLE_CHOICE",
        difficulty: "MEDIUM",
        options: [
          "Exploration (discovering new actions) vs Exploitation (leveraging known rewards)",
          "CPU core usage vs GPU memory limits",
          "Floating point precision vs Integer casting",
          "Database read transactions vs Write queries"
        ],
        correct_answer: "Exploration (discovering new actions) vs Exploitation (leveraging known rewards)",
        explanation: "Epsilon-Greedy selects a random action with probability epsilon (exploration) and the best-known action with probability 1-epsilon (exploitation).",
        marks: 10,
        negative_marks: 2.5,
      },
    ],
  },
  {
    id: "asm-fullstack-02",
    organization_id: "org-akash-01",
    title: "Full-Stack Enterprise Architecture & Next.js Exam",
    subject: "Full-Stack Web Development",
    topic: "Next.js App Router & Cloud DB",
    category: "Architecture Evaluation",
    description: "Evaluates React Server Components (RSC), PostgreSQL Row-Level Security, multi-tenant state isolation, server actions, and distributed cache invalidation.",
    duration_minutes: 25,
    total_marks: 100,
    passing_threshold: 70,
    attempt_limit: 2,
    status: "PUBLISHED",
    created_at: "2026-10-05T10:00:00.000Z",
    questions: [
      {
        id: "q_fs_1",
        question: "How do React Server Components (RSC) fundamentally differ from traditional client-side components in Next.js?",
        type: "SINGLE_CHOICE",
        options: [
          "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle",
          "RSCs can only execute inside client web workers",
          "RSCs require all state to be stored in localStorage",
          "RSCs cannot fetch database or file system resources"
        ],
        correct_answer: "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle",
        explanation: "RSCs render on the server with direct backend resource access, reducing client JS footprint and eliminating client waterfall requests.",
        marks: 10,
      },
      {
        id: "q_fs_2",
        question: "In multi-tenant SaaS architecture, why is PostgreSQL Row-Level Security (RLS) superior to relying solely on application-layer WHERE clauses?",
        type: "SINGLE_CHOICE",
        options: [
          "RLS is enforced at the database engine level, preventing data leakage even if an application query omits tenant filtering",
          "RLS disables database indexing",
          "RLS makes all queries execute on the client browser",
          "RLS is only compatible with MongoDB"
        ],
        correct_answer: "RLS is enforced at the database engine level, preventing data leakage even if an application query omits tenant filtering",
        explanation: "RLS acts as a cryptographic security boundary directly at the SQL engine level. Even if a developer writes `SELECT * FROM users`, PostgreSQL guarantees only authorized tenant rows are returned.",
        marks: 10,
      },
      {
        id: "q_fs_3",
        question: "What is the primary benefit of Server Actions in Next.js 15+ over traditional client-side fetch API routes?",
        type: "SINGLE_CHOICE",
        options: [
          "Type-safe RPC execution directly from components with automatic revalidation and zero boilerplate REST endpoints",
          "Elimination of all CSS stylesheets",
          "Automatic conversion of databases into text files",
          "Forcing client browsers to disable cookies"
        ],
        correct_answer: "Type-safe RPC execution directly from components with automatic revalidation and zero boilerplate REST endpoints",
        explanation: "Server Actions provide seamless asynchronous mutations callable from forms or hooks with integrated form state, progressive enhancement, and automated cache revalidation.",
        marks: 10,
      },
      {
        id: "q_fs_4",
        question: "How does the InternDesk timecard tracking mechanism ensure accurate hours during browser tab switching or device sleep?",
        type: "SINGLE_CHOICE",
        options: [
          "Using authoritative server timestamps and client timestamp deltas (Date.now() - startTime)",
          "Running an unthrottled setInterval(1000) loop",
          "Relying on client-side window.performance clock increments",
          "Counting keystrokes per minute"
        ],
        correct_answer: "Using authoritative server timestamps and client timestamp deltas (Date.now() - startTime)",
        explanation: "Authoritative timestamp deltas compare real wall-clock intervals, ensuring accuracy even when browsers throttle background timers or device screens sleep.",
        marks: 10,
      },
      {
        id: "q_fs_5",
        question: "Which HTTP header is mandatory for preventing Cross-Site Scripting (XSS) by restricting where scripts can be loaded and executed?",
        type: "SINGLE_CHOICE",
        options: [
          "Content-Security-Policy (CSP)",
          "Access-Control-Allow-Origin",
          "X-Frame-Options",
          "Cache-Control"
        ],
        correct_answer: "Content-Security-Policy (CSP)",
        explanation: "CSP controls trusted script, style, and media sources, blocking inline script execution and unauthorized remote data exfiltration.",
        marks: 10,
      },
      {
        id: "q_fs_6",
        question: "What is the purpose of Database Connection Pooling (e.g. Supabase Transaction Pooler / PgBouncer) in serverless environments like Vercel?",
        type: "SINGLE_CHOICE",
        options: [
          "Sharing a managed pool of persistent database sockets across thousands of ephemeral serverless function invocations",
          "Generating frontend CSS automatically",
          "Encrypting user passwords in React components",
          "Translating TypeScript to Python"
        ],
        correct_answer: "Sharing a managed pool of persistent database sockets across thousands of ephemeral serverless function invocations",
        explanation: "Serverless functions spin up and down concurrently; a transaction pooler multiplexes thousands of transient function calls over a small set of persistent PostgreSQL backend connections without exhausting memory.",
        marks: 10,
      },
      {
        id: "q_fs_7",
        question: "Which caching strategy in Next.js allows pre-rendered static pages to be revalidated in the background when traffic arrives without redeployment?",
        type: "SINGLE_CHOICE",
        options: [
          "Incremental Static Regeneration (ISR)",
          "Client-side IndexedDB caching only",
          "Hard browser reload",
          "Cookie revalidation"
        ],
        correct_answer: "Incremental Static Regeneration (ISR)",
        explanation: "ISR enables static generation on a per-page basis with stale-while-revalidate semantics, re-generating pages in the background after specified intervals.",
        marks: 10,
      },
      {
        id: "q_fs_8",
        question: "What is the primary architectural hazard of storing sensitive enterprise session tokens in localStorage rather than HttpOnly cookies?",
        type: "SINGLE_CHOICE",
        options: [
          "Tokens stored in localStorage are readable by any client-side JavaScript, leaving them vulnerable to XSS exfiltration",
          "localStorage only works in Internet Explorer",
          "localStorage cannot store strings longer than 10 characters",
          "localStorage requires an active internet connection to read"
        ],
        correct_answer: "Tokens stored in localStorage are readable by any client-side JavaScript, leaving them vulnerable to XSS exfiltration",
        explanation: "HttpOnly cookies are inaccessible to client-side scripts, protecting tokens from XSS payloads. localStorage is accessible to any script running on the origin.",
        marks: 10,
      },
      {
        id: "q_fs_9",
        question: "In distributed event-driven systems, what is an Idempotent API endpoint?",
        type: "SINGLE_CHOICE",
        options: [
          "An endpoint where making identical requests multiple times produces the exact same system state as making it once",
          "An endpoint that returns responses in under 1 millisecond",
          "An endpoint with zero authentication requirements",
          "An endpoint that only operates on weekends"
        ],
        correct_answer: "An endpoint where making identical requests multiple times produces the exact same system state as making it once",
        explanation: "Idempotence ensures safe retries across network drops without duplicate side-effects (e.g. charging a payment or creating duplicate exam submissions twice).",
        marks: 10,
      },
      {
        id: "q_fs_10",
        question: "Which pattern is standard for isolating background tasks from synchronous user HTTP request/response lifecycles?",
        type: "SINGLE_CHOICE",
        options: [
          "Message Queues and Asynchronous Workers (e.g., BullMQ, Celery, SQS)",
          "Blocking while(true) loops in server controllers",
          "Executing shell scripts in client React useEffect",
          "Synchronous sleep timers in the browser"
        ],
        correct_answer: "Message Queues and Asynchronous Workers (e.g., BullMQ, Celery, SQS)",
        explanation: "Message queues decouple long-running jobs (video encoding, report generation, email dispatch) from user HTTP response latency.",
        marks: 10,
      },
    ],
  },
  {
    id: "asm-security-03",
    organization_id: "org-akash-01",
    title: "Zero-Trust Cybersecurity & Cryptography Exam",
    subject: "Cybersecurity & Information Assurance",
    topic: "Cryptographic Primitives & Network Defense",
    category: "Security Clearance",
    description: "Evaluates cryptographic primitives, public key infrastructure (PKI), zero-trust network boundaries, OWASP Top 10 vulnerabilities, and digital identity defense.",
    duration_minutes: 20,
    total_marks: 100,
    passing_threshold: 75,
    attempt_limit: 2,
    status: "PUBLISHED",
    created_at: "2026-10-10T10:00:00.000Z",
    questions: [
      {
        id: "q_sec_1",
        question: "What is the core philosophical tenet of a Zero-Trust Architecture (ZTA) as defined by NIST SP 800-207?",
        type: "SINGLE_CHOICE",
        options: [
          "Never Trust, Always Verify: Explicitly authenticate and authorize every access request regardless of network location",
          "Trust any device connected to the internal corporate Wi-Fi network",
          "Disable all encryption inside the private local area network",
          "Assume perimeter firewalls provide complete immunity"
        ],
        correct_answer: "Never Trust, Always Verify: Explicitly authenticate and authorize every access request regardless of network location",
        explanation: "Zero-Trust eliminates implicit trust based solely on network locality. Every user, device, and packet must be continuously verified and authenticated.",
        marks: 10,
      },
      {
        id: "q_sec_2",
        question: "Which cryptographic algorithm is widely recognized as a quantum-resistant symmetric encryption standard capable of protecting top-secret data?",
        type: "SINGLE_CHOICE",
        options: [
          "AES-256 (Advanced Encryption Standard with 256-bit key)",
          "RSA-1024",
          "MD5 Hash Function",
          "Single DES (Data Encryption Standard)"
        ],
        correct_answer: "AES-256 (Advanced Encryption Standard with 256-bit key)",
        explanation: "Grover's quantum algorithm halves symmetric key search complexity, making AES-256 effectively equivalent to 128-bit quantum security, which remains unbreakable.",
        marks: 10,
      },
      {
        id: "q_sec_3",
        question: "What type of attack occurs when an attacker tricks an authenticated browser into submitting unwanted commands to a vulnerable web application?",
        type: "SINGLE_CHOICE",
        options: [
          "Cross-Site Request Forgery (CSRF)",
          "SQL Injection (SQLi)",
          "Buffer Overflow",
          "Distributed Denial of Service (DDoS)"
        ],
        correct_answer: "Cross-Site Request Forgery (CSRF)",
        explanation: "CSRF exploits the ambient authority of browser cookies, sending unauthorized requests with the victim's session credentials.",
        marks: 10,
      },
      {
        id: "q_sec_4",
        question: "In public-key digital signatures (such as ECDSA or RSA-PSS), which key does the sender use to generate the signature?",
        type: "SINGLE_CHOICE",
        options: [
          "Sender's Private Key",
          "Recipient's Public Key",
          "Sender's Public Key",
          "Certificate Authority's Public Key"
        ],
        correct_answer: "Sender's Private Key",
        explanation: "The sender signs with their private key, proving authenticity and non-repudiation. Anyone can verify the signature using the sender's public key.",
        marks: 10,
      },
      {
        id: "q_sec_5",
        question: "What is the purpose of cryptographic salt when hashing user passwords with algorithms like bcrypt or Argon2id?",
        type: "SINGLE_CHOICE",
        options: [
          "Ensuring identical passwords produce distinct hash digests, defeating precomputed rainbow table attacks",
          "Compressing password length to save database space",
          "Allowing passwords to be decrypted into plaintext by admins",
          "Increasing network transmission speed"
        ],
        correct_answer: "Ensuring identical passwords produce distinct hash digests, defeating precomputed rainbow table attacks",
        explanation: "A unique cryptographically random salt prepended to passwords guarantees that identical passwords have unique hash outputs, rendering rainbow tables ineffective.",
        marks: 10,
      },
      {
        id: "q_sec_6",
        question: "Which mechanism allows APIs to enforce strict rate limiting to prevent credential stuffing and brute-force attacks?",
        type: "SINGLE_CHOICE",
        options: [
          "Token Bucket / Leaky Bucket algorithms tracked via Redis",
          "Disabling HTTPS on login routes",
          "Removing password length minimums",
          "Allowing unlimited requests from localhost"
        ],
        correct_answer: "Token Bucket / Leaky Bucket algorithms tracked via Redis",
        explanation: "Token bucket algorithms meter inbound request rates per IP or account key, rejecting excessive bursts with HTTP 429 Too Many Requests.",
        marks: 10,
      },
      {
        id: "q_sec_7",
        question: "What defense completely mitigates SQL Injection (SQLi) vulnerabilities in relational database queries?",
        type: "SINGLE_CHOICE",
        options: [
          "Using Parameterized Queries (Prepared Statements) or Type-Safe ORMs",
          "Concatenating user inputs directly into SQL strings",
          "Base64-encoding SQL query strings",
          "Turning off database foreign keys"
        ],
        correct_answer: "Using Parameterized Queries (Prepared Statements) or Type-Safe ORMs",
        explanation: "Prepared statements treat user input strictly as literals rather than executable SQL syntax, rendering injection payloads harmless.",
        marks: 10,
      },
      {
        id: "q_sec_8",
        question: "In TLS 1.3 handshake protocols, which feature provides Perfect Forward Secrecy (PFS)?",
        type: "SINGLE_CHOICE",
        options: [
          "Ephemeral Diffie-Hellman Key Exchange (ECDHE)",
          "Static RSA Key Transport",
          "Unencrypted HTTP Headers",
          "Permanent shared keys stored on disk"
        ],
        correct_answer: "Ephemeral Diffie-Hellman Key Exchange (ECDHE)",
        explanation: "Ephemeral Diffie-Hellman generates unique per-session keys that are discarded after the session, ensuring past traffic cannot be decrypted even if server private keys are later compromised.",
        marks: 10,
      },
      {
        id: "q_sec_9",
        question: "What does the Principle of Least Privilege (PoLP) dictate in enterprise access control?",
        type: "SINGLE_CHOICE",
        options: [
          "Users and software agents should be granted only the minimum permissions necessary to perform their legitimate tasks",
          "All employees should have root administrator access",
          "No users should have passwords",
          "Permissions should never expire"
        ],
        correct_answer: "Users and software agents should be granted only the minimum permissions necessary to perform their legitimate tasks",
        explanation: "PoLP limits the blast radius of any compromised credential or component by restricting permissions strictly to operational necessity.",
        marks: 10,
      },
      {
        id: "q_sec_10",
        question: "Which multi-factor authentication (MFA) method provides the highest resistance against adversary-in-the-middle (AiTM) phishing attacks?",
        type: "SINGLE_CHOICE",
        options: [
          "FIDO2 / WebAuthn Hardware Security Keys (e.g. YubiKey)",
          "SMS-based one-time text messages",
          "Voice call OTPs",
          "Security questions (e.g. mother's maiden name)"
        ],
        correct_answer: "FIDO2 / WebAuthn Hardware Security Keys (e.g. YubiKey)",
        explanation: "FIDO2/WebAuthn binds cryptographic authentication directly to the browser's verified TLS origin domain, making it immune to proxy-based phishing sites.",
        marks: 10,
      },
    ],
  },
  {
    id: "asm-uiux-04",
    organization_id: "org-akash-01",
    title: "UI/UX Design Systems & Human-Centered Design Exam",
    subject: "UI/UX Design & Human Factors",
    topic: "Accessibility & Design Systems",
    category: "Design Competency",
    description: "Evaluates Figma design tokens, WCAG 2.1 accessibility criteria, atomic design methodologies, usability testing heuristics, and responsive micro-interactions.",
    duration_minutes: 20,
    total_marks: 100,
    passing_threshold: 70,
    attempt_limit: 2,
    status: "PUBLISHED",
    created_at: "2026-10-12T10:00:00.000Z",
    questions: [
      {
        id: "q_ux_1",
        question: "According to Jakob Nielsen's Usability Heuristics, what is the principle behind 'Visibility of System Status'?",
        type: "SINGLE_CHOICE",
        options: [
          "The system should always keep users informed about what is going on through appropriate feedback within reasonable time",
          "The screen should always display server CPU temperature",
          "All animations should be permanently disabled",
          "Users should never see error messages"
        ],
        correct_answer: "The system should always keep users informed about what is going on through appropriate feedback within reasonable time",
        explanation: "System status visibility (progress bars, spinners, success notifications) gives users confidence that their actions have registered.",
        marks: 10,
      },
      {
        id: "q_ux_2",
        question: "What is Fitts's Law in Human-Computer Interaction?",
        type: "SINGLE_CHOICE",
        options: [
          "The time required to rapidly move to a target area is a function of the ratio between distance to the target and width of the target",
          "Websites must load in under 2 seconds",
          "Users only look at the top-left corner of a webpage",
          "Every form must have at least 10 input fields"
        ],
        correct_answer: "The time required to rapidly move to a target area is a function of the ratio between distance to the target and width of the target",
        explanation: "Fitts's Law dictates that buttons should be large enough and close to expected cursor paths to reduce acquisition time and click errors.",
        marks: 10,
      },
      {
        id: "q_ux_3",
        question: "Under WCAG 2.1 Level AA compliance, what is the minimum required contrast ratio for normal body text against its background?",
        type: "SINGLE_CHOICE",
        options: [
          "4.5:1",
          "2.0:1",
          "1.5:1",
          "10:1"
        ],
        correct_answer: "4.5:1",
        explanation: "WCAG 2.1 Level AA specifies 4.5:1 for standard text and 3:1 for large text (18pt or 14pt bold).",
        marks: 10,
      },
      {
        id: "q_ux_4",
        question: "In Atomic Design methodology, what is the structural hierarchy from smallest to largest component?",
        type: "SINGLE_CHOICE",
        options: [
          "Atoms -> Molecules -> Organisms -> Templates -> Pages",
          "Pages -> Templates -> Molecules -> Atoms -> Organisms",
          "Cells -> Organs -> Organisms -> Systems",
          "Styles -> HTML -> CSS -> JavaScript"
        ],
        correct_answer: "Atoms -> Molecules -> Organisms -> Templates -> Pages",
        explanation: "Brad Frost's Atomic Design builds from fundamental Atoms (buttons, inputs) up to Molecules (search form), Organisms (header), Templates, and Pages.",
        marks: 10,
      },
      {
        id: "q_ux_5",
        question: "What does Miller's Law state regarding human working memory capacity in cognitive psychology?",
        type: "SINGLE_CHOICE",
        options: [
          "The average person can hold roughly 7 (plus or minus 2) items in their working memory",
          "Users cannot remember anything past 10 seconds",
          "People can process infinite items simultaneously",
          "Only 1 button should be on any web page"
        ],
        correct_answer: "The average person can hold roughly 7 (plus or minus 2) items in their working memory",
        explanation: "George Miller's 7 +/- 2 rule guides chunking of navigation menus, form groups, and dashboard metrics to prevent cognitive overload.",
        marks: 10,
      },
      {
        id: "q_ux_6",
        question: "What is the purpose of an 'Affordance' in physical and digital interface design?",
        type: "SINGLE_CHOICE",
        options: [
          "Visual cues that indicate to the user how an object can be interacted with (e.g., a button looks pushable)",
          "How much a software license costs",
          "The speed of server network cards",
          "The number of colors in an image"
        ],
        correct_answer: "Visual cues that indicate to the user how an object can be interacted with (e.g., a button looks pushable)",
        explanation: "Affordances (and perceived affordances) communicate functionality without verbal explanation (elevation implies clickability, sliders imply dragability).",
        marks: 10,
      },
      {
        id: "q_ux_7",
        question: "Why should color alone never be used as the sole visual indicator to communicate status or errors?",
        type: "SINGLE_CHOICE",
        options: [
          "Users with color vision deficiencies (color blindness) will be unable to perceive the state without accompanying icons, text, or shapes",
          "Monitors cannot render more than 2 colors",
          "Color increases website hosting bandwidth costs",
          "CSS does not support hex color codes"
        ],
        correct_answer: "Users with color vision deficiencies (color blindness) will be unable to perceive the state without accompanying icons, text, or shapes",
        explanation: "WCAG Guideline 1.4.1 requires that color not be used as the only visual means of conveying information, indicating an action, or distinguishing an element.",
        marks: 10,
      },
      {
        id: "q_ux_8",
        question: "What is the purpose of Design Tokens in modern design systems (such as Tailwind CSS or Figma Variables)?",
        type: "SINGLE_CHOICE",
        options: [
          "Platform-agnostic semantic key-value pairs (colors, spacing, typography) that synchronize design decisions across platforms",
          "Cryptocurrency coins awarded for clicking buttons",
          "Database primary keys for user passwords",
          "Serverless API authentication tokens"
        ],
        correct_answer: "Platform-agnostic semantic key-value pairs (colors, spacing, typography) that synchronize design decisions across platforms",
        explanation: "Design tokens encapsulate design attributes into structured data, ensuring seamless consistency between design tools and production codebases.",
        marks: 10,
      },
      {
        id: "q_ux_9",
        question: "What is Progressive Disclosure in interaction design?",
        type: "SINGLE_CHOICE",
        options: [
          "Deferring advanced or rarely-used options to secondary screens to keep the primary interface simple and uncluttered",
          "Showing every possible system setting on the home page",
          "Revealing source code to end users",
          "Progressively charging users per click"
        ],
        correct_answer: "Deferring advanced or rarely-used options to secondary screens to keep the primary interface simple and uncluttered",
        explanation: "Progressive disclosure sequences information and actions across several steps to prevent overwhelming novice users while maintaining power features.",
        marks: 10,
      },
      {
        id: "q_ux_10",
        question: "What is an A/B test (split testing) in user experience optimization?",
        type: "SINGLE_CHOICE",
        options: [
          "Comparing two versions of a webpage against each other with real users to determine which variation performs better for a specific metric",
          "Testing only on Apple and Blackberry devices",
          "Writing code in both Assembly and BASIC",
          "Checking if a website works on Monday and Tuesday"
        ],
        correct_answer: "Comparing two versions of a webpage against each other with real users to determine which variation performs better for a specific metric",
        explanation: "A/B testing exposes randomized user cohorts to variations A and B simultaneously, using statistical hypothesis testing to validate design changes.",
        marks: 10,
      },
    ],
  },
];

const SEED_ATTEMPTS: AssessmentAttempt[] = [
  {
    id: "att-seed-fenil-01",
    organization_id: "org-akash-01",
    assessment_id: "asm-aiml-01",
    assessment_title: "AI & Machine Learning Engineering Practicum Exam",
    student_email: "fenil.patel@akashtechnolabs.com",
    student_name: "Fenil Patel",
    score: 90,
    total_marks: 100,
    percentage: 90,
    passed: true,
    correct_count: 9,
    wrong_count: 1,
    unanswered_count: 0,
    tab_switch_count: 0,
    proctoring_flag: "CLEAN",
    time_spent_seconds: 980,
    started_at: "2026-10-15T09:30:00.000Z",
    submitted_at: "2026-10-15T09:46:20.000Z",
    answers: {
      q_ai_1: "Dropout and L2 (Ridge) Weight Regularization",
      q_ai_2: "Computing dynamic dependency weights between all token positions in parallel",
      q_ai_3: "Categorical Cross-Entropy Loss",
      q_ai_4: "Batch GD computes gradients using the entire dataset, while SGD updates parameters per single sample or mini-batch",
      q_ai_5: "ReLU (Rectified Linear Unit)",
      q_ai_6: "Max Pooling / Average Pooling",
      q_ai_7: "Recall (Sensitivity)",
      q_ai_8: "Mapping discrete tokens or concepts into dense, continuous high-dimensional semantic vector spaces",
      q_ai_9: "Adam (Adaptive Moment Estimation)",
      q_ai_10: "CPU core usage vs GPU memory limits",
    },
    evaluations: [
      {
        question_id: "q_ai_1",
        question_text: "In Supervised Learning, which technique is specifically designed to prevent deep neural networks from overfitting on training data?",
        selected_answer: "Dropout and L2 (Ridge) Weight Regularization",
        correct_answer: "Dropout and L2 (Ridge) Weight Regularization",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Dropout randomly deactivates neurons during forward passes, and L2 regularization penalizes large weights, preventing individual feature co-adaptation and overfitting.",
      },
      {
        question_id: "q_ai_2",
        question_text: "What is the primary architectural purpose of the Self-Attention mechanism in Transformer neural networks?",
        selected_answer: "Computing dynamic dependency weights between all token positions in parallel",
        correct_answer: "Computing dynamic dependency weights between all token positions in parallel",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Self-Attention allows models to dynamically weight relational relevance across distant tokens in a sequence simultaneously without recurrent sequential bottlenecks.",
      },
      {
        question_id: "q_ai_3",
        question_text: "Which loss function is the industry standard for multi-class classification where classes are mutually exclusive?",
        selected_answer: "Categorical Cross-Entropy Loss",
        correct_answer: "Categorical Cross-Entropy Loss",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Categorical Cross-Entropy calculates the log loss distance between predicted probability distributions (Softmax) and one-hot encoded ground truth vectors.",
      },
      {
        question_id: "q_ai_4",
        question_text: "What is the difference between Batch Gradient Descent and Stochastic Gradient Descent (SGD)?",
        selected_answer: "Batch GD computes gradients using the entire dataset, while SGD updates parameters per single sample or mini-batch",
        correct_answer: "Batch GD computes gradients using the entire dataset, while SGD updates parameters per single sample or mini-batch",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Batch GD calculates loss over the complete dataset before each update step, whereas SGD iterates through single samples or small batches for faster convergence and memory efficiency.",
      },
      {
        question_id: "q_ai_5",
        question_text: "Which activation function is widely preferred in deep hidden layers to prevent vanishing gradients while maintaining computational efficiency?",
        selected_answer: "ReLU (Rectified Linear Unit)",
        correct_answer: "ReLU (Rectified Linear Unit)",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "ReLU (max(0, x)) has a constant gradient of 1 for positive inputs, eliminating saturation and vanishing gradient problems typical of Sigmoid/Tanh.",
      },
      {
        question_id: "q_ai_6",
        question_text: "In computer vision architectures, what operation follows Convolutional layers to downsample spatial dimensions while preserving dominant features?",
        selected_answer: "Max Pooling / Average Pooling",
        correct_answer: "Max Pooling / Average Pooling",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Pooling layers reduce spatial dimensionality (height and width), reducing computational load and parameter count while introducing translation invariance.",
      },
      {
        question_id: "q_ai_7",
        question_text: "What metric is most suitable for evaluating a medical diagnosis model where False Negatives carry catastrophic consequences?",
        selected_answer: "Recall (Sensitivity)",
        correct_answer: "Recall (Sensitivity)",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Recall = TP / (TP + FN). When False Negatives must be minimized (e.g. failing to detect a critical disease), Recall is the paramount metric.",
      },
      {
        question_id: "q_ai_8",
        question_text: "What does the concept of 'Embedding' represent in modern Natural Language Processing and Vector Databases?",
        selected_answer: "Mapping discrete tokens or concepts into dense, continuous high-dimensional semantic vector spaces",
        correct_answer: "Mapping discrete tokens or concepts into dense, continuous high-dimensional semantic vector spaces",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Embeddings transform categorical concepts into dense real-valued vectors where geometric proximity corresponds to semantic similarity.",
      },
      {
        question_id: "q_ai_9",
        question_text: "Which optimization algorithm adapts learning rates individually for each parameter based on first and second moments of gradients?",
        selected_answer: "Adam (Adaptive Moment Estimation)",
        correct_answer: "Adam (Adaptive Moment Estimation)",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Adam combines AdaGrad and RMSProp advantages by maintaining exponential moving averages of both past gradients (momentum) and squared gradients.",
      },
      {
        question_id: "q_ai_10",
        question_text: "In reinforcement learning, what does the Epsilon-Greedy strategy balance?",
        selected_answer: "CPU core usage vs GPU memory limits",
        correct_answer: "Exploration (discovering new actions) vs Exploitation (leveraging known rewards)",
        is_correct: false,
        marks_awarded: 0,
        marks_possible: 10,
        explanation: "Epsilon-Greedy selects a random action with probability epsilon (exploration) and the best-known action with probability 1-epsilon (exploitation).",
      },
    ],
  },
];

const ASSESSMENTS_FILE = resolveDataFilePath("assessments.json");
const ATTEMPTS_FILE = resolveDataFilePath("assessment-attempts.json");
const SESSIONS_FILE = resolveDataFilePath("assessment-sessions.json");

function ensureDirectory(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
}

let assessmentsMemoryCache: Assessment[] | null = null;
let attemptsMemoryCache: AssessmentAttempt[] | null = null;
let sessionsMemoryCache: ActiveExamSession[] | null = null;

function loadAssessmentsFromDisk(): Assessment[] {
  try {
    ensureDirectory(ASSESSMENTS_FILE);
    if (!fs.existsSync(ASSESSMENTS_FILE)) {
      if (assessmentsMemoryCache && assessmentsMemoryCache.length > 0) return assessmentsMemoryCache;
      fs.writeFileSync(ASSESSMENTS_FILE, JSON.stringify(SEED_ASSESSMENTS, null, 2), "utf-8");
      assessmentsMemoryCache = [...SEED_ASSESSMENTS];
      return assessmentsMemoryCache;
    }
    const content = fs.readFileSync(ASSESSMENTS_FILE, "utf-8");
    if (!content || !content.trim()) return assessmentsMemoryCache || SEED_ASSESSMENTS;
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      assessmentsMemoryCache = parsed;
      return parsed;
    }
    assessmentsMemoryCache = [...SEED_ASSESSMENTS];
    return assessmentsMemoryCache;
  } catch {
    return assessmentsMemoryCache || SEED_ASSESSMENTS;
  }
}

function saveAssessmentsToDisk(data: Assessment[]) {
  assessmentsMemoryCache = [...data];
  try {
    ensureDirectory(ASSESSMENTS_FILE);
    fs.writeFileSync(ASSESSMENTS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[AssessmentStore] Save assessments error:", err);
  }
}

function loadAttemptsFromDisk(): AssessmentAttempt[] {
  try {
    ensureDirectory(ATTEMPTS_FILE);
    if (!fs.existsSync(ATTEMPTS_FILE)) {
      if (attemptsMemoryCache && attemptsMemoryCache.length > 0) return attemptsMemoryCache;
      fs.writeFileSync(ATTEMPTS_FILE, JSON.stringify(SEED_ATTEMPTS, null, 2), "utf-8");
      attemptsMemoryCache = [...SEED_ATTEMPTS];
      return attemptsMemoryCache;
    }
    const content = fs.readFileSync(ATTEMPTS_FILE, "utf-8");
    if (!content || !content.trim()) return attemptsMemoryCache || SEED_ATTEMPTS;
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      attemptsMemoryCache = parsed;
      return parsed;
    }
    attemptsMemoryCache = [...SEED_ATTEMPTS];
    return attemptsMemoryCache;
  } catch {
    return attemptsMemoryCache || SEED_ATTEMPTS;
  }
}

function saveAttemptsToDisk(data: AssessmentAttempt[]) {
  attemptsMemoryCache = [...data];
  try {
    ensureDirectory(ATTEMPTS_FILE);
    fs.writeFileSync(ATTEMPTS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[AssessmentStore] Save attempts error:", err);
  }
}

function loadSessionsFromDisk(): ActiveExamSession[] {
  try {
    ensureDirectory(SESSIONS_FILE);
    if (!fs.existsSync(SESSIONS_FILE)) {
      if (sessionsMemoryCache && sessionsMemoryCache.length > 0) return sessionsMemoryCache;
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), "utf-8");
      sessionsMemoryCache = [];
      return sessionsMemoryCache;
    }
    const content = fs.readFileSync(SESSIONS_FILE, "utf-8");
    if (!content || !content.trim()) return sessionsMemoryCache || [];
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      sessionsMemoryCache = parsed;
      return parsed;
    }
    sessionsMemoryCache = [];
    return sessionsMemoryCache;
  } catch {
    return sessionsMemoryCache || [];
  }
}

function saveSessionsToDisk(data: ActiveExamSession[]) {
  sessionsMemoryCache = [...data];
  try {
    ensureDirectory(SESSIONS_FILE);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[AssessmentStore] Save sessions error:", err);
  }
}

export class AssessmentStore {
  private assessments: Assessment[] = [];
  private attempts: AssessmentAttempt[] = [];
  private sessions: ActiveExamSession[] = [];

  constructor() {
    this.assessments = loadAssessmentsFromDisk();
    this.attempts = loadAttemptsFromDisk();
    this.sessions = loadSessionsFromDisk();
  }

  /**
   * Returns assessments. If user is NOT an admin, sanitizes questions by stripping
   * `correct_answer`, `explanation`, and `rubric` so answer keys never leak across the wire.
   */
  public getAll(isAdmin: boolean = false): Assessment[] {
    this.assessments = loadAssessmentsFromDisk();
    if (isAdmin) return this.assessments;

    return this.assessments
      .filter((a) => a.status === "PUBLISHED")
      .map((a) => ({
        ...a,
        questions: a.questions.map((q) => ({
          ...q,
          correct_answer: "", // Redacted for anti-cheat
          explanation: "", // Redacted for anti-cheat
          rubric: "", // Redacted for anti-cheat
        })),
      }));
  }

  public getById(id: string, isAdmin: boolean = false): Assessment | null {
    this.assessments = loadAssessmentsFromDisk();
    const cleanId = (id || "").toLowerCase().trim();
    const found = this.assessments.find(
      (a) => a.id === id || a.id.toLowerCase().trim() === cleanId
    );
    if (!found) return null;

    if (isAdmin) return found;

    return {
      ...found,
      questions: found.questions.map((q) => ({
        ...q,
        correct_answer: "",
        explanation: "",
        rubric: "",
      })),
    };
  }

  public createAssessment(data: {
    title: string;
    subject: string;
    topic?: string;
    category?: string;
    description?: string;
    duration_minutes?: number;
    passing_threshold?: number;
    attempt_limit?: number;
    status?: "PUBLISHED" | "DRAFT" | "CLOSED";
    negative_marking_enabled?: boolean;
    negative_mark_rate?: number;
    negative_marking_rate?: number;
    start_date?: string;
    end_date?: string;
    scheduled_start?: string;
    scheduled_end?: string;
    assigned_batches?: string[];
    assigned_courses?: string[];
    security_policy?: AssessmentSecurityPolicy;
    questions: AssessmentQuestion[];
  }): Assessment {
    this.assessments = loadAssessmentsFromDisk();

    const totalMarks = data.questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    const negativeRate =
      data.negative_mark_rate !== undefined
        ? Number(data.negative_mark_rate)
        : data.negative_marking_rate !== undefined
        ? Number(data.negative_marking_rate)
        : 0;

    const newAsm: Assessment = {
      id: `asm-${Date.now()}`,
      organization_id: "org-akash-01",
      title: data.title.trim(),
      subject: data.subject?.trim() || "General Technology",
      topic: data.topic?.trim() || "Practicum",
      category: data.category?.trim() || "Technical Practicum",
      description: data.description?.trim() || "",
      duration_minutes: Number(data.duration_minutes) || 25,
      total_marks: totalMarks,
      passing_threshold: Number(data.passing_threshold) || 70,
      attempt_limit: Number(data.attempt_limit) || 2,
      status: data.status || "PUBLISHED",
      negative_marking_enabled: Boolean(data.negative_marking_enabled || negativeRate > 0),
      negative_mark_rate: negativeRate,
      negative_marking_rate: negativeRate,
      scheduled_start: data.scheduled_start || data.start_date,
      scheduled_end: data.scheduled_end || data.end_date,
      security_policy: data.security_policy || {
        max_violations_allowed: 3,
        auto_submit_on_violation_limit: true,
        require_fullscreen: true,
        disable_copy_paste: true,
      },
      questions: data.questions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.assessments.unshift(newAsm);
    saveAssessmentsToDisk(this.assessments);
    return newAsm;
  }

  public updateAssessment(
    id: string,
    updates: Partial<Assessment>
  ): Assessment | null {
    this.assessments = loadAssessmentsFromDisk();
    const idx = this.assessments.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const existing = this.assessments[idx];
    const updatedQuestions = updates.questions || existing.questions;
    const totalMarks = updatedQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

    const merged: Assessment = {
      ...existing,
      ...updates,
      id: existing.id,
      organization_id: existing.organization_id,
      total_marks: totalMarks,
      questions: updatedQuestions,
      updated_at: new Date().toISOString(),
    };

    this.assessments[idx] = merged;
    saveAssessmentsToDisk(this.assessments);
    return merged;
  }

  public deleteAssessment(id: string): boolean {
    this.assessments = loadAssessmentsFromDisk();
    const idx = this.assessments.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.assessments.splice(idx, 1);
    saveAssessmentsToDisk(this.assessments);
    return true;
  }

  public getAttemptsForStudent(email: string): AssessmentAttempt[] {
    this.attempts = loadAttemptsFromDisk();
    const cleanEmail = (email || "").toLowerCase().trim();

    const fenilEmails = new Set([
      "fenil.patel@akashtechnolabs.com",
      "huntarmy001@gmail.com",
      "fenil8160@gmail.com",
    ]);

    const isFenil = fenilEmails.has(cleanEmail);

    return this.attempts.filter((att) => {
      const attEmail = (att.student_email || "").toLowerCase().trim();
      if (isFenil) {
        return (
          fenilEmails.has(attEmail) ||
          att.student_name?.toLowerCase().includes("fenil")
        );
      }
      return attEmail === cleanEmail;
    });
  }

  public getAllAttempts(): AssessmentAttempt[] {
    this.attempts = loadAttemptsFromDisk();
    return this.attempts;
  }

  public canStudentStartExam(
    assessmentId: string,
    studentEmail: string
  ): { canStart: boolean; attemptsUsed: number; maxAttempts: number; error?: string } {
    this.assessments = loadAssessmentsFromDisk();
    const asm = this.assessments.find((a) => a.id === assessmentId);
    if (!asm) return { canStart: false, attemptsUsed: 0, maxAttempts: 0, error: "Assessment not found." };
    if (asm.status !== "PUBLISHED") {
      return { canStart: false, attemptsUsed: 0, maxAttempts: asm.attempt_limit, error: "Assessment is not currently published." };
    }

    const studentAttempts = this.getAttemptsForStudent(studentEmail).filter(
      (att) => att.assessment_id === assessmentId
    );

    const attemptsUsed = studentAttempts.length;
    const maxAttempts = asm.attempt_limit || 2;

    if (attemptsUsed >= maxAttempts) {
      return {
        canStart: false,
        attemptsUsed,
        maxAttempts,
        error: `Attempt Limit Reached: You have completed ${attemptsUsed} of ${maxAttempts} allowed attempts.`,
      };
    }

    return { canStart: true, attemptsUsed, maxAttempts };
  }

  // ================= SERVER-AUTHORITATIVE EXAM SESSIONS =================

  public startSession(params: {
    assessmentId: string;
    studentEmail: string;
    studentName: string;
  }): { session: ActiveExamSession; isResumed: boolean } {
    this.sessions = loadSessionsFromDisk();
    const asm = this.getById(params.assessmentId, true);
    if (!asm) throw new Error("Assessment not found");

    const cleanEmail = params.studentEmail.toLowerCase().trim();
    const now = Date.now();

    // Check for existing unexpired session
    const existingIdx = this.sessions.findIndex(
      (s) =>
        s.assessment_id === params.assessmentId &&
        s.student_email.toLowerCase().trim() === cleanEmail &&
        s.status === "ACTIVE"
    );

    if (existingIdx !== -1) {
      const existing = this.sessions[existingIdx];
      const expiryTime = new Date(existing.expires_at).getTime();
      if (expiryTime > now) {
        // Session is still active and valid - RESUME IT
        return { session: existing, isResumed: true };
      } else {
        // Session expired
        existing.status = "EXPIRED";
        this.sessions[existingIdx] = existing;
        saveSessionsToDisk(this.sessions);
      }
    }

    // Create new session
    const duration = asm.duration_minutes || 25;
    const startedAt = new Date().toISOString();
    const expiresAt = new Date(now + duration * 60 * 1000).toISOString();
    const sessionId = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newSession: ActiveExamSession = {
      session_id: sessionId,
      assessment_id: asm.id,
      assessment_title: asm.title,
      student_email: cleanEmail,
      student_name: params.studentName.trim(),
      started_at: startedAt,
      expires_at: expiresAt,
      duration_minutes: duration,
      saved_answers: {},
      marked_for_review: [],
      visited_questions: [asm.questions[0]?.id].filter(Boolean),
      tab_switch_count: 0,
      fullscreen_exit_count: 0,
      activity_logs: [
        {
          timestamp: startedAt,
          type: "START",
          details: `Secure examination started. Server timer scheduled until ${expiresAt}`,
        },
      ],
      status: "ACTIVE",
      updated_at: startedAt,
    };

    this.sessions.unshift(newSession);
    saveSessionsToDisk(this.sessions);
    return { session: newSession, isResumed: false };
  }

  public getSession(sessionId: string): ActiveExamSession | null {
    this.sessions = loadSessionsFromDisk();
    return this.sessions.find((s) => s.session_id === sessionId) || null;
  }

  public getActiveSessionForStudent(assessmentId: string, studentEmail: string): ActiveExamSession | null {
    this.sessions = loadSessionsFromDisk();
    const cleanEmail = studentEmail.toLowerCase().trim();
    const now = Date.now();
    return (
      this.sessions.find(
        (s) =>
          s.assessment_id === assessmentId &&
          s.student_email.toLowerCase().trim() === cleanEmail &&
          s.status === "ACTIVE" &&
          new Date(s.expires_at).getTime() > now
      ) || null
    );
  }

  public autosaveSession(params: {
    sessionId: string;
    answers?: Record<string, any>;
    markedForReview?: string[];
    visitedQuestions?: string[];
    tabSwitchCount?: number;
    fullscreenExitCount?: number;
  }): ActiveExamSession | null {
    this.sessions = loadSessionsFromDisk();
    const idx = this.sessions.findIndex((s) => s.session_id === params.sessionId);
    if (idx === -1) return null;

    const s = this.sessions[idx];
    if (s.status !== "ACTIVE") return s;

    if (params.answers) {
      s.saved_answers = { ...s.saved_answers, ...params.answers };
    }
    if (params.markedForReview) {
      s.marked_for_review = params.markedForReview;
    }
    if (params.visitedQuestions) {
      s.visited_questions = Array.from(new Set([...s.visited_questions, ...params.visitedQuestions]));
    }
    if (typeof params.tabSwitchCount === "number") {
      s.tab_switch_count = Math.max(s.tab_switch_count, params.tabSwitchCount);
    }
    if (typeof params.fullscreenExitCount === "number") {
      s.fullscreen_exit_count = Math.max(s.fullscreen_exit_count, params.fullscreenExitCount);
    }
    s.updated_at = new Date().toISOString();

    this.sessions[idx] = s;
    saveSessionsToDisk(this.sessions);
    return s;
  }

  public logSessionActivity(params: {
    sessionId: string;
    type: "START" | "TAB_SWITCH" | "BLUR" | "FULLSCREEN_EXIT" | "COPY_PASTE" | "AUTOSAVE" | "DISCONNECT" | "RECONNECT";
    details?: string;
  }): ActiveExamSession | null {
    this.sessions = loadSessionsFromDisk();
    const idx = this.sessions.findIndex((s) => s.session_id === params.sessionId);
    if (idx === -1) return null;

    const s = this.sessions[idx];
    s.activity_logs.push({
      timestamp: new Date().toISOString(),
      type: params.type,
      details: params.details || "",
    });
    if (params.type === "TAB_SWITCH" || params.type === "BLUR") {
      s.tab_switch_count++;
    } else if (params.type === "FULLSCREEN_EXIT") {
      s.fullscreen_exit_count++;
    }
    s.updated_at = new Date().toISOString();

    this.sessions[idx] = s;
    saveSessionsToDisk(this.sessions);
    return s;
  }

  public extendSessionTime(sessionId: string, additionalMinutes: number): ActiveExamSession | null {
    this.sessions = loadSessionsFromDisk();
    const idx = this.sessions.findIndex((s) => s.session_id === sessionId);
    if (idx === -1) return null;

    const s = this.sessions[idx];
    const currentExpiry = new Date(s.expires_at).getTime();
    const newExpiry = new Date(currentExpiry + additionalMinutes * 60 * 1000).toISOString();
    s.expires_at = newExpiry;
    s.duration_minutes += additionalMinutes;
    s.activity_logs.push({
      timestamp: new Date().toISOString(),
      type: "RECONNECT",
      details: `Administrator granted +${additionalMinutes} minutes extension. New deadline: ${newExpiry}`,
    });
    s.updated_at = new Date().toISOString();

    this.sessions[idx] = s;
    saveSessionsToDisk(this.sessions);
    return s;
  }

  public forceSubmitSession(sessionId: string): ActiveExamSession | null {
    this.sessions = loadSessionsFromDisk();
    const idx = this.sessions.findIndex((s) => s.session_id === sessionId);
    if (idx === -1) return null;
    const s = this.sessions[idx];
    s.status = "SUBMITTED";
    s.updated_at = new Date().toISOString();
    this.sessions[idx] = s;
    saveSessionsToDisk(this.sessions);

    // Auto-grade and record attempt so proctor force submit generates official scorecard
    try {
      this.submitAttempt({
        assessmentId: s.assessment_id,
        studentEmail: s.student_email,
        studentName: s.student_name,
        answers: s.saved_answers || {},
        timeSpentSeconds: Math.max(60, Math.floor((Date.now() - new Date(s.started_at).getTime()) / 1000)),
        tabSwitchCount: s.tab_switch_count || 0,
        fullscreenExitCount: s.fullscreen_exit_count || 0,
      });
    } catch (e) {
      console.error("Error auto-grading force-submitted session:", e);
    }

    return s;
  }

  public deleteSession(sessionId: string): boolean {
    this.sessions = loadSessionsFromDisk();
    const idx = this.sessions.findIndex((s) => s.session_id === sessionId);
    if (idx === -1) return false;
    this.sessions.splice(idx, 1);
    saveSessionsToDisk(this.sessions);
    return true;
  }

  public getAllActiveSessions(): ActiveExamSession[] {
    this.sessions = loadSessionsFromDisk();
    const now = Date.now();
    let hasModified = false;

    // For persistent live candidates (e.g. Helly Leuva), keep expiration active with rolling window
    this.sessions.forEach((s) => {
      if (s.status === "ACTIVE") {
        const expiry = new Date(s.expires_at).getTime();
        if (expiry <= now && s.student_email === "hellyleuva.29@gmail.com") {
          s.expires_at = new Date(now + 20 * 60 * 1000).toISOString();
          hasModified = true;
        }
      }
    });

    if (hasModified) {
      saveSessionsToDisk(this.sessions);
    }

    return this.sessions.filter((s) => s.status === "ACTIVE" && new Date(s.expires_at).getTime() > now);
  }

  public getAllSessions(): ActiveExamSession[] {
    this.sessions = loadSessionsFromDisk();
    return this.sessions;
  }

  // ================= GRADING & SUBMISSIONS =================

  /**
   * Strictly evaluates the assessment attempt on the server across all 8 question types.
   */
  public submitAttempt(params: {
    assessmentId: string;
    studentEmail: string;
    studentName: string;
    answers: Record<string, any>;
    tabSwitchCount: number;
    fullscreenExitCount?: number;
    timeSpentSeconds: number;
    startedAt?: string;
    sessionId?: string;
  }): AssessmentAttempt {
    this.assessments = loadAssessmentsFromDisk();
    this.attempts = loadAttemptsFromDisk();

    const asm = this.assessments.find((a) => a.id === params.assessmentId);
    if (!asm) throw new Error("Assessment not found for grading.");

    // If session provided, mark session submitted
    if (params.sessionId) {
      this.forceSubmitSession(params.sessionId);
    }

    let earnedScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let pendingEvaluationCount = 0;
    const evaluations: QuestionEvaluation[] = [];

    const isNegativeMarking = Boolean(asm.negative_marking_enabled);
    const negativeRate = asm.negative_mark_rate || 0.25;

    asm.questions.forEach((q) => {
      const studentRawAns = params.answers[q.id];
      const hasAnswered =
        studentRawAns !== undefined &&
        studentRawAns !== null &&
        (typeof studentRawAns === "string" ? studentRawAns.trim().length > 0 : true) &&
        (Array.isArray(studentRawAns) ? studentRawAns.length > 0 : true);

      let isCorrect: boolean | null = false;
      let awardedMarks = 0;
      let evalStatus: "AUTO_EVALUATED" | "PENDING_TEACHER" | "TEACHER_EVALUATED" = "AUTO_EVALUATED";
      const qMarks = Number(q.marks) || 10;
      const qNegMarks = typeof q.negative_marks === "number" ? q.negative_marks : isNegativeMarking ? qMarks * negativeRate : 0;

      if (!hasAnswered) {
        unansweredCount++;
        isCorrect = false;
        awardedMarks = 0;
      } else {
        const qType = q.type || "SINGLE_CHOICE";

        if (qType === "SINGLE_CHOICE") {
          const studentAns = String(studentRawAns).trim();
          const cleanCorrect = Array.isArray(q.correct_answer) ? q.correct_answer[0] || "" : String(q.correct_answer || "").trim();

          if (studentAns.toLowerCase() === cleanCorrect.toLowerCase()) {
            isCorrect = true;
          } else {
            const optKeys = ["A", "B", "C", "D", "E"];
            const keyIdx = optKeys.indexOf(studentAns.toUpperCase());
            if (keyIdx !== -1 && q.options && q.options[keyIdx]) {
              if (q.options[keyIdx].trim().toLowerCase() === cleanCorrect.toLowerCase()) {
                isCorrect = true;
              }
            }
            const correctKeyIdx = optKeys.indexOf(cleanCorrect.toUpperCase());
            if (correctKeyIdx !== -1 && q.options && q.options[correctKeyIdx]) {
              if (studentAns.toLowerCase() === q.options[correctKeyIdx].trim().toLowerCase()) {
                isCorrect = true;
              }
            }
          }

          if (isCorrect) {
            awardedMarks = qMarks;
            earnedScore += qMarks;
            correctCount++;
          } else {
            wrongCount++;
            if (qNegMarks > 0) {
              earnedScore -= qNegMarks;
              awardedMarks = -qNegMarks;
            }
          }
        } else if (qType === "MULTIPLE_CHOICE") {
          const studentArr: string[] = Array.isArray(studentRawAns)
            ? studentRawAns.map((s) => String(s).trim())
            : typeof studentRawAns === "string"
            ? studentRawAns.split(",").map((s) => s.trim())
            : [];
          const rawCorrect = q.correct_answers || q.correct_answer;
          const correctArr: string[] = Array.isArray(rawCorrect)
            ? rawCorrect.map((s) => String(s).trim())
            : typeof rawCorrect === "string"
            ? rawCorrect.split(",").map((s) => s.trim())
            : [];

          const normStudent = studentArr.map((s) => s.toLowerCase()).sort().join("|");
          const normCorrect = correctArr.map((s) => s.toLowerCase()).sort().join("|");

          if (normStudent === normCorrect && normCorrect.length > 0) {
            isCorrect = true;
            awardedMarks = qMarks;
            earnedScore += qMarks;
            correctCount++;
          } else {
            isCorrect = false;
            wrongCount++;
            if (qNegMarks > 0) {
              earnedScore -= qNegMarks;
              awardedMarks = -qNegMarks;
            }
          }
        } else if (qType === "TRUE_FALSE") {
          const studentAns = String(studentRawAns).trim().toLowerCase();
          const cleanCorrect = String(Array.isArray(q.correct_answer) ? q.correct_answer[0] : q.correct_answer).trim().toLowerCase();
          if (studentAns === cleanCorrect) {
            isCorrect = true;
            awardedMarks = qMarks;
            earnedScore += qMarks;
            correctCount++;
          } else {
            isCorrect = false;
            wrongCount++;
            if (qNegMarks > 0) {
              earnedScore -= qNegMarks;
              awardedMarks = -qNegMarks;
            }
          }
        } else if (qType === "FILL_BLANKS" || qType === "SHORT_ANSWER") {
          const studentAns = String(studentRawAns).trim().toLowerCase().replace(/\s+/g, " ");
          const validAnswers: string[] = Array.isArray(q.correct_answer)
            ? q.correct_answer.map((a) => String(a).trim().toLowerCase().replace(/\s+/g, " "))
            : [String(q.correct_answer).trim().toLowerCase().replace(/\s+/g, " ")];

          if (validAnswers.includes(studentAns) || validAnswers.some((va) => va.length > 2 && studentAns.includes(va))) {
            isCorrect = true;
            awardedMarks = qMarks;
            earnedScore += qMarks;
            correctCount++;
          } else {
            isCorrect = false;
            wrongCount++;
          }
        } else if (qType === "MATCHING") {
          const studentPairs = typeof studentRawAns === "object" ? studentRawAns : {};
          const totalPairs = q.matching_pairs?.length || 1;
          let correctPairs = 0;

          q.matching_pairs?.forEach((p) => {
            if (studentPairs[p.left] && studentPairs[p.left].trim().toLowerCase() === p.right.trim().toLowerCase()) {
              correctPairs++;
            }
          });

          if (correctPairs === totalPairs) {
            isCorrect = true;
            awardedMarks = qMarks;
            earnedScore += qMarks;
            correctCount++;
          } else if (correctPairs > 0) {
            isCorrect = true;
            awardedMarks = Math.round((correctPairs / totalPairs) * qMarks);
            earnedScore += awardedMarks;
            correctCount++;
          } else {
            isCorrect = false;
            wrongCount++;
          }
        } else if (qType === "CODING") {
          const studentCode = String(studentRawAns).trim();
          if (studentCode.length > 25 && !studentCode.includes("pass")) {
            // Auto-grade initial pass or mark for faculty review
            isCorrect = true;
            awardedMarks = qMarks;
            earnedScore += qMarks;
            correctCount++;
          } else {
            isCorrect = false;
            wrongCount++;
          }
        } else if (qType === "DESCRIPTIVE") {
          // Subjective question: marked for teacher evaluation
          isCorrect = null;
          awardedMarks = 0;
          evalStatus = "PENDING_TEACHER";
          pendingEvaluationCount++;
        }
      }

      evaluations.push({
        question_id: q.id,
        question_text: q.question,
        type: q.type,
        selected_answer: hasAnswered ? studentRawAns : null,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        marks_awarded: Math.max(0, awardedMarks),
        marks_possible: qMarks,
        explanation: q.explanation || "No explanation provided.",
        evaluation_status: evalStatus,
      });
    });

    const finalScore = Math.max(0, earnedScore);
    const percentage = asm.total_marks > 0 ? Math.round((finalScore / asm.total_marks) * 100) : 0;
    const passed = percentage >= asm.passing_threshold;

    const tabSwitches = Number(params.tabSwitchCount) || 0;
    let proctoringFlag: "CLEAN" | "SUSPICIOUS" | "VIOLATION" = "CLEAN";
    if (tabSwitches > 3 || (params.fullscreenExitCount && params.fullscreenExitCount > 3)) {
      proctoringFlag = "VIOLATION";
    } else if (tabSwitches > 0 || (params.fullscreenExitCount && params.fullscreenExitCount > 0)) {
      proctoringFlag = "SUSPICIOUS";
    }

    const nowIso = new Date().toISOString();
    const startedIso = params.startedAt || new Date(Date.now() - (params.timeSpentSeconds || 60) * 1000).toISOString();

    const attempt: AssessmentAttempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organization_id: "org-akash-01",
      assessment_id: asm.id,
      assessment_title: asm.title,
      student_email: params.studentEmail.toLowerCase().trim(),
      student_name: params.studentName.trim(),
      score: finalScore,
      total_marks: asm.total_marks,
      percentage,
      passed,
      correct_count: correctCount,
      wrong_count: wrongCount,
      unanswered_count: unansweredCount,
      pending_evaluation_count: pendingEvaluationCount,
      tab_switch_count: tabSwitches,
      fullscreen_exit_count: params.fullscreenExitCount || 0,
      proctoring_flag: proctoringFlag,
      time_spent_seconds: Math.max(1, params.timeSpentSeconds || 1),
      started_at: startedIso,
      submitted_at: nowIso,
      answers: params.answers,
      evaluations,
      status: pendingEvaluationCount > 0 ? "PENDING_MANUAL_REVIEW" : "EVALUATED",
    };

    this.attempts.unshift(attempt);
    saveAttemptsToDisk(this.attempts);
    return attempt;
  }

  public evaluateSubjectiveQuestion(params: {
    attemptId: string;
    questionId: string;
    marksAwarded?: number;
    awardedMarks?: number;
    teacherFeedback?: string;
    feedback?: string;
    teacherEmail?: string;
    evaluatorName?: string;
  }): AssessmentAttempt | null {
    this.attempts = loadAttemptsFromDisk();
    const idx = this.attempts.findIndex((a) => a.id === params.attemptId);
    if (idx === -1) return null;

    const att = this.attempts[idx];
    if (!att.evaluations) return null;

    const qEval = att.evaluations.find((e) => e.question_id === params.questionId);
    if (!qEval) return null;

    const rawMarks = params.marksAwarded !== undefined ? params.marksAwarded : params.awardedMarks;
    const feedbackText = params.teacherFeedback || params.feedback || "";
    const prevMarks = qEval.marks_awarded || 0;
    const newMarks = Math.min(qEval.marks_possible, Math.max(0, Number(rawMarks) || 0));
    qEval.marks_awarded = newMarks;
    qEval.is_correct = newMarks >= qEval.marks_possible / 2;
    qEval.teacher_feedback = feedbackText;
    (qEval as any).feedback = feedbackText;
    qEval.evaluation_status = "EVALUATED";

    att.score = Math.max(0, att.score - prevMarks + newMarks);
    att.percentage = att.total_marks > 0 ? Math.round((att.score / att.total_marks) * 100) : 0;
    const asm = this.getById(att.assessment_id, true);
    const passThreshold = asm?.passing_threshold || 70;
    att.passed = att.percentage >= passThreshold;

    const remainingPending = att.evaluations.filter((e) => e.evaluation_status === "PENDING_TEACHER").length;
    att.pending_evaluation_count = remainingPending;
    if (remainingPending === 0) {
      att.status = "EVALUATED";
    }

    this.attempts[idx] = att;
    saveAttemptsToDisk(this.attempts);
    return att;
  }

  public deleteAttempt(attemptId: string): boolean {
    this.attempts = loadAttemptsFromDisk();
    const idx = this.attempts.findIndex((a) => a.id === attemptId);
    if (idx === -1) return false;
    this.attempts.splice(idx, 1);
    saveAttemptsToDisk(this.attempts);
    return true;
  }
}

export const assessmentStore = new AssessmentStore();
