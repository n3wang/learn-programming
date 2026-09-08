export const JAVA_KEYWORD_DOCS = {
  import: {en: 'Bring a package or class into this file so its name can be used.', zh: '把一个包或类引入本文件，这样就能使用它的名字。'},
  package: {en: 'Declare which package this class belongs to.', zh: '声明这个类属于哪个包。'},
  class: {en: 'Define a new type. The body inside the braces is the class.', zh: '定义一个新类型。花括号里的代码就是类体。'},
  interface: {en: 'A type that lists methods a class must implement.', zh: '一种类型，列出实现类必须提供的方法。'},
  enum: {en: 'A fixed set of named constants.', zh: '一组固定的命名常量。'},
  public: {en: 'Visible to every other class.', zh: '对所有其他类可见。'},
  private: {en: 'Visible only inside this class.', zh: '只在这个类内部可见。'},
  protected: {en: 'Visible in this class, its package, and subclasses.', zh: '在本类、同包和子类中可见。'},
  static: {en: 'Belongs to the class, not to one instance. `main` is static so it can run without `new`.', zh: '属于类，而不是某个实例。`main` 是 static，所以不用 `new` 也能运行。'},
  final: {en: 'Cannot be reassigned, overridden, or subclassed, depending on where it is used.', zh: '不能再赋值、不能重写，或不能再被继承，取决于用在哪里。'},
  void: {en: 'The method returns no value.', zh: '这个方法不返回值。'},
  int: {en: 'A 32-bit integer type.', zh: '32 位整数类型。'},
  long: {en: 'A 64-bit integer type.', zh: '64 位整数类型。'},
  double: {en: 'A double-precision floating-point type.', zh: '双精度浮点类型。'},
  boolean: {en: 'A true or false value.', zh: '真或假。'},
  char: {en: 'A single character.', zh: '一个字符。'},
  String: {en: 'Text. Immutable; methods like `length()` return a new result or a view.', zh: '文本。不可变；`length()` 等方法返回结果或视图。'},
  new: {en: 'Create an object and run its constructor.', zh: '创建一个对象并运行它的构造方法。'},
  return: {en: 'Leave the method and hand a value back to the caller.', zh: '离开方法，并把一个值交还给调用者。'},
  if: {en: 'Run the following block only when the condition is true.', zh: '只有条件为真时才运行后面的代码块。'},
  else: {en: 'Block that runs when the matching if was false.', zh: '配对的 if 为假时运行这个块。'},
  for: {en: 'Repeat a block. Often walks an index or each item of a collection.', zh: '重复一个代码块。常用来走下标或集合中的每一项。'},
  while: {en: 'Repeat the block as long as the condition stays true.', zh: '只要条件保持为真就重复这个代码块。'},
  do: {en: 'A loop that runs the body once, then repeats while the condition is true.', zh: '先执行一次循环体，然后在条件为真时继续重复。'},
  switch: {en: 'Choose a branch by matching a value against case labels.', zh: '用值与各个 case 匹配，选择一个分支。'},
  case: {en: 'One label inside switch. The first matching case runs.', zh: 'switch 中的一个标签。第一个匹配的 case 会执行。'},
  break: {en: 'Leave the nearest loop or switch immediately.', zh: '立刻离开最近的循环或 switch。'},
  continue: {en: 'Skip the rest of this loop iteration and start the next one.', zh: '跳过这一轮循环剩下的代码，开始下一轮。'},
  try: {en: 'Run code that might throw, and pair it with catch or finally.', zh: '运行可能抛出异常的代码，并与 catch 或 finally 配对。'},
  catch: {en: 'Handle an exception thrown in the matching try.', zh: '处理配对 try 中抛出的异常。'},
  finally: {en: 'Run this block whether the try succeeded or threw.', zh: '无论 try 成功还是抛出异常，都会运行这个块。'},
  throw: {en: 'Raise an exception.', zh: '抛出一个异常。'},
  throws: {en: 'Declare that this method may throw the named checked exception.', zh: '声明这个方法可能抛出指定的受检异常。'},
  extends: {en: 'This class inherits from another class.', zh: '这个类继承另一个类。'},
  implements: {en: 'This class provides the methods of an interface.', zh: '这个类提供某个接口的方法。'},
  this: {en: 'The current instance. `this.x` is the field, not a parameter of the same name.', zh: '当前实例。`this.x` 是字段，不是同名参数。'},
  super: {en: 'The parent class. `super()` runs the parent constructor.', zh: '父类。`super()` 会运行父类构造方法。'},
  null: {en: 'No object. Calling a method on null throws NullPointerException.', zh: '空引用。对 null 调用方法会抛出 NullPointerException。'},
  true: {en: 'The boolean true value.', zh: '布尔真值。'},
  false: {en: 'The boolean false value.', zh: '布尔假值。'},
  main: {en: 'The method the JVM starts. Signature is `public static void main(String[] args)`.', zh: 'JVM 启动时调用的方法。签名是 `public static void main(String[] args)`。'},
  println: {en: 'Write a line to standard output and then a newline. `System.out.println(...)`.', zh: '把一行写到标准输出，并换行。`System.out.println(...)`。'},
  print: {en: 'Write text to standard output without adding a newline.', zh: '把文本写到标准输出，不加换行。'},
  length: {en: 'Number of characters in a String, or the size of an array.', zh: '字符串的字符数，或数组的长度。'},
  equals: {en: 'Value comparison. Use this for strings, not `==`.', zh: '按值比较。比较字符串要用它，不要用 `==`。'},
  size: {en: 'Number of elements in a list, set, or map.', zh: '列表、集合或映射中的元素个数。'},
  get: {en: 'Read the value at an index or key.', zh: '读取某个下标或键对应的值。'},
  add: {en: 'Insert an element into a list or set.', zh: '把一个元素加入列表或集合。'},
  put: {en: 'Store a key and value in a map.', zh: '在映射中存放一个键和值。'},
  remove: {en: 'Delete an element from a collection.', zh: '从集合中删除一个元素。'},
  contains: {en: 'True if the collection holds that value.', zh: '集合包含该值则为真。'},
  System: {en: 'The class that owns `out`, `err`, and `exit`.', zh: '拥有 `out`、`err` 和 `exit` 的类。'},
  out: {en: 'Standard output stream on `System`. `System.out` is where `println` writes.', zh: 'System 上的标准输出流。`println` 写到 `System.out`。'},
  util: {en: 'Package `java.util`. Everyday collections, `Scanner`, `Random`, and dates.', zh: '包 `java.util`。常用集合、`Scanner`、`Random` 和日期。'},
  Scanner: {en: 'From `java.util`. Reads tokens from input. `nextInt()` and `nextLine()` are the usual calls.', zh: '来自 `java.util`。从输入读取记号。常用 `nextInt()` 和 `nextLine()`。'},
  nextInt: {en: 'Scanner method. Read the next integer token.', zh: 'Scanner 的方法。读取下一个整数。'},
  nextLine: {en: 'Scanner method. Read the rest of the line, including spaces.', zh: 'Scanner 的方法。读入这一行剩下的内容，包括空格。'},
  Random: {en: 'From `java.util`. A random-number generator. `nextInt(n)` is in `0 .. n-1`.', zh: '来自 `java.util`。随机数发生器。`nextInt(n)` 得到 `0` 到 `n-1`。'},
  Math: {en: 'The `java.lang.Math` class. Static helpers: `abs`, `sqrt`, `pow`, `max`, `min`, `floor`, `ceil`.', zh: '`java.lang.Math` 类。静态工具：`abs`、`sqrt`、`pow`、`max`、`min`、`floor`、`ceil`。'},
  abs: {en: 'Math.abs(x). The absolute value, never negative.', zh: 'Math.abs(x)。绝对值，不会是负数。'},
  sqrt: {en: 'Math.sqrt(x). The square root, as a double.', zh: 'Math.sqrt(x)。平方根，结果是 double。'},
  pow: {en: 'Math.pow(a, b). a raised to the power b.', zh: 'Math.pow(a, b)。a 的 b 次方。'},
  max: {en: 'Math.max(a, b). The larger of two values.', zh: 'Math.max(a, b)。两个值中较大的那个。'},
  min: {en: 'Math.min(a, b). The smaller of two values.', zh: 'Math.min(a, b)。两个值中较小的那个。'},
  floor: {en: 'Math.floor(x). The greatest integer that is not greater than x.', zh: 'Math.floor(x)。不大于 x 的最大整数。'},
  ceil: {en: 'Math.ceil(x). The smallest integer that is not less than x.', zh: 'Math.ceil(x)。不小于 x 的最小整数。'},
  round: {en: 'Math.round(x). Round to the nearest integer.', zh: 'Math.round(x)。四舍五入到最近的整数。'},
  random: {en: 'Math.random(). A double in `[0.0, 1.0)`.', zh: 'Math.random()。`[0.0, 1.0)` 之间的一个 double。'},
  Integer: {en: 'The int wrapper. `Integer.parseInt(s)` turns text into an int.', zh: 'int 的包装类。`Integer.parseInt(s)` 把文本变成 int。'},
  Character: {en: 'The char wrapper. Helpers such as `toUpperCase` on one character.', zh: 'char 的包装类。例如对一个字符做 `toUpperCase`。'},
  StringBuilder: {en: 'A mutable text buffer. `append` adds pieces; `toString` finishes the string.', zh: '可变的文本缓冲。`append` 追加片段，`toString` 得到最终字符串。'},
  append: {en: 'Add text to a StringBuilder. Returns the same builder so calls can chain.', zh: '把文本加到 StringBuilder。返回同一个对象，所以可以连续调用。'},
  charAt: {en: 'The character at an index. `s.charAt(0)` is the first character.', zh: '某个下标上的字符。`s.charAt(0)` 是第一个字符。'},
  compareTo: {en: 'Order two strings. Negative, zero, or positive, like a dictionary compare.', zh: '比较两个字符串的顺序。返回负、零或正，像字典序比较。'},
  equalsIgnoreCase: {en: 'True if two strings match ignoring letter case.', zh: '忽略大小写时两个字符串相同则为真。'},
  toLowerCase: {en: 'A new string with letters in lowercase.', zh: '字母变成小写的新字符串。'},
  toUpperCase: {en: 'A new string with letters in uppercase.', zh: '字母变成大写的新字符串。'},
  toCharArray: {en: 'The string as a `char[]`.', zh: '把字符串变成 `char[]`。'},
  DecimalFormat: {en: 'From `java.text`. Format a number with a pattern such as `"0.00"`.', zh: '来自 `java.text`。用 `"0.00"` 这样的模式格式化数字。'},
  RoundingMode: {en: 'From `java.math`. How to round, such as `HALF_UP`.', zh: '来自 `java.math`。舍入方式，例如 `HALF_UP`。'},
  format: {en: 'Apply a pattern or format string to a value.', zh: '按模式或格式字符串格式化一个值。'},
  ArrayList: {en: 'A resizable list. `add`, `get`, `size`, `remove`. Import `java.util.ArrayList`.', zh: '可变长列表。`add`、`get`、`size`、`remove`。'},
  HashMap: {en: 'A hash map. `put(key, value)` stores, `get(key)` reads.', zh: '哈希表。`put(key, value)` 存放，`get(key)` 读取。'},
  HashSet: {en: 'A hash set of unique elements. `add` and `contains`.', zh: '元素不重复的哈希集合。`add` 和 `contains`。'},
};

function docText(entry, lang) {
  if (!entry) return '';
  if (typeof entry === 'string') return entry;
  if (lang === 'zh') return entry.zh || entry.en || '';
  return entry.en || entry.zh || '';
}

export function docsForLine(line, lang = 'en') {
  const text = String(line || '');
  const hits = [];
  const seen = new Set();
  const imported = [...text.matchAll(/\bimport\s+(?:static\s+)?([\w.]+)/g)].map((m) => m[1].split('.').pop());
  const tokens = [...imported, ...(text.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [])];
  for (const token of tokens) {
    if (seen.has(token) || !JAVA_KEYWORD_DOCS[token]) continue;
    seen.add(token);
    hits.push({token, doc: docText(JAVA_KEYWORD_DOCS[token], lang)});
  }
  return hits;
}
