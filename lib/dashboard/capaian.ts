export type ComparisonOperator = 'GTE' | 'LTE' | 'EQ';

export type Achievement = {
  capaianPercentage: number;
  meetsTarget: boolean;
};

const EPSILON = 0.000001;

/** Indikator dengan operator LTE turun-baik, sehingga capaian dibalik (target/realisasi). */
export function evaluateAchievement(
  realization: number | null,
  target: number | null,
  operator: ComparisonOperator,
): Achievement {
  if (realization === null || target === null) {
    return { capaianPercentage: 0, meetsTarget: false };
  }

  if (operator === 'EQ') {
    return {
      capaianPercentage: target !== 0 ? (realization / target) * 100 : 0,
      meetsTarget: Math.abs(realization - target) < EPSILON,
    };
  }

  if (operator === 'LTE') {
    return {
      capaianPercentage: realization > 0 ? (target / realization) * 100 : 0,
      meetsTarget: realization <= target,
    };
  }

  return {
    capaianPercentage: target !== 0 ? (realization / target) * 100 : 0,
    meetsTarget: realization >= target,
  };
}
