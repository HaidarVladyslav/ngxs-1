import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ControlContainer, FormsModule } from '@angular/forms';
import { Observable, take } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { Todo, TodoItem, TodoState } from '../state/todo.state';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [AsyncPipe, FormsModule],
  viewProviders: [{ provide: ControlContainer, useExisting: TodosComponent }],
  template: `
  <header>
    <h2 style="display: flex; gap: 100px">You have {{ todosLength$ | async }} to complete.
      <button (click)="logout()">Logout 🚪</button>
    </h2>
  </header>
  <form>
    <div ngModelGroup="todoItem" style="display:flex; align-items:center;gap:10px">
      <input [(ngModel)]="todoItem!.title" (ngModelChange)="inputChange()" type="text" name="title">
      <button 
      (click)="todoItem.id ? confirmEditTodo() : addTodo()"
      >➕</button>
      @if (todoItem.id) {
        <button (click)="exitEditMode()">❌</button>
      }
    </div>
    <small style="color: red;font-weight:bold;">{{ errorText() }}</small>
  </form>
  <ul [class.disabled]="todoItem.id">
    @for (todo of todos$ | async; track todo.id) {
      <li>
        <span>{{ $index + 1 }}.</span>
        <button (click)="toggleTodo($event, todo)">
            @if (todo.done) {
              ✅
            } @else {
              ⬜
            }
        </button>
        <span>{{ todo.title }}</span>
        <div style="display:flex;align-items:center;gap:4px">
          <button (click)="deleteTodo($event, todo)">🗑️</button>
          <button (click)="patchTodoForEdit(todo)">✏️</button>
        </div>
      </li>
    } @empty { 
      <li>all todos done</li>
    }
  </ul>
  `,
  styles: `
    button {
      cursor: pointer; 
      background: transparent; 
      display: flex;
      justify-content: center; 
      align-items: center; 
      border: none;
      padding: 5px;
      border-radius: 4px;
      transition: background-color .4s;

      &:hover {
        background-color: lightskyblue;
      }
    }

    li {
      display: flex;
      align-items: center;
      gap: 10px;
      line-height: 27px;
    }

    .disabled {
      background-color: #cacaca;
      pointer-events: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodosComponent {
  @Select(TodoState.todos) todos$!: Observable<TodoItem[]>;
  @Select(TodoState.todosLength) todosLength$!: Observable<number>;
  store = inject(Store);

  private readonly initialTodoItemState: Partial<TodoItem> = { title: '' };
  todoItem: Partial<TodoItem> = { ...this.initialTodoItemState };

  errorText = signal('');

  public inputChange(): void {
    this.errorText.set('');
  }

  public toggleTodo(event: Event, todo: TodoItem): void {
    event.stopPropagation();
    this.store.dispatch(new Todo.ToggleDone(todo.id!));
  }

  public deleteTodo(event: Event, todo: TodoItem): void {
    event.stopPropagation();
    this.store.dispatch(new Todo.Delete(todo.id!));
  }

  public addTodo(): void {
    const title = this.todoItem.title;

    if (!title || !title.length) {
      this.errorText.set('Can\'t be null value');
      return;
    };
    this.store.dispatch(new Todo.Add(title as unknown as Pick<TodoItem, 'title'>)).pipe(take(1)).subscribe(() => this.resetInputField());
  }

  public patchTodoForEdit(todo: TodoItem): void {
    this.resetInputField();
    this.todoItem = { ...todo };
  }

  public exitEditMode(): void {
    this.resetInputField();
  }

  public confirmEditTodo(): void {
    const title = this.todoItem.title;

    if (!title || !title.length) {
      this.errorText.set('Can\'t be null value');
      return;
    };

    this.store.dispatch(new Todo.Edit({ ...this.todoItem, title, done: this.todoItem.done! })).pipe(take(1)).subscribe(() => this.resetInputField());
  }

  public logout(): void {
    this.store.dispatch(new Todo.TodoLogout()).pipe(take(1)).subscribe(() => this.resetInputField());
  }

  private resetInputField(): void {
    this.todoItem = { ...this.initialTodoItemState }
  }
}
