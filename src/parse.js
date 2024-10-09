import { distanceInsDel } from "./editDistance.js";
import { STACK_NAMES } from "./constants.js";

export class ParseError extends Error { }

/**
 * Count number of insertions and deletions
 * @param {string} token 
 * @param {string} reference
 * @returns {[number, number]} tuple [i, d]
 */
function diff(token, reference) {
    const { insertions, deletions } = distanceInsDel(reference, token);
    return [insertions, deletions];
}


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
    if (c >= '나'.charCodeAt(0)) return 3;
    return -1;
}

/**
 * Parse program to numbers
 * @param {string} source
 * @returns {number[][]}
 */
export function parse(source) {
    const statements = source.split('\n').map(
        line => line.trim().split(/[^가-힣]+/).filter(s => s.length)
    );

    const parsed = [];
    for (const [i, statement] of statements.entries()) {
        if (statement.length === 0) {
            parsed.push([]);
            continue;
        }

        const inst = diff(statement[0], '히잉');
        if (inst[0] > 1) { // insertion
            throw new ParseError(i + 1 + '번줄: 히잉 구문에 삽입이 너무 많습니다.')
        }
        if (inst[1] > 1) { // deletion
            throw new ParseError(i + 1 + '번줄: 히잉 구문에 삭제가 너무 많습니다.')
        }
        const stackIdx = getStackNumber(statement[1]);
        if (stackIdx === -1) {
            throw new ParseError(i + 1 + '번줄: 호칭 구문이 유효하지 않습니다.')
        }
        const stackName = STACK_NAMES[stackIdx];
        const stack = diff(statement[1], stackName);
        if (stack[0] > 1) { // insertion
            throw new ParseError(`${i + 1}번줄: ${stackName} 구문에 삽입이 너무 많습니다.`)
        }
        if (stack[1] > 2) { // deletion
            throw new ParseError(`${i + 1}번줄: ${stackName} 구문에 삭제가 너무 많습니다.`)
        }
        const data = diff(statement[2], '꼬리');
        if (data[0] && data[1]) {
            throw new ParseError(i + 1 + '번줄: 꼬리 구문은 삽입과 삭제가 같이 있을 수 없습니다.')
        }
        const op = (statement.length > 3 ?
            diff(statement[3], '살랑') : [0, 2]);
        parsed.push([
            ...inst, stackIdx, ...stack, ...data, ...op
        ]);
    }
    return parsed;
}
