import { useEffect, useState } from "react";
import { db } from "./firebase";

import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";

function App() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    hospital: "",
    date: "",
    address: "",
    car: "필요",
    memo: "",
  });

  const [applications, setApplications] = useState([]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function saveApplication() {
    if (!form.name || !form.phone) {
      alert("이름과 전화번호는 꼭 입력해주세요.");
      return;
    }

    await addDoc(collection(db, "applications"), {
      ...form,
      createdAt: new Date(),
      status: "신청접수",
    });

    alert(form.name + "님 신청이 저장되었습니다.");

    setForm({
      name: "",
      phone: "",
      hospital: "",
      date: "",
      address: "",
      car: "필요",
      memo: "",
    });

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

  async function updateStatus(id, newStatus) {
    const ref = doc(db, "applications", id);

    await updateDoc(ref, {
      status: newStatus,
    });

    loadApplications();
  }

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>다솜프로미스 동행서비스</h1>

      <div style={{ marginBottom: "30px" }}>
        <h2>병원동행 신청하기</h2>

        <input
          name="name"
          placeholder="이름"
          value={form.name}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          name="phone"
          placeholder="전화번호"
          value={form.phone}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          name="hospital"
          placeholder="병원명"
          value={form.hospital}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          name="address"
          placeholder="주소"
          value={form.address}
          onChange={handleChange}
          style={inputStyle}
        />

        <select
          name="car"
          value={form.car}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="필요">차량 필요</option>
          <option value="불필요">차량 불필요</option>
        </select>

        <textarea
          name="memo"
          placeholder="요청사항"
          value={form.memo}
          onChange={handleChange}
          style={{
            ...inputStyle,
            height: "90px",
          }}
        />

        <button type="button" onClick={saveApplication} style={mainButtonStyle}>
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
            <div key={item.id} style={cardStyle}>
              <p><strong>이름:</strong> {item.name}</p>
              <p><strong>전화번호:</strong> {item.phone}</p>
              <p><strong>병원명:</strong> {item.hospital}</p>
              <p><strong>예약 날짜:</strong> {item.date}</p>
              <p><strong>주소:</strong> {item.address}</p>
              <p><strong>차량:</strong> {item.car}</p>
              <p><strong>요청사항:</strong> {item.memo}</p>
              <p><strong>상태:</strong> {item.status || "신청접수"}</p>

              <div style={{ marginTop: "10px" }}>
                <button onClick={() => updateStatus(item.id, "접수완료")} style={smallButtonStyle}>
                  접수완료
                </button>

                <button onClick={() => updateStatus(item.id, "배정중")} style={smallButtonStyle}>
                  배정중
                </button>

                <button onClick={() => updateStatus(item.id, "동행중")} style={smallButtonStyle}>
                  동행중
                </button>

                <button onClick={() => updateStatus(item.id, "완료")} style={smallButtonStyle}>
                  완료
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  width: "100%",
  marginBottom: "10px",
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: "8px",
};

const mainButtonStyle = {
  padding: "12px 20px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
};

const smallButtonStyle = {
  marginRight: "5px",
  marginBottom: "5px",
  padding: "8px 12px",
  cursor: "pointer",
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "15px",
  marginBottom: "10px",
  backgroundColor: "#fafafa",
};

export default App;