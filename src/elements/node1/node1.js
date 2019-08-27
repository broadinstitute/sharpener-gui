import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'

import "./node.css"
import "./sharpener_colors.css"

class node1 extends React.Component{
    constructor(){
        super();
        this.state = {
            isTooltipActive: false
        };

        this.tooltip = {
            content: "This is the tooltip content",
            settings: {
                position: "top",
                arrow: "center",
                parent: "#node-content"
            }
        };

        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);

    }

    showTooltip() {
        this.setState({isTooltipActive: true})
    }
    hideTooltip() {
        this.setState({isTooltipActive: false})
    }

    render(){
        let titleClassNames = 'graph-node-title';
        titleClassNames += ' ' + this.props.transformerType;
        return(
            <div className='graph-node'>
                <div className={titleClassNames}>
                    <span className='graph-node-title-icon' >
                        <FontAwesomeIcon icon={faDatabase}/>
                    </span>
                    <span className='graph-node-title-text'>
                        {this.props.title}
                    </span>
                </div>
                <div className='graph-node-body'>

                </div>
                <div className='graph-node-footer'>
                    {this.props.footer}
                </div>
            </div>
        )
    }
}



const progressRect = {
    width: "200px",
    height: "100px",
    background: "red"
};

export default node1
