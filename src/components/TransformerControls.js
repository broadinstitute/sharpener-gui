import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Card from 'react-bootstrap/Card'
import {MyLoader} from "./ListItem";

const Fragment = React.Fragment;

/*
 Miscellaneous
 */

const transformerMenuStyle = {
    marginTop: "18px",
    marginBottom: "20px",
};

const transformerInputStyle = {
    fontWeight: "bold"
};

let indexNameOf = (schemaName) => {
    // convert the value of a given expander name to a unique ID usable by XML conventions, plus our React State
    // NOTE: This operation is destructive to the name because we can't recover capital letters
    // TODO: this approach assumes names of expanders are unique
    // TODO: uh... what if I just use the names? hm.
    return schemaName.toLowerCase().replace(/ /g, "-");
};

/*
Components
 */

export default class TransformerControls extends React.Component {
    constructor(props) {
        console.log("Transformer Controls");
        super(props);

        this.state = {
            transformerControls : {}  // these aren't query controls specifically since not all transformers might be selected while a control is being filled TODO: sane?
        };

        this.queryTransformer = props.queryPromise;

        this.queryTransformers = this.queryTransformers.bind(this);
        this.updateTransformerControls = this.updateTransformerControls.bind(this);

    }

    updateTransformerControls = (expanderIndexName, expanderControls) => {
        let stateCopy = { ...this.state };
        stateCopy.transformerControls[expanderIndexName] = expanderControls;
        this.setState(stateCopy, () => {
            console.log("transformerControls with expanderIndex update ", this.state.transformerControls);
            // no throwback
        });
    };

    queryTransformers = () => {
        // DONE: do we always have access to the latest selected gene lists and selected expanders?
        // DONE: do we always have access to the latest expander states?
            // PO: Expanders are searched for and added programatically (through props),
            // to prevent scaling out too wide by tracking a tonne of expanders + parameters changes through state modifications?

        /* the first approach: aggregate upstream */

        // TODO: Actually do this approach (it's probably more efficient but also a bigger implementation right now)
        // helpful for understanding promise chaining: https://stackoverflow.com/a/36877743
        // step one:
            // aggregation
                // why aggregation first? because it's cheap and fast
                // if we were to not aggregate first then we expand out the number of parallel asynchronous
                // requests we're making, which is a headache for both server and client
        // step two:
            // apply expander requests onto the resultant aggregator set (in sync with it)
        // step three:
            // return the set as a gene ID to the main App (which should trigger downstream rendering)
            // this should be taken care of through our callback



        /* The other approach: iterate over a bunch of independent queries */

        // This takes the selected expanders and genelists, and returns an aggregate of all of the results
        // that come from applying each selected transformer to each selected gene list

        // Let's be heroes
        // https://stackoverflow.com/a/43053803
        const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));  // pair constructor
        const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);   // tensor operator/recursively constructed onto mapping...
        // yeah this could be simpler -- it's only complicated because it's defined for the general case

        let transformerSelectionPairs = cartesian(this.props.selectedExpanders, this.props.selectedGeneLists);  // https://stackoverflow.com/a/1316389
        console.log(transformerSelectionPairs);

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
            )).then(resolved => { console.log("query complete"); });
    };

    onAggregate = (newAggregationGeneListID) => {
        this.props.handleGeneListSelection(newAggregationGeneListID);
    };



    render() {
        // form has to wrap every transformer even if not all of them are contributing to the extant query
        return (
            <div>
                <TransformerQuerySender
                    currentSelections={ { selectedGeneLists: this.props.selectedGeneLists, selectedExpanders: this.props.selectedExpanders } }
                    onClickCallback={ this.queryTransformers }/>
                <div className={"container"}>
                    <div className={"row"}>
                        <div className="col-xs-8">
                            <CurrentlySelectedGenes
                                currentSelections={ { selectedGeneLists: this.props.selectedGeneLists, selectedExpanders: this.props.selectedExpanders } } />
                            </div> {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                        <div className="col-xs-4">
                            <AggregatorControls
                                currentSelections={ { selectedGeneLists: this.props.selectedGeneLists, selectedExpanders: this.props.selectedExpanders } }
                                actions={["union", "intersection"]}
                                handleOnClick={ this.onAggregate }
                            />
                        </div>

                    </div>
                </div>
                <CurrentlySelectedExpanders
                    currentSelections={ { selectedGeneLists: this.props.selectedGeneLists, selectedExpanders: this.props.selectedExpanders } } />
                {this.props.expanders ?
                    <TransformerList
                        expanders={ this.props.expanders }
                        handleExpanderSelection={ this.props.handleExpanderSelection }
                        throwbackExpanderIndex={ this.updateTransformerControls }/>
                        : <MyLoader active={true}/> }
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
                                selectedGeneLists={this.props.currentSelections.selectedGeneLists}
                                handleOnClick={this.props.handleOnClick}
                                action={operation}/>) : <div/> }
                </div>
            </Fragment> )
    }
}

export class AggregationSender extends React.Component {
    constructor(props) {
        super(props);
        this.SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;
        this.throwbackGeneListID = props.handleOnClick;
    }

    queryAggregator = (action, selectedGeneLists) => {
        let aggregationQuery = {
            operation: action,
            gene_list_ids: selectedGeneLists
        };

        return fetch(this.SERVICE_URL.concat("/aggregate"), {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(aggregationQuery)
            })
    };

