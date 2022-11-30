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

  return babelParser.parse(source, {
    sourceFilename: options.fileName,
    allowAwaitOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true,
    allowUndeclaredExports: true,
    tokens: true,
    plugins: [
      ...(typeSyntax === "flow"
        ? (["flow", "flowComments"] as const)
        : (["typescript"] as const)),

      "jsx",

      "asyncDoExpressions",
      "asyncGenerators",
      "bigInt",
      "classPrivateMethods",
      "classPrivateProperties",
      "classProperties",
      "classStaticBlock",
      "decimal",

      decoratorSyntax === "new" ? "decorators" : "decorators-legacy",

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

      [
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
      ],
    ],
  });
};
