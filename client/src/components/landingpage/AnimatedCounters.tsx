import { useState, useEffect, useRef } from 'react';

interface CounterItem {
  label: string;
  value: number;
  suffix: string;
  icon: string;
}

const counters: CounterItem[] = [
  {
    label: "Properti Terjual Bulan Ini",
    value: 20,
    suffix: "+",
    icon: "🔥"
  },
  {
    label: "Properti Aktif",
    value: 500,
    suffix: "+",
    icon: "🏠"
  },
  {
    label: "Customer Puas",
    value: 98,
    suffix: "%",
    icon: "😊"
  },
  {
    label: "Tahun Pengalaman",
    value: 8,
    suffix: "+",
    icon: "⭐"
  }
];

function Counter({ item, isVisible }: { item: CounterItem; isVisible: boolean }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;

      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = item.value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= item.value) {
          setCount(item.value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, item.value]);

  return (
    <div className="text-center">
      <div className="text-4xl mb-2">{item.icon}</div>
      <div className="text-4xl font-bold text-blue-600 mb-1">
        {count}{item.suffix}
      </div>
      <div className="text-gray-600 font-medium">
        {item.label}
      </div>
    </div>
  );
}

export default function AnimatedCounters() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {counters.map((item, index) => (
            <div
              key={index}
              className="bg-white/60 backdrop-blur-md border border-white/20 rounded-lg p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <Counter item={item} isVisible={isVisible} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}