import React from "react"
import styled from "@emotion/styled"
import "./SharpenerInfo.css"
import Tooltip from "./Tooltip";

// TODO: size
const InfoSymbol = styled.div`
    display: inline-block;
    font-size: 0.725em;
    font-weight: bold;
    vertical-align: top;
    line-height: 1.6em;
    color: #777777;
    &:hover {
        color: #222222;
    }
`;

const SharpenerInfo = ({description, size, place="right"}) => {
    return (
        <div style={{display: "inline"}}>
            <Tooltip placement="top" trigger="click" tooltip={description}>
                <InfoSymbol size={size}>
                    ⓘ
                </InfoSymbol>
            </Tooltip>
        </div>
    )
};

export default SharpenerInfo;
