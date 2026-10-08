export interface ProgramModule {
  week: string;
  title: string;
  topics: string[];
}

export interface InternshipProgram {
  id: string;
  title: string;
  slug: string;
  technology: string;
  duration: string;
  skillLevel: "Beginner" | "Intermediate" | "Advanced";
  shortDescription: string;
  description: string;
  fee: number; // Configurable Program Enrollment Fee (INR)
  certificateIncluded: boolean;
  learningOutcomes: string[];
  techStack: string[];
  curriculum: ProgramModule[];
  mentor: {
    name: string;
    role: string;
    avatar: string;
  };
  totalEnrolled: number;
  rating: number;
}

export const INTERNSHIP_PROGRAMS: InternshipProgram[] = [
  {
    id: "prog_fullstack",
    title: "Full Stack Web Development",
    slug: "full-stack-development",
    technology: "React, Next.js, Node.js & PostgreSQL",
    duration: "12 Weeks",
    skillLevel: "Intermediate",
    shortDescription: "Architect production-ready fullstack web applications with modern frontend frameworks, RESTful APIs, and relational databases.",
    description: "Deep dive into end-to-end fullstack development. Learn to build modern reactive user interfaces, scalable backend microservices, authentication systems, database schema architecture, and real-time state management. Culminates in a production capstone project deployed to cloud infrastructure.",
    fee: 4999,
    certificateIncluded: true,
    totalEnrolled: 342,
    rating: 4.9,
    techStack: ["Next.js 16", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "Prisma", "Docker"],
    mentor: {
      name: "Siddharth Rao",
      role: "Lead Fullstack Architect, Ex-Swiggy",
      avatar: "SR",
    },
    learningOutcomes: [
      "Master Next.js App Router, SSR, Server Components & Server Actions",
      "Design robust REST & GraphQL APIs with Node.js and TypeScript",
      "Model relational databases and optimize SQL queries using PostgreSQL",
      "Implement secure authentication, session management, and RBAC",
      "Deploy scalable microservices and configure automated CI/CD pipelines",
    ],
    curriculum: [
      {
        week: "Weeks 1–2",
        title: "Frontend Foundations & Next.js Architecture",
        topics: ["TypeScript Essentials", "Component Architecture & Hooks", "Server vs Client Components", "Tailwind Design System"],
      },
      {
        week: "Weeks 3–5",
        title: "Backend API Engineering & Database Architecture",
        topics: ["Node.js Server Architecture", "PostgreSQL Schema Design", "Prisma ORM & Migrations", "JWT & Session Auth"],
      },
      {
        week: "Weeks 6–8",
        title: "Real-time Systems, State & Testing",
        topics: ["WebSockets & Real-time Feeds", "State Management & React Query", "Unit & Integration Testing", "API Rate Limiting"],
      },
      {
        week: "Weeks 9–12",
        title: "Production Capstone, DevOps & Deployment",
        topics: ["Docker Containerization", "CI/CD Pipeline with GitHub Actions", "Cloud Deployment on AWS/Vercel", "Performance Monitoring"],
      },
    ],
  },
  {
    id: "prog_python_ai",
    title: "Python & AI Engineering",
    slug: "python-ai-engineering",
    technology: "Python, FastAPI, PyTorch & LangChain",
    duration: "12 Weeks",
    skillLevel: "Intermediate",
    shortDescription: "Master Python programming, automated workflows, and build generative AI applications powered by modern LLMs.",
    description: "Equip yourself with industry-grade Python engineering skills and generative AI architecture. Develop high-throughput backend services using FastAPI, train neural networks with PyTorch, and construct LLM agent pipelines using LangChain and vector embeddings.",
    fee: 5499,
    certificateIncluded: true,
    totalEnrolled: 289,
    rating: 4.95,
    techStack: ["Python 3.12", "FastAPI", "PyTorch", "LangChain", "OpenAI / HuggingFace", "ChromaDB", "Docker"],
    mentor: {
      name: "Ananya Iyer",
      role: "Senior AI Researcher, AI Labs",
      avatar: "AI",
    },
    learningOutcomes: [
      "Write idiomatic, asynchronous, and object-oriented Python 3.12",
      "Build high-throughput REST APIs and asynchronous workers with FastAPI",
      "Understand neural network fundamentals and fine-tuning with PyTorch",
      "Construct Retrieval-Augmented Generation (RAG) pipelines with Vector DBs",
      "Deploy scalable AI microservices with Docker and monitor token usage",
    ],
    curriculum: [
      {
        week: "Weeks 1–3",
        title: "Advanced Python & Asynchronous Systems",
        topics: ["Generators, Decorators & Context Managers", "Asyncio & Concurrency", "Type Hints & Pydantic", "FastAPI Core"],
      },
      {
        week: "Weeks 4–6",
        title: "Deep Learning Foundations with PyTorch",
        topics: ["Tensors & Autograd", "Building Neural Networks", "Model Training & Validation", "Computer Vision & NLP Basics"],
      },
      {
        week: "Weeks 7–9",
        title: "Generative AI, LLMs & LangChain",
        topics: ["Prompt Engineering & Function Calling", "LangChain Chains & Agents", "Vector Embeddings & ChromaDB", "RAG Architecture"],
      },
      {
        week: "Weeks 10–12",
        title: "Enterprise AI Project & Cloud Deployment",
        topics: ["Streaming LLM Responses", "FastAPI + Docker Packaging", "Model Evaluation & Guardrails", "Final Portfolio Defense"],
      },
    ],
  },
  {
    id: "prog_datascience",
    title: "Data Science & Analytics",
    slug: "data-science-analytics",
    technology: "Pandas, NumPy, SQL & PowerBI",
    duration: "10 Weeks",
    skillLevel: "Beginner",
    shortDescription: "Transform complex data into actionable business intelligence through statistical analysis, SQL queries, and interactive dashboards.",
    description: "Learn how data-driven organizations make decisions. Master exploratory data analysis, advanced SQL window functions, statistical testing, and visualization dashboards using Pandas, Seaborn, and PowerBI.",
    fee: 4499,
    certificateIncluded: true,
    totalEnrolled: 215,
    rating: 4.85,
    techStack: ["Python", "Pandas", "NumPy", "SQL (PostgreSQL)", "PowerBI", "Seaborn", "Statsmodels"],
    mentor: {
      name: "Karan Mehta",
      role: "Lead Analytics Consultant",
      avatar: "KM",
    },
    learningOutcomes: [
      "Clean, transform, and analyze multi-million row datasets with Pandas",
      "Write complex SQL queries utilizing CTEs and analytical window functions",
      "Apply statistical hypothesis testing and probability modeling to business problems",
      "Design interactive enterprise KPI executive dashboards in PowerBI",
      "Present quantitative insights effectively to stakeholders",
    ],
    curriculum: [
      {
        week: "Weeks 1–2",
        title: "Exploratory Data Analysis with Python",
        topics: ["NumPy Arrays & Vectorization", "Pandas DataFrames & Aggregations", "Data Cleaning Strategies", "Matplotlib & Seaborn"],
      },
      {
        week: "Weeks 3–5",
        title: "Advanced SQL & Database Analytics",
        topics: ["Complex Joins & Subqueries", "Window Functions (Rank, Lead/Lag)", "CTEs & Recursive Queries", "Data Warehousing Basics"],
      },
      {
        week: "Weeks 6–8",
        title: "Applied Statistics & Predictive Modeling",
        topics: ["Probability Distributions", "Hypothesis Testing & A/B Tests", "Linear & Logistic Regression", "Feature Engineering"],
      },
      {
        week: "Weeks 9–10",
        title: "PowerBI Dashboards & Executive Storytelling",
        topics: ["DAX Formulas & Data Modeling", "Interactive KPI Dashboards", "Automated Data Refreshes", "Capstone Project"],
      },
    ],
  },
  {
    id: "prog_cloud_devops",
    title: "Cloud & DevOps Engineering",
    slug: "cloud-devops-engineering",
    technology: "AWS, Docker, Kubernetes & Terraform",
    duration: "8 Weeks",
    skillLevel: "Advanced",
    shortDescription: "Design resilient cloud infrastructure, automate deployment pipelines, and orchestrate containerized applications.",
    description: "Become an infrastructure engineer capable of running enterprise workloads in production. Learn Infrastructure as Code (Terraform), Docker containerization, Kubernetes cluster management, CI/CD with GitHub Actions, and AWS cloud security.",
    fee: 4999,
    certificateIncluded: true,
    totalEnrolled: 178,
    rating: 4.9,
    techStack: ["AWS", "Docker", "Kubernetes (K8s)", "Terraform", "GitHub Actions", "Prometheus", "Linux"],
    mentor: {
      name: "Varun Verma",
      role: "Principal DevOps Engineer",
      avatar: "VV",
    },
    learningOutcomes: [
      "Containerize multi-tier applications with multi-stage Dockerfiles",
      "Deploy and scale microservices on Kubernetes with Helm charts",
      "Automate cloud infrastructure provisioning using Terraform (IaC)",
      "Build zero-downtime CI/CD deployment pipelines on GitHub Actions",
      "Configure metrics, alerts, and dashboards with Prometheus & Grafana",
    ],
    curriculum: [
      {
        week: "Weeks 1–2",
        title: "Linux & Docker Containerization",
        topics: ["Linux Administration & Bash Scripting", "Docker Architecture & Compose", "Multi-stage Builds", "Container Security"],
      },
      {
        week: "Weeks 3–4",
        title: "Kubernetes Cluster Orchestration",
        topics: ["Pods, Deployments & Services", "Ingress Controllers & TLS", "ConfigMaps & Secrets", "Helm Package Manager"],
      },
      {
        week: "Weeks 5–6",
        title: "AWS Cloud & Infrastructure as Code (IaC)",
        topics: ["VPC, EC2, ECS & S3 Architecture", "Terraform State & Modules", "IAM Least-Privilege Policies", "Security Groups"],
      },
      {
        week: "Weeks 7–8",
        title: "CI/CD Automation & Observability",
        topics: ["GitHub Actions Workflows", "Automated Testing & Linting", "Prometheus & Grafana Monitoring", "Blue-Green Deployments"],
      },
    ],
  },
  {
    id: "prog_database_dev",
    title: "Database Architecture & SQL",
    slug: "database-architecture-sql",
    technology: "PostgreSQL, Redis, Prisma & Query Optimization",
    duration: "6 Weeks",
    skillLevel: "Intermediate",
    shortDescription: "Master high-performance database schema design, indexing strategies, caching layers, and transaction isolation.",
    description: "Specialize in the core data engine behind every large-scale platform. Understand ACID transactions, B-Tree and GIN indexes, query execution plans (EXPLAIN ANALYZE), caching strategies with Redis, and data replication.",
    fee: 3499,
    certificateIncluded: true,
    totalEnrolled: 142,
    rating: 4.8,
    techStack: ["PostgreSQL", "Redis", "SQL", "Prisma", "pgAdmin", "Docker"],
    mentor: {
      name: "Deepak Joshi",
      role: "Database Architect",
      avatar: "DJ",
    },
    learningOutcomes: [
      "Design normalized third-normal-form (3NF) and star-schema databases",
      "Optimize slow SQL queries using EXPLAIN ANALYZE and composite indexes",
      "Implement write-through and cache-aside patterns with Redis",
      "Manage transaction isolation levels and prevent deadlocks",
      "Handle data migrations safely with zero application downtime",
    ],
    curriculum: [
      {
        week: "Weeks 1–2",
        title: "Relational Modeling & Advanced SQL",
        topics: ["Relational Constraints & Foreign Keys", "Advanced Joins & CTEs", "Stored Procedures & Triggers", "JSONB in PostgreSQL"],
      },
      {
        week: "Weeks 3–4",
        title: "Indexing, Query Plans & Optimization",
        topics: ["B-Tree, Hash & GIN Indexes", "EXPLAIN (ANALYZE, BUFFERS)", "Query Tuning & Rewriting", "Partitioning Large Tables"],
      },
      {
        week: "Weeks 5–6",
        title: "Transactions, Redis Caching & Replication",
        topics: ["ACID Isolation Levels & MVCC", "Redis In-Memory Data Structures", "Cache Invalidation Strategies", "High Availability Basics"],
      },
    ],
  },
  {
    id: "prog_machine_learning",
    title: "Machine Learning Engineering",
    slug: "machine-learning-engineering",
    technology: "Scikit-Learn, XGBoost, MLflow & MLOps",
    duration: "10 Weeks",
    skillLevel: "Intermediate",
    shortDescription: "Build, evaluate, and operationalize predictive machine learning models for classification, regression, and recommendations.",
    description: "Bridge the gap between theoretical algorithms and real-world deployment. Master data preprocessing, supervised learning, gradient boosting with XGBoost, unsupervised clustering, hyperparameter tuning, model registry with MLflow, and API serving.",
    fee: 4999,
    certificateIncluded: true,
    totalEnrolled: 198,
    rating: 4.88,
    techStack: ["Python", "Scikit-Learn", "XGBoost", "MLflow", "NumPy", "FastAPI", "Docker"],
    mentor: {
      name: "Pooja Hegde",
      role: "Lead ML Engineer",
      avatar: "PH",
    },
    learningOutcomes: [
      "Preprocess real-world noisy data with Scikit-Learn pipelines",
      "Train high-accuracy classification and regression models using XGBoost",
      "Evaluate models with precision, recall, F1, ROC-AUC, and cross-validation",
      "Track experiments and register production model artifacts with MLflow",
      "Serve ML models as high-speed REST APIs using FastAPI and Docker",
    ],
    curriculum: [
      {
        week: "Weeks 1–3",
        title: "Supervised Learning Algorithms",
        topics: ["Linear & Logistic Regression", "Decision Trees & Random Forests", "Support Vector Machines", "Evaluation Metrics & ROC-AUC"],
      },
      {
        week: "Weeks 4–6",
        title: "Gradient Boosting & Feature Engineering",
        topics: ["Gradient Boosting & XGBoost", "Feature Selection & Scaling", "Hyperparameter Tuning (Optuna)", "Handling Imbalanced Datasets"],
      },
      {
        week: "Weeks 7–8",
        title: "Unsupervised Learning & Clustering",
        topics: ["K-Means & DBSCAN", "Principal Component Analysis (PCA)", "Anomaly Detection", "Recommendation Systems"],
      },
      {
        week: "Weeks 9–10",
        title: "MLOps, MLflow & Production Deployment",
        topics: ["Experiment Tracking with MLflow", "Model Packaging & Versioning", "FastAPI Serving Endpoint", "Final Capstone Presentation"],
      },
    ],
  },
];

export function getProgramById(id: string): InternshipProgram | undefined {
  return INTERNSHIP_PROGRAMS.find((p) => p.id === id || p.slug === id);
}

export function getAllPrograms(): InternshipProgram[] {
  return INTERNSHIP_PROGRAMS;
}
