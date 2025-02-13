document.addEventListener("DOMContentLoaded", function() {
  // Global variable to track the current sort order. Default is ascending.
  let currentSort = "asc";

  // Global storage for NFT metadata (for filtering).
  let allNFTData = [];

  // Helper function to sort allNFTData based on currentSort (when no additional filtering is active).
  function sortData() {
    if (currentSort === 'asc') {
      allNFTData.sort((a, b) => {
        let numA = parseInt(a.meta.name.match(/\d+/)?.[0] || "0", 10);
        let numB = parseInt(b.meta.name.match(/\d+/)?.[0] || "0", 10);
        return numA - numB;
      });
    } else if (currentSort === 'desc') {
      allNFTData.sort((a, b) => {
        let numA = parseInt(a.meta.name.match(/\d+/)?.[0] || "0", 10);
        let numB = parseInt(b.meta.name.match(/\d+/)?.[0] || "0", 10);
        return numB - numA;
      });
    }
  }

  // Helper function to return the currently filtered data based on trait selections.
  function getFilteredData() {
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
      return allNFTData.slice(); // Return a copy of allNFTData.
    }
    return allNFTData.filter(nft => {
      return Object.keys(filters).every(category => {
        return nft.meta.attributes.some(attr => {
          return attr.trait_type.toLowerCase() === category.toLowerCase() &&
                 filters[category].includes(attr.value.toLowerCase());
        });
      });
    });
  }

  // New helper that returns the combined filtered data from traits and the subtoolbar search.
  function getCombinedFilteredData() {
    let filteredByTraits = getFilteredData();
    let query = (searchBar ? searchBar.value.trim().toLowerCase() : "").replace(/#/g, '');
    if (query !== "") {
      return filteredByTraits.filter(nft => {
        let normalizedName = nft.meta.name.toLowerCase().replace(/#/g, '');
        return normalizedName.includes(query);
      });
    }
    return filteredByTraits;
  }

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
        // Update the gallery on every trait checkbox change.
        updateGalleryFromSearchAndTraits();
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
      // Always work on the currently filtered set (traits + search)
      let currentData = getCombinedFilteredData();
      
      if (sortValue === "asc" || sortValue === "desc") {
        currentSort = sortValue;
        if (currentSort === 'asc') {
          currentData.sort((a, b) => {
            let numA = parseInt(a.meta.name.match(/\d+/)?.[0] || "0", 10);
            let numB = parseInt(b.meta.name.match(/\d+/)?.[0] || "0", 10);
            return numA - numB;
          });
        } else {
          currentData.sort((a, b) => {
            let numA = parseInt(a.meta.name.match(/\d+/)?.[0] || "0", 10);
            let numB = parseInt(b.meta.name.match(/\d+/)?.[0] || "0", 10);
            return numB - numA;
          });
        }
        populateGallery(currentData);
      } else if (sortValue === "inscription-low-high") {
        currentData.sort((a, b) => {
          let insA = parseInt(a.meta["\u25c9"] || "0", 10);
          let insB = parseInt(b.meta["\u25c9"] || "0", 10);
          return insA - insB;
        });
        populateGallery(currentData);
      } else if (sortValue === "inscription-high-low") {
        currentData.sort((a, b) => {
          let insA = parseInt(a.meta["\u25c9"] || "0", 10);
          let insB = parseInt(b.meta["\u25c9"] || "0", 10);
          return insB - insA;
        });
        populateGallery(currentData);
      }
    });
  });
  
  // -------------- Subtoolbar Search Functionality --------------
  const searchBar = document.getElementById('search');
  if (searchBar) {
    searchBar.addEventListener('input', function() {
      updateGalleryFromSearchAndTraits();
    });
  }
  
  // Helper that combines trait filtering and subtoolbar search.
  function updateGalleryFromSearchAndTraits() {
    let currentData = getCombinedFilteredData();
    populateGallery(currentData);
  }
  
  // -------------- Trait Selection & Filtering --------------
  const selectedTraitsContainer = document.querySelector('.selected-traits');
  const mobileStickyBar = document.querySelector('.mobile-sticky-bar');
  
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
      updateGalleryFromSearchAndTraits();
    });
    traitBox.appendChild(removeIcon);
    selectedTraitsContainer.appendChild(traitBox);
    updateClearAllVisibility();
    
    if (mobileStickyBar && window.innerWidth <= 768 && sidebar.classList.contains('open')) {
      mobileStickyBar.classList.add('active');
    }
    updateGalleryFromSearchAndTraits();
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
    updateGalleryFromSearchAndTraits();
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
          updateGalleryFromSearchAndTraits();
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
      titlePara.style.fontWeight = "500";
      titlePara.style.color = getComputedStyle(document.querySelector('.collection-title')).color;
      nftText.appendChild(titlePara);
      
      // Add the inscription number below the name if it exists in the metadata.
      if (item.meta["\u25c9"]) {
        const inscriptionPara = document.createElement('p');
        inscriptionPara.classList.add('nft-inscription');
        // Insert zero-width spaces for display purposes.
        const numText = item.meta["\u25c9"].split('').join('\u200B');
        inscriptionPara.textContent = `◉ ${numText}`;
        // Store the raw number for copying.
        inscriptionPara.dataset.raw = item.meta["\u25c9"];
        
        // When the user copies, replace the clipboard text with the raw number.
        inscriptionPara.addEventListener('copy', function(e) {
          e.preventDefault();
          if (e.clipboardData) {
            e.clipboardData.setData('text/plain', inscriptionPara.dataset.raw);
          }
        });
        
        nftText.appendChild(inscriptionPara);
      }                
      
      nftItem.appendChild(imgWrapper);
      nftItem.appendChild(nftText);
      gallery.appendChild(nftItem);
    });
  }
  
  // -------------- Grid Toggle Button Functionality (Desktop & Mobile) --------------
  // New approach: toggle a CSS class on the gallery and update the grid button icon.
  (function() {
    const toolbar = document.querySelector('.toolbar');
    if (!toolbar) return;
    let gridBtn = toolbar.querySelector('.grid-button');
    if (!gridBtn) {
      gridBtn = document.createElement('button');
      gridBtn.classList.add('grid-button');
      const searchInput = toolbar.querySelector('input#search');
      if (searchInput) {
        toolbar.insertBefore(gridBtn, searchInput);
      } else {
        toolbar.appendChild(gridBtn);
      }
    }
    // Initialize gallery with default grid if not already set.
    const gallery = document.querySelector('.gallery');
    if (gallery && !gallery.classList.contains('default-grid') && !gallery.classList.contains('large-grid')) {
      gallery.classList.add('default-grid');
      // Optionally, you could also set inline style here:
      // gallery.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
    }
    // Set initial grid button icon.
    gridBtn.innerHTML = '<i class="fa-solid fa-border-all"></i>';
    gridBtn.addEventListener('click', function() {
      const gallery = document.querySelector('.gallery');
      if (!gallery) return;
      if (gallery.classList.contains('default-grid')) {
        // Switch to large grid.
        gallery.classList.remove('default-grid');
        gallery.classList.add('large-grid');
        // Optionally, set inline style if not using CSS classes:
        // gallery.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
        gridBtn.innerHTML = '<i class="fa-solid fa-table-cells"></i>';
      } else {
        // Revert to default grid.
        gallery.classList.remove('large-grid');
        gallery.classList.add('default-grid');
        // gallery.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
        gridBtn.innerHTML = '<i class="fa-solid fa-border-all"></i>';
      }
    });
  })();
  
  // -------------- Load NFT Metadata from metadata.json --------------
  fetch('metadata.json', { headers: { 'Accept': 'application/json' } })
    .then(response => response.json())
    .then(data => {
      // Store the raw data without forcing ascending sort.
      allNFTData = data;
      // Apply the current sort preference.
      sortData();
      populateGallery(allNFTData);
      buildFilters();
    })
    .catch(err => {
      console.error('Error fetching metadata.json:', err);
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
      allNFTData = sampleMetadata;
      sortData();
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
      updateGalleryFromSearchAndTraits();
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
