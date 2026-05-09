'use client';

import AnimatedSection from '@/components/AnimatedSection';

const partners = [
  {
    name: 'Jonathan Hayes',
    title: 'Licensed Realtor at Coldwell Banker Realty',
  },
  {
    name: 'Michelle Alvarez',
    title: 'Real Estate Broker Associate at Keller Williams',
  },
];

export default function Partners() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="text-[#00BEFF] font-semibold uppercase tracking-wider">
            OUR PARTNERS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Used by some of the top agents in the Country
          </h2>
        </AnimatedSection>

        {/* Partners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-3xl mx-auto">
          {partners.map((partner, index) => (
            <AnimatedSection
              key={index}
              delay={index * 0.2}
              className="text-center"
            >
              <h3 className="text-xl font-bold text-[#00BEFF]">{partner.name}</h3>
              <p className="text-gray-400">{partner.title}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
