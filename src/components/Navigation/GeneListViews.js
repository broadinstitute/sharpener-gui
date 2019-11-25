import React, {Fragment, useEffect, useState} from 'react';
import * as Space from 'react-spaces';
import GeneTableContainer from "../../containers/GeneTableContainer";
import ClusterGramContainer from "../../containers/ClusterGramContainer";

import "./Navigation.css"
import SharpenerInfo from "../SharpenerInfo/SharpenerInfo";

const GeneListViews = ({geneListIds, selectedGeneListIds}) => {
    const [selectedGeneListIdsLength, setSelectedGeneListIdsLength] = useState(selectedGeneListIds.length);
    useEffect(() => {
        setSelectedGeneListIdsLength(selectedGeneListIds.length)
    }, [selectedGeneListIds]);

    return (
        <Fragment key={"view-"+selectedGeneListIdsLength}>
            <Space.RightResizable key={"view-table-nopivot"} size={"40%"} >
                <GeneTableContainer />
            </Space.RightResizable>
        </Fragment>
    )
}

export default GeneListViews;
