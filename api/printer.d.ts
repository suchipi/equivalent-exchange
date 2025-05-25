import * as types from "./types-ns";
import { Result, Options } from "./ee-types";
/**
 * Converts an AST back into a code string.
 *
 * This function is used internally by {@link transmute}.
 *
 * The options parameter is the same type as the options parameter for `transmute`.
 */
export declare function print(ast: types.Node, options?: Options): Result;
