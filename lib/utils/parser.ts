import { parse } from "@babel/parser";
import { TSXFile } from "../types";

export function parseAST(file: TSXFile) {
  const ast = parse(file.content, {
    sourceType: "module",
    sourceFilename: file.path,
    plugins: ["jsx", "typescript", "decorators"]
  });

  return ast;
}