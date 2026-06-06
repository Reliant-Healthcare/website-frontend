"use client";

import { useRef, useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

interface SignaturePadProps {
  value?: string;
  onChange: (value: string | null) => void;
  readOnly?: boolean;
}

export default function SignaturePad({ value, onChange, readOnly = false }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!value);

  // Resize canvas to match display size
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clean drawing state
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = "#111827"; // Dark grey stroke
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  };

  useEffect(() => {
    if (readOnly) return;

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [readOnly]);

  // Handle start drawing
  const startDrawing = (clientX: number, clientY: number) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  // Draw lines
  const draw = (clientX: number, clientY: number) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  // Stop drawing and emit result
  const stopDrawing = () => {
    if (!isDrawing || readOnly) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const dataUrl = canvas.toDataURL("image/png");
      onChange(dataUrl);
    }
  };

  // Clear signature
  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(null);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startDrawing(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    draw(touch.clientX, touch.clientY);
  };

  if (readOnly) {
    return (
      <div className="border border-dashed rounded-xl p-3 bg-muted/20 flex items-center justify-center min-h-[120px]">
        {value ? (
          <img src={value} alt="Signature" className="max-h-[100px] object-contain" />
        ) : (
          <span className="text-xs text-muted-foreground italic">No signature provided</span>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="relative border rounded-xl overflow-hidden bg-background min-h-[150px] shadow-inner select-none touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
          onMouseMove={(e) => draw(e.clientX, e.clientY)}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-muted-foreground/60 font-medium select-none">
            Sign here with mouse or finger
          </div>
        )}
      </div>
      {hasSignature && (
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1 text-xs font-bold text-destructive hover:underline"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear Signature
        </button>
      )}
    </div>
  );
}
