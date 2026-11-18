/**
 * ArabTides map projection: plain longitude/latitude scaled to the region's middle latitude (as in the Reels'
 * maps), in the units of public/map/land.svg (made by tools/map/build-land.mjs; rebuild it if this changes).
 */
export const PROJ = {
  L0: -25,                           // west edge, degrees
  B1: 45,                            // north edge, degrees
  K: 10,                             // units per degree of latitude
  C: Math.cos((25 * Math.PI) / 180), // longitude squeeze at 25°N
  W: 861,                            // (70 − L0) · K · C, rounded
  H: 650,                            // (B1 − (−20)) · K
};

export function project(lon: number, lat: number): [number, number] {
  return [(lon - PROJ.L0) * PROJ.K * PROJ.C, (PROJ.B1 - lat) * PROJ.K];
}
