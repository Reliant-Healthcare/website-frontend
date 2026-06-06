"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, FileText, Trash2, GripVertical, Upload, Loader2,
  ToggleLeft, ToggleRight, Pencil, X, CheckCircle2, AlertCircle,
  FileUp, ChevronDown,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentSectionsApi } from "@/lib/api";

interface DocumentSection {
  id: string;
  name: string;
  description: string | null;
  roleType: string;
  fileUrl: string;
  originalFilename: string | null;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
  type?: string;
  formSchema?: any;
}

export default function DocumentSectionsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSection, setEditingSection] = useState<DocumentSection | null>(null);
  const [filterRole, setFilterRole] = useState<string>("");

  const { data: sections = [], isLoading } = useQuery<DocumentSection[]>({
    queryKey: ["document-sections", filterRole],
    queryFn: () => documentSectionsApi.getAll(filterRole ? { roleType: filterRole } : undefined),
  });

  const toggleDefaultMutation = useMutation({
    mutationFn: ({ id, isDefault }: { id: string; isDefault: boolean }) => {
      const formData = new FormData();
      formData.append("isDefault", String(isDefault));
      return documentSectionsApi.update(id, formData);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["document-sections"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentSectionsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["document-sections"] }),
  });

  const roleColors: Record<string, string> = {
    skilled: "bg-blue-100 text-blue-800",
    "non-skilled": "bg-amber-100 text-amber-800",
    both: "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document Sections</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the form templates that applicants need to complete. Toggle &quot;Default&quot; to control which are shown initially.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "", label: "All Roles" },
          { value: "skilled", label: "Skilled" },
          { value: "non-skilled", label: "Non-Skilled" },
          { value: "both", label: "Both" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterRole(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filterRole === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Sections List */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No document sections yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Upload your first form template to get started. Applicants will see default sections when they begin their application.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Add First Section
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
              >
                {/* Drag handle */}
                <div className="text-muted-foreground/40 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Icon */}
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{section.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[section.roleType] || roleColors.both}`}>
                      {section.roleType}
                    </span>
                  </div>
                  {section.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{section.description}</p>
                  )}
                  {section.originalFilename && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{section.originalFilename}</p>
                  )}
                </div>

                {/* Default toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Default</span>
                  <button
                    onClick={() => toggleDefaultMutation.mutate({ id: section.id, isDefault: !section.isDefault })}
                    className="transition-colors"
                    title={section.isDefault ? "Remove from defaults" : "Add to defaults"}
                  >
                    {section.isDefault ? (
                      <ToggleRight className="w-8 h-8 text-primary" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingSection(section)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${section.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    title="Preview PDF"
                  >
                    <FileUp className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${section.name}"?`)) {
                        deleteMutation.mutate(section.id);
                      }
                    }}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {sections.length > 0 && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>{sections.length} section{sections.length !== 1 ? "s" : ""} total</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {sections.filter((s) => s.isDefault).length} defaults
          </span>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingSection) && (
          <SectionModal
            section={editingSection}
            onClose={() => {
              setShowCreateModal(false);
              setEditingSection(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Create/Edit Modal ────────────────────────────────────────────────────────

function SectionModal({ section, onClose }: { section: DocumentSection | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: section?.name || "",
    description: section?.description || "",
    roleType: section?.roleType || "both",
    type: section?.type || "WEB_FORM",
    isDefault: section?.isDefault || false,
  });

  const [formFields, setFormFields] = useState<any[]>(
    section?.formSchema ? (section.formSchema as any[]) : []
  );

  const addField = () => {
    setFormFields([...formFields, { id: Date.now().toString(), label: "", type: "text", required: true }]);
  };

  const updateField = (index: number, key: string, value: any) => {
    const updated = [...formFields];
    updated[index][key] = value;
    setFormFields(updated);
  };

  const removeField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const createMutation = useMutation({
    mutationFn: (data: FormData) => documentSectionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-sections"] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => documentSectionsApi.update(section!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-sections"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("roleType", formData.roleType);
    fd.append("type", formData.type);
    fd.append("isDefault", String(formData.isDefault));
    
    if (formData.type === "WEB_FORM" || formData.type === "BOTH") {
      fd.append("formSchema", JSON.stringify(formFields));
    }
    if (formData.type === "PDF" || formData.type === "BOTH") {
      if (file) {
        fd.append("file", file);
      }
    }

    if (section) {
      updateMutation.mutate(fd);
    } else {
      if ((formData.type === "PDF" || formData.type === "BOTH") && !file) {
        alert("Please select a template PDF file");
        return;
      }
      createMutation.mutate(fd);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border my-8"
      >
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="text-xl font-bold">{section ? "Edit Section" : "New Document Section"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Section Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              placeholder="e.g. Employment Application, Background Check"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              placeholder="Brief description shown to applicants"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Applies To</label>
              <div className="relative">
                <select
                  value={formData.roleType}
                  onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background appearance-none"
                >
                  <option value="both">Both</option>
                  <option value="skilled">Skilled Only</option>
                  <option value="non-skilled">Non-Skilled Only</option>
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background appearance-none"
                >
                  <option value="BOTH">Both (Web Form or PDF)</option>
                  <option value="WEB_FORM">Dynamic Web Form Only</option>
                  <option value="PDF">PDF Upload Only</option>
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Form Builder / PDF Upload */}
          {(formData.type === "WEB_FORM" || formData.type === "BOTH") && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Web Form Fields</label>
                <button
                  type="button"
                  onClick={addField}
                  className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Field
                </button>
              </div>
              {formFields.length === 0 ? (
                <div className="text-center p-6 border border-dashed rounded-xl bg-muted/30">
                  <p className="text-sm text-muted-foreground">No fields added. Click "Add Field" to build your form.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {formFields.map((field, idx) => (
                    <div key={field.id} className="flex gap-2 items-start border p-3 rounded-lg bg-muted/10 relative group">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          placeholder="Question Label"
                          value={field.label}
                          required
                          onChange={(e) => updateField(idx, "label", e.target.value)}
                          className="w-full border-b bg-transparent px-1 py-1 text-sm focus:outline-none focus:border-primary"
                        />
                        <div className="flex gap-2">
                          <select
                            value={field.type}
                            onChange={(e) => updateField(idx, "type", e.target.value)}
                            className="text-xs border rounded p-1 bg-background"
                          >
                            <option value="text">Short Text</option>
                            <option value="textarea">Long Text</option>
                            <option value="date">Date</option>
                            <option value="checkbox">Checkbox</option>
                          </select>
                          <label className="flex items-center gap-1 text-xs text-muted-foreground">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(idx, "required", e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            Required
                          </label>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeField(idx)}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(formData.type === "PDF" || formData.type === "BOTH") && (
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">
                Template PDF File {!section && "*"}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {file ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                ) : section?.originalFilename ? (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm">Current: {section.originalFilename} — Click to replace</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm font-medium">Click to upload PDF form</span>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Default toggle */}
          <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4 border">
            <div>
              <p className="text-sm font-medium">Show by default</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Default sections are shown to applicants when they first start their application
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
            >
              {formData.isDefault ? (
                <ToggleRight className="w-10 h-10 text-primary" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-muted-foreground/50" />
              )}
            </button>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-3 rounded-lg font-semibold text-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : section ? (
                "Update Section"
              ) : (
                "Create Section"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
