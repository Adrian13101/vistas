// Utilidades compartidas del navegador. Todo el texto se inserta con textContent/append,
// nunca como HTML, para que lo que cargue un usuario no pueda ejecutarse en la página.
(function (global) {
  function el(tag, props, children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props || {})) {
      if (key === "text") node.textContent = value;
      else if (key === "class") node.className = value;
      else node.setAttribute(key, value);
    }
    for (const child of children || []) node.append(child);
    return node;
  }

  const formatPrice = (value) =>
    Number(value).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  // Misma estructura que src/views/partials/serviceCard.handlebars
  function renderServiceCard(service, options) {
    const actions = options && options.actions;
    const children = [
      el("header", {}, [
        el("h3", { text: service.name }),
        el("span", {
          class: "badge " + (service.available ? "ok" : "off"),
          text: service.available ? "Disponible" : "No disponible",
        }),
      ]),
      el("p", { class: "category", text: service.category }),
      el("p", { text: service.description }),
      el("p", { class: "meta", text: service.duration + " min · " + formatPrice(service.price) }),
    ];
    if (actions) {
      children.push(
        el("div", { class: "actions" }, [
          el("button", {
            type: "button",
            "data-action": "toggle",
            text: service.available ? "Marcar como no disponible" : "Marcar como disponible",
          }),
          el("button", { type: "button", class: "danger", "data-action": "delete", text: "Eliminar" }),
        ])
      );
    }
    return el(
      "article",
      { class: "card", "data-id": service.id, "data-available": String(service.available) },
      children
    );
  }

  function renderEmpty(container, text) {
    container.replaceChildren(el("p", { class: "empty", text: text }));
  }

  function renderServiceList(container, services, options, emptyText) {
    if (services.length === 0) return renderEmpty(container, emptyText);
    container.replaceChildren(...services.map((s) => renderServiceCard(s, options)));
  }

  function showStatus(node, text, type) {
    node.textContent = text;
    node.className = "status " + (type || "");
  }

  // Une el mensaje de error con el detalle de las validaciones, si lo hay
  function describeError(error) {
    const parts = [(error && error.message) || "Ocurrió un error"];
    if (error && Array.isArray(error.errors)) parts.push(...error.errors);
    return parts.join(" · ");
  }

  // Indicador de conexión del encabezado
  function trackConnection(socket) {
    const badge = document.getElementById("connection");
    const set = (text, cls) => {
      badge.textContent = text;
      badge.className = "connection " + cls;
    };
    socket.on("connect", () => set("En vivo", "on"));
    socket.on("disconnect", () => set("Sin conexión", "off"));
    if (socket.connected) set("En vivo", "on");
  }

  global.App = { el, formatPrice, renderServiceCard, renderEmpty, renderServiceList, showStatus, describeError, trackConnection };
})(window);
