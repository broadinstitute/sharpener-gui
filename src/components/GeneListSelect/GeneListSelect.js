import React from "react";
import CheckboxTree from "react-dynamic-checkbox-tree";

const exampleData = [
    {
        id: 1000,
        label: 'Root 1',
        children: [
            { id: 1100, label: 'Children 1' },
            {
                id: 1200,
                label: 'Parent 1',
                children: [
                    { id: 1210, label: 'Children 1' },
                    { id: 1220, label: 'Children 2' },
                ],
            },
        ],
    },
    {
        id: 2000,
        label: 'Root 2',
        children: [{ id: 2100, label: 'Children 1' }],
    },
    {
        id: 3000,
        label: 'Root 3',
    },
    {
        id: 4000,
        label: 'Root 4',
        children: [
            {
                id: 4100,
                label: 'Parent 1',
                children: [
                    { id: 4110, label: 'Children 1' },
                    { id: 4120, label: 'Children 2' },
                    {
                        id: 4130,
                        label: 'Parent 1',
                        children: [
                            { id: 4131, label: 'Children 1' },
                            { id: 4132, label: 'Children 2' },
                            { id: 4133, label: 'Children 3' },
                        ],
                    },
                    { id: 4140, label: 'Children 3' },
                ],
            },
            {
                id: 4200,
                label: 'Parent 2',
                children: [
                    { id: 4210, label: 'Children 1' },
                    { id: 4220, label: 'Children 2' },
                    { id: 4230, label: 'Children 3' },
                    { id: 4240, label: 'Children 4' },
                    { id: 4250, label: 'Children 5' },
                ],
            },
        ],
    },
]

export default class MyComponent extends React.Component {
    state = {
        checked: [], // This stores the checked ID's
    }

    render() {
        return (
            <CheckboxTree
                nodes={exampleData}
                checked={this.state.checked}
                onCheck={checked => this.setState({ checked })}
            />
        )
    }
}