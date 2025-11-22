import { ParseResult } from "@babel/parser";
import { File } from "@babel/types";
import traverse from "@babel/traverse";
import { SourceLocation } from "../types";

export const directDomManipulation = (ast: ParseResult<File>) => {
  const domAccesses: SourceLocation[] = [];

  traverse(ast, {
    MemberExpression(path) {
      const { node } = path;
      
      if (
        node.object.type === "Identifier" &&
        node.object.name === "document"
      ) {
        domAccesses.push({
          start: node.loc?.start.line,
          end: node.loc?.end.line,
          path: node.loc?.filename,
        });
      }

      if (
        node.object.type === "Identifier" &&
        node.object.name === "window" &&
        node.property.type === "Identifier" &&
        node.property.name === "document"
      ) {
        domAccesses.push({
          start: node.loc?.start.line,
          end: node.loc?.end.line,
          path: node.loc?.filename,
        });
      }

      if (
        node.property.type === "Identifier" &&
        node.property.name === "nativeElement"
      ) {
        domAccesses.push({
          start: node.loc?.start.line,
          end: node.loc?.end.line,
          path: node.loc?.filename,
        });
      }
    },
  });

  return domAccesses;
};
