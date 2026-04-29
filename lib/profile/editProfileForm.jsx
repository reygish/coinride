"use client";

import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";

const EditProfileForm = ({ user, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    avatar: "",
    bio: "",
  });

  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-full max-w-2xl p-6 rounded-2xl bg-card shadow-md space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        Edit Profile
      </h2>

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        className="w-full rounded-lg bg-muted px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
      />

      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full rounded-lg bg-muted px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
      />

      <input
        name="avatar"
        value={form.avatar}
        onChange={handleChange}
        placeholder="Avatar URL"
        className="w-full rounded-lg bg-muted px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
      />

      <textarea
        name="bio"
        value={form.bio}
        onChange={handleChange}
        placeholder="Bio"
        className="w-full rounded-lg bg-muted px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
      />

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onSave(form)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          <Save size={16} />
          Save
        </button>

        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProfileForm;