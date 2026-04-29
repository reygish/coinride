import react from "react";

const userProfileCard = ({ user, onEdit }) => {
  return (
    <div style={styles.card}>
      <img src={user.avatar} alt="avatar" style={styles.avatar} />
      <h2>{user.name}</h2>
      <p style={styles.email}>{user.email}</p>
      <p>{user.bio}</p>

      <button style={styles.button} onClick={onEdit}>
        edit profile
      </button>
    </div>
  );
};

const styles = {
  card: {
    width: "300px",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    backgroundColor: "#fff",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
  },
  email: {
    color: "gray",
    fontSize: "14px",
  },
  button: {
    marginTop: "10px",
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
};

export default userProfileCard;