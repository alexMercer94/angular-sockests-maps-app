import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  map: google.maps.Map;

  constructor() {}

  ngOnInit() {
    this.loadMap();
  }

  loadMap() {
    const latLng = new google.maps.LatLng(37.784679, -122.395936);
    const optionsMap: google.maps.MapOptions = {
      center: latLng,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, optionsMap);
  }
}
