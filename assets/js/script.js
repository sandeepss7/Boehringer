

// script for the pop-up page "bi-newmodal"
document.addEventListener('DOMContentLoaded', function() {
    // Configuration using IDs from your HTML
    const config = {
        modalId: 'ctl18_divVar',
        selectionsContainerId: 'ctl18_selectionsA',
        buttonWrapId: 'ctl18_divmaster',
        proceedButtonId: 'lnkprocedd',
        resetButtonId: 'lnkreset'
    };

    // Check if the master div exists - exit if not present
    const masterDiv = document.getElementById(config.buttonWrapId);
    if (!masterDiv) {
        return; // Skip all functionality if ctl18_divmaster doesn't exist
    }

    // Session storage keys
    const PROCEED_CLICKED = 'proceedButtonClicked';
    const FORM_DATA = 'formData';

    // Get references to important elements
    const modal = document.getElementById(config.modalId);
    if (!modal) return; // Exit if modal not found

    const selectionsContainer = document.getElementById(config.selectionsContainerId);
    const proceedButton = document.getElementById(config.proceedButtonId);
    const resetButton = document.getElementById(config.resetButtonId);
    
    // Get all inputs inside the bi-newmodal__selectionsa div that need special handling
    const selectionsADiv = document.querySelector('.bi-newmodal__selectionsa');
    const selectionsAInputs = selectionsADiv ? 
        selectionsADiv.querySelectorAll('input') : [];
    
    // Get all input fields in the initial active area
    const initialInputFields = selectionsContainer ? 
        selectionsContainer.querySelectorAll('input, select') : [];
    
    // Get all other fields and buttons that should be disabled initially
    const allOtherInputFields = [];
    
    // Find all inputs, selects, and buttons outside the initial active area
    if (modal) {
        const allElements = modal.querySelectorAll('input, select, a.bi-btn');
        allElements.forEach(el => {
            // Skip the proceed button and elements in the initial selections area
            if ((el === proceedButton) || 
                (el === resetButton) || 
                (selectionsContainer && selectionsContainer.contains(el))) {
                return;
            }
            
            // Add to the list of elements to disable
            allOtherInputFields.push(el);
        });
    }

    // Function to save form data to session storage
    function saveFormData() {
        const formData = {};
        const allInputs = modal.querySelectorAll('input, select');
        allInputs.forEach((input, index) => {
            // Use ID if available, otherwise use a generated ID
            const key = input.id || `input_${index}`;
            formData[key] = input.value;
        });
        sessionStorage.setItem(FORM_DATA, JSON.stringify(formData));
    }

    // Function to restore form data from session storage
    function restoreFormData() {
        const formDataJson = sessionStorage.getItem(FORM_DATA);
        if (formDataJson) {
            const formData = JSON.parse(formDataJson);
            Object.keys(formData).forEach(key => {
                // Handle both ID-based and index-based keys
                if (key.startsWith('input_')) {
                    const index = parseInt(key.split('_')[1]);
                    const inputs = modal.querySelectorAll('input, select');
                    if (inputs[index]) {
                        inputs[index].value = formData[key];
                    }
                } else {
                    const input = document.getElementById(key);
                    if (input) {
                        input.value = formData[key];
                    }
                }
            });
        }
    }

    // Function to disable an element
    function disableElement(el) {
        if (el.tagName.toLowerCase() === 'a') {
            // For anchor tags, add a disabled class and prevent clicks
            el.classList.add('disabled');
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.5';
        } else if (el.tagName.toLowerCase() === 'select') {
            // For select elements, disable and set to first option as placeholder
            el.disabled = true;
            // Save current selection if it exists
            const currentValue = el.value;
            if (currentValue) {
                el.setAttribute('data-saved-value', currentValue);
            }
            // Set to first option to show as placeholder
            if (el.options.length > 0) {
                el.selectedIndex = 0;
            }
        } else {
            // For input elements
            el.disabled = true;
        }
    }

    // Function to enable an element
    function enableElement(el) {
        if (el.tagName.toLowerCase() === 'a') {
            // For anchor tags, remove disabled class and allow clicks
            el.classList.remove('disabled');
            el.style.pointerEvents = '';
            el.style.opacity = '';
        } else if (el.tagName.toLowerCase() === 'select') {
            // For select elements, enable and restore previous selection if any
            el.disabled = false;
            // Restore previous selection if it was saved
            const savedValue = el.getAttribute('data-saved-value');
            if (savedValue) {
                el.value = savedValue;
                el.removeAttribute('data-saved-value');
            }
        } else {
            // For input elements
            el.disabled = false;
        }
    }

    // Function to disable all inputs in bi-newmodal__selectionsa
    function disableSelectionsAInputs() {
        selectionsAInputs.forEach(input => {
            input.disabled = true;
            input.style.backgroundColor = '#f5f5f5'; // Optional: visual indication
            input.style.cursor = 'not-allowed';
            input.style.opacity = '0.6';
        });
    }

    // Function to enable all inputs in bi-newmodal__selectionsa
    function enableSelectionsAInputs() {
        selectionsAInputs.forEach(input => {
            input.disabled = false;
            input.style.backgroundColor = ''; // Remove background color
            input.style.cursor = '';
            input.style.opacity = '';
        });
    }

    // Function to apply initial state
    function applyInitialState() {
        // Check if we're in the "proceeded" state from session storage
        const proceedClicked = sessionStorage.getItem(PROCEED_CLICKED) === 'true';
        
        if (proceedClicked) {
            // Apply the "after proceed" state
            if (resetButton) {
                resetButton.style.display = 'inline-block';
                resetButton.parentElement.style.display = 'inline-block';
            }
            
            if (proceedButton) {
                proceedButton.style.display = 'none';
                proceedButton.parentElement.style.display = 'none';
            }
            
            // Enable all other fields
            allOtherInputFields.forEach(el => {
                enableElement(el);
            });

            // Disable all inputs in bi-newmodal__selectionsa when in "proceeded" state
            disableSelectionsAInputs();
        } else {
            // Apply initial state - only initial fields and proceed button enabled
            if (resetButton) {
                resetButton.style.display = 'none';
                resetButton.parentElement.style.display = 'none';
            }
            
            if (proceedButton) {
                proceedButton.style.display = 'inline-block';
                proceedButton.parentElement.style.display = 'inline-block';
            }
            
            // Disable all other fields
            allOtherInputFields.forEach(el => {
                disableElement(el);
            });
            
            // Enable initial fields
            initialInputFields.forEach(field => {
                enableElement(field);
            });

            // Ensure all inputs in bi-newmodal__selectionsa are enabled in initial state
            enableSelectionsAInputs();
            
            // Check if initial fields have values to enable/disable proceed button
            updateProceedButtonState();
        }
        
        // Restore any saved form data
        restoreFormData();
    }

    // Function to update the state of the proceed button based on initial fields
    function updateProceedButtonState() {
        if (!proceedButton) return;
        
        let allFieldsHaveValues = true;
        initialInputFields.forEach(field => {
            if (!field.value.trim()) {
                allFieldsHaveValues = false;
            }
        });
        
        if (allFieldsHaveValues) {
            enableElement(proceedButton);
        } else {
            disableElement(proceedButton);
        }
    }

    // Function to handle proceed button click
    function handleProceedClick(e) {
        e.preventDefault();
        
        // Hide Proceed button and show Reset button
        if (proceedButton) {
            proceedButton.style.display = 'none';
            proceedButton.parentElement.style.display = 'none';
        }
        
        if (resetButton) {
            resetButton.style.display = 'inline-block';
            resetButton.parentElement.style.display = 'inline-block';
        }
        
        // Enable all other fields
        allOtherInputFields.forEach(el => {
            enableElement(el);
        });

        // Disable all inputs in bi-newmodal__selectionsa when Reset button becomes visible
        disableSelectionsAInputs();
        
        // Save state to session storage
        sessionStorage.setItem(PROCEED_CLICKED, 'true');
        saveFormData();
    }

    // Function to handle reset button click
    function handleResetClick(e) {
        e.preventDefault();
        
        // Hide Reset button and show Proceed button
        if (resetButton) {
            resetButton.style.display = 'none';
            resetButton.parentElement.style.display = 'none';
        }
        
        if (proceedButton) {
            proceedButton.style.display = 'inline-block';
            proceedButton.parentElement.style.display = 'inline-block';
        }
        
        // Save the dropdown selection in bi-newmodal__selectionsa
        const dropdownInSelectionsA = selectionsContainer ? 
            selectionsContainer.querySelector('.bi-newmodal__drpdwn') : null;
        const savedDropdownValue = dropdownInSelectionsA ? dropdownInSelectionsA.value : null;
        
        // Clear initial fields except for the dropdown in bi-newmodal__selectionsa
        initialInputFields.forEach(field => {
            // Skip the dropdown in bi-newmodal__selectionsa
            if (field !== dropdownInSelectionsA) {
                field.value = '';
            }
        });
        
        // Disable all other fields
        allOtherInputFields.forEach(el => {
            disableElement(el);
        });
        
        // Enable initial fields
        initialInputFields.forEach(field => {
            enableElement(field);
        });

        // Enable all inputs in bi-newmodal__selectionsa when Reset button is clicked
        enableSelectionsAInputs();
        
        // Reset proceed button state
        if (proceedButton) {
            disableElement(proceedButton);
        }
        
        // Restore the dropdown value
        if (dropdownInSelectionsA && savedDropdownValue) {
            dropdownInSelectionsA.value = savedDropdownValue;
        }
        
        // Clear session storage state
        sessionStorage.removeItem(PROCEED_CLICKED);
        sessionStorage.removeItem(FORM_DATA);
    }

    // Set up event listeners
    if (proceedButton) {
        proceedButton.addEventListener('click', handleProceedClick);
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', handleResetClick);
    }
    
    // Add event listeners to initial input fields
    initialInputFields.forEach(field => {
        field.addEventListener('input', updateProceedButtonState);
        field.addEventListener('change', updateProceedButtonState);
    });

    // Handle page reload and navigation
    window.addEventListener('beforeunload', function() {
        saveFormData();
    });

    // Apply the initial state
    applyInitialState();
});
  // script ends for the pop-up page "bi-newmodal"
