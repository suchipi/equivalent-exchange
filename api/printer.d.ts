import * as types from "./types-ns";
import { PrintOptions, TransmuteResult } from "./ee-types";
/**
 * Converts an AST back into a code string.
 *
 * This function is used internally by `transmute`.
 *
 * The options parameter works the same as the options parameter for `transmute`.
 */
export declare function print(
  ast: types.Node,
  options?: PrintOptions,
): TransmuteResult;
