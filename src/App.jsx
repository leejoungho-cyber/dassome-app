import { useState } from "react";
import { db } from "./firebase";

import { collection, addDoc } from "firebase/firestore";

function App() {
  const [name, setName] = useState("");

  async function saveApplication() {
    try {
      await addDoc(collection(db, "applications"), {
        name: name,
        createdAt: new Date(),
      });

      alert(name + "님 신청이 저장되었습니다.");
      setName("");
    } catch (error) {
      console.error(error);
      alert("저장 실패");
    }
  }

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h1>다솜프로미스 동행서비스</h1>

      <input
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          marginBottom: "10px",
        }}
      />

      <br />

      <button
        type="button"
        onClick={saveApplication}
        style={{
          padding: "12px 20px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        신청 저장하기
      </button>
    </div>
  );
}

export default App;