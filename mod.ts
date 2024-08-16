export default <State, Message extends [string, unknown]>(
    name: string,
    template: (self: Element, state: State) => string,
    initialState: (self: Element) => State,
    update: (self: Element, state: State, message: Message) => State,
    observedAttributes: [
        string,
        (name: string, oldValue: string, newValue: string) => Message,
    ][] = [],
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
                        Message[0],
                    ][],
                );

                events.forEach((message, event) =>
                    el.addEventListener(event, (ev) =>
                        this.dispatch([message, ev] as Message),
                    ),
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
            newValue: string,
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
