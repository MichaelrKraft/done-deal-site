'use client';

import { motion } from 'framer-motion';

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

const featuredTestimonial = {
  quote: "We've been using Done-Deal for over a year and I'm still impressed that AI does a better job than a live TC.",
  name: 'Danny Temus',
};

export default function Partners() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#00BEFF] font-semibold uppercase tracking-wider">
            OUR PARTNERS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Used by some of the top agents in the Country
          </h2>
        </div>

        {/* Partners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-3xl mx-auto">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <h3 className="text-xl font-bold text-[#00BEFF]">{partner.name}</h3>
              <p className="text-gray-400">{partner.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Featured Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <p className="text-2xl md:text-3xl text-white font-light italic mb-6">
              &quot;{featuredTestimonial.quote}&quot;
            </p>
            <p className="text-[#00BEFF] font-semibold">{featuredTestimonial.name}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
