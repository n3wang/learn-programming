import React, {useMemo} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useColorMode} from '@docusaurus/theme-common';
import CodeMirror from '@uiw/react-codemirror';
import {autocompletion} from '@codemirror/autocomplete';
import {EditorView} from '@codemirror/view';
import {cpp} from '@codemirror/lang-cpp';
import {java} from '@codemirror/lang-java';
import {python} from '@codemirror/lang-python';
import {javascript} from '@codemirror/lang-javascript';
import {githubLight} from '@uiw/codemirror-theme-github';
import {oneDark} from '@codemirror/theme-one-dark';
import styles from './styles.module.css';

const KEYWORDS = {
  'c++': [
    'alignas', 'alignof', 'and', 'auto', 'bool', 'break', 'case', 'catch', 'char',
    'class', 'const', 'constexpr', 'continue', 'default', 'delete', 'do', 'double',
    'else', 'enum', 'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int',
    'long', 'namespace', 'new', 'nullptr', 'operator', 'or', 'private', 'protected',
    'public', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch',
    'template', 'this', 'throw', 'true', 'try', 'typedef', 'typename', 'union',
    'unsigned', 'using', 'virtual', 'void', 'while', 'string', 'vector', 'cout',
    'cin', 'endl', 'std', 'include', 'iostream',
  ],
  cpp: null,
  c: [
    'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double',
    'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long',
    'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef',
    'union', 'unsigned', 'void', 'volatile', 'while', 'printf', 'scanf', 'NULL',
  ],
  python: [
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def',
    'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global',
    'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass',
    'raise', 'return', 'True', 'try', 'while', 'with', 'yield', 'print', 'range',
    'len', 'list', 'dict', 'str', 'int', 'float',
  ],
  java: [
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
    'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
    'extends', 'final', 'finally', 'float', 'for', 'if', 'implements', 'import',
    'instanceof', 'int', 'interface', 'long', 'new', 'package', 'private',
    'protected', 'public', 'return', 'short', 'static', 'super', 'switch',
    'this', 'throw', 'throws', 'try', 'void', 'while', 'true', 'false', 'null',
    'String', 'System', 'out', 'println',
  ],
  javascript: [
    'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
    'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'false',
    'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let',
    'new', 'null', 'return', 'static', 'super', 'switch', 'this', 'throw',
    'true', 'try', 'typeof', 'undefined', 'var', 'void', 'while', 'yield',
    'console', 'log',
  ],
};
KEYWORDS.cpp = KEYWORDS['c++'];

function languageExt(lang) {
  const key = String(lang || '').toLowerCase();
  if (key === 'c++' || key === 'cpp' || key === 'c') {
    return cpp();
  }
  if (key === 'java') {
    return java();
  }
  if (key === 'python' || key === 'py') {
    return python();
  }
  if (key === 'javascript' || key === 'js') {
    return javascript();
  }
  return [];
}

function keywordList(lang) {
  const key = String(lang || '').toLowerCase();
  return KEYWORDS[key] || KEYWORDS.cpp || [];
}

function completionsFor(lang) {
  const keywords = keywordList(lang);
  return (context) => {
    const word = context.matchBefore(/[A-Za-z_]\w*/);
    if (!word || (word.from === word.to && !context.explicit)) {
      return null;
    }
    const text = context.state.doc.toString();
    const found = text.match(/\b[A-Za-z_]\w*\b/g) || [];
    const seen = new Set();
    const options = [];
    for (const kw of keywords) {
      if (!seen.has(kw)) {
        seen.add(kw);
        options.push({label: kw, type: 'keyword'});
      }
    }
    for (const id of found) {
      if (!seen.has(id)) {
        seen.add(id);
        options.push({label: id, type: 'variable'});
      }
    }
    return {from: word.from, options};
  };
}

function EditorInner({value, onChange, lang, readOnly}) {
  const {colorMode} = useColorMode();
  const extensions = useMemo(
    () => [
      languageExt(lang),
      autocompletion({override: [completionsFor(lang)]}),
      EditorView.theme({
        '&': {height: '100%', fontSize: '13px'},
        '.cm-scroller': {
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          lineHeight: '1.55',
        },
        '.cm-gutters': {minWidth: '36px'},
      }),
      EditorView.lineWrapping,
    ],
    [lang]
  );

  return (
    <CodeMirror
      value={value}
      height="100%"
      theme={colorMode === 'dark' ? oneDark : githubLight}
      extensions={extensions}
      editable={!readOnly}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        foldGutter: true,
        autocompletion: true,
        bracketMatching: true,
        closeBrackets: true,
        indentOnInput: true,
        tabSize: 4,
      }}
      onChange={(next) => onChange(next)}
    />
  );
}

export default function CodeEditor({
  value,
  onChange,
  lang = 'c++',
  height = '280px',
  readOnly = false,
}) {
  return (
    <div className={styles.fill} style={{minHeight: height}}>
      <BrowserOnly
        fallback={
          <textarea value={value} readOnly className={styles.fallback} style={{minHeight: height}} />
        }
      >
        {() => (
          <EditorInner
            value={value}
            onChange={onChange}
            lang={lang}
            readOnly={readOnly}
          />
        )}
      </BrowserOnly>
    </div>
  );
}
