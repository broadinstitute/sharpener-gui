import React, {Fragment, useState} from 'react';
import * as Space from "react-spaces";
import SharpenerInfo from "./components/SharpenerInfo/SharpenerInfo";
import CreateGeneListContainer from "./containers/CreateGeneListContainer";
import TransformerDraftContainer from "./containers/TransformerDraftContainer";
import TransformerGraphContainer from "./containers/TransformerGraphContainer";
import GeneTableContainer from "./containers/GeneTableContainer";
import {AsyncListener} from "./components/AsyncListener/AsyncListener";
import AsyncListenerContainer from "./containers/AsyncListenerContainer";
import ClusterGram from "./components/GeneListPivot/ClusterGram";
import ClusterGramContainer from "./containers/ClusterGramContainer";
import {GenePivotNivo} from "./components/GeneListPivot/GenePivotNivo";
import GenePivotNivoContainer from "./containers/GenePivotNivoContainer";
import {SizeMe} from "react-sizeme";
import GeneListViewsLayout from "./components/Navigation/GeneListViewsLayout";
import GeneListViewsContainer from "./containers/GeneListViewsContainer";
import TransformerViewsLayout from "./components/Navigation/TransformerViewsLayout";
import ReactCollapsibleHeatMap from "./components/CollapsibleHeatMap/ReactCollapsibleHeatMap";

function App() {
    const [pivot, setPivot] = useState(false);
    return (
        <div>
            <Space.ViewPort>
                <Space.LeftResizable size={"63%"}
                                     className={"gutter"}
                                     scrollable>
                    <TransformerViewsLayout />
                </Space.LeftResizable>
                <Space.Fill className={"gutter"}>
                    <Space.Top size={"100%"} className={"gutter"}>
                        <GeneTableContainer/>
                    </Space.Top>
                </Space.Fill>
            </Space.ViewPort>
        </div>
    );
}

export default App;
