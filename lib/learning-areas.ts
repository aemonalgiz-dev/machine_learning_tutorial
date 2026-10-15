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
    description: "Work through the mathematics and learn to calculate with Python and NumPy. Start here, or return when a lesson needs something unfamiliar.",
    introduction: "Before a calculation can tell us anything useful, we need to understand what the numbers represent. We will start with small examples, work through the mathematics, and learn how to express those calculations in Python. You can follow these sections in order or come back to a particular idea when you need it.",
    groups: [{ id: "foundations", title: "Build the foundations", sections: ["Introductory Mathematics", "Python and NumPy"] }],
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    description: "How does a model learn from examples? Begin with a prediction, then build the methods with Botie and work through them in Python.",
    introduction: "Suppose we have measurements from people we know and want to predict something about a person we haven't measured. How would we find a useful rule? We will begin there, then work through the problems that led people to develop other methods. Each section gives you a way to inspect what those methods actually do.",
    groups: [
      { id: "getting-started", title: "Getting started", sections: ["Start with a Prediction", "Data Preparation", "Choosing and Checking a Model"] },
      { id: "methods", title: "Understanding the methods", sections: ["Classical Machine Learning", "Probabilistic Models and Uncertainty", "Neural Networks", "Optimisation and Training"] },
      { id: "problems", title: "Working with particular kinds of problems", sections: ["Computer Vision with Neural Networks", "Natural Language Processing", "Time Series and Forecasting", "Recommendations and Ranking", "Graphs and Relational Learning", "Anomaly Detection"] },
      { id: "generating", title: "Generating and adapting models", sections: ["Large Language Models", "Generative Models", "Adapting and Evaluating Modern Models"] },
      { id: "decisions", title: "Learning through decisions and experiments", sections: ["Reinforcement Learning", "Causal Inference and Experiments"] },
      { id: "practice", title: "Putting models to work", sections: ["Deploying and Maintaining Models", "Agents", "Complete Projects"] },
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
