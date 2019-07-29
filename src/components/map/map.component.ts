import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Place } from '../../interfaces/place';
import { WebsocketService } from '../../providers/websocket.service';

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
  lugares: Place[] = [];

  constructor(private http: HttpClient, private wsService: WebsocketService) {}

  ngOnInit() {
    this.http.get('http://localhost:3000/map').subscribe((places: Place[]) => {
      this.lugares = places;
      this.loadMap();
    });

    this.listenSockets();
  }

  listenSockets(): void {
    // Socket Marcador-nuevo
    this.wsService.listen('new-marker').subscribe((marker: Place) => {
      this.addMarker(marker);
    });

    // Socket Marcador-mover
    this.wsService.listen('move-marker').subscribe((marker: Place) => {
      for (const i in this.markers) {
        if (this.markers[i].getTitle() === marker.id) {
          const latLng = new google.maps.LatLng(marker.lat, marker.lng);
          this.markers[i].setPosition(latLng);
          break;
        }
      }
    });

    // Socket Marcador-borrar
    this.wsService.listen('delete-marker').subscribe((id: string) => {
      // Delete marker of the Markers Array
      for (const i in this.markers) {
        if (this.markers[i].getTitle() === id) {
          this.markers[i].setMap(null);
          break;
        }
      }
    });
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
      this.wsService.emit('new-marker', newMarker);
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
      draggable: true,
      title: marcador.id
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
      this.wsService.emit('delete-marker', marcador.id);
    });

    google.maps.event.addDomListener(marker, 'drag', coors => {
      const newMarker: Place = {
        name: marcador.name,
        lat: coors.latLng.lat(),
        lng: coors.latLng.lng(),
        id: marker.getTitle()
      };

      // Disparar un evento de socket, para mover el marcador
      this.wsService.emit('move-marker', newMarker);
    });
  }
}
