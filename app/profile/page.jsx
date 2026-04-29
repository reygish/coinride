"use client";

import react, { useState } from "react";
import userProfileCard from "@/lib/profile/userProfileCard";
import editProfileForm from "@/lib/profile/editProfileForm";

export default function page() {
  const [user, setUser] = useState(null); // awalnya kosong
  const [isEditing, setIsEditing] = useState(true); // langsung form

  return (
    <div style={styles.container}>
      {isEditing ? (
        <editProfileForm
          user={user || { name: "", email: "", avatar: "", bio: "" }}
          onSave={(updatedUser) => {
            setUser(updatedUser);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : user ? (
        <userProfileCard
          user={user}
          onEdit={() => setIsEditing(true)}
        />
      ) : (
        <p>no profile yet</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
  },
};