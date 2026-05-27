"""
Tests — Algorithme 3 : Calcul de la e-fermeture (section 3.2.5 du cours).
"""
import pytest
from algorithms.nfa.epsilon_closure import epsilon_closure, epsilon_closure_set


class TestEpsilonClosure:

    def test_fermeture_sans_epsilon(self, dfa_simple):
        """Sans transitions e, la fermeture d'un etat = lui-meme."""
        result = epsilon_closure(dfa_simple, 'q0')
        assert result == frozenset({'q0'})

    def test_fermeture_etat_avec_epsilon(self, enfa_abc):
        """
        e-fermeture(0) dans a*b*c* doit inclure {0, 1, 2}
        car 0 -e-> 1 -e-> 2.
        """
        result = epsilon_closure(enfa_abc, '0')
        assert result == frozenset({'0', '1', '2'})

    def test_fermeture_etat_intermediaire(self, enfa_abc):
        """e-fermeture(1) = {1, 2} car 1 -e-> 2."""
        result = epsilon_closure(enfa_abc, '1')
        assert result == frozenset({'1', '2'})

    def test_fermeture_etat_final(self, enfa_abc):
        """e-fermeture(2) = {2} car pas de e-transition depuis 2."""
        result = epsilon_closure(enfa_abc, '2')
        assert result == frozenset({'2'})

    def test_fermeture_enfa_simple(self, enfa_simple):
        """q0 -e-> q1 : fermeture(q0) = {q0, q1}."""
        result = epsilon_closure(enfa_simple, 'q0')
        assert result == frozenset({'q0', 'q1'})

    def test_fermeture_depuis_string(self, enfa_abc):
        """L'argument peut etre un simple string."""
        result = epsilon_closure(enfa_abc, '0')
        assert isinstance(result, frozenset)


class TestEpsilonClosureSet:

    def test_fermeture_ensemble_singleton(self, enfa_abc):
        result = epsilon_closure_set(enfa_abc, {'0'})
        assert result == frozenset({'0', '1', '2'})

    def test_fermeture_ensemble_multiple(self, enfa_abc):
        """Union des fermetures individuelles."""
        result = epsilon_closure_set(enfa_abc, {'1', '2'})
        assert result == frozenset({'1', '2'})

    def test_fermeture_ensemble_vide(self, enfa_abc):
        result = epsilon_closure_set(enfa_abc, set())
        assert result == frozenset()

    def test_fermeture_sans_epsilon_transitions(self, dfa_simple):
        result = epsilon_closure_set(dfa_simple, {'q0', 'q1'})
        assert result == frozenset({'q0', 'q1'})
