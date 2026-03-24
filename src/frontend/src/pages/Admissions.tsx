import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type SchoolSettings, genId, storage } from "@/utils/storage";
import { CheckCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  settings: SchoolSettings;
}

export function AdmissionsPage({ settings }: Props) {
  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    class: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function validate(): string {
    if (!form.name.trim()) return "Student name is required.";
    if (!form.fatherName.trim()) return "Father name is required.";
    if (!form.class) return "Please select a class.";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length !== 10)
      return "Enter a valid 10-digit Indian phone number.";
    return "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    const admissions = storage.getAdmissions();
    admissions.push({
      id: genId(),
      name: form.name.trim(),
      fatherName: form.fatherName.trim(),
      class: form.class,
      phone: form.phone.replace(/\D/g, ""),
      createdAt: new Date().toISOString(),
      status: "pending",
    });
    storage.setAdmissions(admissions);
    setSubmitted(true);
    setError("");
  }

  if (submitted) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div
          className="bg-white rounded-2xl shadow-sm border border-green-100 p-12"
          data-ocid="admissions.success_state"
        >
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-navy mb-2">
            Form Submitted Successfully!
          </h2>
          <p className="text-gray-500 mb-2">
            Thank you for your interest in {settings.name}.
          </p>
          <p className="text-gray-500 text-sm">
            Our team will contact you at <strong>{form.phone}</strong> shortly.
          </p>
          <button
            type="button"
            data-ocid="admissions.submit_another.button"
            className="mt-6 px-6 py-2 bg-gold text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            onClick={() => {
              setForm({ name: "", fatherName: "", class: "", phone: "" });
              setSubmitted(false);
            }}
          >
            Submit Another Application
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8 text-center">
        <span className="text-gold font-semibold uppercase text-xs tracking-wider">
          Admissions Open
        </span>
        <h1 className="text-4xl font-display font-bold text-navy mt-2">
          {settings.admissionsYear}
        </h1>
        <p className="text-gray-500 mt-2">
          Fill out the form below to apply for admission.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          data-ocid="admissions.form"
        >
          <div>
            <Label htmlFor="student-name" className="text-navy font-medium">
              Student Name *
            </Label>
            <Input
              id="student-name"
              data-ocid="admissions.name.input"
              placeholder="Enter student's full name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 border-amber-200 focus:ring-gold"
            />
          </div>
          <div>
            <Label htmlFor="father-name" className="text-navy font-medium">
              Father's Name *
            </Label>
            <Input
              id="father-name"
              data-ocid="admissions.father_name.input"
              placeholder="Enter father's full name"
              value={form.fatherName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fatherName: e.target.value }))
              }
              className="mt-1 border-amber-200"
            />
          </div>
          <div>
            <Label className="text-navy font-medium">Class *</Label>
            <Select
              value={form.class}
              onValueChange={(v) => setForm((f) => ({ ...f, class: v }))}
            >
              <SelectTrigger
                data-ocid="admissions.class.select"
                className="mt-1 border-amber-200"
              >
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {settings.classes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="phone" className="text-navy font-medium">
              Phone Number *
            </Label>
            <Input
              id="phone"
              data-ocid="admissions.phone.input"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              className="mt-1 border-amber-200"
              maxLength={10}
              inputMode="numeric"
            />
          </div>
          {error && (
            <p
              data-ocid="admissions.error_state"
              className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            data-ocid="admissions.submit_button"
            className="w-full bg-gold hover:bg-amber-600 text-white font-semibold py-3 text-base"
          >
            Submit Application
          </Button>
        </form>
      </div>
    </main>
  );
}
