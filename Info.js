async function loadPage(fileName, tabId) {
  const container = document.getElementById("main-content-container");
  const response = await fetch(fileName);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  container.innerHTML = await response.text();
  container.style.display = "block";

  document.querySelectorAll(".action-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.id === tabId);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadPage("Detail.html", "exam-info-tab");
});

function renderHistory() {
  const historyBody = document.getElementById("history-records");
  if (!historyBody) return;

  const records = Array.from({ length: 20 }, () => ({
    time: "12/12/2024 12:00",
    user: "phucbth",
    content: "Tạo ca khám",
  }));

  historyBody.innerHTML = records.map((record, index) => `
    <tr>
      <td class="text-center">${index + 1}</td>
      <td>${record.time}</td>
      <td>${record.user}</td>
      <td>${record.content}</td>
    </tr>
  `).join("");
}
