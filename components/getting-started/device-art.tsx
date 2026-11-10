import type { DeviceId } from "./catalog"

/**
 * Drawn stand-ins for the three devices (no product photos in the repo yet):
 * a printer-topped Android POS, a pocket POS and a QR soundbox. Swap for
 * product shots when they're available.
 */
export function DeviceArt({ id, className }: { id: DeviceId; className?: string }) {
  if (id === "qr-soundbox") {
    return (
      <svg viewBox="0 0 120 120" className={className} aria-hidden>
        <rect x="28" y="14" width="64" height="92" rx="12" fill="#2a2a25" />
        <rect x="36" y="22" width="48" height="12" rx="3" fill="#c8e88a" />
        <rect x="38" y="40" width="44" height="44" rx="4" fill="#fff" />
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4].map((col) =>
            (row * 7 + col * 3) % 3 !== 0 ? (
              <rect key={`${row}-${col}`} x={42 + col * 7.4} y={44 + row * 7.4} width="6" height="6" rx="1" fill="#1d1d16" />
            ) : null
          )
        )}
        {[0, 1, 2, 3].map((index) => (
          <circle key={index} cx={46 + index * 9.5} cy="96" r="2.2" fill="#555" />
        ))}
      </svg>
    )
  }

  const pocket = id === "mini-m50"
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      {pocket ? null : <rect x="30" y="8" width="60" height="20" rx="7" fill="#d9d9d4" />}
      {pocket ? null : <rect x="40" y="13" width="40" height="3" rx="1.5" fill="#8a8a82" />}
      <rect x={pocket ? 36 : 30} y={pocket ? 16 : 22} width={pocket ? 48 : 60} height={pocket ? 88 : 92} rx="11" fill="#f2f2ee" stroke="#d4d4cc" />
      <rect x={pocket ? 41 : 36} y={pocket ? 23 : 30} width={pocket ? 38 : 48} height={pocket ? 46 : 54} rx="4" fill="#1f3d14" />
      <rect x={pocket ? 41 : 36} y={pocket ? 23 : 30} width={pocket ? 38 : 48} height="9" rx="4" fill="#2f5a1f" />
      <circle cx="60" cy={pocket ? 50 : 61} r={pocket ? 7 : 9} fill="#c8e88a" />
      <path d={pocket ? "M56.5 50l2.5 2.5 4.5-5" : "M55.5 61l3 3 6-6.5"} stroke="#1f3d14" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {[0, 1, 2].map((index) => (
        <rect key={index} x={(pocket ? 43 : 38) + index * (pocket ? 12 : 15.5)} y={pocket ? 78 : 92} width={pocket ? 10 : 13} height="7" rx="2" fill="#dcdcd5" />
      ))}
    </svg>
  )
}
