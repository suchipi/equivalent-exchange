import * as types from "./types-ns";

/**
 * The node type that `transmute` will give to you as the root AST node.
 *
 * It's an alias to babel's `File` node type.
 */
export type AST = types.File;

/**
 * Options that control how `transmute` will convert code strings into ASTs.
 */
export type ParseOptions = {
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
  pipelineSyntax?: "minimal" | "fsharp" | "hack" | "smart" | "none";

  /**
   * Which topic token to use when using the "hack" syntax proposal for the pipeline operator.
   *
   * Defaults to "%". Only used when pipelineSyntax is "hack".
   */
  hackPipelineTopicToken?: "^^" | "@@" | "^" | "%" | "#";

  /**
   * Whether to parse matching < and > in the code as JSX. It is generally
   * okay to have this on, but if your code is not JSX, and you do some nested
   * numeric comparisons, or use < and > for type casting, you should disable
   * this.
   *
   * Defaults to `true`.
   */
  jsxEnabled?: boolean;

  /**
   * Whether to enable `@babel/parser`'s `v8intrinsic` plugin, which allows
   * parsing V8 identifier syntax like `%GetOptimizationStatus(fn)`.
   *
   * NOTE: If you enable this, you CANNOT set pipelineSyntax to "hack" (which is
   * the default).
   */
  v8Intrinsic?: boolean;

  /**
   * Whether to enable `@babel/parser`'s `placeholders` plugin, which allows
   * parsing syntax like `const thing = %%SOMETHING%%`.
   *
   * NOTE: If you enable this, you CANNOT set pipelineSyntax to "hack" (which is
   * the default).
   */
  placeholders?: boolean;

  /**
   * The name of the file whose code you are transmuting.
   *
   * If passed, parse errors thrown by `transmute` will be clearer,
   * and it will be possible to generate sourcemaps for the file.
   *
   * When {@link ParseOptions} appears as a property on {@link TransmuteOptions},
   * if the parent `TransmuteOptions` has a `fileName` property, it will be
   * copied onto the child `ParseOptions`, meaning you don't need to specify
   * it in both places.
   */
  fileName?: string;
};

/**
 * Options that control how `transmute` will convert ASTs into code strings.
 */
export type PrintOptions = {
  /**
   * Which method to use to convert an AST back into code.
   *
   * Defaults to "recast.print", which attempts to preserve source formatting
   * of unchanged nodes. If this doesn't matter to you, you can instead use
   * "recast.prettyPrint", which reprints all nodes with generic formatting.
   *
   * "@babel/generator" will use the npm package "@babel/generator" to make
   * the code instead. If you encounter bugs with recast's printer, babel
   * generator may work better.
   */
  printMethod?: "recast.print" | "recast.prettyPrint" | "@babel/generator";

  /**
   * The name of the file whose code you are transmuting.
   *
   * If passed, parse errors thrown by `transmute` will be clearer,
   * and it will be possible to generate sourcemaps for the file.
   *
   * When {@link PrintOptions} appears as a property on {@link TransmuteOptions},
   * if the parent `TransmuteOptions` has a `fileName` property, it will be
   * copied onto the child `PrintOptions`, meaning you don't need to specify
   * it in both places.
   */
  fileName?: string;

  /**
   * The name of the output file where you will store a sourcemap
   * generated by transmute.
   *
   * Both `fileName` and `sourceMapFileName` must be present to
   * generate a sourcemap.
   *
   * When {@link PrintOptions} appears as a property on {@link TransmuteOptions},
   * if the parent `TransmuteOptions` has a `sourceMapFileName` property, it will be
   * copied onto the child `PrintOptions`, meaning you don't need to specify
   * it in both places.
   */
  sourceMapFileName?: string;
};

/**
 * Options that affect the behavior of `transmute`, `codeToAst`, and `astToCode`.
 */
export type TransmuteOptions = {
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
  parseOptions?: ParseOptions;

  /**
   * Whether to parse the code as an expression instead of a whole program.
   *
   * When this is true, the type of the resulting AST node will vary.
   *
   * Defaults to false.
   */
  expression?: boolean;

  /**
   * Options that control how `transmute` will convert ASTs into code strings.
   */
  printOptions?: PrintOptions;
};

/**
 * The result of transmuting some code. If the options you passed into
 * `transmute` had sourcemap-related stuff set, then the `map` property
 * will be set. Otherwise, it'll be null.
 */
export type TransmuteResult = {
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
