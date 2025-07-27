document.addEventListener('DOMContentLoaded', () => {
    const btnPago = document.getElementById('btn-pago');
    const btnGasto = document.getElementById('btn-gasto');
    const formPago = document.getElementById('formulario-pago');
    const formGasto = document.getElementById('formulario-gasto');

    // Alternar a "Registrar Pago"
    btnPago.addEventListener('click', () => {
        formPago.classList.remove('hidden');
        formGasto.classList.add('hidden');
        btnPago.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        btnPago.classList.remove('text-gray-500');
        btnGasto.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        btnGasto.classList.add('text-gray-500');
    });

    // Alternar a "Registrar Gasto"
    btnGasto.addEventListener('click', () => {
        formGasto.classList.remove('hidden');
        formPago.classList.add('hidden');
        btnGasto.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        btnGasto.classList.remove('text-gray-500');
        btnPago.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        btnPago.classList.add('text-gray-500');
    });
});