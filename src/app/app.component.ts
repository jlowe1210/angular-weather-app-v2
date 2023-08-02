import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';

import mapboxgl, { Map, MapMouseEvent } from 'mapbox-gl';
import { catchError, EMPTY, merge, Observable, switchMap, tap } from 'rxjs';
import WeatherData from './Models/WeatherDataModel';
import { SearchComponent } from './Search/Search.component';
import keys from 'src/KEYS';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit, OnInit {
  title = 'weatherapp-angular';
  public errorMessage: string = '';
  public loading: boolean = false;
  @ViewChild('map') mapDiv!: ElementRef;
  @ViewChild(SearchComponent) searchComponent!: SearchComponent;
  public weatherData!: WeatherData | null;
  public map!: Map;

  constructor(private readonly Http: HttpClient) {}

  ngOnInit(): void {
    mapboxgl.accessToken = keys.accessToken;

    this.Http.get<any>(
      `http://api.openweathermap.org/geo/1.0/direct?q=la&limit=1&appid=${keys.openweathermapid}`
    ).subscribe((test) => {
      console.log(test);
    });

    this.Http.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=40&lon=-96&appid=${keys.openweathermapid}`
    ).subscribe(console.log);
  }

  ngAfterViewInit(): void {
    this.map = new mapboxgl.Map({
      container: this.mapDiv.nativeElement, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: [-96, 40], // starting position [lng, lat]
      zoom: 4, // starting zoom
    });

    const mapClickObservable = new Observable((observer) => {
      this.map.on('click', (e: MapMouseEvent) => {
        const { lng, lat } = e.lngLat;
        observer.next({ lng, lat });
      });
    });

    merge(mapClickObservable, this.searchComponent.locationObs$)
      .pipe(
        switchMap((coordsOrLocation) => {
          if (typeof coordsOrLocation === 'object') {
            return this.Http.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${coordsOrLocation.lat}&lon=${coordsOrLocation.lng}&appid=${keys.openweathermapid}`
            ).pipe(
              catchError((err) => {
                this.loading = false;
                return EMPTY;
              })
            );
          }
          if (typeof coordsOrLocation === 'string') {
            return this.Http.get(
              `https://api.openweathermap.org/data/2.5/weather?q=${coordsOrLocation}&appid=${keys.openweathermapid}`
            ).pipe(
              catchError((err) => {
                this.loading = false;
                this.errorMessage = 'Location not Found';
                console.clear();
                this.weatherData = null;
                return EMPTY;
              })
            );
          }
          return EMPTY;
        }),

        tap((test: any) => {
          this.errorMessage = '';
          this.loading = true;
          this.map.setCenter({ lng: test.coord.lon, lat: test.coord.lat });
          this.map.setZoom(10);
        })
      )
      .subscribe((value) => {
        this.loading = false;
        this.weatherData = {
          name: value.name,
          temp: value.main.temp,
          weather_description: value.weather[0].description,
          weather_icon: value.weather[0].icon,
          locationTime: new Date((value.sys.sunrise + value.timezone) * 1000),
        };
      });

    this.map.addControl(new mapboxgl.NavigationControl());
  }
}
