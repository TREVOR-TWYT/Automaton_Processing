"""
Reconnaissance d'un mot par un automate (section 3.2.1 du cours).

- DFA   : Algorithme 1 du cours — O(|u|)
- NFA   : exploration par sous-ensembles d'états courants
- e-NFA : idem + ε-fermeture à chaque étape
"""
from algorithms.models.automate import Automate


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_destinations(automate: Automate, state: str, symbol: str) -> list:
    """Retourne la liste (éventuellement vide) des états atteignables
    depuis 'state' en lisant 'symbol'. Fonctionne pour DFA, NFA et ε-NFA."""
    results = []
    for t in automate.transitions:
        if t['from'] == state and t['symbol'] == symbol:
            dest = t['to']
            if isinstance(dest, list):
                results.extend(dest)
            else:
                results.append(dest)
    return results


def _epsilon_closure(automate: Automate, states: set) -> set:
    """ε-fermeture d'un ensemble d'états (Algo 3, section 3.2.5)."""
    closure = set(states)
    stack   = list(states)
    while stack:
        s = stack.pop()
        for t in automate.transitions:
            if t['from'] == s and t['symbol'] == '':
                dest = t['to']
                targets = dest if isinstance(dest, list) else [dest]
                for tgt in targets:
                    if tgt not in closure:
                        closure.add(tgt)
                        stack.append(tgt)
    return closure


# ── DFA ────────────────────────────────────────────────────────────────────────

def _recognize_dfa(automate: Automate, word: str) -> dict:
    """Algorithme 1 du cours — reconnaissance linéaire pour DFA."""
    q     = automate.initial_state
    steps = []

    for symbol in word:
        dests  = _get_destinations(automate, q, symbol)
        next_q = dests[0] if dests else None
        steps.append({
            'current_state': q,
            'symbol'       : symbol,
            'next_state'   : next_q,
        })
        if next_q is None:
            return {
                'accepted'   : False,
                'steps'      : steps,
                'final_state': None,
                'message'    : f"Pas de transition depuis '{q}' sur '{symbol}'",
                'all_paths'  : None,
            }
        q = next_q

    accepted = q in automate.final_states
    return {
        'accepted'   : accepted,
        'steps'      : steps,
        'final_state': q,
        'message'    : 'Mot accepté' if accepted else 'Mot rejeté',
        'all_paths'  : None,
    }


# ── NFA / ε-NFA ───────────────────────────────────────────────────────────────

def _recognize_nfa(automate: Automate, word: str) -> dict:
    """
    Reconnaissance pour NFA et ε-NFA par suivi simultané
    de tous les états courants possibles (construction des sous-ensembles
    « à la volée »).

    Retourne :
        steps      : une étape par symbole lu, avec l'ensemble des états
                     courants avant et après la lecture
        all_paths  : chemin acceptant trouvé (liste d'états), ou None
        accepted   : True si au moins un état final est atteint
    """
    is_enfa = automate.type == 'e-NFA'

    # État initial + ε-fermeture si nécessaire
    init = {automate.initial_state}
    current = _epsilon_closure(automate, init) if is_enfa else init

    steps = []

    for symbol in word:
        # Calculer l'ensemble des états suivants
        next_states = set()
        for s in current:
            next_states.update(_get_destinations(automate, s, symbol))

        # Appliquer ε-fermeture sur les états atteints
        if is_enfa and next_states:
            next_states = _epsilon_closure(automate, next_states)

        steps.append({
            'current_state': sorted(current),   # ensemble avant lecture
            'symbol'       : symbol,
            'next_state'   : sorted(next_states) if next_states else None,
        })

        current = next_states

        if not current:
            # Aucun état courant : rejet immédiat
            return {
                'accepted'   : False,
                'steps'      : steps,
                'final_state': None,
                'message'    : f"Aucun état atteignable après lecture de '{symbol}'",
                'all_paths'  : None,
            }

    # Acceptation : au moins un état courant est final
    finals_reached = [s for s in current if s in automate.final_states]
    accepted       = len(finals_reached) > 0

    # Trouver un chemin acceptant par DFS pour l'affichage
    accepting_path = _find_accepting_path(automate, word, is_enfa) if accepted else None

    return {
        'accepted'   : accepted,
        'steps'      : steps,
        'final_state': finals_reached[0] if finals_reached else sorted(current)[0],
        'message'    : 'Mot accepté' if accepted else 'Mot rejeté',
        'all_paths'  : accepting_path,
    }


def _find_accepting_path(automate: Automate, word: str, is_enfa: bool) -> list:
    """
    DFS pour trouver UN chemin acceptant dans un NFA/ε-NFA.
    Retourne la liste des états du chemin [q0, q1, ..., qn] ou None.
    """
    # (état_courant, index_dans_word, chemin_parcouru)
    stack = [(automate.initial_state, 0, [automate.initial_state])]

    while stack:
        state, idx, path = stack.pop()

        # ε-transitions (sans consommer de symbole)
        if is_enfa:
            for t in automate.transitions:
                if t['from'] == state and t['symbol'] == '':
                    dests = t['to'] if isinstance(t['to'], list) else [t['to']]
                    for d in dests:
                        if d not in path:   # éviter les cycles infinis
                            stack.append((d, idx, path + [d]))

        # Fin du mot
        if idx == len(word):
            if state in automate.final_states:
                return path
            continue

        # Transitions sur le symbole courant
        sym   = word[idx]
        dests = _get_destinations(automate, state, sym)
        for d in dests:
            stack.append((d, idx + 1, path + [d]))

    return None


# ── Point d'entrée unifié ──────────────────────────────────────────────────────

def recognize(automate: Automate, word: str) -> dict:
    """
    Reconnaissance d'un mot par un automate.
    Dispatche vers l'algorithme adapté selon le type de l'automate.
    """
    if automate.type == 'DFA':
        return _recognize_dfa(automate, word)
    else:
        return _recognize_nfa(automate, word)
