import { exec } from "node:child_process";
import { promisify } from "node:util";

type Table1Row = {
  id: string;
  largeFile: string;
  loc: string;
  nComponents: string;
  nFunctions: string;
  nImports: string;
}

type Table2Row = {
  file: string;
  component: string;
  lc: string;
  tp: string;
  iic: string;
  fu: string;
  dom: string;
  jsx: string;
  uc: string;
  pis: string;
}

const createObjectFromArray = <T>(headers: string[], values: (string | number)[]) => {
  return headers.reduce((accumulator, header, index) => ({
    ...accumulator,
    [header]: values[index]
  }), {} as T);
}

const parseCell = (cell: string) => {
  const cleanCell = cell.replace(/'/g, "").trim();
  const parsedInt = parseInt(cleanCell, 10);
  return isNaN(parsedInt) ? cleanCell : parsedInt;
}

const parseLine = (line: string) => line.split('│').slice(2, -1).map(parseCell);

const parseTable = <T>(table: string, headers: string[]): T[] => {
  const lines = table.split('\n').filter((line) => line.includes('│'));
  return lines.slice(1).map(parseLine).map((cells) => createObjectFromArray(headers, cells));
}

const execPromise = promisify(exec);

export const runReactSniffer = (pathToDir: string) =>
  execPromise(`npx reactsniffer ${pathToDir}`)
    .then(({ stdout }) => { 
      const tables = stdout.split('┌─────────┬');
      const table1String = '┌─────────┬' + tables[1].split('└─────────┴')[0] + '└─────────┴';
      const table2String = '┌─────────┬' + tables[2].split('└─────────┴')[0] + '└─────────┴';

      const table1Headers = ['id', 'Large File', 'LOC', 'N_Components', 'N_Functions', 'N_Imports'];
      const table2Headers = ['File', 'Component', 'LC', 'TP', 'IIC', 'FU', 'DOM', 'JSX', 'UC', 'PIS'];

      const table1 = parseTable<Table1Row>(table1String, table1Headers);
      const table2 = parseTable<Table2Row>(table2String, table2Headers);

      return {
        table1,
        table2
      };
    })
    .catch(() => Promise.reject('No such file or directory.'));
