import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import LoadingOverlay from 'react-loading-overlay';
import Loader from 'react-loader-spinner';

export function MyLoader(props) {
	return (
		<LoadingOverlay
			active={props.isLoading}
			spinner={<Loader  type="ThreeDots" color="#2BAD60" height="30" width="30" />}
		>
			{props.children}
		</LoadingOverlay>
	)
}


const scrollStyle = {
    overflowY: "auto",
    height: "180px",
    marginBottom: "15px",
    backgroundColor: "#F5F5F5"
};


export class ListItem extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		this.props.onClick(this.props.index);
	}

	render() {
		return <button
					className="list-group-item list-group-item-action"
					onClick={this.handleClick}>
						{this.props.value}
				</button>;

	}
}


export function CurieList(props) {
	const curieList = props.curieList;
	const isClickEnabled = props.isClickEnabled;
	const listItems = curieList.map((item) =>
		<ListItem
			key={item.id}
			index={item.id}
			value={item.name}
			isClickEnabled={isClickEnabled}
			onClick={props.onClick}/>
	);
	if(isClickEnabled=== true) {
		return (
			<div className="container">
				<h6> Curie Index </h6>
				<MyLoader isLoading={props.isLoading}>
					<div style={scrollStyle}>
							{listItems}
					</div>
				</MyLoader>
			</div>
		);
	} else {
		return(
			<div className="container">
				<h6> Curie List </h6>
				<MyLoader isLoading={props.isLoading}>
					<div style={scrollStyle}>
							<button className="list-group-item list-group-item-action disabled">
								No Search
							</button>
					</div>
				</MyLoader>
			</div>
		);
	}
}

export class AccordionList extends React.Component {

	render() {
		const listItems = this.props.geneList.map((item) =>
			<ListItem
				key={item.hit_symbol}
				index={item.hit_id}
				value={item.hit_symbol}
				isClickEnabled={this.props.isClickEnabled}
				onClick={this.props.onClick}
			/>
		);

		return (
			<MyLoader isLoading={this.props.isLoading}>
				<Card>
					<Card.Header>
						<Accordion.Toggle as={Button} variant="link" eventKey={this.props.index}>
							{this.props.value}
						</Accordion.Toggle>
					</Card.Header>
					<Accordion.Collapse eventKey={this.props.index}>
						<Card.Body>{listItems}</Card.Body>
					</Accordion.Collapse>
				</Card>
			</MyLoader>
		);
	}


}

export function GeneList(props) {
	const geneList = props.geneList;
	const isClickEnabled = props.isClickEnabled;
	const accordionItems = geneList.map((item) =>
		<AccordionList
			key={item.id}
			index={item.id}
			value={item.name}
			geneList={item.items}
			isLoading={item.isLoading}
			isClickEnabled={isClickEnabled}
			onClick={props.onClick}/>
	);
	if(isClickEnabled=== true) {
		return(
			<div className="container">
				<h6> Gene List </h6>
				<div style={scrollStyle}>
					<Accordion>
						{accordionItems}
					</Accordion>
				</div>
			</div>
		);

	} else {
		return(
			<div className="container">
				<h6> Gene List </h6>
				<div style={scrollStyle}>
					<button className="list-group-item list-group-item-action disabled">
						No Search
					</button>
				</div>
			</div>
		);

	}
}

export function BioModelList(props) {
	const biomodelList = props.biomodelList;
	const isClickEnabled = props.isClickEnabled;
	const listItems = biomodelList.map((item) =>
		<ListItem key={item.name}
			index={item.pathway_id}
			value={item.name}
			onClick={props.onClick}
			isClickEnabled={isClickEnabled}
		/>
	);
	if(isClickEnabled=== true) {
		return (
			<div className="container">
				<h6> Biomodel List </h6>
				<MyLoader isLoading={props.isLoading}>
					<div style={scrollStyle}>
							{listItems}
					</div>
				</MyLoader>  >

			</div>
		);
	} else {
		return(
			<div className="container">
				<h6> Biomodel List </h6>
				<MyLoader isLoading={props.isLoading}>
					<div style={scrollStyle}>
							<button className="list-group-item list-group-item-action disabled">
								No Search
							</button>
					</div>
				</MyLoader>
			</div>
		);
	}
}
