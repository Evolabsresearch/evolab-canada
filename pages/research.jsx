import { useState, useMemo } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { products, RESEARCH_DATA, CATEGORIES, getCategoryConfig } from '../lib/data';

const CATEGORIES_RESEARCH = [
  {
    id: 'healing',
    label: 'Tissue Repair & Healing',
    icon: '🩹',
    color: '#E8F5EE',
    accent: '#16a34a',
    compounds: ['BPC-157', 'TB-500', 'BPC 157 + TB 500', 'GHK-CU', 'KPV', 'Thymosin Alpha', 'SNAP-8'],
    summary: 'Peptides studied for accelerated tissue regeneration, wound healing, and anti-inflammatory effects.',
    mechanism: 'These peptides interact with growth factor receptors and cytokine pathways to upregulate collagen synthesis, angiogenesis, and cellular migration at injury sites.',
    studies: [
      { title: 'BPC-157 in tendon and muscle healing', journal: 'J Physiol Pharmacol', year: '2018', finding: 'Accelerated tendon-to-bone healing in rodent models. Promoted fibroblast migration and collagen organization.' },
      { title: 'TB-500 (Thymosin β4) in cardiac repair', journal: 'J Mol Cell Cardiol', year: '2019', finding: 'Reduced infarct size and improved cardiac function post-ischemia. Promotes cardiomyocyte survival and angiogenesis.' },
      { title: 'GHK-Cu and wound healing gene expression', journal: 'Cosmetics', year: '2015', finding: 'Modulates 4,000+ human genes. Upregulates collagen, elastin, and anti-oxidant enzymes. Accelerates wound contraction.' },
      { title: 'KPV anti-inflammatory action in gut', journal: 'Inflammatory Bowel Diseases', year: '2006', finding: 'Significantly reduced mucosal inflammation in IBD models. Acts via direct inhibition of NF-κB signaling pathway.' },
    ],
  },
  {
    id: 'growth',
    label: 'Growth Hormone Axis',
    icon: '📈',
    color: '#E8F3FF',
    accent: '#2563eb',
    compounds: ['HGH 191aa', 'CJC-1295 W/O DAC', 'Ipamorelin', 'CJC-1295 W/O DAC + Ipamorelin', 'IGF-1LR3', 'Kisspeptin', 'Tesa'],
    summary: 'Peptides targeting the hypothalamic-pituitary-somatotropic axis to modulate growth hormone secretion and IGF-1 activity.',
    mechanism: 'GHRHs and ghrelin mimetics stimulate anterior pituitary somatotrophs. IGF-1 mediates downstream anabolic effects in muscle, bone, and connective tissue.',
    studies: [
      { title: 'CJC-1295 + Ipamorelin combined GH release', journal: 'J Clin Endocrinol Metab', year: '2006', finding: 'CJC-1295 demonstrated sustained GH elevation for 6 days post-administration. Dose-dependent IGF-1 increase of 28–72%.' },
      { title: 'Ipamorelin selectivity for GH secretion', journal: 'J Endocrinol', year: '1998', finding: 'Selectively stimulates GH release without affecting cortisol, prolactin, or ACTH. Considered the most selective GHRP studied.' },
      { title: 'IGF-1 LR3 in muscle protein synthesis', journal: 'Endocrinology', year: '2001', finding: '2.5x longer half-life vs native IGF-1 due to reduced binding protein affinity. Enhanced lean mass accretion in rodent models.' },
      { title: 'Recombinant HGH 191aa bioequivalence', journal: 'Horm Res Paediatr', year: '2016', finding: 'Identical biological activity to pituitary-derived GH. Activates JAK2/STAT5 signaling; promotes GH receptor dimerization.' },
    ],
  },
  {
    id: 'metabolic',
    label: 'Metabolic & GLP Research',
    icon: '🔥',
    color: '#FFF6E8',
    accent: '#ea580c',
    compounds: ['GLP 3 (R)', 'GLP 2 (T)', 'GLP 1 (S)', 'KLOW', 'MOTS-C', 'Cagrilintide', '5 Amino 1 MQ', 'LIPO C', 'MT-2 (Melanotan II)', 'PT-141'],
    summary: 'GLP receptor agonists and metabolic modulators studied for body composition, glucose homeostasis, and energy expenditure.',
    mechanism: 'GLP-1 and GLP-2 receptor agonists activate cAMP/PKA pathways. Amylin analogs modulate central appetite circuits. NNMT inhibitors redirect methyl group metabolism.',
    studies: [
      { title: 'Semaglutide-class GLP-1 in obesity research', journal: 'N Engl J Med', year: '2021', finding: 'GLP-1 class peptides demonstrated 14.9% mean body weight reduction in clinical research. Dose-dependent appetite suppression via hypothalamic GLP-1 receptors.' },
      { title: 'Tirzepatide dual GIP/GLP-1 agonism', journal: 'N Engl J Med', year: '2022', finding: '20.9% mean weight reduction. Superior to single-receptor agonists, suggesting additive metabolic effects through dual receptor co-activation.' },
      { title: 'MOTS-C mitochondrial peptide and metabolism', journal: 'Cell Metab', year: '2015', finding: 'MOTS-C activates AMPK pathway, increases fatty acid oxidation. Exercise-regulated peptide linking mitochondrial function to systemic metabolism.' },
      { title: 'Cagrilintide + semaglutide combination', journal: 'Lancet', year: '2021', finding: 'Combination CagriSema showed 17.1% weight reduction vs 9.8% semaglutide alone at 20 weeks. Complementary mechanisms synergize.' },
    ],
  },
  {
    id: 'longevity',
    label: 'Longevity & Cellular Health',
    icon: '🧬',
    color: '#EEE8FA',
    accent: '#7c3aed',
    compounds: ['Epithalon', 'NAD+', 'SS31', 'Glutathione', 'MOTS-C'],
    summary: 'Peptides and compounds studied for telomere biology, mitochondrial function, and cellular senescence pathways.',
    mechanism: 'Epithalon activates telomerase. NAD+ supports sirtuins and PARPs in DNA repair. SS-31 concentrates in inner mitochondrial membrane, reducing ROS generation and protecting cristae architecture.',
    studies: [
      { title: 'Epithalon telomerase activation', journal: 'Bull Exp Biol Med', year: '2003', finding: 'Activated telomerase in somatic cells. Extended telomere length in aged subjects. Reduced markers of biological aging over 2-year follow-up in Russian research.' },
      { title: 'NAD+ supplementation and aging hallmarks', journal: 'Cell Metab', year: '2020', finding: 'NAD+ repletion activates SIRT1/SIRT3, reduces mitochondrial dysfunction, and extends healthspan in aging models. Oral bioavailability confirmed via NMN/NR conversion.' },
      { title: 'SS-31 (Elamipretide) mitochondrial protection', journal: 'J Am Coll Cardiol', year: '2020', finding: 'Selectively concentrates in inner mitochondrial membrane. Reduces superoxide generation, preserves ATP production under ischemic stress.' },
      { title: 'Glutathione and oxidative stress reduction', journal: 'Eur J Nutr', year: '2014', finding: 'Oral and IV glutathione supplementation significantly elevated lymphocyte GSH levels. Enhanced natural killer cell cytotoxicity and immune function markers.' },
    ],
  },
  {
    id: 'cognitive',
    label: 'Cognitive & Neuropeptides',
    icon: '🧠',
    color: '#E8EFF9',
    accent: '#1d4ed8',
    compounds: ['Semax', 'Selank', 'DSIP', 'Cerebrolysin', 'Pinealon'],
    summary: 'Synthetic neuropeptides and brain-derived factors studied for neuroplasticity, neuroprotection, and cognitive function.',
    mechanism: 'Semax upregulates BDNF and NGF expression. Selank modulates enkephalinase activity, influencing anxiety circuits. Cerebrolysin provides neurotrophic peptide fragments identical to endogenous CNS signals.',
    studies: [
      { title: 'Semax BDNF elevation and neuroprotection', journal: 'J Neurochem', year: '2009', finding: 'Single dose of Semax elevated hippocampal BDNF by 40%. Demonstrated neuroprotective effects in ischemic stroke and cognitive decline models.' },
      { title: 'Selank anxiolytic vs benzodiazepine mechanism', journal: 'Pharmacol Biochem Behav', year: '2012', finding: 'Comparable anxiolytic efficacy to diazepam without sedation or dependence. Modulates serotonin and dopamine turnover in limbic system.' },
      { title: 'Cerebrolysin in Alzheimer\'s disease research', journal: 'CNS Drugs', year: '2015', finding: 'Significant improvement in ADAS-Cog scores vs placebo. Neurotrophic peptide mixture activates growth factor signaling cascades in surviving neurons.' },
      { title: 'DSIP sleep architecture modulation', journal: 'Sleep', year: '1989', finding: 'Promotes delta-wave (slow-wave) sleep phase. Reduces cortisol and stress response markers. Used in European clinical practice for sleep disorders.' },
    ],
  },
];

