import React, {Fragment, useEffect, useState} from 'react';
import * as Space from 'react-spaces';
import GeneTableContainer from "../../containers/GeneTableContainer";
import "./Navigation.css"
import SharpenerInfo from "../SharpenerInfo/SharpenerInfo";

const GeneListViewsLayout = ({geneListIds, selectedGeneListIds}) => {
    const [selectedGeneListIdsLength, setSelectedGeneListIdsLength] = useState(selectedGeneListIds.length);
    useEffect(() => {
        setSelectedGeneListIdsLength(selectedGeneListIds.length)
    }, [selectedGeneListIds]);

    return (
        <Fragment key={"view-"+selectedGeneListIdsLength}>
            <Space.RightResizable key={"view-table-nopivot"} size={"40%"} className={"gutter"}>
                <GeneTableContainer />
            </Space.RightResizable>
        </Fragment>
    )
}

export default GeneListViewsLayout;
