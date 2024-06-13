import { ExpandableItemProps, levelRowInfo } from '@/utils/custom-utils/interfaces/CustomPlugin';
import { getTableById, getRowsByIds, getLinkCellValue } from 'dtable-utils';
import React, { useEffect, useState } from 'react';
import HeaderRow from '../HeaderRow';
import { Table, TableView } from '@/utils/template-utils/interfaces/Table.interface';
import { expandTheItem, getLevelSelectionAndTable } from '../../../utils/custom-utils/utils';
import styles from '../../../styles/custom-styles/CustomPlugin.module.scss';
import stylesFormatter from '../../../styles/template-styles/formatter/Formatter.module.scss';
import pluginContext from '../../../plugin-context';
import Formatter from '../../../components/template-components/Elements/Formatter';
import { SlArrowDown, SlArrowRight } from 'react-icons/sl';

const ExpandableItem: React.FC<ExpandableItemProps> = ({
  item,
  level,
  allTables,
  levelSelections,
  handleItemClick,
  expandedRowsInfo,
  expandedHasChanged,
  rowsEmptyArray,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>();
  const { levelTable, levelRows } = getLevelSelectionAndTable(level, allTables, levelSelections);
  const [rowsEmptyArrayItemLevel, setRowsEmptyArrayItemLevel] = useState<boolean>(false);

  const rows = item[levelRows];
  const isClickable = level !== 3 && rows?.length !== 0 && item[levelRows] !== undefined;
  const currentTable = allTables.find((table) => table.name === item._name);

  let viewObj: TableView | undefined;
  const view = (): TableView | undefined => {
    if (currentTable && currentTable.views && currentTable.views.length > 0) {
      viewObj = currentTable.views[0];
      return viewObj;
    } else {
      viewObj = undefined;
      return viewObj;
    }
  };

  // Function to get the formula rows of the table
  const getTableFormulaRows = (table: Table, view: TableView) => {
    const rows = window.dtableSDK.getViewRows(view, table);
    return window.dtableSDK.getTableFormulaResults(table, rows);
  };

  // Function to get the link cell value
  const _getLinkCellValue = (linkId: string, table1Id: string, table2Id: string, rowId: string) => {
    const links = window.dtableSDK.getLinks();
    return getLinkCellValue(links, linkId, table1Id, table2Id, rowId);
  };

  // Function to get the rows by ID
  const getRowsByID = (tableId: string, rowIds: any) => {
    const table = _getTableById(tableId);
    return getRowsByIds(table, rowIds);
  };

  // Function to get the table by ID
  const _getTableById = (table_id: string) => {
    const tables = window.dtableSDK.getTables();
    return getTableById(tables, table_id);
  };

  // Function to get the user common info
  const getUserCommonInfo = (email: string, avatar_size: any) => {
    pluginContext.getUserCommonInfo(email, avatar_size);
  };

  // Function to get the media URL
  const getMediaUrl = () => {
    return pluginContext.getSetting('mediaUrl');
  };

  // Get the formula rows of the table
  let formulaRowsObj: any;
  const formulaRows = () => {
    if (levelTable) {
      formulaRowsObj = getTableFormulaRows(levelTable, view as unknown as TableView);
      return formulaRowsObj;
    }
  };

  // Get the collaborators
  const collaborators = window.app.state.collaborators;

  useEffect(() => {
    const t = expandTheItem(expandedRowsInfo, item._id);
    setIsExpanded(t);
  }, [expandedHasChanged, expandedRowsInfo]);

  const missingCollapseBtn = (isClickable: boolean) => {
    if (!isClickable) {
      return { cursor: 'default', paddingLeft: 24 };
    }
  };

  const levelStyleRows = (level: number) => {
    if (level === 2) {
      return { paddingLeft: 24 };
    }
  };

  return (
    <div className={styles.custom_expandableItem_rows} style={levelStyleRows(level)}>
      <div className={styles.custom_expandableItem} style={missingCollapseBtn(isClickable)}>
        {isClickable && (
          <button
            className={styles.custom_expandableItem_collapse_btn}
            onClick={
              isClickable
                ? () => {
                    handleItemClick({ '0000': item['0000'], _id: item._id, expanded: !isExpanded });
                  }
                : undefined
            }>
            {(isExpanded && <SlArrowDown size={10} />) || <SlArrowRight size={10} />}
          </button>
        )}
        <p className={styles.custom_expandableItem_name_col}>{item['0000']}</p>
        {currentTable?.columns
          .filter((c) => c.name.toLowerCase() !== 'name')
          .map((column) => (
            <div key={column.key} className={stylesFormatter.formatter_cell}>
              <Formatter
                column={column}
                row={item}
                table={levelTable}
                displayColumnName={false}
                getLinkCellValue={_getLinkCellValue}
                getTableById={_getTableById}
                getRowsByID={getRowsByID}
                selectedView={viewObj}
                collaborators={collaborators}
                getUserCommonInfo={getUserCommonInfo}
                getMediaUrl={getMediaUrl}
                formulaRows={formulaRows()}
              />
            </div>
          ))}
      </div>{' '}
      {isExpanded && (
        <div className={styles.custom_expandableItem_rows}>
          {!rowsEmptyArray && (
            <HeaderRow
              columns={levelTable?.columns}
              level={level + 1}
              tableName={levelTable?.name}
            />
          )}
          {rows?.map((i: levelRowInfo) => (
            <ExpandableItem
              key={i._id}
              item={i}
              expandedRowsInfo={expandedRowsInfo}
              handleItemClick={handleItemClick}
              allTables={allTables}
              levelSelections={levelSelections}
              level={level + 1}
              expandedHasChanged={expandedHasChanged}
              rowsEmptyArray={rowsEmptyArray}
            />
          ))}
          {!rowsEmptyArray && (
            <p className={styles.custom_p}>+ add {levelTable?.name.toLowerCase()}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpandableItem;
