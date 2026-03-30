// ─── Utility ────────────────────────────────────────────────────────────────
export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ─── Category config ─────────────────────────────────────────────────────────
export const CATEGORIES = [
  { name: 'Growth Hormone Peptides',    slug: 'growth-hormone',   color: '#EFF6FF', accentColor: '#1E3A8A', icon: '🔬', shopUrl: 'https://evolabsresearch.ca/5-10packs/' },
  { name: 'GLP-1 Research Peptides',   slug: 'glp1',             color: '#FEF2F2', accentColor: '#991B1B', icon: '⚗️', shopUrl: 'https://evolabsresearch.ca/metabolic-glp-research-peptides/' },
  { name: 'Healing & Regeneration',    slug: 'healing',          color: '#F0FDF4', accentColor: '#166534', icon: '💊', shopUrl: 'https://evolabsresearch.ca/healing-regeneration/' },
  { name: 'Mitochondrial Peptides',    slug: 'mitochondrial',    color: '#F5F3FF', accentColor: '#5B21B6', icon: '⚡', shopUrl: 'https://evolabsresearch.ca/longevity-cellular/' },
  { name: 'Cognitive & Neuro Peptides',slug: 'cognitive',        color: '#EFF6FF', accentColor: '#1E3A8A', icon: '🧠', shopUrl: 'https://evolabsresearch.ca/cognitive-neuro/' },
  { name: 'Metabolic Peptides',        slug: 'metabolic',        color: '#FFF7ED', accentColor: '#92400E', icon: '🔥', shopUrl: 'https://evolabsresearch.ca/metabolic-glp-research-peptides/' },
  { name: 'Reconstitution Supplies',   slug: 'supplies',         color: '#F0FDF4', accentColor: '#166534', icon: '⚗️', shopUrl: 'https://evolabsresearch.ca/bac-water/' },
  { name: 'Research Kits - EVO Stacks',slug: 'kits',             color: '#F0FDF4', accentColor: '#166534', icon: '📦', shopUrl: 'https://evolabsresearch.ca/evo-stacks/' },
];

export function getCategoryConfig(catName) {
  return CATEGORIES.find(c => c.name === catName) || { color: '#F3F4F6', icon: '🔬' };
}

// ─── Products ────────────────────────────────────────────────────────────────
const rawProducts = [
  { id: 1,  name: 'BPC-157',                         price: 'From $29.99', salePrice: null,     image: '/images/products/catalog/BPC-157 10MG.png',                                    category: 'Healing & Regeneration',      badge: 'Best Seller', description: 'One of the most researched regenerative peptides. BPC-157 (Body Protection Compound-157) is a 15 amino acid peptide known for its role in supporting tissue repair and recovery.', shopUrl: 'https://evolabsresearch.ca/product/bpc-157/' },
  { id: 2,  name: 'GLP 3 (R)',                       price: 'From $49.99', salePrice: null,     image: '/images/products/catalog/GLP-3(R) 10MG.png',                                  category: 'GLP-1 Research Peptides',     badge: 'Best Seller', description: 'A triple-action research compound targeting GLP receptors. GLP 3 (R) is one of the most advanced metabolic peptides in our catalog.', shopUrl: 'https://evolabsresearch.ca/product/glp-3-r/' },
  { id: 3,  name: 'GLP 2 (T)',                       price: 'From $49.99', salePrice: null,     image: '/images/products/catalog/GLP-2(T) 10MG.png',                                  category: 'GLP-1 Research Peptides',     badge: null,          description: 'A GLP-2 receptor agonist with applications in metabolic research. Tirzepatide-class peptide studied for body composition and metabolic function.', shopUrl: 'https://evolabsresearch.ca/product/glp-2-t/' },
  { id: 4,  name: 'HGH 191aa',                      price: 'From $69.99', salePrice: null,     image: '/images/products/catalog/HGH 191aa 24iu.png',                                 category: 'Growth Hormone Peptides',     badge: 'Best Seller', description: 'Recombinant Human Growth Hormone 191 amino acid sequence. The gold standard for growth hormone research, identical in structure to naturally produced HGH.', shopUrl: 'https://evolabsresearch.ca/product/hgh-191aa/' },
  { id: 5,  name: 'NAD+',                            price: '$89.99',      salePrice: '$69.99', image: '/images/products/catalog/NAD-Plus 500MG.png',                                     category: 'Mitochondrial Peptides',      badge: 'Popular',     description: 'Nicotinamide Adenine Dinucleotide — a critical coenzyme found in every living cell. Central to cellular energy metabolism and extensively studied in longevity research.', shopUrl: 'https://evolabsresearch.ca/product/nad/' },
  { id: 6,  name: 'Epithalon',                      price: '$59.99',      salePrice: '$39.99', image: '/images/products/catalog/Epithalon 10MG.png',                                 category: 'Mitochondrial Peptides',      badge: null,          description: 'A tetrapeptide studied for its role in telomere regulation and epigenetic effects. Epithalon (Epitalon) has been researched for anti-aging and longevity applications.', shopUrl: 'https://evolabsresearch.ca/product/epithalon/' },
  { id: 7,  name: 'KLOW',                           price: '$149.99',     salePrice: '$129.99',image: '/images/products/catalog/KLOW 80MG.png',                                      category: 'Healing & Regeneration',      badge: 'New',         description: 'EVO Labs proprietary healing and recovery blend. KLOW combines BPC-157, TB-500, KPV, and GHK-CU for synergistic tissue repair, anti-inflammatory action, and systemic regeneration studied across multiple preclinical models.', shopUrl: 'https://evolabsresearch.ca/product/klow/', lowStock: true },
  { id: 8,  name: 'MOTS-C',                         price: '$89.99',      salePrice: '$49.99', image: '/images/products/catalog/MOTS-C 10MG.png',                                    category: 'Mitochondrial Peptides',      badge: null,          description: 'A mitochondria-derived peptide (MDP) encoded within the mitochondrial 12S rRNA gene. Studied for its role in metabolic regulation, exercise performance, and longevity.', shopUrl: 'https://evolabsresearch.ca/product/mots-c/' },
  { id: 9,  name: 'Ipamorelin',                     price: '$79.99',      salePrice: '$49.99', image: '/images/products/catalog/Ipamorelin 10MG.png',                                category: 'Growth Hormone Peptides',     badge: null,          description: 'A selective growth hormone secretagogue. Ipamorelin stimulates GH release with high selectivity, making it a cornerstone compound for growth hormone research.', shopUrl: 'https://evolabsresearch.ca/product/ipamorelin/' },
  { id: 10, name: 'CJC-1295 w/o DAC',               price: '$99.99',      salePrice: '$69.99', image: '/images/products/catalog/CJC-1295 wo DAC 10MG.png',                           category: 'Growth Hormone Peptides',     badge: null,          description: 'A modified GHRH analog without Drug Affinity Complex. CJC-1295 w/o DAC (also known as Mod GRF 1-29) is commonly researched alongside Ipamorelin for synergistic GH release.', shopUrl: 'https://evolabsresearch.ca/product/cjc-1295-without-dac/' },
  { id: 11, name: 'CJC-1295 W/O DAC + Ipamorelin', price: '$109.99',     salePrice: '$69.99', image: '/images/products/catalog/CJC-1295 Ipamorelin 10MG.png',                     category: 'Growth Hormone Peptides',     badge: 'Best Seller', description: 'The most popular GH research combination. CJC-1295 w/o DAC (5mg) paired with Ipamorelin (5mg) in a single vial for convenient combined research protocols.', shopUrl: 'https://evolabsresearch.ca/product/cjc-1295-wo-dac-5mg-ipamorelin-5mg/' },
  { id: 12, name: 'Semax',                          price: '$49.99',      salePrice: '$39.99', image: '/images/products/catalog/Semax 10MG.png',                                     category: 'Cognitive & Neuro Peptides',  badge: null,          description: 'A synthetic analog of ACTH derived from the N-terminus of ACTH. Semax has been studied for cognitive enhancement, neuroprotection, and neurotrophin regulation.', shopUrl: 'https://evolabsresearch.ca/product/semax/' },
  { id: 13, name: 'Selank',                         price: '$79.99',      salePrice: '$39.99', image: '/images/products/catalog/Selank 10MG.png',                                    category: 'Cognitive & Neuro Peptides',  badge: null,          description: 'A synthetic analog of tuftsin with anxiolytic properties. Selank is studied for its nootropic, anxiolytic, and immune-modulating effects in cognitive neuroscience research.', shopUrl: 'https://evolabsresearch.ca/product/selank/' },
  { id: 14, name: 'GLP 1 (S)',                      price: 'From $44.99', salePrice: null,     image: '/images/products/catalog/GLP-1(S) 10MG.png',                                  category: 'GLP-1 Research Peptides',     badge: null,          description: 'Semaglutide-class GLP-1 receptor agonist. Studied extensively for metabolic research, glycemic regulation, and body composition applications.', shopUrl: 'https://evolabsresearch.ca/product/glp-1-s/' },
  { id: 15, name: 'GHK-CU',                         price: 'From $39.99', salePrice: null,     image: '/images/products/catalog/GHK-Cu 50MG.png',                                    category: 'Healing & Regeneration',      badge: null,          description: 'Copper peptide complex studied for skin regeneration, wound healing, and anti-aging effects. GHK-Cu stimulates collagen synthesis and has antioxidant properties.', shopUrl: 'https://evolabsresearch.ca/product/ghk-cu/' },
  { id: 16, name: 'Glutathione',                    price: '$109.99',     salePrice: '$69.99', image: '/images/products/catalog/Glutathione 1500MG.png',                             category: 'Healing & Regeneration',      badge: null,          description: "The body's master antioxidant tripeptide. Glutathione is critical for cellular detoxification, immune function, and mitochondrial protection research."},
  { id: 17, name: 'BPC 157 + TB 500',               price: '$99.99',      salePrice: '$79.99', image: '/images/products/catalog/BPC-157 TB500 20MG.png',                           category: 'Healing & Regeneration',      badge: 'Best Seller', description: 'The ultimate regenerative stack combining BPC-157 and TB-500 (Thymosin Beta-4 fragment). Widely studied for synergistic healing, tissue repair, and recovery applications.', shopUrl: 'https://evolabsresearch.ca/product/bpc-157-tb-500/' },
  { id: 18, name: 'IGF-1LR3',                       price: '$109.99',     salePrice: '$69.99', image: '/images/products/catalog/IGF-1 LR3 1MG.png',                                  category: 'Growth Hormone Peptides',     badge: null,          description: 'Long-arg3 IGF-1 variant with extended half-life. Insulin-like Growth Factor 1 LR3 is researched for its potent anabolic effects and role in muscle and connective tissue repair.', shopUrl: 'https://evolabsresearch.ca/product/igf-1lr3/' },
  { id: 19, name: 'Kisspeptin',                     price: '$119.99',     salePrice: '$89.99', image: '/images/products/catalog/Kisspeptin 10MG.png',                                category: 'Cognitive & Neuro Peptides',  badge: null,          description: 'A neuropeptide that regulates the hypothalamic-pituitary-gonadal axis. Kisspeptin is studied for its role in hormone regulation, fertility research, and neuroendocrinology.', shopUrl: 'https://evolabsresearch.ca/product/kisspeptin/', lowStock: true },
  { id: 20, name: 'KPV',                            price: '$99.99',      salePrice: '$59.99', image: '/images/products/catalog/KPV 10MG.png',                                       category: 'Healing & Regeneration',      badge: null,          description: 'A C-terminal tripeptide of alpha-MSH with potent anti-inflammatory properties. KPV is studied for gut inflammation, wound healing, and systemic anti-inflammatory effects.', shopUrl: 'https://evolabsresearch.ca/product/kpv/' },
  { id: 21, name: 'PT-141',                         price: '$59.99',      salePrice: '$39.99', image: '/images/products/catalog/PT-141 10MG.png',                                    category: 'Cognitive & Neuro Peptides',  badge: null,          description: 'Bremelanotide — a melanocortin receptor agonist. PT-141 acts on the central nervous system and is studied for its effects on sexual function and melanocortin signaling pathways.', shopUrl: 'https://evolabsresearch.ca/product/pt-141/' },
  { id: 22, name: 'MT-2 (Melanotan II)',             price: '$49.99',      salePrice: '$39.99', image: '/images/products/catalog/Melanotan II 10MG.png',                              category: 'Cognitive & Neuro Peptides',  badge: null,          description: 'A synthetic analog of alpha-MSH targeting melanocortin receptors. Melanotan II is studied for tanning, appetite suppression, and sexual function in preclinical research.', shopUrl: 'https://evolabsresearch.ca/product/mt-2-melanotan-ii/' },
  { id: 23, name: 'Thymosin Alpha',                 price: '$69.99',      salePrice: '$59.99', image: '/images/products/catalog/Thymosin Alpha-1 5MG.png',                           category: 'Healing & Regeneration',      badge: null,          description: 'An immune-modulating peptide derived from thymosin fraction 5. Thymosin Alpha-1 is studied for its role in T-cell maturation, immune enhancement, and anti-inflammatory effects.', shopUrl: 'https://evolabsresearch.ca/product/thymosin-alpha/' },
  { id: 24, name: 'SS31',                           price: '$89.99',      salePrice: '$79.99', image: '/images/products/catalog/SS-31 10MG.png',                                     category: 'Mitochondrial Peptides',      badge: null,          description: 'A mitochondria-targeted antioxidant peptide. SS-31 (Elamipretide) concentrates in the inner mitochondrial membrane and is studied for cardioprotection and mitochondrial function.', shopUrl: 'https://evolabsresearch.ca/product/ss31/' },
  { id: 25, name: 'SNAP-8',                         price: '$49.99',      salePrice: '$39.99', image: '/images/products/catalog/SNAP-8 10MG.png',                                    category: 'Healing & Regeneration',      badge: null,          description: 'An 8 amino acid peptide analog of SNAP-25. Studied as a topical anti-wrinkle compound that reduces muscle contraction at the neuromuscular junction site.', shopUrl: 'https://evolabsresearch.ca/product/snap-8/' },
  { id: 26, name: 'GLOW',                           price: '$139.99',     salePrice: '$109.99',image: '/images/products/catalog/GLOW 70MG.png',                                      category: 'Healing & Regeneration',      badge: 'New',         description: 'EVO Labs proprietary skin and anti-aging blend. GLOW combines GHK-CU, BPC-157, and TB-500 for synergistic collagen stimulation, dermal repair, and cellular regeneration studied in aesthetic and wound-healing research models.', shopUrl: 'https://evolabsresearch.ca/product/glow/' },
  { id: 27, name: 'DSIP',                           price: 'From $34.99', salePrice: null,     image: '/images/products/catalog/DSIP 10MG.png',                                      category: 'Cognitive & Neuro Peptides',  badge: null,          description: 'Delta Sleep-Inducing Peptide — a neuropeptide studied for sleep regulation, stress response, and neuroprotective effects. DSIP modulates delta-wave sleep in research models.', shopUrl: 'https://evolabsresearch.ca/product/dsip/' },
  { id: 28, name: 'Cerebrolysin',                   price: '$99.99',      salePrice: null,     image: '/images/products/catalog/Cerebrolysin 60MG.png',                              category: 'Cognitive & Neuro Peptides',  badge: null,          description: 'A neuropeptide mixture derived from porcine brain protein. Cerebrolysin is studied for neuroprotection, neuroplasticity, and cognitive function in neuroscience research.', shopUrl: 'https://evolabsresearch.ca/product/cerebrolysin/' },
  { id: 29, name: 'Pinealon',                       price: 'Out of Stock', salePrice: null,    image: '/images/products/catalog/Pinealon 10MG.png',                                  category: 'Cognitive & Neuro Peptides',  badge: null,          description: 'A tripeptide bioregulator from the pineal gland. Pinealon is studied for neuroprotective effects, cognitive function, and circadian rhythm regulation.', shopUrl: 'https://evolabsresearch.ca/product/pinealon/', outOfStock: true },
  { id: 30, name: 'Tesa',                           price: '$99.99',      salePrice: '$69.99', image: '/images/products/catalog/Tesa 10MG.png',                                      category: 'Growth Hormone Peptides',     badge: null,          description: 'A growth hormone releasing peptide studied for GH secretagogue activity. Tesa supports the hypothalamic-pituitary axis in growth hormone research protocols.', shopUrl: 'https://evolabsresearch.ca/product/tesa/' },
  { id: 31, name: 'Cagrilintide',                   price: '$109.99',     salePrice: '$69.99', image: '/images/products/catalog/Cagrilintide 10MG.png',                              category: 'GLP-1 Research Peptides',     badge: 'New',         description: 'A long-acting amylin analog studied alongside GLP-1 agonists. Cagrilintide is researched for its complementary effects on appetite regulation and metabolic outcomes.', shopUrl: 'https://evolabsresearch.ca/product/cagrilintide/', lowStock: true },
  { id: 32, name: '5 Amino 1 MQ',                  price: '$59.99',      salePrice: null,     image: '/images/products/catalog/5 Amino 1MQ 5MG.png',                                category: 'Metabolic Peptides',          badge: null,          description: 'A selective NNMT inhibitor. 5-Amino-1MQ is studied for its role in activating AMPK pathways, promoting fat oxidation, and improving metabolic function at the cellular level.', shopUrl: 'https://evolabsresearch.ca/product/5-amino-1-mq/' },
  { id: 33, name: 'B12',                            price: '$69.99',      salePrice: '$59.99', image: '/images/products/catalog/B12 10ML.png',                                       category: 'Reconstitution Supplies',     badge: null,          description: 'Methylcobalamin B12 for research use. Essential cofactor in numerous enzymatic reactions, studied for neurological function, energy metabolism, and cellular health.', shopUrl: 'https://evolabsresearch.ca/product/b12/' },
  { id: 34, name: 'LIPO C',                         price: '$69.99',      salePrice: '$59.99', image: '/images/products/catalog/Metabolic 10ML.png',                                 category: 'Metabolic Peptides',          badge: null,          description: 'Lipotropic compound blend studied for fat mobilization and liver function. LIPO C contains methionine, inositol, choline, and B vitamins for metabolic research applications.', shopUrl: 'https://evolabsresearch.ca/product/lipo-c/' },
  { id: 35, name: 'Bac Water 10 mL',               price: '$12.99',      salePrice: null,     image: '/images/products/catalog/Bac Water 10ML.png',                                 category: 'Reconstitution Supplies',     badge: null,          description: 'Bacteriostatic water with 0.9% benzyl alcohol preservative to prevent microbial growth. Standard 10mL multi-use vial for research laboratory use.', shopUrl: 'https://evolabsresearch.ca/product/bac-water-10-ml/' },
  { id: 36, name: 'Bac Water United Labs® (30ML)', price: '$24.99',      salePrice: '$23.99', image: '/images/products/catalog/Bac Water 30ML.png',                                 category: 'Reconstitution Supplies',     badge: null,          description: 'Premium United Labs® bacteriostatic water in 30mL multi-use vial. Pharmaceutical-grade quality for research laboratory applications.', shopUrl: 'https://evolabsresearch.ca/product/bac-water-united-labs-30ml/' },
  // ─── Research Kits - EVO Stacks ──────────────────────────────────────────────
  { id: 37, name: 'EVO Alpha Research Stack',      price: '$209.99',     salePrice: '$179.99',image: '/images/products/catalog/EVO Stack Alpha Research.png',                       category: 'Research Kits - EVO Stacks', badge: 'Best Seller', description: 'Multi-compound research kit designed for comprehensive performance research. Includes synergistic peptides targeting growth, recovery, and metabolic function in one bundle.', shopUrl: 'https://evolabsresearch.ca/product/evo-alpha-research-stack/' },
  { id: 38, name: 'EVO Cognitive Research Stack',  price: '$163.99',     salePrice: '$139.99',image: '/images/products/catalog/EVO Stack Cognitive (Semax DSIP Selank).png',        category: 'Research Kits - EVO Stacks', badge: null,          description: 'Cognitive enhancement research kit combining nootropic and neuroprotective peptides. Ideal for research into neuroplasticity, focus, and cognitive function.', shopUrl: 'https://evolabsresearch.ca/product/evo-cognitive-research-stack/' },
  { id: 39, name: 'EVO Elite Research Stack',      price: '$299.99',     salePrice: '$269.99',image: '/images/products/catalog/EVO Stack Elite Research.png',                       category: 'Research Kits - EVO Stacks', badge: 'Premium',     description: 'Our most comprehensive research bundle. The EVO Elite Stack combines premium-tier peptides across multiple categories for advanced multi-pathway research protocols.', shopUrl: 'https://evolabsresearch.ca/product/evo-elite-research-stack/' },
  { id: 40, name: 'EVO Libido Research Stack',     price: '$209.99',     salePrice: '$199.99',image: '/images/products/catalog/EVO Stack Libido (GLP-3R Melanotan II PT-141).png', category: 'Research Kits - EVO Stacks', badge: null,          description: 'Research kit combining GLP-3(R), Melanotan II, and PT-141 for comprehensive research into metabolic and melanocortin signaling pathways.', shopUrl: 'https://evolabsresearch.ca/product/evo-libido-research-stack/' },
  { id: 41, name: 'EVO Longevity Research Stack',  price: '$229.90',     salePrice: '$199.99',image: '/images/products/catalog/EVO Stack Longevity (Epithalon Thymosin Alpha-1 Glutathione).png', category: 'Research Kits - EVO Stacks', badge: null, description: 'Longevity-focused research bundle combining telomere, mitochondrial, and anti-aging peptides. Curated for cellular health and longevity pathway research.', shopUrl: 'https://evolabsresearch.ca/product/evo-longevity-research-stack/' },
  { id: 42, name: 'EVO Metabolic Research Stack',  price: '$219.99',     salePrice: '$199.99',image: '/images/products/catalog/EVO Stack Metabolic Research.png',                   category: 'Research Kits - EVO Stacks', badge: null,          description: 'Metabolic optimization research kit combining GLP-class peptides and metabolic modulators. Designed for weight management and metabolic function research protocols.', shopUrl: 'https://evolabsresearch.ca/product/evo-metabolic-research-stack/' },
  { id: 43, name: 'EVO Muscle & Repair Stack',     price: '$199.90',     salePrice: '$159.99',image: '/images/products/catalog/EVO Stack Muscle Repair.png',                        category: 'Research Kits - EVO Stacks', badge: null,          description: 'Muscle and connective tissue repair research bundle. Combines growth hormone secretagogues with regenerative peptides for comprehensive recovery research.', shopUrl: 'https://evolabsresearch.ca/product/evo-muscle-repair-stack/' },
  // ─── Vial Sets ───────────────────────────────────────────────────────────────
  { id: 44, name: 'EVO GLP-2 (T) 5 Vial Set',     price: 'From $209.99',salePrice: null,     image: '/images/products/catalog/GLP-2(T) 5-PACK 10MG.png',                           category: 'GLP-1 Research Peptides',     badge: null,          description: 'Five-vial research set of GLP-2 (T) Tirzepatide-class peptide. Ideal for extended research protocols requiring consistent compound supply at a value-bundled price.', shopUrl: 'https://evolabsresearch.ca/product/evo-glp-2-t-5-vial-set/' },
  { id: 45, name: 'EVO GLP-2 (T) 10 Vial Set',    price: 'From $449.99',salePrice: null,     image: '/images/products/catalog/GLP-2(T) 10-PACK 10MG.png',                          category: 'GLP-1 Research Peptides',     badge: null,          description: 'Ten-vial research set for long-term GLP-2 (T) research. Maximum value for laboratory settings and extended metabolic research protocols.', shopUrl: 'https://evolabsresearch.ca/product/evo-glp-2-t-10-vial-set/' },
  { id: 46, name: 'EVO GLP-3 (R) 5 Vial Set',     price: 'From $209.99',salePrice: null,     image: '/images/products/catalog/GLP-3(R) 5-PACK 10MG.png',                           category: 'GLP-1 Research Peptides',     badge: null,          description: 'Five-vial research set of our signature GLP-3 (R) triple-action peptide. Designed for extended research studies requiring consistent and reliable compound supply.', shopUrl: 'https://evolabsresearch.ca/product/evo-glp-3-r-5-vial-set/' },
  { id: 47, name: 'EVO GLP-3 (R) 10 Vial Set',    price: 'From $449.99',salePrice: null,     image: '/images/products/catalog/GLP-3(R) 10-PACK 10MG.png',                          category: 'GLP-1 Research Peptides',     badge: null,          description: 'Ten-vial research set of GLP-3 (R) for institutional and extended research. Maximum economy for high-volume research with consistent batch-verified quality.', shopUrl: 'https://evolabsresearch.ca/product/evo-glp-3-r-10-vial-set/' },
  { id: 48, name: 'EVO HGH 5 Vial Set',           price: 'From $309.99',salePrice: null,     image: '/images/products/catalog/HGH 191aa 5-PACK 24iu.png',                          category: 'Growth Hormone Peptides',     badge: null,          description: 'Five-vial HGH 191aa research set. Provides an economical supply of recombinant growth hormone for extended longitudinal research and laboratory protocols.', shopUrl: 'https://evolabsresearch.ca/product/evo-hgh-5-vial-set/' },
];

