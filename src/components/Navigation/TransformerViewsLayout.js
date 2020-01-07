import React, {Fragment, useEffect, useLayoutEffect, useState} from 'react';
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
    const [width, height] = useWindowSize();

    return (
        <Fragment>
            {/*<button onClick={() => setPivot(!pivot)}>Pivot</button>*/}
            <Spaces.Fixed height={ height }
                          trackSize>
            {/*{ pivot ?*/}
                <>

                    <Spaces.LeftResizable size={"35%"} maxWidth={"35%"} className={"left-segment gutter"}>

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

                    <Space.Fill className={"top-segment gutter"}>
                        <TransformerGraphContainer />
                    </Space.Fill>

                </>
            </Spaces.Fixed>

             {/*:*/}
                <Spaces.Fixed height={ height }
                              trackSize>
                    <CollapsibleHeatMapContainer/>
                </Spaces.Fixed>

                {/*}*/}
        </Fragment>
    )
}

export default TransformerViewsLayout;