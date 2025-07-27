// Filtrado por estado
document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        const filter = this.textContent.trim();
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach(function(row) {
            const estado = row.querySelector('td:nth-child(4) span').textContent;
            if(filter === 'Todos' || estado.includes(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
});

// Búsqueda
document.querySelector('input[type="text"]').addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach(function(row) {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
});