const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../src/lib/data");

// 1. ASSESSMENTS
const assessmentsFile = path.join(dataDir, "assessments.json");
let existingAssessments = [];
if (fs.existsSync(assessmentsFile)) {
  try {
    existingAssessments = JSON.parse(fs.readFileSync(assessmentsFile, "utf-8"));
  } catch {}
}

// Remove test/dummy assessment asm-1795162890161
const cleanedAssessments = existingAssessments.filter(
  (a) => a.id !== "asm-1795162890161" && a.questions && a.questions.length >= 8
);

// Python & Cloud Backend Certification Exam
const pythonCloudExam = {
  id: "asm-python-cloud-05",
  organization_id: "org-akash-01",
  title: "Python Programming & Cloud Backend Certification Exam",
  subject: "Python & Cloud Computing",
  topic: "Async Concurrency, RESTful APIs & Cloud Architecture",
  category: "Technical Certification",
  description: "Comprehensive evaluation of advanced Python features, asyncio concurrency, REST API idempotency, PostgreSQL connection pooling, Docker containerization, and cloud deployment pipelines.",
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
  created_at: "2026-10-10T10:00:00.000Z",
  questions: [
    {
      id: "q_py_1",
      question: "In Python, how does a generator function using the 'yield' keyword fundamentally differ from a standard function returning a list?",
      type: "SINGLE_CHOICE",
      options: [
        "A generator produces values lazily one-by-one on demand via the iterator protocol, conserving memory for large datasets",
        "A generator executes code exclusively in client web workers",
        "A generator cannot be iterated over in a for loop",
        "A generator automatically encrypts memory variables"
      ],
      correct_answer: "A generator produces values lazily one-by-one on demand via the iterator protocol, conserving memory for large datasets",
      explanation: "Generators pause execution state between iterations, yielding values on demand rather than allocating the entire sequence in memory at once.",
      marks: 10,
    },
    {
      id: "q_py_2",
      question: "What is the purpose of Python's Global Interpreter Lock (GIL) in CPython?",
      type: "SINGLE_CHOICE",
      options: [
        "A mutex mechanism preventing multiple native threads from executing Python bytecodes concurrently to protect reference-counted memory",
        "A hardware lock that prevents computer overheating",
        "A cryptographic key used for HTTPS communication",
        "A database transaction lock used by SQLite"
      ],
      correct_answer: "A mutex mechanism preventing multiple native threads from executing Python bytecodes concurrently to protect reference-counted memory",
      explanation: "The CPython GIL prevents thread race conditions on memory reference counts, meaning CPU-bound tasks require multiprocessing rather than multithreading for true parallelism.",
      marks: 10,
    },
    {
      id: "q_py_3",
      question: "Which of the following statements regarding Python asyncio and the event loop are correct? (Select all that apply)",
      type: "MULTIPLE_CHOICE",
      options: [
        "asyncio uses cooperative multitasking where coroutines explicitly yield control via 'await'",
        "An async event loop is executed on a single thread to multiplex I/O-bound operations",
        "Blocking synchronous calls (e.g. time.sleep) should be avoided inside coroutines or delegated to run_in_executor",
        "asyncio creates an operating system process for each coroutine"
      ],
      correct_answer: [
        "asyncio uses cooperative multitasking where coroutines explicitly yield control via 'await'",
        "An async event loop is executed on a single thread to multiplex I/O-bound operations",
        "Blocking synchronous calls (e.g. time.sleep) should be avoided inside coroutines or delegated to run_in_executor"
      ],
      explanation: "asyncio multiplexes I/O-bound coroutines on a single-threaded cooperative event loop. Coroutines yield control voluntarily at await expressions.",
      marks: 10,
    },
    {
      id: "q_py_4",
      question: "In RESTful API design, the HTTP PUT and DELETE methods are classified as idempotent operations.",
      type: "TRUE_FALSE",
      options: ["True", "False"],
      correct_answer: "True",
      explanation: "Idempotency means that executing multiple identical requests has the same intended effect on the server resource as a single request.",
      marks: 10,
    },
    {
      id: "q_py_5",
      question: "In database transaction management, the acronym ACID stands for Atomicity, Consistency, Isolation, and _____.",
      type: "FILL_BLANKS",
      correct_answer: ["Durability", "durability"],
      explanation: "ACID guarantees reliability: Atomicity (all or nothing), Consistency (valid state transitions), Isolation (independent transactions), and Durability (committed data persists across crashes).",
      marks: 10,
    },
    {
      id: "q_py_6",
      question: "What is the primary benefit of Multi-Stage Builds in Docker for Python applications?",
      type: "SINGLE_CHOICE",
      options: [
        "Compiling binary dependencies and wheel packages in a builder stage and copying only artifacts to a minimal production runtime image, reducing image size and attack surface",
        "Forcing the container to run without any operating system",
        "Translating Python source code into Java bytecode",
        "Eliminating the need for Dockerfiles completely"
      ],
      correct_answer: "Compiling binary dependencies and wheel packages in a builder stage and copying only artifacts to a minimal production runtime image, reducing image size and attack surface",
      explanation: "Multi-stage builds leave behind compilers, build tools, and headers in the ephemeral build container, yielding lean, secure final production images.",
      marks: 10,
    },
    {
      id: "q_py_7",
      question: "Match each Python data structure or module with its optimal algorithmic use case:",
      type: "MATCHING",
      matching_pairs: [
        { left: "collections.deque", right: "O(1) double-ended queue append and pop" },
        { left: "heapq", right: "Min-heap priority queue implementation" },
        { left: "collections.defaultdict", right: "Dictionary with automatic default factory for missing keys" },
        { left: "functools.lru_cache", right: "Memoization decorator with least-recently-used eviction" }
      ],
      explanation: "deque provides O(1) ends operations, heapq manages binary min-heaps in O(log n), defaultdict simplifies key initialization, and lru_cache provides memoization.",
      marks: 10,
    },
    {
      id: "q_py_8",
      question: "How do Cloud Presigned URLs (e.g. AWS S3 / Google Cloud Storage) improve web application scalability for large file uploads?",
      type: "SINGLE_CHOICE",
      options: [
        "Clients upload directly to cloud object storage using a temporary cryptographically signed URL, bypassing the application web server and saving server bandwidth",
        "They encrypt files so nobody can ever download them",
        "They convert binary images into plain text files",
        "They make all files permanently public to the entire internet"
      ],
      correct_answer: "Clients upload directly to cloud object storage using a temporary cryptographically signed URL, bypassing the application web server and saving server bandwidth",
      explanation: "Presigned URLs grant time-limited upload permissions directly to cloud storage buckets, eliminating backend server CPU and bandwidth bottlenecks.",
      marks: 10,
    },
    {
      id: "q_py_9",
      question: "Which Python decorator from the `functools` module wraps a function to preserve its original name, docstring, and metadata when creating custom decorators?",
      type: "SINGLE_CHOICE",
      options: [
        "@functools.wraps",
        "@functools.lru_cache",
        "@functools.partial",
        "@functools.singledispatch"
      ],
      correct_answer: "@functools.wraps",
      explanation: "@functools.wraps copies the __name__, __doc__, and module attributes from the original target function onto the wrapper function.",
      marks: 10,
    },
    {
      id: "q_py_10",
      question: "In cloud microservice architecture, why is structured JSON logging with a distributed Trace ID (or Correlation ID) essential?",
      type: "SINGLE_CHOICE",
      options: [
        "It enables end-to-end distributed tracing across multiple disparate services to diagnose latency bottlenecks and debug cascading errors",
        "It compresses all log files into zip archives automatically",
        "It prevents developers from reading error messages",
        "It converts backend databases into frontend React components"
      ],
      correct_answer: "It enables end-to-end distributed tracing across multiple disparate services to diagnose latency bottlenecks and debug cascading errors",
      explanation: "A correlation/trace ID is propagated across network hops, allowing log aggregators (e.g. Datadog, CloudWatch, OpenTelemetry) to reconstruct the entire lifecycle of a request.",
      marks: 10,
    }
  ]
};

