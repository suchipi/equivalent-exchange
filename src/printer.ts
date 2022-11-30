import * as babelGenerator from "@babel/generator";
import * as types from "./types-ns";
import * as recast from "recast";
import { PrintOptions, TransmuteResult } from "./ee-types";

/**
 * Converts an AST back into a code string.
 *
 * This function is used internally by `transmute`.
 *
 * The options parameter works the same as the options parameter for `transmute`.
 */
export function print(
  ast: types.Node,
  options: PrintOptions = {}
): TransmuteResult {
  const printMethod = options.printMethod || "recast.print";

  switch (printMethod) {
    case "recast.print":
    case "recast.prettyPrint": {
      const printFunction =
        printMethod === "recast.print" ? recast.print : recast.prettyPrint;
      const recastResult = printFunction.call(recast, ast, {
        sourceMapName: options.sourceMapFileName || "sourcemap.json",
      });

      return {
        code: recastResult.code,
        map:
          options.fileName && options.sourceMapFileName
            ? recastResult.map
            : null,
      };
    }

    case "@babel/generator": {
      const babelResult = babelGenerator.default(ast, {
        sourceFileName: options.fileName,
        sourceMaps: Boolean(options.sourceMapFileName),
      });

      return {
        code: babelResult.code,
        map:
          options.fileName && options.sourceMapFileName
            ? babelResult.map
            : null,
      };
    }

    default: {
      throw new Error(`Invalid print method: ${printMethod}`);
    }
  }
}
