import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TodosComponent } from "./todos/todos.component";

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <app-todos />
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TodosComponent]
})
export class AppComponent {
  title = 'ngxs-1';
}
