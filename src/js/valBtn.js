  document.querySelectorAll('.action-btn').forEach(button => {
    button.addEventListener('click', function() {
      const idMov = this.getAttribute('data-id');
      const action = this.getAttribute('data-action');
      
      // Enviar petición al servidor
      fetch('/movimiento/validar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idMov, accion: action })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          location.reload(); // Recargar para ver cambios
        } else {
          alert('Error: ' + (data.error || 'Acción no completada'));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error en la solicitud');
      });
    });
  });

  // Filtros (ejemplo básico)
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function() {
      const filter = this.textContent.trim().toLowerCase();
      // Implementar lógica de filtrado aquí
      console.log('Filtrar por:', filter);
    });
  });