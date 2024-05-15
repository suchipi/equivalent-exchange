import * as babelParser from "@babel/parser";
import { ParseOptions } from "./ee-types";

/**
 * Parses a JavaScript/TypeScript code string into an AST.
 */
export const parse = (source: string, options: ParseOptions = {}): any => {
  const typeSyntax = options.typeSyntax || "typescript";
  const decoratorSyntax = options.decoratorSyntax || "legacy";
  const pipelineSyntax = options.pipelineSyntax || "hack";
  const hackPipelineTopicToken = options.hackPipelineTopicToken || "%";
  const jsxEnabled = options.jsxEnabled !== false;
  const v8Intrinsic = options.v8Intrinsic ?? false;
  const placeholders = options.placeholders ?? false;

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
  } else {
    plugins.push("typescript");
  }

  if (jsxEnabled) {
    plugins.push("jsx");
  }

  if (decoratorSyntax === "new") {
    plugins.push("decorators");
  } else {
    plugins.push("decorators-legacy");
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

  return babelParser.parse(source, {
    sourceFilename: options.fileName,
    allowAwaitOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true,
    allowUndeclaredExports: true,
    tokens: true,
    plugins,
  });
};
