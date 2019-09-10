import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Card from 'react-bootstrap/Card'
import {MyLoader} from "../ListItem";
import {FEATURE_FLAG} from "../../parameters/FeatureFlags";
import {properCase, formatAbbreviations, pluralize} from "../../helpers";

import "./TransformerControls.css"
import Select from "react-select";
import {toggleExpanderSelection} from "../../actions";

const Fragment = React.Fragment;

/*
 Miscellaneous
 */

const transformerMenuStyle = {
    marginTop: "18px",
    marginBottom: "20px",
};


let indexNameOf = (schemaName) => {
    return schemaName.toLowerCase().replace(/ /g, "-");
};

/*
Components
 */

export default class TransformerControls extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shownExpanders: [],
            shownFilters: props.filters,
            transformerControls : {}  // these aren't query controls specifically since not all transformers might be selected while a control is being filled TODO: sane?
        };

        this.queryTransformer = props.queryPromise;
        this.queryTransformers = this.queryTransformers.bind(this);
        this.updateTransformerControls = this.updateTransformerControls.bind(this);

    }

    updateTransformerControls = (expanderIndexName, expanderControls) => {
        let stateCopy = { ...this.state };
        stateCopy.transformerControls[expanderIndexName] = expanderControls;
        this.setState(stateCopy);
    };

    queryTransformers = () => {

        /* iterate over a bunch of independent queries */

        // This takes the selected expanders and genelists, and returns an aggregate of all of the results
        // that come from applying each selected transformer to each selected gene list

        // Let's be heroes
        // https://stackoverflow.com/a/43053803
        const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));  // pair constructor
        const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);   // tensor operator/recursively constructed onto mapping...
        // yeah this could be simpler -- it's only complicated because it's defined for the general case

        let transformerSelectionPairs = cartesian(this.props.selectedExpanders, this.props.selectedGeneLists);  // https://stackoverflow.com/a/1316389
        // Test: just take the first list and transformer, see if we can get what we need back

        Promise.all(transformerSelectionPairs.map(pair => {
                let transformerName=pair[0].name,
                    transformerControls=
                        Object.values(this.state.transformerControls[indexNameOf(pair[0].name)].controls)
                            .map(control => {
                                return { name: control.parameter.name, value: control.value }
                            }),
                    geneListID=pair[1];

                // Concordant with Sharpener Schema version 1.1.0
                // ie. gene_list_id is optional
                let transformerQuery = {
                    name: transformerName,
                    controls: transformerControls,
                    // The spread operator is the niftiest thing since pre-sliced cheese
                    // https://stackoverflow.com/a/47892178
                    ...(geneListID && {gene_list_id: geneListID})
                };

                return this.queryTransformer(transformerQuery)
            }
            ));
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.selectedExpanders !== prevState.shownExpanders) {
            return {
                shownExpanders: nextProps.selectedExpanders
            }
        }
        return null;
    }

    render() {
        let options = this.props.expanders.map(expander =>
            Object.assign({}, {label: properCase(expander.name), value: expander})
        );

        // form has to wrap every transformer even if not all of them are contributing to the extant query
        return (
            <div>
                <TransformerQuerySender
                    currentSelections={ { selectedGeneLists: this.props.selectedGeneLists, selectedExpanders: this.props.selectedExpanders } }
                    onClickCallback={ this.queryTransformers }/>

                <h4>Expanders</h4>
                <Select id="expander-select"
                        isMulti
                        className="basic-multi-select"
                        isSearchable
                        defaultValue={[]}
                        options={options}
                        onChange={
                            (args, action) => {
                                if (action.action === "create-option") {

                                }
                                if (action.action === "select-option") {
                                    // onColumnToggle(action.option.value);
                                    console.log(args, action);
                                    this.props.handleExpanderSelection(action.option.value)
                                } else if (action.action === "remove-value" || action.action === "pop-value") {
                                    // onColumnToggle(action.removedValue.value);
                                    this.props.handleExpanderSelection(action.removedValue.value)
                                }
                                // TODO:
                                else if (action.action === "clear") {
                                    this.props.clearSelections();
                                }
                            }
                        }>

                    {options.map((expanderOption) => {
                        return (<option key={expanderOption.value.name} value={expanderOption.value}>
                                    {expanderOption.label}
                                </option>)
                    })}
                </Select>
                <TransformerList
                    transformers={ this.props.expanders }
                    shownTransformers={ this.state.shownExpanders }
                    handleTransformerSelection={ this.props.handleExpanderSelection }
                    throwbackExpanderIndex={ this.updateTransformerControls }/>

                <br/><h4>Filters</h4>
                <TransformerList
                    transformers={ this.props.filters }
                    shownTransformers={ this.state.shownFilters }
                    handleTransformerSelection={ this.props.handleExpanderSelection }
                    throwbackExpanderIndex={ this.updateTransformerControls }/>
            </div>
        )
    }
}

