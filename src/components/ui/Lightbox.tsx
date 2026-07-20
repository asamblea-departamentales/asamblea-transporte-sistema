import { useEffect, useState, useCallback, useRef } from "react";
import {
  X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut,
  Maximize2, FileText,
} from "lucide-react";
import { FocusTrap } from "./FocusTrap";

// ─── Types ───────────────────────────────────────────────────────────────────

type LightboxFile = {
  url: string;
  name: string;
  isImage: boolean;
};

type Props = {
  files: LightboxFile[];
  initialIndex: number;
  onClose: () => void;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Lightbox({ files, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [show, setShow] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const file = files[index];
  const total = files.length;
  const canPrev = index > 0;
  const canNext = index < total - 1;

  const handleClose = useCallback(() => {
    setShow(false);
    window.setTimeout(onClose, 280);
  }, [onClose]);

  // ── Entrance animation ──────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 20);
    return () => clearTimeout(t);
  }, []);

  // ── Reset zoom & loaded state when index changes ────────────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the viewer for the selected file.
    setZoom(1);
    setImgLoaded(false);
  }, [index]);

  // ── Keyboard nav ────────────────────────────────────────────────────────
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && canPrev) setIndex((i) => i - 1);
      if (e.key === "ArrowRight" && canNext) setIndex((i) => i + 1);
      if (e.key === "+" || e.key === "=") setZoom((z) => clamp(z + 0.5, 1, 4));
      if (e.key === "-") setZoom((z) => clamp(z - 0.5, 1, 4));
    },
    [canPrev, canNext],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  // ── Close with exit animation ───────────────────────────────────────────
// ── Swipe handlers (mobile) ─────────────────────────────────────────────
  function onTouchStart(e: React.TouchEvent) {
    if (zoom > 1) return;
    setDragStart(e.touches[0].clientX);
  }
  function onTouchMove(e: React.TouchEvent) {
    if (dragStart === null || zoom > 1) return;
    setDragDelta(e.touches[0].clientX - dragStart);
  }
  function onTouchEnd() {
    if (dragStart === null) return;
    if (dragDelta > 80 && canPrev) setIndex((i) => i - 1);
    else if (dragDelta < -80 && canNext) setIndex((i) => i + 1);
    setDragStart(null);
    setDragDelta(0);
  }

  // ── Zoom toggle ─────────────────────────────────────────────────────────
  function toggleZoom() {
    setZoom((z) => (z === 1 ? 2.5 : 1));
  }

  return (
    <FocusTrap
      onEscape={handleClose}
      className={`fixed inset-0 z-[9999] transition-all duration-300 ${
        show
          ? "bg-black/90 backdrop-blur-md"
          : "bg-black/0 backdrop-blur-none"
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Visor de archivos: ${file.name}`}
        className="flex h-full flex-col"
        onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div
        className={`flex items-center justify-between px-4 py-3 sm:px-6 transition-all duration-300 ${
          show ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        {/* File info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
            {file.isImage ? (
              <Maximize2 className="h-4 w-4 text-white/70" />
            ) : (
              <FileText className="h-4 w-4 text-white/70" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white/90">
              {file.name}
            </p>
            <p className="text-[11px] font-medium text-white/40">
              {index + 1} de {total}
              {file.isImage && zoom > 1 && (
                <span className="ml-2 text-blue-400">
                  {Math.round(zoom * 100)}%
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {file.isImage && (
            <>
              <button
                onClick={() => setZoom((z) => clamp(z - 0.5, 1, 4))}
                disabled={zoom <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                title="Reducir"
                aria-label="Reducir imagen"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoom((z) => clamp(z + 0.5, 1, 4))}
                disabled={zoom >= 4}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                title="Ampliar"
                aria-label="Ampliar imagen"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <div className="mx-1 h-5 w-px bg-white/10" />
            </>
          )}

          <a
            href={file.url}
            download={file.name}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white"
            title="Descargar"
            aria-label={`Descargar ${file.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="h-4 w-4" />
          </a>

          <div className="mx-1 h-5 w-px bg-white/10" />

          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition hover:bg-red-500/20 hover:text-red-400"
            title="Cerrar (ESC)"
            aria-label="Cerrar visor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-4"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Navigation arrows */}
        {canPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => i - 1);
            }}
            aria-label="Archivo anterior"
            className={`absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white/70 shadow-lg backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white active:scale-95 sm:left-6 ${
              show
                ? "translate-x-0 opacity-100"
                : "-translate-x-4 opacity-0"
            }`}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {canNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => i + 1);
            }}
            aria-label="Archivo siguiente"
            className={`absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white/70 shadow-lg backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white active:scale-95 sm:right-6 ${
              show
                ? "translate-x-0 opacity-100"
                : "translate-x-4 opacity-0"
            }`}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Image viewer */}
        {file.isImage ? (
          <div
            className={`relative flex items-center justify-center transition-all duration-300 ${
              show ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
            style={{
              transform: `scale(${show ? 1 : 0.9}) translateX(${dragDelta * 0.4}px)`,
              transition: dragStart !== null ? "none" : undefined,
            }}
          >
            {/* Loading skeleton */}
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-white/60" />
              </div>
            )}

            <img
              ref={imgRef}
              src={file.url}
              alt={file.name}
              onLoad={() => setImgLoaded(true)}
              onClick={(e) => {
                e.stopPropagation();
                toggleZoom();
              }}
              className={`max-h-[calc(100vh-160px)] max-w-[calc(100vw-80px)] rounded-lg object-contain shadow-2xl transition-all duration-300 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              } ${zoom > 1 ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              style={{
                transform: `scale(${zoom})`,
                transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              draggable={false}
            />
          </div>
        ) : (
          /* PDF / document viewer */
          <div
            className={`flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
              show ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3">
              <FileText className="h-5 w-5 text-red-500" />
              <span className="flex-1 truncate text-sm font-bold text-slate-700">
                {file.name}
              </span>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Abrir en nueva pestaña ↗
              </a>
            </div>
            <iframe
              src={file.url}
              title={file.name}
              className="flex-1 w-full border-0"
            />
          </div>
        )}
      </div>

      {/* ── Bottom Thumbnail Strip ────────────────────────────────────────── */}
      {total > 1 && (
        <div
          className={`flex items-center justify-center gap-2 px-4 py-3 transition-all duration-300 ${
            show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {files.map((f, i) => (
            <button
              key={i}
              aria-label={`Ver archivo ${i + 1}: ${f.name}`}
              aria-current={i === index ? "true" : undefined}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-2 transition-all duration-200 ${
                i === index
                  ? "ring-white shadow-lg shadow-white/20 scale-110"
                  : "ring-white/20 opacity-50 hover:opacity-80 hover:ring-white/40"
              }`}
            >
              {f.isImage ? (
                <img
                  src={f.url}
                  alt={f.name}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-700">
                  <FileText className="h-5 w-5 text-red-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Keyboard hint ────────────────────────────────────────────────── */}
      <div
        className={`hidden sm:flex items-center justify-center gap-4 pb-3 text-[10px] font-medium text-white/25 transition-all duration-500 ${
          show ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px]">ESC</kbd>
          Cerrar
        </span>
        {total > 1 && (
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px]">← →</kbd>
            Navegar
          </span>
        )}
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px]">+ −</kbd>
          Zoom
        </span>
      </div>
      </div>
    </FocusTrap>
  );
}
