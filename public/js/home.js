(function () {
  const socket = io();
  const list = document.getElementById("services-list");
  App.trackConnection(socket);

  // El servidor envía todos los servicios cada vez que cambia alguno; acá se muestran los disponibles
  socket.on("services:updated", (services) => {
    App.renderServiceList(list, services.filter((s) => s.available), {}, "No hay servicios disponibles por ahora.");
  });
})();
