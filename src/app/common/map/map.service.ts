import {Injectable} from '@angular/core';

import {Http} from '@angular/http';
import {Observable} from 'rxjs/Rx';

import {GeoCodeResponse, Location, Marker, IconType} from './map.model.ts';

const KEY_HOME = 'home';

@Injectable()
export class MapService {
    constructor(private http: Http) {
       if(this.getCachedHome()===null || this.getCachedHome()===undefined){
            this.cacheHome({ name:'home', address:'Budapest, Ferenciek tere 1', location: {lat: 47.4933, lng: 19.0578}, color: '55ee55' });
       }
    }

    public cacheHome(marker: Marker) {
        localStorage.setItem(KEY_HOME, JSON.stringify(marker));
    }

    public getCachedHome(): Marker {
        var homeString = localStorage.getItem(KEY_HOME);
        if (homeString) {
            try {
                return <Marker>JSON.parse(homeString);
            }
            catch (e) {
                console.error(e);
            }
        }
        return null;
    }

    public getIconUrl(type: IconType, color: string): string {
        var iconId = this.getIconIdForType(type);
        return `${process.env.GCHARTS_ICON_SERVICE}${iconId}|${color}`;
    }

    private getIconIdForType(type: IconType) {
        switch (type) {
            case IconType.HOME:
                return "?chst=d_map_pin_icon&chld=home";
            default:
                return "?chst=d_map_pin_letter&chld=%E2%80%A2";
        }
    }

    public getLocation(address: string): Observable<Location> {
        return this.http.get(`${process.env.GEOCODE_SERVICE}?address=${encodeURI(address)}&sensor=false`)
            .map((res) => <GeoCodeResponse>res.json())
            .map((geoResp) => geoResp.results[0].geometry.location);
    }

    public calculateDistance(providerLocation: Location, homeLocation: Location):number {
      // haversine formula, see http://www.movable-type.co.uk/scripts/latlong.html for details
      var R = 6371000, // metres
      fi1 = toRadians(providerLocation.lat),
      fi2 = toRadians(homeLocation.lat),
      deltaFi = toRadians(homeLocation.lat - providerLocation.lat),
      deltaLambda = toRadians(homeLocation.lng - providerLocation.lng),
      a = Math.sin(deltaFi/2) * Math.sin(deltaFi/2) +
              Math.cos(fi1) * Math.cos(fi2) *
              Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2),
      c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return Math.round(R * c);
    }
}

function toRadians(num: number):number {
  return num * Math.PI / 180;
}