// checkout button disabled script
document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.terms-checkbox input[type="checkbox"]');
    const checkoutLink = document.getElementById('lblSCProceedTo');

    // If either element is not found, exit to avoid errors.
    if (!checkoutLink || checkboxes.length === 0) {
        console.error("Required elements (checkboxes or checkout link) not found.");
        return;
    }

    /**
     * Checks if all checkboxes are checked and updates the checkout link's state.
     */
    function updateLinkState() {
        // '.every' returns true if all checkboxes in the array pass the test.
        const allChecked = [...checkboxes].every(checkbox => checkbox.checked);

        if (allChecked) {
            checkoutLink.classList.remove('disabled');
            checkoutLink.classList.add('active');
            // Set the href to allow the postback to occur.
            checkoutLink.href = "javascript:__doPostBack('ctl16$lblSCProceedTo','')";
        } else {
            checkoutLink.classList.add('disabled');
            checkoutLink.classList.remove('active');
            // Remove the href to prevent clicking.
            checkoutLink.removeAttribute('href');
        }
    }

    /**
     * Prevents the default click action if the link is disabled.
     * @param {Event} e The click event.
     */
    function handleLinkClick(e) {
        if (checkoutLink.classList.contains('disabled')) {
            e.preventDefault();
        }
    }

    // --- Event Listeners ---

    // 1. Listen for page load (for initial load and non-cached reloads).
    // This is kept for robustness.
    updateLinkState();

    // 2. Listen for 'pageshow' event (handles back/forward navigation).
    // This is the key fix for your issue. It runs every time the page is displayed.
    window.addEventListener('pageshow', updateLinkState);

    // 3. Listen for changes on each checkbox.
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateLinkState);
    });

    // 4. Listen for clicks on the checkout link to prevent navigation when disabled.
    checkoutLink.addEventListener('click', handleLinkClick);
});
  
