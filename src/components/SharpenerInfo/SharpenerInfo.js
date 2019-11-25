import React, {Fragment} from "react"
import styled from "@emotion/styled"
import ReactTooltip from 'react-tooltip'
import { FaInfo } from "react-icons/fa"
import hash from "js-hash-code";

import "./SharpenerInfo.css"

// TODO: size
const InfoSymbol = styled.div`
    display: inline-block;
    font-size: 1em;
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
            <ReactTooltip className={"info-tooltip"} id={hash(description)} type='dark' place={place} effect={"solid"}>
                <div className={"info-tooltip-content"}>{description}</div>
            </ReactTooltip>
            <InfoSymbol data-tip data-for={hash(description)} size={size}>
                ⓘ
            </InfoSymbol>
        </div>
    )
};

export default SharpenerInfo;
