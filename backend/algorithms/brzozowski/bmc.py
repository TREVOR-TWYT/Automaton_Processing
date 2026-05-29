"""
Algorithme de Brzozowski-McCluskey (section 3.3.2 du cours) :
Construit une expression reguliere a partir d'un automate fini
par elimination successive des etats.

Fonctionne avec DFA, NFA et e-NFA :
- NFA  : les destinations multiples sont eclatees en aretes separees
- e-NFA: les e-transitions sont traitees comme des aretes etiquetees 'e'
"""
from algorithms.models.automate import Automate


# ── Helpers sur les expressions ───────────────────────────────────────────────

def _union_expr(e1, e2):
    if e1 is None: return e2
    if e2 is None: return e1
    if e1 == e2:   return e1
    return f'({e1}+{e2})'


def _concat_expr(e1, e2):
    if e1 is None or e2 is None: return None
    if e1 == 'ε': return e2
    if e2 == 'ε': return e1
    return f'{e1}{e2}'


def _star_expr(e):
    if e is None or e == 'ε': return 'ε'
    return f'({e})*'


# ── Normalisation des destinations ────────────────────────────────────────────

def _destinations(to) -> list:
    """
    Normalise t['to'] en liste de strings atomiques.
      'q1'         -> ['q1']
      ['q1', 'q2'] -> ['q1', 'q2']
      None         -> []
    """
    if to is None:
        return []
    if isinstance(to, list):
        return [d for d in to if d is not None]
    return [to]


# ── Algorithme BMC ────────────────────────────────────────────────────────────

def bmc(automate: Automate) -> str:
    """
    Retourne l'expression reguliere denotant le langage reconnu par l'automate.

    Methode : elimination des etats (BMC, section 3.3.2 du cours).
        1. Ajouter un etat initial unique qI et un etat final unique qF.
        2. Eliminer les etats intermediaires un par un.
        3. Lire l'etiquette de la transition qI -> qF.

    Supporte DFA, NFA et e-NFA.
    Pour les NFA, les transitions a destinations multiples sont
    eclatees en autant d'aretes que de destinations.
    """
    # ── 1. Construire la matrice des etiquettes ───────────────────────────────
    states = list(automate.states)
    qI, qF = '__qI__', '__qF__'

    all_states = [qI] + states + [qF]

    # regex[i][j] = expression etiquetant l'arc i->j (None si absent)
    regex = {s: {t: None for t in all_states} for s in all_states}

    # Remplir depuis les transitions de l'automate
    # t['to'] peut etre une string (DFA) ou une liste (NFA/e-NFA)
    for t in automate.transitions:
        frm = t['from']
        sym = t['symbol']
        lbl = 'ε' if sym == '' else sym

        # Eclater les destinations multiples en aretes separees
        for dest in _destinations(t['to']):
            if dest not in regex[frm]:
                # Destination hors des etats declares (ne devrait pas arriver)
                continue
            regex[frm][dest] = _union_expr(regex[frm][dest], lbl)

    # Transition depuis qI vers l'etat initial
    regex[qI][automate.initial_state] = _union_expr(
        regex[qI][automate.initial_state], 'ε'
    )

    # Transitions depuis les etats finaux vers qF
    for fs in automate.final_states:
        regex[fs][qF] = _union_expr(regex[fs][qF], 'ε')

    # ── 2. Eliminer les etats intermediaires ──────────────────────────────────
    to_eliminate = states   # les etats originaux (pas qI ni qF)

    for qi in to_eliminate:
        loop      = regex[qi][qi]       # boucle qi->qi
        loop_star = _star_expr(loop)    # (loop)*

        for qj in all_states:
            if qj == qi: continue
            eji = regex[qj][qi]         # qj->qi
            if eji is None: continue

            for qk in all_states:
                if qk == qi: continue
                eik = regex[qi][qk]     # qi->qk
                if eik is None: continue

                # Nouveau chemin qj->qk via qi : eji · loop* · eik
                new_path = _concat_expr(eji, _concat_expr(loop_star, eik))
                regex[qj][qk] = _union_expr(regex[qj][qk], new_path)

        # Supprimer qi de la matrice
        for s in all_states:
            regex[s][qi] = None
            regex[qi][s] = None

    # ── 3. Lire le resultat ───────────────────────────────────────────────────
    result = regex[qI][qF]
    return result if result is not None else '∅'
