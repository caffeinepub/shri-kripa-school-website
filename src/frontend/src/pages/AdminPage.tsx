import { ImageCropModal } from "@/components/ImageCrop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  addGalleryImage,
  deleteEvent,
  deleteGalleryImage,
  deleteTeacher,
  genId,
  getAdmissions,
  getCredentials,
  getEvents,
  getGallery,
  getSettings,
  getTeachers,
  saveCredentials,
  saveEvent,
  saveSettings,
  saveTeacher,
  updateAdmissionStatus,
} from "@/utils/firebaseService";
import type {
  AdminCredentials,
  Admission,
  AdmissionStatus,
  GalleryImage,
  SchoolEvent,
  SchoolSettings,
  Teacher,
} from "@/utils/storage";
import { DEFAULT_SETTINGS } from "@/utils/storage";
import {
  AlertTriangle,
  Calendar,
  Check,
  Edit2,
  GraduationCap,
  Image,
  Key,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  RotateCcw,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: () => void }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const creds = await getCredentials();
      if (u === creds.username && p === creds.password) {
        onLogin();
      } else {
        setErr("Invalid username or password.");
      }
    } catch {
      setErr("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center mx-auto mb-3">
            <GraduationCap size={28} className="text-gold" />
          </div>
          <h1 className="text-2xl font-display font-bold text-navy">
            Admin Panel
          </h1>
          <p className="text-gray-400 text-sm mt-1">Shri Kripa Public School</p>
        </div>
        <form
          onSubmit={handle}
          className="space-y-4"
          data-ocid="admin.login.form"
        >
          <div>
            <Label htmlFor="admin-u" className="text-navy font-medium">
              Username
            </Label>
            <Input
              id="admin-u"
              data-ocid="admin.login.input"
              value={u}
              onChange={(e) => setU(e.target.value)}
              autoComplete="username"
              className="mt-1 border-amber-200"
            />
          </div>
          <div>
            <Label htmlFor="admin-p" className="text-navy font-medium">
              Password
            </Label>
            <Input
              id="admin-p"
              data-ocid="admin.password.input"
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              autoComplete="current-password"
              className="mt-1 border-amber-200"
            />
          </div>
          {err && (
            <p
              data-ocid="admin.login.error_state"
              className="text-red-500 text-sm bg-red-50 rounded px-3 py-2"
            >
              {err}
            </p>
          )}
          <Button
            type="submit"
            data-ocid="admin.login.submit_button"
            className="w-full bg-navy hover:bg-navy/90 text-white"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <LogIn size={16} className="mr-2" />
            )}
            Sign In
          </Button>
        </form>
      </div>
    </main>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────────
