import React, { Fragment } from 'react';
import {
    REMOVE_TRANSFORMER
} from "../../actions";
import {useDispatch, useSelector} from "react-redux";
import {Form, Field} from 'react-final-form'
import {Input, InputGroup, InputGroupAddon, Label, Tooltip} from "reactstrap";

import "./Transformer.css";

import Select from "react-select";
const SubmitMapping = {
    "producer": "Produce",
    "expander": "Expand",
    "filter": "Filter",
    "union": "Submit",
    "difference": "Submit",
    "aggregator": "Aggregate"
}

const Transformer = ({index, transformerName, fetchGeneListTransformation, fetchGeneListAggregation}) => {

    const dispatch = useDispatch();

    const queryTransformer = transformerName => transformerValues => fetchGeneListTransformation(transformerName, transformerValues);
    const queryAggregator = aggregatorOperation => aggregatorValues => fetchGeneListAggregation(aggregatorOperation, aggregatorValues);

    // TODO: simplify, create helpers for calculating names
    const transformerSelector = useSelector(state => state.transformers.transformersNormalized.byName);
    const transformerInfo = useSelector(state => state.transformers.transformers.filter(transformer => transformer.name === transformerName))[0];
    const geneListNameSelector = useSelector(state => state.app.transactionLedger.reduce((geneListIdsToName, transaction, index) => {
        const label = transformerSelector[transaction.query.name].label ? transformerSelector[transaction.query.name].label : "Custom";
        return Object.assign(geneListIdsToName, { [transaction.gene_list_id]: (index + 1) + " - " + label });
    }, {}));

    // technically functions for select options, may need to split apart for clarity
    const currentGeneListIds = useSelector(state => state.geneLists.Ids.map(geneListId => ({label: geneListNameSelector[geneListId], value: geneListId})));
    const deletedGeneListIds = useSelector(state => state.geneLists.deletedGeneLists);

    return (
        <Fragment key={index}>

            {/*<Card.Header className={"transformer-header"}>*/}
            {/*    <span id="transformer-title" className={"transformer-title"}>*/}
            {/*        <div style={{*/}
            {/*            display:"flex",*/}
            {/*            justifyContent: "flex-start",*/}
            {/*            alignItems: "center",*/}
            {/*        }}>*/}
            {/*        {transformerInfo.name}&nbsp;&nbsp;*/}
            {/*        <SharpenerInfo*/}

            {/*            description={transformerInfo.description}/>*/}
            {/*        </div>*/}
            {/*    </span>*/}
            {/*    <button*/}
            {/*        className="inset btn btn-group-s"*/}
            {/*        style={{*/}
            {/*            padding: 0*/}
            {/*        }}*/}
            {/*        onClick={*/}
            {/*            () => dispatch({*/}
            {/*                type: REMOVE_TRANSFORMER,*/}
            {/*                payload: {*/}
            {/*                    name: transformerName,*/}
            {/*                    index: index*/}
            {/*                }*/}
            {/*            })*/}
            {/*        }>*/}
            {/*        &#10799;*/}
            {/*    </button>*/}
            {/*</Card.Header>*/}

            {/*<Tooltip placement={"bottom"} target={"transformer-title"} className={"transformer-info"}>*/}
            {/*        {transformerInfo.description}*/}
            {/*</Tooltip>*/}

            <span className={"transformer-status"}>
                    {/*{isFetching}*/}
            </span>

            <div className={"transformer-body"}>

                <Form key={index}
                      onSubmit={
                            ["producer", "expander", "filter"].includes(transformerInfo.function) ? queryTransformer(transformerName)
                            : ["aggregator"].includes(transformerInfo.function) ? queryAggregator(transformerName)
                            : null
                      }
                      validate={ onValidate }
                      render={({ handleSubmit, form, values }) => {
                          return (
                            <form className={"transformerForm"}
                                  name={transformerName}
                                  onSubmit={handleSubmit}>

                                { ["expander", "filter"].includes(transformerInfo.function) ?
                                    <>
                                        <Label className={"parameterLabel"} for={ "single-gene-list-input"+"-field" }>{ "Input Gene List" }</Label>
                                        <Field name={ "gene_list_id" }
                                       component={"select"}
                                       type={"text"}
                                       className={ !["expander", "filter"].includes(transformerInfo.function) ? 'hidden' : '' + ' custom-select'}>
                                            <option value="" disabled selected hidden>
                                                { currentGeneListIds.filter(geneListItem => !deletedGeneListIds.includes(geneListItem.value)).length > 0 ?
                                                    "Choose gene list to transform"
                                                :   "No previous gene lists"}
                                            </option>
                                            {currentGeneListIds.filter(geneListItem => !deletedGeneListIds.includes(geneListItem.value))
                                                .map(geneListIdOption =>
                                                    <option value={geneListIdOption.value}>
                                                        {geneListIdOption.label}
                                                    </option>)}
                                        </Field>
                                    </>
                                : ["aggregator"].includes(transformerInfo.function) ?
                                        <>
                                            <Label className={"parameterLabel"} for={ "multiple-gene-list-input"+"-field" }>{ "Input Gene Lists" }</Label>
                                            <Field name={ "gene_list_ids" }
                                               parse={ selectedOptions => {
                                                   if (!selectedOptions) return selectedOptions;
                                                   // selectedOptions are the current values of the input
                                                   return selectedOptions.map(selectedOption => selectedOption.value)
                                               }}
                                               format={ value => {
                                                   if (!value) return value;
                                                   return currentGeneListIds.filter(geneListItem => !deletedGeneListIds.includes(geneListItem.value))
                                                       .filter(geneListItem => value.includes(geneListItem.value));
                                               }}
                                            >
                                                {props => (
                                                    <Select
                                                        isMulti
                                                        {...props.input}
                                                        placeholder={currentGeneListIds.filter(geneListItem => !deletedGeneListIds.includes(geneListItem.value)).length > 0 ? "Choose gene list to transform" : "No previous gene lists" }
                                                        options={currentGeneListIds.filter(geneListItem => !deletedGeneListIds.includes(geneListItem.value))}
                                                    />
                                                )}
                                            </Field>
                                        </>
                                : null }

                                {/* Transformer Parameters */}
                                { transformerInfo.parameters.map(
                                    parameter =>
                                        // choose the kind of component based on available data
                                        parameter.allowed_values ?
                                            <>
                                                <Label className={"parameterLabel"} for={ parameter.name+"-field" }>{ parameter.name }</Label>
                                                <Field name={ parameter.name }
                                                       id={ parameter.name+"-field" }
                                                       component={"select"}
                                                       className={"custom-select"}
                                                       {...inputProps(parameter)} >
                                                    { parameter.allowed_values.map(allowed_value =>
                                                        <option value={allowed_value}>
                                                            {allowed_value}
                                                        </option>) }
                                                </Field>
                                            </>
                                        :   <>
                                                <Label className={"parameterLabel"} for={ parameter.name+"-field" }>{ parameter.name }</Label>
                                                <Field name={ parameter.name }
                                                       id={ parameter.name+"-field" }
                                                       component={"input"}
                                                       className={"form-control"}
                                                       {...inputProps(parameter)} />
                                            </>
                                ) }

                                {/* Local Transformer Submission */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    paddingTop: "7px"
                                }}>

                                    <span>

                                        <button type={"button"}
                                                className="btn"
                                                style={{fontSize: "small"}}
                                                onClick={ form.change }>
                                            Clear All
                                        </button>


                                        <button type={"button"}
                                                className="btn"
                                                style={{fontSize: "small"}}
                                                onClick={ form.reset }>
                                            Use Defaults
                                        </button>

                                    </span>

                                    {/* Submit button is rightmost as it's where the eye will be after scanning parameters*/}
                                    <button type={"submit"} >
                                        {/*TODO: change based on function?*/}
                                        {SubmitMapping[transformerInfo.function]}
                                    </button>



                                </div>

                            </form>
                    )}
                  }
                />

            </div>
        </Fragment>
    )

};
const onValidate = validate => validateTransformerQuery(validate);
const validateTransformerQuery = validate => true;

const inputProps = parameter => {

    const typeDependentProps = {
        "double": {
            type: "number",
            placeholder: "float, e.g. 0.67",
            step: parameter.default ? oomsig(parseFloat(parameter.default)) : 0.01
        },
        "int": {
            type: "number",
            placeholder: "integer, e.g. 3",
            step: 1
        },
        "string": {
            type: "text",
            placeholder: "string"
        },
    };

    return {
        // styling
        label: parameter.name,
        variant: "outlined",
        size: "sm",
        // content
        initialValue: parameter.default ? parameter.default : null,
        ...typeDependentProps[parameter.type]
    }

};

function oomsig(n) {
    const order = Math.floor(Math.log(Math.abs(n)) / Math.LN10
        + 0.000000001); // because float math sucks like that
    const sig = getSignificantDigitCount(n);
    return Math.min(Math.pow(10, order), Math.pow(10, -sig));
}

function getSignificantDigitCount(n) {
    const log10 = Math.log(10);
    n = Math.abs(String(n).replace(".","")); //remove decimal and make positive
    if (n == 0) return 0;
    while (n != 0 && n % 10 == 0) n /= 10; //kill the 0s at the end of n
    return Math.floor(Math.log(n) / log10) + 1; //get number of digits
}

export default Transformer;
