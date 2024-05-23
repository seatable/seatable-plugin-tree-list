// MAKE HERE YOUR CUSTOM UTILS

import { SelectOption } from '../template-utils/interfaces/PluginSettings.interface';
import {
  Table,
  TableArray,
  TableColumn,
  TableRow,
} from '../template-utils/interfaces/Table.interface';
import { LINK_TYPE } from './constants';
import { getTableById } from 'dtable-utils';

export function findFirstLevelTables(tables: TableArray): TableArray {
  return tables.filter((table) => {
    return table.columns.some((column) => column.type === LINK_TYPE.link);
  });
}
export function findSecondLevelTables(
  allTables: TableArray,
  firsLevelSelectedOption: SelectOption
): TableArray {
  // Finding the first level table
  const firstLevelTable = allTables.find((t) => t._id === firsLevelSelectedOption.value);

  // Finding the columns with link type
  const columnsWithLinkType = firstLevelTable?.columns.filter(
    (column: TableColumn) => column.type === LINK_TYPE.link
  );

  // Finding the second level tables ids
  const columnsWithLinkTypeIds: string[] = [];
  columnsWithLinkType?.filter((c) =>
    columnsWithLinkTypeIds.push(
      c.data.table_id !== firstLevelTable?._id ? c.data.table_id : c.data.other_table_id
    )
  );

  // Returning the second level tables
  return allTables.filter((t) => columnsWithLinkTypeIds.includes(t._id));
}

export function getRowsByTableId(tId: string, allTables: TableArray) {
  const table = allTables.find((t) => t._id === tId);
  return table?.rows;
}
export function getColumnsByTableId(tId: string, allTables: TableArray) {
  const table = allTables.find((t) => t._id === tId);
  return table?.columns;
}

const getLinkColumns = (columns: TableColumn[]) => {
  return columns.filter((column) => column.type === 'link');
};

// // linkCol is the selected column that links to another table e.g PROJECTS or MILESTONES
export const temporaryFunctionName = (
  tableId: string,
  rows: TableRow[],
  allTables: TableArray,
  secondLevelId: string,
  thirdLevelId?: string,
  keyName?: string
) => {
  const table = allTables.find((t) => t._id === tableId);
  const linkedRows = window.dtableSDK.getTableLinkRows(rows, table);
  let allRowsInAllTables: any[] = [];
  allTables.map((t: Table) => {
    allRowsInAllTables.push(t.rows);
  });
  allRowsInAllTables = allRowsInAllTables.flat();
  const linkedColumns = getLinkColumns(table?.columns || []);
  const secondLevelKey = linkedColumns.find((c) => c.data.other_table_id === secondLevelId)?.key;

  const finalResult: any[] = [];

  rows.map((r: any) => {
    const _ids = linkedRows[r._id][secondLevelKey!];
    let secondLevelRows = [];
    for (const i in _ids) {
      const linked_row = allRowsInAllTables.find((r: any) => r._id === _ids[i]);
      secondLevelRows.push(linked_row);
    }
    if (thirdLevelId) {
      secondLevelRows = temporaryFunctionName(
        secondLevelId,
        secondLevelRows,
        allTables,
        thirdLevelId,
        undefined,
        'thirdLevelRows'
      );
    }

    finalResult.push({ ...r, [keyName ? keyName : 'secondLevelRows']: secondLevelRows });
  });
  console.log({ finalResult });
  return finalResult;
};
