#!/usr/bin/env node

import { analyze } from "./analyzer";
import { runReactSniffer } from "./reactsniffer";
import { appendToCsv } from "./utils/csv-output";
import { logger } from "./utils/logger";

const pathToDir = process.argv[2];

if(!pathToDir) {
  console.error("Please provide a directory path as an argument.");
  process.exit(1);
}

const run = async (pathToDir: string) => 
  await runReactSniffer(pathToDir)
    .then((output) => {
      console.log("React-specific code smells")
      console.table(output.table1)
      console.table(output.table2)
      console.log("Code smells " + 
                  "(LC: Large component; " +
                  "TP:Too many props; " + 
                  "IIC: Inheritance insteadof Composition; " + 
                  "PIS: props in Initial State; " +
                  "DOM: Directly DOM manipulations; " +
                  "JSX: JSX outside the render method; " +
                  "FU: Force update; " +
                  "UC: Uncontrolled component;)\n");
    })
    .catch((error) => console.error(error))
    .then(async () => {
        console.log("\nReact with TypeScript code smells")

        const analysisResult = await analyze(pathToDir);
        console.log(process.cwd() + pathToDir)

        console.table(logger(analysisResult));
        console.log("Code smells " + 
                    "(MUT: Missing Union Type Abstraction; " +
                    "MBS: Multiple Booleans for State; " +
                    "ANY: Any Type; " +
                    "EIV: Enum Implicit Values; " +
                    "NNA: Non-Null Assertions; " +
                    "OFP: Overly Flexible Props;)\n");
        
        await appendToCsv(process.cwd() + "/components_smells.csv", analysisResult)
    })

run(pathToDir);