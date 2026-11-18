/**
 * ArabTides map projection: plain longitude/latitude scaled to 25°N (as in the Reels' maps), for the whole world from
 * 180°W, 78°N to 58°S, in the units of public/map/land.svg (made by tools/map/build-land.mjs; rebuild it if this changes).
 */
export const PROJ = {
  L0: -180,                          // west edge, degrees
  B1: 78,                            // north edge, degrees
  S: -58,                            // south edge, degrees
  K: 10,                             // units per degree of latitude
  C: Math.cos((25 * Math.PI) / 180), // longitude squeeze at 25°N
  W: 3263,                           // 360 · K · C, rounded
  H: 1360,                           // (B1 − S) · K
};

export function project(lon: number, lat: number): [number, number] {
  return [(lon - PROJ.L0) * PROJ.K * PROJ.C, (PROJ.B1 - lat) * PROJ.K];
}
