document.addEventListener('DOMContentLoaded', () => {
    const handleFormSubmit = async (form, isGasto = false) => {
        const formData = new FormData(form);
        const data = {
            idMon: formData.get('moneda'),
            idCtaBan: formData.get('destino'),
            MonMov: formData.get('MonMov'),
            RefMov: formData.get('RefMov'),
            FecMov: formData.get('FecMov'),
            DesMov: formData.get('DesMov'),
            tipMov: isGasto ? 'G' : 'P' // G=Gasto; P=Pago
        };

        try {
            const response = await fetch('/registrar-movimiento', { // Ruta
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                alert('Registro exitoso!');
                form.reset();
                
                // Resetear selects
                const monedaSelect = form.querySelector('[name="moneda"]');
                const destinoSelect = form.querySelector('[name="destino"]');
                if (monedaSelect) monedaSelect.selectedIndex = 0;
                if (destinoSelect) destinoSelect.innerHTML = '<option value="">Seleccione una opción...</option>';
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error en el servidor');
        }
    };

    // Registrar Pago
    const formPago = document.getElementById('formulario-pago');
    if (formPago) {
        formPago.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(formPago, false);
        });
    }

    // Registrar Gasto
    const formGasto = document.getElementById('formulario-gasto');
    if (formGasto) {
        formGasto.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(formGasto, true);
        });
    }
});