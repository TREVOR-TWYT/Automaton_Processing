"""
Tests — Algorithme 1 : Reconnaissance d'un mot par un DFA (section 3.2.1).
"""
import pytest
from algorithms.dfa.recognition import recognize


class TestRecognitionAccepted:
    """Mots qui doivent être acceptés."""

    def test_mot_ab_accepte(self, dfa_simple):
        r = recognize(dfa_simple, 'ab')
        assert r['accepted'] is True

    def test_mot_abb_accepte(self, dfa_simple):
        r = recognize(dfa_simple, 'abb')
        assert r['accepted'] is True

    def test_mot_abab_accepte(self, dfa_simple):
        r = recognize(dfa_simple, 'abab')
        assert r['accepted'] is True

    def test_epsilon_accepte_si_initial_final(self, dfa_mod3):
        """Le mot vide est accepté si l'état initial est final."""
        r = recognize(dfa_mod3, '')
        assert r['accepted'] is True

    def test_mod3_zero_a(self, dfa_mod3):
        r = recognize(dfa_mod3, 'bbb')
        assert r['accepted'] is True

    def test_mod3_trois_a(self, dfa_mod3):
        r = recognize(dfa_mod3, 'aaa')
        assert r['accepted'] is True

    def test_mod3_six_a(self, dfa_mod3):
        r = recognize(dfa_mod3, 'aaabaaab')
        assert r['accepted'] is True


class TestRecognitionRejected:
    """Mots qui doivent être rejetés."""

    def test_mot_a_rejete(self, dfa_simple):
        r = recognize(dfa_simple, 'a')
        assert r['accepted'] is False

    def test_mot_b_rejete(self, dfa_simple):
        r = recognize(dfa_simple, 'b')
        assert r['accepted'] is False

    def test_mot_vide_rejete(self, dfa_simple):
        r = recognize(dfa_simple, '')
        assert r['accepted'] is False

    def test_mod3_un_a(self, dfa_mod3):
        r = recognize(dfa_mod3, 'a')
        assert r['accepted'] is False

    def test_mod3_deux_a(self, dfa_mod3):
        r = recognize(dfa_mod3, 'aa')
        assert r['accepted'] is False

    def test_transition_manquante(self, dfa_partial):
        """Transition absente : le mot doit être rejeté."""
        r = recognize(dfa_partial, 'b')
        assert r['accepted'] is False
        assert r['final_state'] is None


class TestRecognitionSteps:
    """Vérification des étapes de calcul retournées."""

    def test_nombre_etapes_correct(self, dfa_simple):
        r = recognize(dfa_simple, 'ab')
        assert len(r['steps']) == 2

    def test_etapes_contenu(self, dfa_simple):
        r = recognize(dfa_simple, 'ab')
        assert r['steps'][0]['current_state'] == 'q0'
        assert r['steps'][0]['symbol'] == 'a'
        assert r['steps'][0]['next_state'] == 'q1'
        assert r['steps'][1]['current_state'] == 'q1'
        assert r['steps'][1]['symbol'] == 'b'
        assert r['steps'][1]['next_state'] == 'q2'

    def test_etat_final_retourne(self, dfa_simple):
        r = recognize(dfa_simple, 'ab')
        assert r['final_state'] == 'q2'

    def test_etapes_vides_pour_mot_vide(self, dfa_mod3):
        r = recognize(dfa_mod3, '')
        assert r['steps'] == []
