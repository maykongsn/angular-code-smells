import { ParseResult } from "@babel/parser";
import { File, isTSAnyKeyword } from "@babel/types";
import traverse from "@babel/traverse";
import { SourceLocation } from "../types";

const ANY_THRESHOLD = 5;

export const overusingAnyType = (ast: ParseResult<File>) => {
  const anyOccurrences: SourceLocation[] = [];

  traverse(ast, {
    enter(path) {
      if (isTSAnyKeyword(path.node)) {
        anyOccurrences.push({
          start: path.node.loc?.start.line,
          end: path.node.loc?.end.line,
          path: path.node.loc?.filename,
        });
      }
    },
  });

  if (anyOccurrences.length > ANY_THRESHOLD) {
    return anyOccurrences;
  }

  return [];
};
