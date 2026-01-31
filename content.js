// Simple test to ensure script loads
console.log('Buy Direct content script loaded!');

// Extract product information from Amazon page
function getProductInfo() {
  console.log('getProductInfo called');
  
  // Try to get the brand
  let brand = '';
  const brandLink = document.querySelector('#bylineInfo');
  if (brandLink) {
    // For books, the author name is inside an <a> tag within #bylineInfo.
    // Grab just that link's text to avoid pulling in "(Author)", "Format:", etc.
    const authorLink = brandLink.querySelector('a');
    if (authorLink) {
      brand = authorLink.textContent.trim();
    } else {
      brand = brandLink.textContent.replace('Visit the ', '').replace(' Store', '').replace('Brand: ', '').trim();
    }
  }
  
  // Try alternative brand selectors
  if (!brand) {
    const brandElement = document.querySelector('a[id*="brand"]');
    if (brandElement) {
      brand = brandElement.textContent.trim();
    }
  }
  
  // Get product title
  let productName = '';
  const titleElement = document.querySelector('#productTitle');
  if (titleElement) {
    productName = titleElement.textContent.trim();
  }
  
  // Fallback: if brand wasn't found via selectors, check the product title for known brands
  if (!brand && productName) {
    const KNOWN_BRANDS = [
      'stanley', 'owala', 'nike', 'adidas', 'asics', 'apple', 'sony', 'samsung',
      'dell', 'hp', 'lg', 'puma', 'reebok', 'underarmour', 'newbalance'
    ];
    const titleLower = productName.toLowerCase();
    for (const knownBrand of KNOWN_BRANDS) {
      if (titleLower.includes(knownBrand)) {
        brand = knownBrand.charAt(0).toUpperCase() + knownBrand.slice(1);
        console.log('Brand found in product title:', brand);
        break;
      }
    }
  }
  
  // Detect product type
  let isBook = false;
  let isMovie = false;
  let isMusic = false;
  let isVideoGame = false;
  let isFood = false;
  let isArtSupplies = false;
  let isHomeImprovement = false;
  let isHomeAndLiving = false;
  
  const url = window.location.href.toLowerCase();
  
  // Check URL for specific category indicators (most reliable)
  if (url.includes('/books/') || url.includes('-ebook/') || url.includes('kindle-ebook') || url.includes('/audible-')) {
    isBook = true;
  } else if (url.includes('/movies-tv/') || url.includes('/movies-')) {
    isMovie = true;
  } else if (url.includes('/cds-vinyl/') || url.includes('/music/')) {
    isMusic = true;
  } else if (url.includes('/video-games/')) {
    isVideoGame = true;
  } else if (url.includes('/grocery/') || url.includes('/gourmet-food/') || url.includes('/whole-foods/') || 
             url.includes('/grocery-gourmet-food/')) {
    isFood = true;
  } else if (url.includes('/arts-crafts/') || url.includes('/craft-supplies/')) {
    isArtSupplies = true;
  } else if (url.includes('/tools-home-improvement/') || url.includes('/hi/') || url.includes('/hardware/')) {
    isHomeImprovement = true;
  } else if (url.includes('/kitchen/') || url.includes('/pet-supplies/') || url.includes('/beauty/')) {
    isHomeAndLiving = true;
  }
  
  // Check breadcrumbs or categories if URL didn't match
  if (!isBook && !isMovie && !isMusic && !isVideoGame && !isFood && !isArtSupplies && !isHomeImprovement && !isHomeAndLiving) {
    const breadcrumbs = document.querySelector('#wayfinding-breadcrumbs_feature_div');
    if (breadcrumbs) {
      const breadcrumbText = breadcrumbs.textContent.toLowerCase();
      if (breadcrumbText.includes('books') && !breadcrumbText.includes('audiobooks')) {
        isBook = true;
      } else if (breadcrumbText.includes('movies') || breadcrumbText.includes('tv shows')) {
        isMovie = true;
      } else if ((breadcrumbText.includes('cds & vinyl') || breadcrumbText.includes('music')) && 
                 !breadcrumbText.includes('instruments')) {
        isMusic = true;
      } else if (breadcrumbText.includes('video games') || breadcrumbText.includes('playstation') || 
                 breadcrumbText.includes('xbox') || breadcrumbText.includes('nintendo switch')) {
        isVideoGame = true;
      } else if (breadcrumbText.includes('grocery') || breadcrumbText.includes('gourmet food') || 
                 breadcrumbText.includes('pantry') || breadcrumbText.includes('whole foods') ||
                 breadcrumbText.includes('snacks') || breadcrumbText.includes('protein bars')) {
        isFood = true;
      } else if (breadcrumbText.includes('arts') || breadcrumbText.includes('crafts') || 
                 breadcrumbText.includes('craft supplies')) {
        isArtSupplies = true;
      } else if (breadcrumbText.includes('tools') || breadcrumbText.includes('home improvement') || 
                 breadcrumbText.includes('hardware')) {
        isHomeImprovement = true;
      } else if (breadcrumbText.includes('kitchen') || breadcrumbText.includes('pet supplies') || 
                 breadcrumbText.includes('beauty')) {
        isHomeAndLiving = true;
      }
    }
  }
  
  // Check format selectors only if still not detected
  if (!isBook && !isMovie && !isMusic && !isVideoGame && !isFood && !isArtSupplies && !isHomeImprovement && !isHomeAndLiving) {
    const formats = document.querySelectorAll('[class*="format"], [id*="format"]');
    formats.forEach(format => {
      const text = format.textContent.toLowerCase();
      if (text.includes('kindle') || text.includes('audible') || text.includes('paperback') || 
          text.includes('hardcover')) {
        isBook = true;
      } else if (text.includes('blu-ray') || text.includes('dvd') || text.includes('4k ultra')) {
        isMovie = true;
      } else if (text.includes('vinyl') || text.includes('audio cd')) {
        isMusic = true;
      }
    });
  }
  
  const result = {
    brand: brand,
    productName: productName,
    url: window.location.href,
    isBook: isBook,
    isMovie: isMovie,
    isMusic: isMusic,
    isVideoGame: isVideoGame,
    isFood: isFood,
    isArtSupplies: isArtSupplies,
    isHomeImprovement: isHomeImprovement,
    isHomeAndLiving: isHomeAndLiving
  };
  
  console.log('Returning product info:', result);
  return result;
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  if (request.action === "getProductInfo") {
    const info = getProductInfo();
    console.log('Sending product info:', info);
    sendResponse(info);
  }
  return true; // Keep the message channel open for async response
});