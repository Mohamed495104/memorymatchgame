$(document).ready(function () {
    // Image descriptions for gallery
    const imageDescriptions = {
      "Mountains": "Majestic mountain peaks reaching toward the sky with snow-capped summits.",
      "Beach": "Golden sands meeting crystal clear blue waters under a bright sunny sky.",
      "Forest": "Dense woodland with tall trees creating a natural canopy of lush green foliage.",
      "Desert": "Vast landscape of golden sand dunes stretching to the horizon.",
      "Waterfall": "Cascading water tumbling over rocks, creating a mesmerizing natural display.",
      "City": "Vibrant urban landscape with towering skyscrapers illuminated at twilight.",
      "Sunset": "Breathtaking hues of orange, red, and purple as the sun dips below the horizon.",
      "Lake": "Serene body of water reflecting the surrounding landscape like a mirror.",
      "Clouds": "Fluffy white formations drifting across a vibrant blue sky.",
      "Ocean": "Endless expanse of deep blue waters with gentle waves rolling to shore.",
      "River": "Winding waterway cutting through the landscape with trees lining its banks.",
      "Mountain": "Dramatic rocky peak standing tall against the sky with rugged terrain."
    };
  
    // All possible gallery images
    const allImages = [
      { src: "Images/Mountains.jpg", alt: "Mountains", name: "Mountains" },
      { src: "Images/beach.jpg", alt: "Beach", name: "Beach" },
      { src: "Images/Forest.jpg", alt: "Forest", name: "Forest" },
      { src: "Images/Desert.jpg", alt: "Desert", name: "Desert" },
      { src: "Images/Waterfalls.jpg", alt: "Waterfall", name: "Waterfall" },
      { src: "Images/City.jpg", alt: "City", name: "City" },
      { src: "Images/Sunset.jpg", alt: "Sunset", name: "Sunset" },
      { src: "Images/Lake.jpg", alt: "Lake", name: "Lake" },
      { src: "Images/Clouds.jpg", alt: "Clouds", name: "Clouds" },
      { src: "Images/Ocean.jpg", alt: "Ocean", name: "Ocean" },
      { src: "Images/River.jpg", alt: "River", name: "River" },
      { src: "Images/Mountain.jpg", alt: "Mountain", name: "Mountain" }
    ];
  
    // Reference to user's unlocked images from localStorage
    let discoveredImages = [];
    let lockedImages = [];
    
    // Current gallery view state
    let galleryState = {
      viewMode: "grid", // grid or list
      sortBy: "recent", // recent, oldest, name
      difficulty: "all" // all, easy, medium, hard
    };
  
    // Set up event listeners
    function setupEventListeners() {
      // View mode toggle
      $("#grid-view").on("click", function() {
        setViewMode("grid");
      });
      
      $("#list-view").on("click", function() {
        setViewMode("list");
      });
      
      // Sort options
      $("#gallery-sort").on("change", function() {
        galleryState.sortBy = $(this).val();
        renderGallery();
      });
      
      // Difficulty filter
      $("#gallery-difficulty").on("change", function() {
        galleryState.difficulty = $(this).val();
        renderGallery();
      });
      
      // Modal handling
      $(".close-modal, #close-preview").on("click", closeImagePreview);
      
      // Close modal when clicking outside
      $(window).on("click", function(event) {
        if (event.target === $("#image-preview-modal")[0]) {
          closeImagePreview();
        }
      });
    }
  
    // Set view mode (grid or list)
    function setViewMode(mode) {
      galleryState.viewMode = mode;
      
      // Update active button state
      $(".gallery-view-btn").removeClass("active");
      
      if (mode === "grid") {
        $("#gallery-display").removeClass("gallery-list").addClass("gallery-grid");
        $("#grid-view").addClass("active");
      } else {
        $("#gallery-display").removeClass("gallery-grid").addClass("gallery-list");
        $("#list-view").addClass("active");
      }
    }
  
    // Initialize the gallery
    function initGallery() {
      loadDiscoveredImages();
      setupEventListeners();
      renderGallery();
      updateGalleryStats();
      
      // Show achievement notification if appropriate
      checkAndShowAchievement();
    }
  
    // Load discovered images from localStorage
    function loadDiscoveredImages() {
      // Get matched cards from localStorage
      const matchedCards = JSON.parse(localStorage.getItem("matchedCards") || "[]");
      discoveredImages = [];
      
      // Process each matched card
      matchedCards.forEach(card => {
        // Find the corresponding image
        const imageIndex = card.imageIndex % allImages.length;
        const image = allImages[imageIndex];
        
        // Add to discovered images if not already there
        if (image && !discoveredImages.some(img => img.name === image.name)) {
          discoveredImages.push({
            ...image,
            discoveredAt: card.discoveredAt,
            difficulty: card.difficulty
          });
        }
      });
      
      // Determine which images are still locked
      lockedImages = allImages.filter(img => 
        !discoveredImages.some(discovered => discovered.name === img.name)
      );
    }
  
    // Render the gallery based on current state
    function renderGallery() {
      const $galleryDisplay = $("#gallery-display");
      $galleryDisplay.empty();
      
      // Filter images by difficulty
      let imagesToShow = [...discoveredImages];
      if (galleryState.difficulty !== "all") {
        imagesToShow = imagesToShow.filter(img => img.difficulty === galleryState.difficulty);
      }
      
      // Sort images according to selected option
      sortImages(imagesToShow);
      
      // Show/hide empty gallery message
      if (imagesToShow.length === 0) {
        $("#empty-gallery-message").show();
        $(".locked-images-section").show();
      } else {
        $("#empty-gallery-message").hide();
      }
      
      // Create gallery items for each image
      imagesToShow.forEach(image => {
        const discoveryDate = new Date(image.discoveredAt).toLocaleDateString();
        
        if (galleryState.viewMode === "grid") {
          // Create grid view elements using DOM manipulation
          const galleryItem = document.createElement("div");
          galleryItem.className = "gallery-item";
          galleryItem.dataset.name = image.name;
          galleryItem.dataset.difficulty = image.difficulty;
          
          const itemImage = document.createElement("div");
          itemImage.className = "gallery-item-image";
          
          const img = document.createElement("img");
          img.src = image.src;
          img.alt = image.alt;
          
          const overlay = document.createElement("div");
          overlay.className = "gallery-item-overlay";
          
          const viewIcon = document.createElement("span");
          viewIcon.className = "view-icon";
          
          const icon = document.createElement("i");
          icon.className = "fas fa-search-plus";
          
          viewIcon.appendChild(icon);
          overlay.appendChild(viewIcon);
          
          const itemFooter = document.createElement("div");
          itemFooter.className = "gallery-item-footer";
          
          const title = document.createElement("h3");
          title.className = "gallery-item-title";
          title.textContent = image.name;
          
          const date = document.createElement("span");
          date.className = "gallery-item-date";
          date.textContent = discoveryDate;
          
          // Assemble the elements
          itemImage.appendChild(img);
          itemImage.appendChild(overlay);
          
          itemFooter.appendChild(title);
          itemFooter.appendChild(date);
          
          galleryItem.appendChild(itemImage);
          galleryItem.appendChild(itemFooter);
          
          $galleryDisplay.append(galleryItem);
        } else {
          // Create list view elements using DOM manipulation
          const listItem = document.createElement("div");
          listItem.className = "gallery-list-item";
          listItem.dataset.name = image.name;
          listItem.dataset.difficulty = image.difficulty;
          
          const listImage = document.createElement("div");
          listImage.className = "gallery-list-image";
          
          const img = document.createElement("img");
          img.src = image.src;
          img.alt = image.alt;
          
          const listInfo = document.createElement("div");
          listInfo.className = "gallery-list-info";
          
          const title = document.createElement("h3");
          title.className = "gallery-list-title";
          title.textContent = image.name;
          
          const description = document.createElement("p");
          description.className = "gallery-list-description";
          description.textContent = imageDescriptions[image.name] || "A beautiful image.";
          
          const details = document.createElement("div");
          details.className = "gallery-list-details";
          
          const difficulty = document.createElement("span");
          difficulty.className = "gallery-list-difficulty";
          
          const trophyIcon = document.createElement("i");
          trophyIcon.className = "fas fa-trophy";
          
          difficulty.appendChild(trophyIcon);
          difficulty.appendChild(document.createTextNode(" " + capitalizeFirstLetter(image.difficulty)));
          
          const dateSpan = document.createElement("span");
          dateSpan.className = "gallery-list-date";
          
          const calendarIcon = document.createElement("i");
          calendarIcon.className = "fas fa-calendar-alt";
          
          dateSpan.appendChild(calendarIcon);
          dateSpan.appendChild(document.createTextNode(" " + discoveryDate));
          
          const actions = document.createElement("div");
          actions.className = "gallery-list-actions";
          
          const previewBtn = document.createElement("button");
          previewBtn.className = "gallery-preview-btn";
          
          const searchIcon = document.createElement("i");
          searchIcon.className = "fas fa-search-plus";
          
          // Assemble the elements
          previewBtn.appendChild(searchIcon);
          actions.appendChild(previewBtn);
          
          details.appendChild(difficulty);
          details.appendChild(dateSpan);
          
          listInfo.appendChild(title);
          listInfo.appendChild(description);
          listInfo.appendChild(details);
          
          listImage.appendChild(img);
          
          listItem.appendChild(listImage);
          listItem.appendChild(listInfo);
          listItem.appendChild(actions);
          
          $galleryDisplay.append(listItem);
        }
      });
      
      // Render locked images preview
      renderLockedImages();
      
      // Add click event for gallery items
      $(".gallery-item, .gallery-preview-btn").on("click", function() {
        const imageName = $(this).closest("[data-name]").data("name");
        showImagePreview(imageName);
      });
    }
  
    // Sort images based on selected sort option
    function sortImages(images) {
      switch (galleryState.sortBy) {
        case "recent":
          images.sort((a, b) => new Date(b.discoveredAt) - new Date(a.discoveredAt));
          break;
        case "oldest":
          images.sort((a, b) => new Date(a.discoveredAt) - new Date(b.discoveredAt));
          break;
        case "name":
          images.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }
  
    // Render the locked images section
    function renderLockedImages() {
      const $lockedContainer = $("#locked-images-container");
      $lockedContainer.empty();
      
      if (lockedImages.length === 0) {
        $(".locked-images-section").hide();
        return;
      }
      
      lockedImages.forEach(image => {
        // Create locked image item using DOM manipulation
        const lockedItem = document.createElement("div");
        lockedItem.className = "locked-image-item";
        
        const placeholder = document.createElement("div");
        placeholder.className = "locked-image-placeholder";
        
        const lockIcon = document.createElement("i");
        lockIcon.className = "fas fa-lock";
        
        const hint = document.createElement("p");
        hint.className = "locked-image-hint";
        hint.textContent = image.name;
        
        // Assemble the elements
        placeholder.appendChild(lockIcon);
        lockedItem.appendChild(placeholder);
        lockedItem.appendChild(hint);
        
        $lockedContainer.append(lockedItem);
      });
    }
  
    // Update gallery statistics
    function updateGalleryStats() {
      const totalImages = allImages.length;
      const discoveredCount = discoveredImages.length;
      const lockedCount = totalImages - discoveredCount;
      const completionPercent = Math.round((discoveredCount / totalImages) * 100);
      
      $("#discovered-count").text(discoveredCount);
      $("#locked-count").text(lockedCount);
      $("#completion-percent").text(completionPercent + "%");
    }
  
    // Show image preview modal
    function showImagePreview(imageName) {
      const image = discoveredImages.find(img => img.name === imageName);
      
      if (image) {
        // Format date nicely
        const discoveryDate = new Date(image.discoveredAt).toLocaleDateString();
        
        // Update modal content
        $("#preview-image").attr("src", image.src).attr("alt", image.alt);
        $("#preview-title").text(image.name);
        $("#preview-description").text(imageDescriptions[image.name] || "A beautiful image.");
        $("#preview-date").text(discoveryDate);
        $("#preview-difficulty").text(capitalizeFirstLetter(image.difficulty));
        
        // Show modal
        $("#image-preview-modal").css("display", "flex");
      }
    }
  
    // Close image preview modal
    function closeImagePreview() {
      $("#image-preview-modal").css("display", "none");
    }
  
    // Check for achievement and show notification if appropriate
    function checkAndShowAchievement() {
      // Only show if the user has discovered at least one image
      if (discoveredImages.length > 0) {
        $("#achievement-count").text(discoveredImages.length);
        
        // Show notification with animation
        const $notification = $("#achievement-notification");
        $notification.addClass("show");
        
        // Hide notification after 5 seconds
        setTimeout(() => {
          $notification.removeClass("show");
        }, 5000);
      }
    }
  
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  
    // Initialize gallery when document is ready
    initGallery();
  });