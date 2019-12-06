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

const TransformerViewsLayout = () => {
    return (
        <Fragment>

                <div className={"container"}>

                    <div className={"floatLeft"} style={{height: window.innerHeight, overflow: "scroll"}}>
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
                    </div>

                    <div className={"floatRight"} style={{height: window.innerHeight}}>
                        <TransformerGraphContainer />
                    </div>

                </div>

            <div style={{
                marginRight: "auto",
                marginLeft: "auto",
                border: "1 grey"
            }}>
                {/*<h5 className={"info-header"}>Gene List Pivot</h5>*/}
                {/*<SharpenerInfo description={'Compare the contents of several selected gene lists through a membership matrix.'}/>*/}
                <Space.Fixed height={ window.innerHeight } trackSize>
                    <Space.Info>
                        {info => <CollapsibleHeatMapContainer size={info} /> }
                    </Space.Info>
                </Space.Fixed>
            </div>


        </Fragment>
    )
}

export default TransformerViewsLayout;