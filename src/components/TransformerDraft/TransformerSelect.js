import React, {Fragment, useEffect, useState} from 'react';
import Select, {components} from "react-select";
import {useDispatch, useSelector} from 'react-redux'
import {ADD_TRANSFORMER, REMOVE_TRANSFORMER} from "../../actions";
import * as R from 'rambda'

import messages from "../../message-properties";

const TransformerSelect = ({transformers}) => {
    const dispatch = useDispatch();
    const [ options, setOptions ] = useState([]);
    const [ selectedOptions, setSelectedOptions ] = useState([]);
    useEffect(() => {
        setOptions(transformerOptions(transformers))
    }, [transformers]);

    return (
        <Fragment key={"transformer-select"}>
            <Select placeholder={ messages.select.transform }
                options={ options }
                components={{ Option }}
                styles={{
                    placeholder: base => ({
                        ...base,
                        fontSize: 14
                    }),
                    option: base => ({
                        ...base,
                        height: '100%',
                        fontSize: 16
                    }),
                }}
                onChange={ (_, changeEvent) => {
                    console.log(_, changeEvent);
                    switch (changeEvent.action) {
                        case "select-option":
                            dispatch({ type: ADD_TRANSFORMER, payload: { name: _.value } })
                            return _.value
                        case "remove-value":
                            dispatch({ type: REMOVE_TRANSFORMER, payload: { name: _.value } });
                            return
                        case "clear":
                            dispatch({ type: REMOVE_TRANSFORMER, payload: { name: _.value } });
                            return
                        default:
                            return }
                    }
                }
                isClearable={false}
            />
            {/*<Select placeholder={ "Choose a transformer to stage" }*/}
            {/*        options={ options }*/}
            {/*        value={ selectedOptions }*/}
            {/*        components={{ Option }}*/}
            {/*        styles={{*/}
            {/*            placeholder: base => ({*/}
            {/*                ...base,*/}
            {/*                fontSize: 14*/}
            {/*            }),*/}
            {/*            option: base => ({*/}
            {/*                ...base,*/}
            {/*                height: '100%',*/}
            {/*                fontSize: 16*/}
            {/*            }),*/}
            {/*        }}*/}
            {/*        onChange={*/}
            {/*            // (_, changeEvent) => {*/}
            {/*            // switch (changeEvent.action) {*/}
            {/*            //     case "select-option":*/}
            {/*            //         return R.compose(dispatch({ type: ADD_TRANSFORMER, payload: { name: changeEvent.option.value } }),*/}
            {/*            //             changeEvent.option.value*/}
            {/*            //         );  // block options from being removed from the selection*/}
            {/*            //     case "remove-value":*/}
            {/*            //         return dispatch({ type: REMOVE_TRANSFORMER, payload: { name: changeEvent.removedValue.value } });*/}
            {/*            //     default:*/}
            {/*            //         return }*/}
            {/*            // }*/}
            {/*        }*/}
            {/*/>*/}
        </Fragment>
    )
};

const transformerOptions = (transformers) => {
    const transformerGroups = groupBy(transformers, "function");

    const mapping = {
        "producer": 0,
        "expander": 1,
        "filter": 2,
        "aggregator": 3
    };
    const ordering = (a, b) => {
        return (mapping[a] > mapping[b]) - (mapping[b] > mapping[a])
    };

    let orderedTransformerGroups = {};
    Object.keys(transformerGroups).sort(ordering).forEach(function(key) {
        orderedTransformerGroups[key] = transformerGroups[key];
    });

    return Object.entries(orderedTransformerGroups).map((transformerGrouping) => ({
        label: transformerGrouping[0]+"s",
        options: transformerGrouping[1].map(transformer => ({
            label: transformer.name,
            value: transformer.name
        }))
    }));
};

const groupBy = function(data, key) {
    return data.reduce(function(storage, item) {
        (storage[item[key]] = storage[item[key]] || []).push(item);
        return storage;
    }, {});
};

const Option = props => {
    const transformersByName = useSelector(state => state.transformers.transformersNormalized.byName)
    return (
            <>
                <components.Option
                    {...props}
                />

                { props.isFocused ?
                    <>
                        <div className={"transformerProperties"}>
                            {/*{Object.keys(transformersByName[props.data.value].properties).map(property => transformersByName[props.data.value].properties[property] !== null ?*/}
                            {/*    <div>*/}
                            {/*        {property}: {transformersByName[props.data.value].properties[property]}*/}
                            {/*    </div>*/}
                            {/*: <></>)}*/}
                            {transformersByName[props.data.value].description}
                        </div>
                    </>
                :   <></> }

            </>
    )
}

export default TransformerSelect;
