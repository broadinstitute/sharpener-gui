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
import GeneListViews from "./components/Navigation/GeneListViews";
import GeneListViewsContainer from "./containers/GeneListViewsContainer";

function App() {
    const [pivot, setPivot] = useState(false);
    return (
        <div>
            <Space.ViewPort>
                <Space.LeftResizable size={"60%"} scrollable>
                    <Space.TopResizable size={"100%"}>
                        <Space.LeftResizable size={"370px"} scrollable>
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
                            <TransformerDraftContainer />
                        </Space.LeftResizable>
                        <Space.Fill trackSize scrollable>
                            <TransformerGraphContainer />
                            <h5 className={"info-header"}>Gene List Pivot</h5>
                            <SharpenerInfo description={'Compare the contents of several selected gene lists through a membership matrix.'}/>
                            <Space.Info>
                                {info =>
                                    <ClusterGramContainer size={info}/>}
                            </Space.Info>
                        </Space.Fill>
                    </Space.TopResizable>
                {/*<Space.Fill trackSize>*/}
                {/*    <h5 className={"info-header"}>Gene List Pivot</h5>*/}
                {/*    <SharpenerInfo description={'Compare the contents of several selected gene lists through a membership matrix.'}/>*/}
                {/*    <Space.Info>*/}
                {/*        {info =>*/}
                {/*            <ClusterGramContainer size={info}/>}*/}
                {/*    </Space.Info>*/}
                {/*</Space.Fill>*/}

                </Space.LeftResizable>
                <Space.Fill>
                    <GeneTableContainer/>
                </Space.Fill>
            </Space.ViewPort>
        </div>
    );
}

export default App;
