import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'

export default class TransformerMenu extends React.Component{
    constructor(props) {
        super(props);
        this.expanders = props.expanders;
    }

    render() {
        return (
            <div>
                {this.expanders.map(expander => <TransformerItem expander={expander}/>)}
            </div>
        )
    }

}

export class TransformerItem extends React.Component {
    constructor(props) {
        super(props);
        this.expander = props.expander;
    }

    render() {
        return (
            <InputGroup className={"expander-".concat(this.expander.name.toLowerCase().replace(/ /g, "-"))}>
                <label>{this.expander.name}</label>
                {this.expander.parameters.map(parameter => <TransformerParameter parameter={parameter}/>)}
            </InputGroup>
        )
    }
}

const Fragment = React.Fragment;
export class TransformerParameter extends React.Component {
    constructor(props) {
        super(props);
        this.parameter=props.parameter;
    }

    render() {
        // Fragment is here b/c JSX doesn't allow siblings to be returned as a render without a parent
        // https://github.com/facebook/react/issues/2127
        // https://reactjs.org/blog/2017/11/28/react-v16.2.0-fragment-support.html
        return (
            <Fragment>
                <InputGroup.Prepend>
                    <InputGroup.Text>{this.parameter.name}</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl placeholder={ this.parameter.default ? this.parameter.default : this.parameter.type }/>
            </Fragment>
        )
    }
}