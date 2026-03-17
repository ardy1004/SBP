import { motion } from 'framer-motion';
import { Phone, Mail, Award, Users, TrendingUp, Star } from 'lucide-react';

const agents = [
  {
    id: 1,
    name: "Ahmad Rahman",
    position: "Senior Property Consultant",
    specialization: "Luxury Villas & Commercial",
    experience: "8+ years",
    deals: "150+ properties sold",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    phone: "+62 812-3456-7890",
    email: "ahmad@salambumiproperty.com",
    achievements: ["Top Seller 2023", "Luxury Specialist", "Client Satisfaction Award"]
  },
  {
    id: 2,
    name: "Sari Dewi",
    position: "Property Investment Advisor",
    specialization: "Residential & Investment",
    experience: "6+ years",
    deals: "120+ properties sold",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    phone: "+62 811-2345-6789",
    email: "sari@salambumiproperty.com",
    achievements: ["Investment Expert", "Rising Star 2024", "5-Star Rating"]
  },
  {
    id: 3,
    name: "Budi Santoso",
    position: "Commercial Property Specialist",
    specialization: "Office & Retail Spaces",
    experience: "10+ years",
    deals: "200+ properties sold",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    phone: "+62 813-4567-8901",
    email: "budi@salambumiproperty.com",
    achievements: ["Commercial King", "10 Years Award", "Perfect Rating"]
  },
  {
    id: 4,
    name: "Maya Putri",
    position: "Residential Property Expert",
    specialization: "Homes & Apartments",
    experience: "7+ years",
    deals: "130+ properties sold",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    phone: "+62 814-5678-9012",
    email: "maya@salambumiproperty.com",
    achievements: ["Home Specialist", "Client Favorite", "Trust Builder"]
  }
];

export default function AgentShowcaseV2() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-6">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-semibold text-sm">TIM AHLI KAMI</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Bertemu dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Tim Expert</span> Kami
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tim profesional berpengalaman yang siap membantu mewujudkan impian properti Anda
            dengan pelayanan terbaik dan pengetahuan mendalam pasar properti Yogyakarta.
          </p>
        </motion.div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              {/* Agent Image */}
              <div className="relative">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold text-gray-800">{agent.rating}</span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {agent.experience}
                </div>
              </div>

              {/* Agent Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{agent.name}</h3>
                <p className="text-blue-600 font-semibold mb-2">{agent.position}</p>
                <p className="text-gray-600 text-sm mb-4">{agent.specialization}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-gray-900">{agent.deals}</div>
                    <div className="text-xs text-gray-600">Transaksi</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-gray-900">{agent.rating}</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Pencapaian:</h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.achievements.map((achievement, i) => (
                      <span
                        key={i}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                      >
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="flex gap-2">
                  <a
                    href={`tel:${agent.phone}`}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  <a
                    href={`mailto:${agent.email}`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white text-center"
        >
          <h3 className="text-3xl font-bold mb-8">Tim Kami Dalam Angka</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">4</div>
              <div className="text-blue-100">Expert Agents</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">600+</div>
              <div className="text-blue-100">Properties Sold</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-blue-100">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">31+</div>
              <div className="text-blue-100">Years Combined Experience</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}