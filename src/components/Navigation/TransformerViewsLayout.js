import React, {Fragment, useCallback, useEffect, useLayoutEffect, useState} from 'react';
import * as Space from 'react-spaces';
import createEngine from '@projectstorm/react-diagrams'

import "./Navigation.css"
import SharpenerInfo from "../SharpenerInfo/SharpenerInfo";
import CreateGeneListContainer from "../../containers/CreateGeneListContainer";
import AsyncListenerContainer from "../../containers/AsyncListenerContainer";
import AsyncCreateListListenerContainer from "../../containers/AsyncCreateListListenerContainer";
import TransformerDraftContainer from "../../containers/TransformerDraftContainer";
import TransformerGraphContainer from "../../containers/TransformerGraphContainer";
import CollapsibleHeatMapContainer from "../../containers/CollapsibleHeatMapContainer";

import * as Spaces from "react-spaces"
import * as TabTab from "react-tabtab"
import * as customStyle from 'react-tabtab/lib/themes/bulma';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faProjectDiagram, faBorderAll } from '@fortawesome/free-solid-svg-icons'

import messages from "../../message-properties";
import {SelectionManager} from "../SelectionManager/SelectionManager";

function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}


const TransformerViewsLayout = () => {
    const [pivot, setPivot] = useState(true);
    const onChange = useCallback(
        e => setPivot(e.value), []);

    const [width, height] = useWindowSize();
    const [engine, setEngine] = useState(createEngine());
    const setEngineCallback = useCallback((newEngine) => {
        console.log("prev engine callback", engine);
        console.log("new engine callback", newEngine);
        setEngine(newEngine);
    }, []);

    return (
        <Fragment>
            {/*<button onClick={() => setPivot(!pivot)}>Pivot</button>*/}
            <Spaces.Fixed height={ height }
                          trackSize>
            {/*{ pivot ?*/}
                <>

                    <Spaces.LeftResizable size={"35%"} maxWidth={"35%"} className={"left-segment downshift gutter"}>
                        <span>
                            <h5 className={"info-header"}>{messages.header.create}</h5>
                            <SharpenerInfo description={messages.tooltip.create}/>
                            <AsyncCreateListListenerContainer />
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
                        <br/>
                        <SelectionManager />
                    </Spaces.LeftResizable>

                    <Space.Fill className={"top-segment gutter"}>
                        <TabTab.Tabs
                            className={"gene_list_views"}
                            customStyle={customStyle}
                            showArrowButton={false}
                        >
                            <TabTab.TabList>
                                <TabTab.Tab
                                    name={"tab-graph"}
                                    onClick = {() => {
                                        setPivot(false)
                                    }}
                                >
                                    <div key={pivot}
                                         // className={pivot ? "underline" : ''}
                                        onClick = {() => {
                                            setPivot(true)
                                        }}>
                                    <FontAwesomeIcon
                                        icon={faProjectDiagram}/>
                                    </div>
                                </TabTab.Tab>
                                <TabTab.Tab
                                    name={"tab-pivot"}
                                    onClick = {() => {
                                        setPivot(true)
                                    }}>
                                    <div key={pivot}
                                        // className={!pivot ? "underline" : ''}
                                        >
                                        <FontAwesomeIcon
                                            icon={faBorderAll}/>
                                    </div>
                                </TabTab.Tab>
                            </TabTab.TabList>
                            <TabTab.PanelList>
                                <TabTab.Panel>
                                    <Spaces.Fixed height={ height * 0.85 }
                                                  trackSize>
                                        <TransformerGraphContainer engine={engine} setEngine={setEngineCallback}/>
                                    </Spaces.Fixed>
                                </TabTab.Panel>
                                <TabTab.Panel>
                                    <Spaces.Fixed height={ height * 0.85 }
                                                  trackSize>
                                        <CollapsibleHeatMapContainer/>
                                    </Spaces.Fixed>
                                </TabTab.Panel>
                            </TabTab.PanelList>
                        </TabTab.Tabs>
                </Space.Fill>

                </>
            </Spaces.Fixed>



        </Fragment>
    )
}

export default TransformerViewsLayout;