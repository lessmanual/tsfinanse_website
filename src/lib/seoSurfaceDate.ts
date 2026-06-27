export const seoSurfaceUpdatedDate = '2026-06-27';

export function latestSeoSurfaceDate(value?: string | null): string {
  const candidate = value || '';
  const candidateTime = Date.parse(candidate);
  const surfaceTime = Date.parse(seoSurfaceUpdatedDate);

  if (!Number.isFinite(candidateTime)) return seoSurfaceUpdatedDate;
  return candidateTime >= surfaceTime ? candidate : seoSurfaceUpdatedDate;
}
