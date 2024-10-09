import { distanceInsDel } from "./editDistance";

export class ParseError extends Error { }

/**
 * Count number of insertions and deletions
 * @param {string} token 
 * @param {string} reference
 * @returns {[number, number]} tuple [i, d]
 */
function diff(token, reference) {
    const { insertions, deletions } = distanceInsDel(token, reference);
    return [insertions, deletions];
}

const STACK_REFERENCES = [
    '필멸자야', '언니야', '오빠야', '누나야', '형아',
];

/**
 * ㅍ: 0, 어: 1, 오: 2, ㄴ: 3, ㅎ: 4
 * @param {string} token 
 */
function getStackNumber(token) {
    const c = token.charCodeAt(0);
    if (c >= '하'.charCodeAt(0)) return 4;
    if (c >= '파'.charCodeAt(0)) return 0;
    if (c >= '요'.charCodeAt(0)) return -1;
    if (c >= '오'.charCodeAt(0)) return 2;
    if (c >= '에'.charCodeAt(0)) return -1;
    if (c >= '어'.charCodeAt(0)) return 1;
    if (c >= '다'.charCodeAt(0)) return -1;
    if (c >= '나'.charCodeAt(0)) return -1;
    return -1;
}

/**
 * Convert tokens to numbers
 * @param {string[][]} statements
 * @returns {number[][]}
 */
export function parse(statements) {
    const parsed = [];
    for (const statement of statements) {
        if (statement.length === 0) {
            parsed.push([]);
            continue;
        }

        const inst = diff(statement[0], '히잉');
        if (inst[0] > 1) { // insertion
            throw ParseError('히잉 구문에 삽입이 너무 많습니다.')
        }
        if (inst[1] > 1) { // deletion
            throw ParseError('히잉 구문에 삭제가 너무 많습니다.')
        }
        const name = getStackNumber(statement[1]);
        if (name === -1) {
            throw ParseError('호칭 구문이 유효하지 않습니다.')
        }
        const stackRef = STACK_REFERENCES[name];
        const stack = diff(statements[1], stackRef);
        if (stack[0] > 1) { // insertion
            throw ParseError(`${stackRef} 구문에 삽입이 너무 많습니다.`)
        }
        if (stack[1] > 2) { // deletion
            throw ParseError(`${stackRef} 구문에 삭제가 너무 많습니다.`)
        }
        const data = diff(statements[2], '꼬리');
        if (data[0] && data[1]) {
            throw ParseError('꼬리 구문은 삽입과 삭제가 같이 있을 수 없습니다.')
        }
        const op = (statements.length > 3 ?
            diff(statements[3], '살랑') : [0, 2]);
        parsed.push([
            ...inst, name, ...stack, ...data, ...op
        ]);
    }
    return parsed;
}