const HOW_WE_TEST = [
  {
    step: '01',
    title: 'Raw Material Verification',
    desc: 'Every incoming batch is quarantined and sampled before it ever enters inventory. We verify identity, initial purity estimate, and absence of gross contaminants.',
    icon: '📦',
  },
  {
    step: '02',
    title: 'HPLC Chromatography',
    desc: 'High-Performance Liquid Chromatography separates and quantifies every molecular component present in the sample. This confirms concentration and detects any synthesis byproducts.',
    icon: '📊',
  },
  {
    step: '03',
    title: 'Mass Spectrometry Confirmation',
    desc: 'LC-MS/MS confirms the exact molecular mass and fragmentation pattern matches the target peptide. This is the gold standard for unambiguous identity confirmation.',
    icon: '⚗️',
  },
  {
    step: '04',
    title: 'Net Purity & Content Verification',
    desc: 'Gravimetric analysis confirms every vial contains the exact labeled net content. Combined with HPLC net purity data, this ensures what\'s on the label matches what\'s in the vial — no short-fills or discrepancies.',
    icon: '⚖️',
  },
  {
    step: '05',
    title: 'Independent Third-Party Review',
    desc: 'All testing is conducted by Janoshik Analytical (Prague, Czech Republic) — one of the most trusted independent testing labs in the research compound industry since 2013. We are also implementing testing with Kovera Labs (Illinois, USA) for domestic third-party verification.',
    icon: '🏛️',
  },
  {
    step: '06',
    title: 'Public COA Publication',
    desc: 'The complete Certificate of Analysis — HPLC chromatogram, mass spec report, purity percentage, and batch number — is published in our public COA Library before the product goes on sale.',
    icon: '📋',
  },
];

