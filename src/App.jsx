import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    hospital: "",
    date: "",
    time: "",
    startPlace: "",
    car: "필요없음",
    memo: "",
  });

  const [list, setList] = useState([]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const loadList = async () => {
    const snapshot = await getDocs(collection(db, "applications"));
    const data = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
    setList(data);
  };

  const saveData = async () => {
    await addDoc(collection(db, "applications"), {
      ...form,
      status: "접수",
      createdAt: new Date(),
    });

    alert("신청 완료 😊");

    setForm({
      name: "",
      phone: "",
      hospital: "",
      date: "",
      time: "",
      startPlace: "",
      car: "필요없음",
      memo: "",
    });

    loadList();
  };

  const changeStatus = async (id, newStatus) => {
    await updateDoc(doc(db, "applications", id), {
      status: newStatus,
    });

    loadList();
  };

  useEffect(() => {
    loadList();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>다솜프로미스</h1>
        <p style={styles.subtitle}>병원동행 서비스</p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>병원동행 신청</h2>

        <input style={styles.input} name="name" placeholder="신청자 이름" value={form.name} onChange={handleChange} />
        <input style={styles.input} name="phone" placeholder="연락처" value={form.phone} onChange={handleChange} />
        <input style={styles.input} name="hospital" placeholder="병원명" value={form.hospital} onChange={handleChange} />

        <div style={styles.row}>
          <input style={styles.inputHalf} type="date" name="date" value={form.date} onChange={handleChange} />
          <input style={styles.inputHalf} type="time" name="time" value={form.time} onChange={handleChange} />
        </div>

        <input style={styles.input} name="startPlace" placeholder="출발 장소" value={form.startPlace} onChange={handleChange} />

        <select style={styles.input} name="car" value={form.car} onChange={handleChange}>
          <option>차량 필요없음</option>
          <option>차량 필요함</option>
        </select>

        <textarea
          style={styles.textarea}
          name="memo"
          placeholder="요청사항"
          value={form.memo}
          onChange={handleChange}
        />

        <button style={styles.mainButton} onClick={saveData}>
          신청 저장하기
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>관리자 신청 목록</h2>

        {list.map((item) => (
          <div key={item.id} style={styles.item}>
            <div style={styles.itemHeader}>
              <strong>{item.name}</strong>
              <span>{item.status}</span>
            </div>

            <p>📞 {item.phone}</p>
            <p>🏥 {item.hospital}</p>
            <p>📅 {item.date} {item.time}</p>
            <p>📍 {item.startPlace}</p>
            <p>🚗 {item.car}</p>
            <p>📝 {item.memo}</p>

            <div style={styles.buttonRow}>
              <button style={styles.smallButton} onClick={() => changeStatus(item.id, "접수")}>접수</button>
              <button style={styles.smallButton} onClick={() => changeStatus(item.id, "진행중")}>진행중</button>
              <button style={styles.smallButton} onClick={() => changeStatus(item.id, "완료")}>완료</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f3f4f6",
    minHeight: "100vh",
    padding: "15px",
    fontFamily: "Arial",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    color: "#2563eb",
    fontSize: "32px",
  },
  subtitle: {
    marginTop: "5px",
    color: "#555",
  },
  card: {
    background: "white",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  row: {
    display: "flex",
    gap: "10px",
  },
  inputHalf: {
    flex: 1,
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "16px",
  },
  textarea: {
    width: "100%",
    height: "100px",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginBottom: "15px",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  mainButton: {
    width: "100%",
    padding: "16px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  item: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "15px",
    marginBottom: "15px",
    background: "#fafafa",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  buttonRow: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
  },
  smallButton: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#374151",
    color: "white",
  },
};

export default App;git config --global user.name "leejoungho"
git config --global user.email "yewoncare@gmail.com"
