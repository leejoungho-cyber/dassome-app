import React, { useEffect, useMemo, useState } from "react";

const COMPANIONS_KEY = "dasom_companions";
const RECORDS_KEY = "dasom_settlement_records";

export default function SettlementPage() {
  const [unitMinutes, setUnitMinutes] = useState(30);
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [paymentFilter, setPaymentFilter] = useState("전체결제");

  const [companions, setCompanions] = useState(() => {
    const saved = localStorage.getItem(COMPANIONS_KEY);
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, name: "김동행", hourlyRate: 13000 },
          { id: 2, name: "박동행", hourlyRate: 15000 },
        ];
  });

  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem(RECORDS_KEY);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            companion: "김동행",
            customer: "홍길동",
            customerPhone: "010-0000-0000",
            date: "2026-05-16",
            startTime: "09:00",
            endTime: "11:30",
            customerCharge: 60000,
            paymentStatus: "미결제",
            paymentMethod: "카드",
            paymentDate: "",
            depositConfirmDate: "",
            approvalNumber: "",
            paymentLink: "",
            status: "대기",
            extraFee: 0,
            parkingFee: 3000,
            transportFee: 5000,
            memo: "한림병원 동행",
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem(COMPANIONS_KEY, JSON.stringify(companions));
  }, [companions]);

  useEffect(() => {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }, [records]);

  const getHourlyRate = (name) =>
    Number(companions.find((item) => item.name === name)?.hourlyRate || 0);

  const calculateMinutes = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return Math.max(eh * 60 + em - (sh * 60 + sm), 0);
  };

  const roundMinutes = (minutes) =>
    minutes <= 0 ? 0 : Math.ceil(minutes / unitMinutes) * unitMinutes;

  const calculateBasePay = (item) => {
    const rounded = roundMinutes(calculateMinutes(item.startTime, item.endTime));
    return Math.round((rounded / 60) * getHourlyRate(item.companion));
  };

  const calculateFinalPay = (item) =>
    calculateBasePay(item) +
    Number(item.extraFee || 0) +
    Number(item.parkingFee || 0) +
    Number(item.transportFee || 0);

  const calculateProfit = (item) =>
    Number(item.customerCharge || 0) - calculateFinalPay(item);

  const calculateProfitRate = (item) => {
    const charge = Number(item.customerCharge || 0);
    return charge > 0 ? Math.round((calculateProfit(item) / charge) * 100) : 0;
  };

  const makePaymentMessage = (item) => {
    const charge = Number(item.customerCharge || 0).toLocaleString();
    const link = item.paymentLink || "결제링크를 입력해 주세요.";

    return `${item.customer || "고객"}님, 안녕하세요.
다솜프로미스 동행서비스 이용금액은 ${charge}원입니다.

아래 결제링크를 통해 카드결제 부탁드립니다.
결제링크: ${link}

감사합니다.
다솜프로미스 드림`;
  };

  const copyPaymentMessage = async (item) => {
    const message = makePaymentMessage(item);

    try {
      await navigator.clipboard.writeText(message);
      alert("결제요청 문구가 복사되었습니다.");
    } catch {
      window.prompt("아래 문구를 복사하세요.", message);
    }
  };

  const sendSmsMessage = (item) => {
    const phone = item.customerPhone || "";
    const message = encodeURIComponent(makePaymentMessage(item));

    if (!phone) {
      alert("고객 연락처를 먼저 입력해 주세요.");
      return;
    }

    window.location.href = `sms:${phone}?body=${message}`;
  };

  const monthRecords = useMemo(() => {
    return records.filter((item) =>
      selectedMonth ? item.date?.startsWith(selectedMonth) : true
    );
  }, [records, selectedMonth]);

  const filteredRecords = useMemo(() => {
    let list = monthRecords;

    if (statusFilter !== "전체") {
      list = list.filter((item) => (item.status || "대기") === statusFilter);
    }

    if (paymentFilter !== "전체결제") {
      list = list.filter(
        (item) => (item.paymentStatus || "미결제") === paymentFilter
      );
    }

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      list = list.filter((item) =>
        [
          item.companion,
          item.customer,
          item.customerPhone,
          item.date,
          item.status,
          item.paymentStatus,
          item.paymentMethod,
          item.approvalNumber,
          item.paymentLink,
          item.memo,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      );
    }

    return list;
  }, [monthRecords, searchText, statusFilter, paymentFilter]);

  const totalCustomerCharge = filteredRecords.reduce(
    (sum, item) => sum + Number(item.customerCharge || 0),
    0
  );

  const totalFinalPay = filteredRecords.reduce(
    (sum, item) => sum + calculateFinalPay(item),
    0
  );

  const totalProfit = totalCustomerCharge - totalFinalPay;

  const totalPaidAmount = filteredRecords
    .filter((item) => item.paymentStatus === "결제완료")
    .reduce((sum, item) => sum + Number(item.customerCharge || 0), 0);

  const totalUnpaidAmount = filteredRecords
    .filter((item) => (item.paymentStatus || "미결제") === "미결제")
    .reduce((sum, item) => sum + Number(item.customerCharge || 0), 0);

  const updateRecord = (id, field, value) => {
    const numberFields = [
      "customerCharge",
      "extraFee",
      "parkingFee",
      "transportFee",
    ];

    setRecords((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: numberFields.includes(field) ? Number(value) : value,
            }
          : item
      )
    );
  };

  const addRecord = () => {
    setRecords((prev) => [
      ...prev,
      {
        id: Date.now(),
        companion: companions[0]?.name || "",
        customer: "",
        customerPhone: "",
        date: selectedMonth ? `${selectedMonth}-01` : "",
        startTime: "",
        endTime: "",
        customerCharge: 0,
        paymentStatus: "미결제",
        paymentMethod: "카드",
        paymentDate: "",
        depositConfirmDate: "",
        approvalNumber: "",
        paymentLink: "",
        status: "대기",
        extraFee: 0,
        parkingFee: 0,
        transportFee: 0,
        memo: "",
      },
    ]);
  };

  const deleteRecord = (id) => {
    setRecords((prev) => prev.filter((item) => item.id !== id));
  };

  const addCompanion = () => {
    setCompanions((prev) => [
      ...prev,
      { id: Date.now(), name: "", hourlyRate: 12000 },
    ]);
  };

  const updateCompanion = (id, field, value) => {
    setCompanions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "hourlyRate" ? Number(value) : value,
            }
          : item
      )
    );
  };

  const deleteCompanion = (id) => {
    setCompanions((prev) => prev.filter((item) => item.id !== id));
  };

  const downloadCSV = () => {
    const headers = [
      "날짜",
      "동행자",
      "고객명",
      "고객연락처",
      "고객청구",
      "결제상태",
      "결제방법",
      "결제일",
      "입금확인일",
      "승인번호",
      "결제링크",
      "지급액",
      "센터수익",
      "수익률",
      "정산상태",
      "비고",
    ];

    const rows = filteredRecords.map((item) => [
      item.date,
      item.companion,
      item.customer,
      item.customerPhone || "",
      Number(item.customerCharge || 0),
      item.paymentStatus || "미결제",
      item.paymentMethod || "카드",
      item.paymentDate || "",
      item.depositConfirmDate || "",
      item.approvalNumber || "",
      item.paymentLink || "",
      calculateFinalPay(item),
      calculateProfit(item),
      `${calculateProfitRate(item)}%`,
      item.status || "대기",
      item.memo || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `결제정산_${selectedMonth}_${paymentFilter}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>정산관리</h1>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>정산 기본 설정</h2>

        <div style={styles.settingRow}>
          <label style={styles.label}>정산 월</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.settingRow}>
          <label style={styles.label}>정산 단위</label>
          <select
            value={unitMinutes}
            onChange={(e) => setUnitMinutes(Number(e.target.value))}
            style={styles.input}
          >
            <option value={10}>10분 단위</option>
            <option value={30}>30분 단위</option>
            <option value={60}>1시간 단위</option>
          </select>
        </div>

        <div style={styles.settingRow}>
          <label style={styles.label}>정산 필터</label>
          {["전체", "대기", "승인", "지급완료"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={
                statusFilter === status
                  ? styles.activeStatusButton
                  : styles.statusButton
              }
            >
              {status}
            </button>
          ))}
        </div>

        <div style={styles.settingRow}>
          <label style={styles.label}>결제 필터</label>
          {["전체결제", "미결제", "결제완료", "환불"].map((status) => (
            <button
              key={status}
              onClick={() => setPaymentFilter(status)}
              style={
                paymentFilter === status
                  ? styles.activeStatusButton
                  : styles.statusButton
              }
            >
              {status}
            </button>
          ))}
        </div>

        <div style={styles.settingRow}>
          <label style={styles.label}>검색</label>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="고객명, 연락처, 승인번호 검색"
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.headerRow}>
          <h2 style={styles.cardTitle}>동행자 개인별 시급 설정</h2>
          <button onClick={addCompanion} style={styles.addButton}>
            + 동행자 추가
          </button>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>동행자</th>
              <th style={styles.th}>시급</th>
              <th style={styles.th}>관리</th>
            </tr>
          </thead>

          <tbody>
            {companions.map((item) => (
              <tr key={item.id}>
                <td style={styles.td}>
                  <input
                    value={item.name}
                    onChange={(e) =>
                      updateCompanion(item.id, "name", e.target.value)
                    }
                    style={styles.smallInput}
                  />
                </td>

                <td style={styles.td}>
                  <input
                    type="number"
                    value={item.hourlyRate}
                    onChange={(e) =>
                      updateCompanion(item.id, "hourlyRate", e.target.value)
                    }
                    style={styles.moneyInput}
                  />
                  원
                </td>

                <td style={styles.td}>
                  <button
                    onClick={() => deleteCompanion(item.id)}
                    style={styles.deleteButton}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>고객 청구금액</div>
          <div style={styles.summaryValue}>
            {totalCustomerCharge.toLocaleString()}원
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>결제완료 금액</div>
          <div style={styles.summaryValue}>
            {totalPaidAmount.toLocaleString()}원
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>미수금</div>
          <div style={styles.unpaidValue}>
            {totalUnpaidAmount.toLocaleString()}원
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>센터 수익</div>
          <div style={styles.profitValue}>{totalProfit.toLocaleString()}원</div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.headerRow}>
          <h2 style={styles.cardTitle}>동행자 상세 정산내역</h2>

          <div>
            <button onClick={downloadCSV} style={styles.csvButton}>
              CSV 다운로드
            </button>

            <button onClick={addRecord} style={styles.addButton}>
              + 정산 추가
            </button>
          </div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>날짜</th>
                <th style={styles.th}>동행자</th>
                <th style={styles.th}>고객명</th>
                <th style={styles.th}>고객연락처</th>
                <th style={styles.th}>시작</th>
                <th style={styles.th}>종료</th>
                <th style={styles.th}>고객청구</th>
                <th style={styles.th}>결제상태</th>
                <th style={styles.th}>결제방법</th>
                <th style={styles.th}>결제일</th>
                <th style={styles.th}>입금확인일</th>
                <th style={styles.th}>승인번호</th>
                <th style={styles.th}>결제링크</th>
                <th style={styles.th}>결제문구</th>
                <th style={styles.th}>문자발송</th>
                <th style={styles.th}>지급액</th>
                <th style={styles.th}>센터수익</th>
                <th style={styles.th}>수익률</th>
                <th style={styles.th}>정산상태</th>
                <th style={styles.th}>비고</th>
                <th style={styles.th}>관리</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((item) => {
                const finalPay = calculateFinalPay(item);
                const profit = calculateProfit(item);
                const profitRate = calculateProfitRate(item);

                return (
                  <tr key={item.id}>
                    <td style={styles.td}>
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) =>
                          updateRecord(item.id, "date", e.target.value)
                        }
                        style={styles.smallInput}
                      />
                    </td>

                    <td style={styles.td}>
                      <select
                        value={item.companion}
                        onChange={(e) =>
                          updateRecord(item.id, "companion", e.target.value)
                        }
                        style={styles.smallInput}
                      >
                        <option value="">선택</option>
                        {companions.map((person) => (
                          <option key={person.id} value={person.name}>
                            {person.name || "이름없음"}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={styles.td}>
                      <input
                        value={item.customer}
                        onChange={(e) =>
                          updateRecord(item.id, "customer", e.target.value)
                        }
                        style={styles.smallInput}
                      />
                    </td>

                    <td style={styles.td}>
                      <input
                        value={item.customerPhone || ""}
                        onChange={(e) =>
                          updateRecord(item.id, "customerPhone", e.target.value)
                        }
                        placeholder="010-0000-0000"
                        style={styles.phoneInput}
                      />
                    </td>

                    <td style={styles.td}>
                      <input
                        type="time"
                        value={item.startTime}
                        onChange={(e) =>
                          updateRecord(item.id, "startTime", e.target.value)
                        }
                        style={styles.smallInput}
                      />
                    </td>

                    <td style={styles.td}>
                      <input
                        type="time"
                        value={item.endTime}
                        onChange={(e) =>
                          updateRecord(item.id, "endTime", e.target.value)
                        }
                        style={styles.smallInput}
                      />
                    </td>

                    <td style={styles.td}>
                      <input
                        type="number"
                        value={item.customerCharge || 0}
                        onChange={(e) =>
                          updateRecord(item.id, "customerCharge", e.target.value)
                        }
                        style={styles.moneyInput}
                      />
                    </td>

                    <td style={styles.td}>
                      <select
                        value={item.paymentStatus || "미결제"}
                        onChange={(e) =>
                          updateRecord(item.id, "paymentStatus", e.target.value)
                        }
                        style={styles.statusSelect}
                      >
                        <option value="미결제">미결제</option>
                        <option value="결제완료">결제완료</option>
                        <option value="환불">환불</option>
                      </select>
                    </td>

                    <td style={styles.td}>
                      <select
                        value={item.paymentMethod || "카드"}
                        onChange={(e) =>
                          updateRecord(item.id, "paymentMethod", e.target.value)
                        }
                        style={styles.statusSelect}
                      >
                        <option value="카드">카드</option>
                        <option value="계좌이체">계좌이체</option>
                        <option value="현금">현금</option>
                      </select>
                    </td>

                    <td style={styles.td}>
                      <input
                        type="date"
                        value={item.paymentDate || ""}
                        onChange={(e) =>
                          updateRecord(item.id, "paymentDate", e.target.value)
                        }
                        style={styles.smallInput}
                      />
                    </td>

                    <td style={styles.td}>
                      <input
                        type="date"
                        value={item.depositConfirmDate || ""}
                        onChange={(e) =>
                          updateRecord(
                            item.id,
                            "depositConfirmDate",
                            e.target.value
                          )
                        }
                        style={styles.smallInput}
                      />
                    </td>

                    <td style={styles.td}>
                      <input
                        value={item.approvalNumber || ""}
                        onChange={(e) =>
                          updateRecord(item.id, "approvalNumber", e.target.value)
                        }
                        placeholder="승인번호"
                        style={styles.smallInput}
                      />
                    </td>

                    <td style={styles.td}>
                      <input
                        value={item.paymentLink || ""}
                        onChange={(e) =>
                          updateRecord(item.id, "paymentLink", e.target.value)
                        }
                        placeholder="결제링크"
                        style={styles.linkInput}
                      />

                      {item.paymentLink && (
                        <button
                          onClick={() => window.open(item.paymentLink, "_blank")}
                          style={styles.linkButton}
                        >
                          열기
                        </button>
                      )}
                    </td>

                    <td style={styles.td}>
                      <button
                        onClick={() => copyPaymentMessage(item)}
                        style={styles.messageButton}
                      >
                        문구복사
                      </button>
                    </td>

                    <td style={styles.td}>
                      <button
                        onClick={() => sendSmsMessage(item)}
                        style={styles.smsButton}
                      >
                        문자보내기
                      </button>
                    </td>

                    <td style={styles.finalPay}>{finalPay.toLocaleString()}원</td>
                    <td style={styles.profitCell}>{profit.toLocaleString()}원</td>
                    <td style={styles.profitCell}>{profitRate}%</td>

                    <td style={styles.td}>
                      <select
                        value={item.status || "대기"}
                        onChange={(e) =>
                          updateRecord(item.id, "status", e.target.value)
                        }
                        style={styles.statusSelect}
                      >
                        <option value="대기">대기</option>
                        <option value="승인">승인</option>
                        <option value="지급완료">지급완료</option>
                      </select>
                    </td>

                    <td style={styles.td}>
                      <input
                        value={item.memo || ""}
                        onChange={(e) =>
                          updateRecord(item.id, "memo", e.target.value)
                        }
                        style={styles.memoInput}
                      />
                    </td>

                    <td style={styles.td}>
                      <button
                        onClick={() => deleteRecord(item.id)}
                        style={styles.deleteButton}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td style={styles.emptyTd} colSpan="21">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "24px",
    background: "#f6f7fb",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  title: { fontSize: "28px", marginBottom: "20px" },
  card: {
    background: "#fff",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  cardTitle: { fontSize: "20px", marginBottom: "16px" },
  settingRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  label: { width: "100px", fontWeight: "bold" },
  input: inputStyle(),
  searchInput: { ...inputStyle(), width: "320px" },
  tableWrap: { overflowX: "auto" },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  summaryCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  summaryLabel: { color: "#666", fontSize: "14px", marginBottom: "8px" },
  summaryValue: { fontSize: "24px", fontWeight: "bold", color: "#2563eb" },
  unpaidValue: { fontSize: "24px", fontWeight: "bold", color: "#dc2626" },
  profitValue: { fontSize: "24px", fontWeight: "bold", color: "#16a34a" },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "12px" },
  th: {
    background: "#eef2ff",
    padding: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "8px",
    border: "1px solid #ddd",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  emptyTd: {
    padding: "20px",
    border: "1px solid #ddd",
    textAlign: "center",
    color: "#777",
  },
  smallInput: inputSmall("130px"),
  phoneInput: inputSmall("150px"),
  moneyInput: { ...inputSmall("90px"), textAlign: "right" },
  memoInput: inputSmall("220px"),
  linkInput: inputSmall("240px"),
  statusSelect: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontWeight: "bold",
  },
  finalPay: {
    padding: "8px",
    border: "1px solid #ddd",
    textAlign: "center",
    fontWeight: "bold",
    color: "#dc2626",
  },
  profitCell: {
    padding: "8px",
    border: "1px solid #ddd",
    textAlign: "center",
    fontWeight: "bold",
    color: "#16a34a",
  },
  statusButton: {
    background: "#e5e7eb",
    color: "#111827",
    border: "none",
    borderRadius: "8px",
    padding: "9px 13px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  activeStatusButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "9px 13px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  addButton: button("#2563eb"),
  csvButton: { ...button("#0891b2"), marginRight: "8px" },
  deleteButton: button("#ef4444"),
  linkButton: {
    background: "#0f766e",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "7px 10px",
    marginLeft: "6px",
    cursor: "pointer",
  },
  messageButton: {
    background: "#f97316",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "7px 10px",
    cursor: "pointer",
  },
  smsButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "7px 10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

function inputStyle() {
  return {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
  };
}

function inputSmall(width) {
  return {
    width,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  };
}

function button(color) {
  return {
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "9px 13px",
    cursor: "pointer",
  };
}