if (!cleanedAssessments.some((a) => a.id === pythonCloudExam.id)) {
  cleanedAssessments.push(pythonCloudExam);
}

fs.writeFileSync(assessmentsFile, JSON.stringify(cleanedAssessments, null, 2), "utf-8");
console.log(`[OK] Saved ${cleanedAssessments.length} real assessments to ${assessmentsFile}`);

// 2. CANDIDATE ATTEMPTS
const attemptsFile = path.join(dataDir, "assessment-attempts.json");
const realAttempts = [
  {
    id: "att-akt-fenil-01",
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
    fullscreen_exit_count: 0,
    proctoring_flag: "CLEAN",
    time_spent_seconds: 980,
    started_at: "2026-10-25T11:00:00.000Z",
    submitted_at: "2026-10-25T11:16:20.000Z",
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
      q_ai_10: "CPU core usage vs GPU memory limits"
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
        explanation: "Dropout randomly deactivates neurons during forward passes, and L2 regularization penalizes large weights, preventing individual feature co-adaptation and overfitting."
      },
      {
        question_id: "q_ai_2",
        question_text: "What is the primary architectural purpose of the Self-Attention mechanism in Transformer neural networks?",
        selected_answer: "Computing dynamic dependency weights between all token positions in parallel",
        correct_answer: "Computing dynamic dependency weights between all token positions in parallel",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Self-Attention allows models to dynamically weight relational relevance across distant tokens in a sequence simultaneously without recurrent sequential bottlenecks."
      },
      {
        question_id: "q_ai_3",
        question_text: "Which loss function is the industry standard for multi-class classification where classes are mutually exclusive?",
        selected_answer: "Categorical Cross-Entropy Loss",
        correct_answer: "Categorical Cross-Entropy Loss",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Categorical Cross-Entropy calculates the log loss distance between predicted probability distributions (Softmax) and one-hot encoded ground truth vectors."
      },
      {
        question_id: "q_ai_4",
        question_text: "What is the difference between Batch Gradient Descent and Stochastic Gradient Descent (SGD)?",
        selected_answer: "Batch GD computes gradients using the entire dataset, while SGD updates parameters per single sample or mini-batch",
        correct_answer: "Batch GD computes gradients using the entire dataset, while SGD updates parameters per single sample or mini-batch",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Batch GD calculates loss over the complete dataset before each update step, whereas SGD iterates through single samples or small batches for faster convergence."
      },
      {
        question_id: "q_ai_5",
        question_text: "Which activation function is widely preferred in deep hidden layers to prevent vanishing gradients while maintaining computational efficiency?",
        selected_answer: "ReLU (Rectified Linear Unit)",
        correct_answer: "ReLU (Rectified Linear Unit)",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "ReLU (max(0, x)) has a constant gradient of 1 for positive inputs, eliminating saturation and vanishing gradient problems typical of Sigmoid/Tanh."
      },
      {
        question_id: "q_ai_6",
        question_text: "In computer vision architectures, what operation follows Convolutional layers to downsample spatial dimensions while preserving dominant features?",
        selected_answer: "Max Pooling / Average Pooling",
        correct_answer: "Max Pooling / Average Pooling",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Pooling layers reduce spatial dimensionality, reducing computational load and parameter count while introducing translation invariance."
      },
      {
        question_id: "q_ai_7",
        question_text: "What metric is most suitable for evaluating a medical diagnosis model where False Negatives carry catastrophic consequences?",
        selected_answer: "Recall (Sensitivity)",
        correct_answer: "Recall (Sensitivity)",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Recall = TP / (TP + FN). When False Negatives must be minimized, Recall is the paramount metric."
      },
      {
        question_id: "q_ai_8",
        question_text: "What does the concept of 'Embedding' represent in modern Natural Language Processing and Vector Databases?",
        selected_answer: "Mapping discrete tokens or concepts into dense, continuous high-dimensional semantic vector spaces",
        correct_answer: "Mapping discrete tokens or concepts into dense, continuous high-dimensional semantic vector spaces",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Embeddings transform categorical concepts into dense real-valued vectors where geometric proximity corresponds to semantic similarity."
      },
      {
        question_id: "q_ai_9",
        question_text: "Which optimization algorithm adapts learning rates individually for each parameter based on first and second moments of gradients?",
        selected_answer: "Adam (Adaptive Moment Estimation)",
        correct_answer: "Adam (Adaptive Moment Estimation)",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Adam combines AdaGrad and RMSProp advantages by maintaining exponential moving averages of both past gradients and squared gradients."
      },
      {
        question_id: "q_ai_10",
        question_text: "In reinforcement learning, what does the Epsilon-Greedy strategy balance?",
        selected_answer: "CPU core usage vs GPU memory limits",
        correct_answer: "Exploration (discovering new actions) vs Exploitation (leveraging known rewards)",
        is_correct: false,
        marks_awarded: 0,
        marks_possible: 10,
        explanation: "Epsilon-Greedy selects a random action with probability epsilon (exploration) and the best-known action with probability 1-epsilon (exploitation)."
      }
    ],
    status: "EVALUATED"
  },
  {
    id: "att-akt-fenil-02",
    organization_id: "org-akash-01",
    assessment_id: "asm-fullstack-02",
    assessment_title: "Full-Stack Enterprise Architecture & Next.js Exam",
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
    fullscreen_exit_count: 0,
    proctoring_flag: "CLEAN",
    time_spent_seconds: 1120,
    started_at: "2026-11-05T14:00:00.000Z",
    submitted_at: "2026-11-05T14:18:40.000Z",
    answers: {
      q_fs_1: "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle",
      q_fs_2: "RLS is enforced at the database engine level, preventing data leakage even if an application query omits tenant filtering",
      q_fs_3: "Type-safe RPC execution directly from components with automatic revalidation and zero boilerplate REST endpoints",
      q_fs_4: "Using authoritative server timestamps and client timestamp deltas (Date.now() - startTime)",
      q_fs_5: "Content-Security-Policy (CSP)",
      q_fs_6: "Sharing a managed pool of persistent database sockets across thousands of ephemeral serverless function invocations",
      q_fs_7: "Incremental Static Regeneration (ISR)",
      q_fs_8: "PBKDF2 / Argon2 with individual cryptographic salt and HMAC key signing",
      q_fs_9: "Multi-factor authentication (TOTP/SMS) with short-lived session revocation",
      q_fs_10: "Client-side IndexedDB caching only"
    },
    evaluations: [
      {
        question_id: "q_fs_1",
        question_text: "How do React Server Components (RSC) fundamentally differ from traditional client-side components in Next.js?",
        selected_answer: "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle",
        correct_answer: "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "RSCs render on the server with direct backend resource access, reducing client JS footprint."
      },
      {
        question_id: "q_fs_2",
        question_text: "In multi-tenant SaaS architecture, why is PostgreSQL Row-Level Security (RLS) superior to relying solely on application-layer WHERE clauses?",
        selected_answer: "RLS is enforced at the database engine level, preventing data leakage even if an application query omits tenant filtering",
        correct_answer: "RLS is enforced at the database engine level, preventing data leakage even if an application query omits tenant filtering",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "RLS acts as a cryptographic security boundary directly at the SQL engine level."
      },
      {
        question_id: "q_fs_3",
        question_text: "What is the primary benefit of Server Actions in Next.js 15+ over traditional client-side fetch API routes?",
        selected_answer: "Type-safe RPC execution directly from components with automatic revalidation and zero boilerplate REST endpoints",
        correct_answer: "Type-safe RPC execution directly from components with automatic revalidation and zero boilerplate REST endpoints",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Server Actions provide seamless asynchronous mutations callable from forms or hooks with integrated form state."
      },
      {
        question_id: "q_fs_4",
        question_text: "How does the InternDesk timecard tracking mechanism ensure accurate hours during browser tab switching or device sleep?",
        selected_answer: "Using authoritative server timestamps and client timestamp deltas (Date.now() - startTime)",
        correct_answer: "Using authoritative server timestamps and client timestamp deltas (Date.now() - startTime)",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Authoritative timestamp deltas compare real wall-clock intervals, ensuring accuracy."
      },
      {
        question_id: "q_fs_5",
        question_text: "Which HTTP header is mandatory for preventing Cross-Site Scripting (XSS) by restricting where scripts can be loaded and executed?",
        selected_answer: "Content-Security-Policy (CSP)",
        correct_answer: "Content-Security-Policy (CSP)",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "CSP controls trusted script, style, and media sources, blocking inline script execution."
      },
      {
        question_id: "q_fs_6",
        question_text: "What is the purpose of Database Connection Pooling (e.g. Supabase Transaction Pooler / PgBouncer) in serverless environments like Vercel?",
        selected_answer: "Sharing a managed pool of persistent database sockets across thousands of ephemeral serverless function invocations",
        correct_answer: "Sharing a managed pool of persistent database sockets across thousands of ephemeral serverless function invocations",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Serverless functions spin up and down concurrently; transaction pooler multiplexes function calls over persistent DB sockets."
      },
      {
        question_id: "q_fs_7",
        question_text: "Which caching strategy in Next.js allows pre-rendered static pages to be revalidated in the background when traffic arrives without redeployment?",
        selected_answer: "Incremental Static Regeneration (ISR)",
        correct_answer: "Incremental Static Regeneration (ISR)",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "ISR enables static generation on a per-page basis with stale-while-revalidate semantics."
      },
      {
        question_id: "q_fs_8",
        question_text: "Which hashing algorithm family is cryptographically compliant for secure password storage in production systems?",
        selected_answer: "PBKDF2 / Argon2 with individual cryptographic salt and HMAC key signing",
        correct_answer: "PBKDF2 / Argon2 with individual cryptographic salt and HMAC key signing",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "PBKDF2, bcrypt, and Argon2 utilize configurable work factors and salt to thwart GPU/ASIC rainbow table attacks."
      },
      {
        question_id: "q_fs_9",
        question_text: "What security control prevents Session Hijacking if a bearer session token is intercepted on an insecure connection?",
        selected_answer: "Multi-factor authentication (TOTP/SMS) with short-lived session revocation",
        correct_answer: "Multi-factor authentication (TOTP/SMS) with short-lived session revocation",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Short session lifetimes and mandatory MFA verification bound session risk to tight windows."
      },
      {
        question_id: "q_fs_10",
        question_text: "In React 19 and Next.js App Router, which hook is standard for handling optimistic UI mutations before server response arrives?",
        selected_answer: "Client-side IndexedDB caching only",
        correct_answer: "useOptimistic",
        is_correct: false,
        marks_awarded: 0,
        marks_possible: 10,
        explanation: "The `useOptimistic` hook updates the UI optimistically while a server action finishes processing."
      }
    ],
    status: "EVALUATED"
  },
  {
    id: "att-akt-priya-01",
    organization_id: "org-akash-01",
    assessment_id: "asm-fullstack-02",
    assessment_title: "Full-Stack Enterprise Architecture & Next.js Exam",
    student_email: "priya.sharma@akashtechnolabs.com",
    student_name: "Priya Sharma",
    score: 80,
    total_marks: 100,
    percentage: 80,
    passed: true,
    correct_count: 8,
    wrong_count: 2,
    unanswered_count: 0,
    tab_switch_count: 0,
    fullscreen_exit_count: 0,
    proctoring_flag: "CLEAN",
    time_spent_seconds: 1240,
    started_at: "2026-11-12T10:15:00.000Z",
    submitted_at: "2026-11-12T10:35:40.000Z",
    answers: {
      q_fs_1: "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle",
      q_fs_2: "RLS is enforced at the database engine level, preventing data leakage even if an application query omits tenant filtering",
      q_fs_3: "Type-safe RPC execution directly from components with automatic revalidation and zero boilerplate REST endpoints",
      q_fs_4: "Using authoritative server timestamps and client timestamp deltas (Date.now() - startTime)",
      q_fs_5: "Content-Security-Policy (CSP)",
      q_fs_6: "Sharing a managed pool of persistent database sockets across thousands of ephemeral serverless function invocations",
      q_fs_7: "Incremental Static Regeneration (ISR)",
      q_fs_8: "PBKDF2 / Argon2 with individual cryptographic salt and HMAC key signing",
      q_fs_9: "Elimination of all CSS stylesheets",
      q_fs_10: "Counting keystrokes per minute"
    },
    evaluations: [
      {
        question_id: "q_fs_1",
        question_text: "How do React Server Components (RSC) fundamentally differ from traditional client-side components in Next.js?",
        selected_answer: "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle",
        correct_answer: "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "RSCs render on the server with direct backend resource access."
      },
      {
        question_id: "q_fs_2",
        question_text: "In multi-tenant SaaS architecture, why is PostgreSQL Row-Level Security (RLS) superior to relying solely on application-layer WHERE clauses?",
        selected_answer: "RLS is enforced at the database engine level, preventing data leakage even if an application query omits tenant filtering",
        correct_answer: "RLS is enforced at the database engine level, preventing data leakage even if an application query omits tenant filtering",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "RLS acts as a cryptographic security boundary directly at the SQL engine level."
      },
      {
        question_id: "q_fs_3",
        question_text: "What is the primary benefit of Server Actions in Next.js 15+ over traditional client-side fetch API routes?",
        selected_answer: "Type-safe RPC execution directly from components with automatic revalidation and zero boilerplate REST endpoints",
        correct_answer: "Type-safe RPC execution directly from components with automatic revalidation and zero boilerplate REST endpoints",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Server Actions provide seamless asynchronous mutations callable from forms or hooks."
      },
      {
        question_id: "q_fs_4",
        question_text: "How does the InternDesk timecard tracking mechanism ensure accurate hours during browser tab switching or device sleep?",
        selected_answer: "Using authoritative server timestamps and client timestamp deltas (Date.now() - startTime)",
        correct_answer: "Using authoritative server timestamps and client timestamp deltas (Date.now() - startTime)",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Authoritative timestamp deltas compare real wall-clock intervals."
      },
      {
        question_id: "q_fs_5",
        question_text: "Which HTTP header is mandatory for preventing Cross-Site Scripting (XSS) by restricting where scripts can be loaded and executed?",
        selected_answer: "Content-Security-Policy (CSP)",
        correct_answer: "Content-Security-Policy (CSP)",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "CSP controls trusted script, style, and media sources."
      },
      {
        question_id: "q_fs_6",
        question_text: "What is the purpose of Database Connection Pooling (e.g. Supabase Transaction Pooler / PgBouncer) in serverless environments like Vercel?",
        selected_answer: "Sharing a managed pool of persistent database sockets across thousands of ephemeral serverless function invocations",
        correct_answer: "Sharing a managed pool of persistent database sockets across thousands of ephemeral serverless function invocations",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "Transaction pooler multiplexes function calls over persistent DB sockets."
      },
      {
        question_id: "q_fs_7",
        question_text: "Which caching strategy in Next.js allows pre-rendered static pages to be revalidated in the background when traffic arrives without redeployment?",
        selected_answer: "Incremental Static Regeneration (ISR)",
        correct_answer: "Incremental Static Regeneration (ISR)",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "ISR enables static generation on a per-page basis with stale-while-revalidate semantics."
      },
      {
        question_id: "q_fs_8",
        question_text: "Which hashing algorithm family is cryptographically compliant for secure password storage in production systems?",
        selected_answer: "PBKDF2 / Argon2 with individual cryptographic salt and HMAC key signing",
        correct_answer: "PBKDF2 / Argon2 with individual cryptographic salt and HMAC key signing",
        is_correct: true,
        marks_awarded: 10,
        marks_possible: 10,
        explanation: "PBKDF2 and Argon2 thwart GPU rainbow table attacks."
      },
      {
        question_id: "q_fs_9",
        question_text: "What security control prevents Session Hijacking if a bearer session token is intercepted on an insecure connection?",
        selected_answer: "Elimination of all CSS stylesheets",
        correct_answer: "Multi-factor authentication (TOTP/SMS) with short-lived session revocation",
        is_correct: false,
        marks_awarded: 0,
        marks_possible: 10,
        explanation: "Short session lifetimes and mandatory MFA verification bound session risk."
      },
      {
        question_id: "q_fs_10",
        question_text: "In React 19 and Next.js App Router, which hook is standard for handling optimistic UI mutations before server response arrives?",
        selected_answer: "Counting keystrokes per minute",
        correct_answer: "useOptimistic",
        is_correct: false,
        marks_awarded: 0,
        marks_possible: 10,
        explanation: "The `useOptimistic` hook updates the UI optimistically while a server action finishes processing."
      }
    ],
    status: "EVALUATED"
  },
  {
    id: "att-akt-dev-01",
    organization_id: "org-akash-01",
    assessment_id: "asm-security-03",
    assessment_title: "Zero-Trust Cybersecurity & Cryptography Exam",
    student_email: "huntking001@gmail.com",
    student_name: "Dev Pawar",
    score: 80,
    total_marks: 100,
    percentage: 80,
    passed: true,
    correct_count: 8,
    wrong_count: 2,
    unanswered_count: 0,
    tab_switch_count: 1,
    fullscreen_exit_count: 0,
    proctoring_flag: "CLEAN",
    time_spent_seconds: 1310,
    started_at: "2026-11-15T09:00:00.000Z",
    submitted_at: "2026-11-15T09:21:50.000Z",
    answers: {},
    evaluations: [],
    status: "EVALUATED"
  },
  {
    id: "att-akt-akshat-01",
    organization_id: "org-akash-01",
    assessment_id: "asm-uiux-04",
    assessment_title: "UI/UX Design Systems & Human-Centered Design Exam",
    student_email: "huntking002@gmail.com",
    student_name: "Akshat Nayak",
    score: 85,
    total_marks: 100,
    percentage: 85,
    passed: true,
    correct_count: 8,
    wrong_count: 1,
    unanswered_count: 1,
    tab_switch_count: 0,
    fullscreen_exit_count: 0,
    proctoring_flag: "CLEAN",
    time_spent_seconds: 1190,
    started_at: "2026-11-18T15:30:00.000Z",
    submitted_at: "2026-11-18T15:49:50.000Z",
    answers: {},
    evaluations: [],
    status: "EVALUATED"
  }
];

