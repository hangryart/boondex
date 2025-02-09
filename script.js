const sidebar = document.getElementById("sidebar");
const filterToggle = document.getElementById("filter-toggle");
const closeSidebar = document.getElementById("close-sidebar");

filterToggle.addEventListener("click", () => {
    sidebar.classList.add("open");
});

closeSidebar.addEventListener("click", () => {
    sidebar.classList.remove("open");
});
