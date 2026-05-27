"""
Algorithme de Brzozowski-McCluskey (section 3.3.2 du cours) :
Construit une expression régulière à partir d'un automate fini
par élimination successive des états.
"""
from algorithms.models.automate import Automate


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


def bmc(automate: Automate) -> str:
    """
    Retourne l'expression régulière dénotant le langage reconnu par l'automate.

    Méthode : élimination des états (BMC, section 3.3.2 du cours).
        1. Ajouter un état initial unique qI et un état final unique qF.
        2. Éliminer les états intermédiaires un par un.
        3. Lire l'étiquette de la transition qI → qF.
    """
    # ── 1. Construire la matrice des étiquettes ──────────────────────────────
    states = list(automate.states)
    qI, qF = '__qI__', '__qF__'

    all_states = [qI] + states + [qF]
    # regex[i][j] = expression étiquetant l'arc i→j (None si absent)
    regex = {s: {t: None for t in all_states} for s in all_states}

    # Remplir depuis les transitions de l'automate
    for t in automate.transitions:
        frm, sym, to = t['from'], t['symbol'], t['to']
        lbl = 'ε' if sym == '' else sym
        regex[frm][to] = _union_expr(regex[frm][to], lbl)

    # Transitions depuis qI vers les états initiaux
    regex[qI][automate.initial_state] = _union_expr(
        regex[qI][automate.initial_state], 'ε'
    )

    # Transitions depuis les états finaux vers qF
    for fs in automate.final_states:
        regex[fs][qF] = _union_expr(regex[fs][qF], 'ε')

    # ── 2. Éliminer les états intermédiaires ─────────────────────────────────
    to_eliminate = states  # les états originaux

    for qi in to_eliminate:
        loop = regex[qi][qi]                    # boucle qi→qi
        loop_star = _star_expr(loop)            # (loop)*

        for qj in all_states:
            if qj == qi: continue
            eji = regex[qj][qi]                 # qj→qi
            if eji is None: continue

            for qk in all_states:
                if qk == qi: continue
                eik = regex[qi][qk]             # qi→qk
                if eik is None: continue

                # Nouveau chemin qj→qk via qi
                new_path = _concat_expr(eji, _concat_expr(loop_star, eik))
                regex[qj][qk] = _union_expr(regex[qj][qk], new_path)

        # Supprimer qi
        for s in all_states:
            regex[s][qi] = None
            regex[qi][s] = None

    # ── 3. Lire le résultat ──────────────────────────────────────────────────
    result = regex[qI][qF]
    return result if result is not None else '∅'
