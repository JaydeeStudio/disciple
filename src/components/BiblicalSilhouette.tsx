import React from 'react';
import { SpiritualDimension } from '../data/archetypes';

export interface BiblicalSilhouetteProps {
  characterKey?: string;
  dimension?: SpiritualDimension;
  gender?: 'M' | 'F' | 'BOTH';
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  showFrame?: boolean;
}

export const BiblicalSilhouette: React.FC<BiblicalSilhouetteProps> = ({
  characterKey,
  dimension = 'contemplative',
  gender = 'M',
  name,
  size = 'md',
  className = '',
  showFrame = true,
}) => {
  const sizeMap = {
    sm: { box: 56 },
    md: { box: 80 },
    lg: { box: 140 },
    hero: { box: 260 },
  };
  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div 
      className={`inline-flex items-center justify-center transition-all select-none ${className}`}
      style={{ width: currentSize.box, height: currentSize.box }}
      title={name || characterKey}
    >
      <BiblicalSilhouetteSvg
        characterKey={characterKey}
        dimension={dimension}
        gender={gender}
        name={name}
        showFrame={showFrame}
        className="w-full h-full drop-shadow-sm"
      />
    </div>
  );
};

export const BiblicalSilhouetteSvg: React.FC<BiblicalSilhouetteProps> = ({
  characterKey,
  dimension = 'contemplative',
  gender = 'M',
  name: _name,
  className = '',
  showFrame = true,
}) => {
  const ink = '#24201D';
  const terracotta = '#C25E42';
  const ochre = '#D49B44';
  const sage = '#5F7363';
  const parchment = '#F7F2E8';
  const parchmentBorder = '#E5DBCB';

  const isFemale = gender === 'F';

  const renderGraphic = () => {
    switch (characterKey) {
      case 'jean':
        return (
          <g>
            <circle cx="100" cy="70" r="48" fill={ochre} opacity="0.18" />
            <circle cx="100" cy="70" r="38" stroke={ochre} strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <ellipse cx="100" cy="56" rx="14" ry="17" fill={ink} />
            <path d="M78 72 C78 62, 88 50, 100 50 C112 50, 122 62, 122 72 C122 88, 126 120, 128 155 C128 165, 72 165, 72 155 C74 120, 78 88, 78 72 Z" fill={ink} />
            <path d="M84 76 C92 84, 108 84, 116 76 C120 90, 114 115, 100 120 C86 115, 80 90, 84 76 Z" fill={terracotta} opacity="0.9" />
            <path d="M88 124 Q100 128 112 124 L114 136 Q100 140 86 136 Z" fill="#FFFDF8" stroke={ink} strokeWidth="1.5" />
            <line x1="100" y1="126" x2="100" y2="138" stroke={ink} strokeWidth="1" />
            <circle cx="100" cy="38" r="3" fill={ochre} />
          </g>
        );

      case 'pierre':
        return (
          <g>
            <path d="M60 160 L100 40 L140 160 Z" fill={terracotta} opacity="0.08" />
            <circle cx="100" cy="62" r="38" fill={ochre} opacity="0.15" />
            <ellipse cx="98" cy="52" rx="15" ry="18" fill={ink} />
            <path d="M72 75 C72 65, 85 58, 98 58 C112 58, 124 65, 124 75 L132 160 L64 160 Z" fill={ink} />
            <path d="M78 80 L118 80 L112 135 L84 135 Z" fill={terracotta} opacity="0.85" />
            <line x1="134" y1="40" x2="134" y2="160" stroke={ochre} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M134 40 C134 30, 148 30, 148 42 C148 50, 138 52, 134 52" fill="none" stroke={ochre} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="98" cy="100" r="4" fill="#FFFDF8" />
          </g>
        );

      case 'david':
        return (
          <g>
            <circle cx="100" cy="70" r="44" fill={ochre} opacity="0.2" />
            <path d="M85 30 L100 22 L115 30 L112 36 L88 36 Z" fill={ochre} />
            <ellipse cx="100" cy="52" rx="14" ry="16" fill={ink} />
            <path d="M76 74 C76 64, 88 56, 100 56 C112 56, 124 64, 124 74 L128 160 L72 160 Z" fill={ink} />
            <path d="M110 90 C110 80, 135 78, 140 92 L138 128 C135 140, 115 138, 112 125 Z" fill="none" stroke={terracotta} strokeWidth="3" />
            <line x1="118" y1="88" x2="118" y2="134" stroke={ochre} strokeWidth="1.5" />
            <line x1="124" y1="86" x2="124" y2="135" stroke={ochre} strokeWidth="1.5" />
            <line x1="130" y1="88" x2="130" y2="132" stroke={ochre} strokeWidth="1.5" />
            <path d="M82 82 C90 92, 98 120, 92 145" stroke="#FAF7F2" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
          </g>
        );

      case 'esther':
        return (
          <g>
            <path d="M65 160 Q65 60 100 60 Q135 60 135 160" fill={terracotta} opacity="0.12" />
            <circle cx="100" cy="65" r="36" fill={ochre} opacity="0.18" />
            <path d="M88 42 L94 34 L100 40 L106 34 L112 42 Z" fill={ochre} />
            <ellipse cx="100" cy="54" rx="13" ry="16" fill={ink} />
            <path d="M74 68 C70 90, 68 125, 66 160 L134 160 C132 125, 130 90, 126 68 C120 56, 80 56, 74 68 Z" fill={ink} />
            <path d="M80 80 C95 105, 105 130, 108 160 L92 160 C90 135, 82 110, 76 88 Z" fill={terracotta} />
            <path d="M120 80 C110 105, 102 130, 98 160" stroke={ochre} strokeWidth="2" fill="none" />
            <line x1="126" y1="95" x2="140" y2="150" stroke={ochre} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="125" cy="93" r="3.5" fill={ochre} />
          </g>
        );

      case 'paul':
        return (
          <g>
            <path d="M100 22 C96 30, 92 34, 100 42 C108 34, 104 30, 100 22 Z" fill={terracotta} />
            <circle cx="100" cy="70" r="42" fill={ochre} opacity="0.16" />
            <ellipse cx="100" cy="56" rx="14" ry="17" fill={ink} />
            <path d="M92 68 Q100 78 108 68 Z" fill={ink} />
            <path d="M72 76 C72 65, 86 60, 100 60 C114 60, 128 65, 128 76 L134 160 L66 160 Z" fill={ink} />
            <path d="M82 82 L118 82 L112 125 L88 125 Z" fill={ochre} opacity="0.85" />
            <rect x="74" y="112" width="32" height="18" rx="2" fill="#FFFDF8" stroke={ink} strokeWidth="1.5" />
            <line x1="78" y1="117" x2="102" y2="117" stroke={ink} strokeWidth="1" />
            <line x1="78" y1="122" x2="98" y2="122" stroke={ink} strokeWidth="1" />
            <path d="M114 100 Q122 108 116 118" stroke={terracotta} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'marie_madeleine':
        return (
          <g>
            <circle cx="100" cy="65" r="40" fill={ochre} opacity="0.16" />
            <ellipse cx="100" cy="52" rx="13" ry="16" fill={ink} />
            <path d="M72 70 C68 95, 66 130, 64 160 L136 160 C134 130, 132 95, 128 70 C122 56, 78 56, 72 70 Z" fill={ink} />
            <path d="M78 85 C84 110, 80 135, 74 160" stroke={terracotta} strokeWidth="2.5" fill="none" />
            <path d="M122 85 C116 110, 120 135, 126 160" stroke={terracotta} strokeWidth="2.5" fill="none" />
            <path d="M92 120 L108 120 L104 145 L96 145 Z" fill={ochre} />
            <circle cx="100" cy="116" r="3" fill={terracotta} />
          </g>
        );

      case 'marie_bethanie':
        return (
          <g>
            <circle cx="100" cy="70" r="42" fill={ochre} opacity="0.16" />
            <ellipse cx="100" cy="54" rx="13" ry="16" fill={ink} />
            <path d="M74 72 C70 95, 68 130, 66 160 L134 160 C132 130, 130 95, 126 72 Z" fill={ink} />
            <path d="M82 82 C92 90, 108 90, 118 82" stroke={sage} strokeWidth="2.5" fill="none" />
            <path d="M94 125 C94 118, 106 118, 106 125 L104 142 L96 142 Z" fill={ochre} />
            <ellipse cx="100" cy="120" rx="3" ry="2" fill={terracotta} />
          </g>
        );

      case 'barnabe':
        return (
          <g>
            <circle cx="100" cy="65" r="40" fill={sage} opacity="0.2" />
            <ellipse cx="100" cy="54" rx="14" ry="17" fill={ink} />
            <path d="M72 74 C72 64, 86 58, 100 58 C114 58, 128 64, 128 74 L132 160 L68 160 Z" fill={ink} />
            <path d="M80 80 L120 80 L114 135 L86 135 Z" fill={sage} opacity="0.85" />
            <path d="M88 115 Q100 125 112 115" stroke="#FFFDF8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        );

      default:
        return (
          <g>
            <circle cx="100" cy="70" r="42" fill={terracotta} opacity="0.16" />
            <ellipse cx="100" cy="54" rx={isFemale ? 13 : 14} ry="16" fill={ink} />
            <path d="M74 74 C74 64, 86 58, 100 58 C114 58, 126 64, 126 74 L130 160 L70 160 Z" fill={ink} />
            <line x1="128" y1="46" x2="128" y2="160" stroke={ochre} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M84 82 L116 82 L112 135 L88 135 Z" fill={sage} opacity="0.8" />
          </g>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {showFrame && (
        <>
          <path
            d="M30 176 L30 84 Q30 24 100 24 Q170 24 170 84 L170 176 Q100 178 30 176 Z"
            fill={parchment}
            stroke={parchmentBorder}
            strokeWidth="2"
          />
          <path
            d="M36 172 L36 84 Q36 30 100 30 Q164 30 164 84 L164 172"
            fill="none"
            stroke={ochre}
            strokeWidth="0.8"
            opacity="0.4"
          />
        </>
      )}

      {renderGraphic()}

      <line x1="38" y1="162" x2="162" y2="162" stroke={ink} strokeWidth="1.8" opacity="0.4" strokeLinecap="round" />
    </svg>
  );
};

const pngCache = new Map<string, string>();

/**
 * Renders the EXACT same SVG as BiblicalSilhouette into a high-resolution PNG data URL
 * for jsPDF documents, matching the web app down to the exact pixel and Bezier curves.
 */
export async function getArchetypeSilhouettePngDataUrl(
  archetype: { key?: string; dimension?: SpiritualDimension; gender?: 'M' | 'F' | 'BOTH'; name?: string },
  targetPx: number = 800
): Promise<string> {
  if (typeof window === 'undefined') return '';
  const cacheKey = `${archetype.key || archetype.name || 'default'}_${targetPx}`;
  if (pngCache.has(cacheKey)) {
    return pngCache.get(cacheKey)!;
  }

  try {
    const { renderToStaticMarkup } = await import('react-dom/server');
    const svgMarkup = renderToStaticMarkup(
      React.createElement(BiblicalSilhouetteSvg, {
        characterKey: archetype.key,
        dimension: archetype.dimension,
        gender: archetype.gender,
        name: archetype.name,
        showFrame: true
      })
    );

    // Ensure width and height attributes exist on the pure <svg> element
    const cleanSvg = svgMarkup.replace(
      '<svg ',
      `<svg width="${targetPx}" height="${targetPx}" `
    );

    return new Promise((resolve) => {
      const img = new Image();
      const svgBase64 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cleanSvg);
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetPx;
          canvas.height = targetPx;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, targetPx, targetPx);
            const pngUrl = canvas.toDataURL('image/png');
            pngCache.set(cacheKey, pngUrl);
            resolve(pngUrl);
            return;
          }
        } catch (e) {
          console.warn('Canvas export failed:', e);
        }
        resolve('');
      };
      img.onerror = (e) => {
        console.warn('SVG image load failed:', e);
        resolve('');
      };
      img.src = svgBase64;
    });
  } catch (err) {
    console.error('getArchetypeSilhouettePngDataUrl error:', err);
    return '';
  }
}
