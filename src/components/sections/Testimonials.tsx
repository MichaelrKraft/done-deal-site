'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "I've cut my coordination costs by more than half. Done Deal handles everything from contract to close—no need to hire extra staff.",
    name: "Mark Ellis",
    title: "RE Agent, Compass Realty",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote: "Done Deal moves faster than any TC I've worked with. Documents, deadlines, and follow-ups are all automated and spot-on.",
    name: "Ashley Romero",
    title: "Broker, Keller Williams",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    quote: "I love knowing I can check in on my files anytime, day or night. The 24/7 access is a huge win.",
    name: "Ethan Brooks",
    title: "Realtor, Century 21",
    image: "https://randomuser.me/api/portraits/men/51.jpg",
  },
  {
    quote: "With automated reminders and tracking, I haven't missed a single compliance deadline. No human error, just results.",
    name: "Nina Park",
    title: "Agent, eXp Realty",
    image: "https://randomuser.me/api/portraits/women/35.jpg",
  },
  {
    quote: "Done Deal keeps every transaction 100% compliant. It's like having a legal assistant in my back pocket.",
    name: "Luis Grant",
    title: "Managing Broker, RealtyOne",
    image: "https://randomuser.me/api/portraits/men/21.jpg",
  },
  {
    quote: "We scaled from 5 to 20 closings a month without adding headcount. Done Deal made it effortless.",
    name: "Tessa Lane",
    title: "Team Lead, Sotheby's",
    image: "https://randomuser.me/api/portraits/women/30.jpg",
  },
  {
    quote: "My clients stay informed through every step. They love the transparency, and I love the time it saves me.",
    name: "Derrick Moore",
    title: "Agent, Coldwell Banker",
    image: "https://randomuser.me/api/portraits/men/74.jpg",
  },
  {
    quote: "I customized the workflow to fit how my team operates. It feels like we built it ourselves.",
    name: "Janine Watts",
    title: "Broker Associate, RE/MAX",
    image: "https://randomuser.me/api/portraits/women/62.jpg",
  },
  {
    quote: "Admin work used to eat my week. Now it's all handled in the background. I'm finally back to selling full time.",
    name: "Isaac Reynolds",
    title: "Agent, Better Homes",
    image: "https://randomuser.me/api/portraits/men/66.jpg",
  },
  {
    quote: "The analytics help me spot where deals get stuck. We've improved every step of our pipeline thanks to the data insights.",
    name: "Lydia Chase",
    title: "RE Agent, Realty Partners",
    image: "https://randomuser.me/api/portraits/women/16.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#00BEFF] font-semibold uppercase tracking-wider">
            TESTIMONIALS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Why Brokers can&apos;t stop talking
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-[#00BEFF]">
            about Done-Deal.ai
          </h3>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Explore the experiences of top Brokers using Done-Deal for seamless
            transaction coordination and appointment setting.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#00BEFF]/50 transition-colors"
            >
              {/* Stars */}
              <div className="text-yellow-400 mb-4">★★★★★</div>

              {/* Quote */}
              <p className="text-gray-300 mb-6">{testimonial.quote}</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
