import traverse from "@babel/traverse";
import template from "@babel/template";
import * as types from "./types-ns";
export {
  /** Re-export of @babel/traverse's default export. */
  traverse,
  /** Contains the named exports of both @babel/types and @babel/traverse. */
  types,
  /** Re-export of @babel/template's default export. */
  template,
};
/**
 * The node type that `transmute` will give to you as the root AST node.
 *
 * It's an alias to babel's `File` node type.
 */
export declare type AST = types.File;
/**
 * Options that affect the behavior of `transmute`, `codeToAst`, and `astToCode`.
 */
export declare type TransmuteOptions = {
  /**
   * The name of the file whose code you are transmuting.
   *
   * If passed, parse errors thrown by `transmute` will be clearer,
   * and it will be possible to generate sourcemaps for the file.
   */
  fileName?: string;
  /**
   * The name of the output file where you will store a sourcemap
   * generated by transmute.
   *
   * Both `fileName` and `sourceMapFileName` must be present to
   * generate a sourcemap.
   */
  sourceMapFileName?: string;
  /**
   * An input sourcemap to compose the newly-generated sourcemap
   * with.
   */
  inputSourceMap?: any;
  /**
   * Options that control how `transmute` will convert code strings into ASTs.
   */
  parseOptions?: {
    /**
     * Which type-checker syntax to use.
     *
     * Defaults to "typescript".
     */
    typeSyntax?: "typescript" | "flow";
    /**
     * Which decorator proposal syntax to use.
     *
     * Defaults to "legacy".
     */
    decoratorSyntax?: "new" | "legacy";
    /**
     * Which syntax proposal to use for the pipeline operator.
     *
     * Defaults to "hack".
     */
    pipelineSyntax?: "minimal" | "fsharp" | "hack" | "smart";
    /**
     * Which topic token to use when using the "hack" syntax proposal for the pipeline operator.
     *
     * Defaults to "%". Only used when pipelineSyntax is "hack".
     */
    hackPipelineTopicToken?: "^^" | "@@" | "^" | "%" | "#";
  };
  /**
   * Whether to parse the code as an expression instead of a whole program.
   *
   * When this is true, the resulting AST type will vary.
   *
   * Defaults to false.
   */
  expression?: boolean;
};
/**
 * The result of transmuting some code. If the options you passed into
 * `transmute` had sourcemap-related stuff set, then the `map` property
 * will be set. Otherwise, it'll be null.
 */
export declare type TransmuteResult = {
  /**
   * The transformed code string.
   */
  code: string;
  /**
   * A source map describing the changes between the original code string and
   * its transformed version.
   */
  map?: any;
};
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
    transform: (ast: AST) => Promise<void>
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
    transform: (ast: types.Node) => Promise<void>
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
    transform: (ast: types.Node) => void
  ): TransmuteResult;
}
interface CodeToAst {
  (code: string): AST;
  (code: string, options: TransmuteOptions): types.Node;
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
  options?: TransmuteOptions
): TransmuteResult;
declare type Clonable =
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
  shape: Shape
): input is Input & Shape;
export declare const transmute: Transmute;
