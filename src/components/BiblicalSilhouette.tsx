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
  // Determine sizing dimensions
  const sizeMap = {
    sm: { box: 56, icon: 40 },
    md: { box: 80, icon: 64 },
    lg: { box: 140, icon: 110 },
    hero: { box: 260, icon: 220 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Colors in BibleProject palette
  const ink = '#24201D';       // Deep warm charcoal silhouette
  const terracotta = '#C25E42'; // Accent earth / warmth
  const ochre = '#D49B44';      // Accent golden sun / scroll / light
  const sage = '#5F7363';       // Accent olive / peace
  const parchment = '#F7F2E8';  // Background warm cartouche
  const parchmentBorder = '#E5DBCB';

  // Specific vector artwork for key characters or dimension defaults
  const renderGraphic = () => {
    switch (characterKey) {
      case 'jean':
        // Jean: Le disciple bien-aimé - silhouette contemplative, reposant ou priant avec le livre/évangile
        return (
          <g>
            {/* Soft halo / aura */}
            <circle cx="100" cy="70" r="48" fill={ochre} opacity="0.18" />
            <circle cx="100" cy="70" r="38" stroke={ochre} strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            
            {/* Disciple head & cloak */}
            <ellipse cx="100" cy="56" rx="14" ry="17" fill={ink} />
            <path d="M78 72 C78 62, 88 50, 100 50 C112 50, 122 62, 122 72 C122 88, 126 120, 128 155 C128 165, 72 165, 72 155 C74 120, 78 88, 78 72 Z" fill={ink} />
            
            {/* Drape / Cowl in terracotta */}
            <path d="M84 76 C92 84, 108 84, 116 76 C120 90, 114 115, 100 120 C86 115, 80 90, 84 76 Z" fill={terracotta} opacity="0.9" />
            
            {/* Open sacred scroll / book in hands */}
            <path d="M88 124 Q100 128 112 124 L114 136 Q100 140 86 136 Z" fill="#FFFDF8" stroke={ink} strokeWidth="1.5" />
            <line x1="100" y1="126" x2="100" y2="138" stroke={ink} strokeWidth="1" />
            <circle cx="100" cy="38" r="3" fill={ochre} />
          </g>
        );

      case 'pierre':
        // Pierre: Chef d'équipe / bâtisseur - silhouette avec bâton pastoral et filet/clé
        return (
          <g>
            {/* Aura d'autorité */}
            <path d="M60 160 L100 40 L140 160 Z" fill={terracotta} opacity="0.08" />
            <circle cx="100" cy="62" r="38" fill={ochre} opacity="0.15" />
            
            {/* Figure */}
            <ellipse cx="98" cy="52" rx="15" ry="18" fill={ink} />
            {/* Sturdy cloak */}
            <path d="M72 75 C72 65, 85 58, 98 58 C112 58, 124 65, 124 75 L132 160 L64 160 Z" fill={ink} />
            <path d="M78 80 L118 80 L112 135 L84 135 Z" fill={terracotta} opacity="0.85" />
            
            {/* Pastoral staff (Bâton de berger/apôtre) */}
            <line x1="134" y1="40" x2="134" y2="160" stroke={ochre} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M134 40 C134 30, 148 30, 148 42 C148 50, 138 52, 134 52" fill="none" stroke={ochre} strokeWidth="3.5" strokeLinecap="round" />
            
            {/* Keys / Cross symbol subtle */}
            <circle cx="98" cy="100" r="4" fill="#FFFDF8" />
          </g>
        );

      case 'david':
        // David: Adorateur & Berger-Roi - harpe/lyre kinnor et couronne discrète
        return (
          <g>
            {/* Sun of praise */}
            <circle cx="100" cy="70" r="44" fill={ochre} opacity="0.2" />
            <path d="M85 30 L100 22 L115 30 L112 36 L88 36 Z" fill={ochre} /> {/* Crown */}
            
            {/* Head & Body */}
            <ellipse cx="100" cy="52" rx="14" ry="16" fill={ink} />
            <path d="M76 74 C76 64, 88 56, 100 56 C112 56, 124 64, 124 74 L128 160 L72 160 Z" fill={ink} />
            
            {/* The Lyre (Harpe hébraïque - Kinnor) */}
            <path d="M110 90 C110 80, 135 78, 140 92 L138 128 C135 140, 115 138, 112 125 Z" fill="none" stroke={terracotta} strokeWidth="3" />
            <line x1="118" y1="88" x2="118" y2="134" stroke={ochre} strokeWidth="1.5" />
            <line x1="124" y1="86" x2="124" y2="135" stroke={ochre} strokeWidth="1.5" />
            <line x1="130" y1="88" x2="130" y2="132" stroke={ochre} strokeWidth="1.5" />
            
            {/* Cloak folds */}
            <path d="M82 82 C90 92, 98 120, 92 145" stroke="#FAF7F2" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
          </g>
        );

      case 'esther':
        // Esther: Souveraine courageuse - diadème, voile royal et grâce
        return (
          <g>
            {/* Royal halo / archway */}
            <path d="M65 160 Q65 60 100 60 Q135 60 135 160" fill={terracotta} opacity="0.12" />
            <circle cx="100" cy="65" r="36" fill={ochre} opacity="0.18" />
            
            {/* Persian tiara / Diadème */}
            <path d="M88 42 L94 34 L100 40 L106 34 L112 42 Z" fill={ochre} />
            
            {/* Head & Royal veil */}
            <ellipse cx="100" cy="54" rx="13" ry="16" fill={ink} />
            <path d="M74 68 C70 90, 68 125, 66 160 L134 160 C132 125, 130 90, 126 68 C120 56, 80 56, 74 68 Z" fill={ink} />
            
            {/* Elegant royal sash / drapery */}
            <path d="M80 80 C95 105, 105 130, 108 160 L92 160 C90 135, 82 110, 76 88 Z" fill={terracotta} />
            <path d="M120 80 C110 105, 102 130, 98 160" stroke={ochre} strokeWidth="2" fill="none" />
            
            {/* Sceptre of grace */}
            <line x1="126" y1="95" x2="140" y2="150" stroke={ochre} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="125" cy="93" r="3.5" fill={ochre} />
          </g>
        );

      case 'paul':
        // Paul: Apôtre bâtisseur & docteur - plume, épître et flamme
        return (
          <g>
            {/* Flame of the Spirit overhead */}
            <path d="M100 22 C96 30, 92 34, 100 42 C108 34, 104 30, 100 22 Z" fill={terracotta} />
            <circle cx="100" cy="70" r="42" fill={ochre} opacity="0.16" />
            
            {/* Head & beard silhouette */}
            <ellipse cx="100" cy="56" rx="14" ry="17" fill={ink} />
            <path d="M92 68 Q100 78 108 68 Z" fill={ink} />
            
            {/* Body */}
            <path d="M72 76 C72 65, 86 60, 100 60 C114 60, 128 65, 128 76 L134 160 L66 160 Z" fill={ink} />
            <path d="M82 82 L118 82 L112 125 L88 125 Z" fill={ochre} opacity="0.85" />
            
            {/* Epistle scroll & feather */}
            <rect x="74" y="112" width="32" height="18" rx="2" fill="#FFFDF8" stroke={ink} strokeWidth="1.5" />
            <line x1="78" y1="117" x2="102" y2="117" stroke={ink} strokeWidth="1" />
            <line x1="78" y1="122" x2="98" y2="122" stroke={ink} strokeWidth="1" />
            <path d="M114 100 Q122 108 116 118" stroke={terracotta} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'marthe':
        // Marthe: Cœur serviteur - amphore/cruche, hospitalité active
        return (
          <g>
            <circle cx="100" cy="72" r="40" fill={sage} opacity="0.2" />
            <ellipse cx="100" cy="54" rx="13" ry="16" fill={ink} />
            <path d="M74 72 C74 62, 86 58, 100 58 C114 58, 126 62, 126 72 L130 160 L70 160 Z" fill={ink} />
            
            {/* Tablier de service / Apron */}
            <path d="M82 85 L118 85 L114 160 L86 160 Z" fill={terracotta} opacity="0.8" />
            
            {/* Cruche d'eau / amphore en terre cuite */}
            <path d="M116 100 C116 94, 130 94, 130 100 L128 128 C128 136, 118 136, 118 128 Z" fill={ochre} stroke={ink} strokeWidth="1.5" />
            <path d="M130 105 C136 108, 136 120, 128 124" fill="none" stroke={ink} strokeWidth="1.5" />
          </g>
        );

      case 'marie':
        // Marie de Béthanie: Parfum d'adoration, écoute au pied du maître
        return (
          <g>
            <circle cx="100" cy="65" r="44" fill={terracotta} opacity="0.16" />
            {/* Kneeling or humble seated posture */}
            <ellipse cx="94" cy="54" rx="13" ry="16" fill={ink} />
            <path d="M76 68 C76 60, 88 56, 96 56 C108 56, 116 64, 118 76 C120 100, 124 130, 128 160 L68 160 C68 135, 72 100, 76 68 Z" fill={ink} />
            
            {/* Voile doux */}
            <path d="M82 66 C78 85, 78 120, 86 150" stroke={ochre} strokeWidth="2.5" fill="none" opacity="0.9" />
            
            {/* Flacon de nard / albâtre */}
            <ellipse cx="114" cy="120" rx="9" ry="14" fill="#FAF7F2" stroke={ink} strokeWidth="1.5" />
            <rect x="111" y="102" width="6" height="6" fill={ochre} stroke={ink} strokeWidth="1" />
            {/* Gouttes de parfum */}
            <circle cx="114" cy="94" r="2.5" fill={ochre} />
            <circle cx="114" cy="86" r="1.5" fill={ochre} />
          </g>
        );

      case 'barnabas':
        // Barnabas: Fils d'encouragement - mains ouvertes, rameau d'olivier
        return (
          <g>
            <circle cx="100" cy="70" r="44" fill={sage} opacity="0.22" />
            <ellipse cx="100" cy="52" rx="14" ry="16" fill={ink} />
            <path d="M72 74 C72 62, 86 56, 100 56 C114 56, 128 62, 128 74 L132 160 L68 160 Z" fill={ink} />
            
            {/* Open welcoming mantle */}
            <path d="M80 82 C90 98, 94 130, 94 160 L74 160 Z" fill={sage} opacity="0.85" />
            <path d="M120 82 C110 98, 106 130, 106 160 L126 160 Z" fill={sage} opacity="0.85" />
            
            {/* Olive branch (rameau d'olivier) */}
            <path d="M90 105 Q100 95 110 105" stroke={ochre} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <ellipse cx="94" cy="100" rx="3.5" ry="2" fill={sage} transform="rotate(-30 94 100)" />
            <ellipse cx="106" cy="100" rx="3.5" ry="2" fill={sage} transform="rotate(30 106 100)" />
          </g>
        );

      case 'thomas':
        // Thomas: Discernement & Vérité - lampe à huile scrutant le mystère
        return (
          <g>
            <circle cx="118" cy="104" r="36" fill={ochre} opacity="0.25" />
            <ellipse cx="92" cy="54" rx="14" ry="16" fill={ink} />
            <path d="M70 75 C70 64, 82 58, 94 58 C108 58, 118 64, 118 75 L124 160 L62 160 Z" fill={ink} />
            
            {/* Oil lamp (Lampe à huile antique) tenue en avant */}
            <path d="M106 112 Q120 112 126 106 Q128 116 116 118 Z" fill={terracotta} stroke={ink} strokeWidth="1.5" />
            <path d="M126 104 C128 96, 124 92, 126 88 C128 92, 132 96, 126 104 Z" fill={ochre} />
            
            {/* Rays from lamp */}
            <line x1="126" y1="80" x2="126" y2="74" stroke={ochre} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="134" y1="84" x2="140" y2="80" stroke={ochre} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="118" y1="84" x2="112" y2="80" stroke={ochre} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );

      case 'timothee':
        // Timothée: Disciple fidèle & apprenti bâtisseur - jeunesse, rouleau et besace
        return (
          <g>
            <circle cx="100" cy="72" r="40" fill={terracotta} opacity="0.15" />
            <ellipse cx="100" cy="54" rx="13" ry="15" fill={ink} />
            <path d="M76 74 C76 64, 88 60, 100 60 C112 60, 124 64, 124 74 L128 160 L72 160 Z" fill={ink} />
            
            {/* Shoulder satchel strap */}
            <line x1="82" y1="76" x2="122" y2="135" stroke={ochre} strokeWidth="2.5" />
            
            {/* Small scroll held securely */}
            <rect x="86" y="104" width="28" height="12" rx="3" fill="#FFFDF8" stroke={ink} strokeWidth="1.5" />
            <path d="M88 80 C94 92, 98 120, 94 140" stroke={sage} strokeWidth="2" fill="none" />
          </g>
        );

      case 'moise':
        // Moïse: Législateur & Prophète de l'Alliance - Tables de pierre & bâton divin
        return (
          <g>
            {/* Rays of Mount Sinai */}
            <line x1="70" y1="25" x2="80" y2="40" stroke={ochre} strokeWidth="2" strokeLinecap="round" />
            <line x1="100" y1="15" x2="100" y2="32" stroke={ochre} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="130" y1="25" x2="120" y2="40" stroke={ochre} strokeWidth="2" strokeLinecap="round" />
            
            <ellipse cx="100" cy="52" rx="15" ry="17" fill={ink} />
            <path d="M72 74 C72 62, 86 56, 100 56 C114 56, 128 62, 128 74 L134 160 L66 160 Z" fill={ink} />
            
            {/* Two tablets of stone */}
            <path d="M76 96 C76 90, 85 90, 85 96 L85 125 L76 125 Z" fill="#FFFDF8" stroke={ink} strokeWidth="1.5" />
            <path d="M86 96 C86 90, 95 90, 95 96 L95 125 L86 125 Z" fill="#FFFDF8" stroke={ink} strokeWidth="1.5" />
            
            {/* Staff */}
            <line x1="136" y1="36" x2="136" y2="160" stroke={terracotta} strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      default:
        // Dimension-based archetypal silhouettes for all other characters!
        return renderDimensionGraphic(dimension, gender);
    }
  };

  // Dimension-based vector scenes (harmonious two-tone BibleProject vector style)
  const renderDimensionGraphic = (dim: SpiritualDimension | string, charGender: string) => {
    const isFemale = charGender === 'F';
    
    switch (dim) {
      case 'contemplative':
        // Posture de prière & recueillement, flamme intérieure
        return (
          <g>
            <circle cx="100" cy="70" r="46" fill={ochre} opacity="0.18" />
            <ellipse cx="100" cy="54" rx={isFemale ? 13 : 14} ry="16" fill={ink} />
            <path d="M76 74 C76 62, 88 56, 100 56 C112 56, 124 62, 124 74 L128 160 L72 160 Z" fill={ink} />
            {/* Gentle inner light / draped cowl */}
            <path d="M84 76 C94 92, 106 92, 116 76 C116 110, 110 135, 100 145 C90 135, 84 110, 84 76 Z" fill={terracotta} opacity="0.85" />
            <circle cx="100" cy="115" r="5" fill="#FAF7F2" />
          </g>
        );

      case 'leadership':
        // Silhouette d'autorité, bâton de berger/guide, horizon
        return (
          <g>
            <path d="M60 160 L100 45 L140 160 Z" fill={terracotta} opacity="0.09" />
            <circle cx="100" cy="62" r="38" fill={ochre} opacity="0.16" />
            <ellipse cx="98" cy="52" rx={isFemale ? 13 : 15} ry="17" fill={ink} />
            <path d="M72 74 C72 62, 86 56, 98 56 C112 56, 124 62, 124 74 L132 160 L64 160 Z" fill={ink} />
            {/* Staff */}
            <line x1="130" y1="36" x2="130" y2="160" stroke={ochre} strokeWidth="3" strokeLinecap="round" />
            {/* Mantle band */}
            <path d="M78 80 L118 80 L110 130 L86 130 Z" fill={terracotta} opacity="0.85" />
          </g>
        );

      case 'service':
        // Hospitalité, vase d'argile, prévenance
        return (
          <g>
            <circle cx="100" cy="72" r="42" fill={sage} opacity="0.22" />
            <ellipse cx="100" cy="54" rx={isFemale ? 13 : 14} ry="16" fill={ink} />
            <path d="M74 72 C74 62, 86 58, 100 58 C114 58, 126 62, 126 72 L130 160 L70 160 Z" fill={ink} />
            {/* Clay pitcher & serving basin */}
            <path d="M82 86 L118 86 L114 160 L86 160 Z" fill={terracotta} opacity="0.8" />
            <path d="M116 102 C116 96, 128 96, 128 102 L126 126 C126 132, 118 132, 118 126 Z" fill={ochre} stroke={ink} strokeWidth="1.5" />
          </g>
        );

      case 'strategy':
        // Conseil avisé, diadème ou sceau de sagesse
        return (
          <g>
            <circle cx="100" cy="66" r="42" fill={ochre} opacity="0.2" />
            {/* Diadème/Crown touch */}
            <path d="M90 38 L95 32 L100 37 L105 32 L110 38 Z" fill={ochre} />
            <ellipse cx="100" cy="52" rx={isFemale ? 13 : 14} ry="16" fill={ink} />
            <path d="M74 70 C70 95, 68 130, 66 160 L134 160 C132 130, 130 95, 126 70 C118 58, 82 58, 74 70 Z" fill={ink} />
            {/* Scroll of strategy */}
            <rect x="88" y="108" width="24" height="14" rx="2" fill="#FAF7F2" stroke={ink} strokeWidth="1.5" />
            <line x1="92" y1="113" x2="108" y2="113" stroke={terracotta} strokeWidth="1.5" />
          </g>
        );

      case 'encouragement':
        // Mains ouvertes, rameau de paix, lumière bienveillante
        return (
          <g>
            <circle cx="100" cy="68" r="46" fill={sage} opacity="0.2" />
            <ellipse cx="100" cy="52" rx={isFemale ? 13 : 14} ry="16" fill={ink} />
            <path d="M72 74 C72 62, 86 56, 100 56 C114 56, 128 62, 128 74 L132 160 L68 160 Z" fill={ink} />
            {/* Olive branch */}
            <path d="M88 108 Q100 96 112 108" stroke={ochre} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <ellipse cx="94" cy="102" rx="3.5" ry="2" fill={sage} transform="rotate(-30 94 102)" />
            <ellipse cx="106" cy="102" rx="3.5" ry="2" fill={sage} transform="rotate(30 106 102)" />
          </g>
        );

      case 'worship':
        // Harpe de louange, posture céleste
        return (
          <g>
            <circle cx="100" cy="68" r="44" fill={ochre} opacity="0.22" />
            <ellipse cx="100" cy="52" rx={isFemale ? 13 : 14} ry="16" fill={ink} />
            <path d="M76 74 C76 64, 88 56, 100 56 C112 56, 124 64, 124 74 L128 160 L72 160 Z" fill={ink} />
            {/* Kinnor (Lyre) */}
            <path d="M108 90 C108 82, 128 80, 132 92 L130 125 C128 135, 112 134, 110 122 Z" fill="none" stroke={terracotta} strokeWidth="2.5" />
            <line x1="115" y1="88" x2="115" y2="128" stroke={ochre} strokeWidth="1.5" />
            <line x1="121" y1="86" x2="121" y2="130" stroke={ochre} strokeWidth="1.5" />
            <line x1="126" y1="88" x2="126" y2="126" stroke={ochre} strokeWidth="1.5" />
          </g>
        );

      case 'truth':
        // Vérité sans compromis, rouleau de la Loi & torche
        return (
          <g>
            <path d="M100 24 C96 32, 92 36, 100 44 C108 36, 104 32, 100 24 Z" fill={terracotta} />
            <circle cx="100" cy="70" r="42" fill={ochre} opacity="0.16" />
            <ellipse cx="100" cy="54" rx={isFemale ? 13 : 14} ry="17" fill={ink} />
            <path d="M72 76 C72 65, 86 60, 100 60 C114 60, 128 65, 128 76 L134 160 L66 160 Z" fill={ink} />
            {/* Scroll */}
            <rect x="76" y="112" width="28" height="16" rx="2" fill="#FAF7F2" stroke={ink} strokeWidth="1.5" />
            <line x1="80" y1="117" x2="100" y2="117" stroke={ink} strokeWidth="1" />
          </g>
        );

      case 'loyalty':
      default:
        // Fidélité inébranlable, disciple en marche
        return (
          <g>
            <circle cx="100" cy="70" r="42" fill={terracotta} opacity="0.16" />
            <ellipse cx="100" cy="54" rx={isFemale ? 13 : 14} ry="16" fill={ink} />
            <path d="M74 74 C74 64, 86 58, 100 58 C114 58, 126 64, 126 74 L130 160 L70 160 Z" fill={ink} />
            {/* Pilgrim staff */}
            <line x1="128" y1="46" x2="128" y2="160" stroke={ochre} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M84 82 L116 82 L112 135 L88 135 Z" fill={sage} opacity="0.8" />
          </g>
        );
    }
  };

  return (
    <div 
      className={`inline-flex items-center justify-center transition-all select-none ${className}`}
      style={{ width: currentSize.box, height: currentSize.box }}
      title={name || characterKey}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle Arch or Circular Frame (BibleProject Cartouche) */}
        {showFrame && (
          <>
            {/* Arched background cartouche */}
            <path
              d="M30 176 L30 84 Q30 24 100 24 Q170 24 170 84 L170 176 Q100 178 30 176 Z"
              fill={parchment}
              stroke={parchmentBorder}
              strokeWidth="2"
            />
            {/* Inner fine hairline */}
            <path
              d="M36 172 L36 84 Q36 30 100 30 Q164 30 164 84 L164 172"
              fill="none"
              stroke={ochre}
              strokeWidth="0.8"
              opacity="0.4"
            />
          </>
        )}

        {/* Silhouette graphic */}
        {renderGraphic()}

        {/* Base ground line */}
        <line x1="38" y1="162" x2="162" y2="162" stroke={ink} strokeWidth="1.8" opacity="0.4" strokeLinecap="round" />
      </svg>
    </div>
  );
};
