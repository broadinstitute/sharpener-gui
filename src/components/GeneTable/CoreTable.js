// import React, {Fragment, useEffect} from "react"
// import styled from "@emotion/styled";
// import {useTable, usePagination, useSortBy} from "react-table";
//
// // import * as Proptypes from 'prop-types';
// import { addActions, actions } from 'react-table/dist/index';
// import Select, {components} from "react-select";
//
// const DefaultHiddenColumns = ["entrez","hgnc","mim","ensembl","mygene_info"];
// export const TableStyles = styled.div`
//   table {
//     border-spacing: 0;
//     border: 1px solid black;
//
//     tr {
//       :last-child {
//         td {
//           border-bottom: 0;
//         }
//       }
//     }
//
//     th,
//     td {
//       margin: 0;
//       padding: 0.5rem;
//       border-bottom: 1px solid black;
//       border-right: 1px solid black;
//
//       :last-child {
//         border-right: 0;
//       }
//     }
//   }
// `;
//
//
// function Table({ columns, data }) {
//     // Use the state and functions returned from useTable to build your UI
//     const {
//         getTableProps,
//         getTableBodyProps,
//         headerGroups,
//         rows,
//         prepareRow,
//
//         page, // Instead of using 'rows', we'll use page,
//         // which has only the rows for the active page
//
//         // The rest of these things are super handy, too ;)
//         canPreviousPage,
//         canNextPage,
//         pageOptions,
//         pageCount,
//         gotoPage,
//         nextPage,
//         previousPage,
//         setPageSize,
//         state: { pageIndex, pageSize },
//
//         setColumnVisibility
//     } = useTable(
//         {
//             columns,
//             data,
//             initialState: { pageIndex: 1 },
//         },
//         useColumnVisibility,
//         useSortBy,
//         usePagination);
//
//     let geneTableColumnOptions;
//     geneTableColumnOptions =
//         headerGroups.map(headerGroup => (headerGroup.headers.map(column => column)))[0]
//             .map(column => ( { value: column.accessor, label: column.Header, toggleColumnVisibility: column.toggleColumnVisibility, setColumnVisibility: column.setColumnVisibility } ) );
//
//     // defaultGeneTableColumnOptions = headerGroups[0].headers[0].columns
//     //     .map(column => ( { value: column.accessor, label: column.Header, toggleColumnVisibility: column.toggleColumnVisibility, setColumnVisibility: column.setColumnVisibility } ) );
//     //
//     // Render the UI for your table
//     return (
//         <>
//
//             <Select
//                 components={{ MultiValueRemove }}
//                 placeholder={ "Hide Columns..." }
//                 isMulti
//                 name="columns"
//                 options={ geneTableColumnOptions }
//                 defaultValue={ [] }
//                 className="basic-multi-select"
//                 classNamePrefix="select"
//                 isClearable={false}
//                 backspaceRemovesValue={false} // TODO
//                 onChange={ (args, action) => {
//                     if (action.action === "select-option") {
//                         action.option.setColumnVisibility(false);
//                     } else if (action.action === "remove-value" || action.action === "pop-value" ) {
//                         action.removedValue.setColumnVisibility(true);
//                     }
//                 } }/>
//
//
//
//
//
//
//
//
//
//             <table {...getTableProps()}>
//                 <thead>
//                 {headerGroups.map(headerGroup => (
//                     <tr {...headerGroup.getHeaderGroupProps()}>
//                         {headerGroup.headers.map(column => (
//                             // Add the sorting props to control sorting. For this example
//                             // we can add them into the header props
//                             <th {...column.getHeaderProps(column.getSortByToggleProps())}>
//                                 {column.render('Header')}
//                                 {/* Add a sort direction indicator */}
//                                 <span>
//                                     {column.isSorted
//                                         ? column.isSortedDesc
//                                             ? ' 🔽'
//                                             : ' 🔼'
//                                         : ''}
//                                 </span>
//                                 <button onClick={()=>column.setColumnVisibility(false)}>
//                                     toggle
//                                 </button>
//                             </th>
//                         ))}
//                     </tr>
//                 ))}
//                 </thead>
//
//                 <tbody {...getTableBodyProps()}>
//                 {page.map(
//                     (row, i) =>
//                         prepareRow(row) || (
//                             <tr {...row.getRowProps()}>
//                                 {row.cells.map(cell => {
//                                     return (
//                                         <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
//                                     )
//                                 })}
//                             </tr>
//                         )
//                 )}
//                 </tbody>
//             </table>
//
//             {/*
//             Pagination can be built however you'd like.
//             This is just a very basic UI implementation:
//             */}
//             <div className="pagination">
//                 <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
//                     {'<<'}
//                 </button>{' '}
//                 <button onClick={() => previousPage()} disabled={!canPreviousPage}>
//                     {'<'}
//                 </button>{' '}
//                 <button onClick={() => nextPage()} disabled={!canNextPage}>
//                     {'>'}
//                 </button>{' '}
//                 <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
//                     {'>>'}
//                 </button>{' '}
//                 <span>
//               Page{' '}
//                     <strong>
//                 {pageIndex + 1} of {pageOptions.length}
//               </strong>{' '}
//             </span>
//                 <span>
//               | Go to page:{' '}
//                     <input
//                         type="number"
//                         defaultValue={pageIndex + 1}
//                         onChange={e => {
//                             const page = e.target.value ? Number(e.target.value) - 1 : 0
//                             gotoPage(page)
//                         }}
//                         style={{ width: '100px' }}
//                     />
//             </span>{' '}
//                 <select
//                     value={pageSize}
//                     onChange={e => {
//                         setPageSize(Number(e.target.value))
//                     }}
//                 >
//                     {[10, 20, 30, 40, 50].map(pageSize => (
//                         <option key={pageSize} value={pageSize}>
//                             Show {pageSize}
//                         </option>
//                     ))}
//                 </select>
//             </div>
//
//     </>
//     )
// }
//
// export default Table;
//
// const MultiValueRemove = props => {
//     return (
//         <components.MultiValueRemove
//             {...props}>
//             +
//         </components.MultiValueRemove>
//     );
// };
//
// // custom hooks
// addActions('setColumnVisibility');
// export const useColumnVisibility = (hooks) => {
//     hooks.useMain.push(useMain);
// };
//
// useColumnVisibility.pluginName = 'useColumnVisibility';
//
// function useMain(instance) {
//     // PropTypes.checkPropTypes(propTypes, instance, 'property', 'useColumnVisibility');
//
//     const { flatHeaders, setState } = instance;
//
//     const setColumnVisibility = React.useCallback(() => {
//         return setState((old) => {
//             return {
//                 ...old,
//                 columnOrder: [...old.columnOrder] // FixMe: dirty way
//             };
//         }, actions.setColumnVisibility);
//     }, [setState]);
//
//     flatHeaders.forEach((column) => {
//         column.setColumnVisibility = (show) => {
//             column.show = show; // FixMe: i should not be mutated
//             setColumnVisibility();
//         };
//
//         column.toggleColumnVisibility = (flag) => {
//             let setValue = column.show === flag ? !flag : flag;
//             column.show = setValue;
//             setColumnVisibility();
//         };
//     });
//
//     return {
//         ...instance,
//     };
// }
