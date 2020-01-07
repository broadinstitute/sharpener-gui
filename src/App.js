import React from 'react';
import * as Space from "react-spaces";
import GeneTableContainer from "./containers/GeneTableContainer";
import TransformerViewsLayout from "./components/Navigation/TransformerViewsLayout";

function App() {
    return (
        <div>
            <Space.ViewPort>

                <Space.LeftResizable size={"63%"}
                                     className={"gutter"}
                                     scrollable>
                    <TransformerViewsLayout />
                </Space.LeftResizable>

                <Space.Fill className={"gutter"}>
                    <Space.Top size={"100%"} className={"right-segment gutter"} scrollable>
                        <GeneTableContainer/>
                    </Space.Top>
                </Space.Fill>

            </Space.ViewPort>
        </div>
    );
}

export default App;
