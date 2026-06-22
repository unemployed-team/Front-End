declare namespace kakao.maps {
  class LatLng {
    constructor(lat: number, lng: number);
  }

  class Map {
    constructor(container: HTMLElement, options: { center: LatLng; level: number });
    getLevel(): number;
  }

  class CustomOverlay {
    constructor(options: { map: Map; position: LatLng; content: HTMLElement });
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
