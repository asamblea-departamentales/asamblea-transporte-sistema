import L from "leaflet";

const PIN_SVG = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

const dataUri = (color: string) =>
  "data:image/svg+xml;base64," + btoa(PIN_SVG(color));

export const ICON_ORIGIN = L.icon({
  iconUrl: dataUri("#0f2548"),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export const ICON_DEST = L.icon({
  iconUrl: dataUri("#ef4444"),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export const makeIcon = (color: string) =>
  L.icon({
    iconUrl: dataUri(color),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

export const SV_BOUNDS: L.LatLngBoundsExpression = [
  [12.97, -90.2],
  [14.55, -87.6],
];
