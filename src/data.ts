export const dates = [
  '2023-01-15', '2023-02-08', '2023-03-04', '2023-03-28', '2023-04-21',
  '2023-05-15', '2023-06-08', '2023-07-02', '2023-07-26', '2023-08-19',
  '2023-09-12', '2023-10-06', '2023-10-30', '2023-11-23', '2023-12-17',
  '2024-01-10', '2024-02-03', '2024-02-27', '2024-03-22', '2024-04-15',
  '2024-05-09', '2024-06-02', '2024-06-26', '2024-07-20', '2024-08-13',
  '2024-09-06', '2024-09-30', '2024-10-24', '2024-11-17', '2024-12-11',
  '2025-01-04', '2025-01-28', '2025-02-21', '2025-03-17', '2025-04-10',
  '2025-05-04', '2025-05-28', '2025-06-21', '2025-07-15', '2025-08-08',
  '2025-09-01', '2025-09-25', '2025-10-19', '2025-11-12', '2025-12-06',
  '2025-12-30', '2026-01-23', '2026-02-16'
];

export const bounds: [number, number, number, number] = [-117.08, 35.52, -116.52, 36.03];

export function displacement(lon: number, lat: number, frame: number) {
  const t = frame / (dates.length - 1);
  const x = (lon + 116.78) * 18;
  const y = (lat - 35.77) * 20;
  const subsidence = -46 * t * Math.exp(-(x * x * .8 + y * y * 1.3));
  const ridge = 13 * t * Math.exp(-((x + 2.4) ** 2 + (y - 1.4) ** 2) * .55);
  return subsidence + ridge + Math.sin(x * 2 + y + frame * .22) * 1.7;
}

function color(value: number): [number, number, number] {
  const stops: [number, number, number][] = [[17, 38, 77], [32, 106, 169], [60, 181, 178], [239, 224, 122], [221, 96, 69]];
  const n = Math.max(0, Math.min(.999, (value + 50) / 70)) * (stops.length - 1);
  const i = Math.floor(n), f = n - i;
  return stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f)) as [number, number, number];
}

export function makeRaster(frame: number, width = 600, height = 520) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d')!;
  const image = context.createImageData(width, height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const lon = bounds[0] + x / width * (bounds[2] - bounds[0]);
    const lat = bounds[3] - y / height * (bounds[3] - bounds[1]);
    const noise = Math.sin(x * .08) + Math.cos(y * .11) + Math.sin((x + y) * .031);
    const edge = Math.hypot((x / width - .53) * 1.5, (y / height - .48) * 1.3);
    const i = (y * width + x) * 4;
    if (noise > 2.12 || edge > .69) { image.data[i + 3] = 0; continue; }
    const [r, g, b] = color(displacement(lon, lat, frame));
    image.data.set([r, g, b, 245], i);
  }
  context.putImageData(image, 0, 0);
  return canvas;
}
