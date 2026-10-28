// Formula cards (DESIGN.md §6.13). TeX is rendered to MathML at build time by scripts/build.mjs.
// Worked examples use numbers printed on the course slides. Practice numbers marked `illustrative: true`
// are made up for the exercise and are not course data.

export const FORMULAS = [
  {
    id: 'f-logistic', title: 'Logistic regression probability', priority: 'high', topic: 't3', concept: 'c-logit', q: ['q2ii'],
    tex: String.raw`P(Y=1\mid X)=\dfrac{1}{1+e^{-\left(\hat\beta_0+\hat\beta_1X_1+\cdots+\hat\beta_kX_k\right)}}`,
    alt: String.raw`P(Y=1\mid X)=\dfrac{1}{1+e^{-\eta}},\qquad \eta=\hat\beta_0+\sum_{j=1}^{k}\hat\beta_jX_j`,
    plain: 'Add up the coefficients times the predictor values to get one number η (the linear predictor). The logistic function squeezes η into a probability between 0 and 1: η = 0 gives 0.5, large positive η gives close to 1, large negative η gives close to 0.',
    vars: [[String.raw`\eta`, 'Linear predictor (log-odds)', 'any real number'], [String.raw`\hat\beta_0`, 'Intercept', '—'], [String.raw`\hat\beta_j`, 'Coefficient of predictor j', 'per unit of Xj'], [String.raw`X_j`, 'Value of predictor j (a dummy is 0 or 1)', 'units of Xj'], [String.raw`e`, "Euler's number ≈ 2.718", '—']],
    example: { title: 'Topic 3 slide 16: activate, time = 1000', steps: [
      String.raw`\eta=-10.65+0.0055\times1000=-5.15`,
      String.raw`P=\dfrac{1}{1+e^{5.15}}=\dfrac{1}{1+172.4}=0.00576`,
      String.raw`P(\text{activate}=0)=1-0.00576=0.994`] },
    practice: { q: 'Same model (T3 s10): P(activate = 1 | time) = 1/(1 + e^−(−10.65 + 0.0055·time)). What is the probability when time = 2000? Give 4 decimals.', a: 0.5866, tol: 0.0015,
      steps: [String.raw`\eta=-10.65+0.0055\times2000=0.35`, String.raw`P=\dfrac{1}{1+e^{-0.35}}=\dfrac{1}{1+0.7047}=0.5866`] },
    source: 'T3 s9, s10, s16', fig: 'sigmoid'
  },
  {
    id: 'f-cutoff', title: 'From probability to class (cutoff)', priority: 'high', topic: 't3', concept: 'c-logit', q: ['q2ii'],
    tex: String.raw`\hat y=\begin{cases}1 & \text{if } P(Y=1\mid X)>z\\[2pt] 0 & \text{if } P(Y=1\mid X)<z\end{cases}`,
    plain: 'Pick a threshold z. Probabilities above it become class 1, below it class 0. The default is 0.5; the exam uses z = 0.45, which labels more observations as 1.',
    vars: [[String.raw`z`, 'Cutoff / threshold, 0 ≤ z ≤ 1', '—'], [String.raw`\hat y`, 'Predicted class', '0 or 1']],
    example: { title: 'Topic 3 slide 17', steps: [String.raw`P(\text{activate}=1\mid\text{time}=1000)=0.00576`, String.raw`0.00576<0.5\;\Rightarrow\;\hat y=0\ (\text{No})`] },
    practice: { q: 'A patient has P(HeartDisease = 1 | x) = 0.47. With the exam cutoff z = 0.45, what class is predicted? (type 0 or 1)', a: 1, tol: 0, illustrative: true,
      steps: [String.raw`0.47>0.45\;\Rightarrow\;\hat y=1`] },
    source: 'T3 s17', fig: 'cutoff'
  },
  {
    id: 'f-odds', title: 'Odds and logit', priority: 'medium', topic: 't3', concept: 'c-logit', q: ['q2ii'],
    tex: String.raw`\text{odds}=\dfrac{p}{1-p}=e^{\eta}\qquad \text{logit}=\log\!\left(\dfrac{p}{1-p}\right)=\eta`,
    plain: 'Odds compare "yes" with "no": odds 1/4 means 1 yes for every 4 no. The logit is the log of the odds and equals the linear predictor η, which is why the sign of a coefficient tells you the direction of the effect.',
    vars: [[String.raw`p`, 'P(Y = 1 | X)', '0 to 1'], [String.raw`\text{odds}`, 'p ÷ (1 − p)', '0 to ∞'], [String.raw`e^{\hat\beta_j\varepsilon}`, 'Factor the odds are multiplied by when Xj rises by ε', '—']],
    example: { title: 'Topic 3 slides 12–13', steps: [String.raw`p=0.2\;\Rightarrow\;\text{odds}=\dfrac{0.2}{0.8}=\dfrac14`, String.raw`\text{time}+10\;\Rightarrow\;\text{odds}\times e^{0.006\times10}=\times1.06`, String.raw`\text{logit increases by }0.006\times10=0.06`] },
    practice: { q: 'If p = 0.75, what are the odds?', a: 3, tol: 0.001, illustrative: true, steps: [String.raw`\dfrac{0.75}{0.25}=3`] },
    source: 'T3 s12, s13', fig: 'odds'
  },
  {
    id: 'f-error', title: 'Error rate (test error for classification)', priority: 'high', topic: 't3', concept: 'c-cm', q: ['q2i', 'q2ii', 'q3'],
    tex: String.raw`\text{Error}=\dfrac{1}{n}\sum_{i=1}^{n}I(y_i\neq\hat y_i)=\dfrac{n_{01}+n_{10}}{n}`,
    plain: 'Count the observations the rule got wrong and divide by how many there are. In the confusion matrix those are the two off-diagonal cells. On a test set this is the test error.',
    vars: [[String.raw`I(\cdot)`, 'Indicator: 1 if true, 0 if false', '—'], [String.raw`n_{01}`, 'Observed 0, predicted 1 (false positives)', 'count'], [String.raw`n_{10}`, 'Observed 1, predicted 0 (false negatives)', 'count'], [String.raw`n`, 'Number of observations', 'count']],
    example: { title: 'Topic 3 slide 19: logistic, time only', steps: [String.raw`n_{01}=42,\quad n_{10}=233,\quad n=10000`, String.raw`\text{Error}=\dfrac{42+233}{10000}=0.0275\;(2.75\%)`, String.raw`\text{Accuracy}=1-0.0275=97.25\%`] },
    practice: { q: 'LDA with time only (T3 s29): n01 = 24, n10 = 257, n = 10000. What is the error rate? (decimal)', a: 0.0281, tol: 0.0002,
      steps: [String.raw`\dfrac{24+257}{10000}=0.0281`] },
    source: 'T3 s18, s22, s23', fig: 'cm-error'
  },
  {
    id: 'f-sens', title: 'Sensitivity and specificity', priority: 'high', topic: 't3', concept: 'c-cm', q: ['q2iii'],
    tex: String.raw`\text{Sensitivity}=\dfrac{n_{11}}{n_1}\qquad\text{Specificity}=\dfrac{n_{00}}{n_0}`,
    plain: 'Sensitivity: of the real 1s (e.g. patients with heart disease), what share did we catch? Specificity: of the real 0s, what share did we correctly leave alone? Each is computed within one row of the matrix.',
    vars: [[String.raw`n_{11}`, 'True positives', 'count'], [String.raw`n_1`, 'Observed 1s (row total)', 'count'], [String.raw`n_{00}`, 'True negatives', 'count'], [String.raw`n_0`, 'Observed 0s (row total)', 'count']],
    example: { title: 'Topic 3 slide 23: logistic, time only', steps: [String.raw`\text{Sensitivity}=\dfrac{100}{333}=30.03\%`, String.raw`\text{Specificity}=\dfrac{9625}{9667}=99.57\%`, String.raw`\text{Sens}+\text{FNR}=1,\quad\text{Spec}+\text{FPR}=1`] },
    practice: { q: 'LDA with time only (T3 s29): n11 = 76, n1 = 333. Sensitivity? (decimal, 4 places)', a: 0.2282, tol: 0.0006, steps: [String.raw`\dfrac{76}{333}=0.2282`] },
    source: 'T3 s20, s21, s23', fig: 'cm-rows'
  },
  {
    id: 'f-bacc', title: 'Balanced accuracy', priority: 'medium', topic: 't3', concept: 'c-cm', q: ['q2iii'],
    tex: String.raw`\text{Balanced accuracy}=\dfrac12\left(\dfrac{n_{00}}{n_0}+\dfrac{n_{11}}{n_1}\right)`,
    plain: 'The average of specificity and sensitivity. With imbalanced classes (few 1s) plain accuracy looks great even when most 1s are missed; balanced accuracy exposes that.',
    vars: [[String.raw`n_{00}/n_0`, 'Specificity', 'proportion'], [String.raw`n_{11}/n_1`, 'Sensitivity', 'proportion']],
    example: { title: 'Topic 3 slide 23: logistic, time only', steps: [String.raw`0.5\left(\dfrac{9625}{9667}+\dfrac{100}{333}\right)=0.5\,(0.9957+0.3003)=0.648`] },
    practice: { q: 'Logistic with sensor, time and power (T3 s19): n00 = 9627, n0 = 9667, n11 = 105, n1 = 333. Balanced accuracy? (decimal)', a: 0.6556, tol: 0.001,
      steps: [String.raw`0.5\left(\dfrac{9627}{9667}+\dfrac{105}{333}\right)=0.5\,(0.9959+0.3153)=0.6556`] },
    source: 'T3 s21, s23', fig: 'cm-rows'
  },
  {
    id: 'f-linpred', title: 'Linear regression prediction', priority: 'high', topic: 't2', concept: 'c-coef', q: ['q4iii'],
    tex: String.raw`\hat y=\hat\beta_0+\hat\beta_1x_1+\hat\beta_2x_2+\cdots+\hat\beta_kx_k`,
    plain: 'Start from the intercept and add each coefficient times the observation\'s value. A variable that is not in the model contributes nothing.',
    vars: [[String.raw`\hat\beta_0`, 'Intercept: expected y when all x = 0', 'units of y'], [String.raw`\hat\beta_j`, 'Average change in y for +1 in xj, others fixed', 'y per unit of xj'], [String.raw`\hat y`, 'Prediction', 'units of y']],
    example: { title: 'Topic 2 slides 6 & 15: first row of the production data', steps: [String.raw`\hat y=2.94+0.05(230.1)+0.19(37.8)-0.001(69.2)`, String.raw`=2.94+11.505+7.182-0.0692=21.56`, String.raw`y=22.1\;\Rightarrow\;e=y-\hat y=0.54`] },
    practice: { q: 'Same model, second data row of T2 s6: temperature 44.5, humidity 39.3, time 45.1. Predicted out.quantity? (2 decimals)', a: 12.59, tol: 0.02,
      steps: [String.raw`2.94+0.05(44.5)+0.19(39.3)-0.001(45.1)`, String.raw`=2.94+2.225+7.467-0.0451=12.59`] },
    source: 'T2 s13, s14, s15', fig: 'line'
  },
  {
    id: 'f-rss', title: 'Residuals, RSS and R²', priority: 'medium', topic: 't2', concept: 'c-rss', q: ['q1iii', 'q4ii'],
    tex: String.raw`e_i=y_i-\hat y_i\qquad \text{RSS}=\sum_{i=1}^{n}e_i^2\qquad R^2=\operatorname{Cor}(Y,\hat Y)^2`,
    plain: 'A residual is the vertical gap between a point and the fitted line. RSS adds up the squared gaps on the training data. R² is the share of the variation in y the model explains. Adding predictors always lowers RSS and raises R².',
    vars: [[String.raw`e_i`, 'Residual of observation i', 'units of y'], [String.raw`\text{RSS}`, 'Residual sum of squares (training)', 'units of y²'], [String.raw`R^2`, 'Coefficient of determination', '0 to 1']],
    example: { title: 'Topic 2 slides 10 & 12: out.quantity on temperature', steps: [String.raw`\hat y=7.03+0.05(230.1)=18.54,\quad y=22.1`, String.raw`e=22.1-18.54=3.56,\quad e^2=12.7`, String.raw`\operatorname{Cor}=0.78\;\Rightarrow\;R^2=0.78^2\approx0.61`] },
    practice: { q: 'Same simple model (out.quantity = 7.03 + 0.05·temperature). Row 3 of T2 s6: temperature 17.2, y = 9.3. Squared residual e²? (2 decimals)', a: 1.99, tol: 0.02,
      steps: [String.raw`\hat y=7.03+0.05(17.2)=7.89`, String.raw`e=9.3-7.89=1.41,\quad e^2=1.99`] },
    source: 'T2 s8, s10, s12, s35', fig: 'line'
  },
  {
    id: 'f-cp', title: 'Mallows Cp', priority: 'high', topic: 't2', concept: 'c-ind', q: ['q4ii'],
    tex: String.raw`C_p=\dfrac{1}{n}\left(\text{RSS}+2k\hat\sigma^2\right)\qquad\text{choose the lowest}`,
    plain: 'Training RSS plus a penalty of 2σ̂² for every predictor. More predictors lower RSS but raise the penalty, so Cp finds a balance. Smaller is better.',
    vars: [[String.raw`k`, 'Number of predictors in the model', 'count'], [String.raw`\hat\sigma^2`, 'Estimate of Var(ε)', 'units of y²'], [String.raw`n`, 'Number of observations', 'count']],
    example: { title: 'Exam Table 3', steps: [String.raw`C_p:\;A=12.77,\;B=28.46,\;C=48.84`, String.raw`\min\;\Rightarrow\;\text{Model A}`] },
    practice: { q: 'Illustrative numbers: RSS = 50, k = 3, σ̂² = 0.5, n = 100. Cp?', a: 0.53, tol: 0.001, illustrative: true,
      steps: [String.raw`\dfrac{1}{100}\left(50+2\times3\times0.5\right)=\dfrac{53}{100}=0.53`] },
    source: 'T2 s38, s39', fig: 'crit'
  },
  {
    id: 'f-bic', title: 'BIC', priority: 'high', topic: 't2', concept: 'c-ind', q: ['q4ii'],
    tex: String.raw`\text{BIC}=\dfrac{1}{n}\left(\text{RSS}+\log(n)\,k\hat\sigma^2\right)\qquad\text{choose the lowest}`,
    plain: 'Same shape as Cp, but each predictor costs log(n)·σ̂² instead of 2σ̂². Once n > 7, log(n) > 2, so BIC punishes extra variables harder and tends to pick smaller models.',
    vars: [[String.raw`\log(n)`, 'Natural log of the sample size', '—'], [String.raw`k`, 'Number of predictors', 'count']],
    example: { title: 'Penalty per predictor (Cp vs BIC)', steps: [String.raw`\log(n)>2\iff n>e^2\approx7.39`, String.raw`n=94\;(\text{exam Q4}):\;\log(94)=4.54>2`, String.raw`\text{BIC}:\;A=230.87<B<C\;\Rightarrow\;\text{Model A}`] },
    practice: { q: 'For n = 10000 (the activate data in Topic 3), what is the BIC penalty factor log(n)? (2 decimals)', a: 9.21, tol: 0.01,
      steps: [String.raw`\log(10000)=9.21`] },
    source: 'T2 s40', fig: 'penalty'
  },
  {
    id: 'f-adjr2', title: 'Adjusted R²', priority: 'high', topic: 't2', concept: 'c-ind', q: ['q4ii'],
    tex: String.raw`R^2_{\text{adj}}=1-\dfrac{\text{RSS}/(n-k-1)}{\text{TSS}/(n-1)},\qquad \text{TSS}=\sum_{i=1}^{n}(y_i-\bar y)^2`,
    plain: 'Like R², but RSS is divided by n − k − 1, so a useless extra predictor can make it go down. Larger is better, unlike Cp and BIC.',
    vars: [[String.raw`\text{TSS}`, 'Total sum of squares around the mean', 'units of y²'], [String.raw`n-k-1`, 'Residual degrees of freedom', 'count'], [String.raw`\bar y`, 'Sample mean of y', 'units of y']],
    example: { title: 'Exam Table 3', steps: [String.raw`R^2_{\text{adj}}:\;A=0.61,\;B=0.54,\;C=0.46`, String.raw`\max\;\Rightarrow\;\text{Model A}`] },
    practice: { q: 'Illustrative numbers: RSS = 40, TSS = 100, n = 21, k = 4. Adjusted R²?', a: 0.5, tol: 0.001, illustrative: true,
      steps: [String.raw`1-\dfrac{40/16}{100/20}=1-\dfrac{2.5}{5}=0.5`] },
    source: 'T2 s41', fig: 'crit'
  },
  {
    id: 'f-testmse', title: 'Test MSE (validation set)', priority: 'high', topic: 't2', concept: 'c-cv', q: ['q4iii'],
    tex: String.raw`\text{MSE}_{VS}=\dfrac{1}{t}\sum_{i\in\Omega_{TEST}}\left(y_i-\hat y_i\right)^2`,
    plain: 'Predict each held-out observation, square the error, and average over the t test observations. This is how you compare models A, B and C in Q4(iii).',
    vars: [[String.raw`\Omega_{TEST}`, 'Test (held-out) observations', 'set'], [String.raw`t`, 'Number of test observations', 'count']],
    example: { title: 'How Q4(iii) is scored', steps: [String.raw`\text{for each model: }\hat y_i\text{ for every test row}`, String.raw`\text{MSE}=\tfrac1t\sum(y_i-\hat y_i)^2`, String.raw`\text{choose the model with the smallest MSE}`] },
    practice: { q: 'Illustrative: three test residuals 0.5, −1 and 0.5. Test MSE?', a: 0.5, tol: 0.001, illustrative: true,
      steps: [String.raw`\dfrac{0.25+1+0.25}{3}=0.5`] },
    source: 'T2 s43', fig: 'split'
  },
  {
    id: 'f-loo', title: 'Leave-One-Out estimate', priority: 'high', topic: 't2', concept: 'c-cv', q: ['q3'],
    tex: String.raw`\text{MSE}_{LOO}=\dfrac{1}{n}\sum_{i=1}^{n}\left(y_i-\hat y_{(i)}\right)^2\qquad \text{Err}_{LOO}=\dfrac{1}{n}\sum_{i=1}^{n}I\!\left(y_i\neq\hat y_{(i)}\right)`,
    alt: String.raw`\hat y_{(i)}=\text{prediction for } x_i \text{ from the model fitted without observation } i`,
    plain: 'Run n rounds. In round i, leave observation i out, fit on the other n − 1, predict observation i. Average the n errors. For classification (Q3) the error of a round is 1 if misclassified, 0 if correct.',
    vars: [[String.raw`\hat y_{(i)}`, 'Prediction of observation i from the model fitted without it', '—'], [String.raw`n`, 'Number of observations = number of fits', 'count']],
    example: { title: 'KNN with LOO (exam Q3), fixed K', steps: [String.raw`i=1,\dots,n:\;\text{train on }\Omega\setminus\{(x_i,y_i)\}`, String.raw`\hat y_{(i)}=\text{majority class of the }K\text{ nearest neighbours of }x_i`, String.raw`\text{Err}_{LOO}=\tfrac1n\sum I(y_i\neq\hat y_{(i)})`] },
    practice: { q: 'Illustrative: LOO on the 600 heart-disease patients misclassifies 90 of them. Err_LOO?', a: 0.15, tol: 0.001, illustrative: true,
      steps: [String.raw`\dfrac{90}{600}=0.15`] },
    source: 'T2 s45, s46; T3 s22', fig: 'loo'
  },
  {
    id: 'f-kfold', title: 'k-fold cross-validation', priority: 'medium', topic: 't2', concept: 'c-cv', q: ['q3'],
    tex: String.raw`\text{MSE}_{kCV}=\dfrac{1}{k}\sum_{i=1}^{k}\text{MSE}_i`,
    plain: 'Split the data into k folds. Each fold is the test set once while the model is fitted on the other folds. Average the k fold errors. LOO is the case k = n.',
    vars: [[String.raw`k`, 'Number of folds (usually 5 or 10)', 'count'], [String.raw`\text{MSE}_i`, 'Test MSE on fold i', 'units of y²']],
    example: { title: 'Topic 2 slide 48', steps: [String.raw`k=n\;\Rightarrow\;\text{Leave-One-Out}`, String.raw`k=5\text{ or }10\text{ in practice}`] },
    practice: { q: 'Illustrative: 5 folds with MSE 2, 3, 4, 3, 3. MSE_kCV?', a: 3, tol: 0.001, illustrative: true, steps: [String.raw`\dfrac{2+3+4+3+3}{5}=3`] },
    source: 'T2 s47, s48', fig: 'kfold'
  },
  {
    id: 'f-knn', title: 'KNN class probability', priority: 'high', topic: 't3', concept: 'c-knn', q: ['q3'],
    tex: String.raw`P(Y=j\mid X=x)=\dfrac{1}{K}\sum_{i\in\mathcal N_x}I(y_i=j)`,
    plain: 'Look at the K training points nearest to x and count how many are of class j. That fraction is the estimated probability. Predict the class with the largest fraction.',
    vars: [[String.raw`K`, 'Number of neighbours (fixed, tuned by CV)', 'count'], [String.raw`\mathcal N_x`, 'The K training points closest to x', 'set']],
    example: { title: 'Topic 3 slide 32: 3-NN', steps: [String.raw`K=3:\;2\text{ of class A},\;1\text{ of class B}`, String.raw`P(A\mid x)=\tfrac23,\quad P(B\mid x)=\tfrac13\;\Rightarrow\;\hat y=A`] },
    practice: { q: 'Illustrative: K = 5 and 3 of the neighbours have heart disease. P(HeartDisease = 1 | x)?', a: 0.6, tol: 0.001, illustrative: true, steps: [String.raw`\dfrac35=0.6`] },
    source: 'T3 s31, s32', fig: 'knn'
  },
  {
    id: 'f-euclid', title: 'Euclidean distance', priority: 'medium', topic: 't4', concept: 'c-dist', q: ['q3'],
    tex: String.raw`d(x_1,x_2)=\sqrt{(x_{11}-x_{21})^2+(x_{12}-x_{22})^2+\cdots+(x_{1k}-x_{2k})^2}`,
    plain: 'Straight-line distance: Pythagoras in k dimensions. KNN uses it to decide who is "nearest", so standardise variables first or the one with the biggest numbers dominates.',
    vars: [[String.raw`x_{1j}`, 'Value of variable j for observation 1', 'units of j'], [String.raw`k`, 'Number of variables', 'count']],
    example: { title: 'Two points in 2-D', steps: [String.raw`x_1=(1,2),\;x_2=(4,6)`, String.raw`d=\sqrt{3^2+4^2}=\sqrt{25}=5`] },
    practice: { q: 'Illustrative: x1 = (0, 0, 0), x2 = (2, 3, 6). Euclidean distance?', a: 7, tol: 0.001, illustrative: true, steps: [String.raw`\sqrt{4+9+36}=\sqrt{49}=7`] },
    source: 'T4 s8 (standardise: T4 s3)', fig: 'euclid'
  },
  {
    id: 'f-gini', title: 'Gini index of a tree node', priority: 'low', topic: 't3', concept: 'c-tree', q: ['q2i'],
    tex: String.raw`G=\sum_{\ell=1}^{l}\hat p_{j\ell}\left(1-\hat p_{j\ell}\right)`,
    plain: 'Measures how mixed a node is. 0 means the node is pure (one class). With two classes it is largest, 0.5, at a 50/50 split. Trees choose splits that reduce it most.',
    vars: [[String.raw`\hat p_{j\ell}`, 'Share of training points in node j from class ℓ', 'proportion'], [String.raw`l`, 'Number of classes', 'count']],
    example: { title: 'Two classes', steps: [String.raw`(1,0):\;G=0\;(\text{pure})`, String.raw`(0.5,0.5):\;G=0.25+0.25=0.5`] },
    practice: { q: 'A node has class shares 0.8 and 0.2. Gini index?', a: 0.32, tol: 0.001, illustrative: true, steps: [String.raw`0.8(0.2)+0.2(0.8)=0.32`] },
    source: 'T3 s46', fig: 'gini'
  },
  {
    id: 'f-dummy', title: 'Dummy variables in a regression', priority: 'medium', topic: 't2', concept: 'c-dummy', q: ['q2ii'],
    tex: String.raw`Y=\beta_0+\beta_1Z_1+\beta_2Z_2+\varepsilon=\begin{cases}\beta_0+\beta_1+\varepsilon & \text{category 1}\\ \beta_0+\beta_2+\varepsilon & \text{category 2}\\ \beta_0+\varepsilon & \text{baseline}\end{cases}`,
    plain: 'A category with m levels becomes m − 1 switches that are 1 for "this level" and 0 otherwise. The baseline level has all switches at 0, so its value is just the intercept. In the exam\'s logistic model, a term like ST_SlopeUp works the same way.',
    vars: [[String.raw`Z_1,Z_2`, 'Dummy variables (0/1)', '—'], [String.raw`\beta_1`, 'Difference between category 1 and the baseline', 'units of y']],
    example: { title: 'Topic 2 slide 22: credit debt by ethnicity', steps: [String.raw`\hat y=531.00-18.69z_1-12.50z_2`, String.raw`\text{Asian }(z_1=1,z_2=0):\;531.00-18.69=512.31`] },
    practice: { q: 'Same model: predicted debt for the Caucasian category (z1 = 0, z2 = 1)?', a: 518.5, tol: 0.01, steps: [String.raw`531.00-12.50=518.50`] },
    source: 'T2 s19–22', fig: 'dummy'
  }
];
