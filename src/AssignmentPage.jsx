import { useState } from "react"

function AssignmentPage() {
  const [companions] = useState([
    { id: 1, name: "김동행", phone: "010-1111-2222" },
    { id: 2, name: "이도움", phone: "010-3333-4444" },
    { id: 3, name: "박사랑", phone: "010-5555-6666" },
  ])

  const [requests, setRequests] = useState([
    {
      id: 1,
      serviceDate: "2026-05-16",
      customerName: "홍길동",
      hospital: "제주대학교병원",
      startTime: "09:00",
      endTime: "",
      status: "대기",
      assignmentType: "",
      companionId: null,
    },
    {
      id: 2,
      serviceDate: "2026-05-16",
      customerName: "김영희",
      hospital: "한라병원",
      startTime: "13:00",
      endTime: "",
      status: "대기",
      assignmentType: "",
      companionId: null,
    },
  ])

  const assignCompanion = (requestId, companionId) => {
    if (!companionId) return

    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              assignmentType: "지정",
              companionId: Number(companionId),
              status: "배정완료",
            }
          : request
      )
    )
  }

  const distributeRequest = (requestId) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              assignmentType: "공동배포",
              companionId: null,
              status: "배포중",
            }
          : request
      )
    )
  }

  const acceptRequest = (requestId, companionId) => {
    setRequests((prev) =>
      prev.map((request) => {
        if (request.id !== requestId) return request

        if (request.status !== "배포중") {
          alert("이미 배정된 신청입니다.")
          return request
        }

        return {
          ...request,
          companionId,
          status: "배정완료",
        }
      })
    )
  }

  const cancelAssignment = (requestId) => {
    if (!window.confirm("배정을 취소하시겠습니까?")) return

    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              assignmentType: "",
              companionId: null,
              endTime: "",
              status: "대기",
            }
          : request
      )
    )
  }

  const updateStatus = (requestId, nextStatus) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: nextStatus,
            }
          : request
      )
    )
  }

  const completeService = (requestId) => {
    const endTime = window.prompt("서비스 종료 시간을 입력하세요. 예: 15:30")

    if (!endTime) return

    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              endTime,
              status: "완료",
            }
          : request
      )
    )
  }

  const getCompanionName = (companionId) => {
    const companion = companions.find((c) => c.id === companionId)
    return companion ? companion.name : "미배정"
  }

  const completedRequests = requests.filter(
    (request) => request.status === "완료"
  )

  return (
    <div style={{ padding: "20px" }}>
      <h2>신청 배정관리</h2>

      <h3>관리자 신청 목록</h3>

      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>서비스 날짜</th>
            <th>고객명</th>
            <th>병원</th>
            <th>시작시간</th>
            <th>종료시간</th>
            <th>배정방식</th>
            <th>동행자</th>
            <th>상태</th>
            <th>관리자 지정</th>
            <th>공동배포</th>
            <th>진행관리</th>
            <th>취소</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.serviceDate}</td>
              <td>{request.customerName}</td>
              <td>{request.hospital}</td>
              <td>{request.startTime}</td>
              <td>{request.endTime || "-"}</td>
              <td>{request.assignmentType || "미정"}</td>
              <td>{getCompanionName(request.companionId)}</td>
              <td>{request.status}</td>

              <td>
                <select
                  disabled={request.status !== "대기"}
                  defaultValue=""
                  onChange={(e) =>
                    assignCompanion(request.id, e.target.value)
                  }
                >
                  <option value="">동행자 선택</option>
                  {companions.map((companion) => (
                    <option key={companion.id} value={companion.id}>
                      {companion.name}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                <button
                  disabled={request.status !== "대기"}
                  onClick={() => distributeRequest(request.id)}
                >
                  공동배포
                </button>
              </td>

              <td>
                {request.status === "배정완료" && (
                  <button onClick={() => updateStatus(request.id, "출발")}>
                    출발 처리
                  </button>
                )}

                {request.status === "출발" && (
                  <button onClick={() => updateStatus(request.id, "진행중")}>
                    진행중 처리
                  </button>
                )}

                {request.status === "진행중" && (
                  <button onClick={() => completeService(request.id)}>
                    완료 처리
                  </button>
                )}

                {(request.status === "대기" || request.status === "배포중") &&
                  "-"}
              </td>

              <td>
                {request.status !== "완료" ? (
                  <button onClick={() => cancelAssignment(request.id)}>
                    배정취소
                  </button>
                ) : (
                  "완료됨"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      <h3>동행자 수락 화면 예시</h3>

      {companions.map((companion) => {
        const availableRequests = requests.filter(
          (request) => request.status === "배포중"
        )

        return (
          <div
            key={companion.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px",
            }}
          >
            <h3>👤 {companion.name}님 화면</h3>

            {availableRequests.length === 0 && (
              <p>현재 수락 가능한 공동배포 신청이 없습니다.</p>
            )}

            {availableRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  border: "1px solid #eee",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                <p>
                  {request.serviceDate} / {request.startTime} /{" "}
                  {request.customerName} / {request.hospital}
                </p>

                <button
                  onClick={() => acceptRequest(request.id, companion.id)}
                >
                  내가 수락하기
                </button>
              </div>
            ))}
          </div>
        )
      })}

      <br />

      <h3>완료된 서비스 목록</h3>

      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>서비스 날짜</th>
            <th>고객명</th>
            <th>병원</th>
            <th>동행자</th>
            <th>시작시간</th>
            <th>종료시간</th>
            <th>정산 연결 상태</th>
          </tr>
        </thead>

        <tbody>
          {completedRequests.map((request) => (
            <tr key={request.id}>
              <td>{request.serviceDate}</td>
              <td>{request.customerName}</td>
              <td>{request.hospital}</td>
              <td>{getCompanionName(request.companionId)}</td>
              <td>{request.startTime}</td>
              <td>{request.endTime}</td>
              <td>정산 대상</td>
            </tr>
          ))}

          {completedRequests.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                완료된 서비스가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default AssignmentPage