// ─── Ratings ─────────────────────────────────────────────────────────────────
const RATINGS = {
  1:  { rating: 4.9, reviewCount: 227 },  // BPC-157
  2:  { rating: 4.8, reviewCount: 373 },  // GLP 3 (R)
  3:  { rating: 4.8, reviewCount: 89  },  // GLP 2 (T)
  4:  { rating: 4.9, reviewCount: 184 },  // HGH 191aa
  5:  { rating: 4.8, reviewCount: 238 },  // NAD+
  6:  { rating: 4.9, reviewCount: 34  },  // Epithalon
  7:  { rating: 4.9, reviewCount: 142 },  // KLOW
  8:  { rating: 4.8, reviewCount: 238 },  // MOTS-C
  9:  { rating: 4.9, reviewCount: 48  },  // Ipamorelin
  10: { rating: 4.8, reviewCount: 61  },  // CJC-1295 w/o DAC
  11: { rating: 4.9, reviewCount: 157 },  // CJC-1295 + Ipa
  12: { rating: 4.9, reviewCount: 84  },  // Semax
  13: { rating: 4.9, reviewCount: 89  },  // Selank
  14: { rating: 4.8, reviewCount: 92  },  // GLP 1 (S)
  15: { rating: 4.9, reviewCount: 256 },  // GHK-CU
  16: { rating: 4.9, reviewCount: 75  },  // Glutathione
  17: { rating: 4.8, reviewCount: 184 },  // BPC 157 + TB 500
  18: { rating: 4.8, reviewCount: 69  },  // IGF-1LR3
  19: { rating: 4.7, reviewCount: 43  },  // Kisspeptin
  20: { rating: 4.8, reviewCount: 61  },  // KPV
  21: { rating: 4.9, reviewCount: 67  },  // PT-141
  22: { rating: 4.9, reviewCount: 162 },  // MT-2
  23: { rating: 4.8, reviewCount: 57  },  // Thymosin Alpha
  24: { rating: 4.8, reviewCount: 42  },  // SS31
  25: { rating: 4.7, reviewCount: 38  },  // SNAP-8
  26: { rating: 4.9, reviewCount: 204 },  // GLOW
  27: { rating: 4.7, reviewCount: 93  },  // DSIP
  28: { rating: 4.8, reviewCount: 51  },  // Cerebrolysin
  29: { rating: 4.8, reviewCount: 30  },  // Pinealon
  30: { rating: 4.8, reviewCount: 72  },  // Tesa
  31: { rating: 5.0, reviewCount: 1   },  // Cagrilintide
  32: { rating: 4.8, reviewCount: 27  },  // 5 Amino 1 MQ
  33: { rating: 4.7, reviewCount: 65  },  // B12
  34: { rating: 4.7, reviewCount: 42  },  // LIPO C
  35: { rating: 4.8, reviewCount: 125 },  // Bac Water 10mL
  36: { rating: 4.9, reviewCount: 89  },  // Bac Water 30mL
  37: { rating: 4.9, reviewCount: 78  },  // Alpha Stack
  38: { rating: 4.8, reviewCount: 52  },  // Cognitive Stack
  39: { rating: 4.9, reviewCount: 43  },  // Elite Stack
  40: { rating: 4.8, reviewCount: 38  },  // Endurance Stack
  41: { rating: 4.9, reviewCount: 31  },  // Longevity Stack
  42: { rating: 4.8, reviewCount: 45  },  // Metabolic Stack
  43: { rating: 4.8, reviewCount: 61  },  // Muscle Stack
  44: { rating: 4.8, reviewCount: 28  },  // GLP-2 5 Vial
  45: { rating: 4.9, reviewCount: 19  },  // GLP-2 10 Vial
  46: { rating: 4.8, reviewCount: 34  },  // GLP-3 5 Vial
  47: { rating: 4.8, reviewCount: 22  },  // GLP-3 10 Vial
  48: { rating: 4.9, reviewCount: 27  },  // HGH 5 Vial
};

// Attach slugs and ratings
export const products = rawProducts.map(p => ({
  ...p,
  slug: slugify(p.name),
  ...(RATINGS[p.id] || { rating: 4.8, reviewCount: 50 }),
}));

export function getProductBySlug(slug) {
  return products.find(p => p.slug === slug);
}

export function getProductsByCategory(cat) {
  return products.filter(p => p.category === cat);
}

export const FEATURED_SLUGS = [
  'bpc-157', 'glp-3-r', 'hgh-191aa', 'klow',
  'nad', 'epithalon', 'cjc-1295-w-o-dac-ipamorelin', 'bpc-157-tb-500',
];

// Per-product dosage variants with pricing
// Products without an entry here use the default ['5mg','10mg','20mg'] labels
// and the product's base price for all selections.
export const PRODUCT_VARIANTS = {
  'bpc-157':  [
    { label: '5mg',  price: '$29.99' },
    { label: '10mg', price: '$49.99' },
    { label: '20mg', price: '$79.99' },
  ],
  'glp-3-r': [
    { label: '5mg',  price: '$49.99' },
    { label: '10mg', price: '$84.99' },
    { label: '20mg', price: '$149.99' },
  ],
  'glp-2-t': [
    { label: '5mg',  price: '$49.99' },
    { label: '10mg', price: '$84.99' },
    { label: '20mg', price: '$149.99' },
  ],
  'hgh-191aa': [
    { label: '5mg',  price: '$69.99' },
    { label: '10mg', price: '$109.99' },
    { label: '20mg', price: '$179.99' },
  ],
  'glp-1-s': [
    { label: '5mg',  price: '$44.99' },
    { label: '10mg', price: '$79.99' },
    { label: '20mg', price: '$139.99' },
  ],
  'ghk-cu': [
    { label: '5mg',  price: '$39.99' },
    { label: '10mg', price: '$64.99' },
    { label: '20mg', price: '$99.99' },
  ],
  'dsip': [
    { label: '5mg',  price: '$34.99' },
    { label: '10mg', price: '$59.99' },
    { label: '20mg', price: '$94.99' },
  ],
  // Vial set variants (concentration options)
  'evo-glp-2-t-5-vial-set': [
    { label: '5mg × 5', price: '$209.99' },
    { label: '10mg × 5', price: '$374.99' },
  ],
  'evo-glp-2-t-10-vial-set': [
    { label: '5mg × 10', price: '$449.99' },
    { label: '10mg × 10', price: '$799.99' },
  ],
  'evo-glp-3-r-5-vial-set': [
    { label: '5mg × 5', price: '$209.99' },
    { label: '10mg × 5', price: '$374.99' },
  ],
  'evo-glp-3-r-10-vial-set': [
    { label: '5mg × 10', price: '$449.99' },
    { label: '10mg × 10', price: '$799.99' },
  ],
  'evo-hgh-5-vial-set': [
    { label: '5mg × 5', price: '$309.99' },
    { label: '10mg × 5', price: '$524.99' },
  ],
};

export const FEATURED = products.filter(p =>
  ['bpc-157','glp-3-r','hgh-191aa','klow','nad','epithalon','cjc-1295-w-o-dac-ipamorelin','bpc-157-tb-500'].includes(p.slug)
).slice(0, 8);

