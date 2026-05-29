"""
Conversions entre types d'automates (section 3.2 du cours) :
  - AFD  → AFN  (trivial : changement de type)
  - AFN  → ε-AFN (trivial : aucune ε-transition à ajouter)
  - AFD  → ε-AFN (trivial : idem)
"""
from algorithms.models.automate import Automate


def dfa_to_nfa(automate: Automate) -> Automate:
    """
    Conversion AFD → AFN.
    Triviale : un DFA est un cas particulier de NFA.
    On wrap chaque destination dans une liste pour respecter
    la convention NFA (t['to'] est une liste).
    """
    new_transitions = []
    for t in automate.transitions:
        dest = t['to']
        new_transitions.append({
            'from'  : t['from'],
            'symbol': t['symbol'],
            'to'    : dest if isinstance(dest, list) else [dest],
        })

    return Automate(
        type_         = 'NFA',
        alphabet      = automate.alphabet,
        states        = list(automate.states),
        initial_state = automate.initial_state,
        final_states  = list(automate.final_states),
        transitions   = new_transitions,
    )


def nfa_to_enfa(automate: Automate) -> Automate:
    """
    Conversion AFN → ε-AFN.
    Triviale : un NFA est un ε-NFA sans ε-transitions.
    On change juste le type.
    """
    return Automate(
        type_         = 'e-NFA',
        alphabet      = list(automate.alphabet),
        states        = list(automate.states),
        initial_state = automate.initial_state,
        final_states  = list(automate.final_states),
        transitions   = list(automate.transitions),
    )


def dfa_to_enfa(automate: Automate) -> Automate:
    """
    Conversion AFD → ε-AFN.
    Triviale : un DFA est un ε-NFA sans ε-transitions et déterministe.
    On change le type et on wrap les destinations en listes.
    """
    new_transitions = []
    for t in automate.transitions:
        dest = t['to']
        new_transitions.append({
            'from'  : t['from'],
            'symbol': t['symbol'],
            'to'    : dest if isinstance(dest, list) else [dest],
        })

    return Automate(
        type_         = 'e-NFA',
        alphabet      = list(automate.alphabet),
        states        = list(automate.states),
        initial_state = automate.initial_state,
        final_states  = list(automate.final_states),
        transitions   = new_transitions,
    )
