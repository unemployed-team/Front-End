declare namespace kakao.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class LatLngBounds {
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
  }

  class Map {
    constructor(container: HTMLElement, options: { center: LatLng; level: number });
    getLevel(): number;
    getBounds(): LatLngBounds;
  }

  class CustomOverlay {
    constructor(options: { map: Map; position: LatLng; content: HTMLElement });
    setMap(map: Map | null): void;
  }

  namespace event {
    function addListener(
      target: Map,
      type: string,
      handler: () => void
    ): void;
  }

  function load(callback: () => void): void;
}

declare const kakao: {
  maps: typeof kakao.maps;
};
