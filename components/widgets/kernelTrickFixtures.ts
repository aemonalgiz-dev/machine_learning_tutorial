// The patients every kernel-trick widget on the page shares.
//
// The clinic places twenty-four patients by temperature and heart rate. The
// ten healthy sit in a band of ordinary vitals and the fourteen unwell
// surround them, feverish and racing, hypothermic and slow, so no straight
// line cuts the healthy out. The fever-only clinic keeps the same healthy
// ten and replaces the unwell with eight who all run hot, which a straight
// line handles. The random clinic draws a fresh version of the surrounded
// shape, and it is the same recipe the API uses for the second clinic the
// sweeps are scored on.

import { LabelledPoint } from "@/lib/api";

export const HEALTHY: LabelledPoint[] = [
  { x: 36.6, y: 68, label: 1 },
  { x: 36.8, y: 74, label: 1 },
  { x: 37.0, y: 70, label: 1 },
  { x: 37.2, y: 78, label: 1 },
  { x: 36.9, y: 64, label: 1 },
  { x: 37.1, y: 84, label: 1 },
  { x: 36.7, y: 80, label: 1 },
  { x: 37.3, y: 72, label: 1 },
  { x: 36.5, y: 76, label: 1 },
  { x: 37.0, y: 88, label: 1 },
];

export const UNWELL: LabelledPoint[] = [
  { x: 35.2, y: 48, label: 0 },
  { x: 35.5, y: 120, label: 0 },
  { x: 36.0, y: 130, label: 0 },
  { x: 38.9, y: 132, label: 0 },
  { x: 39.5, y: 120, label: 0 },
  { x: 40.2, y: 110, label: 0 },
  { x: 39.8, y: 66, label: 0 },
  { x: 40.5, y: 90, label: 0 },
  { x: 35.4, y: 90, label: 0 },
  { x: 38.8, y: 50, label: 0 },
  { x: 35.8, y: 58, label: 0 },
  { x: 39.9, y: 140, label: 0 },
  { x: 35.1, y: 72, label: 0 },
  { x: 38.5, y: 44, label: 0 },
];

export const CLINIC: LabelledPoint[] = [...HEALTHY, ...UNWELL];

// A clinic a straight line can handle, everyone unwell running a fever.
export const FEVER_ONLY: LabelledPoint[] = [
  ...HEALTHY,
  { x: 38.9, y: 132, label: 0 },
  { x: 39.5, y: 120, label: 0 },
  { x: 40.2, y: 110, label: 0 },
  { x: 39.8, y: 96, label: 0 },
  { x: 40.5, y: 90, label: 0 },
  { x: 39.2, y: 118, label: 0 },
  { x: 39.9, y: 140, label: 0 },
  { x: 38.6, y: 104, label: 0 },
];

export function randomClinic(): LabelledPoint[] {
  const healthy: LabelledPoint[] = Array.from({ length: 9 }, () => ({
    x: Math.round((36.2 + Math.random() * 1.4) * 10) / 10,
    y: Math.round(56 + Math.random() * 38),
    label: 1,
  }));
  const unwell: LabelledPoint[] = Array.from({ length: 12 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const reach = 0.55 + Math.random() * 0.45;
    return {
      x: Math.round((37.7 + Math.cos(angle) * 2.6 * reach) * 10) / 10,
      y: Math.round(88 + Math.sin(angle) * 46 * reach),
      label: 0,
    };
  });
  return [...healthy, ...unwell];
}

export const DOMAIN = { xMin: 35, xMax: 41, yMin: 40, yMax: 140 };

export const HEALTHY_COLOUR = "#6366f1";
export const UNWELL_COLOUR = "#f59e0b";
export const BOUNDARY_COLOUR = "#10b981";
export const MARGIN_COLOUR = "#f43f5e";
