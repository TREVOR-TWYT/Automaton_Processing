from flask import Blueprint, request, jsonify
from algorithms.models.automate import Automate
from algorithms.thompson.thompson import thompson
from algorithms.nfa.subset import subset_construction
from algorithms.minimization.moore import minimize
from algorithms.brzozowski.bmc import bmc

regex_bp = Blueprint('regex', __name__)


@regex_bp.route('/thompson', methods=['POST'])
def route_thompson():
    """
    POST /api/regex/thompson
    Body: { "regex": "(a|b)*abb", "alphabet": ["a","b"] }
    """
    data = request.get_json()
    regex = data.get('regex', '')
    alphabet = data.get('alphabet', None)
    result = thompson(regex, alphabet)
    return jsonify(result.to_dict())


@regex_bp.route('/to-automate', methods=['POST'])
def route_to_automate():
    """
    POST /api/regex/to-automate
    Chaîne complète : Regex → Thompson → Sous-ensembles → Moore
    Body: { "regex": "(a|b)*abb", "alphabet": ["a","b"] }
    """
    data = request.get_json()
    regex = data.get('regex', '')
    alphabet = data.get('alphabet', None)

    enfa  = thompson(regex, alphabet)
    dfa   = subset_construction(enfa)
    min_dfa = minimize(dfa)

    return jsonify({
        'e_nfa'  : enfa.to_dict(),
        'dfa'    : dfa.to_dict(),
        'min_dfa': min_dfa.to_dict()
    })


@regex_bp.route('/from-automate', methods=['POST'])
def route_from_automate():
    """
    POST /api/regex/from-automate
    Body: { "automate": {...} }
    """
    data = request.get_json()
    automate = Automate.from_dict(data['automate'])
    result = bmc(automate)
    return jsonify({'regex': result})
