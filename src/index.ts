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

// For use with AST tools
export const parse = parser.parse;
export const print = printer.print;

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
 * This function is used internally by `transmute`.
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

/**
 * Converts an AST back into a code string.
 *
 * This function is used internally by `transmute`.
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

type Clonable =
  | {}
  | number
  | string
  | null
  | undefined
  | boolean
  | Array<Clonable>;

export function clone<T extends Clonable>(input: T): T {
  if (Array.isArray(input)) {
    const copy = new Array(input.length);
    for (let i = 0; i < input.length; i++) {
      copy[i] = input[i];
    }
    // @ts-ignore could be instantiated with different subtype
    return copy;
  }

  if (typeof input !== "object" || input == null) {
    return input;
  }

  const copy = Object.create(Object.getPrototypeOf(input));
  for (const key of Object.keys(input)) {
    copy[key] = clone(input[key]);
  }

  // @ts-ignore could be instantiated with different subtype
  return copy;
}

export function hasShape<Input, Shape>(
  input: Input,
  shape: Shape,
): input is Input & Shape {
  if (typeof input !== "object" || input == null) {
    // @ts-ignore no overlap
    return input === shape;
  }

  // Used for both Array and Object
  return Object.keys(shape as any).every((key) =>
    hasShape(input[key], shape[key]),
  );
}

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