export class AggregatorControls extends React.Component {
    render() {
        return (
            <Fragment>
                <div style={{display: "inline"}}>
                    { this.props.currentSelections.selectedGeneLists ?
                        this.props.actions.map(operation =>
                            <AggregationSender
                                key={operation}
                                selectedGeneLists={this.props.currentSelections.selectedGeneLists}
                                aggregateGenes={this.props.aggregateGenes}
                                action={operation}/>) : <div/> }
                </div>
            </Fragment> )
    }
}

export class AggregationSender extends React.Component {
    render() {
        return (
        <Fragment>
            <button
                type="button"
                onClick={ () => this.props.aggregateGenes(this.props.action) }
                // className="btn btn-outline-success my-2 my-sm-0"
                style={{marginLeft: "auto", marginRight: "0%"}}
            >
                {/* Capitalize the operation label */}
                {this.props.action.replace(/^[a-z]/g, function(t) { return t.toUpperCase() })}
            </button>{'\u00A0'}{'\u00A0'}
        </Fragment>
        )
    }
}

// DONE - RC1
export class CurrentlySelectedGenes extends React.Component {
        render() {
            return (
                <Fragment>
                    <label as={"h5"}>Selected Gene Lists</label>
                    <ul>
                    {this.props.currentSelections.selectedGeneLists.length > 0 ? this.props.currentSelections.selectedGeneLists.map(selectedGeneList =>
                                <li>{selectedGeneList}</li>) :
                            <p>None</p>}
                     </ul>
                </Fragment>
            )
        }
}

export class TransformerQuerySender extends React.Component {
    constructor(props) {
        super(props);
        this.queryTransformers = props.onClickCallback;

        this.state = {
            // this is made into state because it affects button rendering,
            // and the button bottlenecks the user in being able to do the query
            // Lord forgive me
            canQueryTransformers: false
        }
    }

    // why does this have to be static? => why does this method only ought to be accessible after the component is initialized?
    static getDerivedStateFromProps(props, state) {
        // function is initialized inside because it would be awkward to define it as a static function when it is so small
        // it just encapsulates a boolean call (plus its intended use) anyway
        let canQueryTransformers = (selectedGeneLists, selectedExpanders) => {
            return selectedGeneLists.length > 0 && selectedExpanders.length > 0;
        };

        // can't reference selectedGeneLists and selectedExpanders with "this" b/c static method
        if (canQueryTransformers(...Object.values(props.currentSelections)) !== state.canQueryTransformers) {
            return { canQueryTransformers: canQueryTransformers(...Object.values(props.currentSelections)) };
        }
        return null;
    }

    render() {
        return (
            <Fragment>
                <div style={transformerMenuStyle}>
                    { this.state.canQueryTransformers ?
                        <button
                            type="button"
                            onClick={ this.queryTransformers }
                            className="btn btn-outline-success my-2 my-sm-0">
                            Transform Gene Lists
                        </button> :
                        <button
                            className="btn my-2 my-sm-0"
                            disabled={true}>

                            {   !(this.props.currentSelections.selectedGeneLists.length > 0) &&
                                (this.props.currentSelections.selectedExpanders.length > 0) ?
                                    "Select Gene Lists as input for your Transformers" :
                                (this.props.currentSelections.selectedGeneLists.length > 0) &&
                                !(this.props.currentSelections.selectedExpanders.length > 0) ?
                                    "Select Transformers for your Gene Lists" :
                                    "Select Gene Lists and Transformers"}

                        </button> }
                </div>
            </Fragment> )
    }

}


// TransformerList is like a form of many expanders for an expander query
// so we need child-parent communication like this:
// https://ourcodeworld.com/articles/read/409/how-to-update-parent-state-from-child-component-in-react
// because the expanders are programmatically defined, we're manipulating an array of state
// furthermore since the state we're storing itself an array of state, it's an array of array of state, which is state
export class TransformerList extends React.Component{
    constructor(props) {
        super(props);
        this.transformers = props.transformers;
        this.handleTransformerSelection = props.handleTransformerSelection;
        this.throwbackExpanderIndex = props.throwbackExpanderIndex;

        this.state = {
            // TODO: refactor to Redux
            expanderIndex: {}
        };

        this.updateExpanderControls = this.updateExpanderControls.bind(this);

    }

