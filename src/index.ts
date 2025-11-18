import traverse from "@babel/traverse";
import template from "@babel/template";
import * as types from "./types-ns";
import { AST, Options, Result } from "./ee-types";
import { parse, Parse } from "./parser";
import { print } from "./printer";
import { clone, hasShape } from "./utils";
import { mapFiles } from "./map-files";

/**
 * The transmute function; star of the library. See {@link Transmute}.
 */
// @ts-ignore typescript overload refinement leaves a lot to be desired
export const transmute: Transmute = (
  ...args: Array<any>
): Result | Promise<Result> => {
  const code: string = args[0];
  let options: Options = {};
  let transform: (ast: types.Node) => void | Promise<void>;
  if (typeof args[1] === "function") {
    transform = args[1];
  } else {
    options = args[1];
    transform = args[2];
  }

  const ast = parse(code, options);

  const result = transform(ast);
  if (
    typeof result === "object" &&
    result != null &&
    typeof result.then === "function"
  ) {
    return result.then(() => {
      return print(ast, options);
    });
  } else {
    return print(ast, options);
  }
};

/**
 * The interface of the `transmute` function, which has 4 different call signatures.
 */
export interface Transmute {
  /**
   * Parses `code` into an AST, then passes that to `transform`, which is
   * expected to mutate the AST somehow.
   *
   * Once the Promise returned by `transform` has resolved, it converts the AST
   * back into a string, and returns you a {@link Result}, which has
   * the transformed string on it as its `code` property.
   */
  (code: string, transform: (ast: AST) => Promise<void>): Promise<Result>;

  /**
   * Parses `code` into an AST, then passes that to `transform`, which is
   * expected to mutate the AST somehow.
   *
   * Once the Promise returned by `transform` has resolved, it converts the AST
   * back into a string, and returns you a {@link Result}, which has
   * the transformed string on it as its `code` property.
   *
   * The contents of `options` will determine what syntax options to use to
   * parse the code, and whether to consume/generate source maps. See
   * {@link Options} for more details.
   */
  (
    code: string,
    options: Options,
    transform: (ast: types.Node) => Promise<void>,
  ): Promise<Result>;

  /**
   * Parses `code` into an AST, then passes that to `transform`, which
   * is expected to mutate the AST somehow.
   *
   * Then, it converts the AST back into a string, and returns you a
   * {@link Result}, which has the transformed string on it as its
   * `code` property.
   */
  (code: string, transform: (ast: AST) => void): Result;

  /**
   * Parses `code` into an AST, then passes that to `transform`, which is
   * expected to mutate the AST somehow.
   *
   * Then, it converts the AST back into a string, and returns you a
   * {@link Result}, which has the transformed string on it as its
   * `code` property.
   *
   * The contents of `options` will determine what syntax options to use to
   * parse the code, and whether to consume/generate source maps. See
   * {@link Options} for more details.
   */
  (
    code: string,
    options: Options,
    transform: (ast: types.Node) => void,
  ): Result;
}

export {
  /**
   * Parser (code-to-AST) function used by `transmute`. See {@link parse}.
   */
  parse,

  /**
   * Type of the `parse` function. See {@link Parse}.
   */
  Parse,

  /**
   * Printer (AST-to-code) function used by `transmute`. See {@link print}.
   */
  print,

  /**
   * Re-export of `@babel/traverse`'s default export.
   */
  traverse,

  /**
   * Contains the named exports of both `@babel/types` and `@babel/traverse`.
   */
  types,

  /**
   * Re-export of `@babel/template`'s default export.
   */
  template,

  /**
   * Type returned by {@link parse}. See {@link AST}.
   */
  type AST,

  /**
   * Type used by {@link transmute}, {@link parse}, and {@link print}. See
   * {@link Options}.
   */
  type Options,

  /**
   * Type returned by {@link print}. See {@link Result}.
   */
  type Result,

  /**
   * AST node cloner utility function. See {@link clone}.
   */
  clone,

  /**
   * Deep object property comparison checker utility function. See
   * {@link hasShape}.
   */
  hasShape,

  /**
   * Bulk file content transform utility functions. See {@link mapFiles}.
   */
  mapFiles,
};
