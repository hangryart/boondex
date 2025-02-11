document.addEventListener("DOMContentLoaded", function() {
    // Accordion functionality for attribute categories using class toggle
    const categoryHeaders = document.querySelectorAll('.attribute-category-header');
    categoryHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const list = header.nextElementSibling;
        list.classList.toggle('open');
        header.querySelector('.toggle-icon').textContent = list.classList.contains('open') ? '-' : '+';
      });
    });
    
    // Mobile sidebar toggle functionality
    const filterToggle = document.getElementById('filter-toggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    
    if (filterToggle) {
      filterToggle.addEventListener('click', () => {
        sidebar.classList.add('open');
      });
    }
    
    if (closeSidebar) {
      closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('open');
      });
    }
  });
  