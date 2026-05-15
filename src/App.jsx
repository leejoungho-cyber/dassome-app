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
  const ADMIN_PASSWORD = "1234";

  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [companionName, setCompanionName] = useState("");
  const [isCompanion, setIsCompanion] = useState(false);

  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState([]);

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

  async function addNotification(message) {
    await addDoc(collection(db, "notifications"), {
      message: message,
      createdAt: new Date(),
    });

    loadNotifications();
  }

  function loginAdmin() {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      alert("관리자 로그인 성공");
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  }

  function logoutAdmin() {
    setIsAdmin(false);
    setAdminPassword("");
  }

  function loginCompanion() {
    if (!companionName) {
      alert("동행자 이름을 입력해주세요.");
      return;
    }

    setIsCompanion(true);
  }

  function logoutCompanion() {
    setIsCompanion(false);
    setCompanionName("");
  }

  async function saveApplication() {
    if (!form.name || !form.phone) {
      alert("이름과 전화번호를 입력해주세요.");
      return;
    }

    await addDoc(collection(db, "applications"), {
      ...form,
      createdAt: new Date(),
      status: "대기중",
      companion: "",
    });

    await addNotification(form.name + "님 신청 접수");

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

    const list = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    setApplications(list);
  }

  async function loadNotifications() {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const list = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    setNotifications(list);
  }

  async function updateStatus(id, newStatus, userName) {
    await updateDoc(doc(db, "applications", id), {
      status: newStatus,
    });

    await addNotification(userName + " 상태 변경: " + newStatus);

    loadApplications();
  }

  async function acceptRequest(item) {
    if (item.companion) {
      alert("이미 배정된 신청입니다.");
      return;
    }

    await updateDoc(doc(db, "applications", item.id), {
      companion: companionName,
      status: "배정완료",
    });

    await addNotification(companionName + "님이 " + item.name + " 신청 수락");

    alert("신청을 수락했습니다.");
    loadApplications();
  }

  async function deleteApplication(id, userName) {
    const ok = window.confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    await deleteDoc(doc(db, "applications", id));
    await addNotification(userName + " 신청 삭제");

    loadApplications();
  }

  useEffect(() => {
    loadApplications();
    loadNotifications();
  }, []);

  const filteredApplications = applications.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const waitingApplications = applications.filter((item) => !item.companion);

  const myApplications = applications.filter(
    (item) => item.companion === companionName
  );

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1>다솜프로미스 동행서비스</h1>

      <div style={sectionStyle}>
        <h2>병원동행 신청하기</h2>

        <input name="name" placeholder="이름" value={form.name} onChange={handleChange} style={inputStyle} />
        <input name="phone" placeholder="전화번호" value={form.phone} onChange={handleChange} style={inputStyle} />
        <input name="hospital" placeholder="병원명" value={form.hospital} onChange={handleChange} style={inputStyle} />
        <input name="date" type="date" value={form.date} onChange={handleChange} style={inputStyle} />
        <input name="address" placeholder="주소" value={form.address} onChange={handleChange} style={inputStyle} />

        <select name="car" value={form.car} onChange={handleChange} style={inputStyle}>
          <option value="필요">차량 필요</option>
          <option value="불필요">차량 불필요</option>
        </select>

        <textarea
          name="memo"
          placeholder="요청사항"
          value={form.memo}
          onChange={handleChange}
          style={{ ...inputStyle, height: "100px" }}
        />

        <button type="button" onClick={saveApplication} style={mainButtonStyle}>
          신청 저장하기
        </button>
      </div>

      <div style={sectionStyle}>
        <h2>관리자 로그인</h2>

        {!isAdmin ? (
          <>
            <input
              type="password"
              placeholder="관리자 비밀번호"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              style={inputStyle}
            />

            <button type="button" onClick={loginAdmin} style={adminButtonStyle}>
              관리자 로그인
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={logoutAdmin} style={logoutButtonStyle}>
              관리자 로그아웃
            </button>

            <h2>전체 신청 목록</h2>

            <input
              placeholder="이름 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />

            {filteredApplications.map((item) => (
              <div key={item.id} style={cardStyle}>
                <p><strong>이름:</strong> {item.name}</p>
                <p><strong>전화번호:</strong> {item.phone}</p>
                <p><strong>병원명:</strong> {item.hospital}</p>
                <p><strong>예약 날짜:</strong> {item.date}</p>
                <p><strong>주소:</strong> {item.address}</p>
                <p><strong>상태:</strong> {item.status}</p>
                <p><strong>동행자:</strong> {item.companion || "미배정"}</p>

                <button
                  onClick={() => deleteApplication(item.id, item.name)}
                  style={deleteButtonStyle}
                >
                  삭제
                </button>
              </div>
            ))}

            <hr />

            <h2>실시간 알림 내역</h2>

            {notifications.length === 0 ? (
              <p>아직 알림 내역이 없습니다.</p>
            ) : (
              notifications.map((item) => (
                <div key={item.id} style={notificationStyle}>
                  🔔 {item.message}
                </div>
              ))
            )}
          </>
        )}
      </div>

      <div style={sectionStyle}>
        <h2>동행자 로그인</h2>

        {!isCompanion ? (
          <>
            <input
              placeholder="동행자 이름"
              value={companionName}
              onChange={(e) => setCompanionName(e.target.value)}
              style={inputStyle}
            />

            <button type="button" onClick={loginCompanion} style={greenButtonStyle}>
              동행자 로그인
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={logoutCompanion} style={logoutButtonStyle}>
              동행자 로그아웃
            </button>

            <h2>공동배포 신청 목록</h2>

            {waitingApplications.length === 0 ? (
              <p>현재 대기중 신청이 없습니다.</p>
            ) : (
              waitingApplications.map((item) => (
                <div key={item.id} style={cardStyle}>
                  <p><strong>신청자:</strong> {item.name}</p>
                  <p><strong>병원:</strong> {item.hospital}</p>
                  <p><strong>날짜:</strong> {item.date}</p>
                  <p><strong>주소:</strong> {item.address}</p>

                  <button onClick={() => acceptRequest(item)} style={greenButtonStyle}>
                    내가 수락하기
                  </button>
                </div>
              ))
            )}

            <hr />

            <h2>{companionName}님의 진행 목록</h2>

            {myApplications.length === 0 ? (
              <p>진행중 신청이 없습니다.</p>
            ) : (
              myApplications.map((item) => (
                <div key={item.id} style={cardStyle}>
                  <p><strong>신청자:</strong> {item.name}</p>
                  <p><strong>전화번호:</strong> {item.phone}</p>
                  <p><strong>병원:</strong> {item.hospital}</p>
                  <p><strong>주소:</strong> {item.address}</p>
                  <p><strong>현재 상태:</strong> {item.status}</p>

                  <button onClick={() => updateStatus(item.id, "출발중", item.name)} style={smallButtonStyle}>출발중</button>
                  <button onClick={() => updateStatus(item.id, "도착완료", item.name)} style={smallButtonStyle}>도착완료</button>
                  <button onClick={() => updateStatus(item.id, "진료중", item.name)} style={smallButtonStyle}>진료중</button>
                  <button onClick={() => updateStatus(item.id, "귀가중", item.name)} style={smallButtonStyle}>귀가중</button>
                  <button onClick={() => updateStatus(item.id, "서비스완료", item.name)} style={greenButtonStyle}>서비스완료</button>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

const sectionStyle = {
  marginBottom: "35px",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
};

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
};

const adminButtonStyle = {
  ...mainButtonStyle,
  backgroundColor: "#111827",
};

const logoutButtonStyle = {
  ...mainButtonStyle,
  backgroundColor: "#6b7280",
};

const greenButtonStyle = {
  ...mainButtonStyle,
  backgroundColor: "#10b981",
};

const smallButtonStyle = {
  padding: "8px 12px",
  marginRight: "5px",
  marginBottom: "5px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
};

const deleteButtonStyle = {
  ...smallButtonStyle,
  backgroundColor: "red",
  color: "white",
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "15px",
  marginBottom: "15px",
  backgroundColor: "#fafafa",
};

const notificationStyle = {
  padding: "10px",
  marginBottom: "8px",
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
};

export default App;