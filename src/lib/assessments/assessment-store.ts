import fs from "fs";
import path from "path";
import { resolveDataFilePath } from "../data/storage-path";
import { isUserAdmin } from "../auth/admin-whitelist";

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: "SINGLE_CHOICE" | "TRUE_FALSE";
  options: string[];
  correct_answer: string;
  explanation: string;
  marks: number;
}

export interface Assessment {
  id: string;
  organization_id: string;
  title: string;
  subject: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
  passing_threshold: number; // percentage, e.g. 70
  attempt_limit: number;
  status: "PUBLISHED" | "DRAFT" | "CLOSED";
  questions: AssessmentQuestion[];
  created_at: string;
  updated_at?: string;
}

export interface QuestionEvaluation {
  question_id: string;
  question_text: string;
  selected_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  marks_awarded: number;
  marks_possible: number;
  explanation: string;
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
  tab_switch_count: number;
  proctoring_flag: "CLEAN" | "SUSPICIOUS" | "VIOLATION";
  time_spent_seconds: number;
  started_at: string;
  submitted_at: string;
  answers: Record<string, string>;
  evaluations?: QuestionEvaluation[];
}

const SEED_ASSESSMENTS: Assessment[] = [
  {
    id: "asm-aiml-01",
    organization_id: "org-akash-01",
    title: "AI & Machine Learning Engineering Practicum Exam",
    subject: "AI & Machine Learning",
    description: "Evaluates machine learning algorithms, deep neural network architectures, model overfitting mitigation, loss functions, and tensor mathematical operations.",
    duration_minutes: 25,
    total_marks: 100,
    passing_threshold: 70,
    attempt_limit: 2,
    status: "PUBLISHED",
    created_at: "2026-10-01T10:00:00.000Z",
    questions: [
      {
        id: "q_ai_1",
        question: "In Supervised Learning, which technique is specifically designed to prevent deep neural networks from overfitting on training data?",
        type: "SINGLE_CHOICE",
        options: [
          "Dropout and L2 (Ridge) Weight Regularization",
          "Increasing the number of fully connected hidden layers",
          "Removing validation dataset splits",
          "Setting learning rate to infinity"
        ],
        correct_answer: "Dropout and L2 (Ridge) Weight Regularization",
        explanation: "Dropout randomly deactivates neurons during forward passes, and L2 regularization penalizes large weights, preventing individual feature co-adaptation and overfitting.",
        marks: 10,
      },
      {
        id: "q_ai_2",
        question: "What is the primary architectural purpose of the Self-Attention mechanism in Transformer neural networks?",
        type: "SINGLE_CHOICE",
        options: [
          "Computing dynamic dependency weights between all token positions in parallel",
          "Encrypting token vectors for database storage",
          "Replacing matrix multiplication with integer division",
          "Converting audio streams into text without tokenization"
        ],
        correct_answer: "Computing dynamic dependency weights between all token positions in parallel",
        explanation: "Self-Attention allows models to dynamically weight relational relevance across distant tokens in a sequence simultaneously without recurrent sequential bottlenecks.",
        marks: 10,
      },
      {
        id: "q_ai_3",
        question: "Which loss function is the industry standard for multi-class classification where classes are mutually exclusive?",
        type: "SINGLE_CHOICE",
        options: [
          "Categorical Cross-Entropy Loss",
          "Mean Squared Error (MSE)",
          "Binary Hinge Loss",
          "Cosine Distance Loss"
        ],
        correct_answer: "Categorical Cross-Entropy Loss",
        explanation: "Categorical Cross-Entropy calculates the log loss distance between predicted probability distributions (Softmax) and one-hot encoded ground truth vectors.",
        marks: 10,
      },
      {
        id: "q_ai_4",
        question: "What is the difference between Batch Gradient Descent and Stochastic Gradient Descent (SGD)?",
        type: "SINGLE_CHOICE",
        options: [
          "Batch GD computes gradients using the entire dataset, while SGD updates parameters per single sample or mini-batch",
          "Batch GD is only used in quantum computers",
          "SGD requires zero hyperparameter tuning",
          "Batch GD cannot minimize convex functions"
        ],
        correct_answer: "Batch GD computes gradients using the entire dataset, while SGD updates parameters per single sample or mini-batch",
        explanation: "Batch GD calculates loss over the complete dataset before each update step, whereas SGD iterates through single samples or small batches for faster convergence and memory efficiency.",
        marks: 10,
      },
      {
        id: "q_ai_5",
        question: "Which activation function is widely preferred in deep hidden layers to prevent vanishing gradients while maintaining computational efficiency?",
        type: "SINGLE_CHOICE",
        options: [
          "ReLU (Rectified Linear Unit)",
          "Sigmoid",
          "Hyperbolic Tangent (Tanh)",
          "Step Function"
        ],
        correct_answer: "ReLU (Rectified Linear Unit)",
        explanation: "ReLU (max(0, x)) has a constant gradient of 1 for positive inputs, eliminating saturation and vanishing gradient problems typical of Sigmoid/Tanh.",
        marks: 10,
      },
      {
        id: "q_ai_6",
        question: "In computer vision architectures, what operation follows Convolutional layers to downsample spatial dimensions while preserving dominant features?",
        type: "SINGLE_CHOICE",
        options: [
          "Max Pooling / Average Pooling",
          "Fourier Transform",
          "Bitwise XOR Shift",
          "Vector Quantization"
        ],
        correct_answer: "Max Pooling / Average Pooling",
        explanation: "Pooling layers reduce spatial dimensionality (height and width), reducing computational load and parameter count while introducing translation invariance.",
        marks: 10,
      },
      {
        id: "q_ai_7",
        question: "What metric is most suitable for evaluating a medical diagnosis model where False Negatives carry catastrophic consequences?",
        type: "SINGLE_CHOICE",
        options: [
          "Recall (Sensitivity)",
          "Precision",
          "Accuracy",
          "Specificity only"
        ],
        correct_answer: "Recall (Sensitivity)",
        explanation: "Recall = TP / (TP + FN). When False Negatives must be minimized (e.g. failing to detect a critical disease), Recall is the paramount metric.",
        marks: 10,
      },
      {
        id: "q_ai_8",
        question: "What does the concept of 'Embedding' represent in modern Natural Language Processing and Vector Databases?",
        type: "SINGLE_CHOICE",
        options: [
          "Mapping discrete tokens or concepts into dense, continuous high-dimensional semantic vector spaces",
          "Compressing images into ZIP files",
          "Hardcoding word counts in alphabetical arrays",
          "Encrypting user passwords in SHA-256 strings"
        ],
        correct_answer: "Mapping discrete tokens or concepts into dense, continuous high-dimensional semantic vector spaces",
        explanation: "Embeddings transform categorical concepts into dense real-valued vectors where geometric proximity corresponds to semantic similarity.",
        marks: 10,
      },
      {
        id: "q_ai_9",
        question: "Which optimization algorithm adapts learning rates individually for each parameter based on first and second moments of gradients?",
        type: "SINGLE_CHOICE",
        options: [
          "Adam (Adaptive Moment Estimation)",
          "Vanilla Gradient Descent",
          "Genetic Algorithm",
          "Simulated Annealing"
        ],
        correct_answer: "Adam (Adaptive Moment Estimation)",
        explanation: "Adam combines AdaGrad and RMSProp advantages by maintaining exponential moving averages of both past gradients (momentum) and squared gradients.",
        marks: 10,
      },
      {
        id: "q_ai_10",
        question: "In reinforcement learning, what does the Epsilon-Greedy strategy balance?",
        type: "SINGLE_CHOICE",
        options: [
          "Exploration (discovering new actions) vs Exploitation (leveraging known rewards)",
          "CPU core usage vs GPU memory limits",
          "Floating point precision vs Integer casting",
          "Database read transactions vs Write queries"
        ],
        correct_answer: "Exploration (discovering new actions) vs Exploitation (leveraging known rewards)",
        explanation: "Epsilon-Greedy selects a random action with probability epsilon (exploration) and the best-known action with probability 1-epsilon (exploitation).",
        marks: 10,
      },
    ],
  },
  {
    id: "asm-fullstack-02",
    organization_id: "org-akash-01",
    title: "Full-Stack Enterprise Architecture & Next.js Exam",
    subject: "Full-Stack Web Development",
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
        explanation: "Content-Security-Policy restricts executable script origins, inline scripts, and unauthorized domains, mitigating XSS vectors.",
        marks: 10,
      },
      {
        id: "q_fs_6",
        question: "What is the purpose of Database Connection Pooling (e.g. PgBouncer) in serverless environments like Vercel or AWS Lambda?",
        type: "SINGLE_CHOICE",
        options: [
          "Reusing database connections across ephemeral function invocations to avoid exhausting PostgreSQL connection limits",
          "Encrypting PDF documents before download",
          "Converting SQL queries into JSON files",
          "Bypassing user password authentication"
        ],
        correct_answer: "Reusing database connections across ephemeral function invocations to avoid exhausting PostgreSQL connection limits",
        explanation: "Serverless functions spawn and terminate rapidly. Without a connection pooler, thousands of simultaneous serverless lambdas can saturate the database max-connection threshold.",
        marks: 10,
      },
      {
        id: "q_fs_7",
        question: "What does the Next.js `generateStaticParams` function accomplish?",
        type: "SINGLE_CHOICE",
        options: [
          "Pre-renders dynamic segment routes at build time for instant static HTML serving",
          "Generates random passwords for admin users",
          "Compiles Tailwind CSS into raw Sass",
          "Validates user credit card information"
        ],
        correct_answer: "Pre-renders dynamic segment routes at build time for instant static HTML serving",
        explanation: "`generateStaticParams` works with dynamic route segments to statically generate routes at build time, improving performance and SEO.",
        marks: 10,
      },
      {
        id: "q_fs_8",
        question: "In RESTful API design, which HTTP method must be idempotent and used to replace an entire resource representation?",
        type: "SINGLE_CHOICE",
        options: [
          "PUT",
          "POST",
          "PATCH",
          "DELETE"
        ],
        correct_answer: "PUT",
        explanation: "PUT is designed to be idempotent: sending the identical request multiple times results in the same resource state, completely replacing the target entity.",
        marks: 10,
      },
      {
        id: "q_fs_9",
        question: "What does optimistic UI updates mean in modern frontend engineering?",
        type: "SINGLE_CHOICE",
        options: [
          "Immediately updating the user interface under the assumption the server mutation will succeed, then rolling back if an error occurs",
          "Showing cheerful animations while waiting for slow queries",
          "Disabling error notifications for users",
          "Always returning status 200 regardless of server errors"
        ],
        correct_answer: "Immediately updating the user interface under the assumption the server mutation will succeed, then rolling back if an error occurs",
        explanation: "Optimistic updates provide zero-latency perceptual responsiveness by updating the UI instantaneously while synchronizing in the background.",
        marks: 10,
      },
      {
        id: "q_fs_10",
        question: "What is the primary role of a JSON Web Token (JWT) signature?",
        type: "SINGLE_CHOICE",
        options: [
          "Verifying the payload has not been tampered with or modified in transit",
          "Encrypting the payload so it cannot be read by any client",
          "Compressing the token into fewer bytes",
          "Connecting the token directly to PostgreSQL"
        ],
        correct_answer: "Verifying the payload has not been tampered with or modified in transit",
        explanation: "A JWT signature is a cryptographic hash of the header and payload using a secret or private key, ensuring integrity and origin authenticity.",
        marks: 10,
      },
    ],
  },
  {
    id: "asm-security-03",
    organization_id: "org-akash-01",
    title: "Zero-Trust Cybersecurity & Cryptography Exam",
    subject: "Cybersecurity & Identity",
    description: "Evaluates cryptographic token verification, Two-Factor Authentication (TOTP), Role-Based Access Control (RBAC), and injection prevention.",
    duration_minutes: 20,
    total_marks: 100,
    passing_threshold: 75,
    attempt_limit: 2,
    status: "PUBLISHED",
    created_at: "2026-10-10T10:00:00.000Z",
    questions: [
      {
        id: "q_sec_1",
        question: "What is the core premise of Zero-Trust Network Architecture (ZTNA)?",
        type: "SINGLE_CHOICE",
        options: [
          "Never trust, always verify: every request must be authenticated, authorized, and validated regardless of network location",
          "Trust any connection originating from inside the office VPN",
          "Trust IP addresses if they belong to internal employees",
          "Disable authentication for internal microservices"
        ],
        correct_answer: "Never trust, always verify: every request must be authenticated, authorized, and validated regardless of network location",
        explanation: "Zero Trust eliminates perimeter-based trust, requiring continuous verification of identity, device health, and context for every transaction.",
        marks: 10,
      },
      {
        id: "q_sec_2",
        question: "In Two-Factor Authentication, how does a Time-Based One-Time Password (TOTP) generate valid 6-digit codes?",
        type: "SINGLE_CHOICE",
        options: [
          "Computing HMAC-SHA1 of a shared secret key and the current 30-second Unix epoch counter",
          "Generating random numbers on the client and texting them to the server",
          "Hashing the user's password repeatedly",
          "Relying on browser geolocation coordinates"
        ],
        correct_answer: "Computing HMAC-SHA1 of a shared secret key and the current 30-second Unix epoch counter",
        explanation: "TOTP (RFC 6238) computes HMAC(K, T) where K is a pre-shared cryptographic key and T is floor(current_time / 30), truncated to 6 digits.",
        marks: 10,
      },
      {
        id: "q_sec_3",
        question: "Which technique is the most effective safeguard against SQL Injection attacks?",
        type: "SINGLE_CHOICE",
        options: [
          "Parameterized queries and Prepared Statements",
          "Blacklisting specific keywords like 'OR' and 'DROP'",
          "Encoding database inputs in Base64",
          "Encrypting the database disk drive only"
        ],
        correct_answer: "Parameterized queries and Prepared Statements",
        explanation: "Prepared statements treat user input strictly as literals rather than executable SQL syntax, completely neutralising injection vectors.",
        marks: 10,
      },
      {
        id: "q_sec_4",
        question: "What does the Principle of Least Privilege dictate in access governance?",
        type: "SINGLE_CHOICE",
        options: [
          "Subjects are granted only the minimum permissions necessary to perform their assigned functions",
          "All registered users receive administrator privileges by default",
          "Permissions should only be reviewed once every five years",
          "System passwords must not exceed 6 characters"
        ],
        correct_answer: "Subjects are granted only the minimum permissions necessary to perform their assigned functions",
        explanation: "Least privilege minimizes damage from compromised credentials or accidents by ensuring entities hold only strictly essential permissions.",
        marks: 10,
      },
      {
        id: "q_sec_5",
        question: "Which cookie attributes provide maximum defense against Cross-Site Scripting (XSS) and Man-in-the-Middle (MitM) token theft?",
        type: "SINGLE_CHOICE",
        options: [
          "HttpOnly, Secure, and SameSite=Strict",
          "Domain=all, Path=root",
          "Expires=never, Max-Age=infinity",
          "SameSite=None with no SSL certificate"
        ],
        correct_answer: "HttpOnly, Secure, and SameSite=Strict",
        explanation: "HttpOnly blocks JavaScript `document.cookie` access (preventing XSS theft), Secure enforces HTTPS transmission, and SameSite=Strict mitigates CSRF.",
        marks: 10,
      },
      {
        id: "q_sec_6",
        question: "What is the difference between Symmetric and Asymmetric encryption?",
        type: "SINGLE_CHOICE",
        options: [
          "Symmetric encryption uses one shared secret key for both encryption and decryption; Asymmetric uses a public/private key pair",
          "Symmetric encryption cannot be decrypted once encrypted",
          "Asymmetric encryption is 10,000 times faster than symmetric",
          "Symmetric encryption is only used for audio files"
        ],
        correct_answer: "Symmetric encryption uses one shared secret key for both encryption and decryption; Asymmetric uses a public/private key pair",
        explanation: "Symmetric (e.g. AES-256) relies on a single shared key. Asymmetric (e.g. RSA, ECC) uses mathematically linked public and private keys.",
        marks: 10,
      },
      {
        id: "q_sec_7",
        question: "Why should cryptographic password hashing functions like Argon2, bcrypt, or PBKDF2 be used instead of MD5 or SHA-256 for user passwords?",
        type: "SINGLE_CHOICE",
        options: [
          "They include work factors (slowness) and salts to defend against high-speed GPU rainbow table and brute-force attacks",
          "SHA-256 cannot hash strings containing numbers",
          "Argon2 automatically emails passwords to users",
          "bcrypt decrypts passwords faster than MD5"
        ],
        correct_answer: "They include work factors (slowness) and salts to defend against high-speed GPU rainbow table and brute-force attacks",
        explanation: "Fast hash functions like SHA-256 can be computed billions of times per second on GPUs. Adaptive password hashes impose tunable CPU/memory costs that defeat brute force.",
        marks: 10,
      },
      {
        id: "q_sec_8",
        question: "What security vulnerability occurs when an application exposes a direct reference to an internal database key without verifying user ownership?",
        type: "SINGLE_CHOICE",
        options: [
          "Insecure Direct Object Reference (IDOR) / Broken Object-Level Authorization",
          "Buffer Overflow",
          "Denial of Service",
          "DNS Cache Poisoning"
        ],
        correct_answer: "Insecure Direct Object Reference (IDOR) / Broken Object-Level Authorization",
        explanation: "IDOR occurs when an application receives an object ID (e.g. `/api/documents?id=42`) and retrieves it without verifying if the requesting user has authorization.",
        marks: 10,
      },
      {
        id: "q_sec_9",
        question: "What is the purpose of a Nonce or State parameter in OAuth 2.0 / OpenID Connect authorization flows?",
        type: "SINGLE_CHOICE",
        options: [
          "Preventing Cross-Site Request Forgery (CSRF) and authorization code injection attacks",
          "Translating OAuth tokens into XML format",
          "Encrypting user profile pictures",
          "Bypassing Google reCAPTCHA gates"
        ],
        correct_answer: "Preventing Cross-Site Request Forgery (CSRF) and authorization code injection attacks",
        explanation: "The state/nonce binds the client's request to the authorization response, ensuring the returned code matches the browser session that initiated the flow.",
        marks: 10,
      },
      {
        id: "q_sec_10",
        question: "What does Perfect Forward Secrecy (PFS) ensure in TLS communication sessions?",
        type: "SINGLE_CHOICE",
        options: [
          "Compromise of the server's long-term private key will not compromise past recorded encrypted session traffic",
          "Passwords are never saved on the client machine",
          "SSL certificates never expire",
          "Packets are guaranteed to never be dropped by routers"
        ],
        correct_answer: "Compromise of the server's long-term private key will not compromise past recorded encrypted session traffic",
        explanation: "PFS generates unique ephemeral Diffie-Hellman session keys for each connection. Even if an adversary steals the private key later, historical traffic cannot be decrypted.",
        marks: 10,
      },
    ],
  },
  {
    id: "asm-uiux-04",
    organization_id: "org-akash-01",
    title: "UI/UX Design Systems & Human-Centered Design Exam",
    subject: "UI/UX Design",
    description: "Evaluates design tokens, WCAG 2.1 AA accessibility guidelines, color contrast, responsive typography, and component ergonomics.",
    duration_minutes: 20,
    total_marks: 100,
    passing_threshold: 70,
    attempt_limit: 2,
    status: "PUBLISHED",
    created_at: "2026-10-15T10:00:00.000Z",
    questions: [
      {
        id: "q_ui_1",
        question: "According to WCAG 2.1 Level AA standards, what is the minimum required contrast ratio for normal body text against its background?",
        type: "SINGLE_CHOICE",
        options: [
          "4.5:1",
          "3.0:1",
          "7.0:1",
          "1.5:1"
        ],
        correct_answer: "4.5:1",
        explanation: "WCAG 2.1 AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt+ bold).",
        marks: 10,
      },
      {
        id: "q_ui_2",
        question: "What is the primary benefit of Atomic Design methodology in enterprise UI development?",
        type: "SINGLE_CHOICE",
        options: [
          "Organizing UI elements hierarchically from atoms (buttons/inputs) to molecules, organisms, templates, and full pages",
          "Compressing images to zero bytes",
          "Writing UI without any CSS styling",
          "Restricting users to only 3 clicks per page"
        ],
        correct_answer: "Organizing UI elements hierarchically from atoms (buttons/inputs) to molecules, organisms, templates, and full pages",
        explanation: "Atomic Design establishes a clear modular mental model for component reuse, scalability, and consistent design system tokens.",
        marks: 10,
      },
      {
        id: "q_ui_3",
        question: "In responsive web design, what is the 'Mobile-First' design strategy?",
        type: "SINGLE_CHOICE",
        options: [
          "Designing for smaller viewport constraints first, then progressively enhancing the layout for larger tablet and desktop screens",
          "Disabling desktop access for all web applications",
          "Only testing websites on Android smartphones",
          "Removing all images from desktop layouts"
        ],
        correct_answer: "Designing for smaller viewport constraints first, then progressively enhancing the layout for larger tablet and desktop screens",
        explanation: "Mobile-First forces prioritization of essential content and actions, scaling upwards gracefully using CSS min-width media queries.",
        marks: 10,
      },
      {
        id: "q_ui_4",
        question: "What does Fitts's Law state regarding user interface design and button ergonomics?",
        type: "SINGLE_CHOICE",
        options: [
          "The time required to rapidly move to a target area is a function of the ratio between distance to the target and width of the target",
          "Websites must always use blue buttons",
          "Users always look at the bottom right corner first",
          "Animations must last at least 2 seconds"
        ],
        correct_answer: "The time required to rapidly move to a target area is a function of the ratio between distance to the target and width of the target",
        explanation: "Fitts's Law proves that larger and closer interactive targets are significantly faster and easier for users to acquire, reducing interaction error rates.",
        marks: 10,
      },
      {
        id: "q_ui_5",
        question: "What is the role of an ARIA label (`aria-label`) in frontend component development?",
        type: "SINGLE_CHOICE",
        options: [
          "Providing an accessible text description for assistive technologies (like screen readers) when a visual label is absent",
          "Translating text into Spanish automatically",
          "Changing font sizes based on screen width",
          "Styling button borders with gradients"
        ],
        correct_answer: "Providing an accessible text description for assistive technologies (like screen readers) when a visual label is absent",
        explanation: "`aria-label` provides programmatic screen-reader accessibility for icon buttons or interactive controls lacking readable inner text.",
        marks: 10,
      },
      {
        id: "q_ui_6",
        question: "What psychological phenomenon describes users spending most of their time on other websites, expecting your site to work like all the others?",
        type: "SINGLE_CHOICE",
        options: [
          "Jakob's Law of Internet User Experience",
          "Hick's Law",
          "Miller's Rule of 7",
          "Pareto Principle"
        ],
        correct_answer: "Jakob's Law of Internet User Experience",
        explanation: "Jakob's Law emphasizes convention: users transfer mental models from other sites, so standard navigation and familiar interaction patterns reduce cognitive load.",
        marks: 10,
      },
      {
        id: "q_ui_7",
        question: "What does Hick's Law demonstrate about decision-making time in navigation menus?",
        type: "SINGLE_CHOICE",
        options: [
          "The time it takes to make a decision increases logarithmically with the number and complexity of choices",
          "Users always select the third menu item",
          "Menu items should be sorted by word length",
          "Dropdowns must always have at least 20 options"
        ],
        correct_answer: "The time it takes to make a decision increases logarithmically with the number and complexity of choices",
        explanation: "Hick's Law dictates that reducing choices (grouping, filtering, and progressive disclosure) accelerates decision-making and minimizes user paralysis.",
        marks: 10,
      },
      {
        id: "q_ui_8",
        question: "In typography design systems, what is a 'Modular Type Scale'?",
        type: "SINGLE_CHOICE",
        options: [
          "A series of proportional font sizes calculated by multiplying a base font size by a consistent ratio (e.g. 1.25 Major Third)",
          "A font family that only contains capital letters",
          "A tool that converts text into audio",
          "A technique to hide text on mobile devices"
        ],
        correct_answer: "A series of proportional font sizes calculated by multiplying a base font size by a consistent ratio (e.g. 1.25 Major Third)",
        explanation: "Modular scales create harmonious typographical hierarchy across headings, body, and captions through mathematically consistent geometric ratios.",
        marks: 10,
      },
      {
        id: "q_ui_9",
        question: "What is the primary function of Skeleton Loading screens compared to traditional circular spinners?",
        type: "SINGLE_CHOICE",
        options: [
          "Anticipating layout structure and reducing perceived load time by progressively displaying content placeholders",
          "Preventing all CSS from rendering",
          "Saving server database CPU cycles",
          "Disabling keyboard inputs during fetch"
        ],
        correct_answer: "Anticipating layout structure and reducing perceived load time by progressively displaying content placeholders",
        explanation: "Skeletons communicate immediate progress and visual continuity, reducing cognitive wait time compared to generic blocking spinners.",
        marks: 10,
      },
      {
        id: "q_ui_10",
        question: "What is 'Affordance' in industrial and digital product design?",
        type: "SINGLE_CHOICE",
        options: [
          "The perceptible visual properties of an object that intuitively indicate how it can be used (e.g. a 3D-styled button inviting clicks)",
          "The financial price of a software subscription",
          "The amount of RAM an application consumes",
          "The number of colors in an SVG logo"
        ],
        correct_answer: "The perceptible visual properties of an object that intuitively indicate how it can be used (e.g. a 3D-styled button inviting clicks)",
        explanation: "Affordance gives clues about the operation of things (Norman). Good digital affordance makes interactive elements self-evident without explicit instructions.",
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

export class AssessmentStore {
  private assessments: Assessment[] = [];
  private attempts: AssessmentAttempt[] = [];

  constructor() {
    this.assessments = loadAssessmentsFromDisk();
    this.attempts = loadAttemptsFromDisk();
  }

  /**
   * Returns assessments. If user is NOT an admin, sanitizes questions by stripping
   * `correct_answer` and `explanation` so answer keys never leak across the wire.
   */
  public getAll(isAdmin: boolean = false): Assessment[] {
    this.assessments = loadAssessmentsFromDisk();
    if (isAdmin) return this.assessments;

    return this.assessments
      .filter((a) => a.status === "PUBLISHED")
      .map((a) => ({
        ...a,
        questions: a.questions.map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options,
          marks: q.marks,
          correct_answer: "", // Redacted for anti-cheat
          explanation: "", // Redacted for anti-cheat
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
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options,
        marks: q.marks,
        correct_answer: "",
        explanation: "",
      })),
    };
  }

  public createAssessment(data: {
    title: string;
    subject: string;
    description: string;
    duration_minutes?: number;
    passing_threshold?: number;
    attempt_limit?: number;
    status?: "PUBLISHED" | "DRAFT" | "CLOSED";
    questions: AssessmentQuestion[];
  }): Assessment {
    this.assessments = loadAssessmentsFromDisk();

    const totalMarks = data.questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    const newAsm: Assessment = {
      id: `asm-${Date.now()}`,
      organization_id: "org-akash-01",
      title: data.title.trim(),
      subject: data.subject?.trim() || "General Technology",
      description: data.description?.trim() || "",
      duration_minutes: Number(data.duration_minutes) || 25,
      total_marks: totalMarks,
      passing_threshold: Number(data.passing_threshold) || 70,
      attempt_limit: Number(data.attempt_limit) || 2,
      status: data.status || "PUBLISHED",
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

  /**
   * Strictly evaluates the assessment attempt on the server against correct answers.
   */
  public submitAttempt(params: {
    assessmentId: string;
    studentEmail: string;
    studentName: string;
    answers: Record<string, string>;
    tabSwitchCount: number;
    timeSpentSeconds: number;
    startedAt?: string;
  }): AssessmentAttempt {
    this.assessments = loadAssessmentsFromDisk();
    this.attempts = loadAttemptsFromDisk();

    const asm = this.assessments.find((a) => a.id === params.assessmentId);
    if (!asm) throw new Error("Assessment not found for grading.");

    let earnedScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const evaluations: QuestionEvaluation[] = [];

    asm.questions.forEach((q) => {
      const studentRawAns = params.answers[q.id];
      const hasAnswered = Boolean(studentRawAns && String(studentRawAns).trim().length > 0);

      let isCorrect = false;
      const cleanCorrect = q.correct_answer.trim();

      if (!hasAnswered) {
        unansweredCount++;
      } else {
        const studentAns = String(studentRawAns).trim();

        // Match either by direct text match OR by option index key (A, B, C, D)
        if (studentAns.toLowerCase() === cleanCorrect.toLowerCase()) {
          isCorrect = true;
        } else {
          // Check if studentAns is "A", "B", "C", "D" and option[index] matches correct_answer
          const optKeys = ["A", "B", "C", "D", "E"];
          const keyIdx = optKeys.indexOf(studentAns.toUpperCase());
          if (keyIdx !== -1 && q.options && q.options[keyIdx]) {
            if (q.options[keyIdx].trim().toLowerCase() === cleanCorrect.toLowerCase()) {
              isCorrect = true;
            }
          }
          // Conversely check if correct_answer was "A", "B", "C", "D" and student answered option text
          const correctKeyIdx = optKeys.indexOf(cleanCorrect.toUpperCase());
          if (correctKeyIdx !== -1 && q.options && q.options[correctKeyIdx]) {
            if (studentAns.toLowerCase() === q.options[correctKeyIdx].trim().toLowerCase()) {
              isCorrect = true;
            }
          }
        }

        if (isCorrect) {
          earnedScore += q.marks;
          correctCount++;
        } else {
          wrongCount++;
        }
      }

      evaluations.push({
        question_id: q.id,
        question_text: q.question,
        selected_answer: hasAnswered ? String(studentRawAns).trim() : null,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        marks_awarded: isCorrect ? q.marks : 0,
        marks_possible: q.marks,
        explanation: q.explanation || "No explanation provided.",
      });
    });

    const percentage = asm.total_marks > 0 ? Math.round((earnedScore / asm.total_marks) * 100) : 0;
    const passed = percentage >= asm.passing_threshold;

    const tabSwitches = Number(params.tabSwitchCount) || 0;
    let proctoringFlag: "CLEAN" | "SUSPICIOUS" | "VIOLATION" = "CLEAN";
    if (tabSwitches > 3) {
      proctoringFlag = "VIOLATION";
    } else if (tabSwitches > 0) {
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
      score: earnedScore,
      total_marks: asm.total_marks,
      percentage,
      passed,
      correct_count: correctCount,
      wrong_count: wrongCount,
      unanswered_count: unansweredCount,
      tab_switch_count: tabSwitches,
      proctoring_flag: proctoringFlag,
      time_spent_seconds: Math.max(1, params.timeSpentSeconds || 1),
      started_at: startedIso,
      submitted_at: nowIso,
      answers: params.answers,
      evaluations,
    };

    this.attempts.unshift(attempt);
    saveAttemptsToDisk(this.attempts);
    return attempt;
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
