"""
Complétion d'un DFA partiellement spécifié (section 3.2.2 du cours).
Ajoute un état puits 'qp' pour toutes les transitions manquantes.
"""
from algorithms.models.automate import Automate


def complete(automate: Automate) -> Automate:
    """
    Retourne un DFA complet équivalent en ajoutant un état puits si nécessaire.
    """
    sink = 'qp'
    new_transitions = list(automate.transitions)
    new_states = list(automate.states)
    sink_needed = False

    for state in automate.states:
        for symbol in automate.alphabet:
            dest = automate.get_transition(state, symbol)
            if dest is None:
                new_transitions.append({'from': state, 'symbol': symbol, 'to': sink})
                sink_needed = True

    if sink_needed:
        new_states.append(sink)
        for symbol in automate.alphabet:
            new_transitions.append({'from': sink, 'symbol': symbol, 'to': sink})

    return Automate(
        type_         = 'DFA',
        alphabet      = automate.alphabet,
        states        = new_states,
        initial_state = automate.initial_state,
        final_states  = automate.final_states,
        transitions   = new_transitions
    )
