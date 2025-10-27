import path from "path";
import { AnalysisOutput } from "../analyzer";

type SmellAbbreviation =
  | "ANY"
  | "EIV"
  | "MUT"
  | "MBS"
  | "NNA"
  | "OFP"

const smellsMap: Record<string, SmellAbbreviation> = {
  anyType: "ANY",
  enumImplicitValues: "EIV",
  missingUnionTypeAbstraction: "MUT",
  multipleBooleansForState: "MBS",
  nonNullAssertions: "NNA",
  overlyFlexibleProps: "OFP"
}

type SmellAnalysis = {
  [key in SmellAbbreviation]?: number | string;
}

type LoggerOutput = {
  file: string;
} & SmellAnalysis

export const logger = (analyzeOutput: AnalysisOutput[]) => {
  const smellsOutput: LoggerOutput[] = [];

  analyzeOutput.forEach((output) => {
    const pathToFile = Object.keys(output)[0];
    const smells = output[pathToFile];

    const analysisData: SmellAnalysis = Object.fromEntries(
      Object.entries(smells).map(([key, value]) => [
        smellsMap[key],
        (smellsMap[key] === "MUT" || smellsMap[key] === "MBS")
          ? (Array.isArray(value) && value.length > 0 ? 'Y' : 'N')
          : (Array.isArray(value) && value.length > 0 ? 1 : 0),
      ])
    );

    const outputEntry: LoggerOutput = {
      file: path.basename(pathToFile),
      ...analysisData
    }

    if(Object.values(analysisData).some(value => value === 1 || value === "Y")) {
      smellsOutput.push(outputEntry);
    }
  });

  return smellsOutput;
}