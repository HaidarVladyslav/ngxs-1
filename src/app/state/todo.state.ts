import { inject } from "@angular/core";
import { Action, NgxsOnInit, Selector, State, StateContext, StateToken } from "@ngxs/store";
import { TodoService } from "../shared/data-access/todo.service";
import { tap } from "rxjs";


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

@State<TodoStateModel>({
  name: TODOS_STATE_TOKEN,
  // defaults: []
  // name: 'todos',
  // defaults: {
  //   todos: []
  // }
})
export class TodoState implements NgxsOnInit {
  private todosService = inject(TodoService);

  ngxsOnInit(ctx: StateContext<TodoStateModel>): void {
    ctx.dispatch(new Todo.FetchAll());
  }

  @Selector()
  static todos(state: TodoStateModel) {
    return state.todos;
  }

  @Selector()
  static todosLength(state: TodoStateModel) {
    return state.todos.filter(todo => !todo.done).length;
  }

  @Action(Todo.FetchAll)
  fetchAllTodos(ctx: StateContext<TodoStateModel>) {
    return this.todosService.fetchAllTodos().pipe(
      tap(todos => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          todos: [...state.todos, ...todos]
        })
      })
    )
  }

  @Action(Todo.ToggleDone)
  toggleTodoDone(ctx: StateContext<TodoStateModel>, action: Todo.ToggleDone) {
    const state = ctx.getState();
    ctx.patchState({
      ...state,
      todos: state.todos.map((todo) => todo.id === action.id ? { ...todo, done: !todo.done } : todo)
    })
  }

  @Action(Todo.Delete)
  deleteTodo(ctx: StateContext<TodoStateModel>, action: Todo.Delete) {
    const state = ctx.getState();
    ctx.patchState({
      ...state,
      todos: state.todos.filter(todo => todo.id !== action.id)
    })
  }

  @Action(Todo.Add)
  addTodo(ctx: StateContext<TodoStateModel>, action: Todo.Add) {
    const state = ctx.getState();
    const newTodo = {
      title: action.payload as unknown as TodoItem['title'],
      id: crypto.randomUUID(), done: false
    }
    ctx.patchState({
      ...state,
      todos: [newTodo, ...state.todos]
    })
  }

  @Action(Todo.Edit)
  editTodo(ctx: StateContext<TodoStateModel>, action: Todo.Edit) {
    const state = ctx.getState();
    ctx.patchState({
      ...state,
      todos: state.todos.map((todo) => todo.id === action.payload.id ? { ...action.payload } : todo)
    })
  }
}
