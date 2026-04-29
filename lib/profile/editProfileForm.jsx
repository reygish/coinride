import react, { useState } from "react";

const editProfileForm = ({ user, onSave, onCancel }) => {
  const [form, setForm] = useState(
    user || { name: "", email: "", avatar: "", bio: "" }
  );

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div style={styles.card}>
      <h2>edit profile</h2>

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="name"
      />
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="email"
      />
      <input
        name="avatar"
        value={form.avatar}
        onChange={handleChange}
        placeholder="avatar url"
      />
      <textarea
        name="bio"
        value={form.bio}
        onChange={handleChange}
        placeholder="bio"
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={() => onSave(form)}>save</button>
        <button onClick={onCancel} style={{ marginLeft: "10px" }}>
          cancel
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    width: "300px",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
};

export default editProfileForm;