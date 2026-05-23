"use client";

import { deleteProject } from "./actions";

export function DeleteButton({ slug, title }: { slug: string; title: string }) {
  return (
    <form action={deleteProject}>
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className="px-2 py-1 text-xs text-bone/30 transition-colors hover:text-red-400"
        onClick={(e) => {
          if (!confirm(`Delete "${title}"?`)) e.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}
