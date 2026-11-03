import { CURRICULUM, displaySectionTitle, type Part } from "./curriculum";

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
    description: "Machine Learning, at its core, is built on mathematical principles. Learn the fundamental concepts of linear algebra, probability theory, and calculus.",
    introduction: "Before a calculation can tell us anything useful, we need to understand what the numbers represent. We will start with small examples and learn how to express calculations in Python. You can follow these sections in order or return to a particular idea when you need it.",
    groups: [{ id: "foundations", title: "Mathematics and Programming Fundamentals", sections: ["Introductory Mathematics", "Python and NumPy"] }],
  },
  {
    id: "databases",
    title: "Databases",
    description: "The way we store data affects how and what we can retrieve. This can and will impact how difficult it is to find your data. Learn how databases organize records and represent relationships, then use those ideas to prepare data for models and retrieve information for yourself.",
    introduction: "Suppose a maintenance team has years of inspection records. Before we can train a model, we need to know which machine each reading belongs to and what was known at the time. Start with tables and SQL. Then consider an inspection with its own nested details, readings arriving at several sites, or a fault that spreads through connected equipment. Those questions give us reasons to try other ways of storing and querying the records. We will keep asking what each choice makes easier and what we must now manage ourselves.",
    groups: [
      { id: "relational-databases", title: "Working with relational databases", sections: ["SQL"] },
      { id: "nosql-databases", title: "NoSQL Databases", sections: ["NoSQL"] },
      { id: "graph-databases", title: "Graph Databases", sections: ["Graph Databases"] },
    ],
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    description: "Different learning methods make different assumptions about data and how to model it. Learn why those methods were developed and where they are useful as well as understanding how well they perform.",
    introduction: "Suppose we have measurements from people we know and want to predict something about a person we haven't measured. How would we find a useful rule? We will begin there, then work through the problems that led people to develop other methods. Each section gives you a way to inspect what those methods actually do.",
    groups: [
      { id: "getting-started", title: "Prediction and Evaluation", sections: ["Start with a Prediction", "Data Preparation", "Choosing and Checking a Model", "Evaluating and Improving Models"] },
      { id: "methods", title: "Learning Methods", sections: ["Classical Machine Learning", "Probabilistic Models and Uncertainty", "Neural Networks", "Optimisation and Training"] },
      { id: "problems", title: "Applications and Data Types", sections: ["Computer Vision with Neural Networks", "Natural Language Processing", "Time Series and Forecasting", "Recommendations and Ranking", "Graphs and Relational Learning", "Anomaly Detection"] },
      { id: "generating", title: "Generative Models and Adaptation", sections: ["Large Language Models", "Generative Models", "Adapting and Evaluating Modern Models"] },
      { id: "decisions", title: "Reinforcement Learning and Causal Inference", sections: ["Reinforcement Learning", "Causal Inference and Experiments"] },
      { id: "practice", title: "Deployment and Projects", sections: ["Deploying and Maintaining Models", "Complete Projects"] },
    ],
  },
  {
    id: "first-principles-design",
    title: "First Principles Design",
    description: "Good design starts with understanding the problem we are trying to solve. We'll use physical systems and software examples to explain how requirements and practical limits shape a machine learning system.",
    introduction: "Suppose we want a model to help a team find pumps that need inspection. Choosing an algorithm leaves plenty unanswered. What can the team act on? Which readings arrive in time? Will the device and the people using it keep up? We will reason through those questions using physical inspection systems and software services, then build the calculations in Botie's workshops. Known relationships help us estimate a design; predictions about the world still need evidence.",
    groups: [
      { id: "work-out-the-design", title: "Requirements and System Modeling", sections: ["Define the ML Problem", "Model the System Before Building It"] },
      { id: "challenge-the-design", title: "Design Evaluation", sections: ["Compare Designs Under Constraints", "Test the Design and Plan for Failure"] },
    ],
  },
  {
    id: 'software-engineering', title: 'Software Engineering',
    description: "Programming, while fundamental to machine learning, will empower you to manipulate and understand whether the data even requires machine learning to understand.",
    introduction: "Suppose our pump model expects temperatures in Celsius, but a caller sends a value in Fahrenheit. The program may run without an error and still give an unusable prediction. We’ll start with what each value means, then work through the software that prepares it and carries the answer back. Tests give us a way to check that agreement when another part of the application changes.",
    groups: [{ id: 'ml-software', title: "Data Structures and APIs", sections: ['Software for Models and Agents', 'Model and Tool API Contracts'] }],
  },
  {
    id: 'data-engineering', title: 'Data Engineering',
    description: "Preparing data becomes more difficult as its volume grows and the records keep changing. We'll use data pipelines and tools such as Spark and Databricks to explain how that work can be organized and repeated.",
    introduction: "Suppose we want to predict when a pump will fail. Its readings arrive in separate files, and some are corrected after a model has already used them. Which records should go into training, and how can we reproduce that dataset later? We’ll build the steps that collect the records and turn them into model inputs. Then we’ll see why larger workloads led to tools such as Spark and the shared working environment Databricks provides.",
    groups: [{ id: 'feature-pipelines', title: "Data Pipelines and Databricks", sections: ['Data Pipelines for Learning', 'Introduction to Databricks', 'Databricks for ML Pipelines'] }],
  },
  {
    id: 'ai-agents-and-applications', title: 'AI Agents and Applications',
    description: "An agent's behavior depends on its instructions and the tools it can use. Explore and experiment with how to write prompts that generate prose, structured responses, or orchestrate multiple agents to perform tasks. Finally, learn how to use evaluations to check whether a change actually improves the agent.",
    introduction: "A technician asks a question about a pump. The model needs a maintenance record before it can answer. How do we let it request that record, and how do we decide whether it is allowed to read it? An agent uses a model’s output to choose a next step, such as requesting a tool or answering the technician. We’ll build that loop before looking at how frameworks help us organize it. We also need ways to examine a run and test whether a change actually improved its behavior.",
    groups: [
      { id: 'build-agents', title: 'Building an agent', sections: ['Agents'] },
      { id: 'improve-agents', title: "Agent Evaluation", sections: ['Prompting, Evaluation and Iteration'] },
      { id: 'agent-boundaries', title: "Agent Security", sections: ['Agent Guardrails and Secure Development'] },
    ],
  },
  {
    id: 'computer-systems-and-infrastructure', title: 'Computer Systems and Infrastructure',
    description: "For any kind of software, including machine learning models, speed and memory limits depend on the system(s) running it. Response times are bound to processing power, memory, and system design.",
    introduction: "A model that fits into memory can still run out of space while answering requests. It also stores information about the conversations it is processing. We’ll start with waiting time, then look at what can safely be reused between requests. The examples are small enough to calculate by hand before we discuss how a serving system implements them.",
    groups: [{ id: 'serving-workloads', title: "Model Serving", sections: ['Serving Models and Agent Runs', 'LLM Inference and Capacity'] }],
  },
  {
    id: 'robotics-and-control', title: 'Robotics and Control',
    description: "Control systems use measurements to adjust an action as conditions change. When those measurements come from a camera or a learned model, their timing and uncertainty affect whether the correction helps.",
    introduction: "Suppose Botie is watching parts move along a conveyor. The camera misses a frame, and its next reading disagrees with where the belt’s movement suggests the part should be. What should we believe? We’ll work from the meaning and timing of a position reading towards estimates that combine imperfect observations. You’ll build and test these ideas in a simulation; moving real hardware would require additional checks.",
    groups: [{ id: 'perception-to-action', title: "Perception and Control", sections: ['From Learned Perception to Control', 'Estimating State from Noisy Observations'] }],
  },
  {
    id: 'security-and-privacy', title: 'Security and Privacy',
    description: "Software, models, and agents can work with private information or data from untrusted sources. Access controls limit which records an application can use, while checks on training data and model files help identify other risks.",
    introduction: "A model’s answer might be correct while the application has revealed a protected record. We need to ask whether the user may read a record separately from whether it would help answer their question. We’ll also examine what a downloaded model file can do when it is loaded. Later lessons investigate how training records can change a model’s behavior and what repeated predictions can reveal about it.",
    groups: [{ id: 'ml-data-boundaries', title: "Data and Model Security", sections: ['Protecting ML Data and Artifacts', 'Threats Across the ML Lifecycle'] }],
  },
  {
    id: 'scientific-computing-and-simulation', title: 'Scientific Computing and Simulation',
    description: "Simulations represent a system through calculations, allowing us to test decisions without repeating every physical experiment. Their results depend on the assumptions in that representation and the accuracy of the numerical methods used.",
    introduction: "Suppose we want to train an agent in a conveyor simulation. The simulator is supposed to tell us how parts move, but its belt speed differs from the real one. Making more examples would repeat the same mistake. We’ll compare the simulation with observations and work out which relationships need to change. A separate problem comes from the calculation itself: a correct formula may produce a number larger than the computer can represent. We’ll examine those failures on small examples we can check.",
    groups: [{ id: 'simulation-evidence', title: 'Calculations and simulations', sections: ['Simulating and Learning System Behaviour', 'Numerical Methods for Learning'] }],
  },
].map(area => ({
  ...area,
  groups: area.groups.map(group => ({ ...group, sections: group.sections.map(displaySectionTitle) })),
}));

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
