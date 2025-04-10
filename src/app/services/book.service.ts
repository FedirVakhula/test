import { HttpClient } from '@angular/common/http'
import { Injectable, signal, WritableSignal } from '@angular/core'
import { Book } from '../shared/interface/book.interface'
import { Observable, switchMap, tap } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class BookService {
  public fullList: WritableSignal<Book[]> = signal([])
  private apiUrl = 'http://localhost:3000/books'

  constructor(private http: HttpClient) {}

  public getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl).pipe(tap((data) => this.fullList.set(data ?? [])))
  }

  public createBook(book: Omit<Book, 'id'>): Observable<Book[]> {
    return this.http.post<Book>(this.apiUrl, book).pipe(switchMap(() => this.getBooks()))
  }

  public updateBook(id: string, book: Book): Observable<Book[]> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, book).pipe(switchMap(() => this.getBooks()))
  }

  public deleteBook(id: string): Observable<Book[]> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(switchMap(() => this.getBooks()))
  }
}
