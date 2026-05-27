"""
Algorithme 3 du cours (section 3.2.5) :
Calcul de la ε-fermeture d'un ensemble d'états.
"""
from algorithms.models.automate import Automate


def epsilon_closure(automate: Automate, states) -> frozenset:
    """
    Calcule ε-fermeture(states) :
    ensemble de tous les états accessibles depuis 'states'
    par des ε-transitions uniquement.

    Paramètres :
        automate : ε-AFND
        states   : un état (str) ou un ensemble d'états
    Retourne :
        frozenset des états de la ε-fermeture
    """
    if isinstance(states, str):
        states = {states}
    
    closure = set(states)
    stack = list(states)

    while stack:
        state = stack.pop()
        for t in automate.transitions:
            if t['from'] == state and t['symbol'] == '':   # '' représente ε
                dest = t['to']
                targets = dest if isinstance(dest, list) else [dest]
                for target in targets:
                    if target not in closure:
                        closure.add(target)
                        stack.append(target)

    return frozenset(closure)


def epsilon_closure_set(automate: Automate, states: set) -> frozenset:
    """
    ε-fermeture d'un ensemble d'états :
    union des ε-fermetures de chaque état.
    """
    result = set()
    for state in states:
        result |= epsilon_closure(automate, state)
    return frozenset(result)
