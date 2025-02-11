document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    
    menuToggle.addEventListener('click', function() {
      // Toggle sidebar display on mobile
      if (sidebar.style.display === 'block') {
        sidebar.style.display = 'none';
      } else {
        sidebar.style.display = 'block';
      }
    });
  });
  