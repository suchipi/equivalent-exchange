import traverse from "@babel/traverse";
import template from "@babel/template";
import * as types from "./types-ns";
import { AST, Options, Result } from "./ee-types";
import { parse, Parse } from "./parser";
import { print } from "./printer";
import { clone, hasShape } from "./utils";
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
};
