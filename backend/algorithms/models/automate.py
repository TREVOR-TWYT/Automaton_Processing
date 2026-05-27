class Automate:
    """
    Modèle générique pour DFA, NFA et ε-NFA.
    
    Attributs:
        type         : 'DFA' | 'NFA' | 'e-NFA'
        alphabet     : liste de symboles ex. ['a','b']
        states       : liste d'états   ex. ['q0','q1','q2']
        initial_state: état initial    ex. 'q0'
        final_states : liste d'états finaux ex. ['q2']
        transitions  : liste de dicts  ex. [{'from':'q0','symbol':'a','to':'q1'}]
                       Pour ε-NFA, symbol peut valoir '' (epsilon)
                       Pour NFA,   'to' peut être une liste d'états
    """

    def __init__(self, type_, alphabet, states, initial_state, final_states, transitions):
        self.type          = type_
        self.alphabet      = alphabet
        self.states        = states
        self.initial_state = initial_state
        self.final_states  = final_states
        self.transitions   = transitions

    @staticmethod
    def from_dict(data: dict) -> 'Automate':
        return Automate(
            type_         = data.get('type', 'DFA'),
            alphabet      = data['alphabet'],
            states        = data['states'],
            initial_state = data['initial_state'],
            final_states  = data['final_states'],
            transitions   = data['transitions']
        )

    def to_dict(self) -> dict:
        return {
            'type'         : self.type,
            'alphabet'     : self.alphabet,
            'states'       : self.states,
            'initial_state': self.initial_state,
            'final_states' : self.final_states,
            'transitions'  : self.transitions
        }

    def get_transition(self, state: str, symbol: str):
        """
        Pour un DFA : retourne l'état destination (str) ou None.
        Pour un NFA : retourne la liste des états destination.
        """
        results = []
        for t in self.transitions:
            if t['from'] == state and t['symbol'] == symbol:
                dest = t['to']
                if isinstance(dest, list):
                    results.extend(dest)
                else:
                    results.append(dest)
        if self.type == 'DFA':
            return results[0] if results else None
        return results
