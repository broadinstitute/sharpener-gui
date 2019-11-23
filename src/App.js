import React, {Fragment} from 'react';
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
import GeneListViews from "./components/Navigation/GeneListViews";
import GeneListViewsContainer from "./containers/GeneListViewsContainer";

function App() {
    return (
        <div>
            <Space.ViewPort>
                <Space.Fill scrollable>
                    <Space.Fixed height={window.innerHeight}>
                            <Space.LeftResizable size={"393px"} minimumSize={393} scrollable={true} className={"padded panel left"}>

                                <span>
                                    <h4 className={"info-header"}>Create Gene List</h4>
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
                                        <h4 className={"info-header"}>Transformer Draft</h4>
                                        <SharpenerInfo description={"Query the Sharpener by staging Transformers before submitting them. You can modify the value of parameters, or use their defaults."}/>
                                    </span>
                                    <AsyncListenerContainer />
                                </div>

                                <TransformerDraftContainer />
                            </Space.LeftResizable>

                            <Space.Fill className={"padded panel right back "} scrollable>

                                    <Space.TopResizable size={"40%"} className={"padded panel "}>
                                        <TransformerGraphContainer />
                                    </Space.TopResizable>

                                    <Space.Fill size={"60%"}>
                                        <GeneListViewsContainer />
                                    </Space.Fill>

                            </Space.Fill>
                    </Space.Fixed>
                </Space.Fill>
            </Space.ViewPort>
        </div>
    );
}

export default App;
