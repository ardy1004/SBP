import { ArrowRight, Bed, Bath, Maximize, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Link } from "wouter";

const properties = [
  {
    id: 1,
    title: "Modern Minimalist Tropical House",
    location: "Sleman, Yogyakarta",
    price: "Rp 2.5 M",
    type: "Rumah",
    image: "https://images.salambumi.xyz/modern_minimalist_house_exterior_with_garden.png",
    specs: { beds: 3, baths: 2, area: "150m²" },
    tag: "Exclusive"
  },
  {
    id: 2,
    title: "Luxury Apartment City View",
    location: "Depok, Yogyakarta",
    price: "Rp 1.8 M",
    type: "Apartment",
    image: "https://images.salambumi.xyz/luxury_apartment_living_room_interior.png",
    specs: { beds: 2, baths: 1, area: "85m²" },
    tag: "New Launch"
  },
  {
    id: 3,
    title: "Premium Commercial Ruko",
    location: "Seturan, Yogyakarta",
    price: "Rp 3.2 M",
    type: "Ruko",
    image: "https://images.salambumi.xyz/commercial_modern_ruko_building_exterior.png",
    specs: { beds: 0, baths: 2, area: "200m²" },
    tag: "Best Value"
  }
];

export function FeaturedProperties() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6" data-aos="fade-up">
          <div className="space-y-4">
            <span className="text-primary font-semibold tracking-wider text-sm uppercase">Featured Listings</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Properti Pilihan Terbaik</h2>
          </div>
          <Link href="/properties">
            <Button variant="outline" className="rounded-full group">
              Lihat Semua Properti
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop, idx) => (
            <Link key={prop.id} href={`/property/${prop.id}`}>
              <Card
                className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white cursor-pointer h-full flex flex-col"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={prop.image}
                    alt={prop.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-foreground hover:bg-white backdrop-blur-sm shadow-sm">{prop.type}</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-primary text-white hover:bg-primary border-none">{prop.tag}</Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <CardHeader className="p-6 pb-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-xl text-foreground line-clamp-1 group-hover:text-primary transition-colors">{prop.title}</h3>
                      <div className="flex items-center text-muted-foreground mt-2 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {prop.location}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 py-4 flex-grow">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground border-y border-border py-4">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4" />
                      <span>{prop.specs.beds} Beds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="w-4 h-4" />
                      <span>{prop.specs.baths} Baths</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Maximize className="w-4 h-4" />
                      <span>{prop.specs.area}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">{prop.price}</div>
                  <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 -mr-4">
                    Detail
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}