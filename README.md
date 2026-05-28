# INF3421 — Langages Formels & Compilation

Application web interactive implémentant les algorithmes du cours INF3421 du Département d'Informatique de l'Université de Yaoundé I (Prof. Etienne Kouokam, 2025-2026).

---

## Aperçu

L'application permet de construire, visualiser et transformer des automates finis, de manipuler des expressions régulières, et de résoudre des systèmes d'équations linéaires sur les langages — le tout directement dans le navigateur, avec une trace d'exécution pas à pas.

---

## Fonctionnalités

### Reconnaissance (§3.2.1)

- Saisie manuelle d'un DFA, NFA ou ε-NFA
- Test de reconnaissance d'un mot avec trace d'exécution complète
- **DFA** : un seul état courant, O(|u|)
- **NFA / ε-NFA** : suivi simultané de tous les ensembles d'états possibles
- Lecture pas à pas animée (⏮ ◀ ▶ ⏭) synchronisée avec le graphe
- Chemin acceptant trouvé par DFS (NFA)

### Transformations d'automates

| Transformation            | Section | Description                                                  |
| ------------------------- | ------- | ------------------------------------------------------------ |
| Complétion                | §3.2.2  | Ajout d'un état puits pour les transitions manquantes        |
| Émondage                  | §3.2.3  | Suppression des états non accessibles / non co-accessibles   |
| Suppression ε-transitions | §3.2.5  | ε-AFND → AFND (Algorithme 3)                                 |
| Déterminisation           | §3.2.4  | NFA → DFA par construction des sous-ensembles (Algorithme 2) |
| Minimisation              | §3.5.3  | DFA → DFA minimal par algorithme de Moore                    |

### Expressions régulières (§3.3.2)

