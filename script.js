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

