import { NgxsNextPluginFn, getActionTypeFromInstance } from "@ngxs/store";
import { Todo } from "../todo.state";

export function logoutPlugin(state: any, action: any, next: NgxsNextPluginFn) {
  if (getActionTypeFromInstance(action) === Todo.TodoLogout.type) {
    state = {};
  }

  return next(state, action);
}