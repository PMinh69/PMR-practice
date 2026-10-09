const supabaseClient = window.supabase.createClient(
  "https://higccyqweqdnooqbgmfh.supabase.co",
  "sb_publishable_fEHOOte194pOx3z8mpMt-A_BA_58nMy",
);

const patientColumns = [
  ["Name", "Họ tên"],
  ["Birth", "Ngày sinh"],
  ["Gender", "Giới tính"],
  ["Phone", "Số điện thoại"],
  ["Email", "Email"],
  ["Province", "Tỉnh/Thành phố"],
  ["Ward", "Phường/Xã"],
  ["Address", "Địa chỉ"],
];

let Status = true;
function toggleStatus() {
  Status = !Status;
  document.getElementById("statusDisplay").textContent = Status
    ? "Đã xuất thuốc"
    : "Chưa xuất thuốc";
  document.getElementById("alertBox").style.display = Status ? "flex" : "none";
  document.getElementById("formAddMedicine").style.display = Status
    ? "none"
    : "flex";
}

async function loadPage(fileName, tabId) {
  const container = document.getElementById("main-content-container");
  const res = await fetch(fileName);
  container.innerHTML = await res.text();
  container.style.display = "block";

  document.querySelectorAll(".tab-item").forEach((tab) => {
    tab.classList.toggle("active", tab.id === tabId);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadPage("CDHA.html", "cdha-tab");
  loadPatientList();
});

async function loadPatientList() {
  const tableBody = document.getElementById("patient-list-body");
  const count = document.getElementById("patient-count");
  const selectCols = `id,${patientColumns.map(([col]) => col).join(",")}`;
  let patients = [],
    from = 0,
    pageSize = 1000;

  try {
    while (true) {
      const { data, error } = await supabaseClient
        .from("List")
        .select(selectCols)
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      patients.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    count.textContent = `${patients.length} Ca khám`;

    if (!patients.length) {
      tableBody.innerHTML = `<tr><td colspan="${patientColumns.length}">Chưa có ca khám nào.</td></tr>`;
      return;
    }

    tableBody.innerHTML = patients
      .map(
        (patient) => `
      <tr>
        ${patientColumns
          .map(
            ([col]) => `
          <td>${patient[col]}</td>
        `,
          )
          .join("")}
      </tr>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Lỗi tải danh sách ca khám:", error);
    tableBody.innerHTML = `<tr><td colspan="${patientColumns.length}" class="text-red">Không tải được danh sách: ${error.message}</td></tr>`;
  }
}
