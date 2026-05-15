import { useState } from "react";
import "./App.css";

function App() {
  const today = new Date().toISOString().split("T")[0];

  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    disease: "",
    reservationDate: "",
    reservationTime: "",
    address: "",
    carNeeded: "",
    request: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("신청내용:", form);

    setSubmitted(true);

    setForm({
      name: "",
      phone: "",
      disease: "",
      reservationDate: "",
      reservationTime: "",
      address: "",
      carNeeded: "",
      request: "",
    });
  };

  if (submitted) {
    return (
      <div className="app">
        <div className="form-box">
          <h2>신청 완료 😊</h2>

          <p
            style={{
              textAlign: "center",
              lineHeight: "1.8",
              fontSize: "18px",
            }}
          >
            신청이 정상 접수되었습니다.
            <br />
            담당 동행자가 곧 연락드립니다.
          </p>

          <button onClick={() => setSubmitted(false)}>
            새 신청 작성하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1
        style={{
          fontSize: "20px",
          lineHeight: "1.5",
          textAlign: "center",
          color: "#1e3a5f",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        다솜프로미스
        <br />
        동행서비스
      </h1>

      <form className="form-box" onSubmit={handleSubmit}>
        <h2>동행신청하기</h2>

        <input
          type="text"
          name="name"
          placeholder="이름"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="전화번호"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="disease"
          placeholder="병명"
          value={form.disease}
          onChange={handleChange}
        />

        <label className="label">예약일자 선택</label>

        <input
          type="date"
          name="reservationDate"
          value={form.reservationDate}
          onChange={handleChange}
          min={today}
          required
        />

        <label className="label">예약시간 선택</label>

        <input
          type="time"
          name="reservationTime"
          value={form.reservationTime}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="address"
          placeholder="주소"
          value={form.address}
          onChange={handleChange}
          required
        />

        <select
          name="carNeeded"
          value={form.carNeeded}
          onChange={handleChange}
          required
        >
          <option value="">차량 필요 여부 선택</option>
          <option value="필요">차량 필요</option>
          <option value="불필요">차량 불필요</option>
        </select>

        <textarea
          name="request"
          placeholder="요청사항"
          value={form.request}
          onChange={handleChange}
        />

        <button type="submit">
          동행 신청하기
        </button>
      </form>
    </div>
  );
}

export default App;