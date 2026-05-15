import { useState } from "react";
import "./App.css";

function App() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    phone: "",
    disease: "",
    reservationDate: "",
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

    alert("동행 신청이 접수되었습니다.");

    setForm({
      name: "",
      phone: "",
      disease: "",
      reservationDate: "",
      address: "",
      carNeeded: "",
      request: "",
    });
  };

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
        <h2>병원동행 신청하기</h2>

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