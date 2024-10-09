/**
 * Tokenize source into words & newlines
 * @param {string} source 
 * @returns {string[][]}
 */
export function tokenize(source) {
    const lines = source.split('\n');
    return lines.map(
        line => line.trim().split(/[^가-힣]+/)
    );
}