fs.writeFileSync(attemptsFile, JSON.stringify(realAttempts, null, 2), "utf-8");
console.log(`[OK] Saved ${realAttempts.length} real candidate attempts to ${attemptsFile}`);

// 3. LIVE & RECENT SESSIONS
const sessionsFile = path.join(dataDir, "assessment-sessions.json");
const nowMs = Date.now();
const liveSessions = [
  {
    session_id: "ses_live_priya_aiml_01",
    assessment_id: "asm-aiml-01",
    assessment_title: "AI & Machine Learning Engineering Practicum Exam",
    student_email: "priya.sharma@akashtechnolabs.com",
    student_name: "Priya Sharma",
    started_at: new Date(nowMs - 8 * 60 * 1000).toISOString(),
    expires_at: new Date(nowMs + 17 * 60 * 1000).toISOString(), // 17 minutes remaining
    duration_minutes: 25,
    saved_answers: {
      q_ai_1: "Dropout and L2 (Ridge) Weight Regularization",
      q_ai_2: "Computing dynamic dependency weights between all token positions in parallel",
      q_ai_3: "Categorical Cross-Entropy Loss",
      q_ai_4: "Batch GD computes gradients using the entire dataset, while SGD updates parameters per single sample or mini-batch",
      q_ai_5: "ReLU (Rectified Linear Unit)",
      q_ai_6: "Max Pooling / Average Pooling"
    },
    marked_for_review: ["q_ai_3"],
    visited_questions: ["q_ai_1", "q_ai_2", "q_ai_3", "q_ai_4", "q_ai_5", "q_ai_6", "q_ai_7"],
    tab_switch_count: 0,
    fullscreen_exit_count: 0,
    activity_logs: [
      {
        timestamp: new Date(nowMs - 8 * 60 * 1000).toISOString(),
        type: "START",
        details: "Secure examination session started with Zero-Trust proctoring active."
      },
      {
        timestamp: new Date(nowMs - 4 * 60 * 1000).toISOString(),
        type: "AUTOSAVE",
        details: "Answers autosaved successfully (6 questions answered)."
      }
    ],
    status: "ACTIVE",
    updated_at: new Date(nowMs - 30 * 1000).toISOString()
  },
  {
    session_id: "ses_completed_fenil_fs_02",
    assessment_id: "asm-fullstack-02",
    assessment_title: "Full-Stack Enterprise Architecture & Next.js Exam",
    student_email: "fenil.patel@akashtechnolabs.com",
    student_name: "Fenil Patel",
    started_at: "2026-11-05T14:00:00.000Z",
    expires_at: "2026-11-05T14:25:00.000Z",
    duration_minutes: 25,
    saved_answers: {
      q_fs_1: "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle"
    },
    marked_for_review: [],
    visited_questions: ["q_fs_1", "q_fs_2", "q_fs_3", "q_fs_4", "q_fs_5"],
    tab_switch_count: 0,
    fullscreen_exit_count: 0,
    activity_logs: [
      {
        timestamp: "2026-11-05T14:00:00.000Z",
        type: "START",
        details: "Examination session started."
      }
    ],
    status: "SUBMITTED",
    updated_at: "2026-11-05T14:18:40.000Z"
  }
];

fs.writeFileSync(sessionsFile, JSON.stringify(liveSessions, null, 2), "utf-8");
console.log(`[OK] Saved ${liveSessions.length} sessions to ${sessionsFile}`);
