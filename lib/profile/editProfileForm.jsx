import react, { useState, useEffect } from "react";
import { Save, X } from "lucide-react";

const EditProfileForm = ({ user, onSave, onCancel }) => {
  const [form, setForm] = useState(
    user || { name: "", email: "", avatar: "", bio: "" }
  );

  useEffect(() => {
    setForm(user || { name: "", email: "", avatar: "", bio: "" });
  }, [user]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-[320px] p-6 rounded-2xl shadow-lg bg-white space-y-3">
      <h2 className="text-lg font-semibold">edit profile</h2>

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="name"
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="email"
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <input
        name="avatar"
        value={form.avatar}
        onChange={handleChange}
        placeholder="avatar url"
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <textarea
        name="bio"
        value={form.bio}
        onChange={handleChange}
        placeholder="bio"
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onSave(form)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          <Save size={16} />
          save
        </button>

        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-100"
        >
          <X size={16} />
          cancel
        </button>
      </div>
    </div>
  );
};

export default EditProfileForm;