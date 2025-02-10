document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const filterToggle = document.getElementById("filter-toggle");
    const closeSidebar = document.getElementById("close-sidebar");
  
    // Open sidebar on mobile
    filterToggle.addEventListener("click", () => {
      sidebar.classList.add("open");
    });
  
    // Close sidebar on mobile
    closeSidebar.addEventListener("click", () => {
      sidebar.classList.remove("open");
    });
  });
  