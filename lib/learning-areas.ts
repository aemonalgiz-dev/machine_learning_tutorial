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
    description: "The weights in a model can stay the same while its predictions change. Find out how the surrounding software can cause that, and write code that keeps the inputs and outputs consistent.",
    introduction: "Suppose our pump model expects temperatures in Celsius, but a caller sends a value in Fahrenheit. The program may run without an error and still give an unusable prediction. We’ll start with what each value means, then work through the software that prepares it and carries the answer back. Tests give us a way to check that agreement when another part of the application changes.",
    groups: [{ id: 'ml-software', title: 'Software around a model', sections: ['Software for Models and Agents', 'Model and Tool API Contracts'] }],
  },
  {
    id: 'data-engineering', title: 'Data Engineering',
    description: "A model learning from pump readings needs a dependable record of what each pump was doing. Work from incoming files to a training table, then examine how Databricks handles those records as their volume grows.",
    introduction: "Suppose we want to predict when a pump will fail. Its readings arrive in separate files, and some are corrected after a model has already used them. Which records should go into training, and how can we reproduce that dataset later? We’ll build the steps that collect the records and turn them into model inputs. Then we’ll see why larger workloads led to tools such as Spark and the shared working environment Databricks provides.",
    groups: [{ id: 'feature-pipelines', title: 'From incoming records to training data', sections: ['Data Pipelines for Learning', 'Databricks for ML Pipelines'] }],
  },
  {
    id: 'ai-agents-and-applications', title: 'AI Agents and Applications',
    description: "A model answering a question may need to look up a record or ask another program to do something. Build an application that can handle those requests, then test where it makes mistakes.",
    introduction: "A technician asks a question about a pump. The model needs a maintenance record before it can answer. How do we let it request that record, and how do we decide whether it is allowed to read it? An agent uses a model’s output to choose a next step, such as requesting a tool or answering the technician. We’ll build that loop before looking at how frameworks help us organise it. We also need ways to examine a run and test whether a change actually improved its behaviour.",
    groups: [
      { id: 'build-agents', title: 'Building an agent', sections: ['Agents'] },
      { id: 'improve-agents', title: 'Find and repair failures', sections: ['Prompting, Evaluation and Iteration'] },
      { id: 'agent-boundaries', title: 'Control the effects of a run', sections: ['Agent Guardrails and Secure Development'] },
    ],
  },
  {
    id: 'computer-systems-and-infrastructure', title: 'Computer Systems and Infrastructure',
    description: "Why can a model answer one person quickly, then slow down when several people ask at once? Follow a request from its arrival to its final answer and measure where the time goes.",
    introduction: "A model that fits into memory can still run out of space while answering requests. It also stores information about the conversations it is processing. We’ll start with waiting time, then look at what can safely be reused between requests. The examples are small enough to calculate by hand before we discuss how a serving system implements them.",
    groups: [{ id: 'serving-workloads', title: 'Running models for other people', sections: ['Serving Models and Agent Runs', 'LLM Inference and Capacity'] }],
  },
  {
    id: 'robotics-and-control', title: 'Robotics and Control',
    description: "A camera gives Botie a position, but the object keeps moving. How can we estimate where it is now and use that estimate to choose an action?",
    introduction: "Suppose Botie is watching parts move along a conveyor. The camera misses a frame, and its next reading disagrees with where the belt’s movement suggests the part should be. What should we believe? We’ll work from the meaning and timing of a position reading towards estimates that combine imperfect observations. You’ll build and test these ideas in a simulation; moving real hardware would require additional checks.",
    groups: [{ id: 'perception-to-action', title: 'From camera readings to actions', sections: ['From Learned Perception to Control', 'Estimating State from Noisy Observations'] }],
  },
  {
    id: 'security-and-privacy', title: 'Security and Privacy',
    description: "An agent may find a useful record that its user is not allowed to read. A training file may come from a source we do not trust. Work through what the application needs to check in each situation.",
    introduction: "A model’s answer might be correct while the application has revealed a protected record. We need to ask whether the user may read a record separately from whether it would help answer their question. We’ll also examine what a downloaded model file can do when it is loaded. Later lessons investigate how training records can change a model’s behaviour and what repeated predictions can reveal about it.",
    groups: [{ id: 'ml-data-boundaries', title: 'Protecting an ML application', sections: ['Protecting ML Data and Artifacts', 'Threats Across the ML Lifecycle'] }],
  },
  {
    id: 'scientific-computing-and-simulation', title: 'Scientific Computing and Simulation',
    description: "A simulation gives us examples without running every experiment on the real system. Work out how close those examples are to the behaviour we care about, and whether the calculations themselves are reliable.",
    introduction: "Suppose we want to train an agent in a conveyor simulation. The simulator is supposed to tell us how parts move, but its belt speed differs from the real one. Making more examples would repeat the same mistake. We’ll compare the simulation with observations and work out which relationships need to change. A separate problem comes from the calculation itself: a correct formula may produce a number larger than the computer can represent. We’ll examine those failures on small examples we can check.",
    groups: [{ id: 'simulation-evidence', title: 'Calculations and simulations', sections: ['Simulating and Learning System Behaviour', 'Numerical Methods for Learning'] }],
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
