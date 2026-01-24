"use client";

import { Input } from "@repo/ui/components/input";
import { Plus, Trash2 } from "lucide-react";

interface OtherLinksProps {
  links: string[];
  onChange: (links: string[]) => void;
  errors?: (string | undefined)[];
}

export function OtherLinks({ links, onChange, errors }: OtherLinksProps) {
  const addLink = () => {
    onChange([...links, ""]);
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, value: string) => {
    const updated = [...links];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm text-neutral-400">
          Other Links (optional)
        </label>
        <button
          type="button"
          onClick={addLink}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-400"
        >
          <Plus className="h-3 w-3" />
          Add Link
        </button>
      </div>
      {links.map((link, index) => (
        <div key={index} className="mb-2 flex gap-2">
          <div className="flex-1">
            <Input
              value={link}
              onChange={(e) => updateLink(index, e.target.value)}
              placeholder="https://..."
              className="border-neutral-800 bg-neutral-900"
            />
            {errors?.[index] && (
              <p className="mt-1 text-sm text-red-500">{errors[index]}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeLink(index)}
            className="p-2 text-neutral-500 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
