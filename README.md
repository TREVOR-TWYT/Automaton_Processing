# INF3421 — Langages Formels & Compilation
## Application Web — Backend Flask

### Structure
```
backend/
├── app.py                          # Point d'entrée Flask
├── requirements.txt
├── routes/
│   ├── automate_routes.py          # /api/automate/*
│   ├── regex_routes.py             # /api/regex/*
│   └── equations_routes.py         # /api/equations/*
└── algorithms/
    ├── models/automate.py          # Classe Automate (DFA/NFA/e-NFA)
    ├── dfa/
    │   ├── recognition.py          # Algo 1 : reconnaissance mot
    │   ├── completion.py           # Complétion état puits
    │   └── trimming.py             # Émondage
    ├── nfa/
    │   ├── epsilon_closure.py      # Algo 3 : ε-fermeture
    │   ├── remove_epsilon.py       # Suppression ε-transitions
    │   └── subset.py               # Algo 2 : sous-ensembles (NFA→DFA)
    ├── minimization/
    │   └── moore.py                # Algorithme de Moore
    ├── thompson/
    │   └── thompson.py             # Algorithme de Thompson (Regex→ε-AFND)
    ├── brzozowski/
    │   └── bmc.py                  # BMC (Automate→Regex)
    └── equations/
        ├── arden.py                # Lemme d'Arden
        └── gauss.py                # Méthode de Gauss

```

### Installation
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Routes API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/automate/recognize | Reconnaissance d'un mot |
| POST | /api/automate/complete | Complétion (état puits) |
| POST | /api/automate/trim | Émondage |
| POST | /api/automate/determinize | NFA → DFA |
| POST | /api/automate/remove-epsilon | ε-AFND → AFND |
| POST | /api/automate/minimize | Algorithme de Moore |
| POST | /api/regex/thompson | Regex → ε-AFND |
| POST | /api/regex/to-automate | Chaîne complète Regex → DFA minimal |
| POST | /api/regex/from-automate | Automate → Regex (BMC) |
| POST | /api/equations/arden | Lemme d'Arden |
| POST | /api/equations/gauss | Méthode de Gauss |
| POST | /api/equations/from-automate | Système depuis automate |

### Modèle JSON Automate
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

### Prochaines étapes
- [ ] Implémenter le frontend React
- [ ] Tester chaque algorithme avec pytest
- [ ] Ajouter la visualisation graphique (Cytoscape.js)
