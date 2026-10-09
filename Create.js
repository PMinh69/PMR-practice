let provinces = [];

async function loadProvinces() {
  const select = document.getElementById("province");

  try {
    const response = await fetch("https://provinces.open-api.vn/api/v2/?depth=2");
    provinces = await response.json();
    provinces.forEach(({ name, code }) => select.add(new Option(name, code)));
  } catch (error) {
    console.error("Lỗi tải danh sách tỉnh/thành phố:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createForm");
  const dob = document.getElementById("dob");
  const gender = document.getElementById("gender");
  const dobError = document.getElementById("dob-error");
  const bhytDate = document.getElementById("bhyt_date");
  const bhytError = document.getElementById("bhyt-date-error");
  const requiredFields = [dob, gender];
  const saveButton = form.querySelector(".btn-save");

  loadProvinces();

  requiredFields.forEach((field) => {
    const wrapper = field.closest(".input-wrapper");

    field.addEventListener("blur", () => {
      if (field === dob) {
        const date = parseDateToYMD(dob.value);
        dobError.textContent = !dob.value.trim()
          ? "Cần nhập thông tin bắt buộc"
          : date
            ? ""
            : "Ngày sinh không hợp lệ (DD/MM/YYYY)";
        wrapper.classList.toggle("show-error", !date);
      } else {
        wrapper.classList.toggle("show-error", !field.value);
      }
    });

    ["input", "change"].forEach((eventName) => {
      field.addEventListener(eventName, () => {
        if (field === dob ? parseDateToYMD(dob.value) : field.value) {
          wrapper.classList.remove("show-error");
        }
      });
    });
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      form.querySelectorAll(".show-error").forEach((item) => {
        item.classList.remove("show-error");
      });
      dobError.textContent = "Cần nhập thông tin bắt buộc";
      bhytError.textContent = "";
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const birthDate = parseDateToYMD(dob.value);
    const missingRequired = requiredFields.filter((field) => !field.value.trim());
    const invalidBirthDate = !missingRequired.includes(dob) && !birthDate;
    const range = bhytDate.value.trim();
    const dates = range ? range.split(/\s+-\s+/) : [];
    const insuranceStart = dates.length === 2 ? parseDateToYMD(dates[0]) : null;
    const insuranceEnd = dates.length === 2 ? parseDateToYMD(dates[1]) : null;
    const invalidInsuranceDate = range && (!insuranceStart || !insuranceEnd);
    const invalidInsuranceRange =
      insuranceStart && insuranceEnd && insuranceEnd <= insuranceStart;

    dobError.textContent = missingRequired.includes(dob)
      ? "Cần nhập thông tin bắt buộc"
      : invalidBirthDate
        ? "Ngày sinh không hợp lệ (DD/MM/YYYY)"
        : "";

    requiredFields.forEach((field) => {
      field.closest(".input-wrapper").classList.toggle(
        "show-error",
        missingRequired.includes(field) || (field === dob && invalidBirthDate),
      );
    });

    bhytError.textContent = invalidInsuranceDate
      ? "Nhập đủ ngày theo định dạng DD/MM/YYYY - DD/MM/YYYY"
      : invalidInsuranceRange
        ? "Ngày kết thúc phải sau ngày bắt đầu"
        : "";
    bhytDate.closest(".input-wrapper").classList.toggle(
      "show-error",
      Boolean(invalidInsuranceDate || invalidInsuranceRange),
    );

    if (
      missingRequired.length ||
      invalidBirthDate ||
      invalidInsuranceDate ||
      invalidInsuranceRange
    ) {
      (missingRequired[0] ||
        (invalidBirthDate ? dob : invalidInsuranceDate || invalidInsuranceRange ? bhytDate : null)
      )?.focus();
      return;
    }

    const province = provinces.find(
      (item) => String(item.code) === document.getElementById("province").value,
    );
    const ward = document.getElementById("ward");
    const patientData = {
      Name: document.getElementById("fullname").value.trim(),
      Citizen_card: document.getElementById("citizen_card").value.trim() || null,
      Birth: birthDate,
      Gender: gender.value === "male" ? "Nam" : "Nữ",
      Phone: document.getElementById("phone").value.trim() || null,
      Email: document.getElementById("email").value.trim() || null,
      Province: province?.name || null,
      Ward: ward.selectedIndex > 0 ? ward.options[ward.selectedIndex].text : null,
      Address: document.getElementById("address").value.trim() || null,
      InsuranceID: document.getElementById("insurance_id").value.trim() || null,
      Insurance_start: insuranceStart,
      Insurance_end: insuranceEnd,
    };

    await savePatient(patientData, form, saveButton);
  });
});

function loadWards(value) {
  const province = provinces.find(
    (item) => String(item.code) === value,
  );
  const wards = document.getElementById("ward");

  wards.options.length = 1;
  (province?.wards || []).forEach(({ name, code }) => {
    wards.add(new Option(name, code));
  });
}

function parseDateToYMD(value) {
  const match = value.trim().match(
    /^(\d{2})\/(\d{2})\/(\d{4})$|^(\d{4})-(\d{2})-(\d{2})$/,
  );
  if (!match) return null;

  const [, dayText, monthText, yearText, yearISO, monthISO, dayISO] = match;
  const year = Number(yearText || yearISO);
  const month = Number(monthText || monthISO);
  const day = Number(dayText || dayISO);
  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > new Date(Date.UTC(year, month, 0)).getUTCDate()
  ) {
    return null;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const supabaseClient = window.supabase.createClient(
  "https://higccyqweqdnooqbgmfh.supabase.co",
  "sb_publishable_fEHOOte194pOx3z8mpMt-A_BA_58nMy",
);

async function savePatient(data, form, button) {
  button.disabled = true;

  try {
    const { error } = await supabaseClient.from("List").insert([data]);
    if (error) throw error;

    alert("Thêm ca khám thành công!");
    form.reset();
  } catch (error) {
    console.error("Lỗi khi lưu ca khám:", error);
    alert("Lỗi khi thêm ca khám: " + error.message);
  } finally {
    button.disabled = false;
  }
}
