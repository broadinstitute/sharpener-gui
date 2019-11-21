import { NodeModel, DefaultPortModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class JSCustomNodeModel extends NodeModel {
    constructor(options = {}) {
        super({
            ...options,
            type: 'js-custom-node'
        });
        this.color = options.color || 'rgb(255,0,0)';
        this.name = options.name || null; // TODO
        this.function = options.function || null; // TODO


        // setup an in and out port
        this.addPort(
            new DefaultPortModel({
                in: true,
                name: 'in'
            })
        );
        this.addPort(
            new DefaultPortModel({
                in: false,
                name: 'out'
            })
        );
    }

    serialize() {
        return {
            ...super.serialize(),
            name: this.options.name,
            color: this.options.color
        };
    }

    deserialize(ob, engine) {
        super.deserialize(ob, engine);
        this.name = ob.name;
        this.color = ob.color;
    }
}
