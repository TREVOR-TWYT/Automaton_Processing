"""
Tests — Emondage d'un automate (section 3.2.3 du cours).
Suppression des etats inutiles (non accessibles / non co-accessibles).
"""
import pytest
from algorithms.dfa.trimming import trim, accessible_states, co_accessible_states
from algorithms.dfa.recognition import recognize


class TestAccessibleStates:

    def test_tous_accessibles_dfa_simple(self, dfa_simple):
        acc = accessible_states(dfa_simple)
        assert acc == {'q0', 'q1', 'q2'}

    def test_q3_inaccessible(self, dfa_with_useless):
        acc = accessible_states(dfa_with_useless)
        assert 'q3' not in acc

    def test_etat_initial_toujours_accessible(self, dfa_with_useless):
        acc = accessible_states(dfa_with_useless)
        assert dfa_with_useless.initial_state in acc


class TestCoAccessibleStates:

    def test_tous_co_accessibles_dfa_simple(self, dfa_simple):
        co = co_accessible_states(dfa_simple)
        assert 'q2' in co   # état final
        assert 'q1' in co   # mène à q2

    def test_q4_non_co_accessible(self, dfa_with_useless):
        co = co_accessible_states(dfa_with_useless)
        assert 'q4' not in co

    def test_etats_finaux_toujours_co_accessibles(self, dfa_simple):
        co = co_accessible_states(dfa_simple)
        for f in dfa_simple.final_states:
            assert f in co


class TestTrim:

    def test_etats_inutiles_supprimes(self, dfa_with_useless):
        result = trim(dfa_with_useless)
        assert 'q3' not in result.states
        assert 'q4' not in result.states

    def test_etats_utiles_conserves(self, dfa_with_useless):
        result = trim(dfa_with_useless)
        assert 'q0' in result.states
        assert 'q1' in result.states
        assert 'q2' in result.states

    def test_langage_preserve_apres_emondage(self, dfa_with_useless):
        result = trim(dfa_with_useless)
        for word, expected in [('ab', True), ('a', False), ('b', False), ('', False)]:
            r = recognize(result, word)
            assert r['accepted'] == expected, f"Echec pour '{word}'"

    def test_dfa_propre_inchange(self, dfa_simple):
        """Un DFA sans etats inutiles ne doit pas etre modifie."""
        result = trim(dfa_simple)
        assert set(result.states) == set(dfa_simple.states)

    def test_initial_state_conserve(self, dfa_with_useless):
        result = trim(dfa_with_useless)
        assert result.initial_state == dfa_with_useless.initial_state

    def test_final_states_conserves(self, dfa_with_useless):
        result = trim(dfa_with_useless)
        for f in dfa_with_useless.final_states:
            assert f in result.final_states
