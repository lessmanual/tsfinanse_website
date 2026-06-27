export const SEO_SURFACE_UPDATED_DATE = '2026-06-27';

export function latestSeoSurfaceDate(value) {
  const candidate = value || '';
  const candidateTime = Date.parse(candidate);
  const surfaceTime = Date.parse(SEO_SURFACE_UPDATED_DATE);

  if (!Number.isFinite(candidateTime)) return SEO_SURFACE_UPDATED_DATE;
  return candidateTime >= surfaceTime ? candidate : SEO_SURFACE_UPDATED_DATE;
}
