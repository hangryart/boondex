// Open Sidebar
document.getElementById('filter-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
});

// Close Sidebar
document.getElementById('close-sidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
});
