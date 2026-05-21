/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SimulatedQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export default function SimulatedQRCode({ value, size = 120, className = '' }: SimulatedQRCodeProps) {
  // Simple deterministic hash generator to output dynamic grid dot matrix based on the admission string
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const codeHash = hashString(value);

  // Generate a mock QR grid matrix representation
  return (
    <div className={`p-2 bg-white rounded-lg inline-block border border-slate-200 select-none ${className}`}>
      <svg width={size} height={size} viewBox="0 0 21 21" className="block text-slate-950">
        {/* Alignment corner marker - TOP LEFT */}
        <rect x="0" y="0" width="7" height="7" fill="currentColor" />
        <rect x="1" y="1" width="5" height="5" fill="white" />
        <rect x="2" y="2" width="3" height="3" fill="currentColor" />
        
        {/* Alignment corner marker - TOP RIGHT */}
        <rect x="14" y="0" width="7" height="7" fill="currentColor" />
        <rect x="15" y="1" width="5" height="5" fill="white" />
        <rect x="16" y="2" width="3" height="3" fill="currentColor" />
        
        {/* Alignment corner marker - BOTTOM LEFT */}
        <rect x="0" y="14" width="7" height="7" fill="currentColor" />
        <rect x="1" y="15" width="5" height="5" fill="white" />
        <rect x="2" y="16" width="3" height="3" fill="currentColor" />

        {/* Dynamic dots and structural squares mapping */}
        <g fill="currentColor">
          {/* Small fixed reference squares on grid */}
          <rect x="16" y="16" width="2" height="2" />
          <rect x="8" y="18" width="1" height="1" />
          <rect x="18" y="8" width="1" height="1" />

          {/* Render hash-based grid pixels */}
          {Array.from({ length: 21 }).map((_, r) => {
            return Array.from({ length: 21 }).map((_, c) => {
              // Exclude region reserved for the alignment corner squares
              const isTopLeft = r < 8 && c < 8;
              const isTopRight = r < 8 && c > 13;
              const isBottomLeft = r > 13 && c < 8;
              const isReservedCorner = isTopLeft || isTopRight || isBottomLeft;
              
              if (isReservedCorner) return null;

              // Pseudo-random generation based on row, column, and hash value of student details
              const checkValue = (r * 13 + c * 37 + (codeHash % 100)) % 11;
              const shouldBeFilled = checkValue === 1 || checkValue === 3 || checkValue === 5 || checkValue === 7 || (r % 3 === 0 && c % 4 === 0);

              if (shouldBeFilled) {
                return (
                  <rect 
                    key={`${r}-${c}`} 
                    x={c} 
                    y={r} 
                    width="1" 
                    height="1" 
                  />
                );
              }
              return null;
            });
          })}
        </g>
      </svg>
    </div>
  );
}
