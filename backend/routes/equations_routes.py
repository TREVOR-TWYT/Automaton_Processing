from flask import Blueprint, request, jsonify
from algorithms.models.automate import Automate
from algorithms.equations.arden import arden_solve, build_system_from_automate
from algorithms.equations.gauss import gauss_solve

equations_bp = Blueprint('equations', __name__)


@equations_bp.route('/arden', methods=['POST'])
def route_arden():
    """
    POST /api/equations/arden
    Body: { "A": "a", "B": "b" }
    Résout X = AX + B → X = A*B
    """
    data = request.get_json()
    A = data.get('A', '∅')
    B = data.get('B', '∅')
    result = arden_solve(A, B)
    return jsonify({
        'equation': f'X = ({A})X + ({B})',
        'solution': f'X = {result}'
    })


@equations_bp.route('/gauss', methods=['POST'])
def route_gauss():
    """
    POST /api/equations/gauss
    Body: {
        "variables": ["X0","X1","X2"],
        "equations": {
            "X0": {"X0":"b","X1":"a","constant":"∅"},
            ...
        }
    }
    """
    data = request.get_json()
    result = gauss_solve(data)
    return jsonify(result)


@equations_bp.route('/from-automate', methods=['POST'])
def route_system_from_automate():
    """
    POST /api/equations/from-automate
    Construit et résout le système d'équations associé à un automate.
    Body: { "automate": {...} }
    """
    data = request.get_json()
    automate = Automate.from_dict(data['automate'])
    system = build_system_from_automate(automate)
    result = gauss_solve(system)
    return jsonify({
        'system': system,
        'solutions': result['solutions'],
        'steps': result['steps']
    })
