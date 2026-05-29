from flask import Blueprint, request, jsonify
from algorithms.models.automate import Automate
from algorithms.dfa.recognition   import recognize
from algorithms.dfa.completion    import complete
from algorithms.dfa.trimming      import trim
from algorithms.dfa.states_info   import states_info
from algorithms.nfa.subset        import subset_construction
from algorithms.nfa.remove_epsilon import remove_epsilon
from algorithms.nfa.conversions   import dfa_to_nfa, nfa_to_enfa, dfa_to_enfa
from algorithms.nfa.closure_ops   import union, intersection, complement, concatenation, kleene_star
from algorithms.minimization.moore    import minimize
from algorithms.minimization.canonical import canonicalize

automate_bp = Blueprint('automate', __name__)


def get_automate() -> Automate:
    data = request.get_json()
    return Automate.from_dict(data['automate'])


# ── Reconnaissance ─────────────────────────────────────────────────────────────

@automate_bp.route('/recognize', methods=['POST'])
def route_recognize():
    """POST /api/automate/recognize  { automate, word }"""
    data     = request.get_json()
    automate = Automate.from_dict(data['automate'])
    word     = data.get('word', '')
    return jsonify(recognize(automate, word))


# ── Transformations unitaires ──────────────────────────────────────────────────

@automate_bp.route('/complete', methods=['POST'])
def route_complete():
    return jsonify(complete(get_automate()).to_dict())


@automate_bp.route('/trim', methods=['POST'])
def route_trim():
    return jsonify(trim(get_automate()).to_dict())


@automate_bp.route('/determinize', methods=['POST'])
def route_determinize():
    return jsonify(subset_construction(get_automate()).to_dict())


@automate_bp.route('/remove-epsilon', methods=['POST'])
def route_remove_epsilon():
    return jsonify(remove_epsilon(get_automate()).to_dict())


@automate_bp.route('/minimize', methods=['POST'])
def route_minimize():
    return jsonify(minimize(get_automate()).to_dict())


@automate_bp.route('/canonicalize', methods=['POST'])
def route_canonicalize():
    """POST /api/automate/canonicalize — automate canonique"""
    return jsonify(canonicalize(get_automate()).to_dict())


# ── Identification des états ───────────────────────────────────────────────────

@automate_bp.route('/states-info', methods=['POST'])
def route_states_info():
    """
    POST /api/automate/states-info
    Retourne les listes d'etats accessibles, co-accessibles, utiles.
    """
    return jsonify(states_info(get_automate()))


# ── Conversions entre types ────────────────────────────────────────────────────

@automate_bp.route('/to-nfa', methods=['POST'])
def route_to_nfa():
    """POST /api/automate/to-nfa — AFD/e-AFN → AFN"""
    return jsonify(dfa_to_nfa(get_automate()).to_dict())


@automate_bp.route('/to-enfa', methods=['POST'])
def route_to_enfa():
    """POST /api/automate/to-enfa — AFD/AFN → e-AFN"""
    a = get_automate()
    if a.type == 'DFA':
        return jsonify(dfa_to_enfa(a).to_dict())
    return jsonify(nfa_to_enfa(a).to_dict())


# ── Opérations de clôture ─────────────────────────────────────────────────────

@automate_bp.route('/union', methods=['POST'])
def route_union():
    """
    POST /api/automate/union  { automate1: {...}, automate2: {...} }
    """
    data = request.get_json()
    a1   = Automate.from_dict(data['automate1'])
    a2   = Automate.from_dict(data['automate2'])
    return jsonify(union(a1, a2).to_dict())


@automate_bp.route('/intersection', methods=['POST'])
def route_intersection():
    """POST /api/automate/intersection  { automate1, automate2 }"""
    data = request.get_json()
    a1   = Automate.from_dict(data['automate1'])
    a2   = Automate.from_dict(data['automate2'])
    return jsonify(intersection(a1, a2).to_dict())


@automate_bp.route('/complement', methods=['POST'])
def route_complement():
    """POST /api/automate/complement  { automate }"""
    return jsonify(complement(get_automate()).to_dict())


@automate_bp.route('/concatenation', methods=['POST'])
def route_concatenation():
    """POST /api/automate/concatenation  { automate1, automate2 }"""
    data = request.get_json()
    a1   = Automate.from_dict(data['automate1'])
    a2   = Automate.from_dict(data['automate2'])
    return jsonify(concatenation(a1, a2).to_dict())


@automate_bp.route('/kleene-star', methods=['POST'])
def route_kleene_star():
    """POST /api/automate/kleene-star  { automate }"""
    return jsonify(kleene_star(get_automate()).to_dict())
