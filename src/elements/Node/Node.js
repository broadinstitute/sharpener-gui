import React, {Fragment} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase, faPlus, faMinus, faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'

import "./css/node.css"
import "./css/sharpener_colors.css"
import "./css/tooltip.css"

import {flatten, pluralize, properCase, tap} from "../../helpers";

import {clearSingleSelectedGeneList, differentiateGeneLists} from "../../actions";

class Node extends React.Component{
    static tooltip = NodeTooltip;
    constructor(){
        super();
    }

    render(){
        let titleClassNames = 'graph-node-title';
        titleClassNames += ' ' + this.props.transformerType;
        const myIcon = {
            "producer": faDatabase,
            "creator": faDatabase,
            "expander": faLongArrowAltRight,
            "contractor": faLongArrowAltRight,
            "intersection": faMinus,
            "union": faPlus
        };

        return(
            <div className='graph-node'>
                <div className={titleClassNames}>
                    <span className='graph-node-title-icon' >
                        <FontAwesomeIcon icon={myIcon[this.props.transformerType]}/>
                    </span>
                    <span className='graph-node-title-text'>
                        {properCase(this.props.transformerName)}
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
