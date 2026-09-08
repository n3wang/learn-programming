/** Intermediate-lesson Python solutions used as typing corpus. */
export const PYTHON_SOLUTIONS = [
  {
    "title": "A promo is just a function",
    "code": "def fidelity_promo(points, total):\n    return total // 20 if points >= 1000 else 0\n\ndef due(total, points, promo):\n    return total - promo(points, total)\n\nprint(due(100, 0, fidelity_promo))\nprint(due(100, 1000, fidelity_promo))"
  },
  {
    "title": "Try the code out!",
    "code": "import collections\n\nCard = collections.namedtuple(\"Card\", [\"rank\", \"suit\"])\n\nclass FrenchDeck:\n    ranks = [str(n) for n in range(2, 11)] + list(\"JQKA\")\n    suits = \"spades diamonds clubs hearts\".split()\n\n    def __init__(self):\n        self._cards = [Card(rank, suit) for suit in self.suits for rank in self.ranks]\n\n    def __len__(self):\n        return len(self._cards)\n\n    def __getitem__(self, position):\n        return self._cards[position]\n\ndeck = FrenchDeck()\nprint(len(deck))\nprint(deck[0])\nprint(deck[-1])"
  },
  {
    "title": "repr, str, unpack, abs",
    "code": "import math\n\nclass Vec:\n    def __init__(self, x, y):\n        self.x = float(x)\n        self.y = float(y)\n\n    def __iter__(self):\n        yield self.x\n        yield self.y\n\n    def __repr__(self):\n        return f\"{type(self).__name__}({self.x!r}, {self.y!r})\"\n\n    def __str__(self):\n        return str(tuple(self))\n\n    def __abs__(self):\n        return math.hypot(self.x, self.y)\n\n    def __bool__(self):\n        return bool(abs(self))\n\nv = Vec(3, 4)\nprint(repr(v))\nprint(v)\na, b = v\nprint(a, b, abs(v), bool(v), bool(Vec(0, 0)))"
  },
  {
    "title": "cls vs no special arg",
    "code": "class Demo:\n    @classmethod\n    def klassmeth(*args):\n        return args[0].__name__, len(args)\n\n    @staticmethod\n    def statmeth(*args):\n        return args\n\nprint(Demo.klassmeth())\nprint(Demo.statmeth(\"x\"))\nprint(Demo.klassmeth(1))"
  },
  {
    "title": "property and hash",
    "code": "class Pt:\n    def __init__(self, x, y):\n        self._x = x\n        self._y = y\n\n    @property\n    def x(self):\n        return self._x\n\n    @property\n    def y(self):\n        return self._y\n\n    def __eq__(self, other):\n        return (self.x, self.y) == (other.x, other.y)\n\n    def __hash__(self):\n        return hash((self.x, self.y))\n\ns = {Pt(1, 2), Pt(1, 2)}\nprint(len(s), Pt(1, 2).x)\ntry:\n    Pt(1, 2).x = 9\nexcept AttributeError:\n    print(\"read-only\")"
  },
  {
    "title": "format codes and datetime",
    "code": "from datetime import datetime\n\nprint(format(42, 'b'))\nprint(format(2 / 3, '.1%'))\nnow = datetime(2020, 1, 1, 18, 49, 5)\nprint(format(now, '%H:%M:%S'))\nprint(\"It's now {:%I:%M %p}\".format(now))"
  },
  {
    "title": "slots inheritance",
    "code": "class Pixel:\n    __slots__ = ('x', 'y')\n\nclass OpenPixel(Pixel):\n    pass\n\nclass ColorPixel(Pixel):\n    __slots__ = ('color',)\n\np = Pixel()\nprint('Pixel dict', hasattr(p, '__dict__'))\nop = OpenPixel()\nop.x = 8\nop.color = 'green'\nprint('OpenPixel dict', op.__dict__)\ncp = ColorPixel()\nprint('ColorPixel dict', hasattr(cp, '__dict__'))"
  },
  {
    "title": "reprlib on a long array",
    "code": "from array import array\nimport reprlib\n\nxs = array('d', range(10))\nraw = reprlib.repr(xs)\nprint(raw)\nprint(raw[raw.find('['):-1])"
  },
  {
    "title": "Container vs compact numbers",
    "code": "from array import array\n\nnums = (1.5, 2.5, 3.5)\npacked = array(\"d\", nums)\nprint(type(nums), nums)\nprint(type(packed), packed)\nprint(\"tuple holds objects; array holds a C buffer of doubles\")"
  },
  {
    "title": "Listcomp vs loop",
    "code": "text = \"Hi!\"\ncodes_loop = []\nfor ch in text:\n    codes_loop.append(ord(ch))\n\ncodes_comp = [ord(ch) for ch in text]\nprint(codes_loop)\nprint(codes_comp)"
  },
  {
    "title": "Genexp into tuple and sum",
    "code": "letters = \"xyz\"\nprint(tuple(ord(ch) for ch in letters))\nprint(sum(len(w) for w in [\"a\", \"bb\", \"ccc\"]))"
  },
  {
    "title": "Unpacking and a nested list",
    "code": "row = (\"Ada\", 1815, [\"math\", \"code\"])\nname, year, tags = row\ntags.append(\"notes\")\nprint(name, year, row)\n# The tuple row still has 3 slots; the list in slot 2 grew."
  },
  {
    "title": "match on a command",
    "code": "def run(parts):\n    match parts:\n        case [\"add\", a, b]:\n            return int(a) + int(b)\n        case [\"neg\", a]:\n            return -int(a)\n        case _:\n            return \"unknown\"\n\nprint(run(\"add 2 5\".split()))\nprint(run(\"neg 4\".split()))\nprint(run(\"oops\".split()))"
  },
  {
    "title": "Slice assignment",
    "code": "letters = list(\"abcde\")\nprint(letters[1:4])\nletters[1:4] = [\"X\", \"Y\"]\nprint(letters)\ndel letters[::2]\nprint(letters)"
  },
  {
    "title": "Hashable vs not",
    "code": "print(hash((1, 2, (3, 4))))\ntry:\n    hash((1, 2, [3, 4]))\nexcept TypeError as e:\n    print(type(e).__name__)\nd = {\"ok\": 1}\nprint(d[\"ok\"])"
  },
  {
    "title": "Invert and filter",
    "code": "rows = [(10, \"oak\"), (3, \"elm\"), (20, \"pine\")]\nby_name = {name: n for n, name in rows}\nsmall = {n: name.upper() for name, n in by_name.items() if n < 15}\nprint(by_name)\nprint(small)"
  },
  {
    "title": "** and |",
    "code": "left = {\"a\": 1, \"b\": 3}\nright = {\"a\": 2, \"c\": 6}\nprint(left | right)\nprint({**left, **right})\nmerged = dict(left)\nmerged |= right\nprint(merged)"
  },
  {
    "title": "match a record",
    "code": "def who(rec):\n    match rec:\n        case {\"kind\": \"book\", \"who\": name}:\n            return name\n        case {\"kind\": \"film\", \"who\": name}:\n            return name\n        case _:\n            return \"?\"\n\nprint(who({\"kind\": \"book\", \"who\": \"Ada\", \"title\": \"Notes\"}))\nprint(who({\"kind\": \"film\", \"who\": \"Nolan\"}))\nprint(who({\"kind\": \"book\"}))"
  },
  {
    "title": "setdefault vs defaultdict",
    "code": "from collections import defaultdict\n\nplain = {}\nplain.setdefault(\"a\", []).append(1)\nplain.setdefault(\"a\", []).append(2)\n\nauto = defaultdict(list)\nauto[\"b\"].append(3)\nprint(plain, dict(auto))\nprint(\"z\" in auto, auto.get(\"z\"))"
  },
  {
    "title": "Counter, ChainMap, views",
    "code": "from collections import Counter, ChainMap\n\nprint(Counter(\"abba\").most_common(2))\nfront, back = {\"a\": 1}, {\"a\": 9, \"b\": 2}\nprint(ChainMap(front, back)[\"a\"], ChainMap(front, back)[\"b\"])\nd = {\"x\": 1, \"y\": 2, \"z\": 3}\nprint(d.keys() & {\"y\", \"z\", \"q\"})"
  },
  {
    "title": "Set ops and setcomp",
    "code": "needles = {\"ada\", \"lin\"}\nhay = {\"ada\", \"grace\", \"lin\", \"barbara\"}\nprint(len(needles & hay))\nprint({w[0] for w in hay})\nprint(list(dict.fromkeys([\"a\", \"b\", \"a\", \"c\"])))"
  },
  {
    "title": "str length vs UTF-8 length",
    "code": "s = \"caf\\u00e9\"\nb = s.encode(\"utf-8\")\nprint(len(s), s)\nprint(len(b), b)\nprint(b.decode(\"utf-8\"))"
  },
  {
    "title": "Index vs slice",
    "code": "cafe = bytes(\"caf\\u00e9\", encoding=\"utf-8\")\nprint(cafe[0], type(cafe[0]))\nprint(cafe[:1], type(cafe[:1]))\nprint(bytes.fromhex(\"48 69\"))"
  },
  {
    "title": "replace on decode",
    "code": "raw = b\"Hi\\xff!\"\nprint(raw.decode(\"utf-8\", errors=\"replace\"))\nprint(\"A\".isascii(), \"\\u00e9\".isascii())"
  },
  {
    "title": "NFC makes café equal",
    "code": "from unicodedata import normalize\n\na = \"caf\\u00e9\"\nb = \"cafe\\u0301\"\nprint(len(a), len(b), a == b)\nprint(normalize(\"NFC\", a) == normalize(\"NFC\", b))\nprint(\"\\u00df\".casefold())"
  },
  {
    "title": "name and combining",
    "code": "import unicodedata as ud\n\nprint(ud.name(\"A\"))\nprint(ud.combining(\"\\u0301\") != 0)\nprint(ud.numeric(\"\\u00bd\"))"
  },
  {
    "title": "namedtuple vs homemade",
    "code": "from collections import namedtuple\n\nclass Homemade:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\nPt = namedtuple(\"Pt\", \"x y\")\na, b = Homemade(1, 2), Homemade(1, 2)\np, q = Pt(1, 2), Pt(1, 2)\nprint(a == b, p == q)\nprint(p)"
  },
  {
    "title": "hints are documentation",
    "code": "from typing import NamedTuple\n\nclass Pair(NamedTuple):\n    a: int\n    b: int = 0\n\nprint(Pair(\"nope\", None))\nprint(Pair(1))"
  },
  {
    "title": "default_factory",
    "code": "from dataclasses import dataclass, field\n\n@dataclass\nclass Bag:\n    name: str\n    items: list = field(default_factory=list)\n\na, b = Bag(\"a\"), Bag(\"b\")\na.items.append(\"x\")\nprint(a.items, b.items)"
  },
  {
    "title": "class pattern",
    "code": "from typing import NamedTuple\n\nclass City(NamedTuple):\n    continent: str\n    name: str\n\ndef label(city):\n    match city:\n        case City(continent=\"Asia\"):\n            return \"asia\"\n        case City():\n            return \"other\"\n\nprint(label(City(\"Asia\", \"Tokyo\")))\nprint(label(City(\"Europe\", \"Paris\")))"
  },
  {
    "title": "Same name, three spellings",
    "code": "from dataclasses import dataclass, fields\nfrom typing import ClassVar\n\n@dataclass\nclass Spam:\n    n: int\n    label = \"plain\"  # class attribute (no hint)\n    kind: ClassVar[str] = \"can\"  # class attribute (hinted)\n\ns = Spam(1)\nprint(s.n, s.label, s.kind)\nprint(\"fields:\", [f.name for f in fields(Spam)])\nprint(Spam.__doc__)"
  },
  {
    "title": "One list, two labels",
    "code": "a = [1, 2, 3]\nb = a\na.append(4)\nprint(b)"
  },
  {
    "title": "Aliases vs. lookalikes",
    "code": "charles = {'name': 'Charles L. Dodgson', 'born': 1832}\nlewis = charles\nalex = {'name': 'Charles L. Dodgson', 'born': 1832}\n\nprint(lewis is charles)\nprint(alex is charles)\nprint(alex == charles)"
  },
  {
    "title": "A tuple whose value changes",
    "code": "t1 = (1, 2, [30, 40])\nt2 = (1, 2, [30, 40])\nprint(t1 == t2)\n\ninner_id_before = id(t1[-1])\nt1[-1].append(99)\ninner_id_after = id(t1[-1])\n\nprint(t1)\nprint(inner_id_before == inner_id_after)\nprint(t1 == t2)"
  },
  {
    "title": "A shallow copy shares its inner list",
    "code": "l1 = [3, [66, 55, 44], (7, 8, 9)]\nl2 = list(l1)\n\nl1.append(100)\nl1[1].remove(55)\n\nprint(l1)\nprint(l2)"
  },
  {
    "title": "+= reacts differently depending on the type",
    "code": "def f(a, b):\n    a += b\n    return a\n\nx, y = 1, 2\nprint(f(x, y), x, y)\n\nlst_a, lst_b = [1, 2], [3, 4]\nprint(f(lst_a, lst_b), lst_a, lst_b)"
  },
  {
    "title": "The haunted bus",
    "code": "class HauntedBus:\n    def __init__(self, passengers=[]):\n        self.passengers = passengers\n\n    def pick(self, name):\n        self.passengers.append(name)\n\nbus2 = HauntedBus()\nbus2.pick('Carrie')\n\nbus3 = HauntedBus()\nprint(bus3.passengers)\nprint(bus2.passengers is bus3.passengers)"
  },
  {
    "title": "Passengers vanish from the caller's list",
    "code": "class TwilightBus:\n    def __init__(self, passengers=None):\n        self.passengers = [] if passengers is None else passengers\n\n    def drop(self, name):\n        self.passengers.remove(name)\n\nteam = ['Sue', 'Tina', 'Maya']\nbus = TwilightBus(team)\nbus.drop('Tina')\nprint(team)"
  },
  {
    "title": "Watching an object actually go away",
    "code": "import weakref\n\ns1 = {1, 2, 3}\ns2 = s1\n\ndef bye():\n    print('...like tears in the rain.')\n\nender = weakref.finalize(s1, bye)\nprint(ender.alive)\n\ndel s1\nprint(ender.alive)\n\ns2 = 'spam'\nprint(ender.alive)"
  },
  {
    "title": "Sometimes \"new\" isn't new",
    "code": "t1 = (1, 2, 3)\nt2 = tuple(t1)\nt3 = t1[:]\nprint(t2 is t1, t3 is t1)\n\na = (1, 2, 3)\nb = (1, 2, 3)\nprint(a is b)"
  },
  {
    "title": "A function is an instance of the function class",
    "code": "def factorial(n):\n    \"\"\"returns n!\"\"\"\n    return 1 if n < 2 else n * factorial(n - 1)\n\nprint(factorial(5))\nprint(factorial.__doc__)\nprint(type(factorial))\n\nfact = factorial\nprint(fact(5))\nprint(list(map(factorial, range(6))))"
  },
  {
    "title": "Sorting by length, then by reversed spelling",
    "code": "fruits = ['strawberry', 'fig', 'apple', 'cherry', 'raspberry', 'banana']\nprint(sorted(fruits, key=len))\n\ndef reverse(word):\n    return word[::-1]\n\nprint(sorted(fruits, key=reverse))"
  },
  {
    "title": "map/filter/reduce next to their comprehension equivalents",
    "code": "def factorial(n):\n    return 1 if n < 2 else n * factorial(n - 1)\n\nprint(list(map(factorial, range(6))))\nprint([factorial(n) for n in range(6)])\n\nprint(list(map(factorial, filter(lambda n: n % 2, range(6)))))\nprint([factorial(n) for n in range(6) if n % 2])\n\nfrom functools import reduce\nfrom operator import add\nprint(reduce(add, range(100)))\nprint(sum(range(100)))"
  },
  {
    "title": "The same sort, without naming reverse",
    "code": "fruits = ['strawberry', 'fig', 'apple', 'cherry', 'raspberry', 'banana']\nprint(sorted(fruits, key=lambda word: word[::-1]))"
  },
  {
    "title": "callable() sees through all of them",
    "code": "print(callable(abs), callable(str), callable('Ni!'))\n\ndef gen():\n    yield 1\n\nprint(callable(gen))\nprint(type(gen()))"
  },
  {
    "title": "BingoCage: state plus __call__",
    "code": "import random\n\nclass BingoCage:\n    def __init__(self, items):\n        self._items = list(items)\n        random.shuffle(self._items)\n\n    def pick(self):\n        try:\n            return self._items.pop()\n        except IndexError:\n            raise LookupError('pick from empty BingoCage')\n\n    def __call__(self):\n        return self.pick()\n\nbingo = BingoCage(range(3))\nfirst_len = len(bingo._items)\nvalue = bingo()\nprint(first_len, len(bingo._items), callable(bingo))\nprint(value in {0, 1, 2})"
  },
  {
    "title": "Keyword-only b, and a small HTML tag builder",
    "code": "def f(a, *, b):\n    return a, b\n\nprint(f(1, b=2))\n\ndef tag(name, *content, class_=None, **attrs):\n    if class_ is not None:\n        attrs['class'] = class_\n    attr_pairs = (f' {k}=\"{v}\"' for k, v in sorted(attrs.items()))\n    attr_str = ''.join(attr_pairs)\n    if content:\n        elements = (f'<{name}{attr_str}>{c}</{name}>' for c in content)\n        return '\\n'.join(elements)\n    return f'<{name}{attr_str} />'\n\nprint(tag('br'))\nprint(tag('p', 'hello', 'world'))\nprint(tag('p', 'hello', class_='sidebar'))"
  },
  {
    "title": "itemgetter and methodcaller",
    "code": "from operator import itemgetter, methodcaller\n\nmetro = [('Tokyo', 'JP', 36), ('Delhi', 'IN', 21), ('Mexico City', 'MX', 20)]\nfor city in sorted(metro, key=itemgetter(1)):\n    print(city)\n\nupcase = methodcaller('upper')\nprint(upcase('hello'))"
  },
  {
    "title": "Freezing the first argument of mul",
    "code": "from operator import mul\nfrom functools import partial\n\ntriple = partial(mul, 3)\nprint(triple(7))\nprint(list(map(triple, range(1, 6))))"
  },
  {
    "title": "A \"wrong\" argument still runs",
    "code": "def show_count(count: int, word: str) -> str:\n    if count == 1:\n        return f'1 {word}'\n    count_str = str(count) if count else 'no'\n    return f'{count_str} {word}s'\n\nprint(show_count(2, 'bird'))\nprint(show_count(1, 'bird'))\nprint(show_count(0, 'bird'))\n\n# count: int says int — Python never checks that at runtime:\nprint(show_count('surprise', 'bird'))"
  },
  {
    "title": "What a type checker would flag, still runs",
    "code": "class Bird:\n    pass\n\nclass Duck(Bird):\n    def quack(self):\n        print('Quack!')\n\ndef alert(birdie):\n    birdie.quack()\n\ndef alert_duck(birdie: Duck) -> None:\n    birdie.quack()\n\ndef alert_bird(birdie: Bird) -> None:\n    birdie.quack()\n\ndaffy = Duck()\nalert(daffy)\nalert_duck(daffy)\nalert_bird(daffy)\n\nwoody = Bird()\ntry:\n    alert_bird(woody)\nexcept AttributeError as e:\n    print('Runtime error:', e)"
  },
  {
    "title": "int flows through a float parameter",
    "code": "def half(x: float) -> float:\n    return x / 2\n\nprint(half(4))\nprint(half(5.0))"
  },
  {
    "title": "Optional default, and a Union return type",
    "code": "from typing import Optional, Union\n\ndef show_count(count: int, singular: str, plural: Optional[str] = None) -> str:\n    if count == 1:\n        return f'1 {singular}'\n    count_str = str(count) if count else 'no'\n    if not plural:\n        plural = singular + 's'\n    return f'{count_str} {plural}'\n\nprint(show_count(2, 'child', 'children'))\nprint(show_count(2, 'bird'))\n\ndef parse_token(token: str) -> Union[str, float]:\n    try:\n        return float(token)\n    except ValueError:\n        return token\n\nprint(parse_token('3.14'), type(parse_token('3.14')))\nprint(parse_token('hello'), type(parse_token('hello')))"
  },
  {
    "title": "A tokenizer and a first-letter index",
    "code": "def tokenize(text: str) -> list[str]:\n    return text.upper().split()\n\nprint(tokenize('hello brave new world'))\n\ndef first_letter_index(words: list[str]) -> dict[str, set[str]]:\n    index: dict[str, set[str]] = {}\n    for w in words:\n        index.setdefault(w[0], set()).add(w)\n    return index\n\nidx = first_letter_index(['cat', 'car', 'dog', 'deer'])\nprint(sorted(idx['c']))\nprint(sorted(idx['d']))"
  },
  {
    "title": "A record, a NamedTuple record, and a variadic tuple",
    "code": "from typing import NamedTuple\n\ndef display(lat_lon: tuple[float, float]) -> str:\n    lat, lon = lat_lon\n    ns = 'N' if lat >= 0 else 'S'\n    ew = 'E' if lon >= 0 else 'W'\n    return f'{abs(lat):0.1f} {ns}, {abs(lon):0.1f} {ew}'\n\nprint(display((35.68, 139.69)))\n\nclass Coordinate(NamedTuple):\n    lat: float\n    lon: float\n\ntokyo = Coordinate(35.68, 139.69)\nprint(display(tokyo))\n\ndef total(nums: tuple[int, ...]) -> int:\n    return sum(nums)\n\nprint(total((1, 2, 3, 4)))"
  },
  {
    "title": "first() returns whatever type it was given",
    "code": "from collections.abc import Sequence\nfrom typing import TypeVar\n\nT = TypeVar('T')\n\ndef first(seq: Sequence[T]) -> T:\n    return seq[0]\n\nprint(first([3, 1, 2]))\nprint(first('hello'))\nprint(first(('a', 'b', 'c')))"
  },
  {
    "title": "isinstance() against a Protocol, structurally",
    "code": "from typing import Protocol, runtime_checkable\n\n@runtime_checkable\nclass SupportsQuack(Protocol):\n    def quack(self) -> None: ...\n\nclass Duck:\n    def quack(self):\n        print('Quack!')\n\nclass Robot:\n    def quack(self):\n        print('Beep quack!')\n\nclass Cat:\n    def meow(self):\n        print('Meow!')\n\nfor obj in (Duck(), Robot(), Cat()):\n    print(type(obj).__name__, isinstance(obj, SupportsQuack))"
  },
  {
    "title": "Callable parameter, NoReturn helper, typed variadics",
    "code": "from typing import Callable, NoReturn\n\ndef apply_op(a: int, b: int, op: Callable[[int, int], int]) -> int:\n    return op(a, b)\n\nprint(apply_op(3, 4, lambda x, y: x + y))\nprint(apply_op(3, 4, lambda x, y: x * y))\n\ndef fail(message: str) -> NoReturn:\n    raise RuntimeError(message)\n\ntry:\n    fail('boom')\nexcept RuntimeError as e:\n    print('caught:', e)\n\ndef tag(name: str, /, *content: str, class_: str | None = None, **attrs: str) -> str:\n    if class_ is not None:\n        attrs['class'] = class_\n    attr_str = ''.join(f' {k}=\"{v}\"' for k, v in sorted(attrs.items()))\n    if content:\n        return '\\n'.join(f'<{name}{attr_str}>{c}</{name}>' for c in content)\n    return f'<{name}{attr_str} />'\n\nprint(tag('br'))\nprint(tag('p', 'hi', class_='note'))"
  },
  {
    "title": "Replacement at decoration time",
    "code": "def deco(func):\n    def inner():\n        print(\"running inner\")\n    return inner\n\n@deco\ndef target():\n    print(\"running target\")\n\ntarget()\nprint(target.__name__)"
  },
  {
    "title": "Assignment makes it local",
    "code": "b = 6\n\ndef f2(a):\n    print(a)\n    try:\n        print(b)\n    except UnboundLocalError as e:\n        print(type(e).__name__)\n    b = 9\n\nf2(3)"
  },
  {
    "title": "Running average via closure",
    "code": "def make_averager():\n    series = []\n    def averager(new_value):\n        series.append(new_value)\n        return sum(series) / len(series)\n    return averager\n\navg = make_averager()\nprint(avg(10), avg(11), avg(12))\nprint(avg.__code__.co_freevars)"
  },
  {
    "title": "wraps keeps the name",
    "code": "import functools\n\ndef twice(func):\n    @functools.wraps(func)\n    def wrapper(x):\n        return func(func(x))\n    return wrapper\n\n@twice\ndef inc(n):\n    return n + 1\n\nprint(inc(3), inc.__name__)"
  }
];

/** Non-blank lines from every solution, mixed together. */
export function pythonLinePool() {
  const lines = [];
  for (const snippet of PYTHON_SOLUTIONS) {
    for (const line of String(snippet.code || '').split('\n')) {
      if (line.trim()) lines.push(line);
    }
  }
  return lines;
}

function shuffle(items) {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
  }
  return next;
}

/** A fresh draw for one typing round. Lines are not grouped by lesson. */
export function drawCodeLines(count) {
  const pool = pythonLinePool();
  if (!pool.length) return [];
  const want = Math.max(1, count || 1);
  const drawn = [];
  while (drawn.length < want) {
    const batch = shuffle(pool);
    const need = want - drawn.length;
    drawn.push(...batch.slice(0, need));
  }
  return drawn;
}
