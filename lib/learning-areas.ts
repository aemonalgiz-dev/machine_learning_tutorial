import { CURRICULUM, type Part } from "./curriculum";

export interface LearningArea {
  id: string;
  title: string;
  description: string;
  introduction: string;
  groups: { id: string; title: string; sections: string[] }[];
}

// Each section has one home. Other areas can link to its lessons as prerequisites.
export const LEARNING_AREAS: LearningArea[] = [
  {
    id: "mathematics-and-programming",
    title: "Mathematics and Programming",
    description: "Work through the mathematics and calculate with Python and NumPy. Start here, or return when a lesson needs something unfamiliar.",
    introduction: "Before a calculation can tell us anything useful, we need to understand what the numbers represent. We will start with small examples and learn how to express calculations in Python. You can follow these sections in order or return to a particular idea when you need it.",
    groups: [{ id: "foundations", title: "Build the foundations", sections: ["Introductory Mathematics", "Python and NumPy"] }],
  },
  {
    id: "databases",
    title: "Databases",
    description: "Our data often lives across years of records. How do we organise those records, find the ones we need, and keep them reliable as they change? Work through SQL, NoSQL and graph databases with Botie.",
    introduction: "Suppose a maintenance team has years of inspection records. Before we can train a model, we need to know which machine each reading belongs to and what was known at the time. Start with tables and SQL. Then consider an inspection with its own nested details, readings arriving at several sites, or a fault that spreads through connected equipment. Those questions give us reasons to try other ways of storing and querying the records. We will keep asking what each choice makes easier and what we must now manage ourselves.",
    groups: [
      { id: "relational-databases", title: "Working with relational databases", sections: ["SQL"] },
      { id: "nosql-databases", title: "Storing records around how we use them", sections: ["NoSQL"] },
      { id: "graph-databases", title: "Asking questions about connections", sections: ["Graph Databases"] },
    ],
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    description: "How does a model learn from examples? Begin with a prediction, then build the methods with Botie and work through them in Python.",
    introduction: "Suppose we have measurements from people we know and want to predict something about a person we haven't measured. How would we find a useful rule? We will begin there, then work through the problems that led people to develop other methods. Each section gives you a way to inspect what those methods actually do.",
    groups: [
      { id: "getting-started", title: "Getting started", sections: ["Start with a Prediction", "Data Preparation", "Choosing and Checking a Model", "Evaluating and Improving Models"] },
      { id: "methods", title: "Understanding the methods", sections: ["Classical Machine Learning", "Probabilistic Models and Uncertainty", "Neural Networks", "Optimisation and Training"] },
      { id: "problems", title: "Working with particular kinds of problems", sections: ["Computer Vision with Neural Networks", "Natural Language Processing", "Time Series and Forecasting", "Recommendations and Ranking", "Graphs and Relational Learning", "Anomaly Detection"] },
      { id: "generating", title: "Generating and adapting models", sections: ["Large Language Models", "Generative Models", "Adapting and Evaluating Modern Models"] },
      { id: "decisions", title: "Learning through decisions and experiments", sections: ["Reinforcement Learning", "Causal Inference and Experiments"] },
      { id: "practice", title: "Putting models to work", sections: ["Deploying and Maintaining Models", "Complete Projects"] },
    ],
  },
  {
    id: "first-principles-design",
    title: "First Principles Design",
    description: "How do we turn an ML model into something useful? Work from the decision it supports through the limits of the system, then build and test the design with Botie.",
    introduction: "Suppose we want a model to help a team find pumps that need inspection. Choosing an algorithm leaves plenty unanswered. What can the team act on? Which readings arrive in time? Will the device and the people using it keep up? We will reason through those questions using physical inspection systems and software services, then build the calculations in Botie's workshops. Known relationships help us estimate a design; predictions about the world still need evidence.",
    groups: [
      { id: "work-out-the-design", title: "Work out what the system needs", sections: ["Define the ML Problem", "Model the System Before Building It"] },
      { id: "challenge-the-design", title: "Find out where the design holds up", sections: ["Compare Designs Under Constraints", "Test the Design and Plan for Failure"] },
    ],
  },
  {
    id: 'software-engineering', title: 'Software Engineering',
    description: 'A model needs software that preserves what its inputs mean. Build dependable prediction code, keep retrieved evidence attached to its scores, and organise the jobs that produce a trained artifact.',
    introduction: 'Suppose a prediction changes even though the weights are identical. The cause may be field order, mutable preprocessing state or a stale file. We will work through those failures with Botie, then build reusable procedures and tests that expose them. Data structures and program design enter when the ML or agent workload gives us a reason to use them.',
    groups: [{ id: 'ml-software', title: 'Make the model procedure dependable', sections: ['Software for Models and Agents', 'Model and Tool API Contracts'] }],
  },
  {
    id: 'data-engineering', title: 'Data Engineering',
    description: 'The model can only learn from the records we actually give it. Build feature pipelines that handle unequal files, late arrivals and changed producers without quietly rewriting the training problem.',
    introduction: 'Botie receives sensor files and events from several systems. They do not arrive together, and some are corrected later. We will turn them into traceable training inputs, preserving what was known at each decision. The database lessons explain storage and queries; this area follows the transformations and runs that carry those records into models.',
    groups: [{ id: 'feature-pipelines', title: 'Follow records into the model', sections: ['Data Pipelines for Learning', 'Databricks for ML Pipelines'] }],
  },
  {
    id: 'ai-agents-and-applications', title: 'AI Agents and Applications',
    description: 'Give Botie tools and evidence, then find out where his decisions fail. Work through prompting, frameworks, evaluations and the boundaries an application must enforce.',
    introduction: 'A technician asks a question whose answer is in another system. We will start with how a model requests a tool, then follow the request into an application that can permit or reject it. Pydantic AI, LangChain and LangGraph give us concrete implementations to inspect. Traces and evaluations help us decide what to change, while guardrails constrain the effects that a convincing answer cannot undo.',
    groups: [
      { id: 'build-agents', title: 'Give the application a job and tools', sections: ['Agents'] },
      { id: 'improve-agents', title: 'Find and repair failures', sections: ['Prompting, Evaluation and Iteration'] },
      { id: 'agent-boundaries', title: 'Control the effects of a run', sections: ['Agent Guardrails and Secure Development'] },
    ],
  },
  {
    id: 'computer-systems-and-infrastructure', title: 'Computer Systems and Infrastructure',
    description: 'A prediction service and an agent run share finite time and memory. Follow requests through batches, deadlines and caches to understand what happens as the workload grows.',
    introduction: 'Botie can answer one request, but several long conversations create a different problem. The accelerator may wait for batches, tool calls may spend the deadline twice, and conversation state may exhaust memory after the model has loaded. We will inspect those resource decisions using small executable examples tied to ML serving.',
    groups: [{ id: 'serving-workloads', title: 'Keep inference and tool use within their limits', sections: ['Serving Models and Agent Runs', 'LLM Inference and Capacity'] }],
  },
  {
    id: 'robotics-and-control', title: 'Robotics and Control',
    description: 'A learned detector tells Botie where something was. Work out how that prediction becomes a current position and a controlled action, then test what happens when the actuator reaches its limits.',
    introduction: 'A physical agent needs more than an accurate label. Its observations have coordinate frames and timestamps, and its actions change the next observation. We will connect learned perception to numerical motion and feedback models. The workshops run simulations, so we can inspect failed assumptions before making any claim about physical behaviour.',
    groups: [{ id: 'perception-to-action', title: 'Connect predictions to repeated actions', sections: ['From Learned Perception to Control', 'Estimating State from Noisy Observations'] }],
  },
  {
    id: 'security-and-privacy', title: 'Security and Privacy',
    description: 'Decide which evidence an agent may read, how much a person can influence a released statistic, and what must be checked before loading a model artifact.',
    introduction: 'An ML system can produce a correct answer while crossing a data boundary. We will keep relevance separate from permission and inspect the assumptions behind a privacy calculation. Model loading introduces another boundary because an artifact may contain executable behaviour. The agent area covers action-specific guardrails; these lessons examine the data and artifacts those applications depend on.',
    groups: [{ id: 'ml-data-boundaries', title: 'Protect the inputs, reports and artifacts', sections: ['Protecting ML Data and Artifacts', 'Threats Across the ML Lifecycle'] }],
  },
  {
    id: 'scientific-computing-and-simulation', title: 'Scientific Computing and Simulation',
    description: 'Use simulations to train and compare models, while checking whether the numerical procedure and physical assumptions support the result. Fit unknown parameters and test fresh conditions with Botie.',
    introduction: 'A simulator can generate many training examples, including examples of its own mistakes. We will distinguish numerical error from a wrong physical model, compare policies on shared scenarios, and learn unknown system parameters from observations. Each transfer claim will stay attached to the conditions we actually tested.',
    groups: [{ id: 'simulation-evidence', title: 'Build evidence from simulated and measured behaviour', sections: ['Simulating and Learning System Behaviour', 'Numerical Methods for Learning'] }],
  },
];

export const learningAreaHref = (area: LearningArea) => `/learn/${area.id}`;
export const findLearningArea = (id: string) => LEARNING_AREAS.find(area => area.id === id);
export const learningAreaForSection = (section: Part) => LEARNING_AREAS.find(area =>
  area.groups.some(group => group.sections.includes(section.title)),
);

// Browsing groups are subject collections. The reading path retains the existing
// prerequisite order within each area, independent of those display groups.
export const learningAreaSections = (area: LearningArea): Part[] => CURRICULUM.filter(section =>
  area.groups.some(group => group.sections.includes(section.title)),
);
