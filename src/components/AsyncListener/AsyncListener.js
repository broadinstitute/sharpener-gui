import ReactTooltip from "react-tooltip";
import {Spinner} from "reactstrap";
import React from "react";

export const AsyncListener = ({ isFetching, transactionsFetching }) => (
    <>
        {isFetching ? <>
            <ReactTooltip id={'async-load'} place={"bottom"}>
                Loading queries...<br/>
                <ul>
                    {transactionsFetching.map(
                        fetchingTransactionName =>
                            <li>
                                {fetchingTransactionName}
                            </li>
                    )}
                </ul>
            </ReactTooltip>
            <Spinner size={"sm"} data-tip data-for={'async-load'}/>
        </>
        : <></> }
    </>
)
