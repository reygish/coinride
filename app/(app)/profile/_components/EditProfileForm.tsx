"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Save, X } from "lucide-react";

type ProfileFormValues = {
  name: string;
  email: string;
  avatar: string;
  bio: string;
};

type EditProfileFormProps = {
  user: ProfileFormValues;
  onSave: (form: ProfileFormValues) => void;
  onCancel: () => void;
  showCancel?: boolean;
};

const EditProfileForm = ({ user, onSave, onCancel, showCancel = true }: EditProfileFormProps) => {
  const [form, setForm] = useState<ProfileFormValues>({
    name: "",
    email: "",
    avatar: "",
    bio: "",
  });

  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-full max-w-2xl p-6 rounded-lg bg-card border border-border space-y-4">
      <h2 className="text-lg font-light tracking-[-0.02em] text-foreground">
        Edit Profile
      </h2>

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      />

      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      />

      <input
        name="avatar"
        value={form.avatar}
        onChange={handleChange}
        placeholder="Avatar URL"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      />

      <textarea
        name="bio"
        value={form.bio}
        onChange={handleChange}
        placeholder="Bio"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onSave(form)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
        >
          <Save size={16} />
          Save
        </button>
        {showCancel ? (
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted transition"
          >
            <X size={16} />
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default EditProfileForm;
