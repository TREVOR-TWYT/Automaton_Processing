from flask import Blueprint, request, jsonify
from algorithms.models.automate import Automate
from algorithms.dfa.recognition import recognize
from algorithms.dfa.completion import complete
from algorithms.dfa.trimming import trim
from algorithms.nfa.subset import subset_construction
from algorithms.nfa.remove_epsilon import remove_epsilon
from algorithms.minimization.moore import minimize

automate_bp = Blueprint('automate', __name__)


def get_automate() -> Automate:
    data = request.get_json()
    return Automate.from_dict(data['automate'])


@automate_bp.route('/recognize', methods=['POST'])
def route_recognize():
    """
    POST /api/automate/recognize
    Body: { "automate": {...}, "word": "aabb" }
    """
    data = request.get_json()
    automate = Automate.from_dict(data['automate'])
    word = data.get('word', '')
    result = recognize(automate, word)
    return jsonify(result)


@automate_bp.route('/complete', methods=['POST'])
def route_complete():
    """POST /api/automate/complete"""
    automate = get_automate()
    result = complete(automate)
    return jsonify(result.to_dict())


@automate_bp.route('/trim', methods=['POST'])
def route_trim():
    """POST /api/automate/trim"""
    automate = get_automate()
    result = trim(automate)
    return jsonify(result.to_dict())


@automate_bp.route('/determinize', methods=['POST'])
def route_determinize():
    """POST /api/automate/determinize"""
    automate = get_automate()
    result = subset_construction(automate)
    return jsonify(result.to_dict())


@automate_bp.route('/remove-epsilon', methods=['POST'])
def route_remove_epsilon():
    """POST /api/automate/remove-epsilon"""
    automate = get_automate()
    result = remove_epsilon(automate)
    return jsonify(result.to_dict())


@automate_bp.route('/minimize', methods=['POST'])
def route_minimize():
    """POST /api/automate/minimize"""
    automate = get_automate()
    result = minimize(automate)
    return jsonify(result.to_dict())
