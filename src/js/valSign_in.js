document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario
    // Cedula
    const signupForm = document.getElementById('signupForm');
    const cedulaInput = document.getElementById('idnumber');
    const cedulaError = document.getElementById('cedulaError');
    // Usuario
    const cedulaErrorText = document.getElementById('cedulaErrorText');
    const usernameInput = document.getElementById('username');
    const usernameError = document.getElementById('usernameError');
    const usernameErrorText = document.getElementById('usernameErrorText');
    
    // Si hay error de cédula existente, resaltamos el campo
    if (cedulaError && cedulaInput) {
        cedulaInput.classList.add('animate-pulse');
        cedulaInput.focus();
        
        // Quitar la animación después de 1.5 segundos
        setTimeout(() => {
            cedulaInput.classList.remove('animate-pulse');
        }, 1500);
    }
    
    // Event listener para limpiar errores al modificar la cédula
    if (cedulaInput) {
        cedulaInput.addEventListener('input', function() {
            // Quitar borde rojo
            this.classList.remove('border-red-500');
            
            // Ocultar mensajes de error si existen
            if (cedulaError) {
                cedulaError.style.display = 'none';
            }
            if (cedulaErrorText) {
                cedulaErrorText.style.display = 'none';
            }
        });
    }

    // Si hay error de nombre de usuario existente, resaltamos el campo
    if (usernameError && usernameInput) {
        usernameInput.classList.add('animate-pulse');
        usernameInput.focus();
            
        // Quitar la animación después de 1.5 segundos
        setTimeout(() => {
            usernameInput.classList.remove('animate-pulse');
        }, 1500);
    }
        
    // Event listener para limpiar errores al modificar el nombre de usuario
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            // Quitar borde rojo
            this.classList.remove('border-red-500');
                
            // Ocultar mensajes de error si existen
            if (usernameError) {
                usernameError.style.display = 'none';
            }
            if (usernameErrorText) {
                usernameErrorText.style.display = 'none';
            }
                
            // Validar longitud mínima en tiempo real
            if (this.value.length < 4) {
                this.classList.add('border-yellow-500');
            } else {
                this.classList.remove('border-yellow-500');
            }
        });
    }
    
    // Validación adicional del formulario antes de enviar
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            // Aquí podríamos agregar validaciones adicionales
            // Por ejemplo, verificar formato de la cédula
            if (cedulaInput && cedulaInput.value.length < 6) {
                e.preventDefault();
                alert('La cédula debe tener al menos 6 caracteres');
                cedulaInput.focus();
                cedulaInput.classList.add('border-red-500');
            }

            // Validar el nombre de usuario
            if (usernameInput && usernameInput.value.length < 4) {
                e.preventDefault();
                    alert('El nombre de usuario debe tener al menos 4 caracteres');
                    usernameInput.focus();
                    usernameInput.classList.add('border-red-500');
                }
        });
    }
    
    // Validación en tiempo real para el formato de teléfono
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            // Limpiar cualquier caracter no numérico
            this.value = this.value.replace(/[^0-9+-\s]/g, '');
        });
    }
});