import { ChangeDetectionStrategy, Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core'
import { Book } from '../../shared/interface/book.interface'

@Component({
  standalone: true,
  selector: 'app-book-item',
  templateUrl: './book-item.component.html',
  styleUrl: './book-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookItemComponent {
  public book: InputSignal<Book> = input.required()
  public editBook: OutputEmitterRef<string> = output()
}
