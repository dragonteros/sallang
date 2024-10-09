import {parse} from './parse.js';
import {interpret} from './interpret.js';

/**
 * Run the program
 * @param {string} program 
 * @param {*} ioUtils 
 * @returns {number} exit code.
 */
export function run(program, ioUtils) {
    return interpret(parse(program), ioUtils)
}
