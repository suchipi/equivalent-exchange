import * as types from "./types-ns";
import { AST, Options } from "./ee-types";
/**
 * The various call signatures of the {@link parse} function. When option
 * `parseOptions.expression` is true, it returns a `types.Node`, but when it
 * isn't, it returns an `AST`, which is an alias for `types.File`.
 */
export interface Parse {
  (code: string): AST;
  (
    code: string,
    options: Options & {
      parseOptions: {
        expression: true;
      };
    },
  ): types.Node;
  (
    code: string,
    options: Options & {
      parseOptions: {
        expression: false;
      };
    },
  ): AST;
  (
    code: string,
    options: Options & {
      parseOptions: {
        expression: boolean;
      };
    },
  ): types.Node;
  (code: string, options: Options): AST;
}
/**
 * Parses a JavaScript/TypeScript code string into an AST.
 *
 * This function is used internally by {@link transmute}.
 *
 * The options parameter is the same type as the options parameter for `transmute`.
 */
export declare const parse: Parse;
