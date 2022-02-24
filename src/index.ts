import traverse from "@babel/traverse";
import * as babelParser from "@babel/parser";
import * as types from "@babel/types";
import * as recast from "recast";

export { types, traverse };

export type AST = types.File;

export type TransmuteOptions = {
  fileName?: string;
  sourceMapFileName?: string;
  inputSourceMap?: any;
  parseOptions?: {
    /**
     * Defaults to "typescript".
     */
    typeSyntax?: "typescript" | "flow";

    /**
     * Defaults to "new".
     */
    decoratorSyntax?: "new" | "legacy";

    /**
     * Defaults to "hack".
     */
    pipelineSyntax?: "minimal" | "fsharp" | "hack" | "smart";

    /**
     * Only used when pipelineSyntax is "hack". Defaults to "%".
     */
    hackPipelineTopicToken?: "^^" | "@@" | "^" | "%" | "#";
  };
};

export type TransmuteResult = {
  code: string;
  map?: any;
};

export interface Transmute {
  (
    code: string,
    transform: (ast: AST) => Promise<void>
  ): Promise<TransmuteResult>;
  (
    code: string,
    options: TransmuteOptions,
    transform: (ast: AST) => Promise<void>
  ): Promise<TransmuteResult>;

  (code: string, transform: (ast: AST) => void): TransmuteResult;
  (
    code: string,
    options: TransmuteOptions,
    transform: (ast: AST) => void
  ): TransmuteResult;
}

// @ts-ignore typescript overload refinement leaves a lot to be desired
export const transmute: Transmute = (
  ...args: Array<any>
): TransmuteResult | Promise<TransmuteResult> => {
  const code: string = args[0];
  let options: TransmuteOptions = {};
  let transform: (ast: AST) => void | Promise<void>;
  if (typeof args[1] === "function") {
    transform = args[1];
  } else {
    options = args[1];
    transform = args[2];
  }

  const typeSyntax = options?.parseOptions?.typeSyntax || "typescript";
  const decoratorSyntax = options?.parseOptions?.decoratorSyntax || "legacy";
  const pipelineSyntax = options?.parseOptions?.pipelineSyntax || "hack";
  const hackPipelineTopicToken =
    options?.parseOptions?.hackPipelineTopicToken || "%";

  const ast: AST = recast.parse(code, {
    sourceFileName: options.fileName,
    inputSourceMap: options.inputSourceMap,
    parser: {
      parse(source: string) {
        return babelParser.parse(source, {
          sourceFilename: options.fileName,
          allowAwaitOutsideFunction: true,
          allowImportExportEverywhere: true,
          allowReturnOutsideFunction: true,
          allowSuperOutsideMethod: true,
          allowUndeclaredExports: true,
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
      },
    },
  });

  function afterTransform(): TransmuteResult {
    const recastResult = recast.print(ast, {
      sourceMapName: options.sourceMapFileName || "sourcemap.json",
    });
    return {
      code: recastResult.code,
      map:
        options.fileName && options.sourceMapFileName ? recastResult.map : null,
    };
  }

  const result = transform(ast);
  if (
    typeof result === "object" &&
    result != null &&
    typeof result.then === "function"
  ) {
    return result.then(afterTransform);
  } else {
    return afterTransform() as any;
  }
};
