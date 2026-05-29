import axios from 'axios';

const BASE = 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE });

// ── Automates ────────────────────────────────────────────────────────────────

export const recognizeWord = (automate, word) =>
  api.post('/automate/recognize', { automate, word }).then(r => r.data);

export const completeAutomate = (automate) =>
  api.post('/automate/complete', { automate }).then(r => r.data);

export const trimAutomate = (automate) =>
  api.post('/automate/trim', { automate }).then(r => r.data);

export const determinize = (automate) =>
  api.post('/automate/determinize', { automate }).then(r => r.data);

export const removeEpsilon = (automate) =>
  api.post('/automate/remove-epsilon', { automate }).then(r => r.data);

export const minimizeAutomate = (automate) =>
  api.post('/automate/minimize', { automate }).then(r => r.data);

// ── Regex ────────────────────────────────────────────────────────────────────

export const regexToThompson = (regex, alphabet) =>
  api.post('/regex/thompson', { regex, alphabet }).then(r => r.data);

export const regexToAutomate = (regex, alphabet) =>
  api.post('/regex/to-automate', { regex, alphabet }).then(r => r.data);

export const automateToRegex = (automate) =>
  api.post('/regex/from-automate', { automate }).then(r => r.data);

// ── Équations ────────────────────────────────────────────────────────────────

export const solveArden = (A, B) =>
  api.post('/equations/arden', { A, B }).then(r => r.data);

export const solveGauss = (variables, equations) =>
  api.post('/equations/gauss', { variables, equations }).then(r => r.data);

export const systemFromAutomate = (automate) =>
  api.post('/equations/from-automate', { automate }).then(r => r.data);

export const statesInfo = (automate) =>
  api.post('/automate/states-info', { automate }).then(r => r.data);
export const canonicalize = (automate) =>
  api.post('/automate/canonicalize', { automate }).then(r => r.data);
export const toNfa = (automate) =>
  api.post('/automate/to-nfa', { automate }).then(r => r.data);
export const toEnfa = (automate) =>
  api.post('/automate/to-enfa', { automate }).then(r => r.data);
export const automateUnion = (a1, a2) =>
  api.post('/automate/union', { automate1: a1, automate2: a2 }).then(r => r.data);
export const automateIntersection = (a1, a2) =>
  api.post('/automate/intersection', { automate1: a1, automate2: a2 }).then(r => r.data);
export const automateComplement = (automate) =>
  api.post('/automate/complement', { automate }).then(r => r.data);
export const automateConcatenation = (a1, a2) =>
  api.post('/automate/concatenation', { automate1: a1, automate2: a2 }).then(r => r.data);
export const automateKleeneStar = (automate) =>
  api.post('/automate/kleene-star', { automate }).then(r => r.data);
export const regexGlushkov = (regex, alphabet) =>
  api.post('/regex/glushkov', { regex, alphabet }).then(r => r.data);
export const regexCompare = (regex, alphabet) =>
  api.post('/regex/compare', { regex, alphabet }).then(r => r.data);
