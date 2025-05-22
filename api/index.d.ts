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
/**
 * The transmute function; star of the library. See {@link Transmute}.
 */
export declare const transmute: Transmute;
/**
 * The interface of the `transmute` function, which has 4 different call signatures.
 */
export interface Transmute {
  /**
   * Parses `code` into an AST, then passes that to `transform`, which is
   * expected to mutate the AST somehow.
   *
   * Once the Promise returned by `transform` has resolved, it converts the AST
   * back into a string, and returns you a {@link TransmuteResult}, which has
   * the transformed string on it as its `code` property.
   */
  (
    code: string,
    transform: (ast: AST) => Promise<void>,
  ): Promise<TransmuteResult>;
  /**
   * Parses `code` into an AST, then passes that to `transform`, which is
   * expected to mutate the AST somehow.
   *
   * Once the Promise returned by `transform` has resolved, it converts the AST
   * back into a string, and returns you a {@link TransmuteResult}, which has
   * the transformed string on it as its `code` property.
   *
   * The contents of `options` will determine what syntax options to use to
   * parse the code, and whether to consume/generate source maps. See
   * {@link TransmuteOptions} for more details.
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
   * {@link TransmuteResult}, which has the transformed string on it as its
   * `code` property.
   */
  (code: string, transform: (ast: AST) => void): TransmuteResult;
  /**
   * Parses `code` into an AST, then passes that to `transform`, which is
   * expected to mutate the AST somehow.
   *
   * Then, it converts the AST back into a string, and returns you a
   * {@link TransmuteResult}, which has the transformed string on it as its
   * `code` property.
   *
   * The contents of `options` will determine what syntax options to use to
   * parse the code, and whether to consume/generate source maps. See
   * {@link TransmuteOptions} for more details.
   */
  (
    code: string,
    options: TransmuteOptions,
    transform: (ast: types.Node) => void,
  ): TransmuteResult;
}
/**
 * Converts an AST back into a code string.
 *
 * This function is used internally by {@link transmute}.
 *
 * The options parameter works the same as the options parameter for `transmute`.
 */
export declare function astToCode(
  ast: types.Node,
  options?: TransmuteOptions,
): TransmuteResult;
/**
 * The various call signatures of the {@link codeToAst} function. When option
 * `expression` is true, it returns a `types.Node`, but when it isn't, it
 * returns an `AST`, which is an alias for `types.File`.
 */
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
 * This function is used internally by {@link transmute}.
 *
 * The options parameter works the same as the options parameter for `transmute`.
 */
export declare const codeToAst: CodeToAst;
/**
 * Utility function which deeply-clones the provided object or value. Primitive
 * values are returned as-is (ie not cloned).
 *
 * This can be useful when you need to clone an AST node.
 */
export declare function clone<T extends Clonable>(input: T): T;
type Clonable =
  | {}
  | number
  | string
  | null
  | undefined
  | boolean
  | Array<Clonable>;
/**
 * Utility function which checks whether `input` is a structural subset of
 * `shape`.
 *
 * This can be useful when you need to check if an AST node has a set of
 * properties.
 */
export declare function hasShape<Input, Shape>(
  input: Input,
  shape: Shape,
): input is Input & Shape;
export {
  /** Re-export of `@babel/traverse`'s default export. */
  traverse,
  /** Contains the named exports of both `@babel/types` and `@babel/traverse`. */
  types,
  /** Re-export of `@babel/template`'s default export. */
  template,
  /** Type returned by {@link codeToAst}. See {@link AST}. */
  type AST,
  /** Type used by {@link transmute}. See {@link TransmuteOptions}. */
  type TransmuteOptions,
  /** Type used by {@link parse} and {@link TransmuteOptions}. See {@link ParseOptions}. */
  type ParseOptions,
  /** Type used by {@link print} and {@link TransmuteOptions}. See {@link PrintOptions}. */
  type PrintOptions,
  /** Type returned by {@link transmute}. See {@link TransmuteResult}. */
  type TransmuteResult,
};
/**
 * A version of the function {@link codeToAst} exported as the named export
 * 'parse', suitable for use with AST tooling that lets you specify a parser
 * module.
 *
 * Unlike `codeToAst`, **`parse` doesn't wrap the resulting AST using recast**,
 * and `parse` receives {@link ParseOptions} (aka the "parseOptions" property of
 * {@link TransmuteOptions}), instead of the whole `TransmuteOptions`.
 *
 * If you aren't sure whether to use `parse` or `codeToAst`, use `codeToAst`.
 */
export declare const parse: (source: string, options?: ParseOptions) => any;
/**
 * The version of the function {@link astToCode} exported as the named export
 * 'print', suitable for use with AST tooling that lets you specify a printer
 * module.
 *
 * Unlike `astToCode`, `print` receives {@link PrintOptions} (aka the
 * "printOptions" property of {@link TransmuteOptions}), instead of the whole
 * `TransmuteOptions`.
 *
 * If you aren't sure whether to use `print` or `astToCode`, use `astToCode`.
 */
export declare const print: typeof printer.print;
