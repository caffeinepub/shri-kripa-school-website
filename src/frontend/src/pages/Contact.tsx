import type { SchoolSettings } from "@/utils/storage";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

interface Props {
  settings: SchoolSettings;
}

export function ContactPage({ settings }: Props) {
  const c = settings.contact;
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10 text-center">
        <span className="text-gold font-semibold uppercase text-xs tracking-wider">
          Get In Touch
        </span>
        <h1 className="text-4xl font-display font-bold text-navy mt-1">
          Contact Us
        </h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          {[
            { icon: MapPin, label: "Address", value: c.address },
            { icon: Phone, label: "Phone", value: c.phone },
            { icon: Mail, label: "Email", value: c.email },
            {
              icon: Clock,
              label: "School Hours",
              value: "Mon–Sat: 7:30 AM – 2:00 PM",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy uppercase tracking-wide">
                  {label}
                </p>
                <p className="text-gray-600 mt-0.5">{value}</p>
              </div>
            </div>
          ))}

          <div className="bg-navy rounded-xl p-6 text-white">
            <p className="text-gold font-semibold mb-2">📢 Admissions Open</p>
            <p className="text-white/70 text-sm">
              Admissions for session {settings.admissionsYear} are now open.
              Apply online or visit us in person.
            </p>
            <a
              href="https://wa.me/918449561111"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-sm border border-amber-100 h-80 lg:h-auto min-h-64">
          <iframe
            title="School Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55717.96614657461!2d79.49699535820314!3d29.21723940000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a09a07e7cfcc5f%3A0xbfb3ff1b6dd27a43!2sHaldwani%2C%20Uttarakhand!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "320px" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </main>
  );
}
