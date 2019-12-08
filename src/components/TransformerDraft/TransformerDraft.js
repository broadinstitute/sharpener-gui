import React, {Fragment, useEffect} from "react";
import TransformerSelect from "./TransformerSelect";
import TransformerContainer from "../../containers/TransformerContainer";
import {useSelector} from "react-redux";

const TransformerDraft = ({transformers, selectedTransformers, fetchTransformers}) => {
    useEffect(() => {
        fetchTransformers()
    }, []);
    const primeState = useSelector(state => state.prime);
    return (
        typeof transformers != "undefined" &&
        transformers.length > 0 ?
            <div>
                <TransformerSelect
                    key={"transformer-select"}
                    transformers={transformers}/>
                {selectedTransformers ? selectedTransformers.map((selectedTransformer, index) =>
                        <TransformerContainer key={selectedTransformer}
                                              index={index}
                                              transformerName={selectedTransformer}/>
                )
                : <></>}
            </div>
        : <Fragment/>
    )
};

export default TransformerDraft;
