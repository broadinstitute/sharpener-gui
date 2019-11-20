import React from "react";
import styled from "@emotion/styled";
import {togglePivot} from "../../actions";

import {connect} from "react-redux";
const PivotSymbol = styled.div`
    display: inline-block;
    font-size: 1.35em;
    font-weight: bold;
    vertical-align: top;
    line-height: 1.165em;
    cursor: pointer;
    color: #777777;
    &:hover {
        color: #222222;
    }
    &:active {
        color: #777777;
    }
`;

const PivotNav = () => (
    <PivotSymbol onClick={() => togglePivot()}>
        ⟳
    </PivotSymbol>
);
export default PivotNav;
