/**
 * K-VOLT - Configuración y comportamiento del sitio.
 *
 * ANTES DE PUBLICAR:
 * 1) Completá CONTACT con datos reales.
 * 2) Reemplazá el dominio en index.html, sitemap.xml y robots.txt.
 * 3) Sustituí assets/logo-kvolt.png y assets/og-kvolt.jpg por piezas oficiales.
 *
 * No se declaran certificaciones profesionales no verificadas.
 */
const CONTACT = {
  phoneDisplay: "",        // Ejemplo de formato visual: "+54 9 341 XXX XXXX"
  phoneTel: "",            // Solo dígitos o "+" para tel:
  whatsapp: "",            // Solo dígitos con código país, ej. 549341...
  email: ""                // Email real
};

const qs = (selector, context = document) => context.querySelector(selector);
const qsa = (selector, context = document) => [...context.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupFAQ();
  setupReveal();
  setupContactLinks();
  setupForm();
  qs("#year").textContent = new Date().getFullYear();
});

function setupNavigation() {
  const toggle = qs(".nav-toggle");
  const nav = qs("#main-nav");
  if (!toggle || !nav) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    nav.classList.remove("open");
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Abrir menú" : "Cerrar menú");
    nav.classList.toggle("open", !open);
  });

  qsa("a", nav).forEach(link => link.addEventListener("click", close));

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") close();
  });
}

function setupFAQ() {
  qsa(".faq-item").forEach(item => {
    const button = qs(".faq-question", item);
    if (!button) return;

    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";

      qsa(".faq-item").forEach(other => {
        other.classList.remove("open");
        const otherButton = qs(".faq-question", other);
        if (otherButton) otherButton.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });
}

function setupReveal() {
  const elements = qsa(".reveal");

  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach(el => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  elements.forEach(el => observer.observe(el));
}

function setupContactLinks() {
  const phoneLabel = qs("[data-phone-label]");
  const emailLabel = qs("[data-email-label]");

  if (CONTACT.phoneDisplay && phoneLabel) phoneLabel.textContent = CONTACT.phoneDisplay;
  if (CONTACT.email && emailLabel) emailLabel.textContent = CONTACT.email;

  qsa(".js-phone").forEach(link => {
    if (CONTACT.phoneTel) {
      link.href = `tel:${CONTACT.phoneTel}`;
    } else {
      link.href = "#contacto";
      link.addEventListener("click", showMissingContact);
    }
  });

  qsa(".js-email").forEach(link => {
    if (CONTACT.email) {
      link.href = `mailto:${CONTACT.email}`;
    } else {
      link.href = "#contacto";
      link.addEventListener("click", showMissingContact);
    }
  });

  qsa(".js-whatsapp").forEach(link => {
    if (CONTACT.whatsapp) {
      const message = encodeURIComponent("Hola K-Volt. Quiero realizar una consulta por un servicio eléctrico.");
      link.href = `https://wa.me/${CONTACT.whatsapp}?text=${message}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.href = "#contacto";
      link.addEventListener("click", showMissingContact);
    }
  });
}

function showMissingContact() {
  const feedback = qs("#form-feedback");
  if (feedback) {
    feedback.textContent = "Falta cargar el teléfono / WhatsApp / email real de K-Volt en script.js.";
  }
}

function setupForm() {
  const form = qs("#contact-form");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    clearErrors(form);

    const data = new FormData(form);
    const nombre = String(data.get("nombre") || "").trim();
    const telefono = String(data.get("telefono") || "").trim();
    const zona = String(data.get("zona") || "").trim();
    const servicio = String(data.get("servicio") || "").trim();
    const mensaje = String(data.get("mensaje") || "").trim();
    const cliente = String(data.get("cliente") || "Hogar");
    const consent = qs("#consentimiento");

    let valid = true;

    if (nombre.length < 2) valid = setError(qs("#nombre"), "Ingresá tu nombre.");
    if (telefono.replace(/\D/g, "").length < 7) valid = setError(qs("#telefono"), "Ingresá un teléfono válido.");
    if (zona.length < 2) valid = setError(qs("#zona"), "Indicá tu zona o localidad.");
    if (mensaje.length < 10) valid = setError(qs("#mensaje"), "Contanos un poco más sobre el problema.");
    if (!consent?.checked) {
      qs("#form-feedback").textContent = "Necesitamos tu aceptación para preparar la consulta.";
      valid = false;
    }

    if (!valid) return;

    const text = [
      "Hola K-Volt, quiero realizar una consulta.",
      "",
      `Tipo de cliente: ${cliente}`,
      `Nombre: ${nombre}`,
      `Teléfono: ${telefono}`,
      `Zona: ${zona}`,
      `Servicio: ${servicio}`,
      `Detalle: ${mensaje}`
    ].join("\n");

    if (!CONTACT.whatsapp) {
      qs("#form-feedback").textContent = "El formulario está listo, pero falta cargar el número real de WhatsApp en script.js.";
      return;
    }

    const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    qs("#form-feedback").textContent = "Consulta preparada. Se abrió WhatsApp para que puedas revisarla y enviarla.";
  });
}

function setError(input, message) {
  if (!input) return false;
  const field = input.closest(".field");
  field?.classList.add("has-error");
  const error = field?.querySelector(".field-error");
  if (error) error.textContent = message;
  input.setAttribute("aria-invalid", "true");
  return false;
}

function clearErrors(form) {
  qsa(".field", form).forEach(field => {
    field.classList.remove("has-error");
    const error = qs(".field-error", field);
    if (error) error.textContent = "";
    const control = qs("input,textarea,select", field);
    control?.removeAttribute("aria-invalid");
  });
  const feedback = qs("#form-feedback");
  if (feedback) feedback.textContent = "";
}
