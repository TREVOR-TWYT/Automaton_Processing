"""
Fixtures partagées entre tous les tests.
Chaque fixture correspond à un automate utilisé dans le cours INF3421.
"""
import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from algorithms.models.automate import Automate


# ── DFA ───────────────────────────────────────────────────────────────────────

@pytest.fixture
def dfa_simple():
    """DFA reconnaissant les mots contenant 'ab' comme préfixe."""
    return Automate(
        type_='DFA',
        alphabet=['a', 'b'],
        states=['q0', 'q1', 'q2'],
        initial_state='q0',
        final_states=['q2'],
        transitions=[
            {'from': 'q0', 'symbol': 'a', 'to': 'q1'},
            {'from': 'q1', 'symbol': 'b', 'to': 'q2'},
            {'from': 'q2', 'symbol': 'a', 'to': 'q2'},
            {'from': 'q2', 'symbol': 'b', 'to': 'q2'},
        ]
    )


@pytest.fixture
def dfa_mod3():
    """
    DFA reconnaissant les mots sur {a,b} tels que |w|_a ≡ 0 (mod 3).
    Figure 3.3 du cours.
    """
    return Automate(
        type_='DFA',
        alphabet=['a', 'b'],
        states=['q0', 'q1', 'q2'],
        initial_state='q0',
        final_states=['q0'],
        transitions=[
            {'from': 'q0', 'symbol': 'a', 'to': 'q1'},
            {'from': 'q0', 'symbol': 'b', 'to': 'q0'},
            {'from': 'q1', 'symbol': 'a', 'to': 'q2'},
            {'from': 'q1', 'symbol': 'b', 'to': 'q1'},
            {'from': 'q2', 'symbol': 'a', 'to': 'q0'},
            {'from': 'q2', 'symbol': 'b', 'to': 'q2'},
        ]
    )


@pytest.fixture
def dfa_partial():
    """
    DFA partiellement specifie : reconnait ab(a+b)*.
    Manque les transitions depuis q0 sur b et depuis q1 sur a.
    """
    return Automate(
        type_='DFA',
        alphabet=['a', 'b'],
        states=['q0', 'q1', 'q2'],
        initial_state='q0',
        final_states=['q2'],
        transitions=[
            {'from': 'q0', 'symbol': 'a', 'to': 'q1'},
            {'from': 'q1', 'symbol': 'b', 'to': 'q2'},
            {'from': 'q2', 'symbol': 'a', 'to': 'q2'},
            {'from': 'q2', 'symbol': 'b', 'to': 'q2'},
        ]
    )


@pytest.fixture
def dfa_with_useless():
    """
    DFA avec etats inutiles.
    q3 inaccessible, q4 non co-accessible.
    """
    return Automate(
        type_='DFA',
        alphabet=['a', 'b'],
        states=['q0', 'q1', 'q2', 'q3', 'q4'],
        initial_state='q0',
        final_states=['q2'],
        transitions=[
            {'from': 'q0', 'symbol': 'a', 'to': 'q1'},
            {'from': 'q1', 'symbol': 'b', 'to': 'q2'},
            {'from': 'q3', 'symbol': 'a', 'to': 'q2'},
            {'from': 'q0', 'symbol': 'b', 'to': 'q4'},
            {'from': 'q4', 'symbol': 'a', 'to': 'q4'},
            {'from': 'q4', 'symbol': 'b', 'to': 'q4'},
        ]
    )


@pytest.fixture
def dfa_to_minimize():
    """
    DFA a minimiser — figure 3.21 du cours.
    Reconnait (a+b)a*ba*b(a+b)*. Seul q5 est final.
    """
    return Automate(
        type_='DFA',
        alphabet=['a', 'b'],
        states=['q0', 'q1', 'q2', 'q3', 'q4', 'q5'],
        initial_state='q0',
        final_states=['q5'],
        transitions=[
            {'from': 'q0', 'symbol': 'a', 'to': 'q1'},
            {'from': 'q0', 'symbol': 'b', 'to': 'q3'},
            {'from': 'q1', 'symbol': 'a', 'to': 'q1'},
            {'from': 'q1', 'symbol': 'b', 'to': 'q2'},
            {'from': 'q2', 'symbol': 'a', 'to': 'q1'},
            {'from': 'q2', 'symbol': 'b', 'to': 'q5'},
            {'from': 'q3', 'symbol': 'a', 'to': 'q3'},
            {'from': 'q3', 'symbol': 'b', 'to': 'q4'},
            {'from': 'q4', 'symbol': 'a', 'to': 'q3'},
            {'from': 'q4', 'symbol': 'b', 'to': 'q5'},
            {'from': 'q5', 'symbol': 'a', 'to': 'q5'},
            {'from': 'q5', 'symbol': 'b', 'to': 'q5'},
        ]
    )


# ── NFA ───────────────────────────────────────────────────────────────────────

@pytest.fixture
def nfa_ends_ab():
    """NFA reconnaissant les mots se terminant par 'ab'."""
    return Automate(
        type_='NFA',
        alphabet=['a', 'b'],
        states=['q0', 'q1', 'q2'],
        initial_state='q0',
        final_states=['q2'],
        transitions=[
            {'from': 'q0', 'symbol': 'a', 'to': ['q0', 'q1']},
            {'from': 'q0', 'symbol': 'b', 'to': ['q0']},
            {'from': 'q1', 'symbol': 'b', 'to': ['q2']},
        ]
    )


@pytest.fixture
def nfa_figure38():
    """NFA de la figure 3.8 du cours (4 etats)."""
    return Automate(
        type_='NFA',
        alphabet=['a', 'b'],
        states=['1', '2', '3', '4'],
        initial_state='1',
        final_states=['4'],
        transitions=[
            {'from': '1', 'symbol': 'a', 'to': ['2', '3']},
            {'from': '2', 'symbol': 'b', 'to': ['4']},
            {'from': '3', 'symbol': 'a', 'to': ['3']},
            {'from': '3', 'symbol': 'b', 'to': ['4']},
            {'from': '4', 'symbol': 'a', 'to': ['4']},
        ]
    )


# ── e-NFA ─────────────────────────────────────────────────────────────────────

@pytest.fixture
def enfa_abc():
    """
    e-AFND reconnaissant a*b*c* — figure 3.11 du cours.
    0 -a-> 0, 0 -e-> 1, 1 -b-> 1, 1 -e-> 2, 2 -c-> 2
    """
    return Automate(
        type_='e-NFA',
        alphabet=['a', 'b', 'c'],
        states=['0', '1', '2'],
        initial_state='0',
        final_states=['2'],
        transitions=[
            {'from': '0', 'symbol': 'a', 'to': '0'},
            {'from': '0', 'symbol': '',  'to': '1'},
            {'from': '1', 'symbol': 'b', 'to': '1'},
            {'from': '1', 'symbol': '',  'to': '2'},
            {'from': '2', 'symbol': 'c', 'to': '2'},
        ]
    )


@pytest.fixture
def enfa_simple():
    """e-NFA simple : q0 -e-> q1 -a-> q2(final)"""
    return Automate(
        type_='e-NFA',
        alphabet=['a', 'b'],
        states=['q0', 'q1', 'q2'],
        initial_state='q0',
        final_states=['q2'],
        transitions=[
            {'from': 'q0', 'symbol': '',  'to': 'q1'},
            {'from': 'q1', 'symbol': 'a', 'to': 'q2'},
            {'from': 'q2', 'symbol': 'b', 'to': 'q2'},
        ]
    )
