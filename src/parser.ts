import * as babelParser from "@babel/parser";
import * as recast from "recast";
import * as types from "./types-ns";
import { AST, Options } from "./ee-types";
import makeDebug from "debug";

const debug = makeDebug("equivalent-exchange:parser");

/**
 * The various call signatures of the {@link parse} function. When option
 * `parseOptions.expression` is true, it returns a `types.Node`, but when it
 * isn't, it returns an `AST`, which is an alias for `types.File`.
 */
export interface Parse {
  (code: string): AST;
  (
    code: string,
    options: Options & { parseOptions: { expression: true } },
  ): types.Node;
  (
    code: string,
    options: Options & { parseOptions: { expression: false } },
  ): AST;
  (
    code: string,
    options: Options & { parseOptions: { expression: boolean } },
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
export const parse: Parse = (source: string, options?: Options): any => {
  debug("parse", { source, options });
  if (options) {
    const maybeWrongOpts = options as any;
    for (const parseOptionsKey of [
      "typeSyntax",
      "decoratorSyntax",
      "pipelineSyntax",
      "hackPipelineTopicToken",
      "jsxEnabled",
      "v8Intrinsic",
      "placeholders",
      "expression",
      "skipRecast",
    ]) {
      if (parseOptionsKey in maybeWrongOpts) {
        throw new Error(
          "`parse` function received a legacy ParseOptions, but we want an Options. The following property should be in a sub-object under `parseOptions`: " +
            parseOptionsKey,
        );
      }
    }
  }

  const typeSyntax = options?.parseOptions?.typeSyntax || "typescript";
  const decoratorSyntax = options?.parseOptions?.decoratorSyntax || "legacy";
  const pipelineSyntax = options?.parseOptions?.pipelineSyntax || "hack";
  const hackPipelineTopicToken =
    options?.parseOptions?.hackPipelineTopicToken || "%";
  const jsxEnabled = options?.parseOptions?.jsxEnabled !== false;
  const v8Intrinsic = options?.parseOptions?.v8Intrinsic ?? false;
  const placeholders = options?.parseOptions?.placeholders ?? false;

  const plugins: babelParser.ParserOptions["plugins"] = [
    "asyncDoExpressions",
    "asyncGenerators",
    "bigInt",
    "classPrivateMethods",
    "classPrivateProperties",
    "classProperties",
    "classStaticBlock",
    "decimal",

    "doExpressions",
    "dynamicImport",
    "exportDefaultFrom",
    "exportNamespaceFrom",
    "functionBind",
    "functionSent",
    "importAssertions",
    "importMeta",
    "logicalAssignment",
    "moduleBlocks",
    "moduleStringNames",
    "nullishCoalescingOperator",
    "numericSeparator",
    "objectRestSpread",
    "optionalCatchBinding",
    "optionalChaining",
    "partialApplication",
    "privateIn",
    "throwExpressions",
    "topLevelAwait",
  ];

  if (typeSyntax === "flow") {
    plugins.push("flow", "flowComments");
  } else if (typeSyntax === "typescript") {
    plugins.push("typescript");
  } else if (typeSyntax === "typescript-dts") {
    plugins.push(["typescript", { dts: true }]);
  }

  if (jsxEnabled) {
    plugins.push("jsx");
  }

  if (decoratorSyntax === "new") {
    plugins.push("decorators");
  } else {
    plugins.push("decorators-legacy");
  }

  if (v8Intrinsic && placeholders) {
    throw new Error(
      "Babel disallows using both v8Intrinsic and placeholders together at the same time. Either disable the 'v8Intrinsic' option or disable the 'placeholders' option.",
    );
  }

  if (v8Intrinsic) {
    if (pipelineSyntax === "hack") {
      throw new Error(
        "Babel disallows using both v8Intrinsic and Hack-style pipes together. `equivalent-exchange` has hack-style pipeline syntax enabled by default. Either disable the 'v8Intrinsic' option or change the 'pipelineSyntax' option to a different value, such as 'none' (it defaults to 'hack').",
      );
    }
    plugins.push("v8intrinsic");
  }

  if (placeholders) {
    if (pipelineSyntax === "hack") {
      throw new Error(
        "Babel disallows using both placeholders and Hack-style pipes together. `equivalent-exchange` has hack-style pipeline syntax enabled by default. Either disable the 'placeholders' option or change the 'pipelineSyntax' option to a different value, such as 'none' (it defaults to 'hack').",
      );
    }
    plugins.push("placeholders");
  }

  if (pipelineSyntax !== "none") {
    plugins.push([
      "pipelineOperator",
      {
        proposal: pipelineSyntax,
        ...(pipelineSyntax === "hack"
          ? {
              // Babel's type disallows "^", but babel's runtime
              // seems to allow it, so ignore this error.
              topicToken: hackPipelineTopicToken as any,
            }
          : {}),
      },
    ]);
  }

  debug("babel plugins", plugins);

  const codeToParse = options?.parseOptions?.expression
    ? `(${source})`
    : source;

  function doBabelParse(codeForBabel: string) {
    const result = babelParser.parse(codeForBabel, {
      sourceFilename: options?.fileName,
      allowAwaitOutsideFunction: true,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      allowUndeclaredExports: true,
      tokens: true,
      plugins,
    });
    return result;
  }

  let ast: babelParser.ParseResult;
  if (options?.parseOptions?.skipRecast) {
    debug("skipping recast; parsing with babel only");
    ast = doBabelParse(source);
  } else {
    debug("parsing with babel + recast");
    ast = recast.parse(codeToParse, {
      sourceFileName: options?.fileName,
      inputSourceMap: options?.inputSourceMap,
      parser: {
        parse(sourceFromRecast: string) {
          return doBabelParse(sourceFromRecast);
        },
      },
    });
  }

  debug("done parsing");
  if (options?.parseOptions?.expression) {
    if (!types.isExpressionStatement(ast.program.body[0])) {
      throw new Error(
        "Attempted to parse code as an expression, but the resulting AST's first statement wasn't an ExpressionStatement.",
      );
    }

    return ast.program.body[0].expression;
  }

  return ast;
};
