import {tokenize} from './tokenize';
import {parse} from './parse';
import {interpret} from './interpret';

/**
 * Run the program
 * @param {string} program 
 * @param {*} ioUtils 
 * @returns {number} exit code.
 */
export function run(program, ioUtils) {
    return interpret(parse(tokenize(program)), ioUtils)
}
