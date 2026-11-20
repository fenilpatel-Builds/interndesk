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

// 2. CANDIDATE ATTEMPTS - Fresh slate ready for real candidate submissions
const attemptsFile = path.join(dataDir, "assessment-attempts.json");
const realAttempts = [];

fs.writeFileSync(attemptsFile, JSON.stringify(realAttempts, null, 2), "utf-8");
console.log(`[OK] Saved ${realAttempts.length} real candidate attempts to ${attemptsFile}`);

// 3. LIVE & RECENT SESSIONS
const sessionsFile = path.join(dataDir, "assessment-sessions.json");
const nowMs = Date.now();
const liveSessions = [
  {
    session_id: "ses_live_helly_uiux_01",
    assessment_id: "asm-uiux-04",
    assessment_title: "UI/UX Design Systems & Human-Centered Design Exam",
    student_email: "hellyleuva.29@gmail.com",
    student_name: "Helly Leuva",
    started_at: new Date(nowMs - 5 * 60 * 1000).toISOString(),
    expires_at: new Date(nowMs + 20 * 60 * 1000).toISOString(),
    duration_minutes: 25,
    saved_answers: {},
    marked_for_review: [],
    visited_questions: ["q_uiux_1"],
    tab_switch_count: 0,
    fullscreen_exit_count: 0,
    activity_logs: [
      {
        timestamp: new Date(nowMs - 5 * 60 * 1000).toISOString(),
        type: "START",
        details: "Secure examination session started with Zero-Trust proctoring active."
      }
    ],
    status: "ACTIVE",
    updated_at: new Date(nowMs - 1 * 60 * 1000).toISOString()
  }
];

fs.writeFileSync(sessionsFile, JSON.stringify(liveSessions, null, 2), "utf-8");
console.log(`[OK] Saved ${liveSessions.length} sessions to ${sessionsFile}`);
