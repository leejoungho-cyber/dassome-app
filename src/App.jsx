import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";

function App() {
  const [name, setName] = useState("");
  const [applications, setApplications] = useState([]);

  async function saveApplication() {
    if (!name) {
      alert("이름을 입력해주세요.");
      return;
    }

    await addDoc(collection(db, "applications"), {
      name: name,
      createdAt: new Date(),
      status: "신청접수",
    });

    alert(name + "님 신청이 저장되었습니다.");
    setName("");
    loadApplications();
  }

  async function loadApplications() {
    const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setApplications(list);
  }

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <div style={{ padding: "30px", maxWidth: "700px", margin: "0 auto" }}>
      <h1>다솜프로미스 동행서비스</h1>

      <div style={{ marginBottom: "30px" }}>
        <h2>신청하기</h2>

        <input
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
          }}
        />

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

      <hr />

      <div>
        <h2>관리자 신청 목록</h2>

        {applications.length === 0 ? (
          <p>아직 신청이 없습니다.</p>
        ) : (
          applications.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "10px",
              }}
            >
              <p><strong>이름:</strong> {item.name}</p>
              <p><strong>상태:</strong> {item.status || "신청접수"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;