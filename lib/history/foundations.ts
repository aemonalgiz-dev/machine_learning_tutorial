import { history, source } from "./types";

const legendre = source("Legendre (1805), On the Method of Least Squares", "https://www.york.ac.uk/depts/maths/histstat/legendre.pdf");
const pearson = source("Pearson (1901), On Lines and Planes of Closest Fit to Systems of Points in Space", "https://doi.org/10.1080/14786440109462720");
const stone = source("Stone (1974), Cross-validatory Choice and Assessment of Statistical Predictions", "https://sites.stat.washington.edu/courses/stat527/s14/readings/Stone1974.pdf");
const cauchy = source("Cauchy (1847), A General Method for Solving Systems of Simultaneous Equations", "https://www.probabilityandfinance.com/pulskamp/Cauchy/Orbits/1847%20CR%20536%28383%29.pdf");

export const foundations = {
  "statistics": history("What Could a City Learn from Its Records?", [
    source("Graunt (1662), Natural and Political Observations upon the Bills of Mortality", "https://wellcomecollection.org/works/sds578rr"),
  ],
  "Suppose a city keeps a record of its deaths every week. Each entry tells us something about one person, but a pile of entries does not immediately tell us whether the city is becoming less healthy, which causes are common, or whether one unusual week represents a lasting change.",
  "In 1662, John Graunt published an analysis of London's Bills of Mortality. He compared recorded deaths across causes and time, and used the records to reason about the wider population. Statistics has many origins, but this is a useful early example of the problem it addresses: how do we turn individual observations into something we can say about a group?",
  "We start by counting and organising the observations. We can then describe a typical value, how much values differ, and which quantities change together. The records still have limitations. A pattern in the people we observed may not describe everyone, and a change may come from the way the records were collected. That is why this primer moves from describing a sample to asking how much we can infer from it."),

  "linear-algebra": history("How Do We Keep Track of Several Quantities at Once?", [
    source("Cayley (1858), A Memoir on the Theory of Matrices", "https://rcin.org.pl/impan/Content/122109/PDF/WA35_149319_12807-2_Art52.pdf"),
  ],
  "Imagine several purchases, each containing different quantities of the same goods. If we know the total paid for each purchase, we can write a relationship between those quantities and the unknown prices. One relationship may be simple. Keeping track of many relationships, and changing them together, quickly becomes cumbersome.",
  "Systems of linear equations were studied long before modern computing. In his 1858 memoir, Arthur Cayley developed an algebra of matrices, starting from their use in representing linear transformations. Arranging the coefficients in a rectangle let mathematicians reason about a whole operation, rather than continually rewriting every individual equation.",
  "That rectangle is a matrix. A list of quantities is a vector. Multiplying a matrix by a vector applies the recorded combinations to that list. Multiplying matrices lets us describe successive operations as one operation. Machine learning needs exactly this kind of bookkeeping when many measurements enter many calculations, so we will begin with small lists and pictures before working with a whole table."),

  "calculus": history("How Can We Measure Something That Keeps Changing?", [
    source("Newton, The Method of Fluxions and Infinite Series (English edition, 1736)", "https://www.loc.gov/item/42048007/"),
  ],
  "A journey has a total distance and a total time. Those tell us an average speed, but they do not tell us how fast the traveller was moving at a particular moment. The same difficulty appears when we want the slope of a curved path: the answer depends on where we look.",
  "In the seventeenth century, Newton and Leibniz developed calculus through work on changing quantities, tangents, and accumulation. Newton described quantities that flow and the rates at which they flow. His Method of Fluxions, published in English in 1736, gives us a historical way into the subject: motion makes a rate of change something we can picture.",
  "We can compare two nearby positions, then ask what happens as the interval between them becomes smaller. That leads to a derivative, a local rate of change. Accumulating small contributions leads to an integral. For a model, the changing quantity may be its error, and the thing we adjust may be a weight. The derivative then tells us how a small adjustment is expected to change that error."),

  "simple-linear-regression": history("Which Observation Should an Astronomer Believe?", [legendre],
  "An astronomer measuring an object's position does not get exactly the same answer every time. Instruments and observations introduce errors. If the measurements disagree, we cannot simply draw a relationship that passes through all of them and expect it to describe the underlying motion.",
  "In 1805, Adrien-Marie Legendre published the method of least squares in an appendix to his work on determining comet orbits. The problem was how to reconcile more observations than could be satisfied exactly. Squaring the remaining discrepancies and adding them gave a definite criterion for choosing among possible fits.",
  "For our first regression, the possible fits are straight lines. Each line predicts a value at each observed input. We measure the vertical gaps, square them so opposing errors cannot cancel, and choose the line with the smallest total. The astronomical problem is much larger, but the principle is the same: use all the observations to find a relationship that compromises between their disagreements."),

  "held-out-evaluation": history("A Good Fit to Yesterday Is Not Enough", [stone],
  "A model can look excellent on the examples used to build it. That is not surprising: those examples helped determine its settings. The harder question is whether it will give useful answers when the next observation arrives.",
  "By 1974, Mervyn Stone was examining how cross-validation could be used both to choose a statistical predictor and to assess it. His paper makes the distinction consequential. Data used to select a method are already helping us make decisions, even if they were not used to fit its coefficients.",
  "The practical response is to reserve observations, make predictions without learning from their answers, and then compare. Repeating this across different reserved groups can make better use of a small dataset. But once we repeatedly consult those results to choose settings, we need a separate final assessment. The separation gives us a more honest rehearsal of predicting an answer we have not yet seen."),

  "logistic-regression": history("How Do We Predict an Outcome That Is Either Yes or No?", [
    source("Cox (1958), The Regression Analysis of Binary Sequences", "https://doi.org/10.1111/j.2517-6161.1958.tb00292.x"),
  ],
  "Suppose we record whether a component failed, along with the conditions under which it operated. We would like to know how those conditions relate to the chance of failure. A straight-line prediction can rise above certainty or fall below impossibility, so it cannot serve as a probability without further structure.",
  "Logistic regression developed within the study of binary outcomes. David Cox's 1958 paper on binary sequences is an early treatment of regression for this kind of data. The useful change is in what we model with a linear relationship: the logarithm of the odds, rather than the probability itself.",
  "We can think of the model as first collecting evidence into a score. The logistic function then turns that score into a probability between zero and one. Large positive scores approach one; large negative scores approach zero. This gives us a way to represent increasing confidence without leaving the range a probability is allowed to occupy."),

  "judging-a-classifier": history("What Does It Cost to Raise a False Alarm?", [
    source("Tanner and Swets (1954), A Decision-Making Theory of Visual Detection", "https://doi.org/10.1037/h0058700"),
  ],
  "Imagine trying to detect a faint light. If you report a light whenever you are unsure, you will notice more real signals, but you will also report lights that were never there. If you demand very strong evidence, false alarms become less common, but faint signals are easier to miss.",
  "Tanner and Swets studied visual detection in 1954 using a decision-making account. Their work belongs to the development of signal detection theory, which separates the evidence available to an observer from the criterion used to make a decision. A change in willingness to say yes need not mean that the observer can distinguish the signals any better.",
  "A classifier faces the same distinction. It produces scores, and a threshold turns them into decisions. Counting correct answers alone hides which mistakes changed when we moved that threshold. We therefore keep true detections, missed cases, and false alarms separate before deciding which tradeoff suits the problem."),

  "centring-on-the-mean": history("Where Should We Put the Origin?", [pearson],
  "Suppose we are interested in how a group of measurements varies. Measuring everything from zero mixes two questions: where the group is located, and how its members differ from one another. For heights, zero is physically meaningful, but it is a long way from the people we are comparing.",
  "In his 1901 work on fitting lines and planes to points, Karl Pearson used the centre of the observations to organise the geometry. This was part of a wider statistical practice of expressing measurements as departures from their mean. The important historical problem was how to describe the shape of a collection of observations without confusing it with their location.",
  "Subtracting the mean moves the origin to the group's centre. A positive value now means above that centre, and a negative value means below it. The distances between people do not change. We have changed the reference point, which makes later calculations about spread and shared variation easier to interpret."),

  "the-standard-score": history("Is That a Large Difference for This Measurement?", [
    source("Pearson (1894), Contributions to the Mathematical Theory of Evolution", "https://www.quantresearch.org/1894_Pearson_Transactions_Royal_Society.pdf"),
  ],
  "A difference that looks large in one measurement may be ordinary in another. A person's height and weight have different units and different amounts of variation. Comparing their raw departures from an average does not tell us which measurement is more unusual within its own group.",
  "Nineteenth-century work on measurement errors and biological variation developed ways to describe the spread of observations. Pearson's 1894 study of frequency curves, for example, used standard deviation while examining how measured populations were distributed. Standard scores draw on that tradition of describing an observation relative to both a centre and a scale.",
  "First we measure the departure from the mean. Then we express that departure in units of the group's standard deviation. A score now tells us how far from the centre an observation lies on that scale. This makes different measurements easier to compare, but it does not make their distributions identical or turn an unusual observation into an error."),

  "feature-scaling": history("Why Should Changing Units Change a Model?", [
    source("LeCun and colleagues (1998), Efficient BackProp", "https://cseweb.ucsd.edu/classes/wi08/cse253/Handouts/lecun-98b.pdf"),
  ],
  "Suppose we record the same height in metres and then in centimetres. The person has not changed, but the number has. If a model uses raw distances or takes the same-sized adjustment along every input direction, that choice of units can strongly affect what it does.",
  "As neural networks became practical to train, input preparation became an explicit part of training advice. LeCun and colleagues' 1998 Efficient BackProp discussed centring inputs and bringing their scales into a comparable range. The concern was practical: a learning procedure should not struggle merely because one coordinate is expressed with much larger numbers than another.",
  "Scaling gives us a deliberate choice of units. Standardisation uses the training group's mean and spread; other methods choose a fixed interval. This can make distance comparisons more sensible and gradient steps better balanced. We retain the training transformation for later observations, because a new input must be measured with the same ruler as the examples that fitted the model."),

  "polynomial-features": history("Could a Straight-Line Calculation Describe a Curve?", [legendre,
    source("Gergonne (1815, translated 1974), The Application of the Method of Least Squares to the Interpolation of Sequences", "https://doi.org/10.1016/0315-0860(74)90034-2"),
  ],
  "Measured relationships do not always change at a constant rate. An instrument's response may grow more quickly at larger inputs, so a straight line leaves a systematic pattern in its errors. We need more flexibility, but we would like to retain a fitting method we understand.",
  "Least squares soon became a tool for fitting more than straight lines. Gergonne's 1815 work applied it to polynomial interpolation, connecting the selection of a formula with the way observations were taken. The coefficients could still be estimated through linear equations even though the resulting curve was not straight.",
  "The key is to create extra measurements from an existing input: its square, its cube, or other chosen powers. We fit a coefficient for each. The model remains linear in those coefficients, while the prediction can curve as the original input changes. Each extra term buys flexibility, so we also have to check whether it describes a repeatable pattern or just follows noise."),

  "multiple-polynomial-regression": history("What If One Influence Changes the Effect of Another?", [
    source("Box and Wilson (1951), On the Experimental Attainment of Optimum Conditions", "https://doi.org/10.1111/j.2517-6161.1951.tb00067.x"),
  ],
  "Imagine adjusting both temperature and pressure in a chemical process. Raising the temperature may help at one pressure and hurt at another. A model that adds two completely separate effects cannot describe that interaction.",
  "Box and Wilson's 1951 work on finding favourable experimental conditions developed what became response surface methodology. They used relatively simple fitted surfaces to guide experiments, rather than demanding a complete physical theory of the process before making any useful adjustment.",
  "A surface can include a separate term for each input, squared terms for changing effects, and products for interactions. A temperature-pressure product lets the contribution of temperature depend on the pressure. This is why several inputs and polynomial features belong together. The fitted surface remains an approximation, especially away from the region where the experiments supplied evidence."),

  "gradient-descent-regression": history("What If Solving Everything at Once Is Too Difficult?", [cauchy],
  "A formula that gives the answer in one step is convenient, but it is not always available or practical. With many unknowns, even reducing a system of equations can create a problem harder to manage than the one we started with.",
  "Cauchy raised this difficulty in 1847 while describing a general method for solving simultaneous equations. Instead of relying entirely on elimination, he considered progressively reducing a function that measures the discrepancy. This is an early source for the idea of steepest descent.",
  "For regression, we start with a line and measure its error. We ask how a small change to each coefficient would change that error, then adjust in a direction that locally reduces it. We repeat because the useful direction can change after a step. The step size matters: a local slope is guidance near the current position, not permission to jump an arbitrary distance."),

  "pca": history("Could We Describe the Same Cloud with Fewer Measurements?", [pearson],
  "Imagine measuring several aspects of the same objects. If two measurements tend to increase together, listing both may repeat much of the same information. We would like a shorter description that still distinguishes the observations reasonably well.",
  "Pearson's 1901 paper asked how to fit a line or a plane to a collection of points in space. Unlike ordinary regression, where one variable is singled out as the answer, the question concerned the geometry of the collection itself. Which lower-dimensional surface lies closest to the observations?",
  "Picture a long, narrow cloud of points. A line along its length preserves much more of its shape than a line across its width. Principal component analysis finds successive directions of greatest variation and lets us retain a few of them. That is useful compression when the retained variation matters, but a direction with large variation is not automatically the direction that best predicts a particular label."),

  "ridge-lasso": history("Why Can a Small Change in the Data Produce Huge Coefficients?", [
    source("Hoerl and Kennard (1970), Ridge Regression: Biased Estimation for Nonorthogonal Problems", "https://stat.cmu.edu/technometrics/90-00/vol-42-01/v4201080.pdf"),
    source("Tibshirani (1996), Regression Shrinkage and Selection via the Lasso", "https://doi.org/10.1111/j.2517-6161.1996.tb02080.x"),
  ],
  "When two inputs carry nearly the same information, a regression can give one a large positive coefficient and the other a large negative coefficient. Their contributions largely cancel. Predictions on the observed data may look reasonable, even though small changes to those data produce very different coefficients.",
  "Hoerl and Kennard examined this instability in their 1970 ridge regression paper. They accepted some bias in exchange for more stable estimates by penalising large coefficients. Tibshirani's 1996 lasso paper combined shrinkage with variable selection: its different penalty could set some coefficients exactly to zero.",
  "Both methods make the model pay for coefficient size as well as prediction error. Ridge discourages large coefficients smoothly. Lasso can remove a contribution entirely. We are choosing a compromise, so the penalty strength needs evaluation on data beyond the fitting sample. Neither penalty can tell us, by itself, which variables are causes."),
};
