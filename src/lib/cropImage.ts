export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

function applyShapeClip(ctx: CanvasRenderingContext2D, shape: string, width: number, height: number) {
  ctx.beginPath();
  const w = width;
  const h = height;
  
  if (shape === 'circle') {
    ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, 2 * Math.PI);
  } else if (shape === 'oval') {
    ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, 2 * Math.PI);
  } else if (shape === 'rounded-rectangle') {
    const r = Math.min(w, h) * 0.15; // 15% border radius
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
  } else if (shape === 'heart') {
    const topCurveHeight = h * 0.3;
    ctx.moveTo(w / 2, h * 0.25);
    ctx.bezierCurveTo(w / 2, h * 0.1, w * 0.1, h * 0.05, w * 0.05, h * 0.35);
    ctx.bezierCurveTo(0, h * 0.6, w * 0.3, h * 0.7, w / 2, h * 0.95);
    ctx.bezierCurveTo(w * 0.7, h * 0.7, w, h * 0.6, w * 0.95, h * 0.35);
    ctx.bezierCurveTo(w * 0.9, h * 0.05, w / 2, h * 0.1, w / 2, h * 0.25);
  } else if (shape === 'triangle') {
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
  } else if (shape === 'hexagon') {
    ctx.moveTo(w * 0.25, 0);
    ctx.lineTo(w * 0.75, 0);
    ctx.lineTo(w, h * 0.5);
    ctx.lineTo(w * 0.75, h);
    ctx.lineTo(w * 0.25, h);
    ctx.lineTo(0, h * 0.5);
  } else if (shape === 'star') {
    const cx = w / 2;
    const cy = h / 2;
    const outerRadius = Math.min(w, h) / 2;
    const innerRadius = outerRadius * 0.382;
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / 5;
    
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
  } else {
    // default rect / square
    ctx.rect(0, 0, w, h);
  }
  ctx.closePath();
  ctx.clip();
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  shape: string = 'rect'
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

  const rotRad = getRadianAngle(rotation);

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    return '';
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  applyShapeClip(croppedCtx, shape, pixelCrop.width, pixelCrop.height);

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    resolve(croppedCanvas.toDataURL('image/png'));
  });
}
