document.addEventListener("DOMContentLoaded", function() {
    const filterToggle = document.getElementById('filter-toggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    
    // Open sidebar on mobile when "Filters" is clicked
    filterToggle.addEventListener('click', function() {
      sidebar.classList.add('open');
    });
    
    // Close sidebar on mobile when "✖" is clicked
    if (closeSidebar) {
      closeSidebar.addEventListener('click', function() {
        sidebar.classList.remove('open');
      });
    }
    
    // Accordion functionality for attribute categories
    const attributeHeaders = document.querySelectorAll('.attribute-category-header');
    attributeHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const attributeList = header.nextElementSibling;
        if (attributeList.style.display === 'block') {
          attributeList.style.display = 'none';
          header.querySelector('.toggle-icon').textContent = '+';
        } else {
          attributeList.style.display = 'block';
          header.querySelector('.toggle-icon').textContent = '-';
        }
      });
    });
  });
  