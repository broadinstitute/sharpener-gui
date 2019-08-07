import React from 'react';

const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

const searchBarStyle = {
    marginTop: "18px",
    marginLeft: "0px",
    marginRight: "15px",
    marginBottom: "20px",
};

export class ProducerControls extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
    }

    handleKeyPress = event => {
        if (event.key === 'Enter') {
            event.preventDefault(); // this will result in an "event undefined" error, but will prevent page refresh
            this.props.handleGeneListCreation();

            // TODO: clear search text?
        }
    };

    render() {
        return (
            <div style={searchBarStyle}>
                <form className="form-inline">
                    <select id="producer" onChange={this.props.handleProducerSelect }>
                        {this.props.producers.map((producer) =>
                            <option key={producer.name} value={producer.name}>
                                {producer.name}
                            </option>
                        )}
                    </select>
                    <input
                        type="search"
                        className="form-control mr-sm-2"
                        value={this.props.searchText}
                        onChange={this.props.handleTextChange}
                        placeholder=""  // TODO -- producer dependent
                        aria-label="Produce Gene Set"
                        id="search"
                        onKeyPress={this.handleKeyPress}
                    />
                    <button
                        type="button"
                        onClick={this.props.handleGeneListCreation}
                        className="btn btn-outline-success my-2 my-sm-0">
                        Produce Gene Set
                    </button>
                </form>
            </div>
    );
  }
}

export default ProducerControls;
