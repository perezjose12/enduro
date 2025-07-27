// Script para manejar los botones de filtro
document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", function () {
    // Remover clase activa de todos los botones
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("bg-blue-800", "text-white", "border-blue-800");
      btn.classList.add("border-gray-300");
    });

    // Agregar clase activa al botón clickeado
    this.classList.add("bg-blue-800", "text-white", "border-blue-800");
    this.classList.remove("border-gray-300");
  });
});
