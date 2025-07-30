const btn = document.getElementById('mobile-menu-button');
const menu = document.getElementById('mobile-menu');
const overlay = document.getElementById('overlay');
const iconMenu = document.getElementById('icon-menu');
const iconClose = document.getElementById('icon-close');

function openMobileMenu() {
    menu.classList.remove('-translate-x-full');
    menu.classList.add('translate-x-0');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100', 'pointer-events-auto');
    iconMenu.classList.add('hidden');
    iconClose.classList.remove('hidden');
    btn.setAttribute('aria-label', 'Fechar menu');
}

function closeMobileMenu() {
    menu.classList.add('-translate-x-full');
    menu.classList.remove('translate-x-0');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    overlay.classList.remove('opacity-100', 'pointer-events-auto');
    iconMenu.classList.remove('hidden');
    iconClose.classList.add('hidden');
    btn.setAttribute('aria-label', 'Abrir menu');
}

function toggleMobileMenu() {
    if (menu.classList.contains('-translate-x-full')) {
    openMobileMenu();
    } else {
    closeMobileMenu();
    }
}

btn.addEventListener('click', toggleMobileMenu);
overlay.addEventListener('click', closeMobileMenu);

// Fechar menu ao clicar em algum link mobile
menu.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', closeMobileMenu);
});