(() => {
  const form = document.querySelector("#enrollment-form");

  if (!form) return;

  const professionalField = document.querySelector("#professional-field");
  const professionalSelect = document.querySelector("#professional-area");
  const feedback = document.querySelector("#form-feedback");
  const preferredDaysTrigger = document.querySelector("#preferred-days-trigger");
  const selectedDaysSummary = document.querySelector("#selected-days-summary");
  const preferredDaysInput = document.querySelector("#preferred-days");
  const dayModalOverlay = document.querySelector("#day-modal-overlay");
  const dayModalClose = document.querySelector(".day-modal-close");
  const dayModalConfirm = document.querySelector(".day-modal-confirm");
  const dayModalClear = document.querySelector(".day-modal-clear");
  const dayButtons = document.querySelectorAll(".day-check");

  const dayOrder = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo"
  ];

  let selectedDays = [];

  function updateSelectedDaysSummary() {
    const orderedDays = [...selectedDays].sort(
      (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
    );

    preferredDaysInput.value = orderedDays.join(", ");

    if (orderedDays.length) {
      selectedDaysSummary.textContent = orderedDays.join(", ");
      preferredDaysTrigger.classList.add("has-selection");
    } else {
      selectedDaysSummary.textContent = "Seleciona os dias";
      preferredDaysTrigger.classList.remove("has-selection");
    }
  }

  function closeDayModal() {
    if (!dayModalOverlay) return;

    dayModalOverlay.hidden = true;
    preferredDaysTrigger?.setAttribute("aria-expanded", "false");
  }

  function openDayModal() {
    if (!dayModalOverlay) return;

    dayModalOverlay.hidden = false;
    preferredDaysTrigger?.setAttribute("aria-expanded", "true");
  }

  closeDayModal();

  preferredDaysTrigger?.addEventListener("click", () => {
    const isOpen = preferredDaysTrigger.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeDayModal();
      return;
    }

    openDayModal();
  });

  dayModalClose?.addEventListener("click", closeDayModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dayModalOverlay && !dayModalOverlay.hidden) {
      closeDayModal();
    }
  });

  dayModalOverlay?.addEventListener("click", (event) => {
    if (event.target === dayModalOverlay) {
      closeDayModal();
    }
  });

  dayButtons.forEach((dayButton) => {
    const day = dayButton.dataset.day;

    dayButton.addEventListener("click", () => {
      if (selectedDays.includes(day)) {
        selectedDays = selectedDays.filter((selectedDay) => selectedDay !== day);
      } else {
        selectedDays = [...selectedDays, day];
      }

      dayButton.classList.toggle("is-active", selectedDays.includes(day));
    });
  });

  dayModalClear?.addEventListener("click", () => {
    selectedDays = [];
    dayButtons.forEach((button) => button.classList.remove("is-active"));
    updateSelectedDaysSummary();
    closeDayModal();
  });

  dayModalConfirm?.addEventListener("click", () => {
    updateSelectedDaysSummary();
    closeDayModal();
  });

  updateSelectedDaysSummary();

  const courseInputs = form.querySelectorAll('input[name="course"]');

  function updateProfessionalField() {
    const selectedCourse = form.querySelector(
      'input[name="course"]:checked'
    );

    const needsProfessionalArea =
      selectedCourse?.value === "English for Specific Purposes";

    professionalField.hidden = !needsProfessionalArea;
    professionalSelect.disabled = !needsProfessionalArea;
    professionalSelect.required = needsProfessionalArea;

    if (!needsProfessionalArea) {
      professionalSelect.value = "";
    }
  }

  courseInputs.forEach((input) => {
    input.addEventListener("change", updateProfessionalField);
  });

  updateProfessionalField();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    feedback.hidden = true;
    feedback.className = "form-feedback";

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    const formData = new FormData(form);

    const rawData = Object.fromEntries(formData.entries());

    const payload = {
      nome: String(rawData.name || "").trim(),
      email: String(rawData.email || "").trim(),
      telefone: String(rawData.phone || "").trim(),
      curso: String(rawData.course || "").trim(),
      frequencia: String(rawData.frequency || "").trim(),
      modalidade: String(rawData.modality || "").trim(),
      horario: String(rawData.period || "").trim(),
      dias: String(rawData.preferred_days || "").trim(),
      objetivo: String(rawData.objective || "").trim(),
      profissional: String(rawData.professional_area || "").trim()
    };

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "A enviar...";
    }

    try {
      const apiUrl = window.INSCRICAO_API_URL || "/api/inscricao";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || result?.sucesso !== true) {
        throw new Error(result?.mensagem || "Não foi possível enviar a inscrição.");
      }

      feedback.textContent = result.mensagem || "Inscrição enviada com sucesso!";
      feedback.classList.add("feedback-success");
      feedback.hidden = false;

      form.reset();
      updateProfessionalField();
      selectedDays = [];
      dayButtons.forEach((button) => button.classList.remove("is-active"));
      updateSelectedDaysSummary();

      feedback.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    } catch (error) {
      feedback.textContent = error.message || "Ocorreu um erro ao enviar a inscrição.";
      feedback.classList.add("feedback-error");
      feedback.hidden = false;

      feedback.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar inscrição";
      }
    }
  });
})();
