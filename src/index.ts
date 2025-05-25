import traverse from "@babel/traverse";
import template from "@babel/template";
import * as types from "./types-ns";
import * as recast from "recast";
import {
  AST,
  TransmuteOptions,
  ParseOptions,
  PrintOptions,
  TransmuteResult,
} from "./ee-types";
import * as parser from "./parser";
import * as printer from "./printer";
import { clone, hasShape } from "./utils";

/**
 * The transmute function; star of the library. See {@link Transmute}.
 */
// @ts-ignore typescript overload refinement leaves a lot to be desired
export const transmute: Transmute = (
  ...args: Array<any>
): TransmuteResult | Promise<TransmuteResult> => {
  const code: string = args[0];
  let options: TransmuteOptions = {};
  let transform: (ast: types.Node) => void | Promise<void>;
  if (typeof args[1] === "function") {
    transform = args[1];
  } else {
    options = args[1];
    transform = args[2];
  }

  const ast = codeToAst(code, options);

  const result = transform(ast);
  if (
    typeof result === "object" &&
    result != null &&
    typeof result.then === "function"
  ) {
    return result.then(() => {
      return astToCode(ast, options);
    });
  } else {
    return astToCode(ast, options);
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
export function astToCode(
  ast: types.Node,
  options: TransmuteOptions = {},
): TransmuteResult {
  return printer.print(ast, {
    ...(options.printOptions || null),
    fileName: options.fileName,
    sourceMapFileName: options.sourceMapFileName,
  });
}

/**
 * The various call signatures of the {@link codeToAst} function. When option
 * `expression` is true, it returns a `types.Node`, but when it isn't, it
 * returns an `AST`, which is an alias for `types.File`.
 */
interface CodeToAst {
  (code: string): AST;
  (code: string, options: TransmuteOptions & { expression: true }): types.Node;
  (code: string, options: TransmuteOptions & { expression: false }): AST;
  (
    code: string,
    options: TransmuteOptions & { expression: boolean },
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
export const codeToAst: CodeToAst = (
  code: string,
  options: TransmuteOptions = {},
): any => {
  const codeToParse = options.expression ? `(${code})` : code;

  const ast: AST = recast.parse(codeToParse, {
    sourceFileName: options.fileName,
    inputSourceMap: options.inputSourceMap,
    parser: {
      parse(source: string) {
        return parser.parse(source, {
          ...(options.parseOptions || null),
          fileName: options.fileName,
        });
      },
    },
  });

  if (options.expression) {
    if (!types.isExpressionStatement(ast.program.body[0])) {
      throw new Error(
        "Attempted to parse code as an expression, but the resulting AST's first statement wasn't an ExpressionStatement.",
      );
    }

    return ast.program.body[0].expression;
  }

  return ast;
};

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
  /** AST node cloner utility function. See {@link clone}. */
  clone,
  /** Deep object property comparison checker utility function. See {@link hasShape}. */
  hasShape,
};

/**
 * A version of the function {@link codeToAst} exported as the named export
 * 'parse', suitable for use with AST tooling that lets you specify a parser
 * module.
 *
 * Unlike `codeToAst`, ** `parse` receives {@link ParseOptions} (aka the
 * "parseOptions" property of {@link TransmuteOptions}), instead of the whole
 * `TransmuteOptions`.
 *
 * > Important: **`parse` doesn't wrap the resulting AST using recast**, so code
 * style and formatting changes are not tracked. For this reason, you should
 * probably use `codeToAst` (or `transmute`) instead or `parse`.
 *
 * If you aren't sure whether to use `parse` or `codeToAst`, use `codeToAst`.
 */
export const parse = parser.parse;

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
export const print = printer.print;
