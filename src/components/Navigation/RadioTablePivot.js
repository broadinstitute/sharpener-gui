import React, { useState } from 'react';
import { Button, ButtonGroup } from 'reactstrap';

const RadioTablePivot = (props) => {
    const [rSelected, setRSelected] = useState(null);
    return (
        <>
            <h5>Radio Buttons</h5>
            <ButtonGroup>
                <Button color="primary" onClick={() => setRSelected(1)} active={rSelected === 1}>One</Button>
                <Button color="primary" onClick={() => setRSelected(2)} active={rSelected === 2}>Two</Button>
                <Button color="primary" onClick={() => setRSelected(3)} active={rSelected === 3}>Three</Button>
            </ButtonGroup>
            <p>
                {props.children}
            </p>
        </>
    );
};
export default Example;
