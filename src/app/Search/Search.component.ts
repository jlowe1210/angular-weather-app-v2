import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { EMPTY, fromEvent, Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'weather-search',
  templateUrl: './Search.component.html',
  styleUrls: ['./Search.component.css'],
})
export class SearchComponent implements AfterViewInit {
  @ViewChild('searchLocationBtn') searchLocationBtn!: ElementRef;
  public location: string = '';
  public locationObs$!: Observable<any>;

  constructor() {}

  ngAfterViewInit(): void {
    this.locationObs$ = fromEvent(
      this.searchLocationBtn.nativeElement,
      'click'
    ).pipe(
      switchMap(() => {
        if (this.location.length === 0) {
          return EMPTY;
        }

        return new Observable((observer) => {
          observer.next(this.location);
        });
      }),
      tap(() => {
        this.location = '';
      })
    );
  }
}
