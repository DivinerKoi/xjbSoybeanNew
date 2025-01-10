declare namespace AMap {
  class Map {
    constructor(container: string | HTMLElement, options: MapOptions);
    on(event: string, callback: Function): void;
    getCenter(): LngLat;
    setCenter(position: [number, number]): void;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setPosition(position: [number, number]): void;
  }

  class PlaceSearch {
    constructor(options: PlaceSearchOptions);
    search(keyword: string, callback: (status: string, result: any) => void): void;
  }

  class Geocoder {
    constructor(options?: any);
  }

  class LngLat {
    getLng(): number;
    getLat(): number;
  }

  interface MapOptions {
    zoom?: number;
    center?: [number, number];
    viewMode?: string;
  }

  interface MarkerOptions {
    position?: [number, number];
    draggable?: boolean;
    map: Map;
  }

  interface PlaceSearchOptions {
    city?: string;
  }

  function plugin(plugins: string[], callback: () => void): void;
}