//PRODUCT HOVER ANIMATION
//$(".product-box").hover(function() {
//var el = $(this).find('.hover'),
//curHeight = el.height(),
//autoHeight = el.css('height', 'auto').height(),
//finHeight = $('.product-box').data('hover') == 1 ? "28px" : autoHeight;
//$('.product-box').data('hover', $(this).data('hover') == 1 ? false : true);
//el.height(curHeight).stop().animate({
//height: finHeight
//});
//});

//Main CAROUSAL

$('.bottle-product').slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  dots: true,
  Infinity: true,
  autoplaySpeed: 2000,
});

//var imageCount = $('.bo-banner img').length;

//$('.bo-banner').slick({
//    dots: imageCount > 1, 
//    infinite: true,
//    arrows: false,
//    autoplay: true,
//    fade: true,
//    speed: 500,
//});

$('.product-slick').slick({
  slidesToShow: 6,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 1000,
  arrows: false,
  dots: false,
  centerMode: true,
  centerPadding: '54px',
  responsive: [
      {
          breakpoint: 1024,
          settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
              infinite: true,
              dots: false
          }
      },
      {
          breakpoint: 600,
          settings: {
              slidesToShow: 2,
              slidesToScroll: 2
          }
      },
      {
          breakpoint: 480,
          settings: {
              slidesToShow: 1,
              slidesToScroll: 1
          }
      }
  ]
});

