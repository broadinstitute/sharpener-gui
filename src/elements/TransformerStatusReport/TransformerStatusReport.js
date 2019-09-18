import React from "react"
import Fade from "react-bootstrap/Fade";
import {removeError} from "../../actions";

export default class TransformerStatusReport extends React.Component {
    constructor(props) {
        super(props);
        this.error = props.error;
        this.state = {
            open: false,
            seconds: 3
        };
    }

    tick() {
        this.setState(prevState => ({
            seconds: prevState.seconds - 1
        }), () => {
            if (this.state.seconds === 0) {
                this.setState({open: false});
                removeError(this.error);
            }
        });
    }

    componentDidMount() {
        this.setState({open: true});
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <Fade in={this.state.open} unmountOnExit={true}>
                <div id="fade-text">
                    <span style={{color: this.error.status === "failed" ? "red": "green", fontWeight: "bold"}}> {this.error.status.toUpperCase()}:</span> {this.error.query.name}
                </div>
            </Fade>
        );
    }
}