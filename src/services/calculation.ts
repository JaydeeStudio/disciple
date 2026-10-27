import { Dimension, QUESTIONS, DIMENSIONS_INFO, DimensionMeta } from '../data/questions';
import { ARCHETYPES, Archetype } from '../data/archetypes';

export interface DimensionResult {
  key: Dimension;
  label: string;
  rawValue: number;
  leftLabel: string;
  leftPercent: number;
  rightLabel: string;
  rightPercent: number;
  dominantLabel: string;
  description: string;
}

export interface CharacterMatch {
  archetype: Archetype;
  affinity: number; // 0 to 100%
  distance: number;
}

export interface FullTestCalculation {
  primaryMatch: CharacterMatch;
  secondaryMatches: CharacterMatch[];
  genderEquivalentMatch?: CharacterMatch;
  dimensions: Record<Dimension, DimensionResult>;
  rawScores: Record<Dimension, number>;
  summaryExplanation: string;
}

export function computeRawScores(answers: Record<string, number>): Record<Dimension, number> {
  const scores: Record<Dimension, number> = {
    I_A: 0,
    S_E: 0,
    V_G: 0,
    L_F: 0,
    R_M: 0
  };

  Object.entries(answers).forEach(([qId, optIdx]) => {
    const question = QUESTIONS.find(q => q.id === qId);
    if (question && question.options[optIdx]) {
      const option = question.options[optIdx];
      Object.entries(option.weights).forEach(([dim, weight]) => {
        if (weight !== undefined) {
          scores[dim as Dimension] += weight;
        }
      });
    }
  });

  return scores;
}

export function computeDimensionResults(rawScores: Record<Dimension, number>): Record<Dimension, DimensionResult> {
  const results = {} as Record<Dimension, DimensionResult>;
  const MAX_RAW = 16; // approximate max bounds for 20 questions

  (Object.keys(DIMENSIONS_INFO) as Dimension[]).forEach(dim => {
    const info: DimensionMeta = DIMENSIONS_INFO[dim];
    const val = rawScores[dim];
    
    // Normalize to 0..100 where 0 is full left (negative) and 100 is full right (positive)
    const clamped = Math.max(-MAX_RAW, Math.min(MAX_RAW, val));
    const normalizedRight = Math.round(((clamped + MAX_RAW) / (2 * MAX_RAW)) * 100);
    const normalizedLeft = 100 - normalizedRight;

    const isLeftDominant = val <= 0;
    const dominantLabel = isLeftDominant ? info.negativePole.label : info.positivePole.label;
    const description = isLeftDominant ? info.negativePole.description : info.positivePole.description;

    results[dim] = {
      key: dim,
      label: info.label,
      rawValue: val,
      leftLabel: info.negativePole.label,
      leftPercent: normalizedLeft,
      rightLabel: info.positivePole.label,
      rightPercent: normalizedRight,
      dominantLabel,
      description
    };
  });

  return results;
}

export function calculateAffinity(
  userVector: Record<Dimension, number>,
  archetype: Archetype
): number {
  // Euclidean distance between user's score vector and archetype reference coordinates
  const coords = archetype.coordinates;
  const d_IA = userVector.I_A - coords.I_A;
  const d_SE = userVector.S_E - coords.S_E;
  const d_VG = userVector.V_G - coords.V_G;
  const d_LF = userVector.L_F - coords.L_F;
  const d_RM = userVector.R_M - coords.R_M;

  const distance = Math.sqrt(
    d_IA * d_IA +
    d_SE * d_SE +
    d_VG * d_VG +
    d_LF * d_LF +
    d_RM * d_RM
  );

  // Maximum theoretical distance in 5D coordinate space is ~45
  const MAX_DIST = 42;
  const affinity = Math.max(20, Math.min(99, Math.round(100 - (distance / MAX_DIST) * 80)));
  return affinity;
}

export function performFullCalculation(
  answers: Record<string, number>,
  userGender?: 'M' | 'F' | 'OTHER'
): FullTestCalculation {
  const rawScores = computeRawScores(answers);
  const dimensions = computeDimensionResults(rawScores);

  // Calculate affinities for all archetypes
  const allMatches: CharacterMatch[] = Object.values(ARCHETYPES).map(archetype => {
    const coords = archetype.coordinates;
    const d_IA = rawScores.I_A - coords.I_A;
    const d_SE = rawScores.S_E - coords.S_E;
    const d_VG = rawScores.V_G - coords.V_G;
    const d_LF = rawScores.L_F - coords.L_F;
    const d_RM = rawScores.R_M - coords.R_M;

    const distance = Math.sqrt(
      d_IA * d_IA +
      d_SE * d_SE +
      d_VG * d_VG +
      d_LF * d_LF +
      d_RM * d_RM
    );

    const affinity = calculateAffinity(rawScores, archetype);

    return {
      archetype,
      affinity,
      distance
    };
  }).sort((a, b) => b.affinity - a.affinity);

  // Filter based on preferred gender if provided
  let primaryMatch: CharacterMatch;
  let secondaryMatches: CharacterMatch[];
  let genderEquivalentMatch: CharacterMatch | undefined;

  if (userGender === 'M') {
    const maleMatches = allMatches.filter(m => m.archetype.gender === 'M' || m.archetype.gender === 'BOTH');
    primaryMatch = maleMatches[0] || allMatches[0];
    secondaryMatches = maleMatches.slice(1, 4);

    // Complementary counterpart in women
    const femaleMatches = allMatches.filter(m => m.archetype.gender === 'F');
    genderEquivalentMatch = femaleMatches[0];
  } else if (userGender === 'F') {
    const femaleMatches = allMatches.filter(m => m.archetype.gender === 'F' || m.archetype.gender === 'BOTH');
    primaryMatch = femaleMatches[0] || allMatches[0];
    secondaryMatches = femaleMatches.slice(1, 4);

    // Complementary counterpart in men
    const maleMatches = allMatches.filter(m => m.archetype.gender === 'M');
    genderEquivalentMatch = maleMatches[0];
  } else {
    primaryMatch = allMatches[0];
    secondaryMatches = allMatches.slice(1, 4);
    genderEquivalentMatch = allMatches.find(m => m.archetype.gender !== primaryMatch.archetype.gender);
  }

  // Generate explanatory summary
  const summaryExplanation = generateSummaryText(primaryMatch.archetype, dimensions);

  return {
    primaryMatch,
    secondaryMatches,
    genderEquivalentMatch,
    dimensions,
    rawScores,
    summaryExplanation
  };
}

function generateSummaryText(archetype: Archetype, dimensions: Record<Dimension, DimensionResult>): string {
  const ia = dimensions.I_A;
  const vg = dimensions.V_G;
  const se = dimensions.S_E;
  const lf = dimensions.L_F;
  const rm = dimensions.R_M;

  const topDimensions = [ia, vg, se, lf, rm].sort((a, b) => {
    const diffA = Math.abs(a.rawValue);
    const diffB = Math.abs(b.rawValue);
    return diffB - diffA;
  });

  const dom1 = topDimensions[0];
  const dom2 = topDimensions[1];

  return `Votre profil spirituel se distingue particulièrement par une forte orientation vers ${dom1.dominantLabel} (${Math.max(dom1.leftPercent, dom1.rightPercent)}%) et ${dom2.dominantLabel} (${Math.max(dom2.leftPercent, dom2.rightPercent)}%). Cette harmonie correspond intimement au tempérament de ${archetype.name} : ${archetype.title.toLowerCase()}.`;
}
