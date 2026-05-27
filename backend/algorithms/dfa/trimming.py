"""
Émondage d'un automate (section 3.2.3 du cours).
Supprime les états non accessibles et/ou non co-accessibles.
"""
from algorithms.models.automate import Automate


def accessible_states(automate: Automate) -> set:
    """Retourne l'ensemble des états accessibles depuis l'état initial."""
    visited = set()
    stack = [automate.initial_state]
    while stack:
        state = stack.pop()
        if state in visited:
            continue
        visited.add(state)
        for t in automate.transitions:
            if t['from'] == state:
                dest = t['to']
                targets = dest if isinstance(dest, list) else [dest]
                for target in targets:
                    if target not in visited:
                        stack.append(target)
    return visited


def co_accessible_states(automate: Automate) -> set:
    """Retourne l'ensemble des états co-accessibles (qui peuvent atteindre un état final)."""
    visited = set(automate.final_states)
    stack = list(automate.final_states)
    while stack:
        state = stack.pop()
        for t in automate.transitions:
            dest = t['to']
            targets = dest if isinstance(dest, list) else [dest]
            if state in targets and t['from'] not in visited:
                visited.add(t['from'])
                stack.append(t['from'])
    return visited


def trim(automate: Automate) -> Automate:
    """
    Retourne l'automate émondé : ne conserve que les états utiles
    (accessibles ET co-accessibles).
    """
    useful = accessible_states(automate) & co_accessible_states(automate)

    new_states = [s for s in automate.states if s in useful]
    new_finals = [s for s in automate.final_states if s in useful]
    new_transitions = []
    for t in automate.transitions:
        dest = t['to']
        targets = dest if isinstance(dest, list) else [dest]
        if t['from'] in useful and all(tgt in useful for tgt in targets):
            new_transitions.append(t)

    return Automate(
        type_         = automate.type,
        alphabet      = automate.alphabet,
        states        = new_states,
        initial_state = automate.initial_state,
        final_states  = new_finals,
        transitions   = new_transitions
    )
