import LocationInput from "../../components/transport/LocationInput";
import { Label, SectionTitle } from "./FormPrimitives";
import { hasValidCoords, uid, type DestinationPoint } from "./transportUtils";

type Props = {
  origin: string;
  onOriginChange: (address: string, lat?: number, lng?: number) => void;
  destinations: DestinationPoint[];
  onDestinationsChange: (destinations: DestinationPoint[]) => void;
};

export function TransportLocationsForm(props: Props) {
  const updateDestination = (id: string, address: string, lat?: number, lng?: number) => {
    props.onDestinationsChange(props.destinations.map((destination) => destination.id === id
      ? { ...destination, address, lat: hasValidCoords(lat, lng) ? lat : undefined, lng: hasValidCoords(lat, lng) ? lng : undefined }
      : destination));
  };

  return (
    <div className="divide-y divide-slate-100">
      <section className="p-4 sm:p-6">
        <SectionTitle label="Punto de salida" icon={<span aria-hidden>●</span>} />
        <Label required>Origen</Label>
        <LocationInput id="origen" label="" value={props.origin} onChange={props.onOriginChange} placeholder="Punto de inicio..." />
      </section>
      <section className="p-4 sm:p-6">
        <SectionTitle label="Destinos de la ruta" icon={<span aria-hidden>◆</span>} />
        <div className="space-y-5">
          {props.destinations.map((destination, index) => (
            <div key={destination.id}>
              <div className="mb-2 flex items-center justify-between">
                <Label required={index === 0}>Parada {index + 1}</Label>
                {props.destinations.length > 1 && (
                  <button type="button" className="text-xs font-bold text-red-500" onClick={() =>
                    props.onDestinationsChange(props.destinations.filter((item) => item.id !== destination.id))}>
                    Remover
                  </button>
                )}
              </div>
              <LocationInput id={`dest-${destination.id}`} value={destination.address}
                onChange={(address, lat, lng) => updateDestination(destination.id, address, lat, lng)}
                placeholder="Escriba el destino..." />
            </div>
          ))}
          <button type="button" onClick={() => props.onDestinationsChange([
            ...props.destinations, { id: uid(), address: "" },
          ])} className="w-full rounded-xl border-2 border-dashed border-slate-200 py-3 text-xs font-bold text-slate-500">
            Añadir otra parada
          </button>
        </div>
      </section>
    </div>
  );
}
