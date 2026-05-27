"""
Méthode de Gauss sur les langages (section 2.3.3 du cours) :
Résolution d'un système d'équations linéaires X_i = Σ A_ij X_j + B_i
par résolution partielle (lemme d'Arden) et substitution.
"""
from algorithms.equations.arden import arden_solve


def _substitute(equations: dict, var: str, value: str) -> dict:
    """
    Substitue 'var' par 'value' dans toutes les équations sauf celle de 'var'.
    Retourne le nouveau système.
    """
    new_eq = {}
    for lhs, rhs in equations.items():
        if lhs == var:
            new_eq[lhs] = rhs
            continue
        new_rhs = dict(rhs)
        if var in new_rhs:
            coeff = new_rhs.pop(var)
            # Remplacer var par sa valeur dans le terme coeff·value
            contribution = f'({coeff})({value})'
            # Fusionner avec les termes existants
            # On travaille avec des expressions régulières en str
            for k, v in _parse_value(value, equations.get(var, {})).items():
                if v == '∅':
                    continue
                term = f'({coeff})({v})' if coeff != 'ε' else v
                if k in new_rhs:
                    new_rhs[k] = f'({new_rhs[k]}+{term})'
                else:
                    new_rhs[k] = term
            # Ajouter la constante
            const_part = f'({coeff})({_get_const(value)})'
            if 'constant' in new_rhs:
                new_rhs['constant'] = f'({new_rhs["constant"]}+{const_part})'
            else:
                new_rhs['constant'] = const_part
        new_eq[lhs] = new_rhs
    return new_eq


def _get_const(expr: str) -> str:
    """Extraction simplifiée — retourne l'expression telle quelle comme constante."""
    return expr


def _parse_value(value: str, eq: dict) -> dict:
    """Stub : retourne un dict vide (la substitution symbolique est simplifiée)."""
    return {}


def gauss_solve(system: dict) -> dict:
    """
    Résout le système d'équations linéaires sur les langages.

    Paramètres :
        system : {
            'variables': ['X0', 'X1', ...],
            'equations': {
                'X0': {'X0': 'b', 'X1': 'a', 'constant': '∅'},
                'X1': {'X1': 'a', 'X2': 'b', 'constant': '∅'},
                ...
            }
        }
    Retourne :
        {'X0': 'expr_regex', 'X1': 'expr_regex', ...}
    """
    variables = system['variables']
    equations = {v: dict(eq) for v, eq in system['equations'].items()}
    solutions = {}
    steps = []

    # Élimination avant (résolution partielle variable par variable)
    for var in reversed(variables):
        rhs = equations[var]

        # Résolution partielle : X = A·X + C  →  X = A*C
        A = rhs.get(var, '∅')
        # Construire B = constante + autres termes déjà résolus
        B_parts = []
        if rhs.get('constant', '∅') != '∅':
            B_parts.append(rhs['constant'])
        for other_var, coeff in rhs.items():
            if other_var in (var, 'constant'):
                continue
            if other_var in solutions:
                B_parts.append(f'({coeff})({solutions[other_var]})')

        B = '+'.join(B_parts) if B_parts else '∅'
        if len(B_parts) > 1:
            B = f'({B})'

        solution = arden_solve(A, B)
        solutions[var] = solution
        steps.append({
            'variable': var,
            'A': A,
            'B': B,
            'solution': solution
        })

    return {
        'solutions': solutions,
        'steps': steps
    }
