"use client";

import qrcode from "qrcode-generator";

export function AddressQr({ value, size = 200 }: { value: string; size?: number }) {
  const qr = qrcode(0, "M");
  qr.addData(value);
  qr.make();
  const count = qr.getModuleCount();
  const cell = size / count;

  return (
    <div className="mx-auto w-fit rounded-2xl bg-white p-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {Array.from({ length: count }).flatMap((_, row) =>
          Array.from({ length: count }).map((_, col) =>
            qr.isDark(row, col) ? (
              <rect
                key={`${row}-${col}`}
                x={col * cell}
                y={row * cell}
                width={cell}
                height={cell}
                rx={cell * 0.2}
                fill="#111111"
              />
            ) : null
          ),
        )}
      </svg>
    </div>
  );
}
