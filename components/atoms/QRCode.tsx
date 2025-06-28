'use client';

import { useEffect, useRef } from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCode({ value, size = 200, className }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Simple QR code placeholder implementation
    // In a real application, you would use a proper QR code library
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Draw a simple placeholder pattern
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#fff';
    const cellSize = size / 21; // 21x21 grid for QR code
    
    // Draw a simple pattern
    for (let i = 0; i < 21; i++) {
      for (let j = 0; j < 21; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }

    // Add corner markers
    ctx.fillStyle = '#000';
    [
      [0, 0], [0, 14], [14, 0]
    ].forEach(([x, y]) => {
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#fff';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#000';
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    });

  }, [value, size]);

  return (
    <div className={className}>
      <canvas 
        ref={canvasRef} 
        className="border border-border rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <p className="text-xs text-muted-foreground mt-2 text-center">
        QR Code for: {value.substring(0, 20)}...
      </p>
    </div>
  );
}