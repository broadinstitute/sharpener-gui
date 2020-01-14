import {connect} from "react-redux";
import {AsyncListener} from "../components/AsyncListener/AsyncListener";

const mapDispatchToProps = {

}

const mapStateToProps = state => ({
    isFetching: state.app.isCreateFetching,
    transactionsFetching: state.app.transactionsFetching,
    message: "Creating Gene List"
});

export default connect(mapStateToProps, mapDispatchToProps)(AsyncListener)
