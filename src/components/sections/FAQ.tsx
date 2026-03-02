'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'How does Done Deal help agencies convert more leads into customers?',
    answer: 'Our AI-powered chatbots instantly engage, qualify, and convert leads into appointments through human-like conversations and follow-ups.',
  },
  {
    question: 'What languages can the AI speak?',
    answer: 'The AI can speak English, French, German, Spanish, Italian, Portuguese, Dutch, Swedish, Danish, Norwegian (Bokmål and Nynorsk), Icelandic, Finnish, Catalan, Galician, Afrikaans, and Faroese.',
  },
  {
    question: 'Is Done Deal compatible with Go High Level CRM?',
    answer: 'Yes, Done Deal seamlessly integrates with Go High Level CRM, allowing you to streamline your lead conversion process. We provide a step-by-step process of integrating your customized AI chatbots into your GHL lead flows.',
  },
  {
    question: "Can I customize the chatbot to match my brand's voice and style?",
    answer: "Absolutely, Done Deal offers complete customization, enabling you to tailor the chatbot's responses and interactions to align with your brand.",
  },
  {
    question: 'What industries can benefit from using Done Deal?',
    answer: 'Done Deal caters to a wide range of industries, including SMMA owners, Pay Per Lead specialists, and AI Automation Agencies, while also catering to individual service business owners. Solar, Law, Real Estate, Medical, Finance/Insurance are just a few examples.',
  },
  {
    question: 'How quickly can I set up Done Deal for my agency?',
    answer: 'Setting up Done Deal is quick and easy. Within minutes, you can customize your chatbot, integrate it with Go High Level, and start converting leads.',
  },
  {
    question: "Can I charge clients for using Done Deal's lead conversion services?",
    answer: "Definitely! Many agencies charge their clients for integrating Done Deal's lead conversion services, creating a new revenue stream. (Set up fees or monthly retainers)",
  },
  {
    question: 'Does Done Deal offer support for technical setup and customization?',
    answer: 'Yes, our support team is here to assist you with any technical setup or customization questions you may have along the way.',
  },
  {
    question: 'How can Done Deal help me differentiate my agency from competitors?',
    answer: 'By offering cutting-edge AI-powered lead conversion, you can set your agency apart, impress clients, and demonstrate your commitment to innovation.',
  },
  {
    question: 'What results can I expect from using Done Deal for my agency?',
    answer: 'Agencies that use Done Deal typically experience increased lead conversion rates, improved customer engagement, and higher ROI on their lead generation efforts.',
  },
  {
    question: 'Is there a trial period available for Done Deal?',
    answer: 'Yes, we offer a free 14 day trial period depending on the plan, that allows you to experience the benefits of Done Deal first hand before making any commitment.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#00BEFF] font-semibold uppercase tracking-wider">
            QUERIES
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Got Questions? We&apos;ve
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-[#00BEFF]">
            Got Answers
          </h3>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border border-white/10 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="font-semibold text-white pr-4">{faq.question}</span>
                <span
                  className={`text-[#00BEFF] text-2xl transition-transform ${
                    openIndex === index ? 'rotate-45' : ''
                  }`}
                >
                  +
                </span>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 text-gray-400 bg-black/50">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
