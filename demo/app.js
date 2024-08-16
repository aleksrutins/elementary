import element from "../dist/elementary.min.js";

element(
    "todo-item",
    (_self, { title, done }) => `
        <label>
            <input type="checkbox" x-on="change => doneChanged" ${done ? "checked" : ""}>
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
                    }),
                );
                return { ...state, done: message[1].target.checked };
            case "titleChanged":
                return { ...state, title: message[1] };
        }
    },
    [["title", (_attr, _oldValue, newValue) => ["titleChanged", newValue]]],
);

element(
    "todo-app",
    (self, state) => `
        <div>
            <h1>What To Do?</h1>
            ${state
                .map(
                    (todo, index) => `
                    <form data-todo="${index}" x-on="submit => deleteTodo">
                        <todo-item data-todo="${index}" title="${todo.title}" ${todo.done ? "done" : ""} x-on="doneChanged => todoDoneChanged"></todo-item>
                        <button type="submit">Delete</button>
                    </form>
                `,
                )
                .join("")}
            <form x-on="submit => addTodo">
                <input type="text" id="newTodo" autofocus>
                <button type="submit">Add Todo</button>
            </form>
        </div>
    `,
    () => [],
    (self, state, message) => {
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
                    1,
                );
                return state;
            case "todoDoneChanged":
                state[
                    parseInt(message[1].target.getAttribute("data-todo"))
                ].done = message[1].detail;
                return state;
        }
    },
);
