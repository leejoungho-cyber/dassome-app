import { useState } from "react";

function App() {
  const [name, setName] = useState("");

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>다솜프로미스 동행서비스</h1>

      <input
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          marginBottom: "10px",
          display: "block",
        }}
      />

      <button
        style={{
          padding: "12px 20px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
        }}
      >
        신청 저장하기
      </button>
    </div>
  );
}

export default App;