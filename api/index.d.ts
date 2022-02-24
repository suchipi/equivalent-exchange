import traverse from "@babel/traverse";
import * as types from "@babel/types";
export { types, traverse };
export declare type AST = types.File;
export declare type TransmuteOptions = {
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
export declare type TransmuteResult = {
    code: string;
    map?: any;
};
export interface Transmute {
    (code: string, transform: (ast: AST) => Promise<void>): Promise<TransmuteResult>;
    (code: string, options: TransmuteOptions, transform: (ast: AST) => Promise<void>): Promise<TransmuteResult>;
    (code: string, transform: (ast: AST) => void): TransmuteResult;
    (code: string, options: TransmuteOptions, transform: (ast: AST) => void): TransmuteResult;
}
export declare const transmute: Transmute;
