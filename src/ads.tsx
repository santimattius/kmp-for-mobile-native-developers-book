/**
 * Publicidad (Google AdSense). Solo se muestra si están configuradas
 * VITE_ADSENSE_CLIENT_ID y VITE_ADSENSE_SLOT en el entorno.
 */

import { useEffect, useRef } from 'react';

const RAW_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined;
const DEFAULT_SLOT = import.meta.env.VITE_ADSENSE_SLOT as string | undefined;
const ADS_ENABLED = import.meta.env.VITE_ADS_ENABLED as string | undefined;

// AdSense exige el formato "ca-pub-XXXXXXXXXXXXXXXX". Normalizar por si solo pusieron el número o "pub-..."
const CLIENT_ID =
  typeof RAW_CLIENT_ID === 'string' && RAW_CLIENT_ID.length > 0
    ? RAW_CLIENT_ID.startsWith('ca-pub-')
      ? RAW_CLIENT_ID
      : RAW_CLIENT_ID.startsWith('pub-')
        ? `ca-${RAW_CLIENT_ID}`
        : `ca-pub-${RAW_CLIENT_ID.replace(/^ca-pub-/, '')}`
    : undefined;

export function isAdsEnabled(): boolean {
  if (ADS_ENABLED === 'false' || ADS_ENABLED === '0') return false;
  return Boolean(
    typeof CLIENT_ID === 'string' &&
      CLIENT_ID.length > 0 &&
      typeof DEFAULT_SLOT === 'string' &&
      DEFAULT_SLOT.length > 0,
  );
}

const SCRIPT_ID = 'adsense-script';
const SCRIPT_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

function loadAdSenseScript(): void {
  if (document.getElementById(SCRIPT_ID) || !CLIENT_ID) return;
  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = `${SCRIPT_URL}?client=${encodeURIComponent(CLIENT_ID)}`;
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

interface AdSlotProps {
  /** Slot ID del bloque de anuncios (ej. "1234567890"). Si no se pasa, usa VITE_ADSENSE_SLOT. */
  slot?: string;
  /** Estilo del contenedor (ej. "display:block" para responsive). */
  style?: React.CSSProperties;
  /** Clase CSS del contenedor. */
  className?: string;
  /** Formato: "auto" (responsive), "horizontal", "vertical", "rectangle". */
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
}

export function AdSlot({ slot = DEFAULT_SLOT, style, className, format = 'auto' }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!isAdsEnabled() || !slot || !ref.current) return;
    loadAdSenseScript();
    try {
      ((window as Window & { adsbygoogle?: unknown[] }).adsbygoogle =
        (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle || []).push({});
    } catch {
      // ignore
    }
  }, [slot]);

  if (!isAdsEnabled() || !slot) {
    return null;
  }

  return (
    <div className={className} style={style}>
      <ins
        ref={ref}
        className="adsbygoogle"
        data-ad-client={CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={format === 'auto' ? 'true' : undefined}
      />
    </div>
  );
}
