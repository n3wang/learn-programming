/** UI strings for ProblemSet. Pass lang="es" on <ProblemSet> for Spanish; default is English. */

const EN = {
  problem: (n) => `Problem ${n}`,
  solved: 'solved',
  problemsAria: 'Problems',
  checkLater: 'Check later',
  nextUnsolved: 'Next unsolved',
  // concept
  usingOne: (a) => `Using “${a}”`,
  usingTwo: (a, b) => `Using “${a}” and “${b}”`,
  usingMany: (head, last) => `Using “${head}”, and “${last}”`,
  explain: 'explain:',
  minWordsHint: (n) => `Minimum ${n} words. `,
  mustInclude: (list) => `Your answer must include: ${list}.`,
  typeThenCheck: 'Type your explanation, then check before viewing the model answer.',
  typeThenCompare: 'Type your own explanation, then compare with the model answer and mark as reviewed.',
  placeholder: 'Write your answer here…',
  answerAria: 'Your written answer',
  words: (n) => `${n} word${n === 1 ? '' : 's'}`,
  minSuffix: (n) => `/ ${n} min`,
  needWords: (n, have) => `Write at least ${n} words (you have ${have}).`,
  needTerm: (t) => `Include the required term “${t}”.`,
  needTerms: (list) => `Include the required terms: ${list}.`,
  checkRequirements: 'Check requirements',
  showModel: 'Show model answer',
  markReviewed: 'Mark as reviewed',
  markedReviewed: 'Marked as reviewed.',
  meetRequirements: 'Meet the writing requirements, then you can open the model answer.',
  // numeric
  enterNumber: (d) =>
    `Enter a number (at most ${d} decimal place${d === 1 ? '' : 's'}${d === 0 ? ' — integer' : ''}).`,
  numericAria: 'Numeric answer',
  check: 'Check',
  invalidNumber: 'Enter a valid number.',
  notQuite: (left) =>
    `Not quite — try again (${left} attempt${left === 1 ? '' : 's'} left before the answer is revealed).`,
  officialAnswer: 'Official answer:',
  correct: 'Correct',
  // cloze
  clozeHint: 'Fill in each blank (one or two words). Accents and capitals don’t matter.',
  clozeBlankAria: (n) => `Blank ${n}`,
  clozeAllRight: 'All blanks correct.',
  clozeSomeWrong: (bad, total) => `${bad} of ${total} blank${total === 1 ? '' : 's'} not right yet — fix the red ones or ask for a hint.`,
  clozeEmpty: 'Fill in at least one blank first.',
  hint: 'Hint',
  hintText: 'The first letter of each unsolved blank is shown next to it.',
  showAnswer: 'Show answer',
  answerShown: 'Answer shown — compare with yours, then mark as reviewed.',
  officialSolution: 'Official solution:',
};

const ES = {
  problem: (n) => `Pregunta ${n}`,
  solved: 'resueltas',
  problemsAria: 'Preguntas',
  checkLater: 'Revisar después',
  nextUnsolved: 'Siguiente pendiente',
  usingOne: (a) => `Usando “${a}”`,
  usingTwo: (a, b) => `Usando “${a}” y “${b}”`,
  usingMany: (head, last) => `Usando “${head}” y “${last}”`,
  explain: 'explica:',
  minWordsHint: (n) => `Mínimo ${n} palabras. `,
  mustInclude: (list) => `Tu respuesta debe incluir: ${list}.`,
  typeThenCheck: 'Escribe tu explicación y verifica los requisitos antes de ver la solución.',
  typeThenCompare: 'Escribe tu respuesta, compárala con la solución oficial y márcala como revisada.',
  placeholder: 'Escribe tu respuesta aquí…',
  answerAria: 'Tu respuesta escrita',
  words: (n) => `${n} palabra${n === 1 ? '' : 's'}`,
  minSuffix: (n) => `/ ${n} mín.`,
  needWords: (n, have) => `Escribe al menos ${n} palabras (llevas ${have}).`,
  needTerm: (t) => `Incluye el término obligatorio “${t}”.`,
  needTerms: (list) => `Incluye los términos obligatorios: ${list}.`,
  checkRequirements: 'Verificar requisitos',
  showModel: 'Ver solución oficial',
  markReviewed: 'Marcar como revisada',
  markedReviewed: 'Marcada como revisada.',
  meetRequirements: 'Cumple los requisitos de escritura para poder ver la solución.',
  enterNumber: (d) =>
    `Escribe un número (máximo ${d} decimal${d === 1 ? '' : 'es'}${d === 0 ? ' — entero' : ''}).`,
  numericAria: 'Respuesta numérica',
  check: 'Comprobar',
  invalidNumber: 'Escribe un número válido.',
  notQuite: (left) =>
    `Aún no — inténtalo de nuevo (te queda${left === 1 ? '' : 'n'} ${left} intento${left === 1 ? '' : 's'} antes de mostrar la respuesta).`,
  officialAnswer: 'Respuesta oficial:',
  correct: 'Correcto',
  clozeHint: 'Completa cada espacio (una o dos palabras). No importan acentos ni mayúsculas.',
  clozeBlankAria: (n) => `Espacio ${n}`,
  clozeAllRight: '¡Todos los espacios son correctos!',
  clozeSomeWrong: (bad, total) => `${bad} de ${total} espacio${total === 1 ? '' : 's'} aún no ${bad === 1 ? 'es correcto' : 'son correctos'} — corrige los rojos o pide una pista.`,
  clozeEmpty: 'Completa al menos un espacio primero.',
  hint: 'Pista',
  hintText: 'Junto a cada espacio pendiente aparece su primera letra.',
  showAnswer: 'Ver respuesta',
  answerShown: 'Respuesta mostrada — compárala con la tuya y márcala como revisada.',
  officialSolution: 'Solución oficial:',
};

const LABELS = {en: EN, es: ES};

export function getLabels(lang) {
  return LABELS[String(lang || 'en').toLowerCase().slice(0, 2)] || EN;
}
