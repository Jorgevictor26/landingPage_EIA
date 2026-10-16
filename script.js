const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
    navLinks.classList.toggle("open", !isOpen);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
    }
  });
}

/* ==========================================
   FORMULÁRIO DE INSCRIÇÃO
========================================== */

(() => {
  const form = document.querySelector("#enrollment-form");

  if (!form) return;

  const professionalField = document.querySelector("#professional-field");
  const professionalSelect = document.querySelector("#professional-area");
  const feedback = document.querySelector("#form-feedback");

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

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    feedback.hidden = true;
    feedback.className = "form-feedback";

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const enrollment = Object.fromEntries(formData.entries());

    // Disponibiliza os dados para futura integração com um servidor.
    console.log("Dados da inscrição:", enrollment);

    feedback.textContent =
      "O formulário está válido! Para recebermos a tua inscrição, " +
      "falta ligar este formulário ao sistema de envio.";

    feedback.classList.add("feedback-success");
    feedback.hidden = false;

    feedback.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  });
})();

/* ==========================================
   FAQ — ACORDEÃO INTERACTIVO
========================================== */

(() => {
  const faqItems = document.querySelectorAll(".faq-item");

  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";

      // Fecha todas as perguntas
      faqItems.forEach((otherItem) => {
        const otherButton = otherItem.querySelector(".faq-question");
        const otherAnswer = otherItem.querySelector(".faq-answer");

        otherButton.setAttribute("aria-expanded", "false");
        otherItem.classList.remove("is-open");
        otherAnswer.hidden = true;
      });

      // Abre a pergunta seleccionada, se estava fechada
      if (!isOpen) {
        button.setAttribute("aria-expanded", "true");
        item.classList.add("is-open");
        answer.hidden = false;
      }
    });
  });
})();

/* ==========================================
   FOOTER — ANO AUTOMÁTICO
========================================== */

(() => {
  const yearElement = document.querySelector("#footer-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
})();

