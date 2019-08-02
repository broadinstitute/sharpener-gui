import React from 'react';

const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

const searchBarStyle = {
    marginTop: "20px",
    marginLeft: "25px",
    marginRight: "15px",
    marginBottom: "20px",
};

export class SearchBar extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
    }

    handleKeyPress = event => {
        if (event.key === 'Enter') {
            event.preventDefault(); // this will result in an "event undefined" error, but will prevent page refresh
            this.props.handleCreation();
        }
    };

    render() {
        return (
            <div style={searchBarStyle}>
                <form className="form-inline">
                    <select id="producer" onChange={this.props.handleProducerSelect}>
                        {this.props.producers.map((producer) =>
                            <option value={producer.name}>
                                {producer.name}
                            </option>
                        )}
                    </select>
                    <input
                        type="search"
                        className="form-control mr-sm-2"
                        onChange={this.props.handleTextChange}
                        placeholder="Search.."
                        aria-label="Search"
                        id="search"
                        onKeyPress={this.handleKeyPress}
                    />
                    <button
                        type="button"
                        onClick={this.props.handleCreation}
                        className="btn btn-outline-success my-2 my-sm-0">
                        Search
                    </button>
                </form>
            </div>
    );
  }
}

export default SearchBar;
