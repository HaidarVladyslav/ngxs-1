import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TodoItem } from '../../state/todo.state';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  public fetchAllTodos(): Observable<TodoItem[]> {
    return of([{ id: '1', title: 'But Milk', done: false }]);
  }
}