    componentDidMount() {
        this.transformers.map(expander => {
            let stateCopy = { ...this.state };
            stateCopy.expanderIndex[indexNameOf(expander.name)] = {
                transformer: expander,
                controls: {}
            };
            this.setState(stateCopy);
        });
    }

    updateExpanderControls = (expanderName, parameterIndexName, parameterIndexValues) => {
        let stateCopy = { ...this.state };
        stateCopy.expanderIndex[indexNameOf(expanderName)]["controls"][parameterIndexName] = parameterIndexValues;
        this.setState(stateCopy, () => {
            this.throwbackExpanderIndex(indexNameOf(expanderName), this.state.expanderIndex[indexNameOf(expanderName)]);
        });
    };

    clearExpanderControls = (expanderName) => {
        return this.updateExpanderControls(expanderName)
    }

    render() {
        return (
            <Fragment>
                {this.transformers.filter(transformer => this.props.shownTransformers.includes(transformer)).map(transformer =>
                    <Fragment key={transformer.name}>
                        <TransformerItem
                            transformer={ transformer }
                            // TODO: what are the naming conventions for custom props
                            handleTransformerSelection={ this.handleTransformerSelection }
                            throwbackParameterValues={ this.updateExpanderControls }/>
                    </Fragment>)}
            </Fragment>
        )
    }

}

// TransformerItem is like a form for many parameters of an expander
// so we need child-parent communication like this:
// https://ourcodeworld.com/articles/read/409/how-to-update-parent-state-from-child-component-in-react
// because the parameters are programmatically defined, we're manipulating an array of state
export class TransformerItem extends React.Component {

    constructor(props) {
        super(props);
        this.transformer = props.transformer;
        this.id = indexNameOf(props.transformer.name);
        this.handleTransformerSelection = props.handleTransformerSelection;
        this.throwbackParameterValues = props.throwbackParameterValues;

        this.state = {
            // TODO: refactor to Redux
            parameterIndex : {}
        };

        this.handleParameterValueChange = this.handleParameterValueChange.bind(this);
        this.onClickHandleSelection = this.onClickHandleSelection.bind(this);

    }

    componentDidMount() {
        this.transformer.parameters.map(parameter => {
            let stateCopy = { ...this.state };
            stateCopy.parameterIndex[indexNameOf(parameter.name)] = {
                parameter: parameter,
                value: ""
            };
            this.setState(stateCopy);
        });
    }

    // we don't move this handler any higher in the component hierarchy due to first-nearest-parent principle
    // https://reactjs.org/docs/lifting-state-up.html
    handleParameterValueChange = (e) => {
        let parameterIndexName = e.target.id;
        let newParameterValue = e.target.value !== '' ? e.target.value : null; // necessary to obey convention of state being initialized to null

        // https://stackoverflow.com/a/49128623
        // this is brutal but other options seem to run into issues with scope when passing in variables to the callbacks (lack of support for closures in "this version" of JS?!?!?)

        let stateCopy = { ...this.state };
        stateCopy.parameterIndex[parameterIndexName].value = newParameterValue;
        this.setState(stateCopy, () => {
            // this "throwback" is put into the setState callback to guarantee synchrony (setState is asynchronous)
            this.throwbackParameterValues(this.transformer.name, parameterIndexName, this.state.parameterIndex[parameterIndexName]);
        });

    };

    // Set all values of parameters to their defaults
    onClickHandleSelection = () => {
        const parameterIndexNames = Object.keys(this.state.parameterIndex);
        parameterIndexNames.forEach(parameterIndexName => {
            // if the parameter doesn't currently have a value, set the value of this parameter to the parameter's specified default
            if (!this.state.parameterIndex[parameterIndexName].value) {
                let stateCopy = { ...this.state };
                stateCopy.parameterIndex[parameterIndexName].value = stateCopy.parameterIndex[parameterIndexName].parameter.default;
                this.setState(stateCopy,() => {
                    this.throwbackParameterValues(this.transformer.name, parameterIndexName, this.state.parameterIndex[parameterIndexName]);
                });
            }
        });
    };