//OWL CAROUSAL
$('.mph-owl').owlCarousel({
  loop: false,

  nav: true,
  dots: false,
  autoplay: false,
  autoplayTimeout: 4000,
  responsive: {
      0: {
          items: 2,
          margin: 7
      },
      600: {
          items: 3,
          margin: 8
      },
      960: {
          items: 4,
          margin: 10
      },
      1200: {
          items: 4,
          margin: 15
      }
  }
});



//OWL CAROUSAL- PRODUCT DETAILS PAGE
$('.recent-owl').owlCarousel({
  loop: false,
  nav: true,
  dots: false,
  autoplay: false,
  mouseDrag: false,
  autoplayTimeout: 4000,
  responsive: {
      0: {
          items: 2,
          margin: 7
      },
      480: {
          items: 2,
          margin: 7
      },

      768: {
          items: 4,
          margin: 10
      },
      992: {
          items: 4,
          margin: 10
      },
      1200: {
          items: 6,
          margin: 10
      }
  }
});


//OWL CAROUSAL- MODAL
$('.modal-owl').owlCarousel({
  loop: false,
  nav: true,
  dots: false,
  autoplay: false,
  mouseDrag: false,
  autoplayTimeout: 4000,
  responsive: {
      0: {
          items: 1,
          margin: 0
      },
      480: {
          items: 2,
          margin: 8
      },

      768: {
          items: 3,
          margin: 10
      },
      992: {
          items: 3,
          margin: 10
      },
      1200: {
          items: 3,
          margin: 10
      }
  }
});




///carousel touch enable
$(".carousel").on("touchstart", function (event) {
  var xClick = event.originalEvent.touches[0].pageX;
  $(this).one("touchmove", function (event) {
      var xMove = event.originalEvent.touches[0].pageX;
      if (Math.floor(xClick - xMove) > 5) {
          $(this).carousel('next');
      } else if (Math.floor(xClick - xMove) < -5) {
          $(this).carousel('prev');
      }
  });
  $(".carousel").on("touchend", function () {
      $(this).off("touchmove");
  });
});






////FILTER OPTION ACTIVE CLASS ADD
$(document).ready(function () {

  $('.menu-icon').click(function () {
      $('.middle-menu').removeClass("active");
      $(this).addClass("active");
  });
})

$('a[href="#"]').click(function (event) {
  event.preventDefault();
});


//////SMOOTH SCROLLING
$(document).ready(function () {
  $(".banner-menu a").on('click', function (event) {
      if (this.hash !== "") {
          event.preventDefault();
          var hash = this.hash;
          $('html, body').animate({
              scrollTop: $(hash).offset().top
          }, 1000, function () {
              window.location.hash = hash;
          });
      }
  });
});

//SEARCH BAR
$(function () {
  $(".search-stick-enable").on("click", function (e) {
      $(".search-stick").toggleClass("show");
  });

});


$('.search-stick').each(function () {
  var $this = $(this);
  var field = $this.find('[type=text], [type=file], [type=email], [type=password], textarea');
  var span = $(this).find('> span');
  var onBlur = function () {
      if ($.trim(field.val()) == '') {
          field.val('');
          span.fadeIn(100);
      } else {
          span.fadeTo(100, 0);
      }
  };
  field.focus(function () {
      span.fadeOut(100);
  }).blur(onBlur);
  onBlur();
});


////LIST AND GRID VIEW
$(document).ready(function () {

  $('#list').click(function () {
      $('#list-grid').toggleClass("list-view");
      $('#list').toggleClass("active");
      $('#grid').removeClass("active");


  });
})
$(document).ready(function () {

  $('#grid').click(function () {
      $('#list-grid').removeClass("list-view");
      $('#grid').addClass("active");
      $('#list').removeClass("active");


  });
})


///FILTER MOBILE
$(document).ready(function () {
  $(document).on('click', '#filter-expand-mbl', () => {
      $('.left-box').toggleClass('filter-mbl');
  });
});


