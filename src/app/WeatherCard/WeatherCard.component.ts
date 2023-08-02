import { Component, Input, OnInit } from '@angular/core';
import WeatherData from '../Models/WeatherDataModel';

@Component({
  templateUrl: './WeatherCard.component.html',
  styleUrls: ['./WeatherCard.component.css'],
  selector: 'weather-card',
})
export class WeatherCard implements OnInit {
  @Input() weatherData!: WeatherData;

  ngOnInit(): void {
    console.log(this.weatherData);
  }

  formattDate() {
    const dd = String(this.weatherData.locationTime.getDate()).padStart(2, '0');
    const mm = String(this.weatherData.locationTime.getMonth() + 1).padStart(
      2,
      '0'
    );
    const yyyy = this.weatherData.locationTime.getFullYear();

    return mm + '/' + dd + '/' + yyyy;
  }

  getFahAndCel() {
    const fah = ((this.weatherData.temp - 273.15) * 9) / 5 + 32;
    const cel = this.weatherData.temp - 273.15;

    return {
      fah: Math.round(fah),
      cel: Math.round(cel),
    };
  }
}
