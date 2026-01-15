"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

interface Sponsor {
  id: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
}

interface SponsorCardProps {
  sponsor: Sponsor;
  onUpdate: (id: string, formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success?: boolean; error?: string }>;
}

export function SponsorCard({ sponsor, onUpdate, onDelete }: SponsorCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await onUpdate(sponsor.id, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Sponsor updated");
        setIsEditing(false);
      }
    } catch {
      toast.error("Failed to update sponsor");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this sponsor?")) return;
    
    setIsLoading(true);
    try {
      const result = await onDelete(sponsor.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Sponsor deleted");
      }
    } catch {
      toast.error("Failed to delete sponsor");
    } finally {
      setIsLoading(false);
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-lg border p-4 shadow-sm">
        <form onSubmit={handleUpdate} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor={`name-${sponsor.id}`}>Name</Label>
            <Input id={`name-${sponsor.id}`} name="name" defaultValue={sponsor.name} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`websiteUrl-${sponsor.id}`}>Website URL</Label>
            <Input id={`websiteUrl-${sponsor.id}`} name="websiteUrl" defaultValue={sponsor.websiteUrl || ""} placeholder="https://..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`logoUrl-${sponsor.id}`}>Logo URL</Label>
            <Input id={`logoUrl-${sponsor.id}`} name="logoUrl" defaultValue={sponsor.logoUrl || ""} placeholder="https://..." required />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`description-${sponsor.id}`}>Description</Label>
            <Input id={`description-${sponsor.id}`} name="description" defaultValue={sponsor.description || ""} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" size="sm" disabled={isLoading}>
              <Check className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 shadow-sm relative group">
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} title="Edit">
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete} title="Delete">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      
      <div className="mb-2 pr-16">
        <h3 className="font-semibold truncate">{sponsor.name}</h3>
      </div>
      
      {sponsor.logoUrl && (
        <div className="mb-3 h-16 flex items-center justify-start">
          <img 
            src={sponsor.logoUrl} 
            alt={sponsor.name} 
            className="h-full object-contain" 
          />
        </div>
      )}
      
      {sponsor.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{sponsor.description}</p>
      )}
      
      {sponsor.websiteUrl && (
        <a 
          href={sponsor.websiteUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="text-xs text-blue-500 hover:underline"
        >
          Visit Website
        </a>
      )}
    </div>
  );
}
