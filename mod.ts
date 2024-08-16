/**
 * Creates a custom HTML element class.
 *
 * @template State - The type of the state object.
 * @template Message - The type of the message tuple, where the first element is a string and the second element is unknown.
 * @param {string} name - The name of the custom element.
 * @param {(self: Element, state: State) => string} template - A function that returns the HTML template as a string, given the current state.
 * @param {(self: Element) => State} initialState - A function that returns the initial state.
 * @param {(self: Element, state: State, message: Message) => State} update - A function that updates the state based on a message.
 * @param {[string, (name: string, oldValue: string, newValue: string) => Message][]} [observedAttributes=[]] - An array of tuples where the first element is the attribute name and the second element is a function that returns a message to dispatch when the attribute changes.
 * @returns {typeof HTMLElement} - The custom HTML element class.
 */
export default <State, Message extends [string, unknown]>(
    name: string,
    template: (self: Element, state: State) => string,
    initialState: (self: Element) => State,
    update: (self: Element, state: State, message: Message) => State,
    observedAttributes: [
        string,
        (name: string, oldValue: string, newValue: string) => Message
    ][] = []
): typeof HTMLElement => {
    const elementClass = class extends HTMLElement {
        static observedAttributes = observedAttributes.map((it) => it[0]);

        #state = initialState(this);

        #render() {
            this.shadowRoot!.innerHTML = template(this, this.#state);

            // Attach event listeners
            this.shadowRoot!.querySelectorAll("[x-on]").forEach((el) => {
                const events = new Map(
                    el
                        .getAttribute("x-on")!
                        .split(/\s*,\s*/)
                        .map((str) => str.split(/\s*=>\s*/)) as [
                        keyof ElementEventMap,
                        Message[0]
                    ][]
                );

                events.forEach((message, event) =>
                    el.addEventListener(event, (ev) =>
                        this.dispatch([message, ev] as Message)
                    )
                );
            });
        }

        connectedCallback() {
            this.attachShadow({ mode: "open" });
            this.#render();
        }

        attributeChangedCallback(
            name: string,
            oldValue: string,
            newValue: string
        ) {
            const handler = observedAttributes.find((it) => it[0] == name);
            if (handler) {
                this.dispatch(handler[1](name, oldValue, newValue));
            }
        }

        dispatch(message: Message) {
            this.#state = update(this, this.#state, message);
            this.#render();
        }
    };

    customElements.define(name, elementClass);
    return elementClass;
};
