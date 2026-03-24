import type { SchoolSettings } from "@/utils/storage";

interface Props {
  settings: SchoolSettings;
}

export function AboutPage({ settings }: Props) {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <span className="text-gold font-semibold uppercase text-xs tracking-wider">
          About Us
        </span>
        <h1 className="text-4xl font-display font-bold text-navy mt-2">
          {settings.name}
        </h1>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8">
        <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
          {settings.about}
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-6 mt-10">
        {[
          {
            icon: "🎯",
            title: "Our Mission",
            desc: "To provide quality education that empowers students with knowledge, skills, and values for a bright future.",
          },
          {
            icon: "👁️",
            title: "Our Vision",
            desc: "To be a center of excellence that nurtures well-rounded individuals ready to contribute to society.",
          },
          {
            icon: "💡",
            title: "Our Values",
            desc: "Integrity, discipline, respect, creativity, and a lifelong love of learning.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl p-6 shadow-sm border border-amber-100 text-center"
          >
            <span className="text-4xl">{card.icon}</span>
            <h3 className="font-display font-bold text-navy text-lg mt-3 mb-2">
              {card.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
