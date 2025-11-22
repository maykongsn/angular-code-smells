import path from "path";
import { AnalysisOutput } from "../analyzer";

type SmellAbbreviation =
  | "DOM"
  | "IIC"
  | "LC"
  | "ANY"
  | "TMI"

const smellsMap: Record<string, SmellAbbreviation> = {
  overusingAnyType: "ANY",
  inheritanceInsteadOfCompositionDetector: "IIC",
  largeComponent: "LC",
  directDomManipulation: "DOM",
  tooManyInputs: "TMI",
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
        (Array.isArray(value) && value.length > 0 ? 1 : 0),
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