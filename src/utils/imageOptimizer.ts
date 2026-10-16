/**
 * @file imageOptimizer.ts
 * @description Utilitário de compressão de imagens no cliente (Canvas API)
 * e conversão para WebP/JPEG otimizado para carregamento instantâneo.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/webp" | "image/jpeg";
}

/**
 * Calcula dimensões mantendo aspect ratio sem ultrapassar os limites máximos.
 */
function calculateDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

/**
 * Carrega uma imagem de um File ou string (Data URL ou URL) para um HTMLImageElement.
 */
function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("Falha ao carregar a imagem para compressão: " + err));

    if (typeof source === "string") {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Comprime uma imagem no navegador utilizando Canvas API.
 * Reduz fotos de 5MB-15MB para ~60KB-180KB sem perda perceptível de nitidez.
 */
export async function compressImage(
  source: File | string,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1600,
    maxHeight = 1200,
    quality = 0.82,
    mimeType = "image/webp",
  } = options;

  try {
    const img = await loadImage(source);
    const { width, height } = calculateDimensions(
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
      maxWidth,
      maxHeight
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      throw new Error("Não foi possível inicializar o contexto 2D do Canvas.");
    }

    // Suavização bilinear de alta qualidade
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(img, 0, 0, width, height);

    // Tenta exportar para webp; se o navegador não suportar, fallback para jpeg
    let compressedDataUrl = canvas.toDataURL(mimeType, quality);
    if (!compressedDataUrl.startsWith(`data:${mimeType}`)) {
      compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
    }

    return compressedDataUrl;
  } catch (error) {
    console.warn("Compressão de imagem falhou, usando fallback direto:", error);
    if (typeof source === "string") return source;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(source);
    });
  }
}

/**
 * Formata bytes legíveis para debug ou exibição
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
