document.addEventListener("DOMContentLoaded", function() {
  // Accordion toggle for attribute categories
  const categoryHeaders = document.querySelectorAll('.attribute-category-header');
  categoryHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const list = header.nextElementSibling;
      list.classList.toggle('open');
      if (list.classList.contains('open')) {
        header.querySelector('.toggle-icon').textContent = '-';
      } else {
        header.querySelector('.toggle-icon').textContent = '+';
      }
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
