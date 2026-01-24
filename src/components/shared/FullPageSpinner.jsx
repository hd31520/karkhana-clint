const FullPageSpinner = () => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh"
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: "4px solid #ccc",
        borderTop: "4px solid #333",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
    </div>
  );
};

export default FullPageSpinner;
