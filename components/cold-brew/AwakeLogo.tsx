import { coldBrew } from '@/content/cold-brew';
import { sitePath } from '@/lib/sitePath';

/** A clipped view of the original raster artwork; the mark is never reconstructed. */
export function AwakeLogo({ compact = false }: { compact?: boolean }) {
  const logo=coldBrew.logo;
  return <svg className={`awake-logo${compact ? ' awake-logo-compact' : ''}`} viewBox={`${logo.x} ${logo.y} ${logo.width} ${logo.height}`} width={logo.width} height={logo.height} role="img" aria-label="A•WAKE Cold Brew: mountain A logo"><image href={sitePath(logo.src)} width="1536" height="1024"/></svg>;
}
