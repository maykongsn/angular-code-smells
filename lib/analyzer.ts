import { ParseResult } from "@babel/parser";
import { File } from "@babel/types";
import { readFiles } from "./utils/file-reader";
import { parseAST } from "./utils/parser";
import { SourceLocation, TSXFile } from "./types";

import { anyType } from "./smells/any-type";
import { enumImplicitValues } from "./smells/enum-implicit-values";
import { missingUnionTypeAbstraction } from "./smells/missing-union-type-abstraction";
import { multipleBooleansForState } from "./smells/multiple-booleans-for-state";
import { nonNullAssertions } from "./smells/non-null-assertions";
import { overlyFlexibleProps } from "./smells/overly-flexible-props";

export type AnalysisOutput = {
  [key: string]: {
    [K in keyof Analyzers]: ReturnType<Analyzers[K]>;
  }
}

export type AnalyzerFunction<T> = (ast: ParseResult<File>) => T;

type Analyzers = {
  [key: string]: AnalyzerFunction<SourceLocation[]>;
}

export const analyzeFile = (file: TSXFile): AnalysisOutput => {
  const ast = parseAST(file);

  const analyzers: Analyzers = {
    missingUnionTypeAbstraction,
    multipleBooleansForState,
    anyType,
    enumImplicitValues: (ast) => enumImplicitValues(ast, file.path),
    nonNullAssertions,
    overlyFlexibleProps
  };

  return {
    [file.path]: Object.fromEntries(
      Object.entries(analyzers).map(([key, analyzer]) => [key, analyzer(ast)])
    )
  };
};

export const analyze = async (path: string) => {
  const analysis: AnalysisOutput[] = [];

  for (const file of await readFiles(path)) {
    analysis.push(analyzeFile(file));
  }

  return analysis;
}