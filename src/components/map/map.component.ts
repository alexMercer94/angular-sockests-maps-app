import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Place } from '../../interfaces/place';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  map: google.maps.Map;
  markers: google.maps.Marker[] = [];
  infoWindows: google.maps.InfoWindow[] = [];
  lugares: Place[] = [
    {
      name: 'Udemy',
      lat: 37.784679,
      lng: -122.395936
    },
    {
      name: 'Bahía de San Francisco',
      lat: 37.798933,
      lng: -122.377732
    },
    {
      name: 'The Palace Hotel',
      lat: 37.788578,
      lng: -122.401745
    }
  ];

  constructor() {}

  ngOnInit() {
    this.loadMap();
  }

  /**
   * Show map in the interface
   */
  loadMap(): void {
    const latLng = new google.maps.LatLng(37.784679, -122.395936);
    const optionsMap: google.maps.MapOptions = {
      center: latLng,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, optionsMap);

    this.map.addListener('click', coors => {
      const newMarker: Place = {
        name: 'New Place',
        lat: coors.latLng.lat(),
        lng: coors.latLng.lng(),
        id: new Date().toISOString()
      };

      this.addMarker(newMarker);

      // Emitir evento de socket, agregar marcador
    });

    for (const place of this.lugares) {
      this.addMarker(place);
    }
  }

  /**
   * Add a marker to the map
   * @param marcador Marker to add in the map
   */
  addMarker(marcador: Place): void {
    const latLng = new google.maps.LatLng(marcador.lat, marcador.lng);

    const marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng,
      draggable: true
    });

    this.markers.push(marker);

    // Info window
    const content = `<b>${marcador.name}</b>`;
    const infoWindow = new google.maps.InfoWindow({
      content
    });

    this.infoWindows.push(infoWindow);

    // * Listeners
    google.maps.event.addDomListener(marker, 'click', coors => {
      this.infoWindows.forEach(infoW => infoW.close());
      infoWindow.open(this.map, marker);
    });

    google.maps.event.addDomListener(marker, 'dblclick', coors => {
      marker.setMap(null);

      // Disparar un evento de socket, para borrar el marcador
    });

    google.maps.event.addDomListener(marker, 'drag', coors => {
      const newMarker: Place = {
        name: marcador.name,
        lat: coors.latLng.lat(),
        lng: coors.latLng.lng()
      };

      console.log(newMarker);

      // Disparar un evento de socket, para mover el marcador
    });
  }
}
