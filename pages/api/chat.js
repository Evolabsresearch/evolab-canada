import Anthropic from '@anthropic-ai/sdk';
import { products, CATEGORIES, FAQS, CONTACT } from '../../lib/data';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Build product catalog context
const productCatalog = products.map(p => {
  const parts = [`${p.name} — ${p.category}`];
  if (p.price) parts.push(`Price: ${p.price}`);
  if (p.salePrice) parts.push(`Sale: ${p.salePrice}`);
  if (p.outOfStock) parts.push('(OUT OF STOCK)');
  if (p.description) parts.push(p.description);
  parts.push(`URL: /products/${p.slug}`);
  return parts.join(' | ');
}).join('\n');

const categoryList = CATEGORIES.map(c => c.name).join(', ');

const faqContext = FAQS.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n');

const SYSTEM_PROMPT = `You are the EVO Labs Research AI assistant — a knowledgeable, professional, and friendly chatbot embedded on the EVO Labs Research website. You help customers with product questions, ordering, shipping, and general support.

CRITICAL RULES:
- ALL products are FOR RESEARCH USE ONLY. Never suggest or imply human consumption, medical use, or dosing for humans.
- If asked about dosing, administration, or personal use, politely redirect: "Our products are strictly for research purposes. We cannot provide guidance on human use. Please consult published research literature for protocol information."
- Be concise — keep responses under 3-4 sentences unless the question requires detail.
- When recommending products, always include the product page link as /products/[slug].
- Be warm and helpful, but maintain professionalism.

COMPANY INFO:
- Email: ${CONTACT.email}
- Phone: ${CONTACT.phone}
- Address: ${CONTACT.address}, ${CONTACT.city}
- Hours: ${CONTACT.hours}
- Free shipping on orders $250+
- Ships from Toronto, Ontario, Canada
- Every batch independently tested by Janoshik Analytical (Prague, est. 2013) via HPLC + mass spectrometry
- 99%+ purity guaranteed
- COA (Certificate of Analysis) available for every product at /coa

PRODUCT CATEGORIES: ${categoryList}

PRODUCT CATALOG:
${productCatalog}

FAQ KNOWLEDGE:
${faqContext}

When you don't know something specific, direct customers to email ${CONTACT.email} or call ${CONTACT.phone}.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Chat is not configured yet. Please add ANTHROPIC_API_KEY to your environment variables.' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Limit conversation history to last 20 messages to control costs
  const trimmed = messages.slice(-20);

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: trimmed,
    });

    const text = response.content[0]?.text || 'Sorry, I could not generate a response.';
    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
