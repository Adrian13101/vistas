(function () {
  const el = App.el;
  const socket = io();
  const list = document.getElementById("bookings-list");
  const form = document.getElementById("booking-form");
  const status = document.getElementById("status");
  App.trackConnection(socket);

  // Misma estructura que src/views/partials/bookingCard.handlebars
  function renderBooking(booking, services) {
    const chips = booking.serviceItems.length
      ? booking.serviceItems.map((s) => el("li", { class: s.missing ? "missing" : "", text: s.name }))
      : [el("li", { class: "empty", text: "Sin servicios" })];

    const children = [
      el("header", {}, [
        el("h3", { text: booking.customerName }),
        el("span", { class: "badge", text: booking.date + " · " + booking.time }),
      ]),
      el("p", { class: "category", text: booking.customerEmail }),
      el("ul", { class: "chips" }, chips),
    ];

    if (services.length) {
      children.push(
        el("div", { class: "actions" }, [
          el("select", { "aria-label": "Servicio a agregar" }, services.map((s) => el("option", { value: s.id, text: s.name }))),
          el("button", { type: "button", "data-action": "add-service", text: "Agregar servicio" }),
        ])
      );
    }
    return el("article", { class: "card booking", "data-id": booking.id }, children);
  }

  // Servidor -> navegador: reservas y servicios disponibles actualizados
  socket.on("bookings:updated", (data) => {
    if (data.bookings.length === 0) return App.renderEmpty(list, "Todavía no hay reservas.");
    list.replaceChildren(...data.bookings.map((b) => renderBooking(b, data.services)));
  });

  // Las acciones usan la API REST; el servidor avisa por socket a todos cuando algo cambia
  async function request(url, options) {
    const response = await fetch(url, options);
    const body = await response.json();
    if (!response.ok) throw body;
    return body;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
      await request("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      form.reset();
      App.showStatus(status, "Reserva creada", "ok");
    } catch (error) {
      App.showStatus(status, App.describeError(error), "error");
    }
  });

  list.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action='add-service']");
    if (!button) return;
    const card = button.closest("[data-id]");
    const serviceId = card.querySelector("select").value;
    try {
      await request("/api/bookings/" + card.dataset.id + "/services/" + serviceId, { method: "POST" });
      App.showStatus(status, "Servicio agregado a la reserva", "ok");
    } catch (error) {
      App.showStatus(status, App.describeError(error), "error");
    }
  });
})();
