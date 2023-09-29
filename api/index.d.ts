import traverse from "@babel/traverse";
import template from "@babel/template";
import * as types from "./types-ns";
import {
  AST,
  TransmuteOptions,
  ParseOptions,
  PrintOptions,
  TransmuteResult,
} from "./ee-types";
import * as printer from "./printer";
export {
  /** Re-export of @babel/traverse's default export. */
  traverse,
  /** Contains the named exports of both @babel/types and @babel/traverse. */
  types,
  /** Re-export of @babel/template's default export. */
  template,
  AST,
  TransmuteOptions,
  ParseOptions,
  PrintOptions,
  TransmuteResult,
};
export declare const parse: (source: string, options?: ParseOptions) => any;
export declare const print: typeof printer.print;
interface CodeToAst {
  (code: string): AST;
  (
    code: string,
    options: TransmuteOptions & {
      expression: true;
    },
  ): types.Node;
  (
    code: string,
    options: TransmuteOptions & {
      expression: false;
    },
  ): AST;
  (
    code: string,
    options: TransmuteOptions & {
      expression: boolean;
    },
  ): types.Node;
  (code: string, options: TransmuteOptions): AST;
}
/**
 * Parses a JavaScript/TypeScript code string into an AST.
 *
 * This function is used internally by `transmute`.
 *
 * The options parameter works the same as the options parameter for `transmute`.
 */
export declare const codeToAst: CodeToAst;
/**
 * Converts an AST back into a code string.
 *
 * This function is used internally by `transmute`.
 *
 * The options parameter works the same as the options parameter for `transmute`.
 */
export declare function astToCode(
  ast: types.Node,
  options?: TransmuteOptions,
): TransmuteResult;
type Clonable =
  | {}
  | number
  | string
  | null
  | undefined
  | boolean
  | Array<Clonable>;
export declare function clone<T extends Clonable>(input: T): T;
export declare function hasShape<Input, Shape>(
  input: Input,
  shape: Shape,
): input is Input & Shape;
/**
 * The interface of the `transmute` function, which has 4 different call signatures.
 */
export interface Transmute {
  /**
   * Parses `code` into an AST, then passes that to `transform`, which
   * is expected to mutate the AST somehow.
   *
   * Once the Promise returned by `transform` has resolved, it converts
   * the AST back into a string, and returns you a `TransmuteResult`,
   * which has the transformed string on it as its `code` property.
   */
  (
    code: string,
    transform: (ast: AST) => Promise<void>,
  ): Promise<TransmuteResult>;
  /**
   * Parses `code` into an AST, then passes that to `transform`, which
   * is expected to mutate the AST somehow.
   *
   * Once the Promise returned by `transform` has resolved, it converts
   * the AST back into a string, and returns you a `TransmuteResult`,
   * which has the transformed string on it as its `code` property.
   *
   * The contents of `options` will determine what syntax options to use
   * to parse the code, and whether to consume/generate source maps.
   * See the definition for `TransmuteOptions` for more details.
   */
  (
    code: string,
    options: TransmuteOptions,
    transform: (ast: types.Node) => Promise<void>,
  ): Promise<TransmuteResult>;
  /**
   * Parses `code` into an AST, then passes that to `transform`, which
   * is expected to mutate the AST somehow.
   *
   * Then, it converts the AST back into a string, and returns you a
   * `TransmuteResult`, which has the transformed string on it as its
   * `code` property.
   */
  (code: string, transform: (ast: AST) => void): TransmuteResult;
  /**
   * Parses `code` into an AST, then passes that to `transform`, which
   * is expected to mutate the AST somehow.
   *
   * Then, it converts the AST back into a string, and returns you a
   * `TransmuteResult`, which has the transformed string on it as its
   * `code` property.
   *
   * The contents of `options` will determine what syntax options to use
   * to parse the code, and whether to consume/generate source maps.
   * See the definition for `TransmuteOptions` for more details.
   */
  (
    code: string,
    options: TransmuteOptions,
    transform: (ast: types.Node) => void,
  ): TransmuteResult;
}
export declare const transmute: Transmute;
