import React, {Fragment, useEffect, useState} from 'react';
import * as Space from 'react-spaces';

import "./Navigation.css"
import SharpenerInfo from "../SharpenerInfo/SharpenerInfo";
import CreateGeneListContainer from "../../containers/CreateGeneListContainer";
import AsyncListenerContainer from "../../containers/AsyncListenerContainer";
import TransformerDraftContainer from "../../containers/TransformerDraftContainer";
import TransformerGraphContainer from "../../containers/TransformerGraphContainer";
import ClusterGramContainer from "../../containers/ClusterGramContainer";
import ReactCollapsibleHeatMap from "../CollapsibleHeatMap/ReactCollapsibleHeatMap";
import CollapsibleHeatMapContainer from "../../containers/CollapsibleHeatMapContainer";

import * as Spaces from "react-spaces"

const TransformerViewsLayout = () => {
    return (
        <Fragment>

             <Spaces.Fixed height={ window.innerHeight }
                           trackSize>

                    <Spaces.LeftResizable size={"35%"} maxWidth={"35%"} className={"gutter"}>

                        <span>
                            <h5 className={"info-header"}>Create Gene List</h5>
                            <SharpenerInfo description={"Create a Gene List by submitting gene symbols through the input box, or by uploading a table in CSV format."}/>
                        </span>
                        <CreateGeneListContainer />

                        <br/>

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <span>
                                <h5 className={"info-header"}>Transformer Draft</h5>
                                <SharpenerInfo description={"Query the Sharpener by staging Transformers before submitting them. You can modify the value of parameters, or use their defaults."}/>
                            </span>
                            <AsyncListenerContainer />
                        </div>
                        <TransformerDraftContainer/>

                    </Spaces.LeftResizable>

                    <Space.Fill className={"gutter"}>
                        <TransformerGraphContainer />
                    </Space.Fill>

                </Spaces.Fixed>

                <Space.Fixed height={ window.innerHeight } trackSize>

                    <CollapsibleHeatMapContainer />

                </Space.Fixed>

        </Fragment>
    )
}

export default TransformerViewsLayout;