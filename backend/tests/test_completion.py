"""
Tests — Complétion d'un DFA (section 3.2.2 du cours).
Ajout d'un état puits pour les transitions manquantes.
"""
import pytest
from algorithms.dfa.completion import complete
from algorithms.dfa.recognition import recognize


class TestCompletion:

    def test_etat_puits_ajoute(self, dfa_partial):
        """Un état puits doit apparaître si des transitions manquent."""
        result = complete(dfa_partial)
        assert 'qp' in result.states

    def test_toutes_transitions_presentes(self, dfa_partial):
        """Après complétion, chaque état doit avoir une transition pour chaque symbole."""
        result = complete(dfa_partial)
        for state in result.states:
            for sym in result.alphabet:
                dest = result.get_transition(state, sym)
                assert dest is not None, (
                    f"Transition manquante : ({state}, {sym})"
                )

    def test_etat_puits_absorbe(self, dfa_partial):
        """L'état puits doit boucler sur lui-même pour tout symbole."""
        result = complete(dfa_partial)
        for sym in result.alphabet:
            assert result.get_transition('qp', sym) == 'qp'

    def test_etat_puits_non_final(self, dfa_partial):
        """L'état puits ne doit pas être un état final."""
        result = complete(dfa_partial)
        assert 'qp' not in result.final_states

    def test_langage_preserve(self, dfa_partial):
        """Le langage reconnu ne doit pas changer après complétion."""
        result = complete(dfa_partial)
        # Mots acceptés avant et après
        for word in ['ab', 'aba', 'abb', 'abba']:
            r_orig   = recognize(dfa_partial, word)
            r_compl  = recognize(result, word)
            assert r_orig['accepted'] == r_compl['accepted'], (
                f"Divergence pour '{word}'"
            )

    def test_dfa_complet_inchange(self, dfa_mod3):
        """Un DFA déjà complet ne doit pas recevoir d'état puits."""
        result = complete(dfa_mod3)
        assert 'qp' not in result.states
        assert len(result.states) == len(dfa_mod3.states)

    def test_type_reste_dfa(self, dfa_partial):
        result = complete(dfa_partial)
        assert result.type == 'DFA'
