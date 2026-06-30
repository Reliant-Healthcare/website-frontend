"use client";

import { useState } from "react";
import {
  Plus, MapPin, BriefcaseIcon, X, Loader2,
  Pencil, Trash2, ToggleLeft, ToggleRight, Users,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api";

const DEPARTMENTS = ["Skilled Nursing", "Therapy", "Caregiving", "Social Services", "Administration", "General"];
const JOB_TYPES = ["Full-Time", "Part-Time", "PRN", "Contract"];

type Job = {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
  requirements: string;
  benefits: string;
  isActive: boolean;
  createdAt: string;
  _count?: { applications: number };
};

const emptyForm = {
  title: "",
  department: "Skilled Nursing",
  type: "Full-Time",
  location: "",
  description: "",
  requirements: "",
  benefits: "",
};

export default function JobsPage() {
  const queryClient = useQueryClient();

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const [selectedTitle, setSelectedTitle] = useState("CNA");
  const [customTitle, setCustomTitle] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Delaware County");
  const [customLocation, setCustomLocation] = useState("");

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["admin-jobs"],
    queryFn: () => jobsApi.getAll(),
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) => jobsApi.create(data),
    onSuccess: () => { invalidate(); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof emptyForm> }) =>
      jobsApi.update(id, data),
    onSuccess: () => { invalidate(); closeModal(); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      jobsApi.update(id, { isActive }),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobsApi.remove(id),
    onSuccess: () => { invalidate(); setDeleteTarget(null); },
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  const openCreate = () => {
    setSelectedTitle("CNA");
    setCustomTitle("");
    setSelectedLocation("Delaware County");
    setCustomLocation("");
    setFormData({
      ...emptyForm,
      title: "CNA",
      location: "Delaware County",
    });
    setEditingJob(null);
    setModalMode("create");
  };

  const openEdit = (job: Job) => {
    const isStandardTitle = ["CNA", "HHA", "RN", "LPN"].includes(job.title);
    const isStandardLocation = ["Delaware County", "Philadelphia"].includes(job.location);

    setSelectedTitle(isStandardTitle ? job.title : "Other");
    setCustomTitle(isStandardTitle ? "" : job.title);
    setSelectedLocation(isStandardLocation ? job.location : "Other");
    setCustomLocation(isStandardLocation ? "" : job.location);

    setFormData({
      title: job.title,
      department: job.department,
      type: job.type,
      location: job.location,
      description: job.description,
      requirements: job.requirements || "",
      benefits: job.benefits || "",
    });
    setEditingJob(job);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingJob(null);
    setFormData(emptyForm);
    setSelectedTitle("CNA");
    setCustomTitle("");
    setSelectedLocation("Delaware County");
    setCustomLocation("");
  };

  const handleSubmit = () => {
    if (modalMode === "create") {
      createMutation.mutate(formData);
    } else if (modalMode === "edit" && editingJob) {
      updateMutation.mutate({ id: editingJob.id, data: formData });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isFormValid = !!formData.title && !!formData.location && !!formData.description;

  const activeJobs = jobs.filter((j) => j.isActive).length;
  const draftJobs = jobs.filter((j) => !j.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage career opportunities on your public website.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Job
        </button>
      </div>

      {/* Stats */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Jobs", value: jobs.length, color: "bg-primary/10 text-primary" },
            { label: "Active", value: activeJobs, color: "bg-emerald-100 text-emerald-800" },
            { label: "Drafts", value: draftJobs, color: "bg-muted text-muted-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold inline-block px-3 py-1 rounded-lg mb-1 ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Jobs list */}
      <div className="grid grid-cols-1 gap-4 min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-xl">
            <BriefcaseIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-semibold">No job postings yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-6">Create a new job to start receiving applications.</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create First Job
            </button>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className={`bg-card border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                !job.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${job.isActive ? "bg-primary/10" : "bg-muted"}`}>
                  <BriefcaseIcon className={`w-6 h-6 ${job.isActive ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${job.isActive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
                      {job.isActive ? "Active" : "Draft"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <BriefcaseIcon className="w-3.5 h-3.5" /> {job.department} · {job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {job.location}
                    </span>
                  </div>
                  {job.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{job.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center hidden sm:block">
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{job._count?.applications ?? 0}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">applicants</div>
                </div>
                <div className="w-px h-8 bg-border hidden sm:block" />

                {/* Toggle active */}
                <button
                  onClick={() => toggleMutation.mutate({ id: job.id, isActive: !job.isActive })}
                  disabled={toggleMutation.isPending}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title={job.isActive ? "Set to Draft" : "Publish"}
                >
                  {job.isActive
                    ? <ToggleRight className="w-5 h-5 text-emerald-600" />
                    : <ToggleLeft className="w-5 h-5" />}
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEdit(job)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => setDeleteTarget(job)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold">
                {modalMode === "create" ? "Create New Job Posting" : `Edit: ${editingJob?.title}`}
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Title */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Job Title *</label>
                  <select
                    value={selectedTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedTitle(val);
                      if (val !== "Other") {
                        setFormData({ ...formData, title: val });
                      } else {
                        setFormData({ ...formData, title: customTitle });
                      }
                    }}
                    className="w-full border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {["CNA", "HHA", "RN", "LPN", "Other"].map((role) => (
                      <option key={role} value={role}>{role === "Other" ? "Other (Specify Custom...)" : role}</option>
                    ))}
                  </select>
                </div>
                {selectedTitle === "Other" && (
                  <div className="space-y-1.5 pl-4 border-l-2 border-primary/30">
                    <label className="text-xs font-semibold text-muted-foreground">Specify Custom Job Title *</label>
                    <input
                      type="text"
                      required
                      value={customTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomTitle(val);
                        setFormData({ ...formData, title: val });
                      }}
                      className="w-full border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Physical Therapist (PT)"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>

                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Employment Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Location *</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedLocation(val);
                      if (val !== "Other") {
                        setFormData({ ...formData, location: val });
                      } else {
                        setFormData({ ...formData, location: customLocation });
                      }
                    }}
                    className="w-full border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {["Delaware County", "Philadelphia", "Other"].map((loc) => (
                      <option key={loc} value={loc}>{loc === "Other" ? "Other (Specify Custom...)" : loc}</option>
                    ))}
                  </select>
                </div>
                {selectedLocation === "Other" && (
                  <div className="space-y-1.5 pl-4 border-l-2 border-primary/30">
                    <label className="text-xs font-semibold text-muted-foreground">Specify Custom Location *</label>
                    <input
                      type="text"
                      required
                      value={customLocation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomLocation(val);
                        setFormData({ ...formData, location: val });
                      }}
                      className="w-full border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Montgomery County, PA"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Job Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-y"
                  placeholder="Describe the role, responsibilities, and day-to-day expectations..."
                />
              </div>

              {/* Requirements */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Requirements</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-y"
                  placeholder="e.g. Active RN license, 2+ years home health experience..."
                />
              </div>

              {/* Benefits */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Benefits</label>
                <textarea
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[70px] resize-y"
                  placeholder="e.g. Health insurance, 401k, paid mileage, flexible schedule..."
                />
              </div>
            </div>

            <div className="p-6 border-t bg-muted/20 flex justify-end gap-3 shrink-0">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || !isFormValid}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {modalMode === "create" ? "Publish Job" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Delete Job Posting?</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Are you sure you want to delete <strong>&ldquo;{deleteTarget.title}&rdquo;</strong>? This action cannot be undone and will remove all associated data.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
