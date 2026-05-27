"""
Lemme d'Arden (section 2.3.1 du cours) :
Résolution de l'équation X = AX + B  →  X = A*B

Utilisé ici pour extraire le langage reconnu
à partir d'un système d'équations linéaires associé à un automate.
"""


def arden_solve(A: str, B: str) -> str:
    """
    Résout X = AX + B par le lemme d'Arden.
    Retourne la solution X = A*B sous forme d'expression régulière (str).

    Paramètres :
        A : expression régulière (coefficient de X)
        B : expression régulière (terme constant)
    """
    if A is None or A == '∅':
        return B
    if B is None or B == '∅':
        return f'({A})*'
    if A == 'ε':
        # X = εX + B → X = B (cas dégénéré)
        return B
    a_star = f'({A})*'
    return f'{a_star}{B}'


def build_system_from_automate(automate) -> dict:
    """
    Construit le système d'équations linéaires associé à un automate.

    Pour chaque état q :
        L_q = Σ_{r∈Q} Z_{q,r} · L_r  +  F_q
    où Z_{q,r} = union des symboles de q vers r,
    et  F_q    = {ε} si q ∈ F, sinon ∅.

    Retourne un dict :
        {
          'variables': ['L_q0', 'L_q1', ...],
          'equations': {
              'L_q0': {'L_q0': 'a', 'L_q1': 'b', 'constant': 'ε'},
              ...
          }
        }
    """
    states = automate.states
    finals = set(automate.final_states)
    equations = {}

    for state in states:
        var = f'L_{state}'
        eq = {'constant': 'ε' if state in finals else '∅'}

        for other in states:
            # Collecter les symboles de state → other
            syms = [
                (t['symbol'] if t['symbol'] != '' else 'ε')
                for t in automate.transitions
                if t['from'] == state and t['to'] == other
            ]
            if syms:
                label = '+'.join(sorted(set(syms)))
                if len(syms) > 1:
                    label = f'({label})'
                eq[f'L_{other}'] = label

        equations[var] = eq

    return {
        'variables': [f'L_{s}' for s in states],
        'equations': equations
    }