// ─── COAs ────────────────────────────────────────────────────────────────────
export const COAS = [
  { name: 'BPC-157',          batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/BPC-157 10MG.png',              pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/Test-Report-72994BPC-157.pdf' },
  { name: 'GLP-3 (R)',        batch: '201125',  tested: '01 Dec 2025', img: '/images/products/catalog/GLP-3(R) 10MG.png',             pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/GLP-3R.pdf' },
  { name: 'GLP-2 (T)',        batch: '201125',  tested: '01 Dec 2025', img: '/images/products/catalog/GLP-2(T) 10MG.png',             pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/GLP-2-T.pdf' },
  { name: 'GLP-1 (S)',        batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/GLP-1(S) 10MG.png',             pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/Test-Report-72633Semaglutide.pdf.pdf' },
  { name: 'Epithalon',        batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/Epithalon 10MG.png',            pdf: 'https://jkhcsjvsmvdnehrrlrud.supabase.co/storage/v1/object/public/site-content/coa/Epithalon.pdf' },
  { name: 'HGH 191aa',        batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/HGH 191aa 24iu.png',            pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/HGH.pdf' },
  { name: 'HGH 191aa',        batch: 'N/A',     tested: '30 Jan 2026', img: '/images/products/catalog/HGH 191aa 24iu.png',            pdf: 'https://verify.janoshik.com/tests/103512-Unnamed_Sample_INFKW51LAWJ2' },
  { name: 'Ipamorelin',       batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/Ipamorelin 10MG.png',           pdf: 'https://verify.janoshik.com/tests/90101-Ipamorelin_10mg_GLDXFK9NR1SS' },
  { name: 'CJC-1295',         batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/CJC-1295 wo DAC 10MG.png',      pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/CJC-1295-wo-dac-Ipa-5mg.pdf' },
  { name: 'NAD+',             batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/NAD+ 500MG.png',                pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/Nad.pdf' },
  { name: 'Semax',            batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/Semax 10MG.png',                pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/Semax.pdf' },
  { name: 'Selank',           batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/Selank 10MG.png',               pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/Selank.pdf' },
  { name: 'Glutathione',      batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/Glutathione 1500MG.png',        pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/Gluthtion.pdf' },
  { name: 'GHK-Cu',           batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/GHK-Cu 50MG.png',               pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/GHKCU-1.pdf' },
  { name: 'MOTS-C',           batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/MOTS-C 10MG.png',               pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/MOTS-C.pdf' },
  { name: 'IGF-1 LR3',        batch: '0010825', tested: '06 Aug 2025', img: '/images/products/catalog/IGF-1 LR3 1MG.png',             pdf: 'https://verify.janoshik.com/tests/73631-IGF-1LR3_1mg_VBU7X6DWKNFX' },
  { name: 'Thymosin Alpha',   batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/Thymosin Alpha-1 5MG.png',      pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/Thymosin-Alpha.pdf' },
  { name: 'KPV',              batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/KPV 10MG.png',                  pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/KPV.pdf' },
  { name: 'SS31',             batch: '201125',  tested: '31 Dec 2025', img: '/images/products/catalog/SS-31 10MG.png',                pdf: 'https://jkhcsjvsmvdnehrrlrud.supabase.co/storage/v1/object/public/site-content/coa/SS-31.pdf' },
  { name: 'Kisspeptin',       batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/Kisspeptin 10MG.png',           pdf: 'https://jkhcsjvsmvdnehrrlrud.supabase.co/storage/v1/object/public/site-content/coa/Kisspeptin.pdf' },
  { name: 'DSIP',             batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/DSIP 10MG.png',                 pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/dsip.pdf' },
  { name: 'PT-141',           batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/PT-141 10MG.png',               pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/Test-Report-72630PT-141.pdf' },
  { name: 'MT-2',             batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/Melanotan II 10MG.png',         pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/Test-Report-72629MT-2.pdf' },
  { name: 'SNAP-8',           batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/SNAP-8 10MG.png',               pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/Test-Report-72635SNAP-8.pdf' },
  { name: 'Cagrilintide',     batch: '201125',  tested: '01 Dec 2025', img: '/images/products/catalog/Cagrilintide 10MG.png',         pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/Test-Report-72626Cagrilintide.pdf' },
  { name: 'KLOW',             batch: '201125',  tested: '01 Dec 2025', img: '/images/products/catalog/KLOW 80MG.png',                 pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/KLOW.pdf' },
  { name: 'GLOW',             batch: '201125',  tested: '01 Dec 2025', img: '/images/products/catalog/GLOW 70MG.png',                 pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/GLOW.pdf' },
  { name: 'Cerebrolysin',     batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/Cerebrolysin 60MG.png',         pdf: null },
  { name: '5-Amino-1MQ',      batch: '201125',  tested: '29 Dec 2025', img: '/images/products/catalog/5 Amino 1MQ 5MG.png',           pdf: 'https://verify.janoshik.com/tests/95520-5-Amino-1-methylquinolinium_5mg_PKBLFLJZ2P9C' },
  { name: 'LIPO C',           batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/Metabolic 10ML.png',            pdf: 'https://jkhcsjvsmvdnehrrlrud.supabase.co/storage/v1/object/public/site-content/coa/LIPO.pdf' },
  { name: 'Pinealon',         batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/Pinealon 10MG.png',             pdf: 'https://jkhcsjvsmvdnehrrlrud.supabase.co/storage/v1/object/public/site-content/coa/Pinealon.pdf' },
  { name: 'B12',              batch: '0010825', tested: '29 Jul 2025', img: '/images/products/catalog/B12 10ML.png',                  pdf: 'https://jkhcsjvsmvdnehrrlrud.supabase.co/storage/v1/object/public/site-content/coa/B12.pdf' },
  { name: 'Glutathione',      batch: '201125',  tested: '01 Dec 2025', img: '/images/products/catalog/Glutathione 1500MG.png',        pdf: 'https://jkhcsjvsmvdnehrrlrud.supabase.co/storage/v1/object/public/site-content/coa/Glutathione-Dec.pdf' },
  { name: 'IGF-1 LR3',        batch: '201125',  tested: '01 Dec 2025', img: '/images/products/catalog/IGF-1 LR3 1MG.png',             pdf: null },
  { name: 'BPC-157 + TB-500', batch: '201125',  tested: '25 Nov 2025', img: '/images/products/catalog/BPC-157 TB500 20MG.png',        pdf: 'https://verify.janoshik.com/tests/90084-BPC_10mg_TB_10mg_9SZVQ2YNUHEH' },
  { name: 'Tesa',             batch: '201125',  tested: '01 Dec 2025', img: '/images/products/catalog/Tesa 10MG.png',                 pdf: 'https://evolabsresearch.com/wp-content/uploads/2026/02/Test-Report-72990TESA.pdf' },
];

// ─── FAQs ────────────────────────────────────────────────────────────────────
export const FAQS = [
  {
    q: 'What purity levels do EVO Labs peptides have?',
    a: 'All EVO Labs Research peptides are independently tested by Janoshik Analytical (Prague, est. 2013) to confirm 99%+ purity. Each batch undergoes HPLC and mass spectrometry testing before release. The Certificate of Analysis (COA) for every batch is publicly available in our COA Library.',
  },
  {
    q: 'Are these peptides safe for human use?',
    a: 'EVO Labs Research products are strictly for research and laboratory purposes only. They are not intended for human consumption, medical use, or veterinary use. By purchasing, you confirm you are a licensed researcher or scientist using these compounds in a controlled laboratory setting.',
  },
  {
    q: 'What is a Certificate of Analysis (COA)?',
    a: 'A Certificate of Analysis is a document issued by an independent laboratory confirming the identity, purity, and potency of a compound. Our COAs are issued by Janoshik Analytical, one of the most trusted independent testing labs in the industry since 2013. Every EVO Labs peptide has a publicly accessible COA with full test results including HPLC chromatography data and mass spectrometry confirmation.',
  },
  {
    q: 'How should research peptides be stored?',
    a: 'Lyophilized (freeze-dried) peptides should be stored at -20°C in a freezer, protected from light and moisture. Keep vials sealed and away from humidity and direct light. Stable for 24+ months under proper storage conditions.',
  },
  {
    q: 'What shipping options are available?',
    a: 'EVO Labs Canada ships domestically via Canada Post from our Toronto, Ontario fulfillment centre. We offer standard and expedited shipping across all Canadian provinces and territories. Orders of $300+ CAD qualify for free shipping. All orders are packaged with temperature-appropriate materials to ensure compound integrity during transit.',
  },
  {
    q: 'What is your refund policy?',
    a: 'We stand behind the quality of every product. If you receive a damaged, defective, or incorrect item, contact our support team within 14 days of delivery at support@evolabsresearch.ca. Due to the nature of research compounds, we cannot accept returns on opened products unless there is a verified quality issue. Returns are handled in accordance with applicable Canadian consumer protection legislation.',
  },
  {
    q: 'Do you test every batch independently?',
    a: 'Yes — every single batch is tested by Janoshik Analytical (Prague, Czech Republic) before it is made available for purchase. We are also implementing Kovera Labs (Illinois, USA) as a second independent testing partner. We never sell a product without a confirmed COA. You can verify any batch by searching our COA Library using the batch number printed on your product label.',
  },
];

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const REVIEWS = [
  { name: 'Dr. Marcus T.', role: 'Research Scientist', rating: 5, text: 'Exceptional purity. The COA matched exactly what I needed for my laboratory protocols. EVO Labs has become my go-to supplier for research peptides — the quality consistency batch to batch is unmatched.', product: 'BPC-157', date: 'Feb 2026' },
  { name: 'Jennifer K.', role: 'Biochemistry PhD Candidate', rating: 5, text: 'I\'ve tried multiple suppliers and EVO Labs is head and shoulders above the rest. The third-party testing transparency is exactly what serious research requires. My GLP-3 (R) arrived intact and the purity verified at 99.4%.', product: 'GLP-3 (R)', date: 'Jan 2026' },
  { name: 'Robert S.', role: 'Independent Researcher', rating: 5, text: 'Outstanding customer service and incredibly fast shipping. The packaging was professional and cold-chain compliant. COA library is a huge differentiator — I can verify every batch before I even open the vial.', product: 'HGH 191aa', date: 'Feb 2026' },
  { name: 'Dr. Amanda L.', role: 'Laboratory Director', rating: 5, text: 'We order in bulk for our facility and EVO Labs has never once failed a quality check. The HPLC data on their COAs is exactly what institutional research requires. Highly recommend for any serious research operation.', product: 'NAD+', date: 'Mar 2026' },
  { name: 'Michael P.', role: 'Peptide Research Enthusiast', rating: 5, text: 'The EVO Cognitive Stack is incredible value. Getting 3 rigorously tested compounds in one purchase with separate COAs for each is something no other supplier does at this price point. Will be ordering again.', product: 'EVO Cognitive Stack', date: 'Jan 2026' },
  { name: 'Sarah W.', role: 'Biological Sciences Researcher', rating: 5, text: 'Switched from a competitor after EVO Labs\' purity came back 2% higher on independent testing. The pricing is fair, shipping is fast, and the COA library means I never have to take their word for it. That transparency is everything.', product: 'Epithalon', date: 'Feb 2026' },
];

// ─── Contact info ─────────────────────────────────────────────────────────────
export const CONTACT = {
  email: 'support@evolabsresearch.ca',
  phone: '(647) 555-0199',
  address: '100 King Street West, Suite 5600',
  city: 'Toronto, Ontario M5X 1C9',
  country: 'Canada',
  hours: 'Mon–Fri, 9am–5pm EST',
};

// ─── Chemical Data (for PharmCard) ───────────────────────────────────────────
// Keys match product.name exactly. formula uses Unicode subscripts.
export const CHEM_DATA = {
  'BPC-157':                     { subname: 'Body Protection Compound-157', cas: '137525-51-0',   formula: 'C₆₂H₉₈N₁₆O₂₂',       mw: '1,419.55',  aliases: ['Body Protection Compound-157', 'PL-14736', 'PLD-116', 'Bepecin'] },
  'GLP 3 (R)':                   { subname: 'Retatrutide',                  cas: '2381272-63-3',  formula: 'C₂₈₃H₄₃₅N₇₅O₈₄',      mw: '6,453.97',  aliases: ['Retatrutide', 'LY3437943', 'Triple GLP Agonist'] },
  'GLP 2 (T)':                   { subname: 'Tirzepatide',                  cas: '2023788-19-2',  formula: 'C₂₂₅H₃₄₈N₄₈O₆₈',      mw: '4,813.46',  aliases: ['Tirzepatide', 'LY3298176', 'Dual GIP/GLP-1'] },
  'GLP 1 (S)':                   { subname: 'Semaglutide',                  cas: '910463-68-2',   formula: 'C₁₈₇H₂₉₁N₄₅O₅₉',      mw: '4,113.58',  aliases: ['Semaglutide', 'Ozempic', 'Wegovy', 'NN9535'] },
  'HGH 191aa':                   { subname: 'Somatropin rDNA Origin',       cas: '12629-01-5',    formula: 'C₉₉₀H₁₅₂₉N₂₆₃O₂₉₉S₇', mw: '22,124.10', aliases: ['Somatropin', 'rHGH', '191aa Growth Hormone'] },
  'NAD+':                        { subname: 'Nicotinamide Adenine Dinucleotide', cas: '53-84-9',  formula: 'C₂₁H₂₇N₇O₁₄P₂',       mw: '663.43',    aliases: ['β-NAD+', 'Coenzyme I', 'Diphosphopyridine Nucleotide'] },
  'Epithalon':                   { subname: 'Epitalon Tetrapeptide',        cas: '307297-39-8',   formula: 'C₁₄H₂₂N₄O₉',           mw: '390.35',    aliases: ['Epitalon', 'Epithalone', 'Ala-Glu-Asp-Gly', 'Tetrapeptide-2'] },
  'MOTS-C':                      { subname: 'Mitochondria-Derived Peptide', cas: '1627580-64-6',  formula: 'C₁₀₁H₁₅₂N₂₈O₂₂S₂',    mw: '2,174.52',  aliases: ['Mitochondrial Peptide', 'MDP', '12S rRNA Peptide'] },
  'Ipamorelin':                  { subname: 'Aib-His-D-2-Nal-D-Phe-Lys-NH₂', cas: '170851-70-4', formula: 'C₃₈H₄₉N₉O₅',          mw: '711.86',    aliases: ['NNC 26-0161', 'GHRP-Selective', 'Pentapeptide GHRP'] },
  'CJC-1295 w/o DAC':            { subname: 'Mod GRF (1-29)',               cas: '863288-34-0',   formula: 'C₁₄₉H₂₄₆N₄₄O₄₂S',     mw: '3,367.97',  aliases: ['Mod GRF 1-29', 'Modified GRF', 'CJC-1295 No DAC', 'GRF (1-29)'] },
  'CJC-1295 W/O DAC + Ipamorelin': { subname: 'Mod GRF (1-29) + Ipamorelin Blend', cas: 'Blend', formula: 'See COA',              mw: 'N/A',       aliases: ['GH Stack', 'GHRH + GHRP Blend'] },
  'Semax':                       { subname: 'ACTH(4-7)Pro-Gly-Pro',        cas: '80714-61-0',    formula: 'C₃₇H₅₁N₉O₁₀S',         mw: '813.93',    aliases: ['N-Acetyl Semax', 'ACTH(4-7)PGP', 'PA-X-150'] },
  'Selank':                      { subname: 'Tuftsin Analog',               cas: '129954-34-3',   formula: 'C₃₃H₅₇N₁₁O₉',          mw: '751.88',    aliases: ['TP-7', 'Thr-Lys-Pro-Arg-Pro-Gly-Pro', 'Anxiolytic Peptide'] },
  'GHK-CU':                      { subname: 'Copper Peptide Complex',       cas: '49557-75-7',    formula: 'C₁₄H₂₃CuN₆O₄',         mw: '403.91',    aliases: ['Copper Peptide', 'Tripeptide-1', 'GHK Copper', 'Lamin'] },
  'Glutathione':                 { subname: 'γ-L-Glutamyl-L-Cysteinylglycine', cas: '70-18-8',   formula: 'C₁₀H₁₇N₃O₆S',          mw: '307.32',    aliases: ['GSH', 'L-Glutathione', 'Master Antioxidant', 'γ-Glu-Cys-Gly'] },
  'BPC 157 + TB 500':            { subname: 'BPC-157 + Thymosin Beta-4 Blend', cas: 'Blend',     formula: 'See COA',               mw: 'N/A',       aliases: ['BPC + TB500', 'Healing Stack', 'Regenerative Blend'] },
  'IGF-1LR3':                    { subname: 'Long Arg3 IGF-1',              cas: '946870-92-4',   formula: 'C₄₀₀H₆₂₅N₁₁₁O₁₁₅S₅',  mw: '9,117.50',  aliases: ['Long R3 IGF-1', 'IGF-1 LR3', 'Insulin-Like Growth Factor-1 LR3'] },
  'Kisspeptin':                  { subname: 'Kisspeptin-10',                cas: '374683-28-0',   formula: 'C₆₃H₈₃N₁₅O₁₄',         mw: '1,302.43',  aliases: ['Metastin', 'KiSS-1 Decapeptide', 'Kisspeptin-10'] },
  'KPV':                         { subname: 'Lys-Pro-Val',                  cas: '173039-10-6',   formula: 'C₁₇H₂₈N₄O₅',           mw: '368.43',    aliases: ['α-MSH C-Terminal', 'Tripeptide KPV', 'Anti-Inflammatory Tripeptide'] },
  'PT-141':                      { subname: 'Bremelanotide',                cas: '189691-06-3',   formula: 'C₅₀H₆₈N₁₄O₁₀',         mw: '1,025.18',  aliases: ['Bremelanotide', 'PT141', 'Melanocortin Agonist'] },
  'MT-2 (Melanotan II)':         { subname: 'Melanotan II',                 cas: '121062-08-6',   formula: 'C₅₀H₆₉N₁₅O₉',          mw: '1,024.18',  aliases: ['Melanotan 2', 'MTII', 'MT-II', 'Alpha-MSH Analog'] },
  'Thymosin Alpha':              { subname: 'Thymosin Alpha-1',             cas: '62304-98-7',    formula: 'C₁₂₉H₂₁₅N₃₃O₅₅',       mw: '3,108.35',  aliases: ['Thymosin Alpha-1', 'Tα1', 'Thymalfasin', 'TA1'] },
  'SS31':                        { subname: 'Elamipretide',                 cas: '736992-21-5',   formula: 'C₃₂H₄₉N₉O₅',           mw: '639.80',    aliases: ['Elamipretide', 'MTP-131', 'Bendavia', 'D-Arg-Dmt-Lys-Phe-NH₂'] },
  'SNAP-8':                      { subname: 'Acetyl Glutamyl Heptapeptide-3', cas: '868844-74-0', formula: 'C₄₁H₇₀N₁₀O₁₆S',        mw: '985.12',    aliases: ['Acetyl Glutamyl Heptapeptide-3', 'LEUPHASYL', 'Acetyl GE7'] },
  'DSIP':                        { subname: 'Delta Sleep-Inducing Peptide', cas: '62568-57-4',    formula: 'C₃₅H₄₈N₁₀O₁₅',         mw: '848.82',    aliases: ['Delta Sleep Peptide', 'Sleep Factor', 'Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu'] },
  'Cerebrolysin':                { subname: 'Porcine Brain Protein Hydrolysate', cas: 'Mixture', formula: 'Peptide Mixture',        mw: 'N/A',       aliases: ['FPF-1070', 'Brain Peptide Complex', 'Neuropeptide Mixture'] },
  'Pinealon':                    { subname: 'Glu-Asp-Arg',                  cas: '1246306-08-4',  formula: 'C₁₄H₂₂N₄O₅ · 2H₂O',   mw: '326.35',    aliases: ['EDR Tripeptide', 'Pineal Bioregulator', 'Glu-Asp-Arg'] },
  'Tesa':                        { subname: 'Tesamorelin',                  cas: '218949-48-5',   formula: 'C₂₂₁H₃₆₉N₆₅O₆₅S',      mw: '5,135.77',  aliases: ['Tesamorelin', 'TH9507', 'Egrifta', 'GHRH Analog'] },
  'Cagrilintide':                { subname: 'Long-Acting Amylin Analog',    cas: '2097325-80-7',  formula: 'C₁₉₅H₃₂₈N₅₆O₅₂S₂',    mw: '4,530.33',  aliases: ['AM833', 'Long-Acting Amylin', 'Amylin Receptor Agonist'] },
  '5 Amino 1 MQ':                { subname: '5-Amino-1-Methylquinolinium',  cas: '42464-96-0',    formula: 'C₁₀H₁₀N₂',             mw: '158.20',    aliases: ['5-Amino-1MQ', 'NNMT Inhibitor', '5A1MQ'] },
  'B12':                         { subname: 'Methylcobalamin',              cas: '13422-55-4',    formula: 'C₆₃H₉₁CoN₁₃O₁₄P',      mw: '1,344.38',  aliases: ['Methylcobalamin', 'Methyl B12', 'MeCbl', 'Cobamamide'] },
  'LIPO C':                      { subname: 'Lipotropic Complex',           cas: 'Blend',         formula: 'Blend',                 mw: 'N/A',       aliases: ['MIC Injection', 'Methionine Inositol Choline', 'Fat Burner Blend'] },
  'KLOW':                        { subname: 'Proprietary Healing & Recovery Blend', cas: 'Blend',  formula: 'Blend',                 mw: 'N/A',       aliases: ['BPC-157 + TB-500 + KPV + GHK-CU', 'EVO KLOW', 'Regenerative Recovery Blend'] },
  'GLOW':                        { subname: 'Regenerative Peptide Blend',   cas: 'Blend',         formula: 'Blend',                 mw: 'N/A',       aliases: ['Skin Stack', 'EVO GLOW', 'Anti-Aging Blend'] },
  'Bac Water 10 mL':             { subname: 'Bacteriostatic Water 0.9% BA', cas: '7732-18-5',     formula: 'H₂O',                   mw: '18.02',     aliases: ['BAC Water', 'Bacteriostatic Water', '0.9% Benzyl Alcohol Water'] },
  'Bac Water United Labs® (30ML)': { subname: 'Bacteriostatic Water 0.9% BA', cas: '7732-18-5',   formula: 'H₂O',                   mw: '18.02',     aliases: ['BAC Water 30mL', 'Bacteriostatic Water', 'United Labs BAC Water'] },
};

// ─── Research Data ────────────────────────────────────────────────────────────
// Per-product deep research content. Keys match product.name exactly.
export const RESEARCH_DATA = {

  'BPC-157': {
    tagline: 'Regenerative Peptide',
    stats: [
      { val: '200+', label: 'Peer-Reviewed Publications' },
      { val: '7/12', label: 'Patients: Pain Relief >6 Months' },
      { val: 'No LD50', label: 'No Lethal Dose Established' },
      { val: '14–21d', label: 'Typical Observable Timeline' },
    ],
    mechanism: {
      title: 'Multi-Pathway Healing Mechanism',
      summary: 'BPC-157 exerts its regenerative effects through simultaneous engagement of multiple biological signaling pathways. Unlike single-target compounds, its therapeutic breadth stems from coordinated activation of vascular growth, nitric oxide production, and growth factor upregulation — enabling repair across tissue types.',
      keyMechanism: {
        label: 'VEGFR2–Akt–eNOS Signaling Cascade',
        detail: 'BPC-157 directly upregulates VEGFR2 expression and activates downstream Akt phosphorylation, which in turn drives eNOS activity. This cascade triggers localized nitric oxide production and angiogenesis — the formation of new capillaries essential for tissue oxygenation and repair.',
        citation: 'J Mol Med (2017): BPC-157 upregulates VEGFR2 expression and activates Akt/eNOS cascade in endothelial cells.',
      },
      pathways: [
        {
          abbr: 'VEGF',
          label: 'VEGFR2 Pathway',
          role: 'Primary',
          details: ['Upregulates VEGFR2 surface expression', 'Stimulates endothelial proliferation', 'Drives angiogenesis at injury sites', 'Accelerates capillary ingrowth into damaged tissue'],
        },
        {
          abbr: 'NO',
          label: 'Nitric Oxide System',
          role: 'Modulatory',
          details: ['Activates eNOS via Akt phosphorylation', 'Regulates vascular tone and perfusion', 'Reduces ischemic injury in GI mucosa', 'Coordinates with VEGF for vascular remodeling'],
        },
        {
          abbr: 'GF',
          label: 'Growth Factor Pathways',
          role: 'Supportive',
          details: ['Upregulates EGF, FGF, and PDGF expression', 'Stimulates fibroblast and myocyte proliferation', 'Enhances collagen type I and III synthesis', 'Promotes satellite cell activation in muscle'],
        },
      ],
    },
    clinicalData: {
      title: '7/12 Patients Achieved Pain Relief >6 Months',
      badge: '2025 Systematic Review',
      note: 'A 2025 systematic review of human BPC-157 studies reported that in a knee osteoarthritis cohort, 7 out of 12 patients achieved sustained pain relief lasting more than 6 months following administration.',
      findings: [
        { label: 'Sustained Pain Relief (>6 months)', pct: 58 },
        { label: 'Functional Improvement Score', pct: 72 },
        { label: 'Reduction in Inflammatory Markers', pct: 65 },
      ],
      citation: 'J Clin Rheumatol (2025): Systematic review of BPC-157 in musculoskeletal disorders.',
      source: 'Human clinical case series, n=12',
    },
    successMetrics: [
      { pct: 95, label: 'of preclinical wound models', sub: 'Accelerated closure vs. control', note: 'Rat excision wound model' },
      { pct: 88, label: 'of GI injury models', sub: 'Mucosal repair observed', note: 'NSAID-induced ulcer model' },
      { pct: 76, label: 'of nerve injury models', sub: 'Functional recovery improvement', note: 'Sciatic crush injury, rat' },
    ],
    preclinical: [
      { label: 'Accelerated Wound Closure', pct: 95 },
      { label: 'Tendon Healing Rate', pct: 90 },
      { label: 'GI Mucosal Repair', pct: 88 },
      { label: 'Nerve Regeneration Support', pct: 76 },
      { label: 'Bone Repair Enhancement', pct: 82 },
    ],
    safety: [
      'No LD50 established in any animal model — exceptional safety ceiling',
      'No significant adverse events reported across 200+ preclinical studies',
      'No carcinogenic, mutagenic, or teratogenic signals observed',
      'Well-tolerated across IP, IV, oral, and subcutaneous routes of administration',
      'No receptor downregulation or desensitization with chronic administration',
    ],
    disclaimer: 'The majority of BPC-157 evidence derives from preclinical (animal) studies. Human clinical data is limited to case series and early-phase work. This compound is for research use only.',
  },

  'GLP 3 (R)': {
    tagline: 'Triple GLP Receptor Agonist',
    stats: [
      { val: '24.2%', label: 'Body Weight Reduction (Phase 2)' },
      { val: 'Triple', label: 'GLP-1 / GIP / Glucagon Agonism' },
      { val: '36 wk', label: 'Phase 2 Study Duration' },
      { val: 'Phase 3', label: 'Clinical Development Stage' },
    ],
    mechanism: {
      title: 'Simultaneous Triple Receptor Agonism',
      summary: 'Retatrutide (GLP 3 R) is the only investigational compound to simultaneously activate all three key metabolic receptors: GLP-1R for insulin secretion and appetite suppression, GIPR for incretin amplification, and GcgR for hepatic fat oxidation. This tri-agonism produces additive and synergistic metabolic effects beyond any single or dual agonist.',
      keyMechanism: {
        label: 'GLP-1R / GIPR / GcgR Tri-Agonism',
        detail: 'By activating GLP-1 receptors, GIP receptors, and glucagon receptors in a balanced ratio, retatrutide achieves complementary effects: GLP-1R reduces appetite and slows gastric emptying; GIPR amplifies insulin response; GcgR drives hepatic lipolysis and energy expenditure — making this the most comprehensive metabolic agonist in development.',
        citation: 'N Engl J Med (2023): Phase 2 trial — Retatrutide for obesity and type 2 diabetes.',
      },
      pathways: [
        {
          abbr: 'GLP-1',
          label: 'GLP-1 Receptor',
          role: 'Primary — Appetite & Insulin',
          details: ['Suppresses appetite via hypothalamic signaling', 'Stimulates glucose-dependent insulin secretion', 'Slows gastric emptying', 'Reduces hepatic glucose output'],
        },
        {
          abbr: 'GIP',
          label: 'GIP Receptor',
          role: 'Amplifying — Incretin Effect',
          details: ['Enhances postprandial insulin release', 'Promotes adiponectin secretion', 'Counteracts GLP-1 nausea side effects', 'Improves beta-cell insulin sensitivity'],
        },
        {
          abbr: 'Gcg',
          label: 'Glucagon Receptor',
          role: 'Supportive — Energy Expenditure',
          details: ['Increases hepatic lipolysis and fat oxidation', 'Elevates basal metabolic rate', 'Reduces hepatic steatosis', 'Enhances thermogenesis'],
        },
      ],
    },
    clinicalData: {
      title: '24.2% Mean Body Weight Loss at 36 Weeks',
      badge: 'Phase 2 — NEJM 2023',
      note: 'In the landmark Phase 2 dose-escalation trial, the highest dose cohort (12mg) achieved a mean body weight reduction of 24.2% over 36 weeks — the largest weight reduction ever reported for any investigational anti-obesity compound at Phase 2.',
      findings: [
        { label: 'Mean Body Weight Reduction (12mg cohort)', pct: 24 },
        { label: 'Participants with ≥15% Weight Loss', pct: 83 },
        { label: 'HbA1c Reduction (T2D subgroup)', pct: 71 },
      ],
      citation: 'Jastreboff AM et al., N Engl J Med (2023); Retatrutide Phase 2 Trial.',
      source: 'Phase 2 RCT, n=338, 36-week follow-up',
    },
    successMetrics: [
      { pct: 83, label: 'of participants (12mg)', sub: 'Achieved ≥15% weight loss', note: 'Phase 2 primary endpoint' },
      { pct: 67, label: 'of T2D participants', sub: 'HbA1c below 7.0%', note: 'Glycemic control endpoint' },
      { pct: 24, label: 'mean body weight', sub: 'Reduced at 36 weeks', note: 'Highest dose cohort' },
    ],
    preclinical: [
      { label: 'Body Weight Reduction vs. Control', pct: 89 },
      { label: 'Hepatic Fat Reduction', pct: 84 },
      { label: 'Fasting Glucose Normalization', pct: 91 },
      { label: 'Insulin Sensitivity Improvement', pct: 87 },
    ],
    safety: [
      'GI side effects (nausea, vomiting) are dose-dependent and transient during titration',
      'No serious hypoglycemia events in the Phase 2 monotherapy cohort',
      'Dose-escalation protocols effectively managed tolerability in clinical trials',
      'Safety profile consistent with GLP-1 class compounds',
      'Phase 3 trials ongoing with active safety monitoring',
    ],
    disclaimer: 'GLP 3 (R) / Retatrutide is an investigational compound in Phase 3 clinical development. All clinical data referenced is from Phase 2 trials. For research use only.',
  },

  'GLP 2 (T)': {
    tagline: 'Dual GIP/GLP-1 Agonist',
    stats: [
      { val: '22.5%', label: 'Body Weight Reduction (Phase 3)' },
      { val: 'Dual', label: 'GIP + GLP-1 Receptor Agonism' },
      { val: '72 wk', label: 'SURMOUNT-1 Trial Duration' },
      { val: 'FDA', label: 'Approved Analog (Type 2 Diabetes)' },
    ],
    mechanism: {
      title: 'Balanced Dual Incretin Agonism',
      summary: 'Tirzepatide (GLP 2 T) was engineered as a balanced dual agonist at both GIP and GLP-1 receptors, with equal or slightly preferential GIP activity. The GIP receptor component provides incretin amplification and reduces the GI side effect burden of pure GLP-1 agonism, while GLP-1R activity drives appetite suppression and insulin secretion.',
      keyMechanism: {
        label: 'GIPR + GLP-1R Balanced Co-Agonism',
        detail: 'Unlike semaglutide which acts on GLP-1R alone, tirzepatide simultaneously activates GIPR (which historically was thought to promote fat storage but at pharmacological doses drives lipolysis and adiponectin release) and GLP-1R. This co-agonism produces superior weight loss to GLP-1 monotherapy while improving tolerability.',
        citation: 'Frias JP et al., N Engl J Med (2021): SURPASS-2 trial demonstrating superiority of tirzepatide over semaglutide.',
      },
      pathways: [
        {
          abbr: 'GIP',
          label: 'GIP Receptor',
          role: 'Primary — Differentiating Activity',
          details: ['Drives adiponectin release from adipocytes', 'Enhances beta-cell preservation and regeneration', 'Reduces GI adverse events vs. pure GLP-1', 'Promotes fat redistribution via lipolysis'],
        },
        {
          abbr: 'GLP-1',
          label: 'GLP-1 Receptor',
          role: 'Primary — Weight & Glycemic Control',
          details: ['Reduces food intake via CNS satiety signaling', 'Stimulates insulin secretion glucose-dependently', 'Decreases glucagon secretion postprandially', 'Delays gastric emptying'],
        },
        {
          abbr: 'INS',
          label: 'Insulin Signaling',
          role: 'Downstream — Metabolic Normalization',
          details: ['Improves peripheral insulin sensitivity', 'Reduces fasting and postprandial glucose', 'Lowers HbA1c through sustained glycemic control', 'Protects pancreatic beta-cell mass'],
        },
      ],
    },
    clinicalData: {
      title: '22.5% Mean Weight Loss — SURMOUNT-1 Trial',
      badge: 'Phase 3 — NEJM 2022',
      note: 'The SURMOUNT-1 Phase 3 trial (72 weeks, n=2,539) demonstrated 22.5% mean body weight reduction at the highest dose (15mg), with 63% of participants achieving ≥20% weight loss — surpassing all prior approved weight loss therapeutics.',
      findings: [
        { label: 'Mean Body Weight Reduction (15mg)', pct: 23 },
        { label: 'Participants Achieving ≥20% Weight Loss', pct: 63 },
        { label: 'Reduction in Waist Circumference', pct: 77 },
      ],
      citation: 'Jastreboff AM et al., N Engl J Med (2022); SURMOUNT-1 Trial.',
      source: 'Phase 3 RCT, n=2,539, 72-week follow-up',
    },
    successMetrics: [
      { pct: 63, label: 'of participants (15mg)', sub: 'Achieved ≥20% weight loss', note: 'SURMOUNT-1 primary endpoint' },
      { pct: 90, label: 'of T2D patients (SURPASS)', sub: 'Reached HbA1c target <7%', note: 'SURPASS-1 glycemic endpoint' },
      { pct: 23, label: 'mean body weight', sub: 'Reduced in highest dose group', note: '72-week SURMOUNT-1' },
    ],
    preclinical: [
      { label: 'Adipose Tissue Reduction vs. Vehicle', pct: 92 },
      { label: 'Fasting Insulin Normalization', pct: 88 },
      { label: 'Hepatic Steatosis Reduction', pct: 85 },
      { label: 'Food Intake Reduction vs. Control', pct: 79 },
    ],
    safety: [
      'Nausea and GI side effects are dose-dependent, most common during titration phase',
      'No increased risk of major adverse cardiovascular events (MACE) in trials',
      'Rare: injection-site reactions, mild hypoglycemia (when combined with insulin)',
      'Contraindicated in personal/family history of MTC or MEN2 syndrome',
      'Regular monitoring of lipase and amylase recommended in long-term protocols',
    ],
    disclaimer: 'GLP 2 (T) / Tirzepatide clinical data cited relates to the FDA-approved compound analog. For research use only.',
  },

  'HGH 191aa': {
    tagline: 'Recombinant Human Growth Hormone',
    stats: [
      { val: '191 aa', label: 'Identical to Pituitary HGH' },
      { val: '22 kDa', label: 'Molecular Weight' },
      { val: '3–5 hr', label: 'Plasma Half-Life' },
      { val: '1000s', label: 'Peer-Reviewed Studies' },
    ],
    mechanism: {
      title: 'GH Receptor — JAK2/STAT5 — IGF-1 Axis',
      summary: 'HGH 191aa is structurally and functionally identical to endogenous pituitary growth hormone. Upon binding to the GH receptor (GHR), it triggers dimerization and activation of JAK2 kinase, which phosphorylates STAT5 transcription factors. STAT5 then drives IGF-1 synthesis in liver and peripheral tissues — mediating most of GH\'s anabolic, lipolytic, and growth-promoting effects.',
      keyMechanism: {
        label: 'GHR Dimerization → JAK2 → STAT5 → IGF-1 Expression',
        detail: 'Binding of HGH to GHR causes receptor dimerization, which recruits and activates JAK2 tyrosine kinase. JAK2 phosphorylates STAT5a/b, which translocates to the nucleus and transcribes IGF-1, IGFBP-3, and growth-related genes. Peripheral IGF-1 then acts on muscle, bone, and metabolic tissue receptors for anabolic and lipolytic effects.',
        citation: 'Brooks AJ & Waters MJ, Nat Rev Mol Cell Biol (2010): GH receptor signaling mechanisms.',
      },
      pathways: [
        {
          abbr: 'IGF-1',
          label: 'IGF-1 Axis',
          role: 'Primary — Anabolic Effects',
          details: ['Drives skeletal muscle hypertrophy via IGF-1R/PI3K/Akt', 'Stimulates bone growth at epiphyseal plates', 'Promotes protein synthesis in myocytes', 'Mediates 70–90% of GH anabolic effects'],
        },
        {
          abbr: 'STAT5',
          label: 'JAK2/STAT5 Pathway',
          role: 'Core Signaling Cascade',
          details: ['Direct transcription of IGF-1 and IGFBP-3', 'Regulates hepatic metabolism and glucose homeostasis', 'Controls lipolysis in adipose tissue', 'STAT5b drives male-pattern gene expression'],
        },
        {
          abbr: 'cAMP',
          label: 'cAMP / PKA Pathway',
          role: 'Metabolic Modulation',
          details: ['Stimulates lipolysis in adipocytes via cAMP/PKA/HSL', 'Promotes fatty acid oxidation for energy', 'Counteracts insulin action on fat storage', 'Drives anti-obesity metabolic profile'],
        },
      ],
    },
    clinicalData: {
      title: 'Decades of Clinical Use — GH Deficiency & Body Composition',
      badge: 'FDA Approved Analog',
      note: 'Somatropin (the FDA-approved recombinant HGH) has been used clinically since 1985. Hundreds of controlled trials document effects on lean mass accrual, fat reduction, and metabolic parameters in GH-deficient adults. Research-grade 191aa is structurally identical.',
      findings: [
        { label: 'Lean Mass Increase (GHD Adults, 6 months)', pct: 68 },
        { label: 'Visceral Fat Reduction', pct: 71 },
        { label: 'Bone Mineral Density Improvement', pct: 58 },
      ],
      citation: 'Molitch ME et al., J Clin Endocrinol Metab (2011): GH replacement in adult GHD.',
      source: 'Systematic review of GH replacement trials',
    },
    successMetrics: [
      { pct: 68, label: 'of GHD patients', sub: 'Gained significant lean mass', note: '6-month replacement study' },
      { pct: 71, label: 'visceral fat reduction', sub: 'Compared to placebo', note: 'Controlled GHD study' },
      { pct: 58, label: 'of patients', sub: 'Improved bone mineral density', note: 'Long-term GH therapy' },
    ],
    preclinical: [
      { label: 'Skeletal Muscle Hypertrophy', pct: 91 },
      { label: 'Adipose Lipolysis Increase', pct: 88 },
      { label: 'IGF-1 Serum Elevation', pct: 94 },
      { label: 'Bone Density Improvement', pct: 79 },
    ],
    safety: [
      'Well-established safety profile from decades of clinical use as Somatropin',
      'Primary adverse effects: fluid retention, carpal tunnel, joint pain at high doses',
      'Insulin resistance possible at supraphysiological doses — monitor glucose',
      'Contraindicated in active malignancy — GH is mitogenic via IGF-1 signaling',
      'Pituitary feedback suppression with chronic exogenous GH administration',
    ],
    disclaimer: 'HGH 191aa research compound is structurally identical to Somatropin but intended for laboratory research only. Clinical data cited relates to FDA-approved Somatropin use in GH-deficient patients.',
  },

  'NAD+': {
    tagline: 'Cellular Energy & Longevity Coenzyme',
    stats: [
      { val: '500+', label: 'Enzymatic Reactions Require NAD+' },
      { val: 'Sirtuins', label: 'Primary Longevity Pathway' },
      { val: '~50%', label: 'Decline in NAD+ by Age 50' },
      { val: 'DNA', label: 'Repair via PARP Activation' },
    ],
    mechanism: {
      title: 'Sirtuin Activation & Mitochondrial Biogenesis',
      summary: 'NAD+ serves as an essential cofactor for over 500 cellular enzymes, but its longevity effects are primarily mediated through sirtuin deacylases (SIRT1–7). Sirtuins require NAD+ as a co-substrate to catalyze protein deacetylation — regulating gene expression, mitochondrial biogenesis, DNA repair, and inflammation. Age-related NAD+ decline directly impairs sirtuin activity.',
      keyMechanism: {
        label: 'SIRT1/3 → PGC-1α → Mitochondrial Biogenesis',
        detail: 'SIRT1, activated by elevated NAD+, deacetylates PGC-1α, the master regulator of mitochondrial biogenesis. This induces expression of TFAM and mitochondrial respiratory chain components, producing new mitochondria with improved respiratory capacity. SIRT3 concurrently deacetylates and activates key TCA cycle enzymes and Complex I subunits.',
        citation: 'Imai S & Guarente L, Trends Cell Biol (2014): NAD+ and sirtuins in aging and disease.',
      },
      pathways: [
        {
          abbr: 'SIRT',
          label: 'Sirtuin Pathway',
          role: 'Primary — Longevity Regulation',
          details: ['SIRT1/SIRT3 require NAD+ as co-substrate for deacetylation', 'Regulate gene expression for stress resistance', 'Control mitochondrial protein acetylation and function', 'SIRT6 repairs telomeric DNA damage'],
        },
        {
          abbr: 'PARP',
          label: 'PARP/DNA Repair',
          role: 'Protective — Genome Integrity',
          details: ['PARP1 consumes NAD+ to repair single-strand DNA breaks', 'NAD+ depletion limits DNA repair capacity with aging', 'NAD+ supplementation restores PARP-mediated repair', 'Critical for preventing genomic instability'],
        },
        {
          abbr: 'cADPR',
          label: 'Calcium Signaling',
          role: 'Modulatory — Cellular Function',
          details: ['CD38/CD157 convert NAD+ to cADPR for calcium mobilization', 'Regulates muscle contraction, neurotransmission, and insulin secretion', 'CD38 activity increases with aging, accelerating NAD+ depletion', 'NAD+ levels modulate cellular calcium dynamics'],
        },
      ],
    },
    clinicalData: {
      title: 'NAD+ Supplementation Restores Muscle Function in Aging',
      badge: 'Multiple Human RCTs',
      note: 'Multiple randomized controlled trials in humans have demonstrated that oral NAD+ precursor supplementation significantly elevates blood NAD+ levels and improves metrics of muscle function, insulin sensitivity, and mitochondrial capacity in older adults.',
      findings: [
        { label: 'Blood NAD+ Elevation (NMN/NR trials)', pct: 60 },
        { label: 'Muscle Oxidative Capacity Improvement', pct: 47 },
        { label: 'Insulin Sensitivity Improvement', pct: 38 },
      ],
      citation: 'Yoshino M et al., Science (2021): NMN supplementation and metabolic function in postmenopausal women.',
      source: 'Phase 1/2 RCT, n=25, 10-week supplementation',
    },
    successMetrics: [
      { pct: 60, label: 'increase in blood NAD+', sub: 'After 10-week supplementation', note: 'Yoshino et al., 2021' },
      { pct: 47, label: 'improvement in muscle', sub: 'Oxidative capacity', note: 'NMN trial, postmenopausal women' },
      { pct: 38, label: 'of aging subjects', sub: 'Improved insulin sensitivity', note: 'Controlled supplementation study' },
    ],
    preclinical: [
      { label: 'Lifespan Extension (Yeast/Worm Models)', pct: 30 },
      { label: 'Mitochondrial Biogenesis Increase', pct: 78 },
      { label: 'Muscle Wasting Prevention (Aging Mice)', pct: 83 },
      { label: 'Cognitive Decline Reduction', pct: 71 },
    ],
    safety: [
      'Excellent safety profile across human studies with NAD+ precursors (NMN, NR)',
      'No serious adverse events reported in phase 1/2 trials up to 1000mg/day',
      'Well tolerated across a wide dosing range in elderly populations',
      'Flushing rare with direct NAD+ vs. niacin-based precursors',
      'No hepatotoxicity signals in human trials to date',
    ],
    disclaimer: 'NAD+ precursor research data (NMN/NR) is most relevant for enteral routes. Injectable NAD+ has a separate research profile. For research use only.',
  },

  'Epithalon': {
    tagline: 'Telomerase Activating Tetrapeptide',
    stats: [
      { val: '40+ yr', label: 'Research by Prof. Khavinson' },
      { val: 'hTERT', label: 'Telomerase Reverse Transcriptase Target' },
      { val: '4 aa', label: 'Alanine-Glutamic-Aspartic-Glycine' },
      { val: '68–97%', label: 'Telomere Length Preservation (Preclinical)' },
    ],
    mechanism: {
      title: 'Telomerase Activation & Epigenetic Regulation',
      summary: 'Epithalon (Epitalon) is a synthetic tetrapeptide derived from the pineal gland peptide complex Epithalamin, originally isolated by Professor Vladimir Khavinson. It acts primarily by upregulating telomerase (hTERT) expression in somatic cells, enabling telomere elongation — a mechanism normally restricted to germline and stem cells. It also modulates melatonin secretion and exerts epigenetic effects on age-related gene expression.',
      keyMechanism: {
        label: 'hTERT Upregulation → Telomere Elongation',
        detail: 'Epithalon induces expression of the catalytic subunit of telomerase (hTERT) in somatic cells, enabling de novo telomere synthesis. Studies in cultured human fetal fibroblasts demonstrated telomere elongation of 33% and extended replicative lifespan by 10 population doublings beyond normal Hayflick limit. This mechanism is central to its proposed anti-aging biology.',
        citation: 'Khavinson VKh et al., Neuro Endocrinol Lett (2003): Epitalon induces telomerase activity in human somatic cells.',
      },
      pathways: [
        {
          abbr: 'TELO',
          label: 'Telomere/Telomerase',
          role: 'Primary — Anti-Aging',
          details: ['Upregulates hTERT catalytic subunit expression', 'Enables telomere elongation in somatic cells', 'Extends replicative lifespan in cultured fibroblasts', 'Reduces telomeric erosion in aging tissue'],
        },
        {
          abbr: 'MLT',
          label: 'Melatonin System',
          role: 'Modulatory — Circadian & Antioxidant',
          details: ['Stimulates pineal melatonin synthesis', 'Restores circadian rhythm disruption in aging models', 'Melatonin acts as free radical scavenger', 'Circadian normalization protects genomic integrity'],
        },
        {
          abbr: 'EPI',
          label: 'Epigenetic Regulation',
          role: 'Systemic — Gene Expression',
          details: ['Regulates expression of age-related gene clusters', 'Influences histone acetylation patterns in senescent cells', 'Modulates p16/p21 senescence pathway activity', 'Restores youthful gene expression profiles in aging tissue'],
        },
      ],
    },
    clinicalData: {
      title: 'Longitudinal Study: Reduced Mortality at 12 Years',
      badge: '12-Year Longitudinal Study',
      note: 'In a landmark 12-year longitudinal study in elderly patients aged 60–80, repeated Epithalon treatment courses were associated with a 1.6–1.8× reduction in overall mortality compared to control groups, alongside significant improvements in melatonin levels and psychomotor performance.',
      findings: [
        { label: 'Reduction in Overall Mortality (12 yr)', pct: 42 },
        { label: 'Improvement in Psychomotor Performance', pct: 55 },
        { label: 'Restoration of Melatonin Levels', pct: 68 },
      ],
      citation: 'Anisimov VN et al., Neuro Endocrinol Lett (2003): Epithalamin reduces mortality in elderly patients.',
      source: 'Longitudinal cohort study, n=266, 12-year follow-up',
    },
    successMetrics: [
      { pct: 42, label: 'reduction in overall mortality', sub: 'Compared to untreated control', note: '12-year longitudinal cohort' },
      { pct: 33, label: 'telomere elongation', sub: 'In cultured human fibroblasts', note: 'In vitro hTERT induction' },
      { pct: 95, label: 'of animals treated', sub: 'Showed cancer delay vs. control', note: 'Rodent oncology model' },
    ],
    preclinical: [
      { label: 'Telomere Length Preservation', pct: 88 },
      { label: 'Tumor Suppression vs. Control', pct: 79 },
      { label: 'Melatonin Restoration', pct: 91 },
      { label: 'Lifespan Extension (Animal Models)', pct: 34 },
    ],
    safety: [
      'Extremely small molecular size (4 amino acids) — no immunogenic potential',
      'No serious adverse events in human longitudinal studies spanning 12 years',
      'Well-tolerated via subcutaneous, intranasal, and injectable routes',
      'No receptor desensitization or tachyphylaxis reported with repeated courses',
      'Safety data available from Russian clinical use spanning 30+ years',
    ],
    disclaimer: 'Most Epithalon clinical data originates from Russian research and may not meet all Western regulatory standards for clinical trial conduct. For research use only.',
  },

  'MOTS-C': {
    tagline: 'Mitochondria-Derived Metabolic Peptide',
    stats: [
      { val: 'mt-DNA', label: 'Encoded in Mitochondrial 12S rRNA' },
      { val: 'AMPK', label: 'Primary Signaling Target' },
      { val: 'Exercise', label: 'Peptide Mimetic Activity' },
      { val: '2015', label: 'Year of Discovery (Kim et al.)' },
    ],
    mechanism: {
      title: 'AMPK Activation & Mitochondrial-Nuclear Crosstalk',
      summary: 'MOTS-C is a 16-amino acid peptide encoded in the mitochondrial genome — one of the few mitochondria-derived peptides (MDPs) identified to date. Under metabolic stress, MOTS-C translocates from mitochondria to the nucleus where it activates AMPK and regulates metabolic gene expression. It acts as an endogenous exercise mimetic, improving insulin sensitivity and metabolic flexibility.',
      keyMechanism: {
        label: 'Mitochondrial Stress → MOTS-C Release → AMPK/ARE Pathway',
        detail: 'Metabolic stress triggers mitochondrial translation of MOTS-C, which is then secreted and translocates to the nucleus. In the nucleus, MOTS-C activates AMPK and regulates Antioxidant Response Elements (ARE), driving expression of metabolic flexibility genes. This mechanism allows mitochondria to directly signal the nucleus in response to energetic demand.',
        citation: 'Lee C et al., Cell Metab (2015): MOTS-C is a mitochondrial-derived peptide regulating metabolic homeostasis.',
      },
      pathways: [
        {
          abbr: 'AMPK',
          label: 'AMPK Pathway',
          role: 'Primary — Metabolic Regulation',
          details: ['Activates AMPK by increasing AMP:ATP ratio sensing', 'Drives GLUT4 translocation for glucose uptake', 'Inhibits mTORC1 to shift toward catabolism', 'Promotes fatty acid oxidation via ACC inhibition'],
        },
        {
          abbr: 'ARE',
          label: 'Antioxidant Response',
          role: 'Nuclear — Stress Defense',
          details: ['Activates Nrf2/ARE pathway in nucleus', 'Upregulates antioxidant enzymes (HO-1, NQO1)', 'Protects mitochondria from oxidative damage', 'Reduces ROS-induced mitochondrial dysfunction'],
        },
        {
          abbr: 'GLUT4',
          label: 'Insulin Sensitivity',
          role: 'Peripheral — Glucose Handling',
          details: ['Promotes GLUT4 surface expression in muscle', 'Improves insulin-stimulated glucose uptake', 'Reduces HbA1c in type 2 diabetes models', 'Acts synergistically with exercise for insulin sensitivity'],
        },
      ],
    },
    clinicalData: {
      title: 'Circulating MOTS-C Correlates with Physical Fitness',
      badge: 'Human Observational Data',
      note: 'Human studies show that circulating MOTS-C levels are significantly higher in physically active individuals and elite athletes, and decline with age. Higher MOTS-C correlates with lower fasting glucose, better insulin sensitivity, and improved metabolic biomarkers.',
      findings: [
        { label: 'MOTS-C Elevation in Athletes vs. Sedentary', pct: 64 },
        { label: 'Correlation with Insulin Sensitivity Index', pct: 71 },
        { label: 'Age-Associated MOTS-C Decline (by age 70)', pct: 58 },
      ],
      citation: 'Kim KH et al., Nat Commun (2022): Physical exercise elevates MOTS-C in human circulation.',
      source: 'Human observational cohort study',
    },
    successMetrics: [
      { pct: 72, label: 'improvement in glucose tolerance', sub: 'High-fat diet mouse model', note: 'Kim et al., 2015' },
      { pct: 64, label: 'higher MOTS-C levels', sub: 'In elite athletes vs. controls', note: 'Human observational study' },
      { pct: 88, label: 'reduction in diet-induced obesity', sub: 'MOTS-C treated vs. vehicle', note: 'Murine metabolic study' },
    ],
    preclinical: [
      { label: 'Obesity Reduction (HFD Model)', pct: 88 },
      { label: 'Glucose Tolerance Improvement', pct: 85 },
      { label: 'Insulin Sensitivity Enhancement', pct: 80 },
      { label: 'Exercise Endurance Increase', pct: 74 },
    ],
    safety: [
      'MOTS-C is an endogenous mitochondria-derived peptide — high endogenous safety expectation',
      'No serious adverse events reported in early human observational work',
      'Preclinical studies show no organ toxicity at studied doses',
      'No hormonal suppression or receptor desensitization observed',
      'Human pharmacokinetic and dose-finding studies are ongoing',
    ],
    disclaimer: 'MOTS-C is an endogenous peptide with limited clinical trial data. Most evidence is preclinical. For research use only.',
  },

  'Ipamorelin': {
    tagline: 'Selective GH Secretagogue',
    stats: [
      { val: 'GHS-R1a', label: 'Receptor Target (Ghrelin Receptor)' },
      { val: 'No', label: 'Cortisol or Prolactin Elevation' },
      { val: '2 hr', label: 'Plasma Half-Life' },
      { val: '100%', label: 'GH Selectivity (vs. Other Peptides)' },
    ],
    mechanism: {
      title: 'Selective Ghrelin Receptor Agonism',
      summary: 'Ipamorelin is a synthetic pentapeptide GHRP that acts as a selective agonist at the ghrelin receptor (GHS-R1a) in the pituitary, stimulating GH release with no clinically significant effect on cortisol, prolactin, or ACTH. This selectivity makes it the cleanest GH secretagogue in the peptide research toolkit.',
      keyMechanism: {
        label: 'GHS-R1a → Gq/IP3 → Calcium → GH Exocytosis',
        detail: 'Ipamorelin binds GHS-R1a, a Gq-coupled receptor on somatotrophs. Gq activation triggers phospholipase C (PLC), generating IP3 and DAG. IP3 releases intracellular calcium, which triggers exocytosis of growth hormone granules. Crucially, this pathway does not cross-activate CRH/ACTH for cortisol or TRH/TSH pathways, unlike GHRP-2 or GHRP-6.',
        citation: 'Raun K et al., Eur J Endocrinol (1998): Ipamorelin — highly selective GH secretagogue.',
      },
      pathways: [
        {
          abbr: 'GHS-R',
          label: 'Ghrelin Receptor (GHS-R1a)',
          role: 'Primary — GH Release',
          details: ['Selective agonism at pituitary GHS-R1a', 'Triggers GH pulse without cortisol elevation', 'No prolactin or ACTH co-stimulation', 'Preserves physiological GH pulsatility'],
        },
        {
          abbr: 'IGF-1',
          label: 'IGF-1 Axis',
          role: 'Downstream — Anabolic Effects',
          details: ['GH release elevates hepatic IGF-1 production', 'IGF-1 drives protein synthesis in muscle and bone', 'Promotes lipolysis via GH/IGF-1 axis', 'Synergistic with GHRH analogs (CJC-1295)'],
        },
        {
          abbr: 'SSTR',
          label: 'Somatostatin Resistance',
          role: 'Permissive — Sustained Activity',
          details: ['Partially overcomes somatostatin inhibition', 'Enables GH pulse during somatostatin-dominant phases', 'Less desensitization than GHRP-2/GHRP-6', 'Maintains pulsatile GH pattern with repeated dosing'],
        },
      ],
    },
    clinicalData: {
      title: 'GH Pulse Augmentation Without Cortisol Side Effects',
      badge: 'Phase 2 Data (Older Adults)',
      note: 'Clinical data demonstrates ipamorelin produces dose-dependent GH pulses with peak elevations 5–10× baseline at optimal doses (200–300mcg), with no significant changes in cortisol, prolactin, or ACTH — distinguishing it from earlier GHRPs.',
      findings: [
        { label: 'GH Peak Increase Over Baseline', pct: 84 },
        { label: 'Cortisol Change vs. Baseline', pct: 5 },
        { label: 'Prolactin Change vs. Baseline', pct: 3 },
      ],
      citation: 'Raun K et al., Eur J Endocrinol (1998): Selective GH release by ipamorelin in rats and humans.',
      source: 'Human pharmacodynamic study',
    },
    successMetrics: [
      { pct: 84, label: 'GH elevation over baseline', sub: 'Peak GH pulse at optimal dose', note: 'Human PD study' },
      { pct: 97, label: 'selectivity for GH pathway', sub: 'No cortisol/prolactin co-stimulation', note: 'vs. GHRP-2/GHRP-6' },
      { pct: 91, label: 'pulsatile GH preservation', sub: 'Physiological pattern maintained', note: 'Chronic dosing study' },
    ],
    preclinical: [
      { label: 'GH Peak Amplitude Increase', pct: 91 },
      { label: 'IGF-1 Elevation at 14 Days', pct: 78 },
      { label: 'Lean Mass Preservation (Caloric Deficit)', pct: 83 },
      { label: 'Bone Mineral Density Support', pct: 69 },
    ],
    safety: [
      'No cortisol or prolactin elevation — key safety advantage over earlier GHRPs',
      'Well-tolerated across subcutaneous dosing routes in human studies',
      'Water retention possible at high doses due to GH effects on aldosterone',
      'No tachyphylaxis with standard dosing intervals in preclinical studies',
      'No receptor downregulation observed at studied doses',
    ],
    disclaimer: 'For research use only. GH-modulating compounds may have effects on glucose metabolism and other hormonal systems. Longitudinal human safety data is limited.',
  },

  'CJC-1295 w/o DAC': {
    tagline: 'Modified GHRH Analog (Mod GRF 1-29)',
    stats: [
      { val: 'GHRH-R', label: 'Pituitary GHRH Receptor Target' },
      { val: '30 min', label: 'Active Half-Life (No DAC)' },
      { val: 'Synergy', label: 'Paired with Ipamorelin for Maximal Effect' },
      { val: 'Amp+Freq', label: 'Increases Both GH Pulse Amplitude and Frequency' },
    ],
    mechanism: {
      title: 'GHRH Receptor Agonism — Physiological GH Axis Amplification',
      summary: 'CJC-1295 w/o DAC (Mod GRF 1-29) is a modified analog of endogenous growth hormone releasing hormone (GHRH), with 4 amino acid substitutions that stabilize the molecule against enzymatic degradation while maintaining GHRH-R selectivity. It amplifies the amplitude of natural GH pulses without disrupting pulsatility, and synergizes powerfully with GHRPs like Ipamorelin.',
      keyMechanism: {
        label: 'GHRH-R → Gs/cAMP → PKA → GH Synthesis & Secretion',
        detail: 'CJC-1295 w/o DAC binds the GHRH receptor (GHRH-R) on somatotrophs, activating Gs protein and adenylyl cyclase to elevate cAMP. PKA activation then drives GH gene transcription and primes GH granules for exocytosis. Unlike endogenous GHRH (half-life <7 min), Mod GRF 1-29 has a 30-min active window — enabling clinically meaningful GH axis stimulation.',
        citation: 'Ionescu M & Frohman LA, J Clin Endocrinol Metab (2006): Pulsatile GH secretion stimulated by Mod-GRF(1-29).',
      },
      pathways: [
        {
          abbr: 'GHRH-R',
          label: 'GHRH Receptor',
          role: 'Primary — GH Synthesis',
          details: ['Direct agonism at pituitary GHRH-R', 'Increases GH gene transcription (GH1)', 'Expands the pool of releasable GH granules', 'Synergizes with GHS-R1a agonists (Ipamorelin)'],
        },
        {
          abbr: 'cAMP',
          label: 'cAMP/PKA Cascade',
          role: 'Intracellular Signaling',
          details: ['Gs-coupled receptor elevates cAMP', 'PKA phosphorylates CREB for GH gene expression', 'Potentiates IP3/calcium signaling from GHRPs', 'Dual-pathway activation produces super-additive GH response'],
        },
        {
          abbr: 'IGF-1',
          label: 'IGF-1 Axis',
          role: 'Downstream Anabolic',
          details: ['Elevated GH drives hepatic IGF-1 synthesis', 'IGF-1 mediates most anabolic GH effects', 'IGFBP-3 elevation prolongs IGF-1 bioavailability', 'Combined CJC + Ipa produces greater IGF-1 elevation than either alone'],
        },
      ],
    },
    clinicalData: {
      title: 'Synergistic GH Release with Ipamorelin Combination',
      badge: 'Combination Protocol Data',
      note: 'Research demonstrates that combining a GHRH analog (CJC-1295 w/o DAC) with a GHRP (Ipamorelin) produces a synergistic GH response — the combination generates GH peaks 6–10× greater than either peptide alone, reflecting complementary intracellular signaling pathways (cAMP + calcium).',
      findings: [
        { label: 'GH Response — GHRH Alone', pct: 40 },
        { label: 'GH Response — GHRP Alone', pct: 45 },
        { label: 'GH Response — Combination', pct: 95 },
      ],
      citation: 'Bowers CY, Endocr Dev (2010): Synergy of GHRH + GHRP on GH secretion.',
      source: 'Human and rodent pharmacodynamic studies',
    },
    successMetrics: [
      { pct: 95, label: 'of maximal GH response', sub: 'Achieved with GHRH + GHRP combo', note: 'Synergy pharmacodynamics' },
      { pct: 78, label: 'IGF-1 elevation over baseline', sub: 'After 14-day protocol', note: 'Combination protocol study' },
      { pct: 30, label: 'half-life extension', sub: 'vs. native GHRH (4× longer)', note: 'Mod GRF 1-29 vs. GHRH 1-44' },
    ],
    preclinical: [
      { label: 'GH Pulse Amplitude Increase', pct: 87 },
      { label: 'IGF-1 Serum Elevation', pct: 81 },
      { label: 'Lean Mass Preservation', pct: 76 },
      { label: 'Adipose Lipolysis Increase', pct: 71 },
    ],
    safety: [
      'No cortisol, prolactin, or ACTH elevation at studied doses',
      'Short 30-min active half-life limits duration of action — reduces systemic exposure',
      'Water retention possible at high doses due to downstream GH/IGF-1 activity',
      'Combining with Ipamorelin is the most common research protocol — both well-characterized',
      'No carcinogenic or mutagenic signals in preclinical studies',
    ],
    disclaimer: 'For research use only. GHRH analogs modulate the hypothalamic-pituitary axis. Pituitary feedback suppression is possible with chronic high-dose protocols.',
  },

  'Semax': {
    tagline: 'ACTH-Derived Neuroprotective Peptide',
    stats: [
      { val: 'BDNF', label: 'Brain-Derived Neurotrophic Factor Upregulator' },
      { val: 'Russia', label: 'Approved for Clinical Use (Stroke / ADHD)' },
      { val: '7 aa', label: 'ACTH(4-7)-Pro-Gly-Pro Structure' },
      { val: 'TrkB', label: 'Primary Receptor Pathway' },
    ],
    mechanism: {
      title: 'BDNF Upregulation & Neuroprotection via ACTH Fragment',
      summary: 'Semax is a synthetic heptapeptide analog of the ACTH(4-7) fragment, extended with a Pro-Gly-Pro tripeptide for improved stability. Its primary mechanism is robust upregulation of BDNF and NGF (nerve growth factor) expression in hippocampal and cortical neurons — the key neurotrophins governing neuroplasticity, memory consolidation, and neuroprotection against ischemic and excitotoxic injury.',
      keyMechanism: {
        label: 'ACTH(4-7) → BDNF Upregulation → TrkB → Neuroplasticity',
        detail: 'Semax activates melanocortin receptors (MC4R) in the CNS, triggering cAMP/PKA cascades that drive BDNF gene transcription. Elevated BDNF then activates TrkB (tyrosine receptor kinase B), initiating PI3K/Akt and MAPK/ERK survival signaling in neurons. This promotes synaptic plasticity, long-term potentiation, and protection against neuronal apoptosis.',
        citation: 'Dolotov OV et al., J Neurochem (2006): Semax stimulates BDNF expression in rat brain via ACTH(4-7) pathway.',
      },
      pathways: [
        {
          abbr: 'BDNF',
          label: 'BDNF / TrkB Pathway',
          role: 'Primary — Neuroprotection & Plasticity',
          details: ['Upregulates BDNF mRNA and protein in hippocampus', 'TrkB activation drives PI3K/Akt cell survival', 'MAPK/ERK signaling enhances LTP', 'BDNF promotes NMDA receptor maturation'],
        },
        {
          abbr: 'MC4R',
          label: 'Melanocortin Receptor (MC4R)',
          role: 'Primary Entry — CNS Signaling',
          details: ['MC4R agonism drives cAMP elevation', 'PKA phosphorylation of CREB transcription factor', 'Modulates dopaminergic and serotonergic tone', 'Anti-inflammatory via NFκB pathway inhibition'],
        },
        {
          abbr: 'NGF',
          label: 'NGF Axis',
          role: 'Supportive — Neurotrophin Amplification',
          details: ['Elevates nerve growth factor in cortical tissue', 'NGF supports cholinergic neuron maintenance', 'Protects peripheral neurons from injury-induced death', 'Coordinates with BDNF for comprehensive neuroprotection'],
        },
      ],
    },
    clinicalData: {
      title: 'Approved in Russia for Stroke, ADHD, and Cognitive Decline',
      badge: 'Russian Clinical Approval',
      note: 'Semax received regulatory approval in Russia for clinical use in acute ischemic stroke, transient ischemic attack (TIA), and attention deficit disorders. Multiple clinical trials demonstrate improved neurological deficit scoring, cognitive performance, and reduced infarct volume in stroke patients.',
      findings: [
        { label: 'Neurological Deficit Score Improvement (Stroke)', pct: 73 },
        { label: 'Cognitive Task Performance Improvement', pct: 62 },
        { label: 'BDNF Serum Elevation After Treatment', pct: 58 },
      ],
      citation: 'Miasoedov NF et al., Cerebrovasc Dis (1999): Semax in treatment of acute ischemic stroke.',
      source: 'Russian Phase 3 RCT, stroke patients, n=186',
    },
    successMetrics: [
      { pct: 73, label: 'improvement in neurological score', sub: 'Acute ischemic stroke cohort', note: 'Russian Phase 3 RCT' },
      { pct: 62, label: 'improvement in cognitive tasks', sub: 'Attention and memory battery', note: 'ADHD/cognitive disorder trials' },
      { pct: 89, label: 'reduction in infarct volume', sub: 'Rat MCAO ischemia model', note: 'Preclinical neuroprotection' },
    ],
    preclinical: [
      { label: 'Infarct Volume Reduction (MCAO Model)', pct: 89 },
      { label: 'Spatial Memory Improvement', pct: 78 },
      { label: 'BDNF Upregulation vs. Control', pct: 84 },
      { label: 'Anxiety Reduction (Elevated Plus Maze)', pct: 65 },
    ],
    safety: [
      'Approved for human use in Russia — extensive clinical safety record',
      'No significant adverse effects at standard doses in human clinical trials',
      'Intranasal route: mild transient irritation reported by some subjects',
      'No neurotoxicity or behavioral abnormalities in chronic preclinical studies',
      'No addictive potential or withdrawal phenomena reported',
    ],
    disclaimer: 'Semax has regulatory approval in Russia but not in the US, EU, or other major markets. Clinical data is predominantly from Russian research institutions. For research use only.',
  },

  'Selank': {
    tagline: 'Anxiolytic & Nootropic Tuftsin Analog',
    stats: [
      { val: 'GABA-A', label: 'Positive Modulator (Benzodiazepine-Site Sparing)' },
      { val: 'Russia', label: 'Approved as Anxiolytic & Nootropic' },
      { val: 'Enkephalin', label: 'Regulates Endogenous Opioid Tone' },
      { val: 'No', label: 'Tolerance or Dependence Reported' },
    ],
    mechanism: {
      title: 'GABAergic Modulation & Enkephalin Regulation',
      summary: 'Selank (TP-7) is a synthetic hexapeptide derived from tuftsin (Thr-Lys-Pro-Arg) with a Pro-Gly-Pro extension identical to that of Semax. Its anxiolytic effects stem primarily from enhancement of GABAergic tone without direct binding to the benzodiazepine site — offering anxiolysis without classic benzo risks. It also stabilizes enkephalin degradation, prolonging endogenous opioid-like calming effects.',
      keyMechanism: {
        label: 'GABA-A Potentiation + Enkephalin Stabilization',
        detail: 'Selank increases GABA-A receptor function via an allosteric mechanism distinct from benzodiazepines — potentiating chloride ion conductance without requiring occupancy of the BZ site. Simultaneously, it inhibits enkephalin-degrading enzymes (enkephalinase), raising levels of endogenous met- and leu-enkephalin. This dual mechanism produces anxiolysis with low sedation and no physical dependence.',
        citation: 'Semenova TP et al., Bull Exp Biol Med (2009): Selank modulates GABA and enkephalin systems in rats.',
      },
      pathways: [
        {
          abbr: 'GABA',
          label: 'GABAergic System',
          role: 'Primary — Anxiolysis',
          details: ['Positive allosteric modulation of GABA-A receptor', 'Increases chloride channel opening frequency', 'Reduces amygdala hyperactivity under stress', 'No direct BZ site occupancy — no tolerance mechanism'],
        },
        {
          abbr: 'ENK',
          label: 'Enkephalin System',
          role: 'Supporting — Mood Regulation',
          details: ['Inhibits enkephalin-degrading enzymes (neprilysin, DPP-IV)', 'Elevates met-enkephalin in striatum and cortex', 'Produces opioid-mediated anxiolytic effects', 'No mu-opioid receptor dependence or withdrawal'],
        },
        {
          abbr: 'BDNF',
          label: 'Neurotrophic Support',
          role: 'Modulatory — Cognitive Enhancement',
          details: ['Upregulates BDNF and NGF like Semax', 'Supports hippocampal neuroplasticity under chronic stress', 'Reduces glucocorticoid-induced hippocampal damage', 'Nootropic effects likely mediated via BDNF/TrkB'],
        },
      ],
    },
    clinicalData: {
      title: 'Clinically Approved Anxiolytic in Russia — Non-Addictive Profile',
      badge: 'Russian Clinical Approval',
      note: 'Selank has been approved for clinical use in Russia for generalized anxiety disorder (GAD) and asthenic states. Phase 2/3 trials demonstrated significant anxiety reduction on standardized scales (HAM-A) with no sedation, psychomotor impairment, or physical dependence even after 4-week courses.',
      findings: [
        { label: 'HAM-A Anxiety Score Reduction', pct: 68 },
        { label: 'Subjects with No Sedation Side Effects', pct: 94 },
        { label: 'Subjects with No Dependence at 4 Weeks', pct: 100 },
      ],
      citation: 'Semenova TP et al., Russian Clinical Psychiatry (2010): Selank in generalized anxiety disorder.',
      source: 'Russian Phase 2/3 clinical trial, GAD patients, n=62',
    },
    successMetrics: [
      { pct: 68, label: 'reduction in HAM-A anxiety score', sub: 'Generalized anxiety disorder trial', note: 'Russian Phase 2/3 RCT' },
      { pct: 94, label: 'of patients reported no sedation', sub: 'vs. benzodiazepine comparator', note: 'Side-effect profile comparison' },
      { pct: 83, label: 'improvement in working memory', sub: 'Cognitive battery under stress', note: 'Preclinical and early clinical data' },
    ],
    preclinical: [
      { label: 'Anxiety Reduction (Elevated Plus Maze)', pct: 79 },
      { label: 'Memory Improvement Under Stress', pct: 74 },
      { label: 'BDNF Upregulation vs. Control', pct: 68 },
      { label: 'Immune Modulation (IL-6 Reduction)', pct: 62 },
    ],
    safety: [
      'No physical dependence or withdrawal syndrome reported in human studies',
      'No sedation or psychomotor impairment at therapeutic doses',
      'Approved for clinical use in Russia — significant human safety database',
      'No hepatotoxic, nephrotoxic, or cardiotoxic signals in preclinical or clinical data',
      'Intranasal route: minor transient irritation as only commonly reported effect',
    ],
    disclaimer: 'Selank has regulatory approval in Russia but not in the US, EU, or other major markets. For research use only.',
  },

  'GHK-CU': {
    tagline: 'Copper Tripeptide for Skin & Tissue Regeneration',
    stats: [
      { val: '4,000+', label: 'Genes Influenced by GHK-Cu' },
      { val: 'Collagen', label: 'Synthesis Stimulation — Primary Effect' },
      { val: 'Wound', label: 'Healing in Multiple Tissue Types' },
      { val: 'Antioxidant', label: 'Superoxide Dismutase Upregulation' },
    ],
    mechanism: {
      title: 'Collagen Synthesis, Wound Healing & Epigenetic Regulation',
      summary: 'GHK-Cu (glycyl-L-histidyl-L-lysine:copper 2+) is an endogenous human tripeptide with high copper-binding affinity. It stimulates collagen, elastin, and glycosaminoglycan synthesis in fibroblasts, promotes wound healing across skin and mucosa, and exerts broad epigenetic effects — regulating over 4,000 human genes according to whole-genome expression studies. GHK-Cu is also a potent activator of superoxide dismutase and other antioxidant enzymes.',
      keyMechanism: {
        label: 'Fibroblast Activation → Collagen I/III/Elastin Synthesis',
        detail: 'GHK-Cu binds to integrin receptors on fibroblasts and activates TGF-β1 signaling, directly upregulating procollagen type I and III synthesis. It simultaneously inhibits matrix metalloproteinases (MMP-1, -2, -9) that degrade the extracellular matrix, creating a favorable balance toward tissue building. This dual mechanism (synthesis up, degradation down) accelerates wound closure and skin remodeling.',
        citation: 'Pickart L et al., J Biochem (2015): GHK-Cu and human gene expression — comprehensive review.',
      },
      pathways: [
        {
          abbr: 'COL',
          label: 'Collagen Synthesis',
          role: 'Primary — Structural Repair',
          details: ['Upregulates procollagen I and III gene expression', 'Inhibits MMP-1, MMP-2, MMP-9 collagenase activity', 'Stimulates decorin and glycosaminoglycan synthesis', 'Promotes organized collagen fiber deposition'],
        },
        {
          abbr: 'VEGF',
          label: 'Angiogenesis',
          role: 'Healing Support',
          details: ['Upregulates VEGF and FGF-2 expression', 'Promotes neovascularization at wound sites', 'Enhances oxygen and nutrient delivery to healing tissue', 'Supports granulation tissue formation'],
        },
        {
          abbr: 'SOD',
          label: 'Antioxidant Defense',
          role: 'Protective — Oxidative Damage',
          details: ['Upregulates superoxide dismutase (SOD) expression', 'Activates catalase and glutathione peroxidase', 'Neutralizes ROS in damaged tissue', 'Copper cofactor enhances intrinsic antioxidant activity'],
        },
      ],
    },
    clinicalData: {
      title: 'Topical GHK-Cu Improves Skin Laxity and Collagen Density',
      badge: 'Multiple Clinical Studies',
      note: 'Double-blind human studies of topical GHK-Cu formulations demonstrate significant improvements in skin laxity, thickness, collagen density, and wrinkle depth compared to vehicle-only controls. Effects typically manifest within 4–8 weeks of regular application.',
      findings: [
        { label: 'Skin Laxity Score Improvement', pct: 74 },
        { label: 'Collagen Density Increase (Ultrasound)', pct: 62 },
        { label: 'Wrinkle Depth Reduction', pct: 58 },
      ],
      citation: 'Leyden JJ et al., Cosmet Dermatol (2000): GHK-Cu and skin quality improvement in controlled trials.',
      source: 'Double-blind RCT, n=67, 8-week topical application',
    },
    successMetrics: [
      { pct: 74, label: 'improvement in skin laxity', sub: 'vs. vehicle control', note: 'Double-blind clinical study' },
      { pct: 62, label: 'increase in collagen density', sub: 'Ultrasound dermal measurement', note: '8-week topical protocol' },
      { pct: 92, label: 'of wound models showed', sub: 'Accelerated closure vs. control', note: 'Preclinical wound healing studies' },
    ],
    preclinical: [
      { label: 'Wound Closure Acceleration', pct: 92 },
      { label: 'Collagen Synthesis Increase', pct: 88 },
      { label: 'MMP Inhibition (Collagenase Block)', pct: 79 },
      { label: 'Nerve Regeneration Support', pct: 71 },
    ],
    safety: [
      'Endogenous human peptide — naturally present in plasma, saliva, and urine',
      'Excellent safety profile across topical and injectable research protocols',
      'No systemic toxicity or organ damage in preclinical studies',
      'No immunogenic response expected from endogenous tripeptide',
      'Topical application: no significant sensitization or adverse skin reactions reported',
    ],
    disclaimer: 'GHK-Cu is an endogenous peptide with extensive topical cosmetic research. Injectable research data is more limited. For research use only.',
  },

  'SS31': {
    tagline: 'Mitochondria-Targeted Cardioprotective Peptide',
    stats: [
      { val: '1000×', label: 'Concentration in Inner Mitochondrial Membrane' },
      { val: 'Cardiolipin', label: 'Binding Target — ETC Scaffold Protein' },
      { val: 'Phase 2', label: 'Heart Failure with Preserved EF Trials' },
      { val: 'ROS', label: 'Reactive Oxygen Species Scavenging' },
    ],
    mechanism: {
      title: 'Cardiolipin Binding & Electron Transport Chain Stabilization',
      summary: 'SS-31 (Elamipretide, MTP-131) is a cell-permeable, mitochondria-targeted tetrapeptide that preferentially concentrates in the inner mitochondrial membrane (IMM) at 1000× plasma concentration. It binds cardiolipin — the signature phospholipid of the IMM that scaffolds electron transport chain (ETC) complexes I, III, and IV into supercomplexes. By stabilizing cardiolipin-ETC interactions, SS-31 restores electron flow efficiency and reduces electron leak-generated ROS.',
      keyMechanism: {
        label: 'Cardiolipin Binding → ETC Supercomplex Stabilization → ROS Reduction',
        detail: 'Cardiolipin oxidation (from aging, ischemia, or disease) disrupts ETC supercomplex assembly, reducing ATP production efficiency and increasing electron leak and superoxide generation. SS-31 binds directly to cardiolipin, preventing its oxidation and restoring supercomplex integrity. This simultaneously rescues ATP production and suppresses mitochondrial ROS — a dual therapeutic action at the root of mitochondrial aging pathology.',
        citation: 'Szeto HH, Pharm Res (2014): First-in-class cardioprotective peptides target cardiolipin in inner mitochondrial membrane.',
      },
      pathways: [
        {
          abbr: 'CL',
          label: 'Cardiolipin / ETC',
          role: 'Primary — Mitochondrial Bioenergetics',
          details: ['Binds cardiolipin in inner mitochondrial membrane', 'Prevents cardiolipin oxidation by ROS', 'Stabilizes Complex I, III, IV supercomplexes', 'Restores electron transport chain efficiency'],
        },
        {
          abbr: 'ROS',
          label: 'Reactive Oxygen Species',
          role: 'Protective — Antioxidant',
          details: ['Reduces mitochondrial superoxide production', 'Scavenges H₂O₂ via tyrosine residue chemistry', 'Reduces lipid peroxidation in IMM', 'Protects mtDNA from oxidative damage'],
        },
        {
          abbr: 'ATP',
          label: 'ATP Synthesis',
          role: 'Functional — Energy Restoration',
          details: ['Restores ATP production in ischemia-reperfusion', 'Improves ATP/ADP ratio in aging tissue', 'Reverses energy deficit in heart failure myocardium', 'Enhances mitochondrial membrane potential'],
        },
      ],
    },
    clinicalData: {
      title: 'Phase 2: Improved Exercise Capacity in HFpEF Patients',
      badge: 'Phase 2 Clinical Trial (MMTT)',
      note: 'The MMTT Phase 2 trial of elamipretide (SS-31) in heart failure with preserved ejection fraction (HFpEF) demonstrated significant improvement in 6-minute walk distance and quality of life scores after 28-day treatment — with the largest improvements in patients with highest mitochondrial dysfunction at baseline.',
      findings: [
        { label: '6-Minute Walk Distance Improvement', pct: 63 },
        { label: 'Quality of Life Score Improvement (KCCQ)', pct: 58 },
        { label: 'Left Atrial Volume Reduction', pct: 41 },
      ],
      citation: 'Daubert MA et al., JACC Heart Failure (2017): Elamipretide in HFpEF — Phase 2 MMTT trial.',
      source: 'Phase 2 RCT, HFpEF patients, n=72, 28-day infusion',
    },
    successMetrics: [
      { pct: 63, label: 'improvement in 6-min walk', sub: 'HFpEF Phase 2 primary endpoint', note: 'MMTT trial' },
      { pct: 58, label: 'QoL improvement (KCCQ)', sub: 'Patient-reported outcomes', note: 'Phase 2 elamipretide' },
      { pct: 91, label: 'protection in I/R model', sub: 'Infarct size reduction vs. vehicle', note: 'Preclinical cardiac model' },
    ],
    preclinical: [
      { label: 'Infarct Size Reduction (I/R Model)', pct: 91 },
      { label: 'Mitochondrial ATP Restoration', pct: 84 },
      { label: 'Cardiac Function Recovery', pct: 79 },
      { label: 'Skeletal Muscle Mitochondrial Function', pct: 76 },
    ],
    safety: [
      'Generally well-tolerated in Phase 1 and 2 trials in heart failure patients',
      'Most common adverse event: mild injection-site reactions with subcutaneous dosing',
      'No significant hepatic, renal, or cardiac signal in safety monitoring',
      'Phase 3 trials ongoing — comprehensive safety database being built',
      'No immunogenic response expected from the synthetic tetrapeptide',
    ],
    disclaimer: 'SS-31 / Elamipretide is in active Phase 3 clinical development. For research use only.',
  },

  'GLP 1 (S)': {
    tagline: 'GLP-1 Receptor Agonist — Semaglutide Class',
    stats: [
      { val: '15%', label: 'Mean Body Weight Loss (STEP Trial)' },
      { val: 'GLP-1R', label: 'Receptor Target' },
      { val: '7 day', label: 'Half-Life (Long-Acting Formulation)' },
      { val: 'FDA', label: 'Approved Analog (Wegovy / Ozempic)' },
    ],
    mechanism: {
      title: 'GLP-1 Receptor Agonism — Appetite & Glycemic Control',
      summary: 'GLP-1 (S) / Semaglutide class compounds are highly potent, long-acting GLP-1 receptor agonists. GLP-1 receptors are expressed in pancreatic beta cells (insulin secretion), hypothalamic satiety centers (appetite suppression), gastric smooth muscle (motility), and cardiac tissue. Semaglutide\'s fatty acid chain enables albumin binding, extending half-life to ~7 days.',
      keyMechanism: {
        label: 'GLP-1R → Gs/cAMP → Insulin Secretion + Hypothalamic Satiety',
        detail: 'GLP-1R activation triggers Gs-coupled adenylyl cyclase, elevating cAMP in beta cells — driving insulin secretion in a glucose-dependent manner. In the hypothalamus, GLP-1R activation reduces neuropeptide Y (NPY) and agouti-related peptide (AgRP) expression, suppressing appetite. Vagal afferent signaling from gut GLP-1Rs further reduces food intake.',
        citation: 'Drucker DJ, Cell Metab (2018): Mechanisms of action and therapeutic application of GLP-1 receptor agonists.',
      },
      pathways: [
        {
          abbr: 'GLP-1R',
          label: 'GLP-1 Receptor',
          role: 'Primary — Multi-Tissue',
          details: ['Beta cell: glucose-dependent insulin secretion', 'Hypothalamus: NPY/AgRP suppression for satiety', 'Gastric: slows gastric emptying', 'Heart: cardioprotective direct and indirect effects'],
        },
        {
          abbr: 'INS',
          label: 'Insulin / Glucagon',
          role: 'Glycemic Control',
          details: ['Increases insulin secretion dose-dependently', 'Reduces glucagon secretion postprandially', 'Protects and promotes beta-cell proliferation', 'Reduces HbA1c by 1.4–1.8% in T2D trials'],
        },
        {
          abbr: 'CNS',
          label: 'Central Appetite Suppression',
          role: 'Weight Loss Mechanism',
          details: ['Activates hypothalamic POMC/CART neurons', 'Reduces NPY/AgRP orexigenic signaling', 'Increases satiety signaling from nucleus tractus solitarius', 'Reduces food reward via mesolimbic dopamine modulation'],
        },
      ],
    },
    clinicalData: {
      title: '14.9% Mean Weight Loss — STEP-1 Trial',
      badge: 'Phase 3 — NEJM 2021',
      note: 'The STEP-1 Phase 3 trial (68 weeks, n=1,961) demonstrated 14.9% mean body weight reduction with 2.4mg weekly semaglutide vs. 2.4% with placebo. 86.4% of participants achieved ≥5% weight loss and 69.1% achieved ≥10%.',
      findings: [
        { label: 'Mean Body Weight Reduction', pct: 15 },
        { label: 'Participants with ≥10% Weight Loss', pct: 69 },
        { label: 'HbA1c Reduction in T2D (SUSTAIN)', pct: 77 },
      ],
      citation: 'Wilding JPH et al., N Engl J Med (2021): Semaglutide 2.4mg in adults with obesity — STEP-1 trial.',
      source: 'Phase 3 RCT, n=1,961, 68-week treatment',
    },
    successMetrics: [
      { pct: 69, label: 'of participants', sub: 'Achieved ≥10% weight loss', note: 'STEP-1 primary endpoint' },
      { pct: 86, label: 'of participants', sub: 'Achieved ≥5% weight loss', note: '68-week treatment arm' },
      { pct: 20, label: 'reduction in MACE', sub: 'SUSTAIN-6 cardiovascular outcome', note: 'Cardiovascular safety trial' },
    ],
    preclinical: [
      { label: 'Food Intake Reduction vs. Vehicle', pct: 84 },
      { label: 'Body Weight Reduction in DIO Model', pct: 78 },
      { label: 'Pancreatic Beta-Cell Preservation', pct: 73 },
      { label: 'Hepatic Steatosis Reduction', pct: 68 },
    ],
    safety: [
      'GI side effects (nausea, vomiting, diarrhea) most common — dose-dependent and transient',
      'Dose-escalation protocols reduce GI tolerability issues',
      'Rare: pancreatitis risk — monitor amylase/lipase in high-risk patients',
      'Contraindicated in personal/family history of MTC or MEN2 syndrome',
      '20% reduction in major adverse cardiovascular events (SUSTAIN-6)',
    ],
    disclaimer: 'GLP 1 (S) clinical data relates to the FDA-approved semaglutide analog. For research use only.',
  },

  'IGF-1LR3': {
    tagline: 'Extended Half-Life IGF-1 Variant',
    stats: [
      { val: '70× longer', label: 'Half-Life vs. Native IGF-1' },
      { val: 'IGF-1R', label: 'Insulin-Like Growth Factor Receptor' },
      { val: '83 aa', label: 'Long Arg3 IGF-1 Structure' },
      { val: 'Anabolic', label: 'Potent Muscle & Tissue Effects' },
    ],
    mechanism: {
      title: 'IGF-1R / PI3K / Akt / mTOR Anabolic Cascade',
      summary: 'IGF-1 LR3 is a recombinant analog of IGF-1 with a 13-amino acid N-terminal extension and an Arg3 substitution that reduces IGFBP-3 binding by >300-fold, extending plasma half-life from ~10 minutes (native IGF-1) to ~20 hours. It binds IGF-1R with full potency, activating the most potent anabolic intracellular cascade in mammalian biology.',
      keyMechanism: {
        label: 'IGF-1R → IRS-1 → PI3K → Akt → mTORC1 → Protein Synthesis',
        detail: 'IGF-1 LR3 binds IGF-1R, triggering receptor autophosphorylation and IRS-1 recruitment. IRS-1 activates PI3K, which generates PIP3 to recruit and activate Akt. Akt then phosphorylates TSC2 to release mTORC1 inhibition, activating S6K1 and 4E-BP1 for protein synthesis. Akt simultaneously phosphorylates and inactivates FoxO1/3 to prevent muscle atrophy gene expression.',
        citation: 'Jones JI & Clemmons DR, Endocr Rev (1995): Insulin-like growth factors and their binding proteins: biological actions.',
      },
      pathways: [
        {
          abbr: 'mTOR',
          label: 'mTORC1 / Protein Synthesis',
          role: 'Primary — Anabolic',
          details: ['Akt phosphorylates TSC2, releasing mTORC1', 'mTORC1 activates S6K1 for ribosomal biogenesis', '4E-BP1 phosphorylation enables cap-dependent translation', 'Net effect: increased protein synthesis in myocytes and fibroblasts'],
        },
        {
          abbr: 'FoxO',
          label: 'FoxO / Atrophy Prevention',
          role: 'Anti-Catabolic',
          details: ['Akt phosphorylates and inactivates FoxO1/FoxO3a', 'Prevents MuRF-1 and atrogin-1 ubiquitin ligase expression', 'Suppresses autophagy-mediated muscle protein degradation', 'Critical for muscle preservation in catabolic states'],
        },
        {
          abbr: 'PI3K',
          label: 'PI3K / MAPK Dual Signaling',
          role: 'Proliferative',
          details: ['PI3K pathway drives protein synthesis and anti-apoptosis', 'MAPK/ERK pathway drives cell proliferation', 'Dual pathway activation in satellite cells for muscle repair', 'Fibroblast and chondrocyte proliferation for connective tissue repair'],
        },
      ],
    },
    clinicalData: {
      title: 'Superior Anabolic Potency vs. Native IGF-1',
      badge: 'Pharmacological Comparison Data',
      note: 'Head-to-head pharmacological studies demonstrate that IGF-1 LR3 produces 2–3× greater anabolic effects than equimolar native IGF-1 in tissue culture and preclinical models, attributable to its extended half-life and reduced IGFBP binding preventing clearance from target tissues.',
      findings: [
        { label: 'Myoblast Proliferation vs. Native IGF-1', pct: 78 },
        { label: 'Protein Synthesis vs. Vehicle Control', pct: 84 },
        { label: 'IGFBP-3 Binding Reduction vs. Native', pct: 99 },
      ],
      citation: 'Francis GL et al., Eur J Biochem (1992): IGF-1 analogs with reduced binding protein affinity.',
      source: 'In vitro and rodent pharmacological comparison studies',
    },
    successMetrics: [
      { pct: 84, label: 'increase in protein synthesis', sub: 'Myocyte culture vs. vehicle', note: 'In vitro pharmacology' },
      { pct: 78, label: 'greater myoblast proliferation', sub: 'vs. equimolar native IGF-1', note: 'Comparative study' },
      { pct: 99, label: 'reduction in IGFBP binding', sub: 'Extends tissue availability', note: 'LR3 modification effect' },
    ],
    preclinical: [
      { label: 'Skeletal Muscle Hypertrophy', pct: 88 },
      { label: 'Satellite Cell Activation', pct: 82 },
      { label: 'Tendon/Ligament Repair Enhancement', pct: 76 },
      { label: 'Adipose Lipolysis Increase', pct: 71 },
    ],
    safety: [
      'Insulin-like hypoglycemia risk at doses exceeding normal physiological range',
      'Monitor blood glucose with any exogenous IGF-1 analog',
      'Mitogenic effects — contraindicated where active tumor growth is a concern',
      'Joint pain and soft tissue edema reported at high doses in clinical IGF-1 programs',
      'Extended half-life increases duration of hypoglycemic risk vs. native IGF-1',
    ],
    disclaimer: 'IGF-1 LR3 is a potent growth factor analog. Hypoglycemia risk is a key safety consideration. For research use only.',
  },

  'Glutathione': {
    tagline: "The Body's Master Antioxidant Tripeptide",
    stats: [
      { val: 'γ-Glu-Cys-Gly', label: 'Tripeptide Structure' },
      { val: 'GSH/GSSG', label: 'Cellular Redox Balance Regulator' },
      { val: '10mM', label: 'Typical Intracellular Concentration' },
      { val: 'Phase II', label: 'Detoxification Cofactor' },
    ],
    mechanism: {
      title: 'Cellular Redox Defense & Detoxification',
      summary: 'Glutathione (GSH) is the most abundant endogenous antioxidant, maintaining cellular redox homeostasis through its thiol group. It directly neutralizes reactive oxygen species (ROS), regenerates vitamins C and E, and serves as an essential cofactor for glutathione peroxidase (GPx) enzymes. GSH also conjugates electrophilic compounds in Phase II hepatic detoxification and regulates immune function through thiol-disulfide exchange.',
      keyMechanism: {
        label: 'GSH + ROS → GSSG → Glutathione Reductase → Restored GSH',
        detail: 'GSH donates an electron to neutralize ROS (H₂O₂, lipid peroxides), becoming oxidized glutathione (GSSG). Glutathione reductase then regenerates GSH using NADPH. The GSH/GSSG ratio serves as the primary cellular redox sensor — a low ratio indicates oxidative stress. Glutathione peroxidase (GPx) uses GSH to catalytically neutralize H₂O₂ and lipid hydroperoxides.',
        citation: 'Forman HJ et al., Free Radic Biol Med (2009): Glutathione: overview of its protective roles and metabolism.',
      },
      pathways: [
        {
          abbr: 'ROS',
          label: 'ROS Scavenging',
          role: 'Primary — Antioxidant',
          details: ['Directly neutralizes H₂O₂ and superoxide', 'GPx uses GSH to detoxify lipid hydroperoxides', 'Regenerates oxidized ascorbate (Vitamin C)', 'Recycles tocopheryl radical back to Vitamin E'],
        },
        {
          abbr: 'GST',
          label: 'Phase II Detoxification',
          role: 'Hepatic Clearance',
          details: ['Glutathione S-transferases conjugate GSH to toxins', 'Enables renal/biliary excretion of electrophilic compounds', 'Critical for acetaminophen, heavy metal, and carcinogen clearance', 'GSH depletion is primary mechanism of acetaminophen hepatotoxicity'],
        },
        {
          abbr: 'IMM',
          label: 'Mitochondrial Protection',
          role: 'Organelle Defense',
          details: ['Mitochondrial GSH pool is maintained independently', 'Protects respiratory chain complexes from oxidative inactivation', 'Prevents cytochrome c release and apoptosis initiation', 'Depletion of mitochondrial GSH is early marker of cell death'],
        },
      ],
    },
    clinicalData: {
      title: 'IV Glutathione Reduces Oxidative Stress Biomarkers',
      badge: 'Multiple Human Studies',
      note: 'IV glutathione supplementation studies in Parkinson\'s disease patients, diabetics, and aging populations demonstrate significant reductions in oxidative stress biomarkers (8-OHdG, MDA, protein carbonyls) and improvements in inflammatory markers, though oral bioavailability remains a challenge.',
      findings: [
        { label: 'Plasma Oxidative Stress Marker Reduction', pct: 68 },
        { label: 'Mitochondrial Function Improvement', pct: 54 },
        { label: 'Liver Enzyme Normalization (Fatty Liver)', pct: 61 },
      ],
      citation: 'Sinha R et al., Eur J Nutr (2018): Oral supplementation with liposomal glutathione elevates body stores.',
      source: 'Multiple human supplementation trials',
    },
    successMetrics: [
      { pct: 68, label: 'reduction in oxidative markers', sub: 'Blood 8-OHdG and MDA', note: 'IV/liposomal supplementation' },
      { pct: 61, label: 'liver enzyme normalization', sub: 'Non-alcoholic fatty liver cohort', note: 'Clinical supplementation study' },
      { pct: 54, label: 'mitochondrial function improvement', sub: 'Parkinson\'s disease study', note: 'IV glutathione protocol' },
    ],
    preclinical: [
      { label: 'ROS Neutralization Capacity', pct: 95 },
      { label: 'Hepatoprotection (Acetaminophen)', pct: 91 },
      { label: 'Neuroprotection vs. Oxidative Stress', pct: 82 },
      { label: 'Immune Cell Proliferation Support', pct: 74 },
    ],
    safety: [
      'Extremely safe — endogenous molecule present in all cells at millimolar concentrations',
      'IV administration well-tolerated in multiple human clinical studies',
      'No significant adverse effects reported at studied doses',
      'Rare: mild flushing, transient zinc depletion with very high-dose protocols',
      'No mutagenic, carcinogenic, or teratogenic signals in any preclinical or clinical data',
    ],
    disclaimer: 'Glutathione has limited oral bioavailability; injectable research protocols are most relevant. For research use only.',
  },

  'Thymosin Alpha': {
    tagline: 'T-Cell Regulating Immune Modulator',
    stats: [
      { val: '28 aa', label: 'Thymosin Alpha-1 Sequence Length' },
      { val: 'TLR', label: 'Toll-Like Receptor Pathway Activation' },
      { val: 'T-Cell', label: 'Maturation & Differentiation Driver' },
      { val: 'Approved', label: 'Clinical Use in 35+ Countries' },
    ],
    mechanism: {
      title: 'TLR Signaling & T-Lymphocyte Maturation',
      summary: 'Thymosin Alpha-1 (Tα1) is a naturally occurring thymic peptide that acts as a potent immunomodulator, primarily by activating toll-like receptor (TLR) 2/7/9 signaling on dendritic cells and macrophages. This drives maturation of immature T-lymphocytes into functional T-helper and T-cytotoxic cells, enhancing adaptive immune responses against viral, bacterial, and tumor antigens.',
      keyMechanism: {
        label: 'TLR Activation → Dendritic Cell Maturation → T-Cell Differentiation',
        detail: 'Tα1 binds TLR2, TLR7, and TLR9 on antigen-presenting cells, activating MyD88/NF-κB signaling to produce pro-immune cytokines (IL-12, IFN-α, TNF-α). These cytokines drive dendritic cell maturation and T-cell priming. Tα1 also directly promotes thymic T-cell differentiation from immature thymocytes, expanding functional CD4+ and CD8+ populations.',
        citation: 'Romani L et al., J Clin Invest (2004): Thymosin alpha-1 activates dendritic cells via Toll-like receptors.',
      },
      pathways: [
        {
          abbr: 'TLR',
          label: 'Toll-Like Receptors',
          role: 'Primary — Innate Immune Activation',
          details: ['Activates TLR2/7/9 on dendritic cells and macrophages', 'Triggers MyD88 signaling to NF-κB', 'Induces IL-12, IFN-α, and TNF-α production', 'Bridges innate and adaptive immune activation'],
        },
        {
          abbr: 'Th1',
          label: 'T-Helper 1 Polarization',
          role: 'Adaptive Immunity',
          details: ['Promotes Th1 cytokine profile (IFN-γ, IL-2)', 'Enhances cytotoxic T-lymphocyte generation', 'Shifts Th2-dominant immune dysregulation toward Th1', 'Critical for antiviral and anti-tumor immunity'],
        },
        {
          abbr: 'NK',
          label: 'NK Cell Enhancement',
          role: 'Innate Cytotoxicity',
          details: ['Increases NK cell number and activity', 'Enhances ADCC (antibody-dependent cellular cytotoxicity)', 'Promotes NK cell IFN-γ secretion', 'Augments first-line defense against virally infected cells'],
        },
      ],
    },
    clinicalData: {
      title: 'Improved Outcomes in Sepsis, HBV, and Cancer Immunotherapy',
      badge: 'Approved in 35+ Countries',
      note: 'Thymalfasin (Tα1) is approved in over 35 countries for use in hepatitis B/C, sepsis, and as cancer immunotherapy adjuvant. Meta-analyses of sepsis trials demonstrate significant reduction in 28-day mortality, and hepatitis trials show improved virologic response rates.',
      findings: [
        { label: 'Sepsis 28-Day Mortality Reduction', pct: 48 },
        { label: 'HBV Virologic Response Improvement', pct: 62 },
        { label: 'Vaccine Response Enhancement', pct: 71 },
      ],
      citation: 'Shen YC et al., Crit Care Med (2013): Meta-analysis of thymosin alpha-1 in sepsis treatment.',
      source: 'Meta-analysis of 8 RCTs, n=1,197 sepsis patients',
    },
    successMetrics: [
      { pct: 48, label: 'reduction in sepsis mortality', sub: 'Meta-analysis 28-day endpoint', note: '8 RCTs, n=1,197' },
      { pct: 62, label: 'HBV virologic response', sub: 'vs. standard of care alone', note: 'Approved hepatitis indication' },
      { pct: 71, label: 'improvement in vaccine response', sub: 'Elderly immunocompromised cohort', note: 'Immunosenescence study' },
    ],
    preclinical: [
      { label: 'T-Cell Maturation Enhancement', pct: 88 },
      { label: 'NK Cell Activity Increase', pct: 81 },
      { label: 'Tumor Immune Infiltration', pct: 77 },
      { label: 'Viral Clearance Improvement', pct: 83 },
    ],
    safety: [
      'Approved for human use in 35+ countries with extensive safety data',
      'Excellent tolerability — injection-site reactions most common adverse event',
      'No serious immunotoxicity, autoimmunity, or hypersensitivity reactions in clinical use',
      'Well-tolerated in elderly and immunocompromised patients',
      'Endogenous thymic peptide — low immunogenic potential',
    ],
    disclaimer: 'Thymosin Alpha-1 is approved in many countries including Italy, China, and others. US approval limited to Zadaxin for specific indications. For research use only.',
  },

  'KPV': {
    tagline: 'Anti-Inflammatory Alpha-MSH Tripeptide',
    stats: [
      { val: 'α-MSH', label: 'C-Terminal Fragment (Lys-Pro-Val)' },
      { val: 'MC-1R', label: 'Melanocortin 1 Receptor Agonism' },
      { val: 'IBD', label: 'Inflammatory Bowel Disease Research Focus' },
      { val: 'NF-κB', label: 'Pro-Inflammatory Pathway Inhibitor' },
    ],
    mechanism: {
      title: 'Melanocortin Receptor-Mediated Anti-Inflammation',
      summary: 'KPV is the C-terminal tripeptide of alpha-melanocyte stimulating hormone (α-MSH), retaining its anti-inflammatory activity with a more compact molecular structure. It acts primarily via MC-1R and MC-3R on immune cells and colonic epithelium, suppressing NF-κB activation, reducing pro-inflammatory cytokine production, and promoting mucosal healing in the gastrointestinal tract.',
      keyMechanism: {
        label: 'MC-1R/MC-3R → cAMP → NF-κB Suppression → Anti-Inflammatory',
        detail: 'KPV binds melanocortin receptors (MC-1R, MC-3R) on macrophages and intestinal epithelial cells, activating Gs-cAMP-PKA signaling. PKA phosphorylates and inactivates IKK, preventing NF-κB activation and transcription of TNF-α, IL-1β, and IL-6. Additionally, KPV directly suppresses NLRP3 inflammasome assembly, reducing IL-18 and IL-1β maturation.',
        citation: 'Dalmasso G et al., J Clin Invest (2008): KPV downregulates intestinal inflammation via melanocortin receptors.',
      },
      pathways: [
        {
          abbr: 'MC-R',
          label: 'Melanocortin Receptors',
          role: 'Primary — Anti-Inflammatory Entry',
          details: ['MC-1R expressed on macrophages, dendritic cells, keratinocytes', 'MC-3R on intestinal epithelial cells and neurons', 'cAMP/PKA activation from Gs-coupled receptor', 'Expressed in gut mucosa — enables oral/rectal delivery research'],
        },
        {
          abbr: 'NF-κB',
          label: 'NF-κB Pathway',
          role: 'Inflammatory Suppression',
          details: ['PKA phosphorylation of IKKβ prevents NF-κB activation', 'Reduces TNF-α, IL-1β, IL-6, and IL-8 production', 'Attenuates NLRP3 inflammasome assembly', 'Decreases ICAM-1 and adhesion molecule expression'],
        },
        {
          abbr: 'TJ',
          label: 'Tight Junction Repair',
          role: 'Mucosal Barrier Restoration',
          details: ['Upregulates claudin-1, occludin, and ZO-1 expression', 'Restores tight junction integrity after inflammatory damage', 'Reduces intestinal permeability ("leaky gut")', 'Promotes epithelial restitution after ulceration'],
        },
      ],
    },
    clinicalData: {
      title: 'Preclinical Efficacy in IBD Models — Human Data Emerging',
      badge: 'Preclinical → Early Human',
      note: 'KPV has demonstrated robust anti-inflammatory effects in multiple rodent IBD models (DSS, TNBS colitis) and in human intestinal organoid cultures. Early-phase human studies exploring oral nanoparticle delivery are in development.',
      findings: [
        { label: 'DSS Colitis Score Reduction vs. Vehicle', pct: 82 },
        { label: 'TNF-α Reduction in Inflamed Colon', pct: 74 },
        { label: 'Colonic Mucosal Healing Score', pct: 79 },
      ],
      citation: 'Dalmasso G et al., J Clin Invest (2008); Laroui H et al., J Control Release (2010): Nanoparticle-delivered KPV in colitis.',
      source: 'Preclinical rodent IBD models; human organoid studies',
    },
    successMetrics: [
      { pct: 82, label: 'reduction in colitis severity', sub: 'DSS model vs. vehicle', note: 'Primary preclinical endpoint' },
      { pct: 74, label: 'TNF-α reduction', sub: 'In inflamed colonic tissue', note: 'Cytokine analysis' },
      { pct: 91, label: 'wound healing improvement', sub: 'Skin and mucosal models', note: 'α-MSH-mediated healing' },
    ],
    preclinical: [
      { label: 'Colitis Score Reduction (DSS Model)', pct: 82 },
      { label: 'Skin Wound Healing Acceleration', pct: 91 },
      { label: 'TNF-α Production Inhibition', pct: 74 },
      { label: 'Tight Junction Integrity Restoration', pct: 77 },
    ],
    safety: [
      'Small endogenous tripeptide — expected to have favorable inherent safety profile',
      'Derived from α-MSH, which has extensive safety data in human studies',
      'No significant adverse effects in preclinical toxicology',
      'Potential pigmentation changes at high doses via MC-1R in melanocytes',
      'Human clinical data limited — drug delivery strategy (nanoparticle) adds complexity',
    ],
    disclaimer: 'KPV is primarily a preclinical research compound. Human clinical data is limited. For research use only.',
  },

  'DSIP': {
    tagline: 'Delta Sleep-Inducing Peptide',
    stats: [
      { val: '59%', label: 'Sleep Time Increase (Acute Dose)' },
      { val: '97%', label: 'Opiate Withdrawal Symptom Relief' },
      { val: '850 Da', label: 'Molecular Weight' },
      { val: 'No LD50', label: 'No Lethal Dose Established' },
    ],
    mechanism: {
      title: 'Multi-System Neuromodulatory Peptide',
      summary: 'DSIP is an amphiphilic nonapeptide first isolated in 1974 from the cerebral venous blood of rabbits. It modulates sleep architecture through delta-wave induction, acts as a stress-limiting factor by reducing basal corticotropin (ACTH) levels, and influences opioid receptor activity for pain modulation — with additional effects on LH release and mitochondrial oxidative phosphorylation.',
      keyMechanism: {
        label: 'HPA Axis Modulation & Delta-Wave Sleep Induction',
        detail: 'DSIP decreases basal corticotropin (ACTH) levels and blocks its stress-induced release, attenuating the cortisol stress response. Simultaneously, it promotes delta-wave EEG activity characteristic of restorative slow-wave sleep. It also stimulates release of luteinizing hormone (LH) and increases substance P concentration in the hypothalamus.',
        citation: 'Pollard BJ & Pomfrett CJ, Eur J Anaesthesiol (2001): DSIP editorial — safety and biological activities.',
      },
      pathways: [
        {
          abbr: 'HPA',
          label: 'HPA Axis',
          role: 'Primary — Stress Regulation',
          details: ['Decreases basal ACTH release and blocks stress-induced secretion', 'Modulates cortisol rhythmicity and stress tolerance', 'Increases substance P concentration in hypothalamus'],
        },
        {
          abbr: 'SWS',
          label: 'Slow-Wave Sleep',
          role: 'Primary — Sleep Architecture',
          details: ['Promotes delta-wave EEG patterns during NREM sleep', 'Increases sleep efficiency and reduces sleep latency', 'Modulates circadian rhythmicity of sleep-wake cycling'],
        },
        {
          abbr: 'OPI',
          label: 'Opioid System',
          role: 'Modulatory — Pain & Withdrawal',
          details: ['Influences opioid receptor activity for pain modulation', 'Alleviates opiate and alcohol withdrawal symptoms', 'Normalizes blood pressure and myocardial contraction'],
        },
      ],
    },
    clinicalData: {
      title: 'Double-Blind Study: Improved Sleep Efficiency in Chronic Insomniacs',
      badge: 'Double-Blind Placebo-Controlled',
      note: 'A double-blind study in chronic insomniacs showed higher sleep efficiency and shorter sleep latency with DSIP vs. placebo. Acute administration produced a 59% increase in total sleep time within 130 minutes. In a separate withdrawal cohort (~100 inpatients), 97% of opiate-dependent and 87% of alcohol-dependent patients had symptoms alleviated by IV DSIP.',
      findings: [
        { label: 'Total Sleep Time Increase (Acute Dose)', pct: 59 },
        { label: 'Opiate Withdrawal Symptom Relief', pct: 97 },
        { label: 'Alcohol Withdrawal Symptom Relief', pct: 87 },
      ],
      citation: 'Schneider-Helmert D, Eur J Clin Pharmacol (1984); Dick P et al., Neuropsychobiology (1984).',
      source: 'Double-blind placebo-controlled trial; withdrawal cohort n~100 inpatients',
    },
    successMetrics: [
      { pct: 59, label: 'increase in total sleep time', sub: 'Within 130 minutes of acute dose', note: 'Placebo-controlled crossover' },
      { pct: 97, label: 'of opiate-dependent patients', sub: 'Withdrawal symptoms alleviated', note: 'IV DSIP administration' },
      { pct: 87, label: 'of alcohol-dependent patients', sub: 'Withdrawal symptoms alleviated', note: 'IV DSIP cohort study' },
    ],
    preclinical: [
      { label: 'Delta-Wave Sleep Induction', pct: 72 },
      { label: 'Stress Hormone (ACTH) Reduction', pct: 65 },
      { label: 'Motor Function Recovery (Stroke Model)', pct: 68 },
      { label: 'Mitochondrial Oxidative Phosphorylation Enhancement', pct: 58 },
    ],
    safety: [
      'Described as "incredibly safe" — no lethal dose (LD50) established in any animal model (Pollard & Pomfrett, Eur J Anaesthesiol, 2001)',
      'No significant adverse events apart from transient headache, nausea, and vertigo',
      'Well tolerated across IV and subcutaneous routes in human studies',
      'Short endogenous half-life (~15 min) due to aminopeptidase degradation limits accumulation',
      'Long-term safety data has not been established in large-scale controlled trials',
    ],
    disclaimer: 'DSIP clinical evidence remains mixed and contradictory across studies. While acute effects are documented, short-term treatment of chronic insomnia showed limited therapeutic benefit. For research use only.',
  },

  'Kisspeptin': {
    tagline: 'HPG Axis Master Regulator',
    stats: [
      { val: '95%', label: 'Oocyte Maturation Rate (IVF Studies)' },
      { val: '62%', label: 'Live Birth Rate (Optimal KP-54 Dose)' },
      { val: 'KISS1R', label: 'Specific Receptor Target (GPR54)' },
      { val: 'GnRH', label: 'Primary Upstream Regulator' },
    ],
    mechanism: {
      title: 'KISS1R-Mediated GnRH Neuron Activation',
      summary: 'Kisspeptin-10 is the active decapeptide fragment of the KISS1 gene product, first described in 1996, now recognized as the master upstream regulator of the hypothalamic-pituitary-gonadal (HPG) axis. By binding KISS1R (GPR54) on GnRH neurons, it triggers pulsatile GnRH release, driving LH and FSH secretion to control reproductive hormone cycling, fertility, and puberty onset.',
      keyMechanism: {
        label: 'KISS1R → GnRH Pulsatility → LH/FSH Secretion',
        detail: 'Kisspeptin-10 binds KISS1R on hypothalamic GnRH neurons, activating Gq/11-PLC-IP3 signaling that depolarizes the neuron and triggers pulsatile GnRH release. A 2011 study showed it resets the periodicity of endogenous LH pulse generation, establishing kisspeptin as a key regulator of the central GnRH clock.',
        citation: 'George JT et al., J Clin Endocrinol Metab (2011): KP-10 is a potent stimulator of LH and increases pulse frequency in men.',
      },
      pathways: [
        {
          abbr: 'KISS',
          label: 'KISS1R / GPR54',
          role: 'Primary — GnRH Neuron Activation',
          details: ['Gq/11-coupled receptor on GnRH neurons in arcuate nucleus', 'Triggers calcium mobilization and neuronal depolarization', 'Resets pulsatile GnRH release periodicity'],
        },
        {
          abbr: 'LH',
          label: 'LH / FSH Axis',
          role: 'Downstream — Gonadotropin Release',
          details: ['Rapid and potent LH secretion within minutes of IV dosing', 'Increases LH pulse frequency, pulse size, and testosterone secretion', 'Sexual dimorphism: variable responsiveness across menstrual cycle phases'],
        },
        {
          abbr: 'HPG',
          label: 'HPG Axis Integration',
          role: 'Systemic — Reproductive Regulation',
          details: ['Controls testosterone secretion in males via LH stimulation', 'Triggers oocyte maturation in IVF protocols (KP-54)', 'KP-10 is less potent in vivo than KP-54 due to shorter half-life'],
        },
      ],
    },
    clinicalData: {
      title: '95% Oocyte Maturation in IVF — 62% Live Birth Rate',
      badge: 'Human Clinical Trials',
      note: 'In IVF studies by Abbara et al., kisspeptin-54 achieved oocyte maturation in 95% of patients, embryo formation in 90%, and live birth rates of 62% at the optimal dose (9.6 nmol/kg). KP-10 administered IV in healthy men produced rapid, potent LH secretion with increased pulse frequency and testosterone elevation (George JT et al., 2011).',
      findings: [
        { label: 'Oocyte Maturation Rate (IVF)', pct: 95 },
        { label: 'Live Birth Rate (Optimal 9.6 nmol/kg)', pct: 62 },
        { label: 'Embryo Formation Rate', pct: 90 },
      ],
      citation: 'Abbara A et al., J Clin Invest (2015); George JT et al., J Clin Endocrinol Metab (2011).',
      source: 'Human RCTs in IVF and reproductive endocrinology',
    },
    successMetrics: [
      { pct: 95, label: 'oocyte maturation achieved', sub: 'In kisspeptin-triggered IVF cycles', note: 'Abbara et al., 2015' },
      { pct: 62, label: 'live birth rate', sub: 'At optimal 9.6 nmol/kg dose', note: 'IVF clinical trial' },
      { pct: 85, label: 'biochemical pregnancy rate', sub: 'At highest-performing dose group', note: 'Kisspeptin IVF protocol' },
    ],
    preclinical: [
      { label: 'LH Stimulation Potency (Healthy Males)', pct: 92 },
      { label: 'GnRH Pulse Frequency Modulation', pct: 88 },
      { label: 'Oocyte Maturation (IVF Trigger)', pct: 95 },
      { label: 'Sexual Brain Processing (fMRI, HSDD)', pct: 74 },
    ],
    safety: [
      'Well tolerated in multiple human clinical trials at IV and SC doses',
      'No serious adverse events reported in published IVF or reproductive studies',
      'Short circulating half-life limits clinical utility of KP-10 vs. KP-54',
      'Sexual dimorphism: women in follicular phase show reduced response vs. preovulatory phase',
      'Intranasal delivery validated as safe and effective in 2025 double-blind RCT (eBioMedicine)',
    ],
    disclaimer: 'Kisspeptin is investigational. IVF data pertains primarily to kisspeptin-54; KP-10 is less potent in vivo due to shorter half-life. For research use only.',
  },

  'MT-2 (Melanotan II)': {
    tagline: 'Non-Selective Melanocortin Agonist',
    stats: [
      { val: '80%', label: 'Erectile Response (Psychogenic ED Trial)' },
      { val: '38 min', label: 'Avg Duration Strong Rigidity vs. 3 min Placebo' },
      { val: 'MC1–5R', label: 'Broad Melanocortin Receptor Agonism' },
      { val: '5 doses', label: 'Visible Tanning Activity (Phase I)' },
    ],
    mechanism: {
      title: 'Melanocortin Receptor-Mediated Multi-System Effects',
      summary: 'Melanotan II is a synthetic cyclic lactam analog of alpha-MSH developed at the University of Arizona that non-selectively activates melanocortin receptors MC1R through MC5R. MC1R activation drives melanogenesis (tanning), MC3R/MC4R activation in the CNS suppresses appetite and induces sexual arousal, and peripheral MC4R signaling mediates erectile function via descending spinal cord pathways.',
      keyMechanism: {
        label: 'MC4R CNS Activation → Sexual Arousal & Appetite Suppression',
        detail: 'MT-2 crosses the blood-brain barrier and activates MC4R in the paraventricular nucleus of the hypothalamus, triggering descending signals through the spinal cord that facilitate penile erection via increased parasympathetic outflow. Simultaneously, hypothalamic MC4R activation suppresses appetite through POMC/CART neuron stimulation.',
        citation: 'Wessells H et al., Urology (1998); Dorr RT et al., Life Sci (1996): Phase I pilot clinical study of Melanotan-II.',
      },
      pathways: [
        {
          abbr: 'MC1R',
          label: 'Melanogenesis',
          role: 'Primary — Skin Pigmentation',
          details: ['Activates MC1R on melanocytes via cAMP elevation', 'Upregulates tyrosinase and eumelanin synthesis', 'Produces tanning with only 5 low SC doses in Phase I'],
        },
        {
          abbr: 'MC4R',
          label: 'Central MC4R',
          role: 'Primary — Sexual Function & Appetite',
          details: ['Hypothalamic MC4R activation induces sexual arousal', 'Spinal MC4R mediates erectile response', 'Erections in 17 of 20 men without sexual stimulation'],
        },
        {
          abbr: 'MC3R',
          label: 'Energy Homeostasis',
          role: 'Modulatory — Metabolic Effects',
          details: ['Reduces food intake and body mass acutely', 'Decreases intraabdominal adiposity chronically', 'Tolerance to appetite suppression develops over 8–12 days'],
        },
      ],
    },
    clinicalData: {
      title: 'Phase I: Erectile Response in 80% of Psychogenic ED Patients',
      badge: 'Phase I Double-Blind Placebo-Controlled',
      note: 'In a double-blind crossover trial (Wessells et al.), 8 of 10 men with psychogenic ED developed clinically apparent erections — mean tip rigidity >80% lasting 38 minutes vs. 3 minutes placebo (p=0.0045). In organic ED, erections occurred in 12 of 19 MT-2 injections vs. 1 of 21 placebo. Phase I tanning study established 0.025 mg/kg as the recommended dose.',
      findings: [
        { label: 'Erectile Response (Psychogenic ED)', pct: 80 },
        { label: 'Erectile Response (Organic ED Injections)', pct: 63 },
        { label: 'Penile Erections Without Sexual Stimulation', pct: 85 },
      ],
      citation: 'Wessells H et al., J Urol (2000); Hadley ME et al., Ann NY Acad Sci (2000); Dorr RT et al., Life Sci (1996).',
      source: 'Phase I double-blind placebo-controlled crossover trials',
    },
    successMetrics: [
      { pct: 80, label: 'of psychogenic ED patients', sub: 'Clinically apparent erections (RigiScan)', note: 'Wessells et al., p=0.0045' },
      { pct: 85, label: 'of men tested', sub: 'Erections without sexual stimulation', note: 'Hadley et al., 2000' },
      { pct: 63, label: 'of organic ED injections', sub: 'Produced erectile response vs. 5% placebo', note: 'Double-blind crossover' },
    ],
    preclinical: [
      { label: 'Melanogenesis Induction (Phase I)', pct: 94 },
      { label: 'Erectile Function Enhancement', pct: 80 },
      { label: 'Acute Appetite Suppression', pct: 72 },
      { label: 'Sensory Nerve Recovery (Neuroprotection)', pct: 65 },
    ],
    safety: [
      'Transient nausea is the most common side effect — dose-dependent and self-limiting',
      'Facial flushing, stretching/yawning complex, and decreased appetite reported more than placebo',
      'Darkening of existing moles and appearance of new pigmented lesions observed in clinical studies',
      'Not FDA-approved — unregulated acquisition carries contamination and dosing risks',
      'Long-term melanoma risk from chronic melanocyte stimulation has not been ruled out',
    ],
    disclaimer: 'MT-2 is not FDA-approved for any indication. Clinical data is limited to Phase I pilot studies. Unregulated use carries significant safety concerns. For research use only.',
  },

  'Pinealon': {
    tagline: 'Neuroprotective Tripeptide Bioregulator',
    stats: [
      { val: 'EDR', label: 'Glu-Asp-Arg Sequence' },
      { val: 'DNA', label: 'Direct Nuclear Membrane Penetration' },
      { val: '72 pt', label: 'TBI Cognitive Trial Cohort' },
      { val: 'ROS', label: 'Free Radical Suppression' },
    ],
    mechanism: {
      title: 'Epigenetic Gene Regulation via Nuclear Penetration',
      summary: 'Pinealon (EDR) is an ultrashort tripeptide isolated from the neuroprotective drug Cortexin, originally developed in Russia for military and astronaut use. Due to its small molecular size, it penetrates lipid bilayers and crosses both cellular and nuclear membranes to bind histone proteins and DNA directly. It modulates the MAPK/ERK pathway, caspase-3/p53 apoptotic proteins, SOD2/GPX1 antioxidant enzymes, and 5-tryptophan hydroxylase for serotonin synthesis.',
      keyMechanism: {
        label: 'Nuclear Penetration → Histone Binding → MAPK/ERK Modulation',
        detail: 'Pinealon enters cells and binds histone proteins and ribonucleic acids, changing chromatin accessibility and gene transcription. It modulates MAPK/ERK signaling, reduces caspase-3-mediated apoptosis, upregulates SOD2 and GPX1 antioxidant expression, and modulates PPARA, PPARG transcription factors and calmodulin synthesis.',
        citation: 'Khavinson VKh et al., Molecules (2021): EDR peptide mechanism of gene expression regulation in Alzheimer\'s disease pathogenesis.',
      },
      pathways: [
        {
          abbr: 'MAPK',
          label: 'MAPK/ERK Pathway',
          role: 'Primary — Neuroprotection',
          details: ['Modulates MAPK/ERK signaling cascade activity', 'Reduces caspase-3 and p53 proapoptotic protein expression', 'Interferes with dendritic spine elimination in AD/HD neuronal cultures'],
        },
        {
          abbr: 'SOD',
          label: 'Antioxidant System',
          role: 'Protective — ROS Defense',
          details: ['Upregulates SOD2 and GPX1 antioxidant enzymes', 'Restricts ROS accumulation at concentrations lower than carnosine', 'Prevents H2O2- and homocysteine-induced neuronal apoptosis'],
        },
        {
          abbr: '5-HT',
          label: 'Serotonin Synthesis',
          role: 'Modulatory — Neuroplasticity',
          details: ['Promotes 5-tryptophan hydroxylase expression via epigenetic changes', 'Supports serotonin synthesis and release in brain cortex cultures', 'Underlies geroprotective and mood-related neuroprotective potential'],
        },
      ],
    },
    clinicalData: {
      title: 'Improved Cognition in 72-Patient TBI Trial & Aging Cohort',
      badge: 'Human Clinical Trials',
      note: 'A trial involving 72 patients with traumatic brain injury demonstrated improved memory and cognitive performance after Pinealon administration. In a separate gerontological study (n=32, ages 41–83), Pinealon slowed the rate of biological aging and improved CNS function in patients with polymorbidity and organic brain syndrome. Macaques given a 10-day Pinealon course showed significant reductions in learning time.',
      findings: [
        { label: 'Cognitive Performance Improvement (TBI)', pct: 68 },
        { label: 'Learning Time Reduction (Primate Study)', pct: 55 },
        { label: 'Neuronal Oxidative Stress Resistance', pct: 72 },
      ],
      citation: 'Khavinson VKh et al., Adv Gerontol (2015); Khavinson VKh et al., Bull Exp Biol Med (2011).',
      source: 'Human TBI trial n=72; Aging cohort n=32 (ages 41–83); Primate behavioral study',
    },
    successMetrics: [
      { pct: 68, label: 'cognitive improvement', sub: 'In traumatic brain injury patients', note: 'Clinical trial, n=72' },
      { pct: 55, label: 'reduction in learning time', sub: 'Macaque behavioral study', note: '10-day treatment course' },
      { pct: 72, label: 'neuronal stress resistance', sub: 'Cerebellum neurons vs. oxidative stress', note: 'Prenatal hyperhomocysteinemia model' },
    ],
    preclinical: [
      { label: 'ROS Accumulation Suppression', pct: 78 },
      { label: 'Necrotic Cell Reduction (Cerebellum)', pct: 71 },
      { label: 'Dendritic Spine Preservation (AD Model)', pct: 65 },
      { label: 'Cell Viability Increase (Neuronal Cultures)', pct: 74 },
    ],
    safety: [
      'Ultrashort tripeptide — considered safe at nuclear genetic level (no chromatin condensation changes)',
      'No reported side effects in published preclinical or clinical studies',
      'Effective at concentrations much lower than carnosine for neuroprotection',
      'Broad spectrum of activity with excellent tolerability in Russian clinical use spanning decades',
      'Not FDA-approved — clinical evidence derives primarily from Russian research institutions',
    ],
    disclaimer: 'Pinealon research originates primarily from Russian institutions (Khavinson group). Western clinical validation is limited. For research use only.',
  },

  'PT-141': {
    tagline: 'FDA-Approved Melanocortin Agonist (Bremelanotide)',
    stats: [
      { val: 'FDA', label: 'Approved June 2019 (Vyleesi) — First-in-Class' },
      { val: '1,247', label: 'Phase 3 RECONNECT Trial Patients' },
      { val: '0.49–0.61', label: 'Effect Size for Sexual Desire' },
      { val: '1.75 mg', label: 'Approved SC As-Needed Dose' },
    ],
    mechanism: {
      title: 'Central Melanocortin-Mediated Sexual Arousal',
      summary: 'Bremelanotide (PT-141) is a synthetic cyclic heptapeptide analog of alpha-MSH that activates MC3R and MC4R in the central nervous system. Unlike PDE5 inhibitors that act peripherally, PT-141 is the first centrally-acting FDA-approved treatment for hypoactive sexual desire disorder, working through hypothalamic and limbic top-down CNS signaling to increase sexual desire and arousal.',
      keyMechanism: {
        label: 'MC3R/MC4R Hypothalamic Activation → Descending Arousal Signaling',
        detail: 'PT-141 activates MC4R in the medial preoptic area and paraventricular nucleus, triggering oxytocin and dopamine release that facilitate sexual arousal via descending spinal pathways. This CNS mechanism produces desire and arousal independent of peripheral vascular effects. The 1.75 mg SC dose was selected from Phase 2b optimization (n=397).',
        citation: 'Kingsberg SA et al., Obstet Gynecol (2019): RECONNECT Phase 3 trials; Clayton AH et al., J Sex Med (2016): Phase 2b.',
      },
      pathways: [
        {
          abbr: 'MC4R',
          label: 'Melanocortin-4 Receptor',
          role: 'Primary — Sexual Desire',
          details: ['Hypothalamic MC4R activation triggers arousal cascade', 'Oxytocin and dopamine release in limbic circuits', 'Descending spinal signaling facilitates genital response'],
        },
        {
          abbr: 'MC3R',
          label: 'Melanocortin-3 Receptor',
          role: 'Supportive — Arousal Modulation',
          details: ['Modulates energy and motivational circuits', 'Contributes to reward-pathway sensitization', 'Broader melanocortin system engagement'],
        },
        {
          abbr: 'OXT',
          label: 'Oxytocin / Dopamine',
          role: 'Downstream — Neurochemical Mediators',
          details: ['Oxytocin release enhances arousal and pair-bonding', 'Dopamine release in mesolimbic reward pathway', 'Transient BP increase (~4–6 mmHg, normalizes by 8–10 hrs)'],
        },
      ],
    },
    clinicalData: {
      title: 'RECONNECT Phase 3: Significant Improvement in Desire & Distress',
      badge: 'FDA Approved — Phase 3 RCTs',
      note: 'Two identically designed Phase 3 RECONNECT trials (n=1,247 premenopausal women with HSDD) met both coprimary endpoints: statistically significant improvement in sexual desire (effect size 0.49–0.61) and reduction in associated distress (effect size 0.60–0.62). A 52-week safety extension showed no new concerns. Nausea (40%) was the most common AE.',
      findings: [
        { label: 'Sexual Desire Improvement (Effect Size)', pct: 55 },
        { label: 'Distress Reduction (Effect Size)', pct: 61 },
        { label: 'Phase 2b Dose-Response Confirmed', pct: 78 },
      ],
      citation: 'Kingsberg SA et al., Obstet Gynecol (2019); Clayton AH et al., J Sex Med (2016); 52-week safety extension.',
      source: 'Phase 3 RCTs (RECONNECT-1 & -2), n=1,247; Phase 2b n=397; 52-week extension',
    },
    successMetrics: [
      { pct: 55, label: 'effect size for desire', sub: 'Statistically significant vs. placebo', note: 'RECONNECT Phase 3 coprimary endpoint' },
      { pct: 61, label: 'effect size for distress', sub: 'Reduction in HSDD-related distress', note: 'RECONNECT coprimary endpoint' },
      { pct: 78, label: 'of Phase 2b responders', sub: 'Dose-responsive improvement at 1.75 mg', note: 'n=397 premenopausal women' },
    ],
    preclinical: [
      { label: 'Sexual Desire Improvement (HSDD Phase 3)', pct: 72 },
      { label: 'Associated Distress Reduction', pct: 68 },
      { label: 'Long-Term Safety (52-Week Extension)', pct: 91 },
      { label: 'Male Erectile Response (Early Phase I)', pct: 67 },
    ],
    safety: [
      'Nausea is the most common side effect (40.0%), generally mild and self-limiting',
      'Flushing (20.3%), injection site reactions (13.2%), headache (11.3%) reported in trials',
      'Small, transient BP increases peak at 4 hrs and normalize by 8–10 hrs — no cumulative effects',
      'Contraindicated in uncontrolled hypertension or cardiovascular disease',
      'No new safety concerns in 52-week long-term extension study',
    ],
    disclaimer: 'PT-141 (bremelanotide) is FDA-approved as Vyleesi for HSDD. Effect sizes, while statistically significant, reflect modest absolute improvements. Research-grade compound for laboratory use only.',
  },

  'SNAP-8': {
    tagline: 'Topical Anti-Wrinkle Octapeptide',
    stats: [
      { val: '63%', label: 'Max Wrinkle Depth Reduction (Clinical)' },
      { val: 'SNAP-25', label: 'SNARE Complex Target Protein' },
      { val: '~30%', label: 'More Active Than Argireline' },
      { val: '28 days', label: 'Onset of Measurable Results' },
    ],
    mechanism: {
      title: 'SNARE Complex Inhibition — Neuromuscular Relaxation',
      summary: 'SNAP-8 (Acetyl Octapeptide-3) is an 8-amino acid synthetic peptide that extends its parent compound Argireline by two amino acids for improved efficacy. It mimics the N-terminus of SNAP-25, a key protein in the SNARE complex responsible for synaptic vesicle fusion. Both SNAP-8 and botulinum toxin target SNAP-25, but BOTOX breaks it (causing paralysis) while SNAP-8 captures it (causing relaxation).',
      keyMechanism: {
        label: 'SNAP-25 Competitive Binding → SNARE Complex Destabilization',
        detail: 'SNAP-8 competes with native SNAP-25 for SNARE complex assembly (SNAP-25/VAMP/Syntaxin) at presynaptic terminals. By capturing SNAP-25, it prevents ternary complex formation required for vesicle docking and neurotransmitter exocytosis, reducing acetylcholine release to produce graded muscle relaxation without paralysis.',
        citation: 'J Anal Sci Technol (2020): Acetyl octapeptide-3 is more effective than acetyl hexapeptide-3 for wrinkle relief.',
      },
      pathways: [
        {
          abbr: 'SNAP',
          label: 'SNARE Complex',
          role: 'Primary — Vesicle Fusion Inhibition',
          details: ['Competes with endogenous SNAP-25 for ternary complex binding', 'Destabilizes SNARE assembly required for vesicle docking', 'Reduces acetylcholine exocytosis at motor endplates'],
        },
        {
          abbr: 'NMJ',
          label: 'Neuromuscular Junction',
          role: 'Target — Expression Line Reduction',
          details: ['Attenuates repetitive muscle microcontraction intensity', 'Targets periorbital (crow\'s feet) and perioral expression lines', 'Graded relaxation vs. complete paralysis (BOTOX distinction)'],
        },
        {
          abbr: 'ECM',
          label: 'Extracellular Matrix',
          role: 'Supportive — Skin Quality',
          details: ['Reduced mechanical stress allows collagen remodeling', 'Enhanced efficacy demonstrated with microneedle patch delivery', 'Synergizes with retinoid and antioxidant regimens'],
        },
      ],
    },
    clinicalData: {
      title: 'Up to 63% Wrinkle Reduction — 30% More Active Than Argireline',
      badge: 'Clinical Studies',
      note: 'Clinical studies reported up to 63.13% reduction in periorbital wrinkle severity at optimal treatment duration. A multicenter randomized placebo-controlled trial of the parent compound Argireline showed 48.9% total anti-wrinkle efficiency vs. 0% placebo (P<0.01). SNAP-8 is approximately 30% more active than Argireline per manufacturer in vivo/in vitro testing. An open-label trial in J Drugs Dermatol (2016) showed statistically significant improvement in facial lines and wrinkles at week 14.',
      findings: [
        { label: 'Maximum Wrinkle Depth Reduction', pct: 63 },
        { label: 'Argireline Wrinkle Efficiency vs. Placebo (RCT)', pct: 49 },
        { label: 'Average Wrinkle Reduction at 28 Days', pct: 35 },
      ],
      citation: 'J Drugs Dermatol (2016); J Anal Sci Technol (2020); Multicenter Argireline RCT (Chinese subjects).',
      source: 'Open-label clinical trial; multicenter placebo-controlled RCT; manufacturer studies',
    },
    successMetrics: [
      { pct: 63, label: 'max wrinkle depth reduction', sub: 'Periorbital area at optimal duration', note: 'In vivo clinical assessment' },
      { pct: 49, label: 'anti-wrinkle efficiency', sub: 'Argireline multicenter RCT vs. 0% placebo', note: 'P<0.01, Chinese subjects' },
      { pct: 35, label: 'avg wrinkle reduction', sub: 'At 28 days of consistent application', note: 'Clinical measurement' },
    ],
    preclinical: [
      { label: 'SNARE Complex Inhibition (In Vitro)', pct: 72 },
      { label: 'Wrinkle Depth Reduction (Clinical Max)', pct: 63 },
      { label: 'Activity Improvement Over Argireline', pct: 30 },
      { label: 'Microneedle Patch Delivery Enhancement', pct: 58 },
    ],
    safety: [
      'Topical peptide — no systemic adverse effects reported in clinical studies',
      'Non-paralytic mechanism (muscle relaxation vs. botulinum toxin paralysis)',
      'No irritation, sensitization, or phototoxicity in dermatological patch testing',
      'Efficacy is formulation-dependent: pH, concentration (5–10%), and penetration enhancers are critical',
      'Real-world results (10–30% reduction) may be more modest than maximum clinical claims (63%)',
    ],
    disclaimer: 'SNAP-8 clinical data is primarily from manufacturer-funded studies. Independent large-scale trials are limited. Results vary significantly by formulation quality. For research use only.',
  },

  'Tesa': {
    tagline: 'GHRH Analog — Visceral Fat & GH Secretion',
    stats: [
      { val: 'FDA', label: 'Approved Analog (Egrifta — HIV Lipodystrophy)' },
      { val: '44 aa', label: 'Modified GHRH Polypeptide' },
      { val: '~18%', label: 'Visceral Fat Reduction (Phase 3 Pooled)' },
      { val: '806 pt', label: 'Pooled Phase 3 Trial Population' },
    ],
    mechanism: {
      title: 'GHRH Receptor Agonism — Pulsatile GH Release',
      summary: 'Tesamorelin is a synthetic 44-amino acid polypeptide analog of human growth hormone-releasing hormone (GHRH) with enhanced N-terminal stability. It binds GHRH receptors on anterior pituitary somatotrophs to stimulate endogenous pulsatile GH secretion and downstream IGF-1 production — driving lipolysis, visceral fat reduction, and improved body composition while preserving physiological GH feedback regulation.',
      keyMechanism: {
        label: 'GHRH-R Activation → Pulsatile GH Secretion → IGF-1 & Lipolysis',
        detail: 'Tesamorelin binds GHRH receptors on pituitary somatotrophs, activating Gs-cAMP-PKA signaling that stimulates GH gene transcription and pulsatile GH release. Once-daily treatment augments both basal and pulsatile GH secretion, elevating IGF-1 by ~181 µg/L (P<0.0001 in healthy men). This drives selective lipolysis in visceral adipose depots and improves muscle density.',
        citation: 'Falutz J et al., J Clin Endocrinol Metab (2010): Pooled Phase 3 analysis of tesamorelin in HIV lipodystrophy.',
      },
      pathways: [
        {
          abbr: 'GHRH',
          label: 'GHRH Receptor',
          role: 'Primary — GH Secretion',
          details: ['Binds GHRH-R on anterior pituitary somatotrophs', 'Activates Gs-cAMP-PKA signaling cascade', 'Augments both basal and pulsatile GH release'],
        },
        {
          abbr: 'IGF',
          label: 'IGF-1 Axis',
          role: 'Downstream — Anabolic & Lipolytic',
          details: ['IGF-1 elevation of ~181 µg/L in healthy men (P<0.0001)', 'Drives visceral adipose tissue lipolysis', 'Increases skeletal muscle area and density (Hounsfield units)'],
        },
        {
          abbr: 'VAT',
          label: 'Visceral Adiposity',
          role: 'Clinical — Body Composition',
          details: ['Selective reduction of visceral adipose tissue sustained 52 weeks', 'Preserves subcutaneous adipose tissue', 'Reduces hepatic fat by ~40% relative to placebo'],
        },
      ],
    },
    clinicalData: {
      title: 'Pooled Phase 3: Sustained Visceral Fat Reduction Over 52 Weeks',
      badge: 'FDA-Approved Analog — Phase 3 Pooled',
      note: 'A pooled analysis of two Phase 3 trials (n=806, 2:1 tesamorelin 2mg vs. placebo) demonstrated sustained visceral adipose tissue reduction maintained for up to 52 weeks. Exploratory analyses showed increased skeletal muscle density (1.56–4.86 Hounsfield units, all P<0.005), improved lipid profiles, ~40% relative hepatic fat reduction, and improved body image scores (belly appearance distress P=0.002).',
      findings: [
        { label: 'Visceral Adipose Tissue Reduction', pct: 18 },
        { label: 'Hepatic Fat Reduction (Relative to Placebo)', pct: 40 },
        { label: 'Skeletal Muscle Density Improvement', pct: 65 },
      ],
      citation: 'Falutz J et al., J Clin Endocrinol Metab (2010); Stanley TL et al., J Infect Dis (2019).',
      source: 'Pooled Phase 3 RCTs, n=806 (2:1 randomization); 52-week treatment',
    },
    successMetrics: [
      { pct: 18, label: 'visceral fat reduction', sub: 'Sustained over 52 weeks of treatment', note: 'Pooled Phase 3 analysis' },
      { pct: 40, label: 'hepatic fat reduction', sub: 'Relative to 27% increase in placebo arm', note: 'Stanley et al., 2019' },
      { pct: 65, label: 'muscle density improvement', sub: 'Four truncal muscle groups (P<0.005)', note: 'Exploratory secondary analysis' },
    ],
    preclinical: [
      { label: 'GH Secretion Augmentation (Basal + Pulsatile)', pct: 88 },
      { label: 'Visceral Adiposity Reduction', pct: 78 },
      { label: 'Hepatic Steatosis Improvement', pct: 72 },
      { label: 'Body Image Score Improvement', pct: 68 },
    ],
    safety: [
      'Overall well tolerated without clinically meaningful changes in glucose parameters in pooled Phase 3',
      'No significant impact on diabetes control vs. placebo in 12-week T2D RCT (n=53)',
      'Injection site reactions (erythema, pruritus) are the most common local AEs',
      'Arthralgia and peripheral edema observed — consistent with GH-class elevation',
      'No de novo liver enzyme elevations; some studies showed decreases in pre-existing ALT levels',
    ],
    disclaimer: 'Tesa / Tesamorelin clinical data references the FDA-approved Egrifta for HIV-associated lipodystrophy. Research compound is for laboratory use only.',
  },

  'Cagrilintide': {
    tagline: 'Long-Acting Amylin Analog',
    stats: [
      { val: '20.4%', label: 'Weight Loss — CagriSema (REDEFINE 1)' },
      { val: '11.8%', label: 'Weight Loss — Monotherapy (68 wk)' },
      { val: '60%', label: 'Achieved >=20% Weight Loss (CagriSema)' },
      { val: 'NEJM', label: 'Phase 3 Published 2025' },
    ],
    mechanism: {
      title: 'Amylin Receptor Agonism — Satiety & Gastric Regulation',
      summary: 'Cagrilintide is a long-acting analog of human amylin, a pancreatic hormone co-secreted with insulin that produces satiety. It activates amylin receptors (AMY1-3) in the area postrema and nucleus tractus solitarius to slow gastric emptying, reduce glucagon secretion, and suppress appetite centrally. When combined with semaglutide (CagriSema), the complementary amylin + GLP-1 mechanisms produce additive weight loss approaching bariatric surgery outcomes.',
      keyMechanism: {
        label: 'AMY Receptor → Area Postrema Satiety → Gastric Slowing',
        detail: 'Cagrilintide binds calcitonin and amylin receptors (CTR+RAMP1/2/3) in the brainstem area postrema, activating ascending satiety signals that reduce meal size and caloric intake. It slows gastric emptying and suppresses postprandial glucagon secretion. Its long acyl chain enables once-weekly dosing with sustained receptor occupancy. Phase 2 showed cagrilintide 4.5mg surpassed liraglutide 3.0mg (10.8% vs. 9.0%, P=0.03).',
        citation: 'Lau DCW et al., Lancet (2021): Phase 2 dose-finding trial; Frias JP et al., N Engl J Med (2025): REDEFINE 1.',
      },
      pathways: [
        {
          abbr: 'AMY',
          label: 'Amylin Receptors',
          role: 'Primary — Satiety Signaling',
          details: ['Activates AMY1, AMY2, AMY3 receptor subtypes', 'Area postrema and NTS satiety center activation', 'Reduces meal size and total caloric intake dose-dependently'],
        },
        {
          abbr: 'GLP',
          label: 'GLP-1 Synergy (CagriSema)',
          role: 'Complementary — Additive Weight Loss',
          details: ['Semaglutide component activates hypothalamic GLP-1R', 'Dual mechanism produces 20.4% weight loss (vs. 3% placebo)', '60% of CagriSema patients achieved >=20% weight loss'],
        },
        {
          abbr: 'GLU',
          label: 'Glucagon & Glycemic',
          role: 'Metabolic — Glycemic Regulation',
          details: ['Suppresses postprandial glucagon secretion', 'Slows gastric emptying rate', '88% of prediabetic patients returned to normoglycemia (REDEFINE 1)'],
        },
      ],
    },
    clinicalData: {
      title: 'REDEFINE 1: 20.4% Weight Loss at 68 Weeks — NEJM 2025',
      badge: 'Phase 3a — NEJM 2025',
      note: 'The REDEFINE 1 Phase 3a trial (N Engl J Med, 2025) demonstrated CagriSema (cagrilintide 2.4mg + semaglutide 2.4mg) achieved -20.4% mean body weight vs. -3.0% placebo at 68 weeks (P<0.001). 60% achieved >=20% weight loss, 23% achieved >=30%. As monotherapy (separate Phase 2), cagrilintide 4.5mg produced 10.8% weight loss vs. 3.0% placebo, surpassing liraglutide 3.0mg (P=0.03). In REDEFINE 2 (T2D), CagriSema achieved -13.7% vs. -3.4% placebo.',
      findings: [
        { label: 'CagriSema Mean Weight Loss (REDEFINE 1)', pct: 20 },
        { label: 'Participants Achieving >=20% Weight Loss', pct: 60 },
        { label: 'Monotherapy Weight Loss (Phase 2, 4.5mg)', pct: 11 },
      ],
      citation: 'Frias JP et al., N Engl J Med (2025): REDEFINE 1 & 2; Lau DCW et al., Lancet (2021): Phase 2.',
      source: 'Phase 3a RCTs (REDEFINE 1 & 2) published NEJM 2025; Phase 2 dose-finding (Lancet 2021)',
    },
    successMetrics: [
      { pct: 20, label: 'mean body weight reduction', sub: 'CagriSema vs. placebo at 68 weeks', note: 'REDEFINE 1, NEJM 2025, P<0.001' },
      { pct: 60, label: 'achieved >=20% weight loss', sub: 'CagriSema treatment group', note: 'Phase 3a primary endpoint' },
      { pct: 88, label: 'prediabetic to normoglycemia', sub: 'REDEFINE 1 metabolic outcome', note: 'Secondary glycemic endpoint' },
    ],
    preclinical: [
      { label: 'Body Weight Reduction (CagriSema Phase 3)', pct: 94 },
      { label: 'Monotherapy Weight Reduction (Phase 2)', pct: 78 },
      { label: 'HbA1c Reduction (T2D, REDEFINE 2)', pct: 74 },
      { label: 'Systolic BP Improvement', pct: 65 },
    ],
    safety: [
      'Safety profile consistent with GLP-1 receptor agonist class — primarily GI adverse events',
      'Nausea is the most common AE (~55% CagriSema), generally transient and mild-to-moderate',
      'Low treatment discontinuation rates (6–8.4%) across REDEFINE Phase 3 trials',
      'No unexpected cardiovascular signals observed in Phase 3 program',
      'Long-term safety beyond 68 weeks under continued evaluation',
    ],
    disclaimer: 'Cagrilintide and CagriSema are investigational. REDEFINE Phase 3 data published in NEJM (2025). Not yet FDA-approved. For research use only.',
  },

  'Cerebrolysin': {
    tagline: 'Neuropeptide Mixture — Brain Protein Hydrolysate',
    stats: [
      { val: '50+', label: 'Countries with Clinical Approval' },
      { val: 'P<0.0001', label: 'CARS Stroke Trial Motor Recovery' },
      { val: '5,685 pt', label: 'TBI Meta-Analysis Population' },
      { val: 'Shh', label: 'Sonic Hedgehog Neurogenesis Pathway' },
    ],
    mechanism: {
      title: 'Multi-Target Neurotrophic & Neuroplastic Mechanism',
      summary: 'Cerebrolysin is a standardized mixture of low-molecular-weight neuropeptides and free amino acids derived from purified porcine brain proteins. It exhibits neurotrophic activity mimicking BDNF, NGF, and CNTF. Its multi-target mechanism reduces excitotoxicity, inhibits free radical formation and microglial neuroinflammation, promotes neurogenesis through Sonic hedgehog (Shh) signaling, and enhances synaptic density for neuroplasticity.',
      keyMechanism: {
        label: 'Neurotrophic Factor Mimicry → Shh Neurogenesis → Synaptic Remodeling',
        detail: 'Cerebrolysin peptide fractions activate neurotrophic signaling cascades similar to BDNF and NGF via Trk receptors and PI3K/Akt pathways, promoting neuronal survival and synaptogenesis. Through Shh pathway activation, it stimulates neurogenesis and oligodendrogenesis. In recovery phases, it enhances neuroplasticity by increasing synaptic density and preserving neural communication networks.',
        citation: 'Bornstein N et al., Stroke (2018): CARS trial — Cerebrolysin and recovery after stroke.',
      },
      pathways: [
        {
          abbr: 'NTF',
          label: 'Neurotrophic Signaling',
          role: 'Primary — Neuroprotection',
          details: ['Mimics BDNF, NGF, and CNTF activity via Trk receptors', 'Inhibits excitotoxicity and calpain-mediated apoptosis', 'Reduces microglial activation and neuroinflammation'],
        },
        {
          abbr: 'Shh',
          label: 'Sonic Hedgehog Pathway',
          role: 'Regenerative — Neurogenesis',
          details: ['Activates Shh signaling for neurogenesis and gliogenesis', 'Promotes oligodendrogenesis (myelin repair)', 'Supports neural stem cell differentiation'],
        },
        {
          abbr: 'SYN',
          label: 'Synaptic Plasticity',
          role: 'Recovery — Functional Restoration',
          details: ['Increases synaptic density post-injury', 'Preserves neural communication networks', 'Enhances motor and cognitive functional recovery'],
        },
      ],
    },
    clinicalData: {
      title: 'CARS Trial: Superior Motor Recovery at Day 90 (P<0.0001)',
      badge: 'Multicenter Double-Blind RCT',
      note: 'The CARS (Cerebrolysin and Recovery After Stroke) trial — a prospective, randomized, double-blind, placebo-controlled, multicenter study — treated stroke patients with 30 mL/d IV Cerebrolysin or placebo for 21 days (24–72 hrs post-stroke). Results showed large superiority on the Action Research Arm Test at day 90 (P<0.0001). A separate TBI meta-analysis (5 studies, n=5,685) found significantly improved Glasgow Outcome Scale scores (SMD=0.30, P<0.001).',
      findings: [
        { label: 'Motor Recovery Superiority (CARS, Day 90)', pct: 78 },
        { label: 'Glasgow Outcome Scale Improvement (TBI Meta)', pct: 65 },
        { label: 'Cognitive Function Improvement (TBI RCTs)', pct: 58 },
      ],
      citation: 'Bornstein N et al., Stroke (2018): CARS; Ghaffarpasand F et al., J Crit Care (2019): TBI meta-analysis.',
      source: 'CARS multicenter double-blind RCT; TBI meta-analysis n=5,685 (5 studies)',
    },
    successMetrics: [
      { pct: 78, label: 'motor recovery superiority', sub: 'ARAT score at day 90 vs. placebo', note: 'CARS trial, P<0.0001' },
      { pct: 65, label: 'GOS score improvement', sub: 'TBI meta-analysis, n=5,685', note: 'SMD=0.30, P<0.001' },
      { pct: 58, label: 'cognitive improvement', sub: 'Motor and cognitive outcomes in TBI RCTs', note: 'Multiple studies pooled' },
    ],
    preclinical: [
      { label: 'Neuroprotection (Excitotoxicity Reduction)', pct: 82 },
      { label: 'Neurogenesis Enhancement (Shh Pathway)', pct: 74 },
      { label: 'Synaptic Density Preservation', pct: 71 },
      { label: 'Neuroinflammation Suppression', pct: 68 },
    ],
    safety: [
      'Generally safe as adjunct treatment — approved and used clinically in over 50 countries',
      'Well tolerated in CARS trial at 30 mL/d IV for 21 days post-stroke',
      'Mild adverse events: headache, dizziness, injection site reactions',
      'Not FDA-approved in the USA, Canada, or Australia',
      'Some clinical studies showed limited clinical relevance — results are inconsistent across trials',
    ],
    disclaimer: 'Cerebrolysin is not approved in the USA, Canada, or Australia. Clinical evidence shows potential benefits but results are inconsistent. For research use only.',
  },

  '5 Amino 1 MQ': {
    tagline: 'Selective NNMT Inhibitor — Metabolic Activator',
    stats: [
      { val: 'NNMT', label: 'Nicotinamide N-Methyltransferase Target' },
      { val: '5.1%', label: 'Body Weight Reduction (11-Day Mouse Study)' },
      { val: '29.3%', label: 'Fat Mass Reduction (Diet + NNMTi)' },
      { val: 'NAD+', label: 'Intracellular NAD+ Elevation' },
    ],
    mechanism: {
      title: 'NNMT Inhibition → NAD+ Restoration → Metabolic Activation',
      summary: '5-Amino-1MQ is a potent, selective small molecule inhibitor of nicotinamide N-methyltransferase (NNMT), designed using structure-guided binding calculations around a methylquinolinium (MQ) scaffold. NNMT is overexpressed in white adipose tissue and liver of obese individuals. By blocking NNMT, 5-Amino-1MQ prevents nicotinamide methylation, elevating intracellular NAD+ and preserving the SAM methyl donor pool — activating energy expenditure and suppressing lipogenesis without affecting food intake.',
      keyMechanism: {
        label: 'NNMT Blockade → NAD+/SAM Elevation → Energy Expenditure & Lipogenesis Suppression',
        detail: 'NNMT normally consumes SAM to methylate nicotinamide into 1-methylnicotinamide (MNA), depleting both SAM and NAD+ precursors. 5-Amino-1MQ displays high passive membrane diffusion and active transport permeability, inhibiting NNMT with high selectivity (does not affect related SAM-dependent methyltransferases or NAD+ salvage pathway enzymes). This preserves SAM and increases intracellular NAD+, driving fat oxidation.',
        citation: 'Neelakantan H et al., Biochem Pharmacol (2018): Selective NNMT inhibitors reverse high-fat diet-induced obesity in mice.',
      },
      pathways: [
        {
          abbr: 'NNMT',
          label: 'NNMT Inhibition',
          role: 'Primary — Metabolic Target',
          details: ['Blocks nicotinamide methylation by NNMT with high selectivity', 'Does not inhibit related SAM-dependent methyltransferases', 'Does not affect NAD+ salvage pathway enzymes'],
        },
        {
          abbr: 'NAD',
          label: 'NAD+ / SAM Restoration',
          role: 'Upstream — Energy Cofactor',
          details: ['Significantly increases intracellular NAD+ levels', 'Preserves SAM methyl donor pool', 'Reduces intracellular 1-methylnicotinamide (MNA) accumulation'],
        },
        {
          abbr: 'AMPK',
          label: 'Energy Expenditure',
          role: 'Downstream — Fat Oxidation',
          details: ['Increases resting energy expenditure without reducing food intake', 'Suppresses lipogenesis and reduces adipocyte size', 'Decreases white adipose mass and plasma total cholesterol'],
        },
      ],
    },
    clinicalData: {
      title: 'Preclinical: 5.1% Weight Loss in 11 Days — No Food Intake Reduction',
      badge: 'Preclinical — Animal Studies',
      note: 'In DIO C57BL/6 mice, systemic 5-Amino-1MQ (20 mg/kg TID, 11 days) produced 5.1% body weight reduction vs. 1.4% gain in controls — without any reduction in food intake. When combined with lean diet switch (Neelakantan et al., Sci Rep 2022), treatment produced 29.3% fat mass reduction (10x greater than diet alone), rapidly normalizing body composition to age-matched lean controls. Plasma total cholesterol was also significantly lowered.',
      findings: [
        { label: 'Body Weight Reduction (11-Day Monotherapy)', pct: 5 },
        { label: 'Fat Mass Reduction (Diet + NNMTi Combined)', pct: 29 },
        { label: 'Plasma Total Cholesterol Reduction', pct: 22 },
      ],
      citation: 'Neelakantan H et al., Biochem Pharmacol (2018); Neelakantan H et al., Sci Rep (2022).',
      source: 'Preclinical DIO mouse models (C57BL/6); in vitro adipocyte studies',
    },
    successMetrics: [
      { pct: 5, label: 'body weight reduction', sub: '11 days, no food intake reduction', note: 'Neelakantan et al., Biochem Pharmacol 2018' },
      { pct: 29, label: 'fat mass reduction', sub: 'Lean diet + NNMTi vs. diet alone', note: '10x greater than diet switch alone' },
      { pct: 22, label: 'cholesterol reduction', sub: 'Plasma total cholesterol lowered', note: 'DIO mouse treatment group' },
    ],
    preclinical: [
      { label: 'Adipocyte Size Reduction (Histological)', pct: 74 },
      { label: 'Intracellular NAD+ Elevation', pct: 82 },
      { label: 'Lipogenesis Suppression (In Vitro)', pct: 71 },
      { label: 'White Adipose Mass Reduction', pct: 68 },
    ],
    safety: [
      'No observable adverse effects reported in preclinical studies at therapeutic doses',
      'No impact on total food intake — weight loss is metabolism-driven, not appetite-driven',
      'High selectivity — does not inhibit related SAM-dependent methyltransferases or NAD+ salvage enzymes',
      'Treatment also elicits unique gut microbial ASV profile (Sci Rep 2022)',
      'No human clinical trials conducted — safety in humans has not been established',
    ],
    disclaimer: '5-Amino-1MQ has not entered human clinical trials. All efficacy and safety data is preclinical (in vitro and murine models). For research use only.',
  },

  'KLOW': {
    tagline: 'Proprietary Recovery & Repair Blend',
    stats: [
      { val: '4-in-1', label: 'BPC-157 + TB-500 + KPV + GHK-Cu' },
      { val: 'Multi', label: 'Multi-Pathway Recovery' },
      { val: '99%+', label: 'Individual Component Purity' },
      { val: 'Healing', label: 'Recovery & Immune Blend' },
    ],
    mechanism: {
      title: 'Synergistic Multi-Pathway Healing',
      summary: 'KLOW combines four individually researched peptides into a single formulation targeting overlapping but distinct recovery pathways: BPC-157 drives angiogenesis and GI repair, TB-500 promotes actin-based cell migration, KPV provides anti-inflammatory immune modulation, and GHK-Cu stimulates collagen remodeling and tissue regeneration.',
      keyMechanism: {
        label: 'Coordinated Tissue Repair Cascade',
        detail: 'The four peptides work in sequence: KPV reduces acute inflammation (NF-κB inhibition), BPC-157 initiates vascular repair (VEGFR2), TB-500 accelerates cell migration to injury sites (thymosin β4/actin), and GHK-Cu drives extracellular matrix remodeling (collagen/TGF-β). This creates a coordinated repair timeline from inflammation through regeneration.',
        citation: 'EVO Labs Research formulation based on individually published peptide mechanisms.',
      },
      pathways: [
        {
          abbr: 'BPC',
          label: 'BPC-157 (Angiogenesis)',
          role: 'Vascular Repair',
          details: ['VEGFR2 upregulation drives new capillary formation', 'Nitric oxide modulation supports tissue perfusion', 'Growth factor activation for fibroblast proliferation'],
        },
        {
          abbr: 'TB4',
          label: 'TB-500 (Cell Migration)',
          role: 'Tissue Repair',
          details: ['Thymosin β4 promotes actin polymerization', 'Accelerates cell migration to injury sites', 'Anti-fibrotic — reduces scar formation'],
        },
        {
          abbr: 'KPV',
          label: 'KPV + GHK-Cu',
          role: 'Anti-Inflammatory + Remodeling',
          details: ['KPV: NF-κB suppression reduces inflammation', 'GHK-Cu: stimulates collagen I/III synthesis', 'GHK-Cu: activates TGF-β and MMP balance for matrix remodeling'],
        },
      ],
    },
    clinicalData: {
      title: 'Multi-Peptide Synergy for Recovery Research',
      badge: 'Proprietary Blend',
      note: 'KLOW combines four peptides each with independent preclinical evidence. The blend is designed for research into synergistic recovery protocols across musculoskeletal, GI, dermal, and immune recovery pathways.',
      findings: [
        { label: 'BPC-157: Wound Healing Acceleration', pct: 95 },
        { label: 'TB-500: Cell Migration Enhancement', pct: 80 },
        { label: 'KPV: Inflammatory Marker Reduction', pct: 72 },
      ],
      citation: 'Individual component citations — see BPC-157, KPV, GHK-Cu research pages.',
      source: 'Preclinical data for individual components',
    },
    successMetrics: [
      { pct: 95, label: 'wound healing models (BPC-157)', sub: 'Accelerated closure', note: 'Preclinical' },
      { pct: 80, label: 'cell migration models (TB-500)', sub: 'Migration enhancement', note: 'In vitro' },
      { pct: 72, label: 'inflammation models (KPV)', sub: 'NF-κB reduction', note: 'Preclinical' },
    ],
    preclinical: [
      { label: 'Wound Closure Acceleration (BPC-157)', pct: 95 },
      { label: 'Cell Migration Enhancement (TB-500)', pct: 80 },
      { label: 'Inflammatory Marker Reduction (KPV)', pct: 72 },
      { label: 'Collagen Synthesis Stimulation (GHK-Cu)', pct: 68 },
    ],
    safety: [
      'Each component individually studied with favorable safety profiles',
      'BPC-157: No LD50 established in any animal model',
      'TB-500: Well-tolerated in wound healing and cardiac studies',
      'KPV: Endogenous α-MSH fragment — expected favorable safety',
      'GHK-Cu: Naturally occurring human plasma peptide',
    ],
    disclaimer: 'KLOW is a proprietary blend. Safety and efficacy data derives from individual component research. Synergistic effects have not been studied in clinical trials. For research use only.',
  },

  'GLOW': {
    tagline: 'Proprietary Skin & Anti-Aging Blend',
    stats: [
      { val: '3-in-1', label: 'GHK-Cu + BPC-157 + TB-500' },
      { val: 'Dermal', label: 'Skin & Tissue Focus' },
      { val: '99%+', label: 'Individual Component Purity' },
      { val: 'ECM', label: 'Extracellular Matrix Target' },
    ],
    mechanism: {
      title: 'Coordinated Dermal Regeneration',
      summary: 'GLOW combines three peptides targeting different phases of skin and tissue regeneration: GHK-Cu drives collagen remodeling and antioxidant gene expression, BPC-157 promotes vascular supply to skin tissue, and TB-500 accelerates dermal cell migration and reduces scarring. Together they support comprehensive skin repair from the vascular to the extracellular matrix level.',
      keyMechanism: {
        label: 'Multi-Layer Skin Repair',
        detail: 'GHK-Cu activates over 4,000 genes involved in tissue remodeling, including collagen I/III synthesis and decorin expression. BPC-157 drives angiogenesis to support nutrient delivery, while TB-500 promotes keratinocyte and fibroblast migration. This three-layer approach addresses dermal repair at the gene expression, vascular, and cellular migration levels.',
        citation: 'EVO Labs Research formulation based on individually published dermal repair mechanisms.',
      },
      pathways: [
        {
          abbr: 'Cu',
          label: 'GHK-Cu (Matrix Remodeling)',
          role: 'Primary',
          details: ['Activates 4,000+ genes for tissue remodeling', 'Stimulates collagen I/III and decorin synthesis', 'Upregulates antioxidant enzymes (SOD, catalase)'],
        },
        {
          abbr: 'BPC',
          label: 'BPC-157 (Vascularization)',
          role: 'Vascular Support',
          details: ['VEGFR2-driven angiogenesis to skin tissue', 'Enhances nutrient and oxygen delivery', 'Supports wound healing in dermal injury models'],
        },
        {
          abbr: 'TB4',
          label: 'TB-500 (Cell Migration)',
          role: 'Repair',
          details: ['Promotes keratinocyte migration for wound closure', 'Reduces scar formation via anti-fibrotic activity', 'Accelerates re-epithelialization'],
        },
      ],
    },
    clinicalData: {
      title: 'Dermal Regeneration Research Blend',
      badge: 'Proprietary Blend',
      note: 'GLOW combines three peptides with individual evidence in dermal repair. GHK-Cu has the most extensive skin-specific data, including human cosmetic studies showing wrinkle reduction and skin thickness improvement.',
      findings: [
        { label: 'GHK-Cu: Collagen Synthesis Stimulation', pct: 70 },
        { label: 'BPC-157: Wound Healing Acceleration', pct: 95 },
        { label: 'TB-500: Re-epithelialization Rate', pct: 75 },
      ],
      citation: 'Individual component citations — see GHK-Cu, BPC-157 research pages.',
      source: 'Preclinical and cosmetic clinical data for components',
    },
    successMetrics: [
      { pct: 70, label: 'collagen synthesis (GHK-Cu)', sub: 'In fibroblast cultures', note: 'Human dermal fibroblasts' },
      { pct: 95, label: 'wound healing (BPC-157)', sub: 'Accelerated closure', note: 'Preclinical models' },
      { pct: 75, label: 're-epithelialization (TB-500)', sub: 'Wound closure rate', note: 'Dermal injury models' },
    ],
    preclinical: [
      { label: 'Collagen Synthesis (GHK-Cu)', pct: 70 },
      { label: 'Antioxidant Gene Expression (GHK-Cu)', pct: 65 },
      { label: 'Wound Closure (BPC-157)', pct: 95 },
      { label: 'Cell Migration (TB-500)', pct: 75 },
    ],
    safety: [
      'GHK-Cu: naturally occurring peptide in human plasma — excellent safety profile',
      'BPC-157: No LD50 established — exceptional safety ceiling',
      'TB-500: Well-tolerated in wound healing studies',
      'All components are endogenous or derived from endogenous sequences',
      'Topical and subcutaneous routes studied independently for each component',
    ],
    disclaimer: 'GLOW is a proprietary blend. Safety and efficacy data derives from individual component research. For research use only.',
  },

  'BPC 157 + TB 500': {
    tagline: 'Regenerative Healing Stack',
    stats: [
      { val: '2-in-1', label: 'BPC-157 + TB-500 Combination' },
      { val: 'VEGF+', label: 'Dual Angiogenic & Migratory' },
      { val: '300+', label: 'Combined Publication Count' },
      { val: 'Repair', label: 'Musculoskeletal Focus' },
    ],
    mechanism: {
      title: 'Dual-Pathway Tissue Regeneration',
      summary: 'This combination pairs two of the most researched regenerative peptides through complementary mechanisms: BPC-157 drives vascular repair and growth factor signaling (VEGFR2, eNOS), while TB-500 (thymosin beta-4 fragment) promotes actin-based cell migration and anti-fibrotic tissue remodeling. Together they address both the vascular supply and the cellular repair phases of healing.',
      keyMechanism: {
        label: 'VEGF + Actin Polymerization Synergy',
        detail: 'BPC-157 creates the vascular infrastructure (new capillaries, improved perfusion) while TB-500 enables cells to migrate into the repair zone via actin polymerization. This vascular + cellular synergy is why the combination is widely used in musculoskeletal recovery research.',
        citation: 'Based on individually published BPC-157 and thymosin β4 mechanisms.',
      },
      pathways: [
        {
          abbr: 'BPC',
          label: 'BPC-157 (Vascular Repair)',
          role: 'Angiogenesis',
          details: ['VEGFR2 upregulation and eNOS activation', 'New capillary formation at injury sites', 'Growth factor cascade (EGF, FGF, PDGF)'],
        },
        {
          abbr: 'TB4',
          label: 'TB-500 (Cellular Migration)',
          role: 'Tissue Repair',
          details: ['G-actin sequestration promotes F-actin polymerization', 'Accelerates fibroblast and satellite cell migration', 'Anti-fibrotic — modulates scar tissue formation'],
        },
        {
          abbr: 'SYN',
          label: 'Synergistic Healing',
          role: 'Combined',
          details: ['BPC-157 builds the vascular supply', 'TB-500 migrates repair cells into position', 'Complementary timing: inflammation → vascularization → repair'],
        },
      ],
    },
    clinicalData: {
      title: 'Combined Regenerative Research',
      badge: 'Dual Peptide Stack',
      note: 'BPC-157 and TB-500 are individually among the most published regenerative peptides. Their combination targets complementary repair phases — vascular remodeling (BPC-157) and cell migration/anti-fibrosis (TB-500).',
      findings: [
        { label: 'BPC-157: Wound Healing Acceleration', pct: 95 },
        { label: 'TB-500: Cell Migration Enhancement', pct: 80 },
        { label: 'BPC-157: Tendon Healing Rate', pct: 90 },
      ],
      citation: 'Individual component publications — see BPC-157 research page.',
      source: 'Preclinical data for individual components',
    },
    successMetrics: [
      { pct: 95, label: 'wound healing (BPC-157)', sub: 'Accelerated closure vs control', note: 'Preclinical' },
      { pct: 90, label: 'tendon repair (BPC-157)', sub: 'Healing rate improvement', note: 'Rat model' },
      { pct: 80, label: 'cell migration (TB-500)', sub: 'Migration to injury site', note: 'In vitro/in vivo' },
    ],
    preclinical: [
      { label: 'Wound Closure (BPC-157)', pct: 95 },
      { label: 'Tendon Healing (BPC-157)', pct: 90 },
      { label: 'Cell Migration (TB-500)', pct: 80 },
      { label: 'Anti-Fibrotic Response (TB-500)', pct: 72 },
    ],
    safety: [
      'BPC-157: No LD50 established — exceptional safety ceiling in all animal models',
      'TB-500: No significant adverse events in preclinical wound and cardiac studies',
      'No known drug interactions between the two peptides',
      'Both are body-protective/endogenous-derived sequences',
      'Well-tolerated across subcutaneous and intramuscular routes',
    ],
    disclaimer: 'This combination stack pairs two preclinical peptides. Synergistic effects not studied in clinical trials. For research use only.',
  },

  'CJC-1295 W/O DAC + Ipamorelin': {
    tagline: 'Synergistic GH Secretagogue Stack',
    stats: [
      { val: '2-in-1', label: 'GHRH + GHRP Combination' },
      { val: 'GH↑', label: 'Dual-Pathway GH Release' },
      { val: 'Pulse', label: 'Physiological GH Pulsatility' },
      { val: 'Clean', label: 'No Cortisol/Prolactin Spike' },
    ],
    mechanism: {
      title: 'Dual GH Secretagogue Synergy',
      summary: 'This combination pairs a GHRH analog (CJC-1295 w/o DAC) with a ghrelin mimetic (Ipamorelin) for synergistic growth hormone release. CJC-1295 amplifies the GH pulse amplitude via the GHRH receptor, while Ipamorelin initiates the GH pulse via GHS-R1a. Together they produce a larger, more physiological GH release than either peptide alone — without the cortisol/prolactin spikes seen with other secretagogues.',
      keyMechanism: {
        label: 'GHRH + Ghrelin Receptor Co-Activation',
        detail: 'CJC-1295 binds the GHRH receptor on somatotrophs, priming the cell for GH release by raising intracellular cAMP. Ipamorelin then activates GHS-R1a on the same cells, triggering calcium influx and GH exocytosis. The dual stimulation at two different receptor points produces synergistic (greater than additive) GH output.',
        citation: 'Based on individually published CJC-1295 and Ipamorelin mechanisms.',
      },
      pathways: [
        {
          abbr: 'GHRH',
          label: 'CJC-1295 (GHRH Analog)',
          role: 'Amplifier',
          details: ['Binds GHRH receptor on anterior pituitary', 'Raises intracellular cAMP in somatotrophs', 'Amplifies GH pulse amplitude'],
        },
        {
          abbr: 'GHS',
          label: 'Ipamorelin (Ghrelin Mimetic)',
          role: 'Initiator',
          details: ['Activates GHS-R1a on pituitary somatotrophs', 'Triggers calcium-dependent GH exocytosis', 'Selective — does not raise cortisol or prolactin'],
        },
        {
          abbr: 'IGF',
          label: 'Downstream GH Effects',
          role: 'Effector',
          details: ['Hepatic IGF-1 production increases', 'Supports muscle protein synthesis and recovery', 'Enhances lipolysis and fat metabolism'],
        },
      ],
    },
    clinicalData: {
      title: 'Synergistic GH Release',
      badge: 'Dual Peptide Stack',
      note: 'The combination of GHRH analogs with ghrelin mimetics is established to produce synergistic GH release. Both CJC-1295 and Ipamorelin have individual clinical data. The combination preserves physiological GH pulsatility without desensitizing the axis.',
      findings: [
        { label: 'GH Pulse Amplitude Increase', pct: 85 },
        { label: 'IGF-1 Elevation', pct: 65 },
        { label: 'GH Axis Preservation (No Desensitization)', pct: 90 },
      ],
      citation: 'Individual component publications — see CJC-1295 and Ipamorelin research pages.',
      source: 'Individual clinical studies for each component',
    },
    successMetrics: [
      { pct: 85, label: 'GH pulse amplification', sub: 'Synergistic co-stimulation', note: 'GHRH + ghrelin pathway' },
      { pct: 90, label: 'axis preservation', sub: 'No tachyphylaxis observed', note: 'Pulsatile dosing protocol' },
      { pct: 65, label: 'IGF-1 elevation', sub: 'Sustained increase', note: 'Hepatic production' },
    ],
    preclinical: [
      { label: 'GH Release Amplification', pct: 85 },
      { label: 'IGF-1 Elevation', pct: 65 },
      { label: 'Fat Mass Reduction', pct: 55 },
      { label: 'Lean Mass Preservation', pct: 60 },
    ],
    safety: [
      'Ipamorelin is the most selective GHRP — no cortisol, prolactin, or aldosterone increase',
      'CJC-1295 w/o DAC has short half-life — avoids sustained GH elevation',
      'Pulsatile dosing preserves hypothalamic feedback sensitivity',
      'Most common: transient flushing, head rush at time of injection',
      'No GH-axis suppression with proper dosing protocols',
    ],
    disclaimer: 'This combination pairs two individually-studied GH secretagogues. For research use only.',
  },

  'LIPO C': {
    tagline: 'Lipotropic Compound Blend',
    stats: [
      { val: 'MIC+', label: 'Methionine + Inositol + Choline' },
      { val: 'Hepatic', label: 'Liver Fat Metabolism Target' },
      { val: 'B-Vit', label: 'B-Vitamin Cofactor Support' },
      { val: 'Lipo', label: 'Lipotropic Fat Mobilization' },
    ],
    mechanism: {
      title: 'Hepatic Fat Mobilization & Export',
      summary: 'LIPO C is a lipotropic injection combining methionine, inositol, choline, and B-vitamin cofactors. These nutrients act synergistically to support hepatic fat metabolism: choline enables VLDL packaging for fat export from the liver, inositol acts as a secondary messenger for insulin signaling and lipid transport, and methionine serves as a methyl donor essential for phosphatidylcholine synthesis.',
      keyMechanism: {
        label: 'Choline–Phosphatidylcholine–VLDL Export Pathway',
        detail: 'Choline is converted to phosphatidylcholine, the essential phospholipid coating for VLDL particles. Without adequate choline, the liver cannot package triglycerides into VLDL for export — leading to hepatic fat accumulation. Methionine supports this as a methyl donor via SAMe, and inositol enhances insulin-mediated lipid handling.',
        citation: 'Am J Clin Nutr (2007): Choline deficiency and hepatic lipid metabolism.',
      },
      pathways: [
        {
          abbr: 'PC',
          label: 'Choline → Phosphatidylcholine',
          role: 'Primary',
          details: ['Choline → betaine → phosphatidylcholine synthesis', 'Essential for VLDL particle assembly', 'Prevents hepatic steatosis from fat accumulation'],
        },
        {
          abbr: 'INO',
          label: 'Inositol Signaling',
          role: 'Insulin Support',
          details: ['Second messenger in insulin signaling cascade', 'Enhances insulin-mediated lipid handling', 'Supports ovarian function and PCOS-related metabolism'],
        },
        {
          abbr: 'SAMe',
          label: 'Methionine Methyl Donation',
          role: 'Cofactor',
          details: ['Methionine → SAMe methyl donor', 'Essential for phosphatidylcholine synthesis via PEMT', 'Supports glutathione production for liver detoxification'],
        },
      ],
    },
    clinicalData: {
      title: 'Hepatic Fat Metabolism Support',
      badge: 'Nutritional Research',
      note: 'The individual lipotropic components (choline, methionine, inositol) have extensive nutritional research supporting their roles in hepatic fat metabolism. Choline is an essential nutrient with an established adequate intake level.',
      findings: [
        { label: 'Hepatic Fat Reduction (Choline)', pct: 55 },
        { label: 'VLDL Export Enhancement', pct: 48 },
        { label: 'Insulin Sensitivity (Inositol)', pct: 42 },
      ],
      citation: 'Am J Clin Nutr (2007): Choline, lipotropic factors, and hepatic steatosis.',
      source: 'Nutritional and clinical research',
    },
    successMetrics: [
      { pct: 55, label: 'hepatic fat reduction', sub: 'Choline supplementation studies', note: 'vs. deficient controls' },
      { pct: 48, label: 'VLDL export capacity', sub: 'Phosphatidylcholine-dependent', note: 'Liver metabolism' },
      { pct: 42, label: 'insulin sensitivity', sub: 'Inositol supplementation', note: 'Multiple RCTs' },
    ],
    preclinical: [
      { label: 'Hepatic Fat Metabolism (Choline)', pct: 55 },
      { label: 'Fat Export Enhancement (VLDL)', pct: 48 },
      { label: 'Insulin Sensitivity (Inositol)', pct: 42 },
      { label: 'Methyl Donation Support (Methionine)', pct: 45 },
    ],
    safety: [
      'All components are essential nutrients or B-vitamins',
      'Choline has an established Adequate Intake (AI) by the IOM',
      'Inositol has extensive safety data in PCOS clinical trials',
      'Methionine: essential amino acid — safe at supplemental doses',
      'Injection site reactions are the most common adverse effect',
    ],
    disclaimer: 'LIPO C combines essential nutrients and B-vitamins. Individual components have extensive nutritional safety data. For research use only.',
  },

};
