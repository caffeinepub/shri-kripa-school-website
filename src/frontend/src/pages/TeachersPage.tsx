import type { Teacher } from "@/utils/storage";

interface Props {
  teachers: Teacher[];
}

export function TeachersPage({ teachers }: Props) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8 text-center">
        <span className="text-gold font-semibold uppercase text-xs tracking-wider">
          Faculty
        </span>
        <h1 className="text-4xl font-display font-bold text-navy mt-1">
          Our Teachers
        </h1>
        <p className="text-gray-500 mt-2">
          Dedicated educators shaping young minds
        </p>
      </div>

      {teachers.length === 0 ? (
        <div
          data-ocid="teachers.empty_state"
          className="text-center py-20 text-gray-400"
        >
          <p className="text-5xl mb-4">👨‍🏫</p>
          <p className="text-lg">No teachers added yet.</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          data-ocid="teachers.list"
        >
          {teachers.map((t, i) => (
            <div
              key={t.id}
              data-ocid={`teachers.item.${i + 1}`}
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-amber-100 hover:shadow-md hover:border-gold transition-all duration-300 group"
            >
              {t.photo ? (
                <img
                  src={t.photo}
                  alt={t.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-gold group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-4 border-2 border-gold">
                  <span className="text-3xl font-bold text-navy">
                    {t.name.charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="font-display font-bold text-navy">{t.name}</h3>
              <p className="text-gold text-sm mt-1">{t.speciality}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
