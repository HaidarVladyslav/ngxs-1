import { inject } from "@angular/core";
import { tap } from "rxjs";
import { Action, NgxsOnInit, Selector, State, StateContext, StateToken } from "@ngxs/store";
import { TodoService } from "../shared/data-access/todo.service";

export interface TodoItem {
  id?: string;
  title: string;
  done: boolean;
}

export interface TodoStateModel {
  todos: TodoItem[];
}

const TODOS_STATE_TOKEN = new StateToken<TodoItem[]>('todos');

export namespace Todo {
  export class Add {
    static readonly type = '[Todo] Add';
    constructor(public payload: Pick<TodoItem, 'title'>) { }
  }

  export class Edit {
    static readonly type = '[Todo] Edit';
    constructor(public payload: TodoItem) { }
  }

  export class FetchAll {
    static readonly type = '[Todo] Fetch All';
  }

  export class Delete {
    static readonly type = '[Todo] Delete';
    constructor(public id: string) { }
  }

  export class ToggleDone {
    static readonly type = '[Todo] Toggle Done';
    constructor(public id: string) { }
  }

  export class TodoLogout {
    static readonly type = '[Todo] Logout';
  }
}

@State({
  name: TODOS_STATE_TOKEN,
  defaults: []
  // name: 'todos',
  // defaults: {
  //   todos: []
  // }
})
export class TodoState implements NgxsOnInit {
  private todosService = inject(TodoService);

  ngxsOnInit(ctx: StateContext<TodoItem>): void {
    ctx.dispatch(new Todo.FetchAll());
  }

  @Selector()
  static todos(state: TodoItem[]) {
    return state;
  }

  @Selector()
  static todosLength(state: TodoItem[]) {
    return state.filter(todo => !todo.done).length;
  }

  @Action(Todo.FetchAll)
  fetchAllTodos(ctx: StateContext<TodoItem[]>) {
    return this.todosService.fetchAllTodos().pipe(
      tap(todos => {
        const state = ctx.getState();
        ctx.setState([...state, ...todos]);
      })
    )
  }

  @Action(Todo.ToggleDone)
  toggleTodoDone(ctx: StateContext<TodoItem[]>, action: Todo.ToggleDone) {
    const state = ctx.getState();
    ctx.setState(state.map((todo) => todo.id === action.id ? { ...todo, done: !todo.done } : todo));
  }

  @Action(Todo.Delete)
  deleteTodo(ctx: StateContext<TodoItem[]>, action: Todo.Delete) {
    const state = ctx.getState();
    ctx.setState(state.filter(todo => todo.id !== action.id));
  }

  @Action(Todo.Add)
  addTodo(ctx: StateContext<TodoItem[]>, action: Todo.Add) {
    const state = ctx.getState();
    const newTodo = {
      title: action.payload as unknown as TodoItem['title'],
      id: crypto.randomUUID(), done: false
    }
    ctx.setState([newTodo, ...state]);
  }

  @Action(Todo.Edit)
  editTodo(ctx: StateContext<TodoItem[]>, action: Todo.Edit) {
    const state = ctx.getState();
    ctx.setState(state.map((todo) => todo.id === action.payload.id ? { ...action.payload } : todo));
  }
}