/////TEXT LIMIT - PRODUCT DETAILS PAGE
var windowWidth = $(window).width();
if (windowWidth > 992) {
  var txt = $('.short-des').text();
  if (txt.length)
      $('.short-des').text(txt.substring(0, 800) + '.....');
} else if (windowWidth > 768) {
  var txt = $('.short-des').text();

  if (txt.length)
      $('.short-des').text(txt.substring(0, 400) + '.....');
} else if (windowWidth > 300) {
  var txt = $('.short-des').text();
  $('#show').removeClass('show');
  if (txt.length)
      $('.short-des').text(txt.substring(0, 400) + '.....');
}

//TEXT LIMIT - PRODUCT NAME
$(function () {

  $(".book-name").each(function (i) {

      var len = $(this).text().length;

      if (len > 30) {

          $(this).text($(this).text().substr(0, 34) + '...');

      }
  });
});


//add class on specific width

// header-dropdown
$(document).ready(function () {

  $('.ab-header__dropdown').click(function () {

      $('.ab-header__dropdown').toggleClass("active");
      $('.ab-header__dropdown-menu ').toggleClass("active");
      $('.ab-header__overlay').toggleClass("active");


  });
  $('.ab-header__overlay').click(function () {
      $('.ab-header__overlay').toggleClass("active");
      $('.ab-header__dropdown').toggleClass("active");
      $('.ab-header__dropdown-menu ').toggleClass("active");



  });
  $('.ab-header__close').click(function () {
      $('.ab-header__overlay').removeClass("active");
      $('.ab-header__dropdown').removeClass("active");
      $('.ab-header__dropdown-menu ').removeClass("active");



  });
  if ($(".ab-header__dropdown-menu").hasClass("active")) {
      alert("aa")
  }

})
var $sliderSlides = $('.slider-photos .slides.owl-carousel'),
  $sliderThumbs = $('.slider-photos .slider-thumbs.owl-carousel'),
  speed = 700,
  activeClass = 'active';

// Start Carousel
$sliderSlides.owlCarousel({
  loop: true,
  items: 1,
  margin: 0,
  nav: true,
  smartSpeed: speed
})
  .on('click', '.owl-prev', function () {
      var i = $(this).index();
      var activeThumb = $sliderThumbs.find('.slide.active').parent();
      var all = $sliderThumbs.find('.owl-item').length - 1;

      if (activeThumb.prev().length) {
          activeThumb.find('.slide').removeClass(activeClass);
          activeThumb.prev().find('.slide').addClass(activeClass);
          $sliderThumbs.trigger('to.owl.carousel', [i, speed, true]);
      } else {
          $sliderThumbs.find('.owl-item').eq(all).find('.slide').addClass(activeClass);
          $sliderThumbs.trigger('to.owl.carousel', [all, speed, true]);
      }

  })
  .on('click', '.owl-next', function () {
      var i = $(this).index();
      var activeThumb = $sliderThumbs.find('.slide.active').parent();

      if (activeThumb.next().length) {
          activeThumb.find('.slide').removeClass(activeClass);
          activeThumb.next().find('.slide').addClass(activeClass);
          $sliderThumbs.trigger('to.owl.carousel', [i, speed, true]);
      } else {
          $sliderThumbs.find('.owl-item').eq(0).find('.slide').addClass(activeClass);
          $sliderThumbs.trigger('to.owl.carousel', [0, speed, true]);
      }
  });

$sliderThumbs
  .owlCarousel({
      loop: true,
      margin: 0,
      items: 5,
      nav: true,
      smartSpeed: speed
  })
  .on('click', '.owl-item', function () {
      var i = $(this).index();

      $sliderThumbs.trigger('to.owl.carousel', [i, speed, true]);
      $sliderSlides.trigger('to.owl.carousel', [i, speed, true]);
  })

// If the loop is disabled
// .on('click', '.owl-next.disabled', function() {
// 	$sliderThumbs.trigger('to.owl.carousel', [0, speed, true]);
// })
// .on('click', '.owl-prev.disabled', function() {
// 	var last = $sliderThumbs.find('.owl-item').length;
// 	$sliderThumbs.trigger('to.owl.carousel', [last, speed, true]);
// })

$('.slider-photos .counter .all').text($('.slider-photos .slider-thumbs .slide').length);

