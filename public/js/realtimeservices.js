(function () {
  const socket = io();
  const list = document.getElementById("services-list");
  const form = document.getElementById("service-form");
  const status = document.getElementById("status");
  App.trackConnection(socket);

  // Servidor -> navegador: lista actualizada
  socket.on("services:updated", (services) => {
    App.renderServiceList(list, services, { actions: true }, "Todavía no hay servicios.");
  });

  // Navegador -> servidor: respuesta (acknowledgement) de cada acción
  function onResult(successText) {
    return (response) => {
      if (response && response.status === "success") {
        App.showStatus(status, successText, "ok");
      } else {
        App.showStatus(status, App.describeError(response), "error");
      }
    };
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const service = {
      name: data.get("name"),
      description: data.get("description"),
      category: data.get("category"),
      duration: Number(data.get("duration")),
      price: Number(data.get("price")),
      available: form.elements.available.checked,
    };
    socket.emit("services:create", service, (response) => {
      onResult("Servicio creado")(response);
      if (response && response.status === "success") {
        form.reset();
        form.elements.available.checked = true;
      }
    });
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const card = button.closest("[data-id]");
    const id = card.dataset.id;

    if (button.dataset.action === "toggle") {
      const available = card.dataset.available !== "true";
      socket.emit("services:update", { id, data: { available } }, onResult("Servicio actualizado"));
    } else if (button.dataset.action === "delete") {
      socket.emit("services:delete", id, onResult("Servicio eliminado"));
    }
  });
})();