    clearParameters = () => {
        const parameterIndexNames = Object.keys(this.state.parameterIndex);
        parameterIndexNames.forEach(parameterIndexName => {
            if (this.state.parameterIndex[parameterIndexName].value) {
                let stateCopy = { ...this.state };
                stateCopy.parameterIndex[parameterIndexName].value = '';
                this.setState(stateCopy,() => {
                    this.throwbackParameterValues(this.transformer.name, parameterIndexName, this.state.parameterIndex[parameterIndexName]);
                });
            }
        });
    };

    render() {
        return (
            <Fragment>
                <Card>
                    <Card.Header as={"h6"}>
                        <a style={{display: "inline-block", cursor: "pointer"}}
                           onClick={ this.onClickHandleSelection }>
                            {properCase(this.transformer.name)}
                        </a>
                        <button className="btn my-2 my-sm-0"
                                style={{padding:"0%", fontSize: "small", float:"right", marginLeft: "auto", margin: "auto", display:"inline-block"}}
                                onClick={ this.clearParameters }>
                            Reset
                        </button>
                    </Card.Header>
                    <div id={"expander-".concat(indexNameOf(this.transformer.name))}>
                        {Object.keys(this.state.parameterIndex).map(parameterIndexKey => {
                            return (<Fragment>
                                        <TransformerParameter id={ parameterIndexKey }
                                                              value = {this.state.parameterIndex[parameterIndexKey].value}
                                                              parameter = {this.state.parameterIndex[parameterIndexKey].parameter}
                                                              action = { this.handleParameterValueChange }/>
                                    </Fragment>)
                        })}
                    </div>
                </Card>
            </Fragment>
        )
    }
}

export class TransformerParameter extends React.Component {
    constructor(props) {
        super(props);
        this.id = props.id;
        this.parameter = props.parameter;
        this.allowedValues = props.allowedValues ? props.allowedValues : "";
        this.handleParameterValueChange = props.action;

        this.state = {
            value: props.value
        }

    }

    // https://medium.com/p/387720c3cff8/responses/show
    static getDerivedStateFromProps(props, state) {
        if (props.value !== state.value) {
            return { value: props.value };
        }
        return null;
    }

    render() {
        // Fragment is here b/c JSX doesn't allow siblings to be returned as a render without a parent
        // https://github.com/facebook/react/issues/2127
        // https://reactjs.org/blog/2017/11/28/react-v16.2.0-fragment-support.html

        // TODO: render different FormControl depending on parameter type
        // TODO: type checking of parameters based on their type
        return (
            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text>{ formatAbbreviations(properCase(this.parameter.name)) }</InputGroup.Text>
                </InputGroup.Prepend>
                {!this.parameter.allowed_values ?
                <FormControl id={ this.id }
                             className={"transformer-parameter"}
                             placeholder={ this.parameter.default ? this.parameter.default : this.parameter.type === "list" ? properCase(this.parameter.type)+" of "+this.parameter.name+"s" : properCase(this.parameter.type) }
                             value={ this.state.value }
                             onChange={ this.handleParameterValueChange }/>
                : <FormControl
                        id={ this.id }
                        className={"transformer-parameter"}
                        as={"select"}
                        onChange={ this.handleParameterValueChange }
                        defaultValue={this.state.value}>
                    <option key={"blank"} value={this.state.value}>{this.state.value}</option>
                    {this.parameter.allowed_values.map(allowed_value => (
                        <option key={allowed_value} value={allowed_value}>
                            {properCase(allowed_value)}
                        </option>
                    ))}
                  </FormControl>}
                {/*<Select*/}
                {/*    id={"allowed-parameter-"+this.parameter.name}*/}
                {/*    className="form-control"*/}
                {/*    style={{display:"block", margin: 0}}*/}
                {/*    isSearchable*/}
                {/*    options={this.parameter.allowed_values.map(allowed_value=>({label: properCase(allowed_value), value: allowed_value}))}*/}
                {/*    defaultValue={this.parameter.allowed_values.map(allowed_value=>({label: properCase(allowed_value), value: allowed_value}))[0]}*/}
                {/*    onChange={ () => {} }>*/}
                {/*    {this.parameter.allowed_values.map(allowed_value => (*/}
                {/*        <option key={allowed_value} value={allowed_value}>*/}
                {/*            {properCase(allowed_value)}*/}
                {/*        </option>*/}
                {/*    ))}*/}
                {/*</Select>*/}
            </InputGroup>
        )
    }
}