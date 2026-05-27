"""
Suppression des transitions spontanées (section 3.2.5 du cours).
Transforme un ε-AFND en AFND équivalent sans ε-transitions.
"""
from algorithms.models.automate import Automate
from algorithms.nfa.epsilon_closure import epsilon_closure


def remove_epsilon(automate: Automate) -> Automate:
    """
    Retourne un AFND équivalent sans ε-transitions.

    Construction :
        F' = {q | ε-fermeture(q) ∩ F ≠ ∅}
        δ'(q, a) = ⋃ δ(p, a) pour p ∈ ε-fermeture(q)
    """
    new_transitions = []
    new_final_states = []

    for state in automate.states:
        eclosure = epsilon_closure(automate, state)

        # Nouveaux états finaux
        if any(s in automate.final_states for s in eclosure):
            if state not in new_final_states:
                new_final_states.append(state)

        # Nouvelles transitions
        for symbol in automate.alphabet:
            reachable = set()
            for s in eclosure:
                for t in automate.transitions:
                    if t['from'] == s and t['symbol'] == symbol:
                        dest = t['to']
                        targets = dest if isinstance(dest, list) else [dest]
                        reachable.update(targets)

            if reachable:
                new_transitions.append({
                    'from'  : state,
                    'symbol': symbol,
                    'to'    : list(reachable)
                })

    return Automate(
        type_         = 'NFA',
        alphabet      = automate.alphabet,
        states        = automate.states,
        initial_state = automate.initial_state,
        final_states  = new_final_states,
        transitions   = new_transitions
    )
