import { STACK_NAMES } from "./constants.js";

export class RuntimeError extends Error { }

/**
 * Do the actual operation
 * @param {number} opI 
 * @param {number} opD 
 * @param {number[]} args 
 */
function operate(opI, opD, args) {
    switch (opI * 10 + opD) {
        case 10: // add
            if (args.length > 1) {
                args.unshift(
                    args.shift() + args.shift()
                )
            }
            break;
        case 1: // sub
            if (args.length === 1) {
                args.unshift(-args.shirt())
            } else {
                let a = args.shift()
                let b = args.shift()
                args.unshift(a - b)
            }
            break;
        case 20: // mul
            args.unshift(
                args.shift() * args.shift()
            )
            break;
        case 2: // div
            let a = args.shift()
            let b = args.shift()
            args.unshift(a / b | 0)
            break
        case 11: // sgn
            let arg = args.shift();
            args.unshift(arg > 0 ? 1 : arg < 0 ? -1 : 0)
            break
        default:
            throw new RuntimeError('살랑 구문이 유효하지 않습니다.')
    }
}

function load(addr, memory, ioUtils) {
    if (addr === 0) return ioUtils.read(addr)
    if (addr in memory) return memory[addr];
    throw new RuntimeError('잘못된 주소에서 읽기를 시도했습니다.')
}

function store(addr, memory, value, ioUtils) {
    if (addr === 1 || addr === 2) {
        ioUtils.write(addr, value);
    } else {
        memory[addr] = value;
    }
}

/**
 * Move or load or store values
 * @param {number[]} args 
 * @param {number} addr 
 * @param {Record<number, number>} memory 
 * @param {number} numStores 
 * @param {*} ioUtils 
 */
function move(args, addr, memory, numStores, ioUtils) {
    if (args.length < numStores) { // load
        if (args.length < numStores - 1) {
            throw new RuntimeError('한 구문에 읽기 요청이 너무 많습니다.')
        }
        args.push(
            load(addr, memory, ioUtils)
        )
    }
    else if (args.length > numStores) { // store
        if (args.length > numStores + 1) {
            throw new RuntimeError('한 구문에 쓰기 요청이 너무 많습니다.')
        }
        store(addr, memory, args.pop(), ioUtils);
    }
}


/**
 * Executes the command
 * @param {number} curInstNo 
 * @param {number[]} command 
 * @param {number[][]} stacks 
 * @param {Record<number, number>} memory 
 * @param {*} ioUtils 
 * @returns {number} next inst no
 */
export function interpretSingle(curInstNo, command, stacks, memory, ioUtils) {
    let nextInstNo = curInstNo + 1;
    if (command.length === 0) {
        return nextInstNo;
    }

    let args = [];

    if (command[1]) { // inst deletion
        args.push(nextInstNo);
    }

    const stackIdx = command[2];
    if (command[4]) { // stack deletion
        if (stacks[stackIdx].length < command[4]) {
            throw new RuntimeError(`${STACK_NAMES[stackIdx]} 스택에 더 남은 값이 없습니다.`)
        }
        for (let i = 0; i < command[4]; i++) {
            args.push(stacks[stackIdx].pop())
        }
    }

    let imm = command[5] - command[6]; // i - d

    if (command[7] || command[8]) {
        args.push(imm);
        operate(command[7], command[8], args);
    } else { // load & store & io
        const numStores = command[0] + command[3];
        move(args, imm, memory, numStores, ioUtils);
    }

    if (command[0]) { // inst insertion
        if (args.length === 0) {
            throw new RuntimeError('한 구문에 쓰기 요청이 너무 많습니다.')
        }
        nextInstNo = args.shift();
    }
    if (command[3]) { // stack insertion
        if (args.length < command[3]) {
            throw new RuntimeError('한 구문에 쓰기 요청이 너무 많습니다.')
        }
        for (let i = 0; i < command[3]; i++) {
            stacks[stackIdx].push(args.shift());
        }
    }
    // if (args.length) {
    //     throw new RuntimeError('한 구문에 읽기 요청이 너무 많습니다.')
    // }

    return nextInstNo;
}


/**
 * Executes the command
 * @param {number[][]} commands
 * @param {*} ioUtils 
 * @returns {number} exit code.
 */
export function interpret(commands, ioUtils) {
    let instNo = 1;
    const stacks = [[], [], [], [], [],]
    const memory = {};

    while (1 <= instNo && instNo <= commands.length) {
        const command = commands[instNo - 1];
        try {
            instNo = interpretSingle(instNo, command, stacks, memory, ioUtils)
        } catch (error) {
            throw new RuntimeError(`${instNo}번줄: ` + error.message)
        }
    }
    return -1 in memory ? memory[-1] : 0
}
