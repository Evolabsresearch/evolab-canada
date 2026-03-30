// Redirect /faq → /about#faq
export async function getServerSideProps() {
  return { redirect: { destination: '/about#faq', permanent: true } };
}

export default function FAQRedirect() {
  return null;
}
