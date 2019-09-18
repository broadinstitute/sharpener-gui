import React, {Fragment} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase, faPlus, faMinus, faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'

import "./css/node.css"
import "./css/sharpener_colors.css"
import "./css/tooltip.css"

import {flatten, pluralize, properCase, tap} from "../../helpers";

import {clearSingleGeneList, differentiateGeneLists} from "../../actions";

class Node extends React.Component{
    static tooltip = NodeTooltip;
    constructor(props){
        super(props);
    }

    render(){
        let titleClassNames = 'graph-node-title';
        titleClassNames += ' ' + this.props.transformerType;
        // TODO: putting this here is a bad idea, let each node supply its icon
        const myIcon = {
            "producer": faDatabase,
            "creator": faDatabase,
            "expander": faPlus,
            "contractor": faMinus,
            "intersection": faMinus,
            "union": faPlus
        };

        return(
            <div className='graph-node'>
                <div className={titleClassNames}>
                    <span className='graph-node-title-text'>
                        {this.props.title}
                    </span>
                    <span className='graph-node-title-icon' >
                        <FontAwesomeIcon icon={myIcon[this.props.transformerType]}/>
                    </span>
                </div>
            </div>
        )
    }
}

export const NodeTooltip = (props) => {
    return (
        <div style={{width:"100%", height:"100%" , border:"1px solid #000", background: "snow", padding: "5px"}}>
            <div className='graph-node-body'>
                {this.props.title}
            </div>
        </div>
    )
};


const progressRect = {
    width: "200px",
    height: "100px",
    background: "red"
};

export default Node
