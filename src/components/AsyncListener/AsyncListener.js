import ReactTooltip from "react-tooltip";
import {Spinner} from "reactstrap";
import React from "react";

export const AsyncListener = ({ isFetching, transactionsFetching, message }) => (
    <>
        {isFetching ? <>
            <ReactTooltip id={'async-load'} place={"bottom"}>
                {message ? message : "Loading queries..."}
                <br/>
                <ul>
                    {transactionsFetching ? transactionsFetching.map(
                        fetchingTransactionName =>
                            <li>
                                {fetchingTransactionName}
                            </li>
                    )
                    : null}
                </ul>
            </ReactTooltip>
            <Spinner size={"sm"} data-tip data-for={'async-load'}/>
        </>
        : <></> }
    </>
)
