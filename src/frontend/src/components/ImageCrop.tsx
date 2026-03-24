import { Button } from "@/components/ui/button";
import { Check, X, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  shape?: "circle" | "rect";
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
  initialSrc?: string;
}

export function ImageCropModal({
  shape = "rect",
  onConfirm,
  onCancel,
  initialSrc,
}: Props) {
  const [src, setSrc] = useState<string>(initialSrc ?? "");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const CANVAS_SIZE = 320;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    if (shape === "circle") {
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        CANVAS_SIZE / 2,
        CANVAS_SIZE / 2,
        CANVAS_SIZE / 2,
        0,
        Math.PI * 2,
      );
      ctx.clip();
    }
    const scaledW = img.naturalWidth * zoom;
    const scaledH = img.naturalHeight * zoom;
    ctx.drawImage(img, offset.x, offset.y, scaledW, scaledH);
    if (shape === "circle") ctx.restore();
  }, [zoom, offset, shape]);

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const ratio = CANVAS_SIZE / Math.min(img.naturalWidth, img.naturalHeight);
      setZoom(ratio);
      setOffset({
        x: -(img.naturalWidth * ratio - CANVAS_SIZE) / 2,
        y: -(img.naturalHeight * ratio - CANVAS_SIZE) / 2,
      });
    };
    img.src = src;
  }, [src]);

  useEffect(() => {
    draw();
  }, [draw]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleMouseDown(e: React.MouseEvent) {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }

  function handleMouseUp() {
    setDragging(false);
  }

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  }

  function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onConfirm(canvas.toDataURL("image/jpeg", 0.85));
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-navy">
            Crop Image
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {!src ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gold rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-50 transition-colors"
          >
            <p className="text-navy font-medium">Click to select an image</p>
            <p className="text-sm text-gray-400 mt-1">
              JPG, PNG, WebP supported
            </p>
          </button>
        ) : (
          <div className="space-y-3">
            <div
              ref={previewRef}
              className="relative overflow-hidden rounded-lg cursor-move mx-auto"
              style={{
                width: CANVAS_SIZE,
                height: CANVAS_SIZE,
                maxWidth: "100%",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="w-full h-full"
                style={{ borderRadius: shape === "circle" ? "50%" : "8px" }}
              />
              <div
                className="absolute inset-0 border-2 border-gold pointer-events-none"
                style={{ borderRadius: shape === "circle" ? "50%" : "8px" }}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
                className="p-1 rounded border text-navy hover:bg-amber-50"
              >
                <ZoomOut size={16} />
              </button>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-amber-500"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(5, z + 0.1))}
                className="p-1 rounded border text-navy hover:bg-amber-50"
              >
                <ZoomIn size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Drag to reposition • Use slider to zoom
            </p>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />

        {src && (
          <button
            type="button"
            onClick={() => {
              setSrc("");
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="mt-2 text-xs text-blue-500 hover:underline block"
          >
            Choose different image
          </button>
        )}

        <div className="flex gap-3 mt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 bg-gold text-white hover:bg-amber-600"
            onClick={handleConfirm}
            disabled={!src}
          >
            <Check size={16} className="mr-1" /> Confirm Crop
          </Button>
        </div>
      </div>
    </div>
  );
}