const GLOSSARY = [
  { term: 'HPLC', def: 'High-Performance Liquid Chromatography. Separates mixture components to identify and quantify each compound present. The industry standard for purity testing.' },
  { term: 'Mass Spectrometry', def: 'Measures the mass-to-charge ratio of ions to confirm molecular identity. Combined with HPLC (LC-MS/MS), it is the definitive test for peptide confirmation.' },
  { term: 'Lyophilization', def: 'Freeze-drying process that removes water from peptides under vacuum. Produces a stable powder that resists degradation far longer than liquid form.' },
  { term: 'Net Content', def: 'The verified amount of active compound in each vial, confirmed by precision gravimetric analysis. Ensures the labeled quantity (e.g. 5mg, 10mg) matches the actual fill — critical for accurate research dosing.' },
  { term: 'Reconstitution', def: 'Adding a solvent (typically bacteriostatic water) to a lyophilized peptide to create a solution for research use. Follow the COA or product sheet for specific ratios.' },
  { term: 'Half-Life', def: 'Time for plasma concentration of a peptide to decrease by 50%. Important for dosing interval planning in research protocols.' },
  { term: 'COA', def: 'Certificate of Analysis. A document from an analytical laboratory confirming the identity, purity, and quantity of a substance. EVO Labs publishes the full COA for every batch.' },
  { term: 'Peptide Bond', def: 'The covalent bond (-CO-NH-) linking amino acids in a peptide chain. Formed by condensation reaction between the carboxyl group of one amino acid and the amino group of the next.' },
];

// Products that have full research data profiles
const RESEARCH_PRODUCTS = products.filter(p => RESEARCH_DATA[p.name]);

