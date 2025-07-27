      // Control del menú principal mobile
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      const mobileMenu = document.getElementById('mobile-menu');
      
      // Control del menú de usuario en desktop
      const userMenuButton = document.getElementById('user-menu-button');
      const userMenu = document.getElementById('user-menu');
      
      // Control del menú de usuario en mobile
      const mobileUserMenuButton = document.getElementById('mobile-user-menu-button');
      const mobileUserMenu = document.getElementById('mobile-user-menu');
      
      // Alternar menú principal mobile
      mobileMenuButton.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
          mobileMenu.classList.remove('hidden');
        } else {
          mobileMenu.classList.add('hidden');
          mobileUserMenu.classList.add('hidden');
        }
      });
      
      // Alternar menú de usuario desktop
      userMenuButton.addEventListener('click', () => {
        userMenu.classList.toggle('hidden');
      });
      
      // Alternar menú de usuario mobile
      mobileUserMenuButton.addEventListener('click', () => {
        mobileUserMenu.classList.toggle('hidden');
      });
      
      // Cerrar menús al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (!userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
          userMenu.classList.add('hidden');
        }
      });
      
      // Swiper initialization (si lo necesitas)
      const swiper = new Swiper('.mySwiper', {
        loop: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        autoplay: {
          delay: 5000,
        },
      });