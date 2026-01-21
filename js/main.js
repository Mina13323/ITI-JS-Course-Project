// Main JavaScript File - Simple Beginner Version

// Wait for the page to fully load before running code
document.addEventListener("DOMContentLoaded", function () {
  // =====================
  // STICKY HEADER
  // =====================
  var header = document.querySelector(".header-bottom");
  var headerTop = document.querySelector(".header-top");
  var headerTopHeight = headerTop ? headerTop.offsetHeight : 0;

  window.addEventListener("scroll", function () {
    var scrollPosition = window.scrollY;

    if (scrollPosition > headerTopHeight) {
      header.classList.add("stick");
    } else {
      header.classList.remove("stick");
    }
  });

  // =====================
  // SEARCH TOGGLE
  // =====================
  var searchButton = document.querySelector(".search-toggle");
  var searchForm = document.querySelector(".header-search-form");

  if (searchButton && searchForm) {
    searchButton.addEventListener("click", function () {
      if (searchForm.classList.contains("open")) {
        searchForm.classList.remove("open");
        searchButton.innerHTML = '<i class="ion-ios-search-strong"></i>';
      } else {
        searchForm.classList.add("open");
        searchButton.innerHTML = '<i class="ion-android-close"></i>';
      }
    });
  }

  // =====================
  // MOBILE MENU TOGGLE
  // =====================
  var mobileMenuContainer = document.querySelector(".mobile-menu");
  var mainMenu = document.querySelector("#main-menu");

  if (mobileMenuContainer && mainMenu) {
    // Create mobile menu button
    var menuButton = document.createElement("button");
    menuButton.className = "mobile-menu-toggle";
    menuButton.innerHTML = '<i class="ion-navicon"></i>';
    mobileMenuContainer.appendChild(menuButton);

    // Create close button
    var closeButton = document.createElement("button");
    closeButton.className = "mobile-menu-close";
    closeButton.innerHTML = '<i class="ion-android-close"></i>';
    closeButton.style.display = "none";
    mobileMenuContainer.appendChild(closeButton);

    // Clone menu for mobile
    var mobileNav = mainMenu.cloneNode(true);
    mobileNav.className = "mobile-nav";
    mobileNav.style.display = "none";
    mobileMenuContainer.appendChild(mobileNav);

    // Toggle menu on button click
    menuButton.addEventListener("click", function () {
      mobileNav.style.display = "block";
      menuButton.style.display = "none";
      closeButton.style.display = "block";
    });

    // Close menu on close button click
    closeButton.addEventListener("click", function () {
      mobileNav.style.display = "none";
      menuButton.style.display = "block";
      closeButton.style.display = "none";
    });
  }

  // =====================
  // SIMPLE IMAGE SLIDER
  // =====================
  var heroSlider = document.querySelector(".hero-slider");

  if (heroSlider) {
    var slides = heroSlider.querySelectorAll(".hero-item");
    var currentSlide = 0;
    var totalSlides = slides.length;

    // Hide all slides except the first one
    for (var i = 1; i < totalSlides; i++) {
      slides[i].style.display = "none";
    }

    // Create dots container
    var dotsContainer = document.createElement("div");
    dotsContainer.className = "slider-dots";
    heroSlider.appendChild(dotsContainer);

    // Create dots for each slide
    for (var j = 0; j < totalSlides; j++) {
      var dot = document.createElement("span");
      dot.className = "slider-dot";
      if (j === 0) dot.classList.add("active");
      dot.setAttribute("data-slide", j);
      dotsContainer.appendChild(dot);

      // Add click event to each dot
      dot.addEventListener("click", function () {
        var slideIndex = parseInt(this.getAttribute("data-slide"));
        goToSlide(slideIndex);
      });
    }

    // Function to go to a specific slide
    function goToSlide(index) {
      slides[currentSlide].style.display = "none";
      dotsContainer.children[currentSlide].classList.remove("active");

      currentSlide = index;

      slides[currentSlide].style.display = "block";
      dotsContainer.children[currentSlide].classList.add("active");
    }

    // Auto-play slider every 5 seconds
    setInterval(function () {
      var nextSlide = (currentSlide + 1) % totalSlides;
      goToSlide(nextSlide);
    }, 5000);
  }

  // =====================
  // CART QUANTITY BUTTONS
  // =====================
  var quantityInputs = document.querySelectorAll(".product-quantity");

  quantityInputs.forEach(function (container) {
    var input = container.querySelector("input");

    // Create minus button
    var minusButton = document.createElement("span");
    minusButton.className = "qty-btn qty-minus";
    minusButton.innerHTML = '<i class="fa fa-angle-left"></i>';
    container.insertBefore(minusButton, input);

    // Create plus button
    var plusButton = document.createElement("span");
    plusButton.className = "qty-btn qty-plus";
    plusButton.innerHTML = '<i class="fa fa-angle-right"></i>';
    container.appendChild(plusButton);

    // Minus button click
    minusButton.addEventListener("click", function () {
      var currentValue = parseInt(input.value) || 0;
      if (currentValue > 0) {
        input.value = currentValue - 1;
      }
    });

    // Plus button click
    plusButton.addEventListener("click", function () {
      var currentValue = parseInt(input.value) || 0;
      input.value = currentValue + 1;
    });
  });

  // =====================
  // CHECKOUT FORM TABS
  // =====================
  var checkoutTabs = document.querySelectorAll(".checkout-method-list li");

  checkoutTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var formClass = this.getAttribute("data-form");

      // Remove active from all tabs
      checkoutTabs.forEach(function (t) {
        t.classList.remove("active");
      });

      // Add active to clicked tab
      this.classList.add("active");

      // Hide all forms
      var allForms = document.querySelectorAll(".checkout-method form");
      allForms.forEach(function (form) {
        form.style.display = "none";
      });

      // Show selected form
      var selectedForm = document.querySelector("." + formClass);
      if (selectedForm) {
        selectedForm.style.display = "block";
      }
    });
  });

  // =====================
  // SHIPPING FORM TOGGLE
  // =====================
  var shippingToggle = document.querySelector(".shipping-form-toggle");
  var shippingForm = document.querySelector(".shipping-form");

  if (shippingToggle && shippingForm) {
    shippingToggle.addEventListener("click", function () {
      if (this.classList.contains("active")) {
        this.classList.remove("active");
        shippingForm.style.display = "none";
      } else {
        this.classList.add("active");
        shippingForm.style.display = "block";
      }
    });
  }

  // =====================
  // PAYMENT METHOD TOGGLE
  // =====================
  var paymentTabs = document.querySelectorAll(".payment-method-list li");
  var paymentForm = document.querySelector(".payment-form");

  paymentTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      // Remove active from all tabs
      paymentTabs.forEach(function (t) {
        t.classList.remove("active");
      });

      // Add active to clicked tab
      this.classList.add("active");

      // Show/hide payment form based on which tab is clicked
      if (this.classList.contains("payment-form-toggle") && paymentForm) {
        paymentForm.style.display = "block";
      } else if (paymentForm) {
        paymentForm.style.display = "none";
      }
    });
  });

  // =====================
  // SCROLL TO TOP BUTTON
  // =====================
  // Create scroll to top button
  var scrollUpButton = document.createElement("a");
  scrollUpButton.id = "scrollUp";
  scrollUpButton.innerHTML = '<i class="fa fa-angle-up"></i>';
  scrollUpButton.style.display = "none";
  document.body.appendChild(scrollUpButton);

  // Show button when user scrolls down 300px
  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      scrollUpButton.style.display = "block";
    } else {
      scrollUpButton.style.display = "none";
    }
  });

  // Scroll to top when button is clicked
  scrollUpButton.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // =====================
  // MINI CART DROPDOWN
  // =====================
  var cartToggle = document.querySelector('[data-toggle="dropdown"]');
  var miniCart = document.querySelector(".mini-cart-brief");

  if (cartToggle && miniCart) {
    cartToggle.addEventListener("click", function (e) {
      e.preventDefault();
      miniCart.classList.toggle("show");
    });

    // Close cart when clicking outside
    document.addEventListener("click", function (e) {
      if (!cartToggle.contains(e.target) && !miniCart.contains(e.target)) {
        miniCart.classList.remove("show");
      }
    });
  }

  // =====================
  // ACCORDION (for checkout page)
  // =====================
  var accordionHeads = document.querySelectorAll(".accordion-head");

  accordionHeads.forEach(function (head) {
    head.addEventListener("click", function (e) {
      e.preventDefault();

      var targetId = this.getAttribute("href");
      var targetPanel = document.querySelector(targetId);

      if (targetPanel) {
        // Close all other panels
        var allPanels = document.querySelectorAll(
          ".single-accordion .collapse",
        );
        allPanels.forEach(function (panel) {
          if (panel !== targetPanel) {
            panel.classList.remove("show");
          }
        });

        // Toggle current panel
        targetPanel.classList.toggle("show");
      }
    });
  });
});