- **Regex → Automate** : chaîne complète Thompson → sous-ensembles → Moore
- **Automate → Regex** : algorithme de Brzozowski-McCluskey (élimination d'états)
- Navigation entre les étapes intermédiaires (ε-AFND, AFD, AFD minimal)

### Équations linéaires (§2.3)

- **Lemme d'Arden** : résolution de X = AX + B → X = A\*B
- **Méthode de Gauss** : résolution de systèmes d'équations linéaires sur les langages
- **Depuis automate** : construction automatique du système d'équations associé et résolution

### Visualisation (Cytoscape.js)

- Flèche d'entrée sur l'état initial (nœud fantôme invisible)
- Double bordure sur les états finaux
- Surlignage animé de l'état courant pendant la reconnaissance
- Arêtes courbées pour les paires inverses, boucles pour les auto-transitions
- Contrôles : zoom +/−, recadrage, 5 layouts (auto, circle, breadthfirst, grid, concentric)
- Export PNG
- Tooltip au survol des états
- Table de transition δ interactive

---

## Architecture

```
Automaton_Processing/
├── backend/                        # API REST — Python / Flask
│   ├── app.py                      # Point d'entrée Flask + CORS
│   ├── requirements.txt
│   ├── routes/
│   │   ├── automate_routes.py      # /api/automate/*
│   │   ├── regex_routes.py         # /api/regex/*
│   │   └── equations_routes.py     # /api/equations/*
│   ├── algorithms/
│   │   ├── models/
│   │   │   └── automate.py         # Classe Automate (DFA / NFA / ε-NFA)
│   │   ├── dfa/
│   │   │   ├── recognition.py      # Reconnaissance DFA + NFA + ε-NFA
│   │   │   ├── completion.py       # Complétion (état puits)
│   │   │   └── trimming.py         # Émondage (états accessibles / co-accessibles)
│   │   ├── nfa/
│   │   │   ├── epsilon_closure.py  # ε-fermeture (Algorithme 3)
│   │   │   ├── remove_epsilon.py   # Suppression des ε-transitions
│   │   │   └── subset.py           # Construction des sous-ensembles (Algorithme 2)
│   │   ├── minimization/
│   │   │   └── moore.py            # Algorithme de Moore
│   │   ├── thompson/
│   │   │   └── thompson.py         # Algorithme de Thompson (Regex → ε-AFND)
│   │   ├── brzozowski/
│   │   │   └── bmc.py              # Brzozowski-McCluskey (Automate → Regex)
│   │   └── equations/
│   │       ├── arden.py            # Lemme d'Arden
│   │       └── gauss.py            # Méthode de Gauss
│   └── tests/
│       ├── conftest.py             # Fixtures partagées (automates du cours)
│       ├── test_recognition.py     # 17 tests — reconnaissance
│       ├── test_completion.py      # 7 tests  — complétion
│       ├── test_trimming.py        # 12 tests — émondage
│       └── test_epsilon_closure.py # 10 tests — ε-fermeture
│
└── frontend/                       # Interface — React 18
    ├── public/
    │   └── index.html
    └── src/
        ├── App.jsx                 # Routeur principal + layout + navigation
        ├── index.css               # Thème global (design sombre)
        ├── services/
        │   └── api.js              # Appels HTTP vers Flask (axios)
        ├── components/
        │   ├── AutomateGraph.jsx   # Visualisation Cytoscape.js
        │   ├── AutomateEditor.jsx  # Éditeur de saisie DFA/NFA/ε-NFA
        │   ├── TransitionTable.jsx # Table δ
        │   └── StepByStep.jsx      # Trace d'exécution pas à pas
        └── pages/
            ├── RecognitionPage.jsx # Page reconnaissance
            ├── TransformPage.jsx   # Page transformations
            ├── RegexPage.jsx       # Page expressions régulières
            └── EquationsPage.jsx   # Page équations
```

---

## Prérequis

| Outil   | Version minimale |
| ------- | ---------------- |
| Python  | 3.10+            |
| pip     | —                |
| Node.js | 16+              |
| npm     | 8+               |

---

## Installation et lancement

### 1. Cloner / extraire le projet

```bash
unzip Automaton_Processing.zip
cd Automaton_Processing
```

### 2. Backend Flask

```bash
cd backend

# Créer un environnement virtuel (recommandé)
python -m venv venv
source venv/bin/activate          # Linux / macOS
# venv\Scripts\activate           # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur (port 5000 par défaut)
python app.py
```

Le serveur démarre sur `http://localhost:5000`.

### 3. Frontend React

Dans un second terminal :

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer l'application (port 3000 par défaut)
npm start
```

L'application s'ouvre automatiquement sur `http://localhost:3000`.

---

## Tests

```bash
cd backend
python -m pytest tests/ -v
```

**Résultat attendu :**

```
46 passed in 0.08s
```

| Fichier de test           | Tests | Ce qui est testé                                               |
| ------------------------- | ----- | -------------------------------------------------------------- |
| `test_recognition.py`     | 17    | Mots acceptés, rejetés, étapes de calcul, transition manquante |
| `test_completion.py`      | 7     | Ajout état puits, absorption, préservation du langage          |
| `test_trimming.py`        | 12    | États accessibles, co-accessibles, émondage complet            |
| `test_epsilon_closure.py` | 10    | ε-fermeture unitaire et d'ensemble, cas limites                |

---

## API REST

### Format JSON — Automate

```json
{
  "automate": {
    "type": "DFA",
    "alphabet": ["a", "b"],
    "states": ["q0", "q1", "q2"],
    "initial_state": "q0",
    "final_states": ["q2"],
    "transitions": [
      { "from": "q0", "symbol": "a", "to": "q1" },
      { "from": "q1", "symbol": "b", "to": "q2" }
    ]
  }
}
```

> Pour un **NFA**, `"to"` peut être une liste : `"to": ["q1", "q2"]`  
> Pour un **ε-NFA**, utiliser `"symbol": ""` pour une ε-transition

### Endpoints

#### Automates — `/api/automate`

| Méthode | Route             | Corps                | Description                |
| ------- | ----------------- | -------------------- | -------------------------- |
| POST    | `/recognize`      | `{ automate, word }` | Reconnaissance d'un mot    |
| POST    | `/complete`       | `{ automate }`       | Complétion (état puits)    |
| POST    | `/trim`           | `{ automate }`       | Émondage                   |
| POST    | `/remove-epsilon` | `{ automate }`       | Suppression ε-transitions  |
| POST    | `/determinize`    | `{ automate }`       | NFA → DFA (sous-ensembles) |
| POST    | `/minimize`       | `{ automate }`       | Algorithme de Moore        |

#### Expressions régulières — `/api/regex`

| Méthode | Route            | Corps                 | Description                   |
| ------- | ---------------- | --------------------- | ----------------------------- |
| POST    | `/thompson`      | `{ regex, alphabet }` | Regex → ε-AFND (Thompson)     |
| POST    | `/to-automate`   | `{ regex, alphabet }` | Chaîne complète → AFD minimal |
| POST    | `/from-automate` | `{ automate }`        | Automate → Regex (BMC)        |

#### Équations — `/api/equations`

| Méthode | Route            | Corps                      | Description                          |
| ------- | ---------------- | -------------------------- | ------------------------------------ |
| POST    | `/arden`         | `{ A, B }`                 | Résout X = AX + B                    |
| POST    | `/gauss`         | `{ variables, equations }` | Système d'équations                  |
| POST    | `/from-automate` | `{ automate }`             | Système depuis automate + résolution |

### Exemple complet — reconnaissance

**Requête :**

```bash
curl -X POST http://localhost:5000/api/automate/recognize \
  -H "Content-Type: application/json" \
  -d '{
    "automate": {
      "type": "DFA",
      "alphabet": ["a","b"],
      "states": ["q0","q1","q2"],
      "initial_state": "q0",
      "final_states": ["q2"],
      "transitions": [
        {"from":"q0","symbol":"a","to":"q1"},
        {"from":"q1","symbol":"b","to":"q2"},
        {"from":"q2","symbol":"a","to":"q2"},
        {"from":"q2","symbol":"b","to":"q2"}
      ]
    },
    "word": "ab"
  }'
```

**Réponse :**

```json
{
  "accepted": true,
  "message": "Mot accepté",
  "final_state": "q2",
  "steps": [
    { "current_state": "q0", "symbol": "a", "next_state": "q1" },
    { "current_state": "q1", "symbol": "b", "next_state": "q2" }
  ],
  "all_paths": null
}
```

---

## Syntaxe des expressions régulières

| Opérateur        | Notation        | Exemple   |
| ---------------- | --------------- | --------- |
| Union            | `\|`            | `a\|b`    |
| Concaténation    | (juxtaposition) | `ab`      |
| Étoile de Kleene | `*`             | `a*`      |
| Une fois ou plus | `+`             | `a+`      |
| Optionnel        | `?`             | `b?`      |
| Groupement       | `()`            | `(a\|b)*` |
| Mot vide         | `ε`             | `ε`       |

Exemple : `(a|b)*abb` — tous les mots sur {a,b} se terminant par `abb`.

---

## Technologies

| Couche        | Technologie             | Rôle                             |
| ------------- | ----------------------- | -------------------------------- |
| Backend       | Python 3.12 + Flask 3   | API REST, algorithmes            |
| CORS          | flask-cors              | Communication frontend ↔ backend |
| Tests         | pytest                  | 46 tests unitaires               |
| Frontend      | React 18                | Interface utilisateur            |
| Visualisation | Cytoscape.js 3.28 (CDN) | Graphes d'automates interactifs  |
| HTTP client   | axios 1.6               | Appels API depuis React          |
| Build tool    | Create React App 5      | Bundling frontend                |

---

## Correspondance cours / code

| Section du cours | Algorithme                      | Fichier                             |
| ---------------- | ------------------------------- | ----------------------------------- |
| §3.2.1           | Reconnaissance DFA (Algo 1)     | `algorithms/dfa/recognition.py`     |
| §3.2.2           | Complétion (état puits)         | `algorithms/dfa/completion.py`      |
| §3.2.3           | Émondage                        | `algorithms/dfa/trimming.py`        |
| §3.2.5           | ε-fermeture (Algo 3)            | `algorithms/nfa/epsilon_closure.py` |
| §3.2.5           | Suppression ε-transitions       | `algorithms/nfa/remove_epsilon.py`  |
| §3.2.4           | Sous-ensembles NFA→DFA (Algo 2) | `algorithms/nfa/subset.py`          |
| §3.5.3           | Moore — minimisation            | `algorithms/minimization/moore.py`  |
| §3.3.2           | Thompson — Regex→ε-AFND         | `algorithms/thompson/thompson.py`   |
| §3.3.2           | Brzozowski-McCluskey            | `algorithms/brzozowski/bmc.py`      |
| §2.3.1           | Lemme d'Arden                   | `algorithms/equations/arden.py`     |
| §2.3.3           | Méthode de Gauss                | `algorithms/equations/gauss.py`     |

---

## Auteur

Projet réalisé dans le cadre du cours **INF3421 — Langages Formels & Compilation**  
Département d'Informatique, Faculté des Sciences  
Université de Yaoundé I — Année académique 2025-2026  
Encadrant : **Prof. Etienne Kouokam**
