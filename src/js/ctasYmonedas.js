// public/js/ctasYmonedas.js
document.addEventListener('DOMContentLoaded', function() {
    // Función reutilizable para cargar bancos
    function cargarBancos(monedaSelect, destinoSelect) {
        // Limpiar select de destino
        destinoSelect.innerHTML = '<option value="">Seleccione una opcion...</option>';
        
        const selectedOption = monedaSelect.options[monedaSelect.selectedIndex];        
        const bancosData = selectedOption.getAttribute('data-bancos');
        
        if (!bancosData) return;
        
        const bancos = JSON.parse(decodeURIComponent(bancosData));
        
        // Agregar opciones de bancos
        bancos.forEach(banco => {
            const option = document.createElement('option');
            option.value = banco.idCtaBan;
            
            // Cambiar texto para mostrar
            option.textContent = `${banco.NomBan}: ${banco.DtoCta}`;
            
            destinoSelect.appendChild(option);
          });
    }

    // Configuración para formulario de PAGOS
    const monedaSelect = document.getElementById('select-moneda');
    const destinoSelect = document.getElementById('select-destino');
    
    if (monedaSelect && destinoSelect) {
        monedaSelect.addEventListener('change', function() {
            cargarBancos(monedaSelect, destinoSelect);
        });
        
        // Cargar bancos iniciales si hay selección
        if (monedaSelect.value) {
            cargarBancos(monedaSelect, destinoSelect);
        }
    }

    // Configuración para formulario de GASTOS
    const monedaSelectGasto = document.getElementById('select-moneda-gasto');
    const destinoSelectGasto = document.getElementById('select-destino-gasto');
    
    if (monedaSelectGasto && destinoSelectGasto) {
        monedaSelectGasto.addEventListener('change', function() {
            cargarBancos(monedaSelectGasto, destinoSelectGasto);
        });
        
        // Cargar bancos iniciales si hay selección
        if (monedaSelectGasto.value) {
            cargarBancos(monedaSelectGasto, destinoSelectGasto);
        }
    }
    
    // Toggle entre formularios (mantenido de tu código original)
    document.getElementById('btn-pago').addEventListener('click', function() {
        document.getElementById('formulario-pago').classList.remove('hidden');
        document.getElementById('formulario-gasto').classList.add('hidden');
        this.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
        document.getElementById('btn-gasto').classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
    });

    document.getElementById('btn-gasto').addEventListener('click', function() {
        document.getElementById('formulario-gasto').classList.remove('hidden');
        document.getElementById('formulario-pago').classList.add('hidden');
        this.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
        document.getElementById('btn-pago').classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
    });
});