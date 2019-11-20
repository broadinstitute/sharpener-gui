import React from 'react';
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

function App() {
    return (
        <div>
            <Space.ViewPort>
                <Space.Fill scrollable={true} trackSize>
                    <Space.Fixed height={window.innerHeight}>
                        <Space.Top size={"100%"}>
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

                            <Space.Fill className={"padded panel right back "}>

                                    <Space.TopResizable size={"45%"} className={"padded panel "}>
                                        <TransformerGraphContainer />
                                    </Space.TopResizable>

                                    <Space.Fill className={"panel bottom"} scrollable={true}>
                                            <GeneTableContainer className={"padded panel"} />

                                    </Space.Fill>

                            </Space.Fill>
                        </Space.Top>
                    </Space.Fixed>
                </Space.Fill>
            </Space.ViewPort>
        </div>
    );
}

export default App;
