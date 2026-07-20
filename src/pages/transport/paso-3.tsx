// src/pages/transport/paso-3.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRequest } from "../../services/requests.service";
import { geocodeAddress } from "../../lib/geo";
import SuccessScreen from "../../components/transport/SuccessScreen";
import TransportWizard from "../../components/ui/TransportWizard";
import MapViewer from "../../components/transport/MapViewer";
import { VEHICULO_LABELS, type WizardData } from "./transportUtils";
import { transportDraftStorage } from "./useTransportDraft";
import { SectionTitle } from "./FormPrimitives";

export default function TransportStep3Page() {
  const navigate = useNavigate();

  const submittedRef = useRef(false);

  const [wizardData, setWizardData] = useState<WizardData>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number; isReal: boolean } | null>(null);
  const [successId, setSuccessId] = useState<string | undefined>(undefined);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const saved = transportDraftStorage.read() ?? {};
    const ok =
      !!saved.tipoVehiculo &&
      !!saved.fecha &&
      !!saved.hora &&
      !!saved.encargado &&
      !!saved.pasajeros &&
      !!saved.origen &&
      Array.isArray(saved.destinos) &&
      !!saved.destinos[0]?.address?.trim();
    if (!ok) {
      navigate("/solicitudes/transporte/paso-1", { replace: true });
      return;
    }
    setWizardData(saved);
    setLoading(false);
  }, [navigate]);

  const mapOrigin = useMemo(
    () => ({ address: wizardData.origen || "", lat: wizardData.origenLat, lng: wizardData.origenLng }),
    [wizardData.origen, wizardData.origenLat, wizardData.origenLng]
  );

  const mapDestinations = useMemo(
    () => (wizardData.destinos || [])
      .filter((d) => d.address?.trim())
      .map((d) => ({ address: d.address, lat: d.lat, lng: d.lng })),
    [wizardData.destinos]
  );

  const destinosValidos = useMemo(
    () => (wizardData.destinos || []).filter((d) => d.address?.trim()),
    [wizardData.destinos]
  );

  async function handleSubmit() {
    if (submittedRef.current || submitting) return;
    submittedRef.current = true;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const fechaStr = wizardData.fecha || new Date().toISOString().split("T")[0];
      const horaStr = wizardData.hora || "08:00";
      const horaFinal = horaStr.length === 5 ? `${horaStr}:00` : horaStr;

      const origenCoords =
        wizardData.origenLat && wizardData.origenLng
          ? { lat: wizardData.origenLat, lng: wizardData.origenLng }
          : await geocodeAddress(wizardData.origen || "");

      const destinoPrincipal = destinosValidos[0];
      const destinoCoords =
        destinoPrincipal?.lat && destinoPrincipal?.lng
          ? { lat: destinoPrincipal.lat, lng: destinoPrincipal.lng }
          : await geocodeAddress(destinoPrincipal?.address || "");

      const destinoAdicional = destinosValidos[1];
      const destinoAdicionalCoords = destinoAdicional
        ? destinoAdicional.lat && destinoAdicional.lng
          ? { lat: destinoAdicional.lat, lng: destinoAdicional.lng }
          : await geocodeAddress(destinoAdicional.address)
        : null;

      const resp = await createRequest({
        destino_principal: destinoPrincipal?.address || "Sin destino",
        encargado: wizardData.encargado || "Sin encargado",
        tipo_vehiculo: wizardData.tipoVehiculo || "sedan",
        fecha_salida: `${fechaStr}T${horaFinal}`,
        hora_salida: horaStr,
        fecha_retorno: `${fechaStr}T23:59:59`,
        destino_adicional: destinosValidos.slice(1).map((d) => d.address).join(" | ") || null,
        motivo_actividad: `Soli. Transporte - ${wizardData.encargado}`,
        cantidad_personas: parseInt(wizardData.pasajeros || "1"),
        origen: wizardData.origen || "Sin origen",
        subencargado: wizardData.subencargado,
        unidad_solicitante_id: 1,
        prioridad: "media",
        origen_lat: origenCoords?.lat,
        origen_lng: origenCoords?.lng,
        destino_lat: destinoCoords?.lat,
        destino_lng: destinoCoords?.lng,
        destino_adicional_lat: destinoAdicionalCoords?.lat,
        destino_adicional_lng: destinoAdicionalCoords?.lng,
      });

      transportDraftStorage.remove();
      setSuccessId(resp.solicitudId?.toString());
      setShowSuccess(true);
    } catch (e: unknown) {
      submittedRef.current = false;
      setErrorMsg(e instanceof Error ? e.message : "Error al enviar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  if (showSuccess) return <SuccessScreen solicitudId={successId} />;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 pb-8 sm:px-0">
      <TransportWizard
        steps={[
          { id: 1, label: "Datos" },
          { id: 2, label: "Ruta" },
          { id: 3, label: "Confirmar" },
        ]}
        currentStep={3}
      />

      <div className="px-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="inline-block h-[2px] w-5 rounded-full bg-blue-700" />
          <span className="text-[10px] font-black uppercase tracking-[.18em] text-blue-700">
            Último Paso
          </span>
        </div>
        <h1 className="text-2xl font-bold leading-none tracking-tight text-slate-900 sm:text-[28px]">
          Confirmación
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
          Verifica los datos de tu solicitud institucional antes de enviarlos al
          sistema.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[12px] text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4 sm:p-6">
          <SectionTitle
            label="Resumen del Servicio"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />

          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vehículo</span>
              <p className="text-[13px] font-bold text-slate-700">
                {wizardData.tipoVehiculo ? VEHICULO_LABELS[wizardData.tipoVehiculo] : "—"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha y Hora</span>
              <p className="text-[13px] font-bold text-slate-700">{wizardData.fecha} • {wizardData.hora}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Encargado</span>
              <p className="text-[13px] font-bold text-slate-700">{wizardData.encargado}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pasajeros</span>
              <p className="text-[13px] font-bold text-slate-700">{wizardData.pasajeros} personas</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <SectionTitle
            label="Itinerario"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            }
          />

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-[#0f2548] ring-4 ring-blue-50" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Desde</span>
                <p className="text-[13px] font-medium leading-tight text-slate-600">{wizardData.origen}</p>
              </div>
            </div>

            {destinosValidos.map((d, i) => (
              <div key={d.id} className="flex items-start gap-3">
                <div className="mt-1 h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-50" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Destino {i + 1}
                  </span>
                  <p className="text-[13px] font-medium leading-tight text-slate-600">{d.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <SectionTitle
            label="Vista de Mapa"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
          />
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
            <MapViewer
              origin={mapOrigin}
              destinations={mapDestinations}
              className="h-[340px] sm:h-[400px]"
              onRouteCalculated={setRouteInfo}
            />
            {routeInfo && (
              <div className="absolute bottom-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/90 px-5 py-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl ring-1 ring-white/50 transition-all hover:bg-white/95 sm:left-auto sm:right-4 sm:w-auto sm:justify-start">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase leading-none tracking-widest text-slate-400">Distancia</span>
                    <span className="mt-0.5 text-sm font-extrabold tracking-tight text-slate-900">
                      {routeInfo.distance.toFixed(1)}{" "}
                      <span className="text-[10px] font-bold text-slate-400">km</span>
                    </span>
                  </div>
                </div>
                <div className="hidden h-8 w-[1px] bg-slate-200/60 sm:block" />
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase leading-none tracking-widest text-slate-400">Tiempo est.</span>
                    <span className="mt-0.5 text-sm font-extrabold tracking-tight text-slate-900">
                      {routeInfo.duration.toFixed(0)}{" "}
                      <span className="text-[10px] font-bold text-slate-400">min</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate("/solicitudes/transporte/paso-2")}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-700 hover:shadow-sm focus:outline-none disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Corregir
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-2.5 text-[13px] font-bold text-white transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-70"
            style={{
              background: "linear-gradient(135deg, #0f2548 0%, #2354b4 100%)",
              boxShadow: "0 4px 16px rgba(15,37,72,0.22), 0 1px 4px rgba(15,37,72,0.1)",
            }}
          >
            {submitting ? "Enviando..." : "Enviar Solicitud"}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
