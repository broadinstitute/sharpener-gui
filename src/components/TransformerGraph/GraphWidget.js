import React from 'react';
import { CanvasWidget } from '@projectstorm/react-canvas-core'

// export interface BodyWidgetProps {
//     engine: DiagramEngine;
// }

export class BodyWidget extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <CanvasWidget className="diagram-container" engine={this.props.engine} />;
    }
}