    promiseAggregation = () => {
        if (this.props.selectedGeneLists && this.props.selectedGeneLists.length > 0) {
            return Promise.resolve(this.queryAggregator(this.props.action, this.props.selectedGeneLists))
                .then(response => response.json())
                .then(data => {
                    this.throwbackGeneListID(data.gene_list_id);
                });
        }
    };

    render() {
        return (
        <Fragment>
            <button
                type="button"
                onClick={ this.promiseAggregation }
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
                    <label as={"h5"}>Selected Gene Sets</label>
                    <ul>
                    {this.props.currentSelections.selectedGeneLists.length > 0 ? this.props.currentSelections.selectedGeneLists.map(selectedGeneList =>
                                <li>{selectedGeneList}</li>) :
                            <p>None</p>}
                     </ul>
                </Fragment>
            )
        }
}

export class CurrentlySelectedExpanders extends React.Component {
    render() {
        return (
            <Fragment>
                <label as={"h5"}>Selected Expanders</label>
                <ul>
                    {this.props.currentSelections.selectedExpanders.length > 0 ? this.props.currentSelections.selectedExpanders.map(selectedExpander =>
                            <li>{selectedExpander.name}</li>) :
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
                                    "Select Gene Sets as input for your Transformers" :
                                (this.props.currentSelections.selectedGeneLists.length > 0) &&
                                !(this.props.currentSelections.selectedExpanders.length > 0) ?
                                    "Select Transformers for your Gene Sets" :
                                    "Select Gene Sets and Transformers"}

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
        this.expanders = props.expanders;
        this.handleExpanderSelection = props.handleExpanderSelection;
        this.throwbackExpanderIndex = props.throwbackExpanderIndex;

        console.log(this.expanders); // check
        console.log(this.handleExpanderSelection); // check
        console.log(this.throwbackExpanderIndex); // check

        this.state = {
            expanderIndex: {}
        };

        this.updateExpanderControls = this.updateExpanderControls.bind(this);

    }

    componentDidMount() {
        this.expanders.map(expander => {
            let stateCopy = { ...this.state };
            stateCopy.expanderIndex[indexNameOf(expander.name)] = {
                transformer: expander,
                controls: {}
            };
            this.setState(stateCopy,
                () => { console.log("expanderIndex ", this.state.expanderIndex); });
        });
    }

    updateExpanderControls = (expanderName, parameterIndexName, parameterIndexValues) => {
        let stateCopy = { ...this.state };
        stateCopy.expanderIndex[indexNameOf(expanderName)]["controls"][parameterIndexName] = parameterIndexValues;
        this.setState(stateCopy, () => {
            console.log("expanderIndex with controls now", this.state.expanderIndex);
            this.throwbackExpanderIndex(indexNameOf(expanderName), this.state.expanderIndex[indexNameOf(expanderName)]);
        });
    };

    render() {
        return (
            <Fragment>
                {/*{JSON.stringify(this.props)}*/}
                {this.expanders.map(expander =>
                    <Fragment>
                        <TransformerItem
                            expander={ expander }
                            // TODO: what are the naming conventions for custom props
                            handleExpanderSelection={ this.handleExpanderSelection }
                            throwbackParameterValues={ this.updateExpanderControls }/>
                        <br/>
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
        this.expander = props.expander;
        this.id = indexNameOf(props.expander.name);
        this.handleExpanderSelection = props.handleExpanderSelection;
        this.throwbackParameterValues = props.throwbackParameterValues;

        this.state = {
            parameterIndex : {}
        };

        this.handleParameterValueChange = this.handleParameterValueChange.bind(this);
        this.onClickHandleSelection = this.onClickHandleSelection.bind(this);

    }

    componentDidMount() {
        this.expander.parameters.map(parameter => {
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
            console.log("new parameter value ".concat(newParameterValue).concat(" equal to"), this.state.parameterIndex[parameterIndexName]);
            // this "throwback" is put into the setState callback to guarantee synchrony (setState is asynchronous)
            this.throwbackParameterValues(this.expander.name, parameterIndexName, this.state.parameterIndex[parameterIndexName]);
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
                    console.log("update parameterIndex with default values of ".concat(parameterIndexName), this.state.parameterIndex);
                    this.throwbackParameterValues(this.expander.name, parameterIndexName, this.state.parameterIndex[parameterIndexName]);
                });
            }
        });

        // DONE: see TransformerControls
        // our goal is to store nothing more than the equivalent of an expander ID, so that the parameter values can be programatically found
        // this means that the state propagating upwards has to be strictly controlled as to be deterministic
        // it also has to update frequently

        // delegate
        this.handleExpanderSelection(this.expander);
    };

    render() {
        return (
            <Card>
                <Card.Header as={"h6"} onClick={ this.onClickHandleSelection }>{this.expander.name}</Card.Header>
                <div id={"expander-".concat(indexNameOf(this.expander.name))}>
                    {Object.keys(this.state.parameterIndex).map(parameterIndexKey => {
                        return <TransformerParameter id={ parameterIndexKey }
                                                     value = {this.state.parameterIndex[parameterIndexKey].value}
                                                     parameter = {this.state.parameterIndex[parameterIndexKey].parameter}
                                                     action = { this.handleParameterValueChange }/>
                    })}
                </div>
            </Card>
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
                    <InputGroup.Text>{ this.parameter.name }</InputGroup.Text>
                </InputGroup.Prepend>
                    <FormControl id={ this.id }
                                 placeholder={ this.parameter.default ? this.parameter.default : this.parameter.type }
                                 value={ this.state.value }
                                 onChange={ this.handleParameterValueChange }
                                 style={ transformerInputStyle }/>

            </InputGroup>
        )
    }
}