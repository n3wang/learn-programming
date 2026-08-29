export function runManifestCheck(content, check) {
    const re = new RegExp(check.pattern, check.flags || '');
    const hit = re.test(content);
    const must = check.must !== false;
    const pass = must ? hit : !hit;
    return {
        name: check.name || (must ? 'Required pattern' : 'Forbidden pattern'),
        pass,
        detail: pass
            ? must
                ? 'Found the required value in your manifest.'
                : 'Did not include the forbidden value.'
            : must
              ? check.hint || 'Your manifest must include: ' + check.pattern
              : check.hint || 'Remove or fix: ' + check.pattern,
    };
}

export function runManifestChecks(content, checks) {
    const results = [];
    for (const check of checks) {
        const row = runManifestCheck(content, check);
        results.push(row);
        if (!row.pass) {
            break;
        }
    }
    return results;
}
