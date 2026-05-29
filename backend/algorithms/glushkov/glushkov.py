"""
Algorithme de Glushkov (section 4.4 du cours) :
Construit un NFA sans epsilon-transitions a partir d'une expression reguliere.

Methode :
  1. Lineariser l'expression : numeroter chaque occurrence de lettre
  2. Calculer : Null(e), First(e), Last(e), Follow(e)
  3. Construire le NFA de Glushkov :
     - Etats : {0} U positions des lettres
     - Etat initial : 0
     - Etats finaux : {0} si Null(e) + Last(e)
     - Transitions : 0 ->x pour x dans First(e)
                     i ->x pour x dans Follow(i)
"""
from algorithms.models.automate import Automate


# Noeuds de l'arbre syntaxique

class _Sym:
    def __init__(self, c, pos): self.c = c; self.pos = pos

class _Eps: pass
class _Empty: pass

class _Union:
    def __init__(self, l, r): self.l = l; self.r = r

class _Concat:
    def __init__(self, l, r): self.l = l; self.r = r

class _Star:
    def __init__(self, c): self.c = c

class _Plus:
    def __init__(self, c): self.c = c

class _Opt:
    def __init__(self, c): self.c = c


# Parser

class _Parser:
    def __init__(self, regex):
        self.regex = regex
        self.pos   = 0
        self._ctr  = 0

    def _next_pos(self):
        self._ctr += 1
        return self._ctr

    def peek(self):
        return self.regex[self.pos] if self.pos < len(self.regex) else None

    def consume(self, ch=None):
        c = self.regex[self.pos]
        if ch and c != ch:
            raise ValueError(f"Attendu '{ch}', trouve '{c}'")
        self.pos += 1
        return c

    def parse_expr(self):
        node = self.parse_term()
        while self.peek() == '|':
            self.consume('|')
            node = _Union(node, self.parse_term())
        return node

    def parse_term(self):
        node = self.parse_factor()
        while self.peek() not in (None, '|', ')'):
            node = _Concat(node, self.parse_factor())
        return node

    def parse_factor(self):
        node = self.parse_base()
        while self.peek() in ('*', '+', '?'):
            op = self.consume()
            if op == '*':   node = _Star(node)
            elif op == '+': node = _Plus(node)
            elif op == '?': node = _Opt(node)
        return node

    def parse_base(self):
        ch = self.peek()
        if ch == '(':
            self.consume('(')
            node = self.parse_expr()
            self.consume(')')
            return node
        elif ch in ('e', 'E') and self.pos + 1 < len(self.regex) and self.regex[self.pos+1] == 'p':
            # 'eps' ou 'epsilon' -> mot vide
            self.consume(); return _Eps()
        elif ch == 'e' and (self.pos + 1 >= len(self.regex) or self.regex[self.pos+1] in ('|',')',None,'*','+','?')):
            self.consume()
            return _Sym(ch, self._next_pos())
        elif ch is not None and ch not in ('|', '*', '+', '?', ')'):
            self.consume()
            return _Sym(ch, self._next_pos())
        else:
            raise ValueError(f"Caractere inattendu : '{ch}'")


# Fonctions Null / First / Last / Follow

def _null(node) -> bool:
    if isinstance(node, (_Eps, _Star, _Opt)): return True
    if isinstance(node, (_Sym, _Empty)):       return False
    if isinstance(node, _Plus):   return _null(node.c)
    if isinstance(node, _Union):  return _null(node.l) or _null(node.r)
    if isinstance(node, _Concat): return _null(node.l) and _null(node.r)
    return False


def _first(node) -> set:
    if isinstance(node, (_Eps, _Empty)): return set()
    if isinstance(node, _Sym):           return {node.pos}
    if isinstance(node, (_Star, _Plus, _Opt)): return _first(node.c)
    if isinstance(node, _Union):  return _first(node.l) | _first(node.r)
    if isinstance(node, _Concat):
        res = _first(node.l)
        if _null(node.l): res |= _first(node.r)
        return res
    return set()


def _last(node) -> set:
    if isinstance(node, (_Eps, _Empty)): return set()
    if isinstance(node, _Sym):           return {node.pos}
    if isinstance(node, (_Star, _Plus, _Opt)): return _last(node.c)
    if isinstance(node, _Union):  return _last(node.l) | _last(node.r)
    if isinstance(node, _Concat):
        res = _last(node.r)
        if _null(node.r): res |= _last(node.l)
        return res
    return set()


def _follow(node, fmap: dict):
    if isinstance(node, _Concat):
        for p in _last(node.l):
            fmap.setdefault(p, set()).update(_first(node.r))
        _follow(node.l, fmap)
        _follow(node.r, fmap)
    elif isinstance(node, (_Star, _Plus)):
        for p in _last(node.c):
            fmap.setdefault(p, set()).update(_first(node.c))
        _follow(node.c, fmap)
    elif isinstance(node, _Union):
        _follow(node.l, fmap)
        _follow(node.r, fmap)
    elif isinstance(node, _Opt):
        _follow(node.c, fmap)


def _collect(node, sym_map: dict):
    if isinstance(node, _Sym): sym_map[node.pos] = node.c
    elif isinstance(node, (_Union, _Concat)):
        _collect(node.l, sym_map); _collect(node.r, sym_map)
    elif isinstance(node, (_Star, _Plus, _Opt)):
        _collect(node.c, sym_map)


# Point d'entree

def glushkov(regex: str, alphabet: list = None) -> Automate:
    """
    Construit le NFA de Glushkov pour l'expression reguliere 'regex'.

    Proprietes du NFA produit :
      - n+1 etats pour une expression a n symboles (positions 0..n)
      - Aucune epsilon-transition
      - At most n^2 transitions

    Retourne un Automate de type 'NFA'.
    """
    parser = _Parser(regex)
    tree   = parser.parse_expr()

    sym_map    = {}
    _collect(tree, sym_map)

    first_set  = _first(tree)
    last_set   = _last(tree)
    follow_map = {}
    _follow(tree, follow_map)

    positions = sorted(sym_map.keys())
    states    = ['0'] + [str(p) for p in positions]
    initial   = '0'

    final_states = []
    if _null(tree):
        final_states.append('0')
    for p in last_set:
        final_states.append(str(p))

    # Transitions depuis 0 (First)
    t0_map = {}
    for p in first_set:
        t0_map.setdefault(sym_map[p], []).append(str(p))
    transitions = [
        {'from': '0', 'symbol': s, 'to': sorted(set(dests))}
        for s, dests in t0_map.items()
    ]

    # Transitions depuis les positions (Follow)
    f_trans = {}
    for p, followers in follow_map.items():
        for q in followers:
            key = (str(p), sym_map[q])
            f_trans.setdefault(key, set()).add(str(q))
    for (frm, sym), dests in f_trans.items():
        transitions.append({'from': frm, 'symbol': sym, 'to': sorted(dests)})

    if alphabet is None:
        alphabet = sorted(set(sym_map.values()))

    return Automate(
        type_         = 'NFA',
        alphabet      = alphabet,
        states        = states,
        initial_state = initial,
        final_states  = final_states,
        transitions   = transitions,
    )
