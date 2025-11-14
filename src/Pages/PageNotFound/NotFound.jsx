import React from "react";
 // optional if you want custom styling

const NotFound = () => {
  return (
    <div style={styles.wrapper}>
      <h1 style={styles.code}>404</h1>
      <p style={styles.text}>Page Not Found</p>
    </div>
  );
};

export default NotFound;

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#111",
    color: "#fff",
    textAlign: "center",
  },
  code: {
    fontSize: "90px",
    margin: 0,
    fontWeight: "700",
  },
  text: {
    fontSize: "20px",
    opacity: 0.8,
    marginTop: "10px",
  },
};
