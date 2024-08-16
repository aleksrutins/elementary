import element from "../dist/elementary.min.js";

element(
    // name
    "app-counter",
    // template
    // messages are hooked to events using the 'x-on' attribute as 'event1 => messageName1, event2 => messageName2, ...'
    // the dispatched message will be a tuple of [message name, event] where event is the original browser event object
    (_self, count) => `
        <div>
            <button x-on="click => increment">+</button>
            <p>${count}</p>
            <button x-on="click => decrement">-</button>
        </div>
    `,
    // initial state
    () => 0,
    // update
    (_self, state, message) => {
        switch (message[0]) {
            case "increment":
                return state + 1;
            case "decrement":
                return state - 1;
        }
    }
);

element(
    "todo-item",
    (_self, { title, done }) => `
        <label>
            <input type="checkbox" x-on="change => doneChanged" ${
                done ? "checked" : ""
            }>
            ${done ? "<strike>" : ""}
            ${title}
            ${done ? "</strike>" : ""}
        </label>
    `,
    (self) => ({
        title: self.getAttribute("title"),
        done: self.hasAttribute("done"),
    }),
    (self, state, message) => {
        switch (message[0]) {
            case "doneChanged":
                self.dispatchEvent(
                    new CustomEvent("doneChanged", {
                        detail: message[1].target.checked,
                    })
                );
                return { ...state, done: message[1].target.checked };
            case "titleChanged":
                return { ...state, title: message[1] };
        }
    },
    // observed attributes: a map of attribute names to functions that determine what message should be sent when they're changed
    [["title", (_attr, _oldValue, newValue) => ["titleChanged", newValue]]]
);

element(
    "todo-app",
    (_self, state) => `
        <div>
            <h1>What To Do?</h1>
            ${state
                .map(
                    (todo, index) => `
                    <form data-todo="${index}" x-on="submit => deleteTodo">
                        <todo-item data-todo="${index}" title="${todo.title}" ${
                        todo.done ? "done" : ""
                    } x-on="doneChanged => todoDoneChanged"></todo-item>
                        <button type="submit">Delete</button>
                    </form>
                `
                )
                .join("")}
            <form x-on="submit => addTodo">
                <input type="text" id="newTodo" autofocus>
                <button type="submit">Add Todo</button>
            </form>
        </div>
    `,
    () => [],
    (_self, state, message) => {
        switch (message[0]) {
            case "addTodo":
                state.push({
                    title: message[1].target.newTodo.value,
                    done: false,
                });

                return state;
            case "deleteTodo":
                state.splice(
                    parseInt(message[1].target.getAttribute("data-todo")),
                    1
                );
                return state;
            case "todoDoneChanged":
                state[
                    parseInt(message[1].target.getAttribute("data-todo"))
                ].done = message[1].detail;
                return state;
        }
    }
);
