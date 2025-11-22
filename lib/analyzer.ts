import { ParseResult } from "@babel/parser";
import { File } from "@babel/types";
import { readFiles } from "./utils/file-reader";
import { parseAST } from "./utils/parser";
import { SourceLocation, TSXFile } from "./types";

import { directDomManipulation } from "./detectors/direct-dom-manipulation";
import { inheritanceInsteadOfCompositionDetector } from "./detectors/inheritance-instead-of-composition";
import { largeComponent } from "./detectors/large-component";
import { overusingAnyType } from "./detectors/overusing-any-type";
import { tooManyInputs } from "./detectors/too-many-inputs";

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
    directDomManipulation,
    inheritanceInsteadOfCompositionDetector,
    largeComponent,
    overusingAnyType,
    tooManyInputs
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