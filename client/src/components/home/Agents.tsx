import { Phone, Mail, MapPin } from "lucide-react";

const agents = [
  {
    name: "Ahmad Rahman",
    title: "Senior Property Consultant",
    image: "/default-agent.jpg",
    phone: "+62 812-3456-7890",
    email: "ahmad@salambumi.com",
    experience: "15+ tahun",
    specialization: "Residential & Commercial"
  }
];

export function Agents() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Tim Property Expert Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Bertahun-tahun pengalaman dalam industri properti Yogyakarta
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {agents.map((agent, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{agent.name}</h3>
                  <p className="text-lg text-blue-600 font-medium mb-4">{agent.title}</p>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Dengan pengalaman {agent.experience} di industri properti, spesialis dalam {agent.specialization}.
                    Siap membantu Anda menemukan properti yang sesuai dengan kebutuhan dan budget.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-2 text-blue-600" />
                      {agent.phone}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-5 h-5 mr-2 text-blue-600" />
                      {agent.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}