$sliderThumbs.find('.slide').on('click', function (event) {
  event.preventDefault();

  $sliderThumbs.find('.slide.active').removeClass(activeClass);
  $(this).addClass(activeClass);
});
$(document).ready(function () {
  $("#owl-demo").owlCarousel({
      navigation: true,
      items: 1,
      loop: true,
      nav: true,
      URLhashListener: true,
      animateOut: 'fadeOut',
      animateIn: 'fadeIn',
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const inputFields = document.querySelectorAll(".cx-contact__input");
  const checkInputField = (inputField) => {
      const asteriskOut = inputField.nextElementSibling;
      if (asteriskOut && asteriskOut.classList.contains("cx-contact__astrparent")) {
          if (inputField.value.trim() !== "") {
              asteriskOut.classList.add("active");
          } else {
              asteriskOut.classList.remove("active");
          }
      }
  };

  inputFields.forEach((inputField) => {
      inputField.addEventListener("keyup", () => {
          checkInputField(inputField);
      });

      checkInputField(inputField);
  });
});

//const drpbutton = document.querySelectorAll(".cx-odrsmry__txtcart");
//const drpbody = document.querySelectorAll(".cx-copdt__outer");
//const drparrow = document.querySelectorAll(".cx-copdt__outer a");

//drpbutton.forEach((btn, index) => {
//    btn.addEventListener("click", () => {

//        drpbody[index].classList.toggle("active");
//    });
//});

const drpbutton = document.querySelectorAll(".cx-odrsmry__txtcart");
const drpbody = document.querySelectorAll(".cx-copdt__outer");
const drparrow = document.querySelectorAll(".cx-copdt__link svg");

drpbutton.forEach((btn, index) => {
  btn.addEventListener("click", () => {
      drpbody[index].classList.toggle("active");
      if (drpbody[index].classList.contains("active")) {
          drparrow[index].style.transform = "rotate(180deg)";
      } else {
          drparrow[index].style.transform = "rotate(0deg)";
      }
  });
});


// dropdown style script starts

function createCustomSelect(selectMenu) {
  const selectElement = selectMenu.querySelector('select');
  const selected = document.createElement('div');
  selected.classList.add('select-selected');
  selected.textContent = selectElement.options[selectElement.selectedIndex].text;
  selectMenu.insertBefore(selected, selectElement);

  const items = document.createElement('div');
  items.classList.add('select-items', 'select-hide');
  for (let i = 0; i < selectElement.options.length; i++) { 
    const item = document.createElement('div');
    item.textContent = selectElement.options[i].text;
    item.addEventListener('click', () => {
      selectElement.selectedIndex = i; 
      selectElement.options[i].selected = true; 
      for (let j = 0; j < selectElement.options.length; j++) {
        if (j !== i) {
          selectElement.options[j].selected = false;
        }
      }
      selected.textContent = selectElement.options[i].text;
      items.classList.add('select-hide');
      selected.classList.toggle('select-arrow-active');

      const allOptions = items.querySelectorAll('div');
      allOptions.forEach(option => option.classList.remove('same-as-selected'));

      item.classList.add('same-as-selected'); 
    });
    items.appendChild(item);
  }
  selectMenu.insertBefore(items, selectElement.nextSibling);

  selected.addEventListener('click', () => {
    items.classList.toggle('select-hide');
    selected.classList.toggle('select-arrow-active');
  });
}

// Find all elements with the class "select-menu"
const selectMenus = document.getElementsByClassName("select-menu");

// Create custom select for each element
for (let i = 0; i < selectMenus.length; i++) {
  createCustomSelect(selectMenus[i]);
}

// Close all select boxes when clicking outside
document.addEventListener('click', (event) => {
  if (!event.target.closest('.select-selected')) {
    const selectItems = document.querySelectorAll('.select-items');
    selectItems.forEach(item => item.classList.add('select-hide'));
    const selectedItems = document.querySelectorAll('.select-selected');
    selectedItems.forEach(item => item.classList.remove('select-arrow-active'));
  }
});

// dropdown style script ends

// table scroll text script starts

document.addEventListener('DOMContentLoaded', function() {
  const scrollableTables = document.querySelectorAll('.bi-tbl__scroll'); // Select ALL scrollable tables
  const scrollIndicators = document.querySelectorAll('.scroll-indicator'); // Select ALL indicators

  // Assuming a one-to-one correspondence between tables and indicators
  scrollableTables.forEach((table, index) => {
      const indicator = scrollIndicators[index]; // Get corresponding indicator

      function checkScroll() {
          if (table.scrollWidth > table.clientWidth) {
              indicator.classList.add('show-scroll-indicator');
          } else {
              indicator.classList.remove('show-scroll-indicator');
          }
      }

      checkScroll();
      window.addEventListener('resize', checkScroll); // Consider if resize applies to each table individually or window
  });
});

// table scroll text script ends