function Dashboard({ admissions }: { admissions: Admission[] }) {
  const total = admissions.length;
  const pending = admissions.filter((a) => a.status === "pending").length;
  const contacted = admissions.filter((a) => a.status === "contacted").length;
  const notAttended = admissions.filter(
    (a) => a.status === "not_attended",
  ).length;

  return (
    <div
      className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      data-ocid="admin.dashboard.panel"
    >
      {[
        {
          label: "Total Applications",
          value: total,
          color: "bg-navy",
          textColor: "text-white",
        },
        {
          label: "Pending",
          value: pending,
          color: "bg-amber-400",
          textColor: "text-white",
        },
        {
          label: "Contacted",
          value: contacted,
          color: "bg-emerald-500",
          textColor: "text-white",
        },
        {
          label: "Not Attended",
          value: notAttended,
          color: "bg-yellow-400",
          textColor: "text-navy",
        },
      ].map((card) => (
        <div
          key={card.label}
          className={`${card.color} rounded-xl p-6 shadow-sm`}
        >
          <p className={`text-4xl font-bold font-display ${card.textColor}`}>
            {card.value}
          </p>
          <p className={`text-sm mt-1 ${card.textColor} opacity-80`}>
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Applications ─────────────────────────────────────────────────────────────────
function ApplicationsTab() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    getAdmissions().then((data) => {
      setAdmissions(data);
      setLoadingData(false);
    });
  }, []);

  async function setStatus(id: string, status: AdmissionStatus) {
    setAdmissions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
    await updateAdmissionStatus(id, status);
  }

  const pending = admissions.filter((a) => a.status === "pending");
  const contacted = admissions.filter((a) => a.status === "contacted");
  const notAttended = admissions.filter((a) => a.status === "not_attended");

  function AdmissionCard({ a, i }: { a: Admission; i: number }) {
    return (
      <div
        data-ocid={`applications.item.${i + 1}`}
        className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl p-4 shadow-sm border border-amber-100"
      >
        <div>
          <p className="font-semibold text-navy">{a.name}</p>
          <p className="text-sm text-gray-500">
            Class: {a.class} &nbsp;|&nbsp; 📞 {a.phone}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(a.createdAt).toLocaleDateString("en-IN")}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            data-ocid={`applications.contact.button.${i + 1}`}
            title="Mark as Contacted"
            onClick={() => setStatus(a.id, "contacted")}
            className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
          >
            <Check size={16} />
          </button>
          <button
            type="button"
            data-ocid={`applications.not_attended.button.${i + 1}`}
            title="Mark as Not Attended"
            onClick={() => setStatus(a.id, "not_attended")}
            className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition-colors"
          >
            <AlertTriangle size={16} />
          </button>
          <button
            type="button"
            data-ocid={`applications.reset.button.${i + 1}`}
            title="Reset to Pending"
            onClick={() => setStatus(a.id, "pending")}
            className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
          <h3 className="font-bold text-navy">Pending ({pending.length})</h3>
        </div>
        <div className="space-y-2">
          {pending.length === 0 ? (
            <p className="text-gray-400 text-sm italic pl-2">
              No pending applications.
            </p>
          ) : (
            pending.map((a, i) => <AdmissionCard key={a.id} a={a} i={i} />)
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <h3 className="font-bold text-navy">
            Contacted / Attended ({contacted.length})
          </h3>
        </div>
        <div className="space-y-2">
          {contacted.length === 0 ? (
            <p className="text-gray-400 text-sm italic pl-2">
              No contacted applications.
            </p>
          ) : (
            contacted.map((a, i) => <AdmissionCard key={a.id} a={a} i={i} />)
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
          <h3 className="font-bold text-navy">
            Not Attended ({notAttended.length})
          </h3>
        </div>
        <div className="space-y-2">
          {notAttended.length === 0 ? (
            <p className="text-gray-400 text-sm italic pl-2">
              No not-attended applications.
            </p>
          ) : (
            notAttended.map((a, i) => <AdmissionCard key={a.id} a={a} i={i} />)
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Teachers Admin ──────────────────────────────────────────────────────────────────
function TeachersAdmin() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [form, setForm] = useState({ name: "", speciality: "", photo: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTeachers().then((data) => {
      setTeachers(data);
      setLoadingData(false);
    });
  }, []);

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const id = editId ?? genId();
      const teacher: Teacher = {
        id,
        name: form.name.trim(),
        speciality: form.speciality.trim(),
        photo: form.photo,
      };
      await saveTeacher(teacher);
      if (editId) {
        setTeachers((prev) => prev.map((t) => (t.id === editId ? teacher : t)));
      } else {
        setTeachers((prev) => [...prev, teacher]);
      }
      setForm({ name: "", speciality: "", photo: "" });
      setEditId(null);
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    await deleteTeacher(id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  }

  function startEdit(t: Teacher) {
    setEditId(t.id);
    setForm({ name: t.name, speciality: t.speciality, photo: t.photo });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-amber-100 shadow-sm">
        <h3 className="font-bold text-navy mb-4">
          {editId ? "Edit Teacher" : "Add New Teacher"}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-navy font-medium">Name</Label>
            <Input
              data-ocid="teachers.name.input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Teacher's full name"
              className="mt-1 border-amber-200"
            />
          </div>
          <div>
            <Label className="text-navy font-medium">
              Speciality / Subject
            </Label>
            <Input
              data-ocid="teachers.speciality.input"
              value={form.speciality}
              onChange={(e) =>
                setForm((f) => ({ ...f, speciality: e.target.value }))
              }
              placeholder="e.g. Mathematics"
              className="mt-1 border-amber-200"
            />
          </div>
        </div>
        <div className="mt-4">
          <Label className="text-navy font-medium">Photo</Label>
          <div className="mt-1 flex items-center gap-3">
            {form.photo ? (
              <img
                src={form.photo}
                alt="preview"
                className="w-14 h-14 rounded-full object-cover border-2 border-gold"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-dashed border-amber-200 flex items-center justify-center">
                <Users size={20} className="text-gray-300" />
              </div>
            )}
            <Button
              data-ocid="teachers.upload_button"
              type="button"
              variant="outline"
              onClick={() => setShowCrop(true)}
              className="text-sm border-amber-200 text-navy"
            >
              {form.photo ? "Change Photo" : "Upload Photo"}
            </Button>
            {form.photo && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, photo: "" }))}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            data-ocid="teachers.save_button"
            onClick={save}
            disabled={saving || !form.name.trim()}
            className="bg-navy hover:bg-navy/90 text-white"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin mr-1" />
            ) : null}
            {editId ? "Save Changes" : "Add Teacher"}
          </Button>
          {editId && (
            <Button
              variant="outline"
              onClick={() => {
                setEditId(null);
                setForm({ name: "", speciality: "", photo: "" });
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-navy" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {teachers.map((t, i) => (
            <div
              key={t.id}
              data-ocid={`teachers.item.${i + 1}`}
              className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm flex items-center gap-3"
            >
              {t.photo ? (
                <img
                  src={t.photo}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gold"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-amber-200">
                  <span className="text-lg font-bold text-navy">
                    {t.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy truncate">{t.name}</p>
                <p className="text-gray-500 text-sm">{t.speciality}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  data-ocid={`teachers.edit_button.${i + 1}`}
                  onClick={() => startEdit(t)}
                  className="p-1.5 rounded hover:bg-amber-50 text-navy"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  data-ocid={`teachers.delete_button.${i + 1}`}
                  onClick={() => del(t.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCrop && (
        <ImageCropModal
          shape="circle"
          onConfirm={(dataUrl) => {
            setForm((f) => ({ ...f, photo: dataUrl }));
            setShowCrop(false);
          }}
          onCancel={() => setShowCrop(false)}
        />
      )}
    </div>
  );
}

// ─── Gallery Admin ──────────────────────────────────────────────────────────────────
function GalleryAdmin() {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showCrop, setShowCrop] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getGallery().then((data) => {
      setGallery(data);
      setLoadingData(false);
    });
  }, []);

  async function addImage(dataUrl: string) {
    setUploading(true);
    try {
      const id = genId();
      const img = await addGalleryImage(dataUrl, id);
      setGallery((prev) => [...prev, img]);
    } finally {
      setUploading(false);
    }
  }

  async function del(id: string) {
    await deleteGalleryImage(id);
    setGallery((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          {loadingData
            ? "Loading..."
            : `${gallery.length} image${gallery.length !== 1 ? "s" : ""} in gallery`}
        </p>
        <Button
          data-ocid="gallery.upload_button"
          onClick={() => setShowCrop(true)}
          disabled={uploading}
          className="bg-navy hover:bg-navy/90 text-white"
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin mr-1" />
          ) : (
            <Plus size={16} className="mr-1" />
          )}
          Add Image
        </Button>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-navy" />
        </div>
      ) : gallery.length === 0 ? (
        <div
          data-ocid="gallery.empty_state"
          className="text-center py-16 border-2 border-dashed border-amber-200 rounded-xl text-gray-400"
        >
          <Image size={40} className="mx-auto mb-3 opacity-30" />
          <p>No images yet. Click "Add Image" to upload.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {gallery.map((img, i) => (
            <div
              key={img.id}
              data-ocid={`gallery.item.${i + 1}`}
              className="group relative aspect-square rounded-xl overflow-hidden"
            >
              <img
                src={img.imageUrl}
                alt={`Gallery ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  data-ocid={`gallery.delete_button.${i + 1}`}
                  onClick={() => del(img.id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCrop && (
        <ImageCropModal
          shape="rect"
          onConfirm={(dataUrl) => {
            addImage(dataUrl);
            setShowCrop(false);
          }}
          onCancel={() => setShowCrop(false)}
        />
      )}
    </div>
  );
}

// ─── Events Admin ───────────────────────────────────────────────────────────────────
function EventsAdmin() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [showCrop, setShowCrop] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    getEvents().then((data) => {
      setEvents(data);
      setLoadingData(false);
    });
  }, []);

  async function addEvent() {
    if (!newTitle.trim()) return;
    const ev: SchoolEvent = { id: genId(), title: newTitle.trim(), images: [] };
    await saveEvent(ev);
    setEvents((prev) => [...prev, ev]);
    setNewTitle("");
  }

  async function delEvent(id: string) {
    await deleteEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  async function addImageToEvent(eventId: string, dataUrl: string) {
    setUploadingImg(true);
    try {
      const ev = events.find((e) => e.id === eventId);
      if (!ev) return;
      const updated = { ...ev, images: [...ev.images, dataUrl] };
      const saved = await saveEvent(updated);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? saved : e)));
    } finally {
      setUploadingImg(false);
    }
  }

  async function delImageFromEvent(eventId: string, idx: number) {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;
    const updated = { ...ev, images: ev.images.filter((_, i) => i !== idx) };
    await saveEvent(updated);
    setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm">
        <Label className="text-navy font-medium">Create New Event</Label>
        <div className="flex gap-2 mt-1">
          <Input
            data-ocid="events.name.input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Event name (e.g. Independence Day)"
            className="border-amber-200"
            onKeyDown={(e) => e.key === "Enter" && addEvent()}
          />
          <Button
            data-ocid="events.create_button"
            onClick={addEvent}
            disabled={!newTitle.trim()}
            className="bg-navy hover:bg-navy/90 text-white shrink-0"
          >
            <Plus size={16} className="mr-1" /> Create
          </Button>
        </div>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-navy" />
        </div>
      ) : events.length === 0 ? (
        <div
          data-ocid="events.empty_state"
          className="text-center py-16 border-2 border-dashed border-amber-200 rounded-xl text-gray-400"
        >
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p>No events yet.</p>
        </div>
      ) : (
        events.map((ev, ei) => (
          <div
            key={ev.id}
            data-ocid={`events.item.${ei + 1}`}
            className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-amber-50">
              <div>
                <h3 className="font-bold text-navy">{ev.title}</h3>
                <p className="text-xs text-gray-400">
                  {ev.images.length} photo{ev.images.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  data-ocid={`events.add_photo.button.${ei + 1}`}
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCrop(ev.id)}
                  disabled={uploadingImg}
                  className="text-xs border-amber-200 text-navy"
                >
                  {uploadingImg && showCrop === ev.id ? (
                    <Loader2 size={12} className="animate-spin mr-1" />
                  ) : (
                    <Plus size={12} className="mr-1" />
                  )}
                  Add Photo
                </Button>
                <button
                  type="button"
                  data-ocid={`events.delete_button.${ei + 1}`}
                  onClick={() => delEvent(ev.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {ev.images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-4">
                {ev.images.map((img, idx) => (
                  <div
                    key={`${ev.id}-img-${idx}`}
                    className="group relative aspect-square rounded-lg overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={`${ev.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => delImageFromEvent(ev.id, idx)}
                        className="p-1 bg-red-500 text-white rounded-full"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {showCrop && (
        <ImageCropModal
          shape="rect"
          onConfirm={(dataUrl) => {
            addImageToEvent(showCrop, dataUrl);
            setShowCrop(null);
          }}
          onCancel={() => setShowCrop(null)}
        />
      )}
    </div>
  );
}

// ─── Settings Admin ──────────────────────────────────────────────────────────────────
function SettingsAdmin() {
  const [s, setS] = useState<SchoolSettings>(DEFAULT_SETTINGS);
  const [loadingData, setLoadingData] = useState(true);
  const [showLogoCrop, setShowLogoCrop] = useState(false);
  const [showBannerCrop, setShowBannerCrop] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((data) => {
      setS(data);
      setLoadingData(false);
    });
  }, []);

  async function save() {
    setSaving(true);
    try {
      await saveSettings(s);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={32} className="animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-navy font-medium">School Name</Label>
          <Input
            data-ocid="settings.name.input"
            value={s.name}
            onChange={(e) => setS((ss) => ({ ...ss, name: e.target.value }))}
            className="mt-1 border-amber-200"
          />
        </div>
        <div>
          <Label className="text-navy font-medium">Tagline</Label>
          <Input
            data-ocid="settings.tagline.input"
            value={s.tagline}
            onChange={(e) => setS((ss) => ({ ...ss, tagline: e.target.value }))}
            className="mt-1 border-amber-200"
          />
        </div>
        <div>
          <Label className="text-navy font-medium">Admissions Year</Label>
          <Input
            data-ocid="settings.admissions_year.input"
            value={s.admissionsYear}
            onChange={(e) =>
              setS((ss) => ({ ...ss, admissionsYear: e.target.value }))
            }
            placeholder="2025-26"
            className="mt-1 border-amber-200"
          />
        </div>
        <div>
          <Label className="text-navy font-medium">
            Classes (comma separated)
          </Label>
          <Input
            data-ocid="settings.classes.input"
            value={s.classes.join(",")}
            onChange={(e) =>
              setS((ss) => ({
                ...ss,
                classes: e.target.value
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean),
              }))
            }
            placeholder="Nursery,KG,1st,..."
            className="mt-1 border-amber-200"
          />
        </div>
      </div>

      <div>
        <Label className="text-navy font-medium">About Us</Label>
        <Textarea
          data-ocid="settings.about.textarea"
          value={s.about}
          onChange={(e) => setS((ss) => ({ ...ss, about: e.target.value }))}
          rows={4}
          className="mt-1 border-amber-200"
        />
      </div>

      <div>
        <Label className="text-navy font-medium">Notice Board</Label>
        <Textarea
          data-ocid="settings.notice.textarea"
          value={s.noticeBoard}
          onChange={(e) =>
            setS((ss) => ({ ...ss, noticeBoard: e.target.value }))
          }
          rows={3}
          className="mt-1 border-amber-200"
          placeholder="Announcements, events, holidays..."
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label className="text-navy font-medium">Address</Label>
          <Textarea
            data-ocid="settings.address.textarea"
            value={s.contact.address}
            onChange={(e) =>
              setS((ss) => ({
                ...ss,
                contact: { ...ss.contact, address: e.target.value },
              }))
            }
            rows={2}
            className="mt-1 border-amber-200"
          />
        </div>
        <div>
          <Label className="text-navy font-medium">Phone</Label>
          <Input
            data-ocid="settings.phone.input"
            value={s.contact.phone}
            onChange={(e) =>
              setS((ss) => ({
                ...ss,
                contact: { ...ss.contact, phone: e.target.value },
              }))
            }
            className="mt-1 border-amber-200"
          />
        </div>
        <div>
          <Label className="text-navy font-medium">Email</Label>
          <Input
            data-ocid="settings.email.input"
            value={s.contact.email}
            onChange={(e) =>
              setS((ss) => ({
                ...ss,
                contact: { ...ss.contact, email: e.target.value },
              }))
            }
            className="mt-1 border-amber-200"
          />
        </div>
      </div>

      <div>
        <Label className="text-navy font-medium">School Logo</Label>
        <div className="mt-2 flex items-center gap-4">
          {s.logo ? (
            <img
              src={s.logo}
              alt="logo"
              className="w-16 h-16 rounded-full object-cover border-2 border-gold"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-amber-200 flex items-center justify-center">
              <GraduationCap size={24} className="text-gray-300" />
            </div>
          )}
          <Button
            data-ocid="settings.logo.upload_button"
            variant="outline"
            onClick={() => setShowLogoCrop(true)}
            className="border-amber-200 text-navy"
          >
            {s.logo ? "Change Logo" : "Upload Logo"}
          </Button>
          {s.logo && (
            <button
              type="button"
              onClick={() => setS((ss) => ({ ...ss, logo: "" }))}
              className="text-red-400 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div>
        <Label className="text-navy font-medium">Hero Banner Image</Label>
        <div className="mt-2">
          {s.banner ? (
            <div className="relative inline-block">
              <img
                src={s.banner}
                alt="banner"
                className="w-full max-w-sm h-24 object-cover rounded-xl border border-amber-200"
              />
              <button
                type="button"
                onClick={() => setS((ss) => ({ ...ss, banner: "" }))}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-amber-200 rounded-xl h-24 flex items-center justify-center text-gray-400">
              No banner set
            </div>
          )}
          <Button
            data-ocid="settings.banner.upload_button"
            variant="outline"
            onClick={() => setShowBannerCrop(true)}
            className="mt-2 border-amber-200 text-navy"
          >
            {s.banner ? "Change Banner" : "Upload Banner"}
          </Button>
        </div>
      </div>

      <Button
        data-ocid="settings.save_button"
        onClick={save}
        disabled={saving}
        className="bg-navy hover:bg-navy/90 text-white"
      >
        {saving ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : saved ? (
          <Check size={16} className="mr-2 text-green-400" />
        ) : (
          <Settings size={16} className="mr-2" />
        )}
        {saving ? "Saving to Firebase..." : saved ? "Saved!" : "Save Settings"}
      </Button>

      {showLogoCrop && (
        <ImageCropModal
          shape="circle"
          onConfirm={(dataUrl) => {
            setS((ss) => ({ ...ss, logo: dataUrl }));
            setShowLogoCrop(false);
          }}
          onCancel={() => setShowLogoCrop(false)}
        />
      )}
      {showBannerCrop && (
        <ImageCropModal
          shape="rect"
          onConfirm={(dataUrl) => {
            setS((ss) => ({ ...ss, banner: dataUrl }));
            setShowBannerCrop(false);
          }}
          onCancel={() => setShowBannerCrop(false)}
        />
      )}
    </div>
  );
}

// ─── Credentials Admin ────────────────────────────────────────────────────────────────
function CredentialsAdmin() {
  const [creds, setCreds] = useState<AdminCredentials>({
    username: "",
    password: "",
  });
  const [loadingData, setLoadingData] = useState(true);
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getCredentials().then((data) => {
      setCreds(data);
      setLoadingData(false);
    });
  }, []);

  async function save() {
    if (!creds.username.trim()) {
      setErr("Username cannot be empty.");
      return;
    }
    if (creds.password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (creds.password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await saveCredentials(creds);
      setSaved(true);
      setErr("");
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={32} className="animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="max-w-sm space-y-4">
      <div>
        <Label className="text-navy font-medium">New Username</Label>
        <Input
          data-ocid="credentials.username.input"
          value={creds.username}
          onChange={(e) =>
            setCreds((c) => ({ ...c, username: e.target.value }))
          }
          className="mt-1 border-amber-200"
        />
      </div>
      <div>
        <Label className="text-navy font-medium">New Password</Label>
        <Input
          data-ocid="credentials.password.input"
          type="password"
          value={creds.password}
          onChange={(e) =>
            setCreds((c) => ({ ...c, password: e.target.value }))
          }
          className="mt-1 border-amber-200"
        />
      </div>
      <div>
        <Label className="text-navy font-medium">Confirm Password</Label>
        <Input
          data-ocid="credentials.confirm.input"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 border-amber-200"
        />
      </div>
      {err && (
        <p
          data-ocid="credentials.error_state"
          className="text-red-500 text-sm bg-red-50 rounded px-3 py-2"
        >
          {err}
        </p>
      )}
      <Button
        data-ocid="credentials.save_button"
        onClick={save}
        disabled={saving}
        className="bg-navy hover:bg-navy/90 text-white"
      >
        {saving ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : saved ? (
          <Check size={16} className="mr-2 text-green-300" />
        ) : (
          <Key size={16} className="mr-2" />
        )}
        {saved ? "Credentials Updated!" : "Update Credentials"}
      </Button>
    </div>
  );
}

// ─── Main Admin Component ───────────────────────────────────────────────────────────
export function AdminPage({
  navigate,
  onDataChange,
}: {
  navigate?: (p: string) => void;
  onDataChange?: () => void;
}) {
  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem("adminLoggedIn") === "true",
  );
  const [admissions, setAdmissions] = useState<Admission[]>([]);

  useEffect(() => {
    if (loggedIn) {
      getAdmissions().then(setAdmissions);
    }
  }, [loggedIn]);

  function handleLogin() {
    sessionStorage.setItem("adminLoggedIn", "true");
    setLoggedIn(true);
  }

  function handleLogout() {
    sessionStorage.removeItem("adminLoggedIn");
    setLoggedIn(false);
    if (onDataChange) onDataChange();
    if (navigate) navigate("/");
  }

  if (!loggedIn) return <Login onLogin={handleLogin} />;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">
            Admin Panel
          </h1>
          <p className="text-gray-400 text-sm mt-1">Shri Kripa Public School</p>
        </div>
        <button
          type="button"
          data-ocid="admin.logout.button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList
          data-ocid="admin.tabs.tab"
          className="flex flex-wrap gap-1 h-auto bg-amber-50 border border-amber-200 p-1 rounded-xl"
        >
          {[
            { value: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            {
              value: "applications",
              icon: GraduationCap,
              label: "Applications",
            },
            { value: "teachers", icon: Users, label: "Teachers" },
            { value: "gallery", icon: Image, label: "Gallery" },
            { value: "events", icon: Calendar, label: "Events" },
            { value: "settings", icon: Settings, label: "Settings" },
            { value: "credentials", icon: Key, label: "Credentials" },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-navy data-[state=active]:text-white"
            >
              <Icon size={14} /> {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard admissions={admissions} />
        </TabsContent>
        <TabsContent value="applications">
          <ApplicationsTab />
        </TabsContent>
        <TabsContent value="teachers">
          <TeachersAdmin />
        </TabsContent>
        <TabsContent value="gallery">
          <GalleryAdmin />
        </TabsContent>
        <TabsContent value="events">
          <EventsAdmin />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsAdmin />
        </TabsContent>
        <TabsContent value="credentials">
          <CredentialsAdmin />
        </TabsContent>
      </Tabs>
    </main>
  );
}
