"""
Identification des états d'un automate (section 3.2.3 du cours) :
- États accessibles
- États co-accessibles
- États utiles (accessibles ET co-accessibles)
"""
from algorithms.models.automate import Automate
from algorithms.dfa.trimming import accessible_states, co_accessible_states


def states_info(automate: Automate) -> dict:
    """
    Retourne un dict avec :
        accessible      : liste des états accessibles
        co_accessible   : liste des états co-accessibles
        useful          : liste des états utiles
        inaccessible    : liste des états non accessibles
        non_co_accessible: liste des états non co-accessibles
        useless         : liste des états inutiles
    """
    acc    = accessible_states(automate)
    co_acc = co_accessible_states(automate)
    useful = acc & co_acc

    all_states = set(automate.states)

    return {
        'accessible'          : sorted(acc),
        'co_accessible'       : sorted(co_acc),
        'useful'              : sorted(useful),
        'inaccessible'        : sorted(all_states - acc),
        'non_co_accessible'   : sorted(all_states - co_acc),
        'useless'             : sorted(all_states - useful),
    }
