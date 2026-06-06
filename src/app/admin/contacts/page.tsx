"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactApi } from "@/lib/api";
import {
  Mail,
  MailOpen,
  Trash2,
  Phone,
  Calendar,
  Tag,
  Search,
  Loader2,
  Inbox,
} from "lucide-react";

interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminContactsPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const { data: messages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["admin-contacts"],
    queryFn: () => contactApi.getAll(),
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => contactApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-contacts"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => contactApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      setSelected(null);
    },
  });

  const handleOpen = (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.isRead) {
      markRead.mutate(msg.id);
    }
  };

  const filtered = messages.filter((m) => {
    const matchesFilter =
      filter === "all" || (filter === "unread" && !m.isRead) || (filter === "read" && m.isRead);
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contact Inbox</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Messages submitted via the public contact form
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, email, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-background"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-280px)]">

        {/* Message List */}
        <div className="lg:col-span-2 bg-card border rounded-xl overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-3">
              <Inbox className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-muted-foreground font-medium">No messages found</p>
              <p className="text-xs text-muted-foreground">
                {search ? "Try a different search term." : "Contact form submissions will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleOpen(msg)}
                  className={`w-full text-left px-4 py-4 hover:bg-muted/50 transition-colors ${
                    selected?.id === msg.id ? "bg-primary/5 border-l-2 border-primary" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.isRead ? (
                        <Mail className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <MailOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={`text-sm truncate ${!msg.isRead ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                        {msg.firstName} {msg.lastName}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  {msg.subject && (
                    <p className="text-xs text-muted-foreground mt-1 ml-6 truncate">{msg.subject}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 ml-6 line-clamp-2">{msg.message}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-3 bg-card border rounded-xl overflow-y-auto">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 gap-3">
              <MailOpen className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">Select a message to read it</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Detail Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selected.firstName} {selected.lastName}
                  </h2>
                  {selected.subject && (
                    <p className="text-sm text-muted-foreground mt-1">{selected.subject}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Delete this message from ${selected.firstName}?`)) {
                      remove.mutate(selected.id);
                    }
                  }}
                  disabled={remove.isPending}
                  className="flex items-center gap-1.5 text-sm text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors font-medium shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 px-3 py-2 rounded-lg">
                  <Mail className="w-4 h-4 shrink-0" />
                  <a href={`mailto:${selected.email}`} className="hover:text-primary transition-colors truncate">
                    {selected.email}
                  </a>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 px-3 py-2 rounded-lg">
                    <Phone className="w-4 h-4 shrink-0" />
                    <a href={`tel:${selected.phone}`} className="hover:text-primary transition-colors">
                      {selected.phone}
                    </a>
                  </div>
                )}
                {selected.subject && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 px-3 py-2 rounded-lg">
                    <Tag className="w-4 h-4 shrink-0" />
                    <span className="truncate">{selected.subject}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 px-3 py-2 rounded-lg">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>
                    {new Date(selected.createdAt).toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="border-t pt-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Message</h3>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              {/* Quick Reply */}
              <div className="border-t pt-6">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your inquiry"}`}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Reply via Email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
