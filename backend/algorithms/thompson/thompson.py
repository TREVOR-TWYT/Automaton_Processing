"""
Algorithme de Thompson (section 3.3.2 du cours) :
Construit un ε-AFND à partir d'une expression régulière.

Grammaire supportée :
    expr   ::= term ('|' term)*
    term   ::= factor factor*
    factor ::= base ('*' | '+' | '?')*
    base   ::= SYMBOL | '(' expr ')'

Symbole ε représenté par '' (chaîne vide) dans les transitions.
"""
from algorithms.models.automate import Automate

_counter = 0

def _new_state() -> str:
    global _counter
    _counter += 1
    return f'q{_counter}'

def _reset():
    global _counter
    _counter = 0


# ── Structures internes ────────────────────────────────────────────────────────

class NFA:
    """ε-AFND intermédiaire : un état initial et un état final."""
    def __init__(self, start, end, states, transitions):
        self.start       = start
        self.end         = end
        self.states      = states        # list[str]
        self.transitions = transitions   # list[dict]


# ── Constructions de base ──────────────────────────────────────────────────────

def _symbol(sym: str) -> NFA:
    """Automate pour un symbole unique (figure 3.15 du cours)."""
    s, e = _new_state(), _new_state()
    return NFA(s, e, [s, e], [{'from': s, 'symbol': sym, 'to': e}])


def _epsilon() -> NFA:
    """Automate pour ε (figure 3.14 du cours)."""
    s, e = _new_state(), _new_state()
    return NFA(s, e, [s, e], [{'from': s, 'symbol': '', 'to': e}])


def _union(a: NFA, b: NFA) -> NFA:
    """Union a|b (figure 3.16 du cours)."""
    s, e = _new_state(), _new_state()
    transitions = (
        a.transitions + b.transitions + [
            {'from': s, 'symbol': '', 'to': a.start},
            {'from': s, 'symbol': '', 'to': b.start},
            {'from': a.end, 'symbol': '', 'to': e},
            {'from': b.end, 'symbol': '', 'to': e},
        ]
    )
    return NFA(s, e, [s, e] + a.states + b.states, transitions)


def _concat(a: NFA, b: NFA) -> NFA:
    """Concaténation ab (figure 3.17 du cours)."""
    transitions = (
        a.transitions + b.transitions +
        [{'from': a.end, 'symbol': '', 'to': b.start}]
    )
    return NFA(a.start, b.end, a.states + b.states, transitions)


def _star(a: NFA) -> NFA:
    """Étoile a* (figure 3.18 du cours)."""
    s, e = _new_state(), _new_state()
    transitions = (
        a.transitions + [
            {'from': s, 'symbol': '', 'to': a.start},
            {'from': s, 'symbol': '', 'to': e},
            {'from': a.end, 'symbol': '', 'to': a.start},
            {'from': a.end, 'symbol': '', 'to': e},
        ]
    )
    return NFA(s, e, [s, e] + a.states, transitions)


def _plus(a: NFA) -> NFA:
    """a+ = aa*"""
    return _concat(a, _star(a))


def _optional(a: NFA) -> NFA:
    """a? = a|ε"""
    return _union(a, _epsilon())


# ── Parser ─────────────────────────────────────────────────────────────────────

class Parser:
    def __init__(self, regex: str):
        self.regex = regex
        self.pos   = 0

    def peek(self):
        return self.regex[self.pos] if self.pos < len(self.regex) else None

    def consume(self, ch=None):
        c = self.regex[self.pos]
        if ch and c != ch:
            raise ValueError(f"Attendu '{ch}', trouvé '{c}'")
        self.pos += 1
        return c

    def parse_expr(self) -> NFA:
        node = self.parse_term()
        while self.peek() == '|':
            self.consume('|')
            node = _union(node, self.parse_term())
        return node

    def parse_term(self) -> NFA:
        node = self.parse_factor()
        while self.peek() not in (None, '|', ')'):
            node = _concat(node, self.parse_factor())
        return node

    def parse_factor(self) -> NFA:
        node = self.parse_base()
        while self.peek() in ('*', '+', '?'):
            op = self.consume()
            if op == '*':
                node = _star(node)
            elif op == '+':
                node = _plus(node)
            elif op == '?':
                node = _optional(node)
        return node

    def parse_base(self) -> NFA:
        ch = self.peek()
        if ch == '(':
            self.consume('(')
            node = self.parse_expr()
            self.consume(')')
            return node
        elif ch == 'ε' or ch == '\\e':
            self.consume()
            return _epsilon()
        elif ch is not None and ch not in ('|', '*', '+', '?', ')'):
            self.consume()
            return _symbol(ch)
        else:
            raise ValueError(f"Caractère inattendu : '{ch}'")


# ── Point d'entrée ─────────────────────────────────────────────────────────────

def thompson(regex: str, alphabet: list = None) -> Automate:
    """
    Construit l'ε-AFND correspondant à l'expression régulière 'regex'.

    Paramètres :
        regex    : expression régulière (ex. "(a|b)*abb")
        alphabet : optionnel, déduit automatiquement si absent
    Retourne :
        Automate de type 'e-NFA'
    """
    _reset()
    parser = Parser(regex)
    nfa = parser.parse_expr()

    if alphabet is None:
        alphabet = sorted(set(
            t['symbol'] for t in nfa.transitions if t['symbol'] != ''
        ))

    return Automate(
        type_         = 'e-NFA',
        alphabet      = alphabet,
        states        = nfa.states,
        initial_state = nfa.start,
        final_states  = [nfa.end],
        transitions   = nfa.transitions
    )
