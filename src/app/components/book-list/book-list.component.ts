import { ChangeDetectionStrategy, Component, computed, OnInit, Signal } from '@angular/core'
import { Book } from '../../shared/interface/book.interface'
import { BookService } from '../../services/book.service'
import { BookItemComponent } from '../book-item/book-item.component'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { BookDialogComponent } from '../book-dialog/book-dialog.component'
import { debounceTime, take } from 'rxjs'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { toSignal } from '@angular/core/rxjs-interop'

@Component({
  standalone: true,
  selector: 'app-book-list',
  imports: [
    BookItemComponent,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListComponent implements OnInit {
  public searchControl: FormControl<string | null> = new FormControl('')
  public books: Signal<Book[]> = computed(() => {
    const list = this.bookService.fullList()
    const searchValue = this.searchValue()?.toLocaleLowerCase()
    return searchValue
      ? list.filter(
          (book) =>
            book.title.toLocaleLowerCase().includes(searchValue) ||
            book.author.toLocaleLowerCase().includes(searchValue),
        )
      : list
  })

  private searchValue: Signal<string | null> = toSignal(this.searchControl.valueChanges.pipe(debounceTime(500)), {
    initialValue: '',
  })

  public constructor(
    private bookService: BookService,
    private dialog: MatDialog,
    private matSnackBar: MatSnackBar,
  ) {}

  public ngOnInit(): void {
    this.bookService.getBooks().subscribe()
  }

  public onAddNewBook(): void {
    const dialogRef = this.dialog.open(BookDialogComponent, {
      enterAnimationDuration: '500ms',
      exitAnimationDuration: '500ms',
    })

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result?.action === 'create') {
          this.addBook(result.data)
        }
      })
  }

  public onEditBook(id: string): void {
    const book = this.books().find((item) => item.id === id)
    const dialogRef = this.dialog.open(BookDialogComponent, {
      data: book,
      enterAnimationDuration: '500ms',
      exitAnimationDuration: '500ms',
    })

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result?.action === 'edit') {
          this.updateBook(id, result.data)
        } else if (result?.action === 'delete') {
          this.deleteBook(id)
        }
      })
  }

  private addBook(data: Book): void {
    this.bookService.createBook(data).subscribe({
      next: () => {
        this.showSuccessSnackBar('Book successfully added!!!')
      },
      error: () => {
        this.showErrorSnackBar()
      },
    })
  }

  private updateBook(id: string, data: Book): void {
    this.bookService.updateBook(id, data).subscribe({
      next: () => {
        this.showSuccessSnackBar('Book successfully edited!!!')
      },
      error: () => {
        this.showErrorSnackBar()
      },
    })
  }

  private deleteBook(id: string): void {
    this.bookService.deleteBook(id).subscribe({
      next: () => {
        this.showSuccessSnackBar('Book successfully deleted!!!')
      },
      error: () => {
        this.showErrorSnackBar()
      },
    })
  }

  private showErrorSnackBar(): void {
    this.matSnackBar.open('Ooops... something went wrong :(((', 'error', { duration: 2000 })
  }
  private showSuccessSnackBar(message: string): void {
    this.matSnackBar.open(message, 'success', {
      duration: 2000,
    })
  }
}
