document.addEventListener("DOMContentLoaded", function() {
  // Accordion toggle for trait categories using Font Awesome icons with smooth rotation
  const categoryHeaders = document.querySelectorAll('.attribute-category-header');
  categoryHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const list = header.nextElementSibling;
      list.classList.toggle('open');
      const icon = header.querySelector('.toggle-icon i');
      // Toggle the 'rotated' class so the icon rotates 180° if open, and back when closed
      icon.classList.toggle('rotated', list.classList.contains('open'));
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

  // Trait selection functionality
  const traitCheckboxes = document.querySelectorAll('.checkbox-wrapper input[type="checkbox"]');
  const selectedTraitsContainer = document.querySelector('.selected-traits');

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
        });
        selectedTraitsContainer.insertBefore(clearAll, selectedTraitsContainer.firstChild);
      }
    } else {
      if (clearAllBox) clearAllBox.remove();
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
});
