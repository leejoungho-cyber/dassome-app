// src/App.jsx
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const ADMIN_ID = "admin";
const ADMIN_PW = "1234";
const WORKER_ID = "worker";
const WORKER_PW = "1234";

export default function App() {
  const [userType, setUserType] = useState("");
  const [activeMenu, setActiveMenu] = useState("신청관리");
  const [loginForm, setLoginForm] = useState({ id: "", pw: "" });
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    hospital: "",
    date: "",
    time: "",
    status: "대기중",
    payment: "미결제",
    worker: "",
  });

  useEffect(() => {
    const savedType = localStorage.getItem("dasom_user_type");
    if (savedType) setUserType(savedType);
  }, []);

  useEffect(() => {
    if (!userType) return;

    const savedNotifications = localStorage.getItem("dasom_notifications");
    if (savedNotifications) {
      const list = JSON.parse(savedNotifications);
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    }

    const unsub = onSnapshot(collection(db, "requests"), (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setRequests(list);
    });

    return () => unsub();
  }, [userType]);

  const addNotification = (message) => {
    const newNoti = {
      id: Date.now(),
      message,
      read: false,
      time: new Date().toLocaleString(),
    };

    const newList = [newNoti, ...notifications].slice(0, 50);

    setNotifications(newList);
    setUnreadCount(newList.filter((n) => !n.read).length);
    localStorage.setItem("dasom_notifications", JSON.stringify(newList));
  };

  const markAllRead = () => {
    const newList = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(newList);
    setUnreadCount(0);
    localStorage.setItem("dasom_notifications", JSON.stringify(newList));
  };

  const clearNotifications = () => {
    if (!window.confirm("알림을 모두 삭제하시겠습니까?")) return;
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem("dasom_notifications");
  };

  const handleLogin = () => {
    if (loginForm.id === ADMIN_ID && loginForm.pw === ADMIN_PW) {
      localStorage.setItem("dasom_user_type", "admin");
      setUserType("admin");
      return;
    }

    if (loginForm.id === WORKER_ID && loginForm.pw === WORKER_PW) {
      localStorage.setItem("dasom_user_type", "worker");
      setUserType("worker");
      return;
    }

    alert("아이디 또는 비밀번호가 틀렸습니다.");
  };

  const handleLogout = () => {
    localStorage.removeItem("dasom_user_type");
    setUserType("");
    setLoginForm({ id: "", pw: "" });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      alert("이름과 연락처를 입력하세요.");
      return;
    }

    await addDoc(collection(db, "requests"), {
      ...form,
      createdAt: new Date(),
    });

    addNotification(`🆕 신규 신청: ${form.name}님 / ${form.hospital}`);

    alert("저장 완료");

    setForm({
      name: "",
      phone: "",
      hospital: "",
      date: "",
      time: "",
      status: "대기중",
      payment: "미결제",
      worker: "",
    });
  };

  const updateField = async (id, field, value) => {
    const target = requests.find((r) => r.id === id);

    await updateDoc(doc(db, "requests", id), {
      [field]: value,
    });

    if (field === "status") {
      addNotification(
        `🚦 상태 변경: ${target?.name || "신청"}님 → ${value}`
      );
    }

    if (field === "payment") {
      addNotification(
        `💳 결제 변경: ${target?.name || "신청"}님 → ${value}`
      );
    }

    if (field === "worker") {
      addNotification(
        `👤 동행자 배정: ${target?.name || "신청"}님 → ${value || "미지정"}`
      );
    }
  };

  const handleAcceptRequest = async (item) => {
    await updateDoc(doc(db, "requests", item.id), {
      worker: "worker",
      status: "배정완료",
    });

    addNotification(`✅ 동행자 수락: ${item.name}님 신청`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;

    const target = requests.find((r) => r.id === id);
    await deleteDoc(doc(db, "requests", id));

    addNotification(`🗑 신청 삭제: ${target?.name || "신청"}님`);
  };

  if (!userType) {
    return (
      <div style={pageStyle}>
        <div style={loginBoxStyle}>
          <h1 style={titleStyle}>🔐 로그인</h1>
          <p>다솜프로미스 동행서비스</p>

          <input
            placeholder="아이디"
            value={loginForm.id}
            onChange={(e) =>
              setLoginForm({ ...loginForm, id: e.target.value })
            }
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={loginForm.pw}
            onChange={(e) =>
              setLoginForm({ ...loginForm, pw: e.target.value })
            }
            style={inputStyle}
          />

          <button onClick={handleLogin} style={buttonStyle}>
            로그인
          </button>

          <p style={{ fontSize: 13, color: "#777" }}>
            관리자: admin / 1234
            <br />
            동행자: worker / 1234
          </p>
        </div>
      </div>
    );
  }

  if (userType === "worker") {
    return (
      <div style={pageStyle}>
        <div style={topStyle}>
          <h1 style={titleStyle}>👤 동행자 화면</h1>
          <button onClick={handleLogout} style={logoutStyle}>
            로그아웃
          </button>
        </div>

        <div style={noticeBoxStyle}>
          🔔 알림 {unreadCount > 0 && <b>({unreadCount})</b>}
        </div>

        <WorkerRequestList
          requests={requests}
          updateField={updateField}
          handleAcceptRequest={handleAcceptRequest}
        />

        <NotificationCenter
          notifications={notifications}
          markAllRead={markAllRead}
          clearNotifications={clearNotifications}
        />
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={topStyle}>
        <h1 style={titleStyle}>🚗 다솜프로미스 관리자</h1>
        <button onClick={handleLogout} style={logoutStyle}>
          로그아웃
        </button>
      </div>

      <div style={menuStyle}>
        {["신청관리", "동행자관리", "정산관리", "알림센터", "설정"].map(
          (menu) => (
            <button
              key={menu}
              onClick={() => {
                setActiveMenu(menu);
                if (menu === "알림센터") markAllRead();
              }}
              style={{
                ...menuButtonStyle,
                background: activeMenu === menu ? "#2563eb" : "white",
                color: activeMenu === menu ? "white" : "#111",
              }}
            >
              {menu}
              {menu === "알림센터" && unreadCount > 0
                ? ` 🔴${unreadCount}`
                : ""}
            </button>
          )
        )}
      </div>

      {activeMenu === "신청관리" && (
        <>
          <div style={cardStyle}>
            <h2>📋 신청 등록</h2>

            <input
              placeholder="신청자 이름"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
            />

            <input
              placeholder="연락처"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={inputStyle}
            />

            <input
              placeholder="병원명"
              value={form.hospital}
              onChange={(e) =>
                setForm({ ...form, hospital: e.target.value })
              }
              style={inputStyle}
            />

            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              style={inputStyle}
            />

            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              style={inputStyle}
            />

            <button onClick={handleSubmit} style={buttonStyle}>
              저장하기
            </button>
          </div>

          <RequestList
            requests={requests}
            updateField={updateField}
            handleDelete={handleDelete}
          />
        </>
      )}

      {activeMenu === "동행자관리" && (
        <div style={cardStyle}>
          <h2>👥 동행자관리</h2>
          <RequestList
            requests={requests}
            updateField={updateField}
            handleDelete={handleDelete}
            onlyWorker
          />
        </div>
      )}

      {activeMenu === "정산관리" && (
        <div style={cardStyle}>
          <h2>📊 정산관리</h2>

          {requests.filter((r) => r.status === "완료").length === 0 && (
            <p>완료된 정산 내역이 없습니다.</p>
          )}

          {requests
            .filter((r) => r.status === "완료")
            .map((item) => (
              <div key={item.id} style={itemStyle}>
                <p>
                  <b>동행자:</b> {item.worker || "미지정"}
                </p>
                <p>
                  <b>신청자:</b> {item.name}
                </p>
                <p>
                  <b>병원:</b> {item.hospital}
                </p>
                <p>
                  <b>날짜:</b> {item.date}
                </p>
                <p>
                  <b>결제:</b> {item.payment}
                </p>
              </div>
            ))}
        </div>
      )}

      {activeMenu === "알림센터" && (
        <NotificationCenter
          notifications={notifications}
          markAllRead={markAllRead}
          clearNotifications={clearNotifications}
        />
      )}

      {activeMenu === "설정" && (
        <div style={cardStyle}>
          <h2>⚙ 설정</h2>
          <p>
            <b>서비스명:</b> 다솜프로미스 동행서비스
          </p>
          <p>
            <b>관리자 아이디:</b> admin
          </p>
          <p>
            <b>동행자 아이디:</b> worker
          </p>
        </div>
      )}
    </div>
  );
}

function WorkerRequestList({ requests, updateField, handleAcceptRequest }) {
  return (
    <div style={cardStyle}>
      <h2>📋 배정 가능한 신청</h2>

      {requests.length === 0 && <p>신청 내역이 없습니다.</p>}

      {requests
        .filter((item) => !item.worker || item.worker === "worker")
        .map((item) => (
          <div key={item.id} style={itemStyle}>
            <p>
              <b>신청자:</b> {item.name}
            </p>
            <p>
              <b>병원:</b> {item.hospital}
            </p>
            <p>
              <b>날짜:</b> {item.date}
            </p>
            <p>
              <b>시간:</b> {item.time}
            </p>
            <p>
              <b>상태:</b> {item.status}
            </p>

            {!item.worker && (
              <button
                style={buttonStyle}
                onClick={() => handleAcceptRequest(item)}
              >
                이 신청 수락하기
              </button>
            )}

            {item.worker === "worker" && (
              <>
                <p style={{ color: "#2563eb", fontWeight: "bold" }}>
                  ✅ 내가 수락한 신청입니다.
                </p>

                <button
                  style={buttonStyle}
                  onClick={() => updateField(item.id, "status", "진행중")}
                >
                  진행중으로 변경
                </button>

                <button
                  style={{ ...buttonStyle, marginTop: 10 }}
                  onClick={() => updateField(item.id, "status", "완료")}
                >
                  완료로 변경
                </button>
              </>
            )}
          </div>
        ))}
    </div>
  );
}

function RequestList({ requests, updateField, handleDelete, onlyWorker }) {
  return (
    <div style={cardStyle}>
      <h2>📦 신청 목록</h2>

      {requests.length === 0 && <p>신청 내역이 없습니다.</p>}

      {requests.map((item) => (
        <div key={item.id} style={itemStyle}>
          {!onlyWorker && (
            <>
              <p>
                <b>신청자:</b> {item.name}
              </p>
              <p>
                <b>연락처:</b> {item.phone}
              </p>
              <p>
                <b>병원:</b> {item.hospital}
              </p>
              <p>
                <b>날짜:</b> {item.date}
              </p>
              <p>
                <b>시간:</b> {item.time}
              </p>

              <label style={labelStyle}>
                상태
                <select
                  value={item.status || "대기중"}
                  onChange={(e) =>
                    updateField(item.id, "status", e.target.value)
                  }
                  style={inputStyle}
                >
                  <option>대기중</option>
                  <option>배정완료</option>
                  <option>진행중</option>
                  <option>완료</option>
                  <option>취소</option>
                </select>
              </label>

              <label style={labelStyle}>
                결제
                <select
                  value={item.payment || "미결제"}
                  onChange={(e) =>
                    updateField(item.id, "payment", e.target.value)
                  }
                  style={inputStyle}
                >
                  <option>미결제</option>
                  <option>결제완료</option>
                </select>
              </label>
            </>
          )}

          <label style={labelStyle}>
            동행자
            <input
              value={item.worker || ""}
              placeholder="동행자 이름"
              onChange={(e) => updateField(item.id, "worker", e.target.value)}
              style={inputStyle}
            />
          </label>

          {!onlyWorker && (
            <button onClick={() => handleDelete(item.id)} style={deleteStyle}>
              삭제
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function NotificationCenter({
  notifications,
  markAllRead,
  clearNotifications,
}) {
  return (
    <div style={cardStyle}>
      <h2>🔔 알림센터</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <button onClick={markAllRead} style={smallButtonStyle}>
          모두 읽음
        </button>
        <button onClick={clearNotifications} style={smallDangerButtonStyle}>
          알림 삭제
        </button>
      </div>

      {notifications.length === 0 && <p>알림 내역이 없습니다.</p>}

      {notifications.map((noti) => (
        <div
          key={noti.id}
          style={{
            ...itemStyle,
            background: noti.read ? "#fff" : "#eef4ff",
          }}
        >
          <p style={{ margin: 0 }}>{noti.message}</p>
          <p style={{ fontSize: 12, color: "#777" }}>{noti.time}</p>
        </div>
      ))}
    </div>
  );
}

const pageStyle = {
  padding: "16px",
  fontFamily: "sans-serif",
  background: "#f5f5f5",
  minHeight: "100vh",
  maxWidth: "900px",
  margin: "0 auto",
  boxSizing: "border-box",
};

const loginBoxStyle = {
  width: "100%",
  maxWidth: "400px",
  margin: "60px auto",
  background: "white",
  padding: "24px",
  borderRadius: "14px",
  textAlign: "center",
  boxSizing: "border-box",
};

const topStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
};

const titleStyle = {
  fontSize: "clamp(22px, 5vw, 32px)",
  margin: "10px 0",
};

const menuStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "10px",
  marginBottom: "20px",
};

const menuButtonStyle = {
  border: "1px solid #ddd",
  padding: "13px 10px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
};

const cardStyle = {
  background: "white",
  padding: "18px",
  borderRadius: "14px",
  marginBottom: "20px",
  boxSizing: "border-box",
};

const itemStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "15px",
  marginBottom: "15px",
  background: "#fff",
};

const noticeBoxStyle = {
  background: "#eef4ff",
  border: "1px solid #c7d7ff",
  padding: "12px",
  borderRadius: "12px",
  marginBottom: "15px",
  fontWeight: "bold",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "13px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
  fontSize: "16px",
};

const labelStyle = {
  display: "block",
  fontWeight: "bold",
  marginTop: "10px",
};

const buttonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "14px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  width: "100%",
  fontSize: "16px",
  fontWeight: "bold",
};

const smallButtonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

const smallDangerButtonStyle = {
  background: "red",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

const logoutStyle = {
  background: "#111827",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

const deleteStyle = {
  background: "red",
  color: "white",
  border: "none",
  padding: "11px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
  fontSize: "15px",
};