"""
Algorithme 2 du cours (section 3.2.4 & 3.2.5) :
Construction des sous-ensembles — NFA/ε-NFA → DFA.
"""
from algorithms.models.automate import Automate
from algorithms.nfa.epsilon_closure import epsilon_closure_set


def _move(automate: Automate, states: frozenset, symbol: str) -> set:
    """
    Retourne l'ensemble des états atteignables depuis 'states'
    par une transition étiquetée 'symbol'.
    """
    result = set()
    for state in states:
        for t in automate.transitions:
            if t['from'] == state and t['symbol'] == symbol:
                dest = t['to']
                targets = dest if isinstance(dest, list) else [dest]
                result.update(targets)
    return result


def subset_construction(automate: Automate) -> Automate:
    """
    Construit le DFA équivalent à un NFA ou ε-NFA
    via la construction des sous-ensembles.

    Retourne un DFA dont les états sont nommés d'après
    les sous-ensembles d'états du NFA original.
    """
    # État initial du DFA = ε-fermeture de l'état initial du NFA
    start = epsilon_closure_set(automate, {automate.initial_state})

    # Nommage : frozenset → string lisible
    def name(fs): return '{' + ','.join(sorted(fs)) + '}'

    dfa_states_map = {}   # frozenset → nom
    unmarked = [start]
    dfa_states_map[start] = name(start)

    dfa_transitions = []
    dfa_final_states = []

    while unmarked:
        current = unmarked.pop(0)
        current_name = dfa_states_map[current]

        # Vérifier si c'est un état final
        if any(s in automate.final_states for s in current):
            if current_name not in dfa_final_states:
                dfa_final_states.append(current_name)

        for symbol in automate.alphabet:
            # move + ε-fermeture
            moved = _move(automate, current, symbol)
            if not moved:
                continue
            next_set = epsilon_closure_set(automate, moved)

            if next_set not in dfa_states_map:
                dfa_states_map[next_set] = name(next_set)
                unmarked.append(next_set)

            dfa_transitions.append({
                'from'  : current_name,
                'symbol': symbol,
                'to'    : dfa_states_map[next_set]
            })

    return Automate(
        type_         = 'DFA',
        alphabet      = automate.alphabet,
        states        = list(dfa_states_map.values()),
        initial_state = dfa_states_map[start],
        final_states  = dfa_final_states,
        transitions   = dfa_transitions
    )
