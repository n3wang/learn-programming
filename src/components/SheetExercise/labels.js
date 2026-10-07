const ES = {
  check: 'Comprobar',
  hint: 'Pista',
  reveal: 'Ver respuestas',
  reset: 'Reiniciar',
  exportCsv: 'Descargar CSV',
  method: 'Método',
  progress: (ok, total) => `${ok}/${total} celdas correctas`,
  allRight: '¡Todo correcto!',
  someWrong: (bad, empty) =>
    [bad ? `${bad} celda${bad === 1 ? '' : 's'} por corregir (en rojo)` : '', empty ? `${empty} vacía${empty === 1 ? '' : 's'}` : '']
      .filter(Boolean)
      .join(' · '),
  hintGiven: (ref) => `Pista: se llenó la celda ${ref}.`,
  noHint: 'No quedan celdas por llenar.',
  revealed: 'Respuestas mostradas. Compáralas con las tuyas o pulsa Reiniciar para intentarlo de nuevo.',
  formulaHelp: 'Escribe números (150000 o 150,000) o fórmulas como en Excel: =C2*F2, =E1-D2, =SUMA(H1:H6).',
  formulaError: 'Fórmula no válida',
  cellAria: (ref) => `Celda ${ref}`,
  given: 'Dato',
};

const EN = {
  check: 'Check',
  hint: 'Hint',
  reveal: 'Show answers',
  reset: 'Reset',
  exportCsv: 'Download CSV',
  method: 'Method',
  progress: (ok, total) => `${ok}/${total} cells correct`,
  allRight: 'All correct!',
  someWrong: (bad, empty) =>
    [bad ? `${bad} cell${bad === 1 ? '' : 's'} to fix (in red)` : '', empty ? `${empty} empty` : '']
      .filter(Boolean)
      .join(' · '),
  hintGiven: (ref) => `Hint: cell ${ref} was filled in.`,
  noHint: 'No cells left to fill.',
  revealed: 'Answers shown. Compare with yours, or press Reset to try again.',
  formulaHelp: 'Type numbers (150000 or 150,000) or Excel-style formulas: =C2*F2, =E1-D2, =SUM(H1:H6).',
  formulaError: 'Invalid formula',
  cellAria: (ref) => `Cell ${ref}`,
  given: 'Given',
};

export function getSheetLabels(lang) {
  return String(lang || 'en').toLowerCase().startsWith('es') ? ES : EN;
}
