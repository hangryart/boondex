document.addEventListener("DOMContentLoaded", function() {
  // -------------- Build Left Panel Filters --------------
  // This function reads allNFTData to generate filter groups based on meta.attributes.
  function buildFilters() {
    let filterData = {};
    // Iterate over each NFT in the global data array.
    allNFTData.forEach(nft => {
      if (nft.meta && nft.meta.attributes) {
        nft.meta.attributes.forEach(attr => {
          let category = attr.trait_type;
          let value = attr.value;
          if (!filterData[category]) {
            filterData[category] = {};
          }
          if (!filterData[category][value]) {
            filterData[category][value] = 0;
          }
          filterData[category][value]++;
        });
      }
    });
    
    // Build HTML for each filter category.
    const accordionContainer = document.querySelector('.attributes-accordion');
    if (!accordionContainer) return;
    accordionContainer.innerHTML = ""; // Clear any existing filters.
    
    for (let category in filterData) {
      let categoryDiv = document.createElement('div');
      categoryDiv.classList.add('attribute-category');
      
      // Create header.
      let headerDiv = document.createElement('div');
      headerDiv.classList.add('attribute-category-header');
      
      let titleSpan = document.createElement('span');
      titleSpan.classList.add('category-title');
      titleSpan.textContent = category;
      
      let countSpan = document.createElement('span');
      countSpan.classList.add('category-count');
      // Display the number of distinct trait values.
      countSpan.textContent = Object.keys(filterData[category]).length;
      
      let toggleSpan = document.createElement('span');
      toggleSpan.classList.add('toggle-icon');
      toggleSpan.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
      
      headerDiv.appendChild(titleSpan);
      headerDiv.appendChild(countSpan);
      headerDiv.appendChild(toggleSpan);
      
      // Create the attribute list.
      let listDiv = document.createElement('div');
      listDiv.classList.add('attribute-list');
      
      for (let value in filterData[category]) {
        let label = document.createElement('label');
        label.classList.add('attribute-item');
        
        let traitLeft = document.createElement('div');
        traitLeft.classList.add('trait-left');
        
        let checkboxWrapper = document.createElement('div');
        checkboxWrapper.classList.add('checkbox-wrapper');
        let checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        // Store the trait value in lowercase for filtering.
        checkbox.value = value.toLowerCase();
        checkboxWrapper.appendChild(checkbox);
        
        let traitText = document.createElement('span');
        traitText.classList.add('trait-text');
        traitText.textContent = value;
        
        traitLeft.appendChild(checkboxWrapper);
        traitLeft.appendChild(traitText);
        
        let traitCount = document.createElement('span');
        traitCount.classList.add('trait-count');
        traitCount.textContent = filterData[category][value];
        
        label.appendChild(traitLeft);
        label.appendChild(traitCount);
        
        listDiv.appendChild(label);
      }
      
      categoryDiv.appendChild(headerDiv);
      categoryDiv.appendChild(listDiv);
      accordionContainer.appendChild(categoryDiv);
    }
    
    // Attach event listeners for the new filters.
    attachAccordionListeners();
    attachTraitCheckboxListeners();
  }
  
  function attachAccordionListeners() {
    const categoryHeaders = document.querySelectorAll('.attribute-category-header');
    categoryHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const list = header.nextElementSibling;
        list.classList.toggle('open');
        const icon = header.querySelector('.toggle-icon i');
        icon.classList.toggle('rotated', list.classList.contains('open'));
      });
    });
  }
  
  function attachTraitCheckboxListeners() {
    // Select all checkboxes from the dynamically built filters.
    const newTraitCheckboxes = document.querySelectorAll('.checkbox-wrapper input[type="checkbox"]');
    newTraitCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
          addTraitSelection(checkbox);
        } else {
          removeTraitSelection(checkbox);
        }
      });
    });
  }
  
  // -------------- Mobile Sidebar & Sort Menu Functionality --------------
  const filterToggle = document.getElementById('filter-toggle');
  const sidebar = document.getElementById('sidebar');
  if (filterToggle) {
    filterToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
      if (window.innerWidth <= 768 && selectedTraitsExist() && mobileStickyBar) {
        mobileStickyBar.classList.add('active');
      }
    });
  }
  
  const closeSidebar = document.getElementById('close-sidebar');
  if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
      sidebar.classList.remove('open');
      if (mobileStickyBar) {
        mobileStickyBar.classList.remove('active');
      }
    });
  }
  
  const mobilePanelToggle = document.getElementById('mobile-panel-toggle');
  if (mobilePanelToggle) {
    mobilePanelToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
      if (window.innerWidth <= 768 && selectedTraitsExist() && mobileStickyBar) {
        mobileStickyBar.classList.add('active');
      }
    });
  }
  
  const sortToggle = document.getElementById('sort-toggle');
  const sortMenu = document.getElementById('sort-menu');
  if (sortToggle) {
    sortToggle.addEventListener('click', function(e) {
      sortMenu.classList.toggle('open');
      e.stopPropagation();
    });
  }
  
  document.addEventListener('click', function(e) {
    if (sortMenu.classList.contains('open') && !sortMenu.contains(e.target) && e.target !== sortToggle) {
      sortMenu.classList.remove('open');
    }
  });
  
  const sortMenuItems = document.querySelectorAll('.sort-menu-item');
  sortMenuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      sortMenu.classList.remove('open');
      let sortValue = item.dataset.value;
      if (sortValue === "asc") {
        allNFTData.sort((a, b) => {
          let numA = parseInt(a.meta.name.match(/\d+/)?.[0] || "0", 10);
          let numB = parseInt(b.meta.name.match(/\d+/)?.[0] || "0", 10);
          return numA - numB;
        });
        populateGallery(allNFTData);
      } else if (sortValue === "desc") {
        allNFTData.sort((a, b) => {
          let numA = parseInt(a.meta.name.match(/\d+/)?.[0] || "0", 10);
          let numB = parseInt(b.meta.name.match(/\d+/)?.[0] || "0", 10);
          return numB - numA;
        });
        populateGallery(allNFTData);
      }
    });
  });
  
  // -------------- Trait Selection & Filtering --------------
  const selectedTraitsContainer = document.querySelector('.selected-traits');
  const mobileStickyBar = document.querySelector('.mobile-sticky-bar');
  
  // Global storage for NFT metadata (for filtering).
  let allNFTData = [];
  
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
      filterGallery();
    });
    traitBox.appendChild(removeIcon);
    selectedTraitsContainer.appendChild(traitBox);
    updateClearAllVisibility();
    
    if (mobileStickyBar && window.innerWidth <= 768 && sidebar.classList.contains('open')) {
      mobileStickyBar.classList.add('active');
    }
    filterGallery();
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
    filterGallery();
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
          document.querySelectorAll('.checkbox-wrapper input[type="checkbox"]').forEach(chk => chk.checked = false);
          selectedTraitsContainer.innerHTML = "";
          if (mobileStickyBar) {
            mobileStickyBar.classList.remove('active');
          }
          filterGallery();
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
  
  // Left panel search functionality to filter trait items in real time.
  const attributeSearch = document.getElementById('attributes-search');
  if (attributeSearch) {
    attributeSearch.addEventListener('input', function() {
      const filter = attributeSearch.value.trim().toLowerCase();
      const categories = document.querySelectorAll('.attribute-category');
      categories.forEach(category => {
        const traitItems = category.querySelectorAll('.attribute-item');
        let matchCount = 0;
        traitItems.forEach(item => {
          const traitTextElement = item.querySelector('.trait-text');
          if (traitTextElement) {
            const traitText = traitTextElement.textContent.trim().toLowerCase();
            if (filter === "" || traitText.startsWith(filter)) {
              item.style.display = "";
              matchCount++;
            } else {
              item.style.display = "none";
            }
          }
        });
        const categoryCountElement = category.querySelector('.category-count');
        if (categoryCountElement) {
          categoryCountElement.textContent = matchCount;
        }
        category.style.display = matchCount > 0 ? "" : "none";
      });
    });
  }
  
  // -------------- NFT Gallery Population & Filtering --------------
  // Using a CSS-based approach for the gallery layout.
  // The gallery grid is controlled by your CSS; this function simply populates it.
  function populateGallery(metadata) {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;
    gallery.innerHTML = "";
    metadata.forEach(item => {
      const nftItem = document.createElement('div');
      nftItem.classList.add('nft-item');
      
      const imgWrapper = document.createElement('div');
      imgWrapper.classList.add('nft-img-wrapper');
      // Add a placeholder class to show animated gradient until image loads.
      imgWrapper.classList.add('placeholder');
      
      const img = document.createElement('img');
      img.src = `https://ordinals.com/content/${item.id}`;
      // Enable lazy loading.
      img.loading = "lazy";
      // For crisp pixel art, these settings are applied:
      img.style.imageRendering = "pixelated";
      img.style.imageRendering = "crisp-edges";
      
      // Once the image loads, remove the placeholder class.
      img.addEventListener('load', function() {
        imgWrapper.classList.remove('placeholder');
      });
      
      imgWrapper.appendChild(img);
      
      const nftText = document.createElement('div');
      nftText.classList.add('nft-text');
      
      const titlePara = document.createElement('p');
      titlePara.textContent = item.meta.name || `Inscription ${item.id}`;
      // Set font weight and color.
      titlePara.style.fontWeight = "500";
      titlePara.style.color = getComputedStyle(document.querySelector('.collection-title')).color;
      
      nftText.appendChild(titlePara);
      nftItem.appendChild(imgWrapper);
      nftItem.appendChild(nftText);
      gallery.appendChild(nftItem);
    });
  }
  
  // Filter the NFT gallery based on selected traits.
  function filterGallery() {
    let filters = {};
    document.querySelectorAll('.checkbox-wrapper input[type="checkbox"]').forEach(checkbox => {
      if (checkbox.checked) {
        const attributeItem = checkbox.closest('.attribute-item');
        const categoryElement = attributeItem.closest('.attribute-category').querySelector('.category-title');
        if (categoryElement) {
          let category = categoryElement.textContent.trim();
          let traitText = attributeItem.querySelector('.trait-text').textContent.trim().toLowerCase();
          if (!filters[category]) filters[category] = [];
          filters[category].push(traitText);
        }
      }
    });
    
    if (Object.keys(filters).length === 0) {
      populateGallery(allNFTData);
      return;
    }
    
    const filteredData = allNFTData.filter(nft => {
      for (let category in filters) {
        let match = nft.meta.attributes.some(attr => {
          return attr.trait_type.toLowerCase() === category.toLowerCase() &&
                 filters[category].includes(attr.value.toLowerCase());
        });
        if (!match) return false;
      }
      return true;
    });
    
    populateGallery(filteredData);
  }
  
  // -------------- Grid Toggle Button Functionality (Desktop & Mobile) --------------
  // Insert a single grid toggle button ("grid-button") into the toolbar.
  const toolbar = document.querySelector('.toolbar');
  if (toolbar) {
    // Remove any existing grid button.
    const existingGridBtn = toolbar.querySelector('.grid-button');
    if (existingGridBtn) {
      existingGridBtn.remove();
    }
    // Create a new grid button.
    const gridBtn = document.createElement('button');
    gridBtn.classList.add('grid-button');
    gridBtn.innerHTML = '<i class="fa-solid fa-border-all"></i>';
    
    // Insert gridBtn into the toolbar, to the left of the search input.
    const searchInput = toolbar.querySelector('input#search');
    if (searchInput) {
      toolbar.insertBefore(gridBtn, searchInput);
    } else {
      toolbar.appendChild(gridBtn);
    }
    
    // Initialize mobile grid state variable.
    let mobileGridState = "default";
    
    gridBtn.addEventListener("click", function() {
      const gallery = document.querySelector('.gallery');
      if (!gallery) return;
      
      if (window.innerWidth >= 768) { // Desktop behavior.
        if (!gallery.dataset.desktopGrid || gallery.dataset.desktopGrid === "default") {
          gallery.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
          gallery.dataset.desktopGrid = "large";
        } else {
          gallery.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
          gallery.dataset.desktopGrid = "default";
        }
      } else { // Mobile behavior.
        if (mobileGridState === "default") {
          gallery.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100%, 1fr))';
          mobileGridState = "one-column";
        } else {
          gallery.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
          mobileGridState = "default";
        }
      }
    });
  }
  
  // -------------- Load NFT Metadata from metadata.json --------------
  // This fetch call loads metadata from the "metadata.json" file in your repository.
  fetch('metadata.json', { headers: { 'Accept': 'application/json' } })
    .then(response => response.json())
    .then(data => {
      // Sort the data in ascending order by the number in the meta.name string.
      allNFTData = data.sort((a, b) => {
        let numA = parseInt(a.meta.name.match(/\d+/)?.[0] || "0", 10);
        let numB = parseInt(b.meta.name.match(/\d+/)?.[0] || "0", 10);
        return numA - numB;
      });
      populateGallery(allNFTData);
      buildFilters();
    })
    .catch(err => {
      console.error('Error fetching metadata.json:', err);
      // Fallback to sample metadata.
      const sampleMetadata = [
        {
          "id": "79c26b0a040bfc0945692294b9c504411adfde54519211dc34817a0d4519a4a8i0",
          "meta": {
            "name": "Boon #4",
            "attributes": [
              { "value": "Boons", "trait_type": "Alliance" },
              { "value": "Gold", "trait_type": "Background" },
              { "value": "Red", "trait_type": "Body" },
              { "value": "Hangry", "trait_type": "Eyes" },
              { "value": "Hangry", "trait_type": "Mouth" },
              { "value": "Pants", "trait_type": "Style" },
              { "value": "Ray Gun", "trait_type": "Auxiliary" },
              { "value": "None", "trait_type": "Headwear" }
            ]
          }
        },
        {
          "id": "d857d9a7fb6783a97b4a57523e450f543d5f50ea119027215cbf4f441bbf295ei0",
          "meta": {
            "name": "Boon #3",
            "attributes": [
              { "value": "Boons", "trait_type": "Alliance" },
              { "value": "Gold", "trait_type": "Background" },
              { "value": "Purple", "trait_type": "Body" },
              { "value": "Hangry", "trait_type": "Eyes" },
              { "value": "Hangry", "trait_type": "Mouth" },
              { "value": "Pants", "trait_type": "Style" },
              { "value": "Provenance", "trait_type": "Auxiliary" },
              { "value": "None", "trait_type": "Headwear" }
            ]
          }
        }
      ];
      allNFTData = sampleMetadata.sort((a, b) => {
        let numA = parseInt(a.meta.name.match(/\d+/)?.[0] || "0", 10);
        let numB = parseInt(b.meta.name.match(/\d+/)?.[0] || "0", 10);
        return numA - numB;
      });
      populateGallery(allNFTData);
      buildFilters();
    });
  
  const resetBtn = document.querySelector('.mobile-sticky-bar .reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      document.querySelectorAll('.checkbox-wrapper input[type="checkbox"]').forEach(chk => chk.checked = false);
      selectedTraitsContainer.innerHTML = "";
      if (mobileStickyBar) {
        mobileStickyBar.classList.remove('active');
      }
      filterGallery();
    });
  }
  
  const showBtn = document.querySelector('.mobile-sticky-bar .show-btn');
  if (showBtn) {
    showBtn.addEventListener('click', function() {
      if (sidebar) {
        sidebar.classList.remove('open');
      }
      if (mobileStickyBar) {
        mobileStickyBar.classList.remove('active');
      }
      // Future functionality for "Show" button can be added here.
    });
  }
});
  
document.addEventListener("DOMContentLoaded", function() {
  var title = document.querySelector('.header-title');
  var micro5 = new FontFaceObserver('Micro 5');
  micro5.load().then(function() {
    title.style.visibility = 'visible';
  }).catch(function() {
    title.style.visibility = 'visible';
  });
});
