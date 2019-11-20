* The widget is the view-side rendering of the Node
* The model is the component-side state that the Node is parameterized by
* The factory constructs particular instances of the kind of Node and ports it to the state

There is a lot of state kept in the graph module, need to either use it as the store, or synchronize it with the store.

It at least has to be synchronized with the store whenever it needs to communicate with another component.

It should at least synchronize with the store whenever nodes are selected or not selected (this implies table selections).
