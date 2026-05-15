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
  deleteDoc,
} from "firebase/firestore";

function App() {
  const [search, setSearch] = useState("");

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
      alert("이름과 전화번호를 입력해주세요.");
      return;
    }

    await addDoc(collection(db, "applications"), {
      ...form,
      createdAt: new Date(),
      status: "신청접수",
    });

    alert("신청이 저장되었습니다.");

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
    const q = query(
      collection(db, "applications"),
      orderBy("createdAt", "desc")
    );

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

  async function deleteApplication(id) {
    const ok = window.confirm("정말 삭제하시겠습니까?");

    if (!ok) return;

    await deleteDoc(doc(db, "applications", id));

    loadApplications();
  }

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApplications = applications.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>다솜프로미스 동행서비스</h1>

      <div style={{ marginBottom: "40px" }}>
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
            height: "100px",
          }}
        />

        <button
          type="button"
          onClick={saveApplication}
          style={mainButtonStyle}
        >
          신청 저장하기
        </button>
      </div>

      <hr />

      <div>
        <h2>관리자 신청 목록</h2>

        <input
          placeholder="이름 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        {filteredApplications.length === 0 ? (
          <p>신청 내역이 없습니다.</p>
        ) : (
          filteredApplications.map((item) => (
            <div key={item.id} style={cardStyle}>
              <p><strong>이름:</strong> {item.name}</p>
              <p><strong>전화번호:</strong> {item.phone}</p>
              <p><strong>병원명:</strong> {item.hospital}</p>
              <p><strong>예약 날짜:</strong> {item.date}</p>
              <p><strong>주소:</strong> {item.address}</p>
              <p><strong>차량 여부:</strong> {item.car}</p>
              <p><strong>요청사항:</strong> {item.memo}</p>

              <p>
                <strong>상태:</strong>{" "}
                <span style={{ color: "#2563eb" }}>
                  {item.status || "신청접수"}
                </span>
              </p>

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => updateStatus(item.id, "접수완료")}
                  style={smallButtonStyle}
                >
                  접수완료
                </button>

                <button
                  onClick={() => updateStatus(item.id, "배정중")}
                  style={smallButtonStyle}
                >
                  배정중
                </button>

                <button
                  onClick={() => updateStatus(item.id, "동행중")}
                  style={smallButtonStyle}
                >
                  동행중
                </button>

                <button
                  onClick={() => updateStatus(item.id, "완료")}
                  style={smallButtonStyle}
                >
                  완료
                </button>

                <button
                  onClick={() => deleteApplication(item.id)}
                  style={{
                    ...smallButtonStyle,
                    backgroundColor: "red",
                    color: "white",
                  }}
                >
                  삭제
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
  padding: "14px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
  fontSize: "16px",
};

const smallButtonStyle = {
  padding: "8px 12px",
  marginRight: "5px",
  marginBottom: "5px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "15px",
  marginBottom: "15px",
  backgroundColor: "#fafafa",
};

export default App;