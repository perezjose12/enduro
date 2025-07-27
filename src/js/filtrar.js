document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');
    const rows = document.querySelectorAll('.movimiento-row');
    const movimientosCount = document.getElementById('movimientos-count');
    
    // Función para aplicar los filtros
    function applyFilters() {
        const activeFilter = document.querySelector('.filter-btn.bg-blue-800');
        const filterValue = activeFilter ? activeFilter.dataset.filter : 'all';
        const searchTerm = searchInput.value.toLowerCase();
        
        let visibleCount = 0;
        
        rows.forEach(row => {
            const status = row.dataset.status;
            const user = row.dataset.user;
            const amount = parseFloat(row.dataset.amount);
            const date = row.dataset.date;
            
            // Filtrar por estado
            const statusMatch = filterValue === 'all' || status === filterValue;
            
            // Filtrar por término de búsqueda
            const searchMatch = 
                user.includes(searchTerm) || 
                amount.toString().includes(searchTerm) || 
                date.includes(searchTerm) ||
                row.textContent.toLowerCase().includes(searchTerm);
            
            if (statusMatch && searchMatch) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        // Actualizar contador
        movimientosCount.textContent = visibleCount;
    }
    
    // Manejar clics en los botones de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover clase activa de todos los botones
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-blue-800', 'text-white', 'border-blue-800');
                btn.classList.add('border-gray-300');
            });
            
            // Añadir clase activa al botón seleccionado
            this.classList.add('bg-blue-800', 'text-white', 'border-blue-800');
            this.classList.remove('border-gray-300');
            
            // Aplicar filtros
            applyFilters();
        });
    });
    
    // Manejar búsqueda en tiempo real
    searchInput.addEventListener('input', applyFilters);
    
    // Aplicar filtros iniciales
    applyFilters();
});