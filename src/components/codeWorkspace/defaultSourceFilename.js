const FILE_NAMES = {
    'c++': 'main.cpp',
    cpp: 'main.cpp',
    cxx: 'main.cpp',
    c: 'main.c',
    python: 'main.py',
    py: 'main.py',
    python3: 'main.py',
    java: 'Main.java',
    javascript: 'index.js',
    js: 'index.js',
};

export default function defaultSourceFilename(lang, filename) {
    if (filename) {
        return filename;
    }
    return FILE_NAMES[lang] || 'main.txt';
}