export default function ResearchPage() {
  const [activeCategory, setActiveCategory] = useState('healing');
  const [openGloss, setOpenGloss] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const activeData = CATEGORIES_RESEARCH.find(c => c.id === activeCategory);

  const filteredResearchProducts = useMemo(() => {
    return RESEARCH_PRODUCTS.filter(p => {
      const matchesSearch = search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (RESEARCH_DATA[p.name]?.tagline || '').toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCat = filterCat === 'all' || p.category === filterCat;
      return matchesSearch && matchesCat;
    });
  }, [search, filterCat]);

  const researchCategories = useMemo(() => {
    const cats = [...new Set(RESEARCH_PRODUCTS.map(p => p.category))];
    return cats;
  }, []);

  return (
    <Layout
      title="Peptide Research Library | EVO Labs Research"
      description="Explore the science behind every compound. Mechanism of action, peer-reviewed study references, testing methodology, and a full research glossary — all in one place."
    >
      {/* ── PAGE HERO ─────────────────────────────────────────── */}
      <section style={{ background: '#0a0a0a', padding: '80px 0 72px' }}>
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, fontFamily: "'Poppins', sans-serif" }}>
            Science &amp; Research
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 20 }}>
            The Science Behind<br />
            <span style={{ color: '#4ade80' }}>Every Compound</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', maxWidth: 560, lineHeight: 1.8, marginBottom: 44 }}>
            Every peptide we carry has a documented research history. Explore mechanism of action, peer-reviewed study summaries, and our step-by-step testing methodology — before you buy.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/products" className="btn-primary" style={{ padding: '13px 28px', fontSize: 14 }}>
              Browse All Compounds →
            </Link>
            <Link href="/coa" className="btn-secondary" style={{ padding: '12px 26px', fontSize: 14, borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
              View COA Library
            </Link>
          </div>
        </div>
      </section>

      {/* ── RESEARCH STATS BAR ────────────────────────────────── */}
      <section style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '28px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }} className="stats-scroll">
            {[
              { val: '200+', label: 'Peer-Reviewed Studies Referenced' },
              { val: '48+', label: 'Compounds in Catalog' },
              { val: '5', label: 'Research Categories' },
              { val: '99%+', label: 'Purity — Every Batch' },
              { val: '6-Step', label: 'Independent Testing Protocol' },
            ].map((s, i) => (
              <div key={i} style={{ flex: '0 0 auto', padding: '0 36px', borderRight: i < 4 ? '1px solid #f0f0f0' : 'none', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', fontFamily: "'Poppins', sans-serif" }}>{s.val}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, whiteSpace: 'nowrap', fontFamily: "'Poppins', sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT RESEARCH GRID ─────────────────────────────── */}
      <section style={{ padding: '72px 0 80px', background: '#fff' }}>
        <div className="container">
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1B4D3E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Poppins', sans-serif" }}>
              Research Profiles
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 16 }}>
              Explore Compound Research
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7 }}>
              Each compound below has a full research profile — mechanism of action, clinical data, preclinical findings, and safety notes. Click "View Research" on any compound to explore.
            </p>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 700, margin: '0 auto' }}>
              <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <circle cx="9" cy="9" r="6" stroke="#9ca3af" strokeWidth="1.5"/>
                  <path d="M14 14l3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search compounds..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 16px 11px 40px',
                    border: '1.5px solid #e5e7eb', borderRadius: 9999,
                    fontSize: 14, fontFamily: "'Poppins', sans-serif",
                    outline: 'none', background: '#f9fafb', color: '#0a0a0a',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
                style={{
                  padding: '11px 20px', border: '1.5px solid #e5e7eb', borderRadius: 9999,
                  fontSize: 14, fontFamily: "'Poppins', sans-serif",
                  background: '#f9fafb', color: '#374151', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="all">All Categories</option>
                {researchCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredResearchProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 15 }}>
              No compounds match your search.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
              {filteredResearchProducts.map(p => {
                const cat = getCategoryConfig(p.category);
                const rd = RESEARCH_DATA[p.name];
                return (
                  <div
                    key={p.id}
                    style={{
                      background: '#fff',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: 24,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                  >
                    {/* Card image area */}
                    <div style={{
                      background: '#ffffff',
                      aspectRatio: '1/1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      padding: 0,
                      overflow: 'hidden',
                    }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                      />
                      {/* Category badge */}
                      <div style={{
                        position: 'absolute', top: 14, left: 14,
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: 9999,
                        padding: '3px 10px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: cat?.accentColor || '#1B4D3E',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontFamily: "'Poppins', sans-serif",
                      }}>
                        {p.category.split(' ')[0]}
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'center' }}>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#0a0a0a', lineHeight: 1.2, marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, fontStyle: 'italic' }}>{rd.tagline}</div>
                      </div>

                      {/* Mini stats — centered */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, marginTop: 8, justifyContent: 'center' }}>
                        {rd.stats.slice(0, 2).map((s, i) => (
                          <div key={i} style={{
                            background: cat?.color || '#f3f4f6',
                            borderRadius: 8,
                            padding: '6px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: '1 1 0',
                          }}>
                            <span style={{ fontSize: 13, fontWeight: 900, color: cat?.accentColor || '#1B4D3E', lineHeight: 1.1 }}>{s.val}</span>
                            <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3, textAlign: 'center', maxWidth: 90 }}>{s.label}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: 'auto' }}>
                        <Link
                          href={`/products/${p.slug}#research`}
                          style={{
                            display: 'block',
                            textAlign: 'center',
                            padding: '12px 20px',
                            background: cat?.accentColor || '#1B4D3E',
                            color: '#fff',
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 700,
                            textDecoration: 'none',
                            fontFamily: "'Poppins', sans-serif",
                            letterSpacing: '0.01em',
                            transition: 'opacity 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          View Research →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── RESEARCH BY CATEGORY ─────────────────────────────── */}
      <section className="section" style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1B4D3E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Poppins', sans-serif" }}>
              Research Library
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 16 }}>
              Research by Compound Category
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Select a research area to explore mechanism of action, featured compounds, and peer-reviewed study summaries.
            </p>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
            {CATEGORIES_RESEARCH.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 9999, fontSize: 14, fontWeight: 500,
                  fontFamily: "'Poppins', sans-serif",
                  background: activeCategory === cat.id ? '#131315' : cat.color,
                  color: activeCategory === cat.id ? '#fff' : '#374151',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Active category content */}
          {activeData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 48, alignItems: 'start' }} className="research-layout">

              {/* Left: overview + compound list */}
              <div>
                <div style={{ background: activeData.color, borderRadius: 24, padding: '32px 28px', marginBottom: 24 }}>
                  <span style={{ fontSize: 40, marginBottom: 16, display: 'block' }}>{activeData.icon}</span>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0a', marginBottom: 12, lineHeight: 1.2 }}>{activeData.label}</h3>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 20 }}>{activeData.summary}</p>
                  <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: '16px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: "'Poppins', sans-serif" }}>Mechanism of Action</div>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{activeData.mechanism}</p>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: "'Poppins', sans-serif" }}>
                    Compounds in This Category
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {activeData.compounds.map(name => {
                      const p = products.find(prod => prod.name === name);
                      return p ? (
                        <Link
                          key={name}
                          href={`/products/${p.slug}#research`}
                          style={{
                            padding: '6px 14px', borderRadius: 9999,
                            background: '#f3f4f6', color: '#374151',
                            fontSize: 13, fontWeight: 500,
                            textDecoration: 'none',
                            border: '1px solid #e5e7eb',
                            transition: 'all 0.2s',
                            fontFamily: "'Poppins', sans-serif",
                            display: 'inline-block',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#131315'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#131315'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                        >
                          {name}
                        </Link>
                      ) : (
                        <span key={name} style={{ padding: '6px 14px', borderRadius: 9999, background: '#f3f4f6', color: '#9ca3af', fontSize: 13, border: '1px solid #e5e7eb', fontFamily: "'Poppins', sans-serif" }}>{name}</span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: study cards */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: '#f0fdf4', border: '1px solid #dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontFamily: "'Poppins', sans-serif" }}>
                    ✓ Peer-Reviewed
                  </span>
                  Featured Study Summaries
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {activeData.studies.map((study, i) => (
                    <div key={i} style={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 20,
                      padding: '24px 24px 22px',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0px 4px 12.5px 0px rgba(151,201,143,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0a', lineHeight: 1.4 }}>{study.title}</h4>
                        <span style={{ flexShrink: 0, background: activeData.color, color: activeData.accent, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, fontFamily: "'Poppins', sans-serif" }}>
                          {study.year}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12, fontStyle: 'italic', fontFamily: "'Poppins', sans-serif" }}>
                        Published in: <em>{study.journal}</em>
                      </div>
                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.8, borderLeft: `3px solid ${activeData.accent}`, paddingLeft: 14 }}>
                        {study.finding}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 24, background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 20 }}>⚠️</span>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
                    Study summaries are for educational purposes. All referenced research was conducted in controlled laboratory or clinical settings. EVO Labs products are for in vitro research use only.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW WE TEST ──────────────────────────────────────── */}
      <section className="section" style={{ background: '#0a0a0a' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, fontFamily: "'Poppins', sans-serif" }}>
              Our Process
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>
              How We Test Every Batch
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Six mandatory steps before a product ever ships. No exceptions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="testing-grid">
            {HOW_WE_TEST.map((step, i) => (
              <div key={i} style={{
                background: '#141414',
                border: '1px solid #1f1f1f',
                borderRadius: 20,
                padding: '28px 24px',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#4ade80'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1f1f1f'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>{step.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', fontFamily: "'Poppins', sans-serif", letterSpacing: '0.05em' }}>STEP {step.step}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/coa" className="btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
              View Published COAs →
            </Link>
          </div>
        </div>
      </section>

      {/* ── OUR TESTING PARTNERS ─────────────── */}
      <section className="section" style={{ background: '#f9fafb', borderTop: '1px solid #f0f0f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1B4D3E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, fontFamily: "'Poppins', sans-serif" }}>
              Who Tests Our Products
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16 }}>
              Our Testing Partners
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
              We work with established, independent laboratories that have no financial relationship to EVO Labs. Every COA you see on our site comes directly from these labs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 900, margin: '0 auto' }} className="labs-grid">
            {/* Janoshik */}
            <div style={{
              background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 24, padding: '36px 32px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                display: 'inline-block', fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#f0fdf4',
                border: '1px solid #dcfce7', padding: '3px 10px', borderRadius: 9999,
                fontFamily: "'Poppins', sans-serif", marginBottom: 16,
              }}>
                Primary Lab
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0a', marginBottom: 4, letterSpacing: '-0.01em' }}>
                Janoshik Analytical
              </h3>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20, fontFamily: "'Poppins', sans-serif" }}>
                Prague, Czech Republic &middot; Est. 2013
              </p>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, marginBottom: 20 }}>
                Janoshik Analytical has been one of the most trusted independent testing laboratories in the research compound industry for over a decade. Founded in 2013 and formally incorporated as Janoshik S.R.O. in 2022, they specialize in peptide, SARM, and compound verification with a team of ~30 analytical chemists.
              </p>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, marginBottom: 24 }}>
                Widely regarded as the gold standard for independent third-party testing, Janoshik has built their reputation through years of consistent, reliable results validated by blind community testing. Their reports are referenced in published research and global drug survey data.
              </p>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 12, fontFamily: "'Poppins', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Testing Methods
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['HPLC (UV 214nm)', 'LC-MS/MS', 'GC-MS'].map(m => (
                    <span key={m} style={{
                      fontSize: 11, fontWeight: 600, color: '#1B4D3E', background: '#f0fdf4',
                      padding: '4px 12px', borderRadius: 9999, fontFamily: "'Poppins', sans-serif",
                    }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Kovera Labs */}
            <div style={{
              background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 24, padding: '36px 32px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                display: 'inline-block', fontSize: 10, fontWeight: 700, color: '#2563eb', background: '#eff6ff',
                border: '1px solid #dbeafe', padding: '3px 10px', borderRadius: 9999,
                fontFamily: "'Poppins', sans-serif", marginBottom: 16,
              }}>
                Coming Soon
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0a', marginBottom: 4, letterSpacing: '-0.01em' }}>
                Kovera Labs
              </h3>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20, fontFamily: "'Poppins', sans-serif" }}>
                Illinois, USA
              </p>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, marginBottom: 20 }}>
                We are implementing Kovera Labs as a domestic third-party testing partner based in Illinois. Adding a US-based laboratory gives us faster turnaround times and a second independent verification layer for every batch.
              </p>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, marginBottom: 24 }}>
                Dual-lab verification means our compounds will be independently tested by two separate laboratories in two different countries — providing an additional level of confidence that the results on every COA are accurate and reproducible.
              </p>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 12, fontFamily: "'Poppins', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Testing Methods
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['HPLC', 'Mass Spectrometry', 'Net Content Verification'].map(m => (
                    <span key={m} style={{
                      fontSize: 11, fontWeight: 600, color: '#1e40af', background: '#eff6ff',
                      padding: '4px 12px', borderRadius: 9999, fontFamily: "'Poppins', sans-serif",
                    }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT MAKES A RESEARCH GRADE PEPTIDE ─────────────── */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="grade-split">
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1B4D3E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, fontFamily: "'Poppins', sans-serif" }}>
                Quality Standards
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 24 }}>
                What Makes a<br />
                <span style={{ color: '#1B4D3E' }}>Research-Grade Peptide?</span>
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, marginBottom: 24 }}>
                Not all peptides are equal. Research-grade means the compound has been verified for identity, purity, and absence of contaminants by methods that are auditable and reproducible.
              </p>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8 }}>
                The difference between a 95% pure and a 99%+ pure peptide isn't just 4% — it's the difference between reproducible data and noise. Impurities can trigger off-target biological responses that confound research results entirely.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { grade: 'Research Grade', purity: '99%+', test: 'HPLC + MS + Net Content', coa: 'Full public COA', color: '#f0fdf4', accent: '#16a34a', badge: 'EVO Labs Standard' },
                { grade: 'Standard Grade', purity: '95–98%', test: 'HPLC only', coa: 'Partial or internal', color: '#fff7ed', accent: '#ea580c', badge: 'Common Competitor' },
                { grade: 'Raw Powder', purity: '< 95%', test: 'Unverified', coa: 'Often unavailable', color: '#fef2f2', accent: '#dc2626', badge: 'Not Research Ready' },
              ].map((row, i) => (
                <div key={i} style={{ background: row.color, borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0a', marginBottom: 6 }}>{row.grade}</div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Purity: <strong style={{ color: '#0a0a0a' }}>{row.purity}</strong></span>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Testing: <strong style={{ color: '#0a0a0a' }}>{row.test}</strong></span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>COA: {row.coa}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: row.accent, background: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 9999, whiteSpace: 'nowrap', fontFamily: "'Poppins', sans-serif" }}>
                    {row.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESEARCH GLOSSARY ─────────────────────────────────── */}
      <section className="section" style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1B4D3E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Poppins', sans-serif" }}>
              Reference
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
              Research Glossary
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxWidth: 900, margin: '0 auto' }} className="glossary-grid">
            {GLOSSARY.map((item, i) => (
              <div
                key={i}
                onClick={() => setOpenGloss(openGloss === i ? null : i)}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 16,
                  padding: '18px 22px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0a' }}>{item.term}</span>
                  <span style={{ fontSize: 18, color: '#9ca3af', transition: 'transform 0.2s', transform: openGloss === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </div>
                {openGloss === i && (
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                    {item.def}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ background: '#1B4D3E', padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Research Backed. Purity Verified.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Every compound in our catalog has a published COA, documented research history, and ships from our Toronto, ON facility.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/products"
              style={{ background: '#fff', color: '#1B4D3E', padding: '15px 36px', borderRadius: 9999, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontFamily: "'Poppins', sans-serif" }}
            >
              Shop All Compounds →
            </Link>
            <Link href="/coa"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '15px 36px', borderRadius: 9999, fontSize: 15, fontWeight: 600, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontFamily: "'Poppins', sans-serif" }}
            >
              View COA Library
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .research-layout { grid-template-columns: 1fr !important; }
          .testing-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .grade-split { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 768px) {
          .testing-grid { grid-template-columns: 1fr !important; }
          .labs-grid { grid-template-columns: 1fr !important; }
          .glossary-grid { grid-template-columns: 1fr !important; }
          .stats-scroll { gap: 0 !important; }
        }
      `}</style>
    </Layout>
  );
}
