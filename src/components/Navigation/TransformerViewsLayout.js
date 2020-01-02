import React, {Fragment, useEffect, useState} from 'react';
import * as Space from 'react-spaces';

import "./Navigation.css"
import SharpenerInfo from "../SharpenerInfo/SharpenerInfo";
import CreateGeneListContainer from "../../containers/CreateGeneListContainer";
import AsyncListenerContainer from "../../containers/AsyncListenerContainer";
import TransformerDraftContainer from "../../containers/TransformerDraftContainer";
import TransformerGraphContainer from "../../containers/TransformerGraphContainer";
import CollapsibleHeatMapContainer from "../../containers/CollapsibleHeatMapContainer";

import * as Spaces from "react-spaces"

import messages from "../../message-properties";

const TransformerViewsLayout = () => {
    return (
        <Fragment>

             <Spaces.Fixed height={ window.innerHeight }
                           trackSize>

                    <Spaces.LeftResizable size={"35%"} maxWidth={"35%"} className={"gutter"}>

                        <span>
                            <h5 className={"info-header"}>{messages.header.create}</h5>
                            <SharpenerInfo description={messages.tooltip.create}/>
                        </span>
                        <CreateGeneListContainer />

                        <br/>

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <span>
                                <h5 className={"info-header"}> { messages.header.transform } </h5>
                                <SharpenerInfo description={ messages.tooltip.transform }/>
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