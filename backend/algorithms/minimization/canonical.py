"""
Canonisation d'un automate (section 3.5.2 du cours) :
L'automate canonique est le DFA minimal unique (a renumerotation pres)
reconnaissant un langage donne.

On l'obtient en :
  1. Determinisant (si NFA/e-NFA)
  2. Emondant (supprimer etats inutiles)
  3. Minimisant (algorithme de Moore)
  4. Renumerotant les etats canoniquement (BFS depuis l'etat initial)
"""
from algorithms.models.automate import Automate
from algorithms.dfa.trimming import trim
from algorithms.minimization.moore import minimize


def canonicalize(automate: Automate) -> Automate:
    """
    Retourne l'automate canonique de l'automate donne.

    Pipeline :
        1. Determinisation (si NFA ou e-NFA)
        2. Emondage
        3. Minimisation (Moore)
        4. Renumerotation BFS : q0, q1, q2, ...
    """
    # 1. Determinisation si necessaire
    if automate.type != 'DFA':
        from algorithms.nfa.subset import subset_construction
        dfa = subset_construction(automate)
    else:
        dfa = automate

    # 2. Emondage
    dfa = trim(dfa)

    # 3. Minimisation
    dfa = minimize(dfa)

    # 4. Renumerotation BFS canonique
    return _renumber(dfa)


def _renumber(dfa: Automate) -> Automate:
    """
    Renumerote les etats en BFS depuis l'etat initial.
    q0, q1, q2, ... dans l'ordre de decouverte.
    """
    # BFS
    old_to_new = {}
    queue      = [dfa.initial_state]
    counter    = 0

    # Map des transitions pour acces rapide
    tmap = {}
    for t in dfa.transitions:
        tmap.setdefault(t['from'], {})[t['symbol']] = t['to']

    visited = set()
    while queue:
        state = queue.pop(0)
        if state in visited:
            continue
        visited.add(state)
        old_to_new[state] = f'q{counter}'
        counter += 1

        for sym in sorted(dfa.alphabet):
            dest = tmap.get(state, {}).get(sym)
            if dest and dest not in visited:
                queue.append(dest)

    # Reconstruire avec les nouveaux noms
    new_states  = [old_to_new[s] for s in dfa.states if s in old_to_new]
    new_initial = old_to_new.get(dfa.initial_state, 'q0')
    new_finals  = [old_to_new[s] for s in dfa.final_states if s in old_to_new]

    new_transitions = []
    for t in dfa.transitions:
        frm  = old_to_new.get(t['from'])
        dest = t['to']
        to   = old_to_new.get(dest) if isinstance(dest, str) else None
        if frm and to:
            new_transitions.append({
                'from'  : frm,
                'symbol': t['symbol'],
                'to'    : to,
            })

    return Automate(
        type_         = 'DFA',
        alphabet      = dfa.alphabet,
        states        = new_states,
        initial_state = new_initial,
        final_states  = new_finals,
        transitions   = new_transitions,
    )
