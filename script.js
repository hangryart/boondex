document.addEventListener("DOMContentLoaded", function() {
  // Accordion toggle for trait categories with smooth rotation
  const categoryHeaders = document.querySelectorAll('.attribute-category-header');
  categoryHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const list = header.nextElementSibling;
      list.classList.toggle('open');
      const icon = header.querySelector('.toggle-icon i');
      icon.classList.toggle('rotated', list.classList.contains('open'));
    });
  });

  // Mobile sidebar toggle functionality
  const filterToggle = document.getElementById('filter-toggle');
  const sidebar = document.getElementById('sidebar');
  if (filterToggle) {
    filterToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
      // When opening the sidebar, if traits are selected, show the sticky bar
      if (window.innerWidth <= 768 && selectedTraitsExist() && mobileStickyBar) {
        mobileStickyBar.classList.add('active');
      }
    });
  }
  
  const closeSidebar = document.getElementById('close-sidebar');
  if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
      sidebar.classList.remove('open');
      // Slide out the sticky bar with the panel
      if (mobileStickyBar) {
        mobileStickyBar.classList.remove('active');
      }
    });
  }
  
  // Mobile panel toggle button in the toolbar functionality
  const mobilePanelToggle = document.getElementById('mobile-panel-toggle');
  if (mobilePanelToggle) {
    mobilePanelToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
      // When opening the panel, if traits are selected, show the sticky bar
      if (window.innerWidth <= 768 && selectedTraitsExist() && mobileStickyBar) {
        mobileStickyBar.classList.add('active');
      }
    });
  }
  
  // Sort Toggle Button Functionality
  const sortToggle = document.getElementById('sort-toggle');
  const sortMenu = document.getElementById('sort-menu');
  if (sortToggle) {
    sortToggle.addEventListener('click', function(e) {
      // Toggle the sort menu popup
      sortMenu.classList.toggle('open');
      // Prevent the click event from propagating so it doesn't close immediately
      e.stopPropagation();
    });
  }
  
  // Close sort menu when clicking outside of it
  document.addEventListener('click', function(e) {
    if (sortMenu.classList.contains('open') && !sortMenu.contains(e.target) && e.target !== sortToggle) {
      sortMenu.classList.remove('open');
    }
  });
  
  // Close sort menu when clicking on any sort menu item
  const sortMenuItems = document.querySelectorAll('.sort-menu-item');
  sortMenuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      // You can process the selection here if needed.
      sortMenu.classList.remove('open');
    });
  });
  
  // Trait selection functionality
  const traitCheckboxes = document.querySelectorAll('.checkbox-wrapper input[type="checkbox"]');
  const selectedTraitsContainer = document.querySelector('.selected-traits');
  
  // Mobile sticky bar element (should be in your HTML)
  const mobileStickyBar = document.querySelector('.mobile-sticky-bar');
  
  // Helper to check if any trait boxes exist
  function selectedTraitsExist() {
    return selectedTraitsContainer.querySelectorAll('.trait-box').length > 0;
  }
  
  function generateKey(category, trait) {
    return category + ":" + trait;
  }
  
  function addTraitSelection(checkbox) {
    const traitLabel = checkbox.closest('.attribute-item');
    const categoryElement = checkbox.closest('.attribute-category').querySelector('.category-title');
    const category = categoryElement ? categoryElement.textContent.trim() : "";
    const trait = traitLabel.querySelector('.trait-text').textContent.trim();
    const key = generateKey(category, trait);
    if (selectedTraitsContainer.querySelector(`[data-key="${key}"]`)) return;
    
    const traitBox = document.createElement('div');
    traitBox.classList.add('trait-box');
    traitBox.setAttribute('data-key', key);
    traitBox.textContent = category + ": " + trait;
    
    const removeIcon = document.createElement('span');
    removeIcon.classList.add('remove-trait');
    removeIcon.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    removeIcon.addEventListener('click', function() {
      traitBox.remove();
      checkbox.checked = false;
      updateClearAllVisibility();
    });
    traitBox.appendChild(removeIcon);
    selectedTraitsContainer.appendChild(traitBox);
    updateClearAllVisibility();
    
    // On mobile: if the sidebar is open and a trait is selected, slide in the sticky bar from left quickly.
    if (mobileStickyBar && window.innerWidth <= 768 && sidebar.classList.contains('open')) {
      mobileStickyBar.classList.add('active');
    }
  }
  
  function removeTraitSelection(checkbox) {
    const traitLabel = checkbox.closest('.attribute-item');
    const categoryElement = checkbox.closest('.attribute-category').querySelector('.category-title');
    const category = categoryElement ? categoryElement.textContent.trim() : "";
    const trait = traitLabel.querySelector('.trait-text').textContent.trim();
    const key = generateKey(category, trait);
    const traitBox = selectedTraitsContainer.querySelector(`[data-key="${key}"]`);
    if (traitBox) traitBox.remove();
    updateClearAllVisibility();
  }
  
  function updateClearAllVisibility() {
    const clearAllBox = selectedTraitsContainer.querySelector('.clear-all');
    const traitBoxes = selectedTraitsContainer.querySelectorAll('.trait-box');
    if (traitBoxes.length > 0) {
      if (!clearAllBox) {
        const clearAll = document.createElement('div');
        clearAll.classList.add('clear-all');
        clearAll.textContent = "Clear all";
        clearAll.addEventListener('click', function() {
          traitCheckboxes.forEach(chk => chk.checked = false);
          selectedTraitsContainer.innerHTML = "";
          if (mobileStickyBar) {
            mobileStickyBar.classList.remove('active');
          }
        });
        selectedTraitsContainer.insertBefore(clearAll, selectedTraitsContainer.firstChild);
      }
    } else {
      if (clearAllBox) clearAllBox.remove();
      if (mobileStickyBar) {
        mobileStickyBar.classList.remove('active');
      }
    }
  }
  
  traitCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (checkbox.checked) {
        addTraitSelection(checkbox);
      } else {
        removeTraitSelection(checkbox);
      }
    });
  });
  
  // Event listeners for the mobile sticky bar buttons
  const resetBtn = document.querySelector('.mobile-sticky-bar .reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      traitCheckboxes.forEach(chk => chk.checked = false);
      selectedTraitsContainer.innerHTML = "";
      if (mobileStickyBar) {
        mobileStickyBar.classList.remove('active');
      }
    });
  }
  
  const showBtn = document.querySelector('.mobile-sticky-bar .show-btn');
  if (showBtn) {
    showBtn.addEventListener('click', function() {
      // Close the left panel
      if (sidebar) {
        sidebar.classList.remove('open');
      }
      if (mobileStickyBar) {
        mobileStickyBar.classList.remove('active');
      }
      // Future functionality for "Show" button can be added here
    });
  }
});
  
document.addEventListener("DOMContentLoaded", function() {
  var title = document.querySelector('.header-title');
  var micro5 = new FontFaceObserver('Micro 5');
  
  micro5.load().then(function() {
    title.style.visibility = 'visible';
  }).catch(function() {
    // In case the font fails to load, still show the title
    title.style.visibility = 'visible';
  });
});
