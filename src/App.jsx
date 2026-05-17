import { useEffect, useState } from "react";

export default function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ id: "", pw: "" });
  const [activeMenu, setActiveMenu] = useState("신청관리");

  const [requests, setRequests] = useState([]);
  const [companions, setCompanions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    hospital: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    setRequests(JSON.parse(localStorage.getItem("requests") || "[]"));
    setCompanions(JSON.parse(localStorage.getItem("companions") || "[]"));
    setNotifications(JSON.parse(localStorage.getItem("notifications") || "[]"));
  }, []);

  const saveLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleLogin = () => {
    if (loginForm.id === "admin" && loginForm.pw === "1234") {
      setIsLogin(true);
    } else {
      alert("아이디 또는 비밀번호가 다릅니다.");
    }
  };

  const handleLogout = () => {
    setIsLogin(false);
  };

  const addNotification = (text) => {
    const newNoti = {
      id: Date.now(),
      text,
      read: false,
      time: new Date().toLocaleString(),
    };

    const updated = [newNoti, ...notifications];
    setNotifications(updated);
    saveLocal("notifications", updated);
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({
      ...n,
      read: true,
    }));

    setNotifications(updated);
    saveLocal("notifications", updated);
  };

  const saveRequest = () => {
    if (!form.name || !form.phone) {
      alert("신청자 이름과 연락처를 입력하세요.");
      return;
    }

    const newRequest = {
      id: Date.now(),
      ...form,
      status: "대기중",
      payment: "미결제",
      createdAt: new Date().toLocaleString(),
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);
    saveLocal("requests", updated);

    addNotification(`${form.name}님의 신청이 등록되었습니다.`);

    setForm({
      name: "",
      phone: "",
      hospital: "",
      date: "",
      time: "",
    });
  };

  const updateRequest = (id, field, value) => {
    const updated = requests.map((r) =>
      r.id === id ? { ...r, [field]: value } : r
    );

    setRequests(updated);
    saveLocal("requests", updated);
  };

  const deleteRequest = (id) => {
    if (!confirm("삭제하시겠습니까?")) return;

    const updated = requests.filter((r) => r.id !== id);
    setRequests(updated);
    saveLocal("requests", updated);
  };

  const addCompanion = () => {
    const name = prompt("동행자 이름을 입력하세요.");

    if (!name) return;

    const newCompanion = {
      id: Date.now(),
      name,
      status: "대기",
      memo: "",
    };

    const updated = [...companions, newCompanion];
    setCompanions(updated);
    saveLocal("companions", updated);
  };

  const deleteCompanion = (id) => {
    const updated = companions.filter((c) => c.id !== id);
    setCompanions(updated);
    saveLocal("companions", updated);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("이 기기는 위치공유를 지원하지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const locationText = `위도: ${lat}, 경도: ${lng}`;

        setCurrentLocation(locationText);
        addNotification(`현재 위치 확인 완료: ${locationText}`);
        alert("현재 위치를 가져왔습니다.");
      },
      () => {
        alert("위치 정보를 가져오지 못했습니다.");
      }
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const pageStyle = {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  };

  const topStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "15px",
  };

  const titleStyle = {
    fontSize: "28px",
    margin: 0,
  };

  const logoutStyle = {
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
  };

  const menuStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: "20px",
  };

  const menuButtonStyle = {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "14px",
    fontSize: "16px",
    cursor: "pointer",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "20px",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    boxSizing: "border-box",
  };

  const blueButtonStyle = {
    width: "100%",
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  };

  const smallButtonStyle = {
    padding: "8px 12px",
    marginTop: "8px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  };

  if (!isLogin) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={{ textAlign: "center" }}>🚗 다솜프로미스 관리자</h1>
          <p style={{ textAlign: "center" }}>다솜프로미스 동행서비스</p>

          <input
            style={inputStyle}
            placeholder="아이디"
            value={loginForm.id}
            onChange={(e) =>
              setLoginForm({ ...loginForm, id: e.target.value })
            }
          />

          <input
            style={inputStyle}
            type="password"
            placeholder="비밀번호"
            value={loginForm.pw}
            onChange={(e) =>
              setLoginForm({ ...loginForm, pw: e.target.value })
            }
          />

          <button style={blueButtonStyle} onClick={handleLogin}>
            로그인
          </button>

          <p style={{ textAlign: "center", color: "#666" }}>
            기본 아이디: admin / 비밀번호: 1234
          </p>
        </div>
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
        {["신청관리", "동행자관리", "정산관리", "알림센터", "설정", "위치공유"].map(
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
                color: activeMenu === menu ? "white" : "black",
              }}
            >
              {menu}
              {menu === "알림센터" && unreadCount > 0
                ? ` (${unreadCount})`
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
              style={inputStyle}
              placeholder="신청자 이름"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              style={inputStyle}
              placeholder="연락처"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input
              style={inputStyle}
              placeholder="병원명"
              value={form.hospital}
              onChange={(e) => setForm({ ...form, hospital: e.target.value })}
            />

            <input
              style={inputStyle}
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <input
              style={inputStyle}
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />

            <button style={blueButtonStyle} onClick={saveRequest}>
              저장하기
            </button>
          </div>

          <div style={cardStyle}>
            <h2>📦 신청 목록</h2>

            {requests.length === 0 ? (
              <p>등록된 신청이 없습니다.</p>
            ) : (
              requests.map((r) => (
                <div
                  key={r.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "15px",
                    marginBottom: "12px",
                  }}
                >
                  <p>신청자: {r.name}</p>
                  <p>연락처: {r.phone}</p>
                  <p>병원: {r.hospital}</p>
                  <p>날짜: {r.date}</p>
                  <p>시간: {r.time}</p>

                  <p>상태</p>
                  <select
                    style={inputStyle}
                    value={r.status}
                    onChange={(e) =>
                      updateRequest(r.id, "status", e.target.value)
                    }
                  >
                    <option>대기중</option>
                    <option>배정완료</option>
                    <option>진행중</option>
                    <option>완료</option>
                    <option>취소</option>
                  </select>

                  <p>결제</p>
                  <select
                    style={inputStyle}
                    value={r.payment}
                    onChange={(e) =>
                      updateRequest(r.id, "payment", e.target.value)
                    }
                  >
                    <option>미결제</option>
                    <option>입금대기</option>
                    <option>결제완료</option>
                    <option>환불</option>
                  </select>

                  <button
                    style={{
                      ...smallButtonStyle,
                      background: "#ef4444",
                      color: "white",
                    }}
                    onClick={() => deleteRequest(r.id)}
                  >
                    삭제
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeMenu === "동행자관리" && (
        <div style={cardStyle}>
          <h2>👥 동행자 관리</h2>

          <button style={blueButtonStyle} onClick={addCompanion}>
            동행자 추가
          </button>

          <br />
          <br />

          {companions.length === 0 ? (
            <p>등록된 동행자가 없습니다.</p>
          ) : (
            companions.map((c) => (
              <div
                key={c.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "15px",
                  marginBottom: "12px",
                }}
              >
                <p>이름: {c.name}</p>
                <p>상태: {c.status}</p>

                <button
                  style={{
                    ...smallButtonStyle,
                    background: "#ef4444",
                    color: "white",
                  }}
                  onClick={() => deleteCompanion(c.id)}
                >
                  삭제
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeMenu === "정산관리" && (
        <div style={cardStyle}>
          <h2>💰 정산관리</h2>
          <p>동행자별 정산 기능을 연결할 수 있습니다.</p>
          <p>현재 신청 건수: {requests.length}건</p>
        </div>
      )}

      {activeMenu === "알림센터" && (
        <div style={cardStyle}>
          <h2>🔔 알림센터</h2>

          {notifications.length === 0 ? (
            <p>알림이 없습니다.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "10px 0",
                }}
              >
                <p>{n.text}</p>
                <small>{n.time}</small>
              </div>
            ))
          )}
        </div>
      )}

      {activeMenu === "설정" && (
        <div style={cardStyle}>
          <h2>⚙ 설정</h2>
          <p>관리자 기본 설정 화면입니다.</p>
          <p>로그인 아이디: admin</p>
          <p>비밀번호: 1234</p>
        </div>
      )}

      {activeMenu === "위치공유" && (
        <div style={cardStyle}>
          <h2>📍 위치공유</h2>

          <p>현재 기기의 위치를 확인합니다.</p>

          <button style={blueButtonStyle} onClick={getCurrentLocation}>
            현재 위치 가져오기
            {currentLocation && (
  <button
    style={{
      ...blueButtonStyle,
      marginTop: "10px",
      background: "#16a34a",
    }}
    onClick={() => {
      const match = currentLocation.match(
        /위도: (.*), 경도: (.*)/
      );

      if (!match) return;

      const lat = match[1];
      const lng = match[2];

      window.open(
        `https://www.google.com/maps?q=${lat},${lng}`,
        "_blank"
      );
    }}
  >
    지도에서 보기
  </button>
)}
          </button>

          {currentLocation && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                background: "#f9fafb",
                borderRadius: "10px",
              }}
            >
              <strong>현재 위치</strong>
              <p>{currentLocation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}