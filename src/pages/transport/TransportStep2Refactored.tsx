import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import TransportWizard from "../../components/ui/TransportWizard";
import { reverseGeocode } from "../../lib/geo";
import { TransportLocationsForm } from "./TransportLocationsForm";
import { useLeafletRouteMap } from "./useLeafletRouteMap";
import { useTransportDraft, validateTransportRoute } from "./useTransportDraft";
import { WIZARD_STEPS, hasValidCoords, uid, type DestinationPoint } from "./transportUtils";

type Coordinates = { lat: number; lng: number };

export default function TransportStep2Refactored() {
  const navigate = useNavigate();
  const { draft, saveDraft } = useTransportDraft();
  const [origin, setOrigin] = useState(draft.origen ?? "");
  const [originCoordinates, setOriginCoordinates] = useState<Coordinates | null>(() =>
    hasValidCoords(draft.origenLat, draft.origenLng) ? { lat: draft.origenLat!, lng: draft.origenLng! } : null);
  const [destinations, setDestinations] = useState<DestinationPoint[]>(() =>
    draft.destinos?.length ? draft.destinos : [{ id: uid(), address: "" }]);
  const [submitted, setSubmitted] = useState(false);

  const setPointFromMap = useCallback(async ({ lat, lng }: Coordinates) => {
    const address = await reverseGeocode(lat, lng) ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    if (!originCoordinates) {
      setOrigin(address); setOriginCoordinates({ lat, lng }); return;
    }
    setDestinations((current) => {
      const emptyIndex = current.findIndex((destination) => !destination.address.trim());
      return emptyIndex >= 0
        ? current.map((destination, index) => index === emptyIndex ? { ...destination, address, lat, lng } : destination)
        : [...current, { id: uid(), address, lat, lng }];
    });
  }, [originCoordinates]);

  const mapContainerRef = useLeafletRouteMap({
    origin, originCoordinates, destinations, onMapPoint: setPointFromMap,
  });
  const currentDraft = {
    ...draft, origen: origin, origenLat: originCoordinates?.lat,
    origenLng: originCoordinates?.lng, destinos: destinations,
  };
  const errors = validateTransportRoute(currentDraft);
  const persist = () => saveDraft(currentDraft);
  const continueToReview = () => {
    setSubmitted(true);
    if (errors.origen || errors.destinos) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    persist(); navigate("/solicitudes/transporte/paso-3");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 pb-8 sm:px-0">
      <TransportWizard steps={WIZARD_STEPS} currentStep={2} />
      <header className="px-1">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-700">Ruta del viaje</p>
        <h1 className="text-2xl font-bold text-slate-900">Ubicaciones</h1>
        <p className="mt-1 text-sm text-slate-500">Define el origen y los destinos o selecciónalos en el mapa.</p>
      </header>
      {submitted && (errors.origen || errors.destinos) && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errors.origen ?? errors.destinos}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <TransportLocationsForm origin={origin} destinations={destinations}
          onOriginChange={(address, lat, lng) => {
            setOrigin(address);
            setOriginCoordinates(hasValidCoords(lat, lng) ? { lat: lat!, lng: lng! } : null);
          }} onDestinationsChange={setDestinations} />
        <section className="border-t border-slate-100 p-4 sm:p-6">
          <h2 className="mb-4 text-sm font-bold text-slate-800">Vista previa de ruta</h2>
          <div ref={mapContainerRef} aria-label="Mapa de la ruta" className="h-[340px] w-full rounded-2xl border border-slate-200 sm:h-[420px]" />
        </section>
        <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:justify-between">
          <button type="button" onClick={() => { persist(); navigate("/solicitudes/transporte/paso-1"); }}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600">Anterior</button>
          <button type="button" onClick={continueToReview}
            className="rounded-xl bg-[#0f2548] px-7 py-2.5 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-blue-500">Continuar</button>
        </footer>
      </div>
    </div>
  );
}
