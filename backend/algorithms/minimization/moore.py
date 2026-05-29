"""
Algorithme de Moore — Minimisation d'un DFA (section 3.5.3 du cours).

Procédure :
1. Partition initiale P0 = {F, Q\\F}
2. Raffiner jusqu'a stabilisation :
   Pour toute paire (q,p) dans la meme classe,
   s'il existe a tel que delta(q,a) et delta(p,a) sont dans
   des classes differentes -> separer q et p.

Note : la minimisation ne s'applique qu'aux DFA.
Si l'automate est un NFA/e-NFA, on le determinise d'abord.
"""
from algorithms.models.automate import Automate


# ── Helpers ────────────────────────────────────────────────────────────────────

def _to_str(dest) -> str | None:
    """
    Normalise une destination de transition en string atomique.
    - None           → None  (transition absente)
    - 'q1'           → 'q1'
    - ['q1']         → 'q1'  (NFA avec une seule destination)
    - ['q1', 'q2']   → None  (NFA non-deterministe : non minimisable directement)
    """
    if dest is None:
        return None
    if isinstance(dest, list):
        if len(dest) == 1:
            return dest[0]
        # Plusieurs destinations : non-deterministe, on retourne None
        return None
    return dest


def _get_transition_map(automate: Automate) -> dict:
    """
    Construit {(state, symbol): dest_str} pour acces rapide.
    Les destinations multiples (NFA) sont ignorees (traitees comme absentes).
    """
    tmap = {}
    for t in automate.transitions:
        dest = _to_str(t['to'])
        # On garde la premiere transition valide en cas de doublon de cle
        key = (t['from'], t['symbol'])
        if key not in tmap:
            tmap[key] = dest
    return tmap


def _ensure_dfa(automate: Automate) -> Automate:
    """
    Si l'automate n'est pas un DFA, le determinise d'abord.
    Evite l'erreur TypeError sur les listes.
    """
    if automate.type != 'DFA':
        from algorithms.nfa.subset import subset_construction
        return subset_construction(automate)
    return automate


# ── Algorithme de Moore ────────────────────────────────────────────────────────

def minimize(automate: Automate) -> Automate:
    """
    Retourne le DFA minimal (automate canonique) equivalent a 'automate'.

    Si l'automate est un NFA ou e-NFA, il est d'abord determinise
    (construction des sous-ensembles) avant la minimisation.
    """
    # Etape 0 : s'assurer d'avoir un DFA
    dfa = _ensure_dfa(automate)

    tmap      = _get_transition_map(dfa)
    states    = dfa.states
    finals    = set(dfa.final_states)
    non_finals = set(states) - finals

    # ── Partition initiale P0 = {F, Q\F} ──────────────────────────────────
    partition = []
    if finals:
        partition.append(frozenset(finals))
    if non_finals:
        partition.append(frozenset(non_finals))

    # Cas degenere : tous les etats sont finaux ou aucun
    if not partition:
        partition = [frozenset(states)]

    def find_class(state, part) -> int:
        """
        Retourne l'indice de la classe contenant 'state' dans 'part'.
        Retourne -1 si state est None (transition absente = etat puits implicite).
        """
        if state is None:
            return -1   # classe speciale pour les transitions manquantes
        for i, cls in enumerate(part):
            if state in cls:
                return i
        return -1

    # ── Raffinement iteratif ───────────────────────────────────────────────
    changed = True
    while changed:
        changed      = False
        new_partition = []

        for cls in partition:
            groups = {}
            for state in cls:
                # Signature : pour chaque symbole, l'indice de classe atteinte
                sig = tuple(
                    find_class(_to_str(tmap.get((state, sym))), partition)
                    for sym in dfa.alphabet
                )
                groups.setdefault(sig, set()).add(state)

            if len(groups) > 1:
                changed = True

            for group in groups.values():
                new_partition.append(frozenset(group))

        partition = new_partition

    # ── Construction de l'automate minimal ────────────────────────────────

    def class_name(cls: frozenset) -> str:
        """Nomme une classe par ses etats tries : '{q0,q1}'."""
        return '{' + ','.join(sorted(cls)) + '}'

    # Etat initial
    init_class = next(
        cls for cls in partition if dfa.initial_state in cls
    )

    new_states     = [class_name(cls) for cls in partition]
    new_initial    = class_name(init_class)
    new_finals     = [
        class_name(cls) for cls in partition
        if any(s in finals for s in cls)
    ]
    new_transitions = []

    for cls in partition:
        rep = next(iter(cls))   # representant arbitraire de la classe
        for sym in dfa.alphabet:
            dest = _to_str(tmap.get((rep, sym)))
            if dest is None:
                continue    # transition absente (automate incomplet)
            # Trouver la classe de la destination
            dest_class = next(
                (c for c in partition if dest in c), None
            )
            if dest_class is None:
                continue
            new_transitions.append({
                'from'  : class_name(cls),
                'symbol': sym,
                'to'    : class_name(dest_class),
            })

    return Automate(
        type_         = 'DFA',
        alphabet      = dfa.alphabet,
        states        = new_states,
        initial_state = new_initial,
        final_states  = new_finals,
        transitions   = new_transitions,
    )
