import { ChangeDetectionStrategy, Component, Inject, OnInit, Signal, TemplateRef, viewChild } from '@angular/core'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Book } from '../../shared/interface/book.interface'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

@Component({
  standalone: true,
  selector: 'app-book-dialog',
  imports: [MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatInputModule, MatIconModule],
  templateUrl: './book-dialog.component.html',
  styleUrl: './book-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDialogComponent implements OnInit {
  public deleteDialog: Signal<TemplateRef<HTMLElement> | undefined> = viewChild('deleteDialog')
  public bookForm!: FormGroup<{
    title: FormControl<string | null>
    author: FormControl<string | null>
    year: FormControl<number | null>
  }>
  public isEditMode: boolean = false

  public get title(): string {
    return this.data ? (this.isEditMode ? 'Edit book' : 'View book') : 'Add new book'
  }

  constructor(
    private dialogRef: MatDialogRef<BookDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: Book | null,
    private fb: FormBuilder,
  ) {}

  public ngOnInit(): void {
    this.bookForm = this.fb.group({
      title: [this.data?.title || '', [Validators.required]],
      author: [this.data?.author || '', [Validators.required]],
      year: [
        this.data?.year || null,
        [Validators.required, Validators.min(1000), Validators.max(new Date().getFullYear())],
      ],
    })
    if (this.data) {
      this.bookForm!.disable()
    }
  }

  public onSubmit(): void {
    if (this.bookForm.valid) {
      this.dialogRef.close({
        action: this.data ? 'edit' : 'create',
        data: this.bookForm.value,
      })
    }
  }

  public onCancel(): void {
    if (this.data && this.isEditMode) {
      this.resetForm()
      this.bookForm.disable()
    }
    !this.isEditMode || !this.data ? this.dialogRef.close({ action: 'close' }) : (this.isEditMode = false)
  }

  public allowEdit(): void {
    this.isEditMode = !this.isEditMode
    if (this.isEditMode) {
      this.bookForm.enable()
    } else {
      this.bookForm.disable()
      this.resetForm()
    }
  }

  public onOpenDeleteBookDialog(): void {
    const dialogRef = this.dialog.open(this.deleteDialog() as TemplateRef<HTMLElement>, {
      enterAnimationDuration: '500ms',
      exitAnimationDuration: '500ms',
    })
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dialogRef.close({
          action: 'delete',
          data: this.bookForm.value,
        })
      }
    })
  }

  private resetForm(): void {
    this.bookForm.reset({
      title: this.data?.title,
      author: this.data?.author,
      year: this.data?.year,
    })
  }
}
