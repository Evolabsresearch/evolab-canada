const crossSellMap = {
  'bpc-157': ['tb-500', 'glow-stack', 'ghk-cu'],
  'hgh-191aa': ['igf-1-lr3', 'ghrp-6', 'cjc-1295-dac'],
  'semaglutide': ['tirzepatide', 'bac-water', 'glp-1-r'],
  'semax': ['selank', 'dihexa', 'pt-141'],
  'tb-500': ['bpc-157', 'kpv', 'glow-stack'],
  'ghk-cu': ['glow-stack', 'bpc-157', 'epithalon'],
  'igf-1-lr3': ['hgh-191aa', 'ghrp-6', 'mk-677'],
  'tirzepatide': ['semaglutide', 'bac-water'],
  'bpc-157-tb-500': ['ghk-cu', 'kpv', 'glow-stack'],
  'epithalon': ['ghk-cu', 'selank', 'pinealon'],
  'glow-stack': ['ghk-cu', 'bpc-157', 'vitamin-c-serum'],
};

export function getCrossSellProducts(purchasedSlugs) {
  const recommendations = new Set();
  for (const slug of purchasedSlugs) {
    const related = crossSellMap[slug] || [];
    for (const r of related) {
      if (!purchasedSlugs.includes(r)) recommendations.add(r);
    }
  }
  return Array.from(recommendations).slice(0, 3);
}
