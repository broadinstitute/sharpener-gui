import {connect} from "react-redux";
import {AsyncListener} from "../components/AsyncListener/AsyncListener";

const mapDispatchToProps = {

}

const mapStateToProps = state => ({
    isFetching: state.app.isFetching,
    transactionsFetching: state.app.transactionsFetching
});

export default connect(mapStateToProps, mapDispatchToProps)(AsyncListener)
