import { parse } from "csv-parse";
import { stringify } from "csv-stringify";
import fs from "fs";
import { AnalysisOutput } from "../analyzer";

export const appendToCsv = async (csvPath: string, analysisResult: AnalysisOutput[]) => {
  const rows: Record<string, string>[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(parse({ columns: true, trim: true }))
      .on("data", (row) => {
        delete row["Component"];

        rows.push(row);
      })
      .on("end", resolve)
      .on("error", reject);
  });

  let startId = rows.length + 1;

  const newRows = analysisResult.flatMap((result) =>
    Object.entries(result).flatMap(([filePath, smells]) => {
      return Object.entries(smells).flatMap(([smellType, occurrences]) =>
        occurrences.map((occurrence, _) => ({
          id: (startId++).toString(),
          file: filePath,
          Smell: smellType
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .replace(/\b\w/g, (char) => char.toUpperCase()),
          Details: `Lines ${occurrence.start}-${occurrence.end}`,
          "Em uma escala de 1 a 5, como você avalia a relevância desse smell?": '',
          "Observação": '',
        }))
      );
    })
  );

  rows.push(...newRows);

  await new Promise<void>((resolve, reject) => {
    const writableStream = fs.createWriteStream(csvPath);
    const stringfier = stringify({ header: true});

    stringfier.pipe(writableStream).on("finish", resolve).on("error", reject);

    rows.forEach((row) => stringfier.write(row));
    stringfier.end();
  });
}