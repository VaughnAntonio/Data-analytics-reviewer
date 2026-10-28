/* IC4.0 Data Analysis Reviewer — content data.
   Source authority: Exam_IC40.pdf (Data Analysis in IC4.0 2024/2025, Final exam).
   Knowledge sources: Topic_1..Topic_4 slides (S. Benítez / V. Guerrero, UC3M).
   Slide refs use the slide's own page counter, e.g. "T2 s45" = Topic 2, slide 45/74.
   Anything not from these files is marked ext:true with a link. */

window.IC40 = (function () {

const TOPICS = [
  { id: 't1', n: 1, title: 'Introduction', file: 'Topic_1.pdf', slides: 50,
    blurb: 'Supervised vs unsupervised learning, training vs test error, overfitting, bias–variance.' },
  { id: 't2', n: 2, title: 'Supervised Learning: Regression', file: 'Topic_2.pdf', slides: 74,
    blurb: 'Linear regression, RSS and R², Cp / BIC / Adjusted R², cross-validation, subset selection.' },
  { id: 't3', n: 3, title: 'Supervised Learning: Classification', file: 'Topic_3.pdf', slides: 72,
    blurb: 'Logistic regression, confusion matrix, test error, KNN, classification trees.' },
  { id: 't4', n: 4, title: 'Unsupervised Learning', file: 'Topic_4.pdf', slides: 38,
    blurb: 'Only distances and standardisation are needed for this paper (they support KNN in Q3).' }
];

/* ---------- EXAM: every question and subquestion, original wording ---------- */
const EXAM_META = {
  title: 'Data Analysis in IC4.0 2024/2025 — Final exam',
  totalMarks: 10,
  duration: null, // not stated in the paper
  notes: [
    'The paper does not state a duration. The mock-exam timer is optional and you set the length.',
    'Q4(i) asks about "Figures 5 and 6", but in the paper the lcp histogram is captioned Figure 4, the age histogram Figure 5, and Figure 6 is the formula sheet. Read it as the lcp and age histograms.',
    'Figure 2 (logistic coefficients) is captioned "exercise 1 (ii)" but belongs to exercise 2 (ii).',
    'Q4 says the models were fitted on 94 men; Topic 1 slide 29 describes the same prostate study with 97 men.',
    'Figures 1–6 are images. Their contents (tree splits, coefficients, test observations, histograms, formula sheet) could not be read from the project text, so the reviewer gives the method plus a calculator where you enter the figure values. Nothing from those figures has been invented.'
  ]
};

const Q = [
  /* ---- Exercise 1 ---- */
  { id: 'q1i', ex: 1, part: '(i)', marks: 0.5, topics: ['t2'], format: 'True/false + justification',
    exHead: '1. (2 points) Theoretical exercise: We perform best subset, forward stepwise and backward stepwise selection on a single dataset. For each approach, we obtain p+1 models, containing 0, 1, 2, . . . , p predictors. Briefly explain your answers:',
    text: 'Is it true or false that the predictors in the k−variable model identified by forward stepwise are a subset of the predictors in the (k + 1)-variable model identified by backward stepwise selection? Justify your answer.',
    concepts: ['c-step', 'c-best'], refs: ['T2 s56 (forward)', 'T2 s62 (backward)', 'T2 s68 (comparison table)'],
    explain: 'Each stepwise method builds its own chain of models. Forward adds one variable at a time starting from no predictors; backward removes one at a time starting from all predictors. Inside one method the models are nested, but the two chains are built by different searches, so there is no rule linking a forward model to a backward model.',
    model: 'False. Forward and backward stepwise build their sequences of models along different paths. Forward starts from M0 (no predictors) and at each step adds the variable that gives the greatest improvement given the variables already in the model. Backward starts from the full model Mp and at each step removes the least useful variable. So the k-variable forward model and the (k+1)-variable backward model come from two different searches and nothing forces the first to be contained in the second. (Within one method the models are nested: forward Mk ⊂ forward Mk+1, and backward Mk ⊂ backward Mk+1.)',
    rubric: [
      { label: 'States the verdict: False', re: ['\\bfalse\\b', 'not (necessarily )?(true|a subset)', 'not guaranteed'] },
      { label: 'Explains that the two methods follow different paths / searches', re: ['different (path|search|order|sequence|procedure|route|model)', 'independent', 'separate(ly)?', 'not (the same|related)', 'no (link|relation)'] },
      { label: 'Describes forward: starts empty and adds one variable at a time', re: ['forward[\\s\\S]{0,120}(add|start[\\s\\S]{0,30}(empty|no predictor|null|m0|zero))'] },
      { label: 'Describes backward: starts full and removes one variable at a time', re: ['backward[\\s\\S]{0,120}(remov|drop|delet|eliminat|start[\\s\\S]{0,30}full)'] },
      { label: 'Notes models are nested only within the same method (bonus)', re: ['nested', 'within (the same|each|one) method', 'same method'], bonus: true }
    ],
    wrong: [ { test: 'trueNotFalse', msg: 'Your answer reads as "True". The correct verdict is False.' } ]
  },
  { id: 'q1ii', ex: 1, part: '(ii)', marks: 0.5, topics: ['t2'], format: 'True/false + justification',
    text: 'Is it true or false that the predictors in the k−variable model identified by best subset are a subset of the predictors in the (k + 1)-variable model identified by best subset selection? Justify your answer.',
    concepts: ['c-best'], refs: ['T2 s50 (best subset algorithm)'],
    explain: 'Best subset picks the best model of each size separately, by fitting every combination of that size. The winner with k+1 variables is chosen without looking at the winner with k variables, so the two do not have to share variables.',
    model: 'False. Best subset selection fits all C(p, k) models with exactly k predictors and keeps the one with smallest RSS (largest R²), and it does the same, independently, for size k+1. The best (k+1)-variable model does not have to contain the best k-variable model. For example, the best 1-variable model could be {X1} while the best 2-variable model is {X2, X3}. Best-subset models are not nested.',
    rubric: [
      { label: 'States the verdict: False', re: ['\\bfalse\\b', 'not (necessarily )?(true|a subset)', 'not guaranteed'] },
      { label: 'Best subset chooses each size separately from all combinations', re: ['(each|every) (size|k)\\b', 'separately', 'independent', 'all (possible )?(combination|model|subset)', 'c\\(p', 'exhaustive'] },
      { label: 'States the models need not be nested / contain each other', re: ['not nested', 'need not (contain|include)', "(doesn.t|does not|don.t|do not) (have to|need to)? ?(contain|include)", 'different (variables|predictors)'] },
      { label: 'Gives an example (bonus)', re: ['e\\.?g', 'example', 'for instance', '\\{\\s*x'], bonus: true }
    ],
    wrong: [ { test: 'trueNotFalse', msg: 'Your answer reads as "True". The correct verdict is False.' } ]
  },
  { id: 'q1iii', ex: 1, part: '(iii)', marks: 0.5, topics: ['t2'], format: 'Short explanation',
    text: 'Which of the three models with k predictors has the smallest training Residual Sum of Squares (RSS)? Why?',
    concepts: ['c-best', 'c-step', 'c-rss'], refs: ['T2 s35 (RSS)', 'T2 s50', 'T2 s68 ("Best possible model found: YES / NO / NO")'],
    explain: 'Training RSS is measured on the data used to fit. Best subset tries every model of size k, so it always finds the lowest training RSS for that size. The stepwise methods only try some of those models.',
    model: 'Best subset. For a given k it fits every one of the C(p, k) models with k predictors and keeps the one with the smallest training RSS. The k-variable models chosen by forward and backward stepwise are among those candidates, so the best-subset model has training RSS less than or equal to theirs. It can tie if a stepwise method happens to find the same model. This matches the T2 s68 table: only best subset is guaranteed to find the best possible model.',
    rubric: [
      { label: 'Names best subset', re: ['best[ -]?subset'] },
      { label: 'Says it considers all models of size k', re: ['\\ball\\b', 'every', 'exhaustive', 'c\\(p', 'combination'] },
      { label: 'Stepwise models are among the candidates best subset checks', re: ['(forward|backward|stepwise)[\\s\\S]{0,80}(among|included|considered|candidate|subset of|also)', 'includ(es|ing) (the )?(forward|backward|stepwise)'] },
      { label: 'Notes "less than or equal" / possible tie', re: ['≤', '<=', 'less than or equal', 'at most', '\\btie', 'same model', 'or equal'] }
    ],
    wrong: [ { test: 'stepwiseAnswer', msg: 'Forward or backward stepwise cannot beat best subset on training RSS for the same k.' } ]
  },
  { id: 'q1iv', ex: 1, part: '(iv)', marks: 0.5, topics: ['t1', 't2'], format: 'Short explanation',
    text: 'Which of the three models with k predictors has the smallest test Residual Sum of Squares (RSS)? Why?',
    concepts: ['c-trte', 'c-best', 'c-cv'], refs: ['T1 s43–44 (training vs test error, overfitting)', 'T2 s35, s42 (test error must be estimated)'],
    explain: 'Test RSS is computed on new data. A low training RSS does not promise a low test RSS (T1 s44). Best subset searches many more models, so it can overfit. You cannot know in advance which method wins.',
    model: 'It cannot be determined in general. Test RSS is computed on observations not used to fit the model, and there is no guarantee that the method with the lowest training error also has the lowest test error (T1 s44). Best subset searches many more models, so it may pick a model that fits noise in the training data (overfitting). Forward or backward stepwise could, by chance, give a model with smaller test RSS. Which one is best must be estimated, for example with a validation set or cross-validation.',
    rubric: [
      { label: 'Says it cannot be known in advance / depends', re: ["(cannot|can.t|can not|not possible to|impossible to) (be )?(know|say|determin|tell|guarantee|predict)", 'depends', 'not necessarily', 'no guarantee', 'any of (the|them)', 'unknown'] },
      { label: 'Contrasts training error with test error', re: ['training[\\s\\S]{0,60}test', 'test[\\s\\S]{0,60}training', 'unseen|new data|not used (to|for) fit'] },
      { label: 'Mentions overfitting', re: ['overfit', 'over-fit', 'fit(s|ting)? (the )?noise', 'high variance'] },
      { label: 'Says it must be estimated (CV / validation / test set)', re: ['cross.?validation', 'validation set', 'test set', 'held.?out', 'loocv', 'k.?fold', '\\bcv\\b'] }
    ],
    wrong: [ { test: 'bestSubsetSure', msg: 'Best subset is not guaranteed to have the smallest test RSS. It can overfit.' } ]
  },

  /* ---- Exercise 2 ---- */
  { id: 'q2i', ex: 2, part: '(i)', marks: 2, topics: ['t3'], format: 'Calculation: confusion matrix + test error', calc: 'tree',
    exHead: '2. (4.5 points) A total of 600 patients who may or may not have heart disease were collected in a dataset. For each individual, a total of 76 attributes were measured. Prior to the analyses, 12 (including the target variable) of the attributes were pre-selected (Age, Sex, ChestPainType, RestingBP, Cholesterol, FastingBS, RestingECG, MaxHR, ExerciseAngina, Oldpeak, ST_Slope, num). Let us consider that the 5 observations in Table 1 are available for testing the performance of a classification rule.',
    text: 'A classification tree has been trained using the available 600 observations and the result obtained in R is shown in Figure 1. Compute the confusion matrix and the test error of the fitted classification tree using the observations in Table 1.',
    concepts: ['c-tree', 'c-cm'], refs: ['T3 s42–43 (tree structure)', 'T3 s49–50 (prediction)', 'T3 s18 (confusion matrix)', 'T3 s22 (error rate)'],
    explain: 'Drop each of the 5 patients down the tree in Figure 1. At every node answer the split question with that patient\'s value and follow the matching branch until you reach a leaf; the leaf label is the prediction. Then compare predictions with the observed HeartDisease row (0, 1, 0, 1, 0) and count.',
    model: 'Method (numbers depend on Figure 1):\n1. For each patient, start at the root and follow the branches whose condition the patient satisfies (e.g. ST_Slope = Up / ≠ Up, Oldpeak ≤ threshold) until a leaf. The leaf class is ŷ.\n2. Observed classes from Table 1: Patients 1, 3, 5 have HeartDisease = 0; Patients 2, 4 have HeartDisease = 1. So n0 = 3, n1 = 2, n = 5.\n3. Fill the matrix with rows = observed, columns = predicted: n00 (true negatives), n01 (false positives), n10 (false negatives), n11 (true positives).\n4. Test error = (n01 + n10) / 5.\nUse the tree calculator below to enter your traced predictions and get the matrix and error.',
    rubric: null
  },
  { id: 'q2ii', ex: 2, part: '(ii)', marks: 2, topics: ['t3', 't2'], format: 'Calculation: probabilities, confusion matrix, test error', calc: 'logit',
    text: 'A logistic regression model has been trained using the available 600 and four significant variables. The variables and their associated coefficients are in Figure 2. Compute the confusion matrix and the test error of the logistic regression model using the observations in Table 1 and a cutoff value of 0.45.',
    concepts: ['c-logit', 'c-dummy', 'c-cm'], refs: ['T3 s9 (logistic model)', 'T3 s16–17 (predicting, cutoff)', 'T2 s19–22 (dummy variables)', 'T3 s18, s22'],
    explain: 'For each patient: build the linear predictor η = β̂0 + β̂1x1 + … + β̂4x4 using the four variables in Figure 2 (categorical variables enter as 0/1 dummies), turn it into a probability p = 1 / (1 + e^(−η)), and predict 1 if p > 0.45, else 0. Then build the confusion matrix as in (i).',
    model: 'Method (numbers depend on Figure 2):\n1. Read the intercept and the four coefficients from Figure 2. A categorical variable appears in R as a dummy such as "SexM" or "ST_SlopeUp": it is 1 if the patient has that level and 0 otherwise.\n2. For each patient compute η = β̂0 + Σ β̂j xj and P(HeartDisease = 1 | x) = 1 / (1 + e^(−η)).\n3. Cutoff z = 0.45: predict 1 if P > 0.45, predict 0 if P < 0.45.\n4. Compare with the observed 0, 1, 0, 1, 0 and build the 2×2 matrix (rows observed, columns predicted).\n5. Test error = (n01 + n10) / 5.\nUse the logistic calculator below: pick the four variables, type the coefficients, and it computes η, p, ŷ, the matrix and the error.',
    rubric: null
  },
  { id: 'q2iii', ex: 2, part: '(iii)', marks: 0.5, topics: ['t3'], format: 'Decision + justification', calc: 'choose',
    text: 'Based on the results in (i) and (ii), decide which classification method you select and why.',
    concepts: ['c-cm', 'c-cmp'], refs: ['T3 s20–22 (accuracy, sensitivity, specificity, error)', 'T3 s30, s52 (trees vs other approaches)'],
    explain: 'Pick the method with the lower test error. If they tie, use a second criterion: in a heart-disease setting missing a sick patient (false negative) is the costly mistake, so compare sensitivity; also mention interpretability. Always point out that 5 test patients is a very small test set.',
    model: 'Select the method with the smaller test error from (i) and (ii), because test error estimates how well each rule classifies new patients. If both give the same test error, compare sensitivity (the share of patients with heart disease correctly detected), since a false negative is the most serious error here; if still tied, prefer the classification tree for interpretability (T3 s52) or logistic regression for its probability output and stability (trees are high-variance, T3 s52). Note that with only 5 test observations the comparison is not very reliable. (The calculator below writes this decision from your numbers in (i) and (ii).)',
    rubric: [
      { label: 'Compares the two test errors', re: ['test error', 'error rate', 'misclassif', 'accuracy'] },
      { label: 'Chooses the method with the lower error', re: ['lower', 'smaller', 'fewer', 'less error', 'better', 'higher accuracy'] },
      { label: 'Uses a second criterion (sensitivity / false negatives / interpretability)', re: ['sensitiv', 'false negative', 'specific', 'interpret', 'simpl', 'probabilit'] },
      { label: 'Warns the test set is tiny (5 patients)', re: ['(only|just) (5|five)', 'small (test|sample)', 'not (very )?reliable', 'few (observations|patients)', 'five (observations|patients)'] }
    ],
    wrong: []
  },

  /* ---- Exercise 3 ---- */
  { id: 'q3', ex: 3, part: '', marks: 1.5, topics: ['t3', 't2', 't4'], format: 'Structured description (algorithm)',
    exHead: '3. (1.5 points) Theoretical exercise:',
    text: 'Describe how the test error of K-Nearest Neighbors would be obtained by means of leave-one-out in a classification problem for a fixed value of K.',
    concepts: ['c-cv', 'c-knn', 'c-cm', 'c-dist'], refs: ['T2 s45–46 (Leave-One-Out)', 'T3 s31 (KNN)', 'T3 s22 (error rate with indicator)', 'T4 s3, s8 (standardise, distances)'],
    explain: 'LOOCV repeats a small experiment n times. Each time one observation is the test set and the other n−1 are the training set. KNN has no fitting step: "training" just means the neighbours are searched among the n−1 points. For classification the error of each round is 0 or 1, not a squared error.',
    model: 'Fix K. Let Ω = {(x1, y1), …, (xn, yn)}.\nFor i = 1, …, n:\n• Test set: the single observation (xi, yi). Training set: Ω \\ {(xi, yi)}, the other n − 1 observations.\n• Find the K observations in the training set closest to xi (e.g. Euclidean distance, after standardising the variables): the neighbourhood Nxi.\n• Estimate P(Y = j | X = xi) = (1/K) Σ_{l ∈ Nxi} I(yl = j) and predict ŷi = the class with the largest proportion (majority vote).\n• Record the error Erri = I(yi ≠ ŷi): 1 if misclassified, 0 otherwise.\nThe LOO estimate of the test error is the average: Err_LOO = (1/n) Σ_{i=1}^{n} I(yi ≠ ŷi).\nBecause no split is random, repeating the procedure gives the same result; it needs n neighbour searches, which is slow for large n.',
    rubric: [
      { label: 'Loops over every observation, leaving one out each time', re: ['(each|every) (observation|point|individual|data point)', 'for i ?= ?1', 'n times', '(one|single) (observation|point|individual)[\\s\\S]{0,30}(left|held|removed|out|test)', 'leave[- ]one[- ]out'] },
      { label: 'Training set is the remaining n−1 observations', re: ['n ?[-−] ?1', 'remaining', '(all )?(the )?(other|rest)', 'except'] },
      { label: 'Finds the K nearest neighbours of the left-out point', re: ['\\bk\\b[\\s\\S]{0,15}(nearest|closest)', 'neighbou?r'] },
      { label: 'Uses a distance (e.g. Euclidean)', re: ['distance', 'euclid', 'closest'] },
      { label: 'Predicts by majority class / largest proportion', re: ['majority', 'most (frequent|common)', 'largest (proportion|probability|fraction)', 'vote', 'highest (proportion|probability)'] },
      { label: 'Records a 0/1 error (indicator / misclassification)', re: ['indicator', 'i\\(', 'misclassif', '(0|zero) or (1|one)', '1 if', 'wrong(ly)?', 'incorrect', '≠', '!='] },
      { label: 'Averages the n errors to get the test error', re: ['average', '\\bmean\\b', '1 ?/ ?n', 'divid[\\s\\S]{0,20}\\bn\\b', 'sum[\\s\\S]{0,40}/ ?n'] },
      { label: 'Mentions standardising or that LOO is deterministic (bonus)', re: ['standardi[sz]', 'scale', 'deterministic', 'same result', 'no random', 'not random'], bonus: true }
    ],
    wrong: [ { test: 'mseForClass', msg: 'For classification, use the misclassification indicator I(yi ≠ ŷi), not a squared error.' } ]
  },

  /* ---- Exercise 4 ---- */
  { id: 'q4i', ex: 4, part: '(i)', marks: 0.5, topics: ['t1'], format: 'Graph interpretation (histograms)', figure: true,
    exHead: '4. (2 points) The data for this exercise comes from a medical study to examine the relationship between the level of prostate-specific antigen and a number of clinical measures in men who were about to receive a radical prostatectomy. Variables: lpsa (log PSA), lcavol, lweight, age, lbph, svi, lcp, gleason, pgg45. Table 2 depicts the coefficients of three linear models fitted to predict lpsa using measurements of 94 men (shaded cell = variable not in the model).',
    text: 'Give a detailed interpretation of the histograms of variables lcp and age in Figures 5 and 6, respectively.',
    concepts: ['c-hist', 'c-types'], refs: ['Exam Figures 4–5 (image, not readable here)', 'T1 s29–30 (prostate data, pairs plot axes)'],
    explain: 'A "detailed interpretation" of a histogram covers: shape (symmetric or skewed, which side the tail is on), centre (where most values are / the peak), spread (range), and unusual features (a spike, gaps, outliers). Then say what it means for the variable.',
    model: 'Framework: shape → centre → spread → unusual features → consequence.\nlcp (log of capsular penetration): strongly right-skewed (positively skewed), not normal. A large share of the men sit at the minimum value, about −1.4, giving one tall bar at the left; the rest spread out to the right up to about 3 with a long right tail. So most men have little or no capsular penetration and a minority have large values; the mean is above the median.\nage: left-skewed (negatively skewed), unimodal. Most men are between about 60 and 70, with the peak in the mid-60s; the tail goes towards younger ages (down to about 40), and the youngest men may look like low outliers. This fits a group of men about to have a prostatectomy.\n[The specific shapes above come from the published prostate dataset (ESL book, the course reference) and the axis ranges in T1 s30. Check them against Figures 4–5 in your copy.]',
    extNote: 'Histogram-reading checklist and dataset shapes are supplementary: the slides contain no histogram-interpretation text. Sources: U.S. Census Bureau "Describing and Comparing Histograms" (census.gov/schools/activities/math/census-in-counties.html); Hastie, Tibshirani & Friedman, The Elements of Statistical Learning, prostate data (cited on T1 s25).',
    rubric: [
      { label: 'Describes shape / skewness', re: ['skew', 'asymmetr', 'symmetric', '\\btail'] },
      { label: 'Gives the direction (right/left, positive/negative)', re: ['right', 'left', 'positive', 'negative'] },
      { label: 'Describes the centre (peak / median / where most values are)', re: ['cent(er|re)', 'median', '\\bmean\\b', '\\bmode\\b', 'peak', 'most (of the )?(values|observations|men|patients)'] },
      { label: 'Describes the spread / range', re: ['range', 'spread', 'between', 'variab', 'from [-−]?\\d'] },
      { label: 'Points out unusual features (spike, outliers, concentration)', re: ['outlier', 'spike', '\\bgap', 'concentrat', 'pile', 'many (values|observations|men) (at|near)', 'bimodal', 'tall bar'] },
      { label: 'Covers lcp specifically', re: ['\\blcp\\b'] },
      { label: 'Covers age specifically', re: ['\\bage\\b'] }
    ],
    wrong: []
  },
  { id: 'q4ii', ex: 4, part: '(ii)', marks: 0.5, topics: ['t2'], format: 'Read a table + apply criteria',
    text: 'The Mallow\'s coefficient (Cp), BIC, coefficient of determination R2 and the Adjusted-R2 of the three fitted models are in Table 3. Which model is the best according to each criterion?',
    table: { head: ['', 'Cp', 'BIC', 'R²', 'Adj-R²'], rows: [['Model A', '12.77', '230.87', '0.63', '0.61'], ['Model B', '28.46', '242.12', '0.55', '0.54'], ['Model C', '48.84', '263.77', '0.49', '0.46']], caption: 'Table 3 (from the exam)' },
    concepts: ['c-ind', 'c-rss'], refs: ['T2 s39 (Cp: lowest)', 'T2 s40 (BIC: lowest)', 'T2 s41 (Adj-R²: largest)', 'T2 s18, s35 (R² always increases with more variables)'],
    explain: 'Know the direction of each criterion: Cp and BIC are "lower is better"; R² and Adjusted R² are "higher is better". Then read off Table 3.',
    model: 'Cp: choose the lowest → Model A (12.77).\nBIC: choose the lowest → Model A (230.87).\nR²: choose the highest → Model A (0.63).\nAdjusted R²: choose the highest → Model A (0.61).\nSo Model A is best on all four criteria. Remark: R² always increases when variables are added and is computed on training data, so it is not a fair criterion for comparing models of different sizes (T2 s18, s35); Cp, BIC and Adjusted R² adjust for model size.',
    rubric: [
      { label: 'Cp: lowest is best', re: ['(lowest|smallest|minim|min\\b|lower)[\\s\\S]{0,30}c\\s?p', 'c\\s?p[\\s\\S]{0,40}(lowest|smallest|minim|lower)', '12\\.77'] },
      { label: 'BIC: lowest is best', re: ['(lowest|smallest|minim|lower)[\\s\\S]{0,30}bic', 'bic[\\s\\S]{0,40}(lowest|smallest|minim|lower)', '230\\.87'] },
      { label: 'R²: highest is best', re: ['(highest|largest|maxim|higher|biggest)[\\s\\S]{0,30}r ?(2|²|\\^2|-?squared)', 'r ?(2|²|\\^2|-?squared)[\\s\\S]{0,40}(highest|largest|maxim|higher)', '0\\.63'] },
      { label: 'Adjusted R²: highest is best', re: ['adj[\\s\\S]{0,60}(highest|largest|maxim|higher)', '(highest|largest|maxim|higher)[\\s\\S]{0,30}adj', '0\\.61'] },
      { label: 'Concludes Model A for every criterion', re: ['model a', '\\ba\\b[\\s\\S]{0,25}(all|every|each)', '(all|every|each)[\\s\\S]{0,40}\\ba\\b'] },
      { label: 'Notes R² is not suitable for comparing model sizes (bonus)', re: ['r ?(2|²)[\\s\\S]{0,90}(always increase|more variables|not (suitable|appropriate|fair)|training)'], bonus: true }
    ],
    wrong: [ { test: 'cpHighest', msg: 'Cp and BIC are "lower is better", not higher.' } ]
  },
  { id: 'q4iii', ex: 4, part: '(iii)', marks: 1, topics: ['t2'], format: 'Calculation: test MSE + decision', calc: 'lin', figure: true,
    text: 'Given the test observations in Figure 3, which model (A, B or C) would you consider the best among the proposed ones? Why?',
    table: { head: ['', 'Intercept', 'lcavol', 'lweight', 'age', 'lbph', 'svi', 'lcp', 'gleason', 'pgg45'], rows: [['Model A', '-0.08', '', '', '', '', '', '', '', ''], ['Model B', '1.08', '', '', '', '', '', '', '', ''], ['Model C', '-0.35', '', '', '', '', '', '', '', '']], caption: 'Table 2 numbers as extracted, in column order: A = −0.08, 0.62, 0.74, −0.02, 0.01 · B = 1.08, 0.72, −0.002, 0.09 · C = −0.35, 0.89, −0.01, 0.08, 1.29, 0.01. The shading that shows which columns are filled was lost in extraction; tick the filled columns in the calculator.' },
    concepts: ['c-coef', 'c-cv', 'c-ind'], refs: ['T2 s14 (prediction ŷ)', 'T2 s43 (test MSE on a test set)', 'T1 s43–44 (test error is what matters)'],
    explain: 'Use each model to predict lpsa for every test observation in Figure 3, compute the test MSE = (1/t) Σ (yi − ŷi)², and pick the model with the smallest test MSE. Test performance on unseen data is the deciding criterion; Cp/BIC/Adj-R² in (ii) are only indirect estimates of it.',
    model: 'Method (numbers depend on Figure 3):\n1. For each model write its equation from Table 2, e.g. lpsa-hat = β̂0 + β̂(var1)·var1 + … using only the variables that model contains.\n2. For each test observation compute ŷ with each model and the squared error (y − ŷ)².\n3. Test MSE of a model = (1/t) Σ (yi − ŷi)² over the t test observations.\n4. Choose the model with the smallest test MSE, because it predicts unseen data best (test error is the target; Cp, BIC and Adj-R² only estimate it indirectly, T2 s38). If this agrees with (ii) (Model A), say so; if not, prefer the direct test-set evidence but note that a handful of test points is a noisy estimate.\nUse the regression calculator below.',
    rubric: null
  }
];

/* ---------- CONCEPTS (only those the exam needs) ---------- */
/* fields: simple, formal, how[], details[], example, visual (diagram id), exam, mistakes[], quick, terms[] */
const CONCEPTS = [
  { id: 'c-sup', topic: 't1', title: 'Supervised vs unsupervised learning', refs: ['T1 s36', 'T1 s37', 'T1 s46'], q: ['q2i', 'q2ii', 'q4iii'],
    simple: 'Supervised learning means you have a target you want to predict and examples where the answer is known. Unsupervised learning has no target: you only look for structure in the data.',
    formal: 'Supervised: for each individual i we observe the target yi and features xi = (xi1, …, xik), and assume y = f(x) + ε; we estimate f to predict y for new individuals. Regression if y is continuous, classification if y is categorical. Unsupervised: only xi is observed; the goal is to find patterns (clustering, dimensionality reduction).',
    how: ['Collect training data with features and known outcomes.', 'Choose a method (parametric like linear/logistic regression, or non-parametric like KNN or trees).', 'Fit it on the training data to get f̂.', 'Predict ŷ = f̂(x) for new observations and measure test error.'],
    details: ['Exam Q2 (heart disease, output class num) is supervised classification.', 'Exam Q4 (predict lpsa, continuous) is supervised regression.', 'Error splits into reducible error (better f̂) and irreducible error (ε) (T1 s39).'],
    example: 'Prostate cancer (T1 s29): predict lpsa from clinical measures → regression. Spam detection (T1 s27) → binary classification.',
    visual: null,
    exam: 'In supervised learning we observe a response y and predictors x for a training set and estimate f in y = f(x) + ε to predict y for new observations; it is regression when y is continuous (Q4, lpsa) and classification when y is categorical (Q2, heart disease).',
    mistakes: ['Calling Q2 regression because logistic "regression" is used — it is a classification problem.', 'Forgetting the error term ε in y = f(x) + ε.'],
    quick: 'Target known → supervised (regression / classification). No target → unsupervised.',
    terms: ['response / target', 'predictors / features', 'f̂', 'regression', 'classification'] },

  { id: 'c-trte', topic: 't1', title: 'Training error, test error and overfitting', refs: ['T1 s43', 'T1 s44'], q: ['q1iii', 'q1iv', 'q2iii', 'q3', 'q4iii'],
    simple: 'Training error is how well the model fits the data it learned from. Test error is how well it does on new data. A model can memorise its training data and still predict badly: that is overfitting.',
    formal: 'Training error quantifies how close the predicted responses for the training observations are to their true values. Test error assesses the accuracy of predictions on previously unseen test data. A method with small training error but large test error overfits; overfitting means a less flexible model would have given a smaller test error (T1 s44).',
    how: ['Fit on training data → compute training error (e.g. RSS, misclassification rate on training data).', 'Apply the fitted model to observations not used in fitting → test error.', 'Compare: a big gap (low train, high test) signals overfitting.'],
    details: ['No guarantee that the lowest training error gives the lowest test error.', 'Overfitting happens when the procedure picks up random patterns instead of true properties of f.', 'Test error is the quantity we actually care about; when no test set exists we estimate it (Cp, BIC, Adj-R², cross-validation).'],
    example: 'Q1(iii)/(iv): best subset always has the smallest training RSS, but its test RSS can be beaten.',
    visual: null,
    exam: 'Training error is measured on the data used to fit the model; test error on unseen data. They are related but a small training error does not guarantee a small test error: when training error is small and test error large, the model is overfitting.',
    mistakes: ['Choosing a model by training RSS or R² alone.', 'Saying "lowest training error ⇒ lowest test error".'],
    quick: 'Train error ↓ always with flexibility; test error is U-shaped. Judge models on test error.',
    terms: ['training error', 'test error', 'overfitting', 'unseen data'] },

  { id: 'c-bv', topic: 't1', title: 'Bias–variance trade-off', refs: ['T1 s45'], q: ['q1iv', 'q2iii'],
    simple: 'Simple models miss real patterns (bias). Very flexible models change a lot when the data change (variance). Good models balance the two.',
    formal: 'Variance: the amount by which f̂ would change if estimated on a different training set (more flexible ⇒ higher variance). Bias: the error introduced by approximating a complex real problem by a simpler model (more flexible ⇒ less bias). Minimising expected test error requires low bias and low variance simultaneously.',
    how: ['Increase flexibility → bias falls, variance rises.', 'Test error first falls, then rises once variance dominates.'],
    details: ['A curve through every training point: low bias, high variance.', 'A horizontal line: low variance, high bias.', 'Searching many models (best subset) or deep trees raises variance.', 'Trees are "very non-robust (high variance)" (T3 s52).'],
    example: 'Why best subset can have a worse test RSS than stepwise in Q1(iv).',
    visual: null,
    exam: 'More flexible methods have lower bias but higher variance; the expected test error is minimised by a method with both low bias and low variance, which is why the most flexible model is not automatically the best on test data.',
    mistakes: ['Mixing up which way bias and variance move with flexibility.'],
    quick: 'Flexible: bias ↓ variance ↑. Rigid: bias ↑ variance ↓.',
    terms: ['bias', 'variance', 'flexibility'] },

  { id: 'c-types', topic: 't1', title: 'Variable types', refs: ['T1 s18'], q: ['q2ii', 'q4i'],
    simple: 'Know whether a variable is a number on a scale or a label. It decides how the variable enters a model and how you plot it.',
    formal: 'Continuous (fuel consumption), discrete (number of sensors), binary (works / doesn\'t), categorical (colour), ordinal (short / mid / long).',
    how: ['Continuous → enters a linear/logistic model directly; plotted with a histogram.', 'Categorical with m levels → m − 1 dummy variables (T2 s19).'],
    details: ['Q2: Age, RestingBP, Cholesterol, MaxHR, Oldpeak are continuous; Sex, ChestPainType, FastingBS, RestingECG, ExerciseAngina, ST_Slope are categorical.', 'Q4: lcp and age are continuous → histograms.'],
    example: 'ST_Slope (Up / Flat / Down) needs two dummies in a regression.',
    visual: null,
    exam: 'Continuous variables enter the model as numbers; a categorical variable with m categories is coded with m − 1 dummy variables.',
    mistakes: ['Plugging a category label (e.g. "Flat") into a formula as if it were a number.'],
    quick: 'Number → use as is. Label → dummies.',
    terms: ['continuous', 'categorical', 'binary', 'ordinal'] },

  { id: 'c-hist', topic: 't1', title: 'Reading a histogram', ext: true, refs: ['T1 s49 (visual vocabulary, image only)', 'External: U.S. Census Bureau'], q: ['q4i'],
    extLink: 'https://www.census.gov/schools/activities/math/census-in-counties.html',
    simple: 'A histogram shows how often values fall in each range. Describe it like a landscape: where the hill is, how wide it is, which way it leans, and anything odd.',
    formal: 'A histogram groups a continuous variable into bins and shows the count (or frequency) per bin. Describe its shape (symmetric, right/positively skewed, left/negatively skewed, unimodal/bimodal), centre, spread and unusual features (outliers, gaps, spikes).',
    how: ['Read the axes: variable and units on x, count/frequency on y.', 'Shape: where is the long tail? Tail right = right-skewed (mean > median). Tail left = left-skewed (mean < median).', 'Centre: the tallest bars / typical value.', 'Spread: smallest to largest value.', 'Unusual: a single tall spike, empty bins, isolated bars (outliers).', 'Conclude: what this says about the variable (normal-ish? concentrated? transformation needed?).'],
    details: ['Skewness is named after the tail, not the peak.', 'Log-transformed variables (like lcp) can still be skewed.', 'A spike at the minimum often means many identical low values.'],
    example: 'Exam Q4(i): lcp and age from the prostate data.',
    visual: 'd-hist',
    exam: 'The histogram of X is right-skewed: most observations lie between a and b with a peak near c, and a long tail stretches to the right up to d. There is a spike at e, so many observations share that value. The distribution is not symmetric, so the mean is larger than the median.',
    mistakes: ['Naming skew by the side of the peak (wrong) instead of the tail.', 'Only saying "it is skewed" without centre, spread and unusual features — the question asks for a detailed interpretation.'],
    quick: 'SCSU: Shape, Centre, Spread, Unusual features.',
    terms: ['right/positive skew', 'left/negative skew', 'unimodal', 'outlier', 'spread'] },

  /* ---- Topic 2 ---- */
  { id: 'c-rss', topic: 't2', title: 'RSS and R²', refs: ['T2 s8', 'T2 s12', 'T2 s18', 'T2 s35–37'], q: ['q1iii', 'q4ii'],
    simple: 'RSS adds up the squared prediction mistakes on the training data. R² is the share of the variation in y the model explains. Both always improve when you add variables.',
    formal: 'Residual ei = yi − ŷi. RSS = Σ ei². R² ∈ [0, 1] measures the proportion of variability in Y explained by the model; R² = Cor(Y, Ŷ)². Least squares chooses β̂ to minimise RSS.',
    how: ['Fit by least squares (minimise RSS).', 'Compute RSS on the training data → training error.', 'R² close to 1: most variability explained; close to 0: little.'],
    details: ['The model with all predictors always has the smallest RSS and largest R² (T2 s35).', 'So RSS and R² cannot pick between models with different numbers of predictors.', 'R² rose from 0.8971943 to 0.8972106 just by adding "time" in the production example (T2 s18).'],
    example: 'Production example: out.quantity = 7.03 + 0.05·temperature, R² = 0.61 (T2 s10–12).',
    visual: null,
    exam: 'RSS = Σ(yi − ŷi)² measures training error; R² is the proportion of variance in y explained. Both are computed on training data and always improve as predictors are added, so they are not suitable for comparing models of different size.',
    mistakes: ['Using R² to choose between models of different sizes.', 'Calling RSS a test error.'],
    quick: 'RSS ↓ and R² ↑ always with more variables → training measures only.',
    terms: ['residual', 'RSS', 'R²', 'least squares'] },

  { id: 'c-ind', topic: 't2', title: 'Cp, BIC and Adjusted R²', refs: ['T2 s38', 'T2 s39', 'T2 s40', 'T2 s41'], q: ['q4ii', 'q4iii'],
    simple: 'These adjust the training error with a penalty for model size, to estimate the test error without a test set. Cp and BIC: smaller is better. Adjusted R²: bigger is better.',
    formal: 'Cp = (1/n)(RSS + 2kσ̂²). BIC = (1/n)(RSS + log(n)·kσ̂²). Adjusted R² = 1 − [RSS/(n − k − 1)] / [TSS/(n − 1)], with TSS = Σ(yi − ȳ)². σ̂² estimates Var(ε); k = number of predictors.',
    how: ['Compute the criterion for every candidate model.', 'Cp → choose the lowest. BIC → choose the lowest. Adjusted R² → choose the largest.'],
    details: ['They are indirect estimates of test error (adjust training MSE = RSS/n).', 'BIC\'s penalty log(n) > 2 once n > 7, so BIC tends to pick smaller models than Cp (consistent with T2 s51–52: best Cp at 10 predictors, best BIC at 6).', 'Adjusted R² penalises noise variables through n − k − 1.'],
    example: 'Exam Table 3: Model A has the lowest Cp (12.77) and BIC (230.87) and the highest Adj-R² (0.61).',
    visual: 'd-crit',
    exam: 'Cp and BIC add a penalty for the number of predictors to the RSS and are minimised; Adjusted R² penalises noise variables and is maximised. They indirectly estimate the test error, unlike R².',
    mistakes: ['Picking the highest Cp or BIC.', 'Thinking Adjusted R² always increases like R².'],
    quick: 'Cp ↓ · BIC ↓ · Adj-R² ↑ · (R² ↑ but unfair).',
    terms: ['Mallows Cp', 'BIC', 'Adjusted R²', 'σ̂²', 'TSS'] },

  { id: 'c-cv', topic: 't2', title: 'Validation set, Leave-One-Out and k-fold CV', refs: ['T2 s42–48'], q: ['q3', 'q1iv', 'q4iii'],
    simple: 'Hide part of the data, fit on the rest, test on the hidden part. LOOCV hides one point at a time, n times. k-fold hides one fold at a time, k times.',
    formal: 'Validation set: split Ω into ΩTR and ΩTEST; MSE_VS = (1/t) Σ_{i∈ΩTEST} (yi − ŷi)². LOO: for i = 1..n, test on (xi, yi), train on Ω \\ {(xi, yi)}, MSEi = (yi − ŷi)²; MSE_LOO = (1/n) Σ MSEi. k-fold: split into k folds, test on fold i, train on the rest, MSE_kCV = (1/k) Σ MSEi.',
    how: ['Decide the split (random half / one point / k folds).', 'Fit on the training part.', 'Predict the held-out part and compute its error.', 'Average the errors over repetitions.'],
    details: ['Validation set: simple but highly variable, and trains on fewer observations.', 'LOO: always the same result (no randomness), trains on n − 1, but needs n fits.', 'k-fold: usually k = 5 or 10; LOO is k-fold with k = n; results vary with the random folds.', 'For classification, replace (yi − ŷi)² by I(yi ≠ ŷi) (T3 s22).'],
    example: 'T2 s54–55: best subset chose 7 predictors by validation set and 10 by 10-fold CV.',
    visual: 'd-loo',
    exam: 'In leave-one-out cross-validation each observation is used once as the test set while the model is fitted on the remaining n − 1; the n test errors are averaged. It is deterministic but requires n fits.',
    mistakes: ['Fitting once and testing on all points (that is training error).', 'Saying LOO gives different answers each run.'],
    quick: 'VS: 1 random split. LOO: n splits of size 1. k-fold: k splits.',
    terms: ['validation set', 'LOOCV', 'k-fold', 'MSE'] },

  { id: 'c-best', topic: 't2', title: 'Best subset selection', refs: ['T2 s50', 'T2 s68'], q: ['q1ii', 'q1iii', 'q1iv'],
    simple: 'Try every possible combination of variables. For each size keep the one that fits best, then pick a size.',
    formal: 'M0 = model with no predictors (predicts the sample mean). For j = 1..k: fit all C(k, j) models with exactly j predictors and call the one with smallest RSS (largest R²) Mj. Choose among M0, …, Mk with Cp, BIC, Adjusted R² or cross-validation. 2^k models in total.',
    how: ['Fit M0.', 'For each size j, fit all C(k, j) models; keep the best → Mj.', 'Compare M0…Mk using a test-error estimate (not RSS).'],
    details: ['Finds the best possible model for each size: YES (T2 s68).', 'Valid only when k < n; computational cost high.', 'The Mj are not nested: Mj+1 need not contain Mj.'],
    example: 'T2 s51–55: best Cp at 10 predictors, BIC at 6, Adj-R² at 11.',
    visual: 'd-step',
    exam: 'Best subset fits all C(k, j) models for each size j, keeps the one with lowest RSS as Mj, and then selects among M0…Mk using Cp, BIC, adjusted R² or cross-validation. It always finds the lowest training RSS for each size, but its models need not be nested.',
    mistakes: ['Choosing among M0…Mk by RSS (always picks the full model).', 'Assuming best-subset models are nested.'],
    quick: 'Exhaustive, 2^k models, best training RSS per size, not nested, k < n only.',
    terms: ['best subset', 'M0…Mk', 'C(k, j)', '2^k'] },

  { id: 'c-step', topic: 't2', title: 'Forward and backward stepwise selection', refs: ['T2 s56', 'T2 s62', 'T2 s68', 'T2 s69'], q: ['q1i', 'q1iii'],
    simple: 'Forward: start with nothing and add the most helpful variable each step. Backward: start with everything and drop the least helpful variable each step.',
    formal: 'Forward: from M0, for j = 0..k−1 fit the k − j models that add one predictor to Mj and keep the best (smallest RSS) as Mj+1. Backward: from Mk (full), for j = k..1 fit the j models that remove one predictor and keep the best as Mj−1. Then choose among M0…Mk with Cp, BIC, Adjusted R² or CV.',
    how: ['Forward: M0 → add best variable → M1 → add best of the rest → M2 …', 'Backward: Mk → remove least useful → Mk−1 → …', 'Pick the final size with a test-error estimate.'],
    details: ['Models are nested within each method (each step adds/removes one).', 'Neither is guaranteed to find the best possible model (T2 s68).', 'Forward is valid even when k ≈ n or k > n; backward needs k < n (it starts from the full least-squares fit).', 'Medium computational cost. Hybrid approaches add and also remove (T2 s69).'],
    example: 'T2 s63–64: backward chose 10 predictors by Cp and 8 by BIC; forward chose 10 and 6.',
    visual: 'd-step',
    exam: 'Forward stepwise starts with no predictors and adds, one at a time, the variable that most improves the fit; backward stepwise starts with all predictors and removes, one at a time, the least useful. Both explore far fewer models than best subset, give nested models within each method, and are not guaranteed to find the best model.',
    mistakes: ['Assuming forward and backward give the same models.', 'Saying backward works when k > n.'],
    quick: 'Forward adds, backward removes; nested within a method; cheaper; not guaranteed best.',
    terms: ['forward stepwise', 'backward stepwise', 'nested', 'hybrid'] },

  { id: 'c-dummy', topic: 't2', title: 'Categorical predictors (dummy variables)', refs: ['T2 s19–22'], q: ['q2ii'],
    simple: 'A category becomes a set of 0/1 switches. One category is the baseline and gets no switch.',
    formal: 'A categorical variable with m categories enters a regression through m − 1 dummy variables Z1…Zm−1, each equal to 1 for its category and 0 otherwise. The baseline category has all dummies equal to 0; its effect is absorbed by β0.',
    how: ['Choose a baseline level.', 'Create a 0/1 dummy for every other level.', 'In a fitted model, plug 1 for the patient\'s level and 0 for the others.'],
    details: ['The baseline is arbitrary: predictions are the same, but coefficients and p-values change.', 'R names dummies by gluing variable and level, e.g. SexM, ST_SlopeUp, ExerciseAnginaY. By default R uses the first level in alphabetical order as the baseline (supplementary: R factor default).'],
    example: 'Credit debt by ethnicity: ŷ = 531.00 − 18.69 z1 − 12.50 z2 (T2 s22).',
    visual: null,
    exam: 'A categorical predictor with m levels is coded with m − 1 dummy variables equal to 1 for their level and 0 otherwise; the remaining level is the baseline represented by all dummies being 0.',
    mistakes: ['Creating m dummies (redundant).', 'Typing the level name into the formula instead of 0/1.'],
    quick: 'm levels → m − 1 dummies; baseline = all zeros.',
    terms: ['dummy / indicator', 'baseline'] },

  { id: 'c-coef', topic: 't2', title: 'Using a fitted linear model to predict', refs: ['T2 s13', 'T2 s14', 'T2 s15'], q: ['q4iii'],
    simple: 'Plug the observation\'s values into the fitted equation and add up.',
    formal: 'ŷ = β̂0 + β̂1x1 + … + β̂kxk. β̂j is the average change in Y for a one-unit increase in Xj holding the other predictors fixed; β̂0 is the expected Y when all predictors are 0.',
    how: ['Write the equation with only the variables in the model.', 'Substitute the observation\'s values.', 'Compare with the observed y: residual y − ŷ.'],
    details: ['A variable not in the model contributes nothing (its coefficient is effectively 0).', 'Test MSE = (1/t) Σ (yi − ŷi)² over test observations (T2 s43).'],
    example: 'out.quantity = 2.94 + 0.05·temperature + 0.19·humidity − 0.001·time (T2 s15).',
    visual: null,
    exam: 'For each test observation compute ŷ from the fitted equation, then the test MSE (1/t)Σ(yi − ŷi)²; the model with the smallest test MSE is preferred.',
    mistakes: ['Forgetting the intercept.', 'Using variables the model does not contain.'],
    quick: 'ŷ = intercept + Σ coef × value; test MSE = mean squared residual.',
    terms: ['intercept', 'slope', 'prediction', 'test MSE'] },

  /* ---- Topic 3 ---- */
  { id: 'c-logit', topic: 't3', title: 'Logistic regression and the cutoff', refs: ['T3 s9', 'T3 s12–13', 'T3 s16', 'T3 s17'], q: ['q2ii'],
    simple: 'Logistic regression turns a weighted sum of the predictors into a probability between 0 and 1. A cutoff turns the probability into a yes/no prediction.',
    formal: 'P(Y = 1 | X1…Xk) = 1 / (1 + e^−(β̂0 + β̂1X1 + … + β̂kXk)); P(Y = 0 | X) = 1 − P(Y = 1 | X). Coefficients are found by maximum likelihood. With cutoff z: predict 1 if P(Y = 1 | X) > z, 0 if P < z. Default z = 0.5, not necessarily best.',
    how: ['Compute η = β̂0 + Σ β̂j xj.', 'Compute p = 1 / (1 + e^(−η)).', 'Compare p with the cutoff (exam: 0.45).'],
    details: ['Odds = p / (1 − p) = e^η; logit = log-odds = η.', 'β̂j > 0: larger Xj → higher P(Y = 1). β̂j < 0: lower.', 'Increasing Xj by ε multiplies the odds by e^(β̂j ε).', 'Lowering the cutoff predicts more 1s: sensitivity up, specificity down.'],
    example: 'P(activate = 1 | time = 1000) = 1 / (1 + e^−(−10.65 + 0.0055·1000)) = 0.00576 < 0.5 ⇒ No (T3 s16–17).',
    visual: 'd-logit',
    exam: 'Logistic regression models P(Y = 1 | X) = 1/(1 + e^−(β0 + β1X1 + … + βkXk)). For a new observation we compute this probability and predict Y = 1 if it exceeds the cutoff (here 0.45), otherwise Y = 0.',
    mistakes: ['Forgetting the minus sign in e^(−η).', 'Comparing η (not p) with the cutoff.', 'Using 0.5 when the question says 0.45.'],
    quick: 'η → p = 1/(1+e^−η) → p > 0.45 ⇒ 1.',
    terms: ['logistic function', 'odds', 'logit', 'cutoff / threshold', 'maximum likelihood'] },

  { id: 'c-cm', topic: 't3', title: 'Confusion matrix, test error and related rates', refs: ['T3 s18', 'T3 s20', 'T3 s21', 'T3 s22', 'T3 s23'], q: ['q2i', 'q2ii', 'q2iii', 'q3'],
    simple: 'A 2×2 table that counts right and wrong predictions. Rows are what really happened, columns are what the model said.',
    formal: 'Rows: observed Y = 0, 1. Columns: predicted 0, 1. n00 = true negatives, n01 = false positives, n10 = false negatives, n11 = true positives. Error rate = (1/n) Σ I(yi ≠ ŷi) = (n01 + n10)/n. Accuracy = (n00 + n11)/n. Sensitivity = n11/n1. Specificity = n00/n0. FPR = n01/n0. FNR = n10/n1. Balanced accuracy = ½(n00/n0 + n11/n1).',
    how: ['For each test observation write (observed, predicted).', 'Count each of the four combinations.', 'Add row totals (n0, n1) and column totals (n̂0, n̂1).', 'Error = off-diagonal / n.'],
    details: ['Sensitivity + FNR = 1; specificity + FPR = 1.', 'For imbalanced data prefer balanced accuracy.', 'Computed on a test set, the error rate is the test error; on training data it is the training error.'],
    example: 'Logistic with time only: accuracy (9625+100)/10000 = 97.25%, sensitivity 100/333 = 30.03% (T3 s23).',
    visual: 'd-cm',
    exam: 'The confusion matrix compares observed (rows) and predicted (columns) classes; the test error is the proportion of misclassified test observations, (n01 + n10)/n.',
    mistakes: ['Swapping rows and columns without labelling them.', 'Dividing by the wrong total (use n = 5 for the exam test set).', 'Mixing up false positive and false negative.'],
    quick: 'Rows observed, columns predicted. Error = (FP + FN)/n.',
    terms: ['TP', 'TN', 'FP', 'FN', 'sensitivity', 'specificity', 'test error'] },

  { id: 'c-tree', topic: 't3', title: 'Classification trees: reading and predicting', refs: ['T3 s35', 'T3 s42', 'T3 s43', 'T3 s45–48', 'T3 s49–50', 'T3 s52'], q: ['q2i', 'q2iii'],
    simple: 'A tree is a sequence of yes/no questions. Start at the top, answer each question for your observation, follow the branch, and read the class at the leaf.',
    formal: 'The predictor space is split into J non-overlapping regions R1…RJ, each assigned the majority class of its training observations. Nodes: root (whole dataset), intermediate, leaves (regions). Branches: X ≤ t / X > t for quantitative variables, X = ℓ / X ≠ ℓ for categorical ones. If xnew ∈ Rj then ŷnew = class of Rj.',
    how: ['Start at the root.', 'Check the split condition with the observation\'s value.', 'Follow the branch whose condition is true.', 'Repeat until a leaf; its class is the prediction.'],
    details: ['Built with a splitting rule (maximise purity gain: Gini or cross-entropy), a stopping criterion (min observations per node) and class assignment (majority).', 'Easy to interpret; handles numeric and categorical variables; no distribution assumptions.', 'Usually less accurate than other methods and high-variance (a small data change can change the tree).', 'In R plots, a node often shows the predicted class and the class proportions; read the split label at each node carefully (which side is "yes").'],
    example: 'T3 s50: X1 = 0.1, X2 = 0.7 → X2 > 0.15 → X1 ≤ 0.4 → X2 > 0.6 → class 1.',
    visual: 'd-tree',
    exam: 'To classify a new observation we drop it down the tree: at each internal node we follow the branch whose condition it satisfies until reaching a leaf, whose majority class is the prediction.',
    mistakes: ['Reading the wrong side of a split (≤ vs >).', 'Using a variable value that is not in the split (e.g. Oldpeak vs MaxHR).'],
    quick: 'Root → splits → leaf; leaf class = majority class.',
    terms: ['root', 'leaf', 'split', 'Gini', 'entropy', 'majority class'] },

  { id: 'c-knn', topic: 't3', title: 'K-Nearest Neighbours (classification)', refs: ['T3 s31', 'T3 s32', 'T3 s34'], q: ['q3'],
    simple: 'To classify a point, look at the K training points closest to it and take a vote.',
    formal: 'Given K and test point x: (1) find the K closest training points Nx; (2) estimate P(Y = j | X = x) = (1/K) Σ_{i∈Nx} I(yi = j); (3) assign x to the class with the largest probability.',
    how: ['Pick K (tune it, e.g. by cross-validation).', 'Compute distances from x to all training points.', 'Take the K closest; count classes.', 'Predict the majority class.'],
    details: ['Model-free: no distributional assumptions.', 'Black-box: little insight into predictor–class relationships.', 'Needs the full training set at prediction time: slow for large n or k.', 'Predictions can change when K changes.', 'Variables on different scales should be standardised so one variable does not dominate the distance (T4 s3).'],
    example: '3-NN illustration on T3 s32.',
    visual: 'd-knn',
    exam: 'KNN classifies x by finding its K nearest training observations and assigning the class with the largest proportion among them, which estimates P(Y = j | X = x).',
    mistakes: ['Including the test point itself among its neighbours during LOO.', 'Forgetting to fix K before running LOO.'],
    quick: 'K closest → vote → class. Standardise first.',
    terms: ['K', 'neighbourhood Nx', 'majority vote'] },

  { id: 'c-cmp', topic: 't3', title: 'Choosing between classifiers', refs: ['T3 s21', 'T3 s30', 'T3 s34', 'T3 s52'], q: ['q2iii'],
    simple: 'Pick the classifier that makes fewer mistakes on new data. If they tie, think about which mistakes matter more and which model is easier to use.',
    formal: 'Compare test error (or accuracy/balanced accuracy). A good classifier has high sensitivity and specificity. Logistic regression gives a closed formula and probabilities; trees are easy to interpret but less accurate and high-variance; KNN is a flexible black box.',
    how: ['Compute test error for each.', 'If different → lower test error wins.', 'If tied → compare sensitivity/specificity based on the cost of errors; then interpretability.', 'State the reliability limits (test-set size).'],
    details: ['In medical diagnosis a false negative (missing disease) is usually the costlier error.', 'Five test cases give a very rough estimate.'],
    example: 'Exam Q2(iii).',
    visual: null,
    exam: 'I would select the method with the lower test error since it generalises better to new patients; with only five test patients this conclusion is tentative.',
    mistakes: ['Choosing on training performance.', 'Not justifying the choice.'],
    quick: 'Lower test error → choose. Tie → sensitivity, interpretability.',
    terms: ['test error', 'sensitivity', 'interpretability'] },

  /* ---- Topic 4 ---- */
  { id: 'c-dist', topic: 't4', title: 'Distances and standardisation', refs: ['T4 s3', 'T4 s8'], q: ['q3'],
    simple: 'To find "nearest" points you need a distance. If one variable is measured in big numbers it can drown the others, so put variables on the same scale first.',
    formal: 'Euclidean d(x1, x2) = √Σ(x1j − x2j)². Manhattan d = Σ|x1j − x2j|. Maximum d = max |x1j − x2j|. When variables are measured on very different scales, standardise them so results are not dominated by one variable.',
    how: ['Standardise each variable: (x − mean) / sd.', 'Compute the distance between the points.', 'Use it to rank neighbours (KNN) or to cluster.'],
    details: ['In Q2-type data, Cholesterol (~200) would dominate Oldpeak (~1) without standardising.', 'Categorical distances are out of the course scope (T4 s8).'],
    example: 'Raw vs standardised Income and HPI plots (T4 s5–7).',
    visual: null,
    exam: 'KNN relies on a distance such as the Euclidean distance; variables should be standardised so that no single variable dominates it.',
    mistakes: ['Computing distances on raw variables with very different units.'],
    quick: 'Euclidean, Manhattan, Max. Standardise first.',
    terms: ['Euclidean', 'Manhattan', 'standardise'] }
];

/* Lesson metadata (DESIGN.md §8): priority is a study guide based on how many exam marks rely on the concept, not a prediction. */
const CONCEPT_META = {
  'c-sup':   { priority: 'low',    cards: ['f29'],               formulas: [] },
  'c-trte':  { priority: 'high',   cards: ['f29', 'f30'],        formulas: ['f-testmse'] },
  'c-bv':    { priority: 'medium', cards: ['f31', 'f30'],        formulas: [] },
  'c-types': { priority: 'low',    cards: ['f14'],               formulas: [] },
  'c-hist':  { priority: 'medium', cards: ['f32'],               formulas: [] },
  'c-rss':   { priority: 'medium', cards: ['f7'],                formulas: ['f-rss'] },
  'c-ind':   { priority: 'high',   cards: ['f8', 'f9', 'f10'],   formulas: ['f-cp', 'f-bic', 'f-adjr2'] },
  'c-cv':    { priority: 'high',   cards: ['f11', 'f12', 'f13'], formulas: ['f-testmse', 'f-loo', 'f-kfold'] },
  'c-best':  { priority: 'high',   cards: ['f1', 'f4', 'f5'],    formulas: [] },
  'c-step':  { priority: 'high',   cards: ['f2', 'f3', 'f6'],    formulas: [] },
  'c-dummy': { priority: 'medium', cards: ['f14'],               formulas: ['f-dummy'] },
  'c-coef':  { priority: 'medium', cards: ['f7'],                formulas: ['f-linpred'] },
  'c-logit': { priority: 'high',   cards: ['f15', 'f16', 'f17'], formulas: ['f-logistic', 'f-cutoff', 'f-odds'] },
  'c-cm':    { priority: 'high',   cards: ['f18', 'f19', 'f20'], formulas: ['f-error', 'f-sens', 'f-bacc'] },
  'c-tree':  { priority: 'high',   cards: ['f25', 'f26', 'f28'], formulas: ['f-gini'] },
  'c-knn':   { priority: 'high',   cards: ['f23', 'f24'],        formulas: ['f-knn'] },
  'c-cmp':   { priority: 'medium', cards: ['f21', 'f28'],        formulas: [] },
  'c-dist':  { priority: 'medium', cards: ['f33', 'f34'],        formulas: ['f-euclid'] }
};
CONCEPTS.forEach(c => Object.assign(c, CONCEPT_META[c.id] || { priority: 'medium', cards: [], formulas: [] }));

/* Topic 4 parts not on the paper — shown collapsed for honesty */
const NOT_EXAMINED = {
  t1: ['Examples of data analysis in industry (s7–15)', 'Data-driven decision making pipeline (s16)', 'Complex data types: spatial, time-stamped, relational, unstructured (s19–23)', 'Parametric vs non-parametric methods (s41–42)'],
  t2: ['Confidence intervals and hypothesis tests for β (s11, s16–17)', 'Potential problems: non-linearity, correlated errors, heteroscedasticity, outliers, leverage, collinearity, high dimensions (s23–32)', 'Ridge regression and the Lasso (s70–72)', 'Regression in high dimensions (s73)'],
  t3: ['Bayes classifier (s6–8)', 'Linear Discriminant Analysis (s24–30)', 'Random forests (s53–55)', 'Support Vector Machines and kernels (s56–71)'],
  t4: ['Hierarchical clustering and dendrograms (s11–14)', 'K-means and K-medoids (s15–26)', 'Principal Component Analysis (s28–34)', 'Multidimensional Scaling (s35–36)', 'ISOMAP (s37–38)']
};

/* ---------- FLASHCARDS ---------- */
const CARDS = [
  { id: 'f1', topic: 't2', q: 'Best subset selection: how many models are fitted for k predictors?', a: '2^k models: all C(k, j) combinations for each size j = 0…k.', ref: 'T2 s50' },
  { id: 'f2', topic: 't2', q: 'Forward stepwise: where does it start and what does each step do?', a: 'Starts from M0 (no predictors). Each step adds the one predictor that gives the greatest improvement (smallest RSS).', ref: 'T2 s56' },
  { id: 'f3', topic: 't2', q: 'Backward stepwise: where does it start and what does each step do?', a: 'Starts from the full model Mk. Each step removes the least useful predictor.', ref: 'T2 s62' },
  { id: 'f4', topic: 't2', q: 'Are best-subset models nested?', a: 'No. The best (k+1)-variable model need not contain the best k-variable model.', ref: 'T2 s50' },
  { id: 'f5', topic: 't2', q: 'Which subset method is guaranteed to find the best possible model of each size?', a: 'Only best subset (forward and backward: NO).', ref: 'T2 s68' },
  { id: 'f6', topic: 't2', q: 'Which subset methods are valid when k > n?', a: 'Only forward stepwise. Best subset and backward need k < n.', ref: 'T2 s68' },
  { id: 'f7', topic: 't2', q: 'Why can\'t RSS or R² choose between models of different sizes?', a: 'They are training measures: the model with all predictors always has the smallest RSS and the largest R².', ref: 'T2 s35' },
  { id: 'f8', topic: 't2', q: 'Cp formula and how to use it', a: 'Cp = (1/n)(RSS + 2kσ̂²). Choose the lowest Cp.', ref: 'T2 s39' },
  { id: 'f9', topic: 't2', q: 'BIC formula and how to use it', a: 'BIC = (1/n)(RSS + log(n)kσ̂²). Choose the lowest BIC.', ref: 'T2 s40' },
  { id: 'f10', topic: 't2', q: 'Adjusted R² formula and how to use it', a: 'Adj-R² = 1 − [RSS/(n−k−1)] / [TSS/(n−1)]. Choose the largest.', ref: 'T2 s41' },
  { id: 'f11', topic: 't2', q: 'Leave-One-Out CV in one sentence', a: 'For i = 1…n, fit on all observations except i, predict i, record its error; the LOO estimate is the average of the n errors.', ref: 'T2 s45' },
  { id: 'f12', topic: 't2', q: 'LOOCV vs validation set: two advantages and one drawback of LOO', a: 'Same result every time (no random split); trains on n − 1 observations. Drawback: n fits, slow for large n.', ref: 'T2 s46' },
  { id: 'f13', topic: 't2', q: 'k-fold CV: usual k, and its relation to LOO', a: 'k = 5 or 10. LOO is k-fold with k = n.', ref: 'T2 s48' },
  { id: 'f14', topic: 't2', q: 'How many dummy variables for a categorical predictor with m levels?', a: 'm − 1. The baseline level is all zeros.', ref: 'T2 s19' },
  { id: 'f15', topic: 't3', q: 'Logistic regression probability formula', a: 'P(Y=1|X) = 1 / (1 + e^−(β̂0 + β̂1X1 + … + β̂kXk)).', ref: 'T3 s9' },
  { id: 'f16', topic: 't3', q: 'How do you turn a logistic probability into a class with cutoff z?', a: 'Predict 1 if P(Y=1|X) > z, otherwise 0. Default z = 0.5 (exam uses 0.45).', ref: 'T3 s17' },
  { id: 'f17', topic: 't3', q: 'Odds and logit', a: 'Odds = p/(1−p) = e^η. Logit = log(odds) = η = β̂0 + Σβ̂jXj.', ref: 'T3 s12–13' },
  { id: 'f18', topic: 't3', q: 'Confusion matrix: what are rows and columns on the slides?', a: 'Rows = observed class, columns = predicted class.', ref: 'T3 s18' },
  { id: 'f19', topic: 't3', q: 'n01 and n10 in the confusion matrix', a: 'n01 = observed 0 predicted 1 (false positive). n10 = observed 1 predicted 0 (false negative).', ref: 'T3 s18' },
  { id: 'f20', topic: 't3', q: 'Error rate formula', a: '(1/n) Σ I(yi ≠ ŷi) = (n01 + n10)/n.', ref: 'T3 s22' },
  { id: 'f21', topic: 't3', q: 'Sensitivity and specificity', a: 'Sensitivity = n11/n1 (true positive rate). Specificity = n00/n0 (true negative rate).', ref: 'T3 s20' },
  { id: 'f22', topic: 't3', q: 'Balanced accuracy and when to use it', a: '½(n00/n0 + n11/n1). Use for imbalanced classes.', ref: 'T3 s21' },
  { id: 'f23', topic: 't3', q: 'KNN: how is P(Y = j | X = x) estimated?', a: 'Fraction of the K nearest training points with class j: (1/K) Σ I(yi = j).', ref: 'T3 s31' },
  { id: 'f24', topic: 't3', q: 'Three practical drawbacks of KNN vs logistic/LDA', a: 'K must be tuned; black box (little insight); needs the whole dataset to predict (slow for large n, k).', ref: 'T3 s34' },
  { id: 'f25', topic: 't3', q: 'How does a classification tree classify a new observation?', a: 'Follow the branches whose conditions it satisfies down to a leaf; predict the leaf\'s majority class.', ref: 'T3 s49' },
  { id: 'f26', topic: 't3', q: 'Three types of node in a classification tree', a: 'Root (whole dataset), intermediate nodes, leaf nodes (regions).', ref: 'T3 s42' },
  { id: 'f27', topic: 't3', q: 'Gini index of a node', a: 'G = Σ p_jℓ (1 − p_jℓ). Small = node mostly one class (pure).', ref: 'T3 s46' },
  { id: 'f28', topic: 't3', q: 'Pros and cons of classification trees', a: 'Pros: easy to interpret, numeric + categorical, multiclass, no distribution assumptions. Cons: lower accuracy, high variance (non-robust).', ref: 'T3 s52' },
  { id: 'f29', topic: 't1', q: 'Training error vs test error', a: 'Training: error on the data used to fit. Test: error on previously unseen data. Lowest training error does not guarantee lowest test error.', ref: 'T1 s43–44' },
  { id: 'f30', topic: 't1', q: 'Overfitting', a: 'Small training error but large test error: the method fits random patterns. A less flexible model would give smaller test error.', ref: 'T1 s44' },
  { id: 'f31', topic: 't1', q: 'Bias vs variance with flexibility', a: 'More flexible → lower bias, higher variance.', ref: 'T1 s45' },
  { id: 'f32', topic: 't1', q: 'Describing a histogram (4 things)', a: 'Shape (skew/symmetry), centre, spread, unusual features. Skew is named after the tail.', ref: 'External: census.gov', ext: true },
  { id: 'f33', topic: 't4', q: 'Why standardise before KNN or clustering?', a: 'Variables on very different scales would dominate the distance.', ref: 'T4 s3' },
  { id: 'f34', topic: 't4', q: 'Euclidean distance between x1 and x2', a: '√[(x11 − x21)² + … + (x1k − x2k)²].', ref: 'T4 s8' }
];

/* ---------- SUPPLEMENTARY WRITTEN PRACTICE (clearly not from the exam) ---------- */
const PRACTICE = [
  { id: 'p1', topic: 't2', title: 'Describe forward stepwise selection', text: 'Describe the forward stepwise selection algorithm and how the final model is chosen.', ref: 'T2 s56',
    model: 'Start with M0, the model with no predictors (it predicts the sample mean). For j = 0, …, k−1, fit the k − j models that add one predictor to Mj and keep the best (smallest RSS / largest R²) as Mj+1. Finally choose among M0, …, Mk using Cp, BIC, adjusted R² or cross-validation (not RSS).',
    rubric: [ { label: 'Starts from M0 / no predictors', re: ['m0', 'no predictor', 'empty', 'null model'] }, { label: 'Adds one predictor at a time', re: ['add', 'one at a time', 'one-at-a-time'] }, { label: 'Keeps the best by RSS / R²', re: ['rss', 'r ?(2|²)', 'best fit', 'greatest improvement'] }, { label: 'Chooses final model with Cp / BIC / Adj-R² / CV', re: ['c\\s?p', 'bic', 'adjusted', 'cross.?validation', '\\bcv\\b'] } ] },
  { id: 'p2', topic: 't2', title: 'Validation set vs LOOCV vs k-fold', text: 'Compare the validation set approach, leave-one-out and k-fold cross-validation for estimating test error.', ref: 'T2 s43–48',
    model: 'Validation set: one random split into training and test halves; simple, but the estimate is highly variable and the model is trained on fewer observations. LOO: each of the n observations is the test set once, the model is trained on n − 1; deterministic but needs n fits. k-fold: data randomly split into k folds (5 or 10), each fold is the test set once; cheaper than LOO, results vary with the random folds; LOO is k-fold with k = n.',
    rubric: [ { label: 'Validation set: one split, variable', re: ['one (random )?split', 'half', 'variab'] }, { label: 'LOO: n fits, n − 1 training, deterministic', re: ['n ?[-−] ?1', 'n times', 'same result', 'deterministic'] }, { label: 'k-fold: k folds, usually 5 or 10', re: ['fold', '\\b(5|10)\\b'] }, { label: 'Relation: LOO = k-fold with k = n', re: ['k ?= ?n', 'special case'] } ] },
  { id: 'p3', topic: 't2', title: 'Why not use R² to pick model size?', text: 'Explain why R² and RSS are not suitable for choosing among models with different numbers of predictors, and name what to use instead.', ref: 'T2 s35, s38',
    model: 'RSS and R² are computed on the training data. Adding predictors always decreases RSS and increases R², so the full model always looks best. We need an estimate of the test error instead: indirectly with Cp, BIC or adjusted R², or directly with a validation set or cross-validation.',
    rubric: [ { label: 'Training data measures', re: ['training'] }, { label: 'Always improve with more predictors', re: ['always', 'more (variables|predictors)', 'full model'] }, { label: 'Use Cp / BIC / Adj-R²', re: ['c\\s?p', 'bic', 'adjusted'] }, { label: 'Or cross-validation / validation set', re: ['cross.?validation', 'validation set', '\\bcv\\b'] } ] },
  { id: 'p4', topic: 't3', title: 'Confusion-matrix vocabulary', text: 'Define true positives, false positives, false negatives, sensitivity, specificity and the error rate in terms of the confusion matrix.', ref: 'T3 s18, s20, s22',
    model: 'With rows = observed and columns = predicted: TN = n00, FP = n01 (observed 0 predicted 1), FN = n10 (observed 1 predicted 0), TP = n11. Sensitivity = n11/n1, specificity = n00/n0, error rate = (n01 + n10)/n.',
    rubric: [ { label: 'FP = observed 0 predicted 1', re: ['false positive[\\s\\S]{0,60}(observed|actual|true) ?(0|negative)', 'n01'] }, { label: 'FN = observed 1 predicted 0', re: ['false negative[\\s\\S]{0,60}(observed|actual|true) ?(1|positive)', 'n10'] }, { label: 'Sensitivity = TP / observed positives', re: ['sensitiv[\\s\\S]{0,40}(n11|tp|true positive)'] }, { label: 'Specificity = TN / observed negatives', re: ['specific[\\s\\S]{0,40}(n00|tn|true negative)'] }, { label: 'Error rate = (FP + FN)/n', re: ['error[\\s\\S]{0,40}(n01|fp|false positive)', 'misclassif'] } ] },
  { id: 'p5', topic: 't3', title: 'Effect of changing the cutoff', text: 'In logistic regression, what happens to the predictions, sensitivity and specificity when the cutoff is lowered from 0.5 to 0.45?', ref: 'T3 s17, s20',
    model: 'More observations have P(Y = 1 | X) above the cutoff, so more are predicted as 1. Sensitivity can only increase or stay the same (more true 1s caught) and specificity can only decrease or stay the same (more 0s wrongly called 1). Predictions change as the threshold varies.',
    rubric: [ { label: 'More predicted 1s', re: ['more[\\s\\S]{0,30}(1|positive|yes)'] }, { label: 'Sensitivity up (or equal)', re: ['sensitiv[\\s\\S]{0,30}(increas|up|higher|rise)'] }, { label: 'Specificity down (or equal)', re: ['specific[\\s\\S]{0,30}(decreas|down|lower|fall)'] } ] },
  { id: 'p6', topic: 't3', title: 'How a classification tree predicts', text: 'Explain how a fitted classification tree assigns a class to a new observation and how leaf classes are decided.', ref: 'T3 s48–49',
    model: 'The new observation starts at the root; at each internal node it follows the branch whose condition it satisfies (X ≤ t or X > t, X = ℓ or X ≠ ℓ) until it reaches a leaf Rj. It receives the class of that leaf, which is the majority class of the training observations in Rj (ℓ = argmax p̂m(Rj)).',
    rubric: [ { label: 'Starts at root, follows conditions', re: ['root', 'branch', 'condition', 'split'] }, { label: 'Ends at a leaf / region', re: ['leaf', 'region', 'terminal'] }, { label: 'Leaf class = majority class of training points', re: ['majority', 'most (frequent|common)', 'argmax'] } ] },
  { id: 'p7', topic: 't3', title: 'KNN vs logistic regression', text: 'Give three differences between KNN and logistic regression as classifiers.', ref: 'T3 s30, s34',
    model: 'KNN is model-free (no assumptions), logistic regression assumes the logistic form. KNN is a black box, logistic regression gives a closed formula relating predictors and class. KNN needs the whole training set to classify a point (slow), logistic regression only needs its coefficients. KNN needs K tuned (e.g. by CV).',
    rubric: [ { label: 'Assumptions / model-free', re: ['model.?free', 'assumption', 'parametric'] }, { label: 'Interpretability / black box', re: ['black.?box', 'interpret', 'formula', 'insight'] }, { label: 'Prediction cost / needs whole dataset', re: ['whole|entire|all (the )?(data|training)', 'slow', 'store'] }, { label: 'Tuning K', re: ['tun', 'choose k', 'cross.?validation'] } ] },
  { id: 'p8', topic: 't1', title: 'Overfitting', text: 'Define overfitting and explain how it shows up in training and test error.', ref: 'T1 s44',
    model: 'Overfitting happens when a method works too hard to find patterns in the training data and picks up random noise rather than true properties of f. It shows as a small training error but a large test error; a less flexible model would have given a smaller test error.',
    rubric: [ { label: 'Fits noise / random patterns', re: ['noise', 'random', 'too hard'] }, { label: 'Small training error', re: ['(small|low)[\\s\\S]{0,20}training'] }, { label: 'Large test error', re: ['(large|high|big)[\\s\\S]{0,20}test'] }, { label: 'Less flexible model would do better', re: ['less flexible', 'simpler'] } ] }
];

/* ---------- DIAGRAMS ---------- */
const DIAGRAMS = [
  { id: 'd-tree', title: 'Tracing a classification tree', topic: 't3', q: ['q2i'], kind: 'tree', grid: false,
    source: 'Redrawn from the text of Topic 3, slides 43 and 50 (the splits and leaf classes are the slide\'s own). The slide image itself could not be extracted.',
    sourceType: 'redrawn',
    what: 'A fitted classification tree with six leaves. Each internal node is a split; each leaf is a region with its majority class. This is the skill Q2(i) needs: drop each patient down Figure 1 in the same way.',
    steps: ['Draw the root box with the first split: X2 ≤ 0.15 (left) / X2 > 0.15 (right).', 'Left branch ends in a leaf: class 0.', 'Right branch splits on X1: X1 > 0.4 (one side) and X1 ≤ 0.4 (other side).', 'Under X1 > 0.4: split X2 ≤ 0.5 → leaf 0; X2 > 0.5 → split X1 ≤ 0.6 → leaf 0 / X1 > 0.6 → leaf 1.', 'Under X1 ≤ 0.4: split X2 ≤ 0.6 → leaf 0; X2 > 0.6 → leaf 1.', 'Label every branch with its condition and every leaf with its class. Count 6 leaves.'],
    checklist: ['Root split written on the root node', 'Each branch labelled with its inequality', 'Six leaves, each with a class (0 or 1)', 'Conditions on sibling branches are complementary (≤ / >)', 'Can trace X1 = 0.1, X2 = 0.7 → class 1'] },
  { id: 'd-cm', title: 'Confusion matrix layout', topic: 't3', q: ['q2i', 'q2ii'], kind: 'cm', grid: true,
    source: 'Redrawn from the table on Topic 3, slide 18.', sourceType: 'redrawn',
    what: 'The 2×2 table you must produce in Q2(i) and Q2(ii): observed classes in the rows, predicted classes in the columns, totals on the margins. The test error is the off-diagonal count divided by n.',
    steps: ['Draw a 3×3 grid (2×2 cells plus a totals row and column).', 'Label columns "Predicted Y = 0", "Predicted Y = 1", "Total".', 'Label rows "Observed Y = 0", "Observed Y = 1", "Total".', 'Write n00 (TN), n01 (FP) in the first row; n10 (FN), n11 (TP) in the second.', 'Fill row totals n0, n1; column totals n̂0, n̂1; corner n.', 'Under the table write Test error = (n01 + n10)/n.'],
    checklist: ['Rows labelled observed, columns predicted', 'All four cells filled', 'Row and column totals', 'n = 5 for the exam test set (n0 = 3, n1 = 2)', 'Test error formula written'] },
  { id: 'd-logit', title: 'Logistic curve and the cutoff', topic: 't3', q: ['q2ii'], kind: 'logit', grid: true,
    source: 'Plotted from the fitted model on Topic 3, slide 10: P(activate = 1 | time) = 1 / (1 + e^−(−10.65 + 0.0055·time)). The curve is computed from that formula; no data points are shown.', sourceType: 'computed',
    what: 'The S-shaped logistic function maps the linear predictor to a probability between 0 and 1. A horizontal line at the cutoff splits predictions: above it predict 1, below predict 0. Lowering the cutoff from 0.5 to 0.45 moves the decision point left.',
    steps: ['Draw axes: x = predictor (time, 0–3000), y = P(Y = 1), from 0 to 1.', 'Sketch an S-curve rising from near 0 to near 1.', 'Mark the point where P = 0.5: η = 0 ⇒ time = 10.65/0.0055 ≈ 1936.', 'Draw the cutoff line at P = 0.45; it meets the curve at time ≈ 1900.', 'Shade: right of that point → predict 1; left → predict 0.'],
    checklist: ['Axes labelled with variable and probability 0–1', 'S-shape, flat near 0 and 1', 'Cutoff line at 0.45', 'Decision regions labelled predict 0 / predict 1'] },
  { id: 'd-loo', title: 'Leave-One-Out cross-validation', topic: 't2', q: ['q3'], kind: 'loo', grid: false,
    source: 'Original teaching diagram of the LOO procedure described on Topic 2, slide 45. No slide image of LOO exists in the deck text.', sourceType: 'original',
    what: 'Each row is one round. The highlighted cell is the single test observation; the rest form the training set (n − 1 observations). After n rounds every observation has been tested once and the n errors are averaged. For KNN classification (Q3) each round\'s error is I(yi ≠ ŷi).',
    steps: ['Draw n boxes in a row for observations 1…n.', 'Below, draw n rows (rounds); in round i shade box i as "test".', 'Label the unshaded boxes "training (n − 1)".', 'Next to each round write Err_i = I(y_i ≠ ŷ_i).', 'At the bottom write Err_LOO = (1/n) Σ Err_i.'],
    checklist: ['n rounds', 'Exactly one test observation per round', 'Training = remaining n − 1', 'Per-round error written', 'Average of the n errors'] },
  { id: 'd-step', title: 'Forward vs backward paths', topic: 't2', q: ['q1i', 'q1ii'], kind: 'step', grid: false,
    source: 'Original teaching diagram. The variable names are an illustrative example, not course data.', sourceType: 'original',
    what: 'Forward builds a chain upward from the empty model; backward builds a chain downward from the full model. Each chain is nested, but the two chains can pass through different variable sets. Best subset picks each size independently, so its models can jump.',
    steps: ['Draw three columns: Forward, Backward, Best subset.', 'Forward: ∅ → {X1} → {X1, X3} → {X1, X3, X2} → full.', 'Backward: full → {X2, X3, X4} → {X2, X3} → {X2} → ∅.', 'Best subset: each size chosen separately, e.g. {X1}, {X2, X3}, {X1, X2, X4}.', 'Circle forward {X1} and backward {X2, X3}: {X1} ⊄ {X2, X3}, so Q1(i) is False.', 'Circle best subset {X1} and {X2, X3}: not nested, so Q1(ii) is False.'],
    checklist: ['Forward adds one variable per step', 'Backward removes one per step', 'Within each chain models are nested', 'Counter-example across methods shown', 'Best subset sizes not nested'] },
  { id: 'd-hist', title: 'Skewness shapes for histograms', topic: 't1', q: ['q4i'], kind: 'hist', grid: true,
    source: 'Original schematic shapes, no data. Use them to name the shape of the lcp and age histograms in your exam Figures 4–5.', sourceType: 'original',
    what: 'Right (positive) skew: long tail to the right, mean > median. Left (negative) skew: long tail to the left, mean < median. A tall bar at one end means many observations share that value.',
    steps: ['Draw the x-axis (variable, units) and y-axis (frequency).', 'Right skew: tall bars on the left, bars shrinking to the right.', 'Left skew: bars build up slowly from the left, peak on the right.', 'Mark the tail and write the skew direction next to it.', 'Note centre (peak), range, and any spike or outlier.'],
    checklist: ['Axes labelled', 'Tail direction named correctly', 'Centre identified', 'Range given', 'Unusual feature noted'] },
  { id: 'd-knn', title: 'K nearest neighbours', topic: 't3', q: ['q3'], kind: 'knn', grid: true,
    source: 'Original schematic in the style of the 3-NN illustration on Topic 3, slide 32 (point positions are illustrative).', sourceType: 'original',
    what: 'The open point is classified by its K = 3 nearest training points: two of class A and one of class B, so P(A | x) = 2/3 and the prediction is A.',
    steps: ['Plot a cloud of points of two classes (two symbols).', 'Add the new point (open circle).', 'Draw a circle around it that just contains its K nearest points.', 'Count classes inside; write the proportions.', 'Predict the majority class.'],
    checklist: ['Two classes distinguished', 'Circle encloses exactly K points', 'Proportions written', 'Majority class predicted'] },
  { id: 'd-crit', title: 'Model size vs criteria', topic: 't2', q: ['q4ii'], kind: 'crit', grid: true,
    source: 'Original schematic of the patterns shown on Topic 2, slides 36–37 and 51–53 (shapes only; no values copied).', sourceType: 'original',
    what: 'As predictors are added, RSS always falls and R² always rises (training measures). Cp and BIC fall then rise, so they have a minimum; Adjusted R² rises then falls, so it has a maximum.',
    steps: ['x-axis: number of predictors.', 'Sketch RSS decreasing steadily; R² increasing steadily.', 'Sketch Cp / BIC as U-shapes; mark the minimum.', 'Sketch Adjusted R² as an inverted U; mark the maximum.', 'Write "choose min Cp, min BIC, max Adj-R²".'],
    checklist: ['RSS monotone down', 'R² monotone up', 'Cp/BIC minimum marked', 'Adj-R² maximum marked'] }
];

/* ---------- Table 1 (exam) ---------- */
const PATIENTS = [
  { id: 1, Age: 40, Sex: 'M', ChestPainType: 'ATA', RestingBP: 140, Cholesterol: 289, FastingBS: 0, RestingECG: 'Normal', MaxHR: 172, ExerciseAngina: 'N', Oldpeak: 0, ST_Slope: 'Up', HeartDisease: 0 },
  { id: 2, Age: 49, Sex: 'F', ChestPainType: 'NAP', RestingBP: 160, Cholesterol: 180, FastingBS: 0, RestingECG: 'Normal', MaxHR: 156, ExerciseAngina: 'N', Oldpeak: 1, ST_Slope: 'Flat', HeartDisease: 1 },
  { id: 3, Age: 37, Sex: 'M', ChestPainType: 'ATA', RestingBP: 130, Cholesterol: 283, FastingBS: 0, RestingECG: 'ST', MaxHR: 98, ExerciseAngina: 'N', Oldpeak: 0, ST_Slope: 'Up', HeartDisease: 0 },
  { id: 4, Age: 48, Sex: 'F', ChestPainType: 'ASY', RestingBP: 138, Cholesterol: 214, FastingBS: 0, RestingECG: 'Normal', MaxHR: 108, ExerciseAngina: 'Y', Oldpeak: 1.5, ST_Slope: 'Flat', HeartDisease: 1 },
  { id: 5, Age: 54, Sex: 'M', ChestPainType: 'NAP', RestingBP: 150, Cholesterol: 195, FastingBS: 0, RestingECG: 'Normal', MaxHR: 122, ExerciseAngina: 'N', Oldpeak: 0, ST_Slope: 'Up', HeartDisease: 0 }
];
const PATIENT_VARS = ['Age', 'Sex', 'ChestPainType', 'RestingBP', 'Cholesterol', 'FastingBS', 'RestingECG', 'MaxHR', 'ExerciseAngina', 'Oldpeak', 'ST_Slope'];

/* Logistic predictors as R would name them (dummy = 1 when patient has that level) */
const LOGIT_VARS = [
  { key: 'Age', label: 'Age', f: p => p.Age },
  { key: 'SexM', label: 'SexM (1 if Male)', f: p => p.Sex === 'M' ? 1 : 0 },
  { key: 'SexF', label: 'SexF (1 if Female)', f: p => p.Sex === 'F' ? 1 : 0 },
  { key: 'ChestPainTypeATA', label: 'ChestPainTypeATA', f: p => p.ChestPainType === 'ATA' ? 1 : 0 },
  { key: 'ChestPainTypeNAP', label: 'ChestPainTypeNAP', f: p => p.ChestPainType === 'NAP' ? 1 : 0 },
  { key: 'ChestPainTypeTA', label: 'ChestPainTypeTA', f: p => p.ChestPainType === 'TA' ? 1 : 0 },
  { key: 'ChestPainTypeASY', label: 'ChestPainTypeASY', f: p => p.ChestPainType === 'ASY' ? 1 : 0 },
  { key: 'RestingBP', label: 'RestingBP', f: p => p.RestingBP },
  { key: 'Cholesterol', label: 'Cholesterol', f: p => p.Cholesterol },
  { key: 'FastingBS', label: 'FastingBS', f: p => p.FastingBS },
  { key: 'RestingECGNormal', label: 'RestingECGNormal', f: p => p.RestingECG === 'Normal' ? 1 : 0 },
  { key: 'RestingECGST', label: 'RestingECGST', f: p => p.RestingECG === 'ST' ? 1 : 0 },
  { key: 'RestingECGLVH', label: 'RestingECGLVH', f: p => p.RestingECG === 'LVH' ? 1 : 0 },
  { key: 'MaxHR', label: 'MaxHR', f: p => p.MaxHR },
  { key: 'ExerciseAnginaY', label: 'ExerciseAnginaY (1 if Yes)', f: p => p.ExerciseAngina === 'Y' ? 1 : 0 },
  { key: 'Oldpeak', label: 'Oldpeak', f: p => p.Oldpeak },
  { key: 'ST_SlopeUp', label: 'ST_SlopeUp', f: p => p.ST_Slope === 'Up' ? 1 : 0 },
  { key: 'ST_SlopeFlat', label: 'ST_SlopeFlat', f: p => p.ST_Slope === 'Flat' ? 1 : 0 },
  { key: 'ST_SlopeDown', label: 'ST_SlopeDown', f: p => p.ST_Slope === 'Down' ? 1 : 0 }
];

const LIN_VARS = ['lcavol', 'lweight', 'age', 'lbph', 'svi', 'lcp', 'gleason', 'pgg45'];
const LIN_MODELS = { A: [-0.08, 0.62, 0.74, -0.02, 0.01], B: [1.08, 0.72, -0.002, 0.09], C: [-0.35, 0.89, -0.01, 0.08, 1.29, 0.01] };

const FORMULAS = [
  ['Logistic', 'P(Y=1|X) = 1 / (1 + e^−(β̂0 + β̂1X1 + … + β̂kXk))', 'T3 s9'],
  ['Error rate', '(1/n) Σ I(yi ≠ ŷi) = (n01 + n10) / n', 'T3 s22'],
  ['Sensitivity · Specificity', 'n11 / n1 · n00 / n0', 'T3 s20'],
  ['Cp', '(1/n)(RSS + 2kσ̂²)  → lowest', 'T2 s39'],
  ['BIC', '(1/n)(RSS + log(n)kσ̂²)  → lowest', 'T2 s40'],
  ['Adjusted R²', '1 − [RSS/(n−k−1)] / [TSS/(n−1)]  → largest', 'T2 s41'],
  ['LOO', 'MSE_LOO = (1/n) Σ (yi − ŷi)²', 'T2 s45'],
  ['Test MSE', '(1/t) Σ_{i∈test} (yi − ŷi)²', 'T2 s43'],
  ['KNN', 'P(Y=j|X=x) = (1/K) Σ_{i∈Nx} I(yi = j)', 'T3 s31']
];

return { TOPICS, EXAM_META, Q, CONCEPTS, NOT_EXAMINED, CARDS, PRACTICE, DIAGRAMS, PATIENTS, PATIENT_VARS, LOGIT_VARS, LIN_VARS, LIN_MODELS, FORMULAS };
})();
