"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { Shield, Plus, Loader2, Trash2, Pencil, X, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminAccountsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: () => usersApi.getAdmins(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteAdmin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admins"] }),
    onError: (err: any) => alert(err.message || "Failed to delete admin"),
  });

  const handleDelete = (admin: any) => {
    if (confirm(`Are you sure you want to delete ${admin.email}?`)) {
      deleteMutation.mutate(admin.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Users</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage system administrators, recruiters, and managers.</p>
        </div>
        <button
          onClick={() => {
            setEditingAdmin(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Date Added</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {admins.map((admin: any) => (
                  <tr key={admin.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{admin.firstName} {admin.lastName}</div>
                      <div className="text-muted-foreground text-xs">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        <Shield className="w-3.5 h-3.5" />
                        {admin.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingAdmin(admin);
                            setShowModal(true);
                          }}
                          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(admin)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <AdminUserModal
            admin={editingAdmin}
            onClose={() => {
              setShowModal(false);
              setEditingAdmin(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminUserModal({ admin, onClose }: { admin: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: admin?.firstName || "",
    lastName: admin?.lastName || "",
    email: admin?.email || "",
    phone: admin?.phone || "",
    role: admin?.role || "RECRUITER",
    password: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => usersApi.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      onClose();
    },
    onError: (err: any) => setError(err.message || "Failed to create admin"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersApi.updateAdmin(admin.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      onClose();
    },
    onError: (err: any) => setError(err.message || "Failed to update admin"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!admin && !formData.password) {
      setError("Password is required for new accounts");
      return;
    }

    if (admin) {
      const data: any = { ...formData };
      if (!data.password) delete data.password;
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md border overflow-hidden"
      >
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">{admin ? "Edit Admin" : "Add New Admin"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <input
                type="text" required
                value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <input
                type="text" required
                value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input
              type="email" required disabled={!!admin}
              value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <select
              required
              value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
            >
              <option value="RECRUITER">Recruiter</option>
              <option value="INSTRUCTOR">Instructor</option>
              <option value="CONTENT_MANAGER">Content Manager</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{admin ? "New Password (Optional)" : "Password"}</label>
            <input
              type="password"
              required={!admin}
              value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
              placeholder={admin ? "Leave blank to keep current" : "••••••••"}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 border py-2.5 rounded-lg font-semibold text-sm hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              type="submit" disabled={isPending}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {admin ? "Save Changes" : "Create Admin"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
