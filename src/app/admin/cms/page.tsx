"use client";

import { FileEdit, Globe, Image as ImageIcon, LayoutTemplate } from "lucide-react";

export default function CMSPage() {
  const handleEditClick = (pageName: string) => {
    alert(`Opening rich text editor for ${pageName}...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Edit the text, images, and layout of your public website.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Website Pages</h2>
            </div>
            <div className="divide-y">
              {[
                { name: "Homepage", status: "Published", lastEdited: "2 days ago" },
                { name: "About Us", status: "Published", lastEdited: "1 week ago" },
                { name: "Services Overview", status: "Draft", lastEdited: "4 hours ago" },
                { name: "Contact Info", status: "Published", lastEdited: "1 month ago" },
              ].map((page, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <h3 className="font-medium">{page.name}</h3>
                    <p className="text-xs text-muted-foreground">Last edited {page.lastEdited}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${page.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {page.status}
                    </span>
                    <button 
                      onClick={() => handleEditClick(page.name)}
                      className="p-2 border rounded hover:bg-muted transition-colors"
                    >
                      <FileEdit className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Media Library</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Manage logos, hero images, and team photos.</p>
            <button 
              onClick={() => alert('Opening media library overlay...')}
              className="w-full bg-secondary text-secondary-foreground py-2 rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
            >
              Open Library
            </button>
          </div>

          <div className="bg-card border rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <LayoutTemplate className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Global Components</h2>
            </div>
            <div className="space-y-2">
              <button onClick={() => handleEditClick('Header')} className="w-full text-left p-3 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Header & Navigation</button>
              <button onClick={() => handleEditClick('Footer')} className="w-full text-left p-3 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Footer Links</button>
              <button onClick={() => handleEditClick('Banners')} className="w-full text-left p-3 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Call to Action Banners</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
