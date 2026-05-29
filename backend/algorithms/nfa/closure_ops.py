"""
Opérations de clôture sur les langages reconnaissables (section 3.3.1 du cours) :
  - Union        : L1 ∪ L2  (automate produit, états finaux F1×Q2 ∪ Q1×F2)
  - Intersection : L1 ∩ L2  (automate produit, états finaux F1×F2)
  - Complémentation : L̄    (inversion des états finaux, DFA complet requis)
  - Concaténation : L1·L2   (ε-transition entre état final A1 et initial A2)
  - Étoile : L*             (ε-transition de chaque état final vers l'initial)
"""
from algorithms.models.automate import Automate
from algorithms.dfa.completion import complete


# ── Automate produit (union / intersection) ────────────────────────────────────

def _product(a1: Automate, a2: Automate, mode: str) -> Automate:
    """
    Construit l'automate produit de a1 et a2.
    mode = 'union'        : états finaux = F1×Q2 ∪ Q1×F2
    mode = 'intersection' : états finaux = F1×F2
    Les deux automates doivent être des DFA complets.
    """
    # S'assurer que les deux sont des DFA complets
    if a1.type != 'DFA':
        from algorithms.nfa.subset import subset_construction
        a1 = subset_construction(a1)
    if a2.type != 'DFA':
        from algorithms.nfa.subset import subset_construction
        a2 = subset_construction(a2)

    a1 = complete(a1)
    a2 = complete(a2)

    # Produit cartésien des états
    def pair(s1, s2): return f'({s1},{s2})'

    product_states = [pair(s1, s2) for s1 in a1.states for s2 in a2.states]
    initial        = pair(a1.initial_state, a2.initial_state)

    f1, f2 = set(a1.final_states), set(a2.final_states)
    q1, q2 = set(a1.states), set(a2.states)

    if mode == 'union':
        final_states = [
            pair(s1, s2)
            for s1 in a1.states for s2 in a2.states
            if s1 in f1 or s2 in f2
        ]
    else:  # intersection
        final_states = [
            pair(s1, s2)
            for s1 in a1.states for s2 in a2.states
            if s1 in f1 and s2 in f2
        ]

    # Alphabet commun
    alphabet = sorted(set(a1.alphabet) | set(a2.alphabet))

    # Transitions
    def get_dest(a, state, sym):
        for t in a.transitions:
            if t['from'] == state and t['symbol'] == sym:
                return t['to']
        return None

    transitions = []
    for s1 in a1.states:
        for s2 in a2.states:
            for sym in alphabet:
                d1 = get_dest(a1, s1, sym)
                d2 = get_dest(a2, s2, sym)
                if d1 is not None and d2 is not None:
                    transitions.append({
                        'from'  : pair(s1, s2),
                        'symbol': sym,
                        'to'    : pair(d1, d2),
                    })

    return Automate(
        type_         = 'DFA',
        alphabet      = alphabet,
        states        = product_states,
        initial_state = initial,
        final_states  = final_states,
        transitions   = transitions,
    )


# ── Opérations publiques ───────────────────────────────────────────────────────

def union(a1: Automate, a2: Automate) -> Automate:
    """
    Construit un DFA reconnaissant L(a1) ∪ L(a2).
    Théorème 5 du cours (clôture par union ensembliste).
    """
    return _product(a1, a2, 'union')


def intersection(a1: Automate, a2: Automate) -> Automate:
    """
    Construit un DFA reconnaissant L(a1) ∩ L(a2).
    Théorème 6 du cours (clôture par intersection ensembliste).
    """
    return _product(a1, a2, 'intersection')


def complement(automate: Automate) -> Automate:
    """
    Construit un DFA reconnaissant le complément de L(automate).
    Théorème 4 du cours (clôture par complémentation).
    Requiert un DFA complet : on complète d'abord si nécessaire.
    """
    if automate.type != 'DFA':
        from algorithms.nfa.subset import subset_construction
        automate = subset_construction(automate)

    dfa = complete(automate)

    new_finals = [s for s in dfa.states if s not in dfa.final_states]

    return Automate(
        type_         = 'DFA',
        alphabet      = dfa.alphabet,
        states        = dfa.states,
        initial_state = dfa.initial_state,
        final_states  = new_finals,
        transitions   = dfa.transitions,
    )


def concatenation(a1: Automate, a2: Automate) -> Automate:
    """
    Construit un ε-NFA reconnaissant L(a1)·L(a2).
    Théorème 8 du cours (clôture par concaténation).
    Les états finaux de a1 sont reliés à l'état initial de a2 par ε-transitions.
    """
    # Renommer les états pour éviter les collisions
    def rename(a, prefix):
        rmap = {s: f'{prefix}_{s}' for s in a.states}
        new_t = []
        for t in a.transitions:
            dest = t['to']
            if isinstance(dest, list):
                dest = [rmap.get(d, d) for d in dest]
            else:
                dest = rmap.get(dest, dest)
            new_t.append({'from': rmap[t['from']], 'symbol': t['symbol'], 'to': dest})
        return (
            [rmap[s] for s in a.states],
            rmap[a.initial_state],
            [rmap[s] for s in a.final_states],
            new_t,
            rmap,
        )

    s1, i1, f1, t1, _ = rename(a1, 'A')
    s2, i2, f2, t2, _ = rename(a2, 'B')

    # ε-transitions des états finaux de A1 vers l'état initial de A2
    eps_transitions = [
        {'from': fs, 'symbol': '', 'to': i2}
        for fs in f1
    ]

    alphabet = sorted(set(a1.alphabet) | set(a2.alphabet))

    return Automate(
        type_         = 'e-NFA',
        alphabet      = alphabet,
        states        = s1 + s2,
        initial_state = i1,
        final_states  = f2,
        transitions   = t1 + t2 + eps_transitions,
    )


def kleene_star(automate: Automate) -> Automate:
    """
    Construit un ε-NFA reconnaissant L(automate)*.
    Théorème 9 du cours (clôture par étoile).
    Ajoute un nouvel état initial/final + ε-transitions.
    """
    # Renommer les états
    rmap  = {s: f'q_{s}' for s in automate.states}
    new_t = []
    for t in automate.transitions:
        dest = t['to']
        if isinstance(dest, list):
            dest = [rmap.get(d, d) for d in dest]
        else:
            dest = rmap.get(dest, dest)
        new_t.append({'from': rmap[t['from']], 'symbol': t['symbol'], 'to': dest})

    new_init  = '__qs__'
    new_init_renamed = rmap.get(automate.initial_state,
                                 f'q_{automate.initial_state}')
    renamed_finals = [rmap[s] for s in automate.final_states]

    # ε-transitions : nouvel initial → ancien initial
    #                 chaque état final → ancien initial (rebouclage)
    eps = [{'from': new_init, 'symbol': '', 'to': new_init_renamed}]
    for fs in renamed_finals:
        eps.append({'from': fs, 'symbol': '', 'to': new_init_renamed})

    all_states = [new_init] + [rmap[s] for s in automate.states]

    return Automate(
        type_         = 'e-NFA',
        alphabet      = list(automate.alphabet),
        states        = all_states,
        initial_state = new_init,
        final_states  = [new_init] + renamed_finals,
        transitions   = new_t + eps,
    )
