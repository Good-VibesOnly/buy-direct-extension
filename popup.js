// Alternative shopping sites
const ALTERNATIVES = {
  allPurpose: [
    { name: 'Costco', url: 'https://www.costco.com/CatalogSearch?keyword=' },
    { name: 'Search on DuckDuckGo', url: 'https://duckduckgo.com/?q=', prependBrand: true }
  ],
  tech: [
    { name: 'B&H Photo', url: 'https://www.bhphotovideo.com/c/search?q=' },
    { name: 'Back Market (Second Hand and Refurbished)', url: 'https://www.backmarket.com/en-us/search?q=' }
  ],
  fashion: [
    { name: 'Good On You', url: 'https://directory.goodonyou.eco/search/', useBrand: true }
  ]
};

// Build allPurpose alternative buttons, prepending brand where flagged (e.g. DuckDuckGo)
function renderAllPurposeButtons(searchQuery, brand) {
  let html = '';
  ALTERNATIVES.allPurpose.forEach(site => {
    let query = searchQuery;
    if (site.prependBrand && brand) {
      query = encodeURIComponent(brand) + '+' + searchQuery;
    }
    html += `<a href="${site.url}${query}" target="_blank" class="link-button alt-button">${site.name}</a>`;
  });
  return html;
}

// Known manufacturer search formats
const MANUFACTURER_SEARCH_FORMATS = {
  'asics': 'https://www.asics.com/us/en-us/search/?q=',
  'nike': 'https://www.nike.com/w?q=',
  'adidas': 'https://www.adidas.com/us/search?q=',
  'newbalance': 'https://www.newbalance.com/search/?q=',
  'reebok': 'https://www.reebok.com/us/search?q=',
  'underarmour': 'https://www.underarmour.com/en-us/s?query=',
  'puma': 'https://us.puma.com/us/en/search?q=',
  'samsung': 'https://www.samsung.com/us/search/?searchvalue=',
  'sony': 'https://electronics.sony.com/search?searchTerm=',
  'lg': 'https://www.lg.com/us/search?search=',
  'apple': 'https://www.apple.com/us/search/',
  'dell': 'https://www.dell.com/en-us/search/',
  'hp': 'https://www.hp.com/us-en/shop/s/all?q=',
  'owala': 'https://owalalife.com/collections/all?product-type=',
  'stanley': 'https://www.stanley1913.com/search?q='
};

// Brands with non-standard domains
const BRAND_DOMAINS = {
  'owala': 'owalalife.com',
  'stanley': 'stanley1913.com'
};

// Clean up generic product titles for better searches
function cleanGenericProductTitle(productName, brand) {
  let cleaned = productName;
  
  if (brand) {
    cleaned = cleaned.replace(new RegExp(brand, 'gi'), '').trim();
  }
  
  const parts = cleaned.split(/[,|]/);
  let mainPart = parts[0].trim();
  mainPart = mainPart.replace(/\s+for\s+.*/gi, '');
  
  if (parts.length > 1 && parts[1].match(/\d+\s*(lb|gsm|oz|g|mm|cm|inch|")/i)) {
    mainPart += ', ' + parts[1].trim();
  }
  
  return mainPart.trim();
}

// Check if brand appears to be a generic/dropshipped brand
function isGenericBrand(brand) {
  if (!brand || brand.length === 0) return true;
  
  const knownBrands = ['asics', 'nike', 'adidas', 'apple', 'sony', 'samsung', 'dell', 'hp', 'lg', 
                       'owala', 'stanley', 'puma', 'reebok', 'underarmour', 'newbalance'];
  const cleanBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (knownBrands.includes(cleanBrand)) return false;
  
  const isAllCaps = brand === brand.toUpperCase() && brand.length >= 5;
  const vowelCount = (brand.match(/[aeiou]/gi) || []).length;
  const consonantCount = (brand.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
  const totalLetters = vowelCount + consonantCount;
  const vowelRatio = totalLetters > 0 ? vowelCount / totalLetters : 0;
  
  if (isAllCaps && totalLetters >= 5) {
    const hasWeirdPattern = /[bcdfghjklmnpqrstvwxyz]{3,}/i.test(brand) || 
                           /^[bcdfghjklmnpqrstvwxyz]{2}/i.test(brand);
    const hasCommonEnding = /[aeiou][nrst]$/i.test(brand) || /(er|ly|ed|ing|ion|ics)$/i.test(brand);
    
    if (hasWeirdPattern || (!hasCommonEnding && vowelRatio < 0.4)) return true;
  }
  
  if (brand.length >= 5 && brand !== brand.toUpperCase() && brand !== brand.toLowerCase()) {
    const hasInternalCaps = /[a-z][A-Z]/.test(brand);
    if (hasInternalCaps && !/tech|pro|max|plus|zone|life|mart|world$/i.test(brand)) {
      return true;
    }
  }
  
  if (isAllCaps && brand.length <= 3 && !['HP', 'LG'].includes(brand)) return true;
  if (brand.includes('Visit the') || brand.includes('Store')) return true;
  if (/^(generic|unknown|n\/a|brand)$/i.test(brand)) return true;
  
  return false;
}

// Common manufacturer domains
function getManufacturerInfo(brand) {
  const cleanBrand = brand.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/inc$|llc$|ltd$|corp$/, '');
  
  const domain = BRAND_DOMAINS[cleanBrand] || `${cleanBrand}.com`;
  const baseUrl = `https://${domain.startsWith('www.') ? domain : 'www.' + domain}`;
  const searchUrl = MANUFACTURER_SEARCH_FORMATS[cleanBrand] || `${baseUrl}/search?q=`;
  
  return {
    baseUrl: baseUrl,
    searchUrl: searchUrl
  };
}

// Clean up product name for better search results
function cleanProductName(productName, brand) {
  let cleaned = productName.replace(new RegExp(brand, 'gi'), '').trim();
  
  const cleanBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (cleanBrand === 'owala') {
    const firstWord = cleaned.split(/[\s,|]/)[0].trim();
    return firstWord;
  }
  
  const parts = cleaned.split(/[,|]/);
  const mainPart = parts[0].trim();
  
  cleaned = mainPart
    .replace(/\(.*?\)/g, '')
    .replace(/\bMen's\b|\bWomen's\b|\bUnisex\b/gi, '')
    .replace(/\bRunning\b|\bWalking\b|\bTraining\b/gi, '')
    .replace(/\bShoes?\b/gi, '')
    .replace(/\d+(\.\d+)?\s*(oz|ounce|ml|inch|in|cm)/gi, '')
    .trim();
  
  cleaned = cleaned.replace(/\s+\d+(\.\d+)?$/g, '');
  
  return cleaned.trim();
}

// Get reclassification buttons HTML
function getReclassifyButtons() {
  return `
    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
      <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Wrong category? Reclassify as:</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
        <button class="reclassify-btn" data-type="book" style="padding: 6px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">📚 Book</button>
        <button class="reclassify-btn" data-type="food" style="padding: 6px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">🛒 Food</button>
        <button class="reclassify-btn" data-type="art" style="padding: 6px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">🎨 Art</button>
        <button class="reclassify-btn" data-type="home-improvement" style="padding: 6px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">🔨 Tools</button>
        <button class="reclassify-btn" data-type="home-living" style="padding: 6px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">🌍 Home</button>
        <button class="reclassify-btn" data-type="other" style="padding: 6px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">🏭 Other</button>
      </div>
    </div>
  `;
}

// Add reclassification button handlers
function addReclassifyHandlers(productInfo) {
  document.querySelectorAll('.reclassify-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      reclassifyProduct(productInfo, type);
    });
  });
}

// Reclassify and re-render the popup
function reclassifyProduct(productInfo, newType) {
  productInfo.isBook = (newType === 'book');
  productInfo.isFood = (newType === 'food');
  productInfo.isArtSupplies = (newType === 'art');
  productInfo.isHomeImprovement = (newType === 'home-improvement');
  productInfo.isHomeAndLiving = (newType === 'home-living');
  productInfo.isMovie = false;
  productInfo.isMusic = false;
  productInfo.isVideoGame = false;
  
  if (newType === 'other') {
    productInfo.isBook = false;
    productInfo.isFood = false;
    productInfo.isArtSupplies = false;
    productInfo.isHomeImprovement = false;
    productInfo.isHomeAndLiving = false;
    productInfo.isMovie = false;
    productInfo.isMusic = false;
    productInfo.isVideoGame = false;
  }
  
  displayResults(productInfo);
}

// Display the popup content
async function displayResults(productInfo) {
  const content = document.getElementById('content');
  
  if (!productInfo.productName) {
    content.innerHTML = `
      <div class="error">
        <p>Couldn't find product information on this page.</p>
        <p>Make sure you're on an Amazon product page!</p>
      </div>
    `;
    return;
  }
  
  // Special handling for books
  if (productInfo.isBook) {
    const bookTitle = encodeURIComponent(productInfo.productName);
    
    let html = `
      <div class="product-info">
        <div class="product-name">${productInfo.productName}</div>
        ${productInfo.brand ? `<div style="margin-top: 5px; color: #666;">by ${productInfo.brand}</div>` : ''}
      </div>
      
      <div class="section">
        <div class="section-title">📚 Support Local Bookstores:</div>
        <a href="https://bookshop.org/search?keywords=${bookTitle}" target="_blank" class="link-button">
          Physical & eBooks - Bookshop.org
        </a>
        <a href="https://libro.fm/search?q=${bookTitle}" target="_blank" class="link-button">
          Audiobooks - Libro.fm
        </a>
      </div>
      
      <div class="section">
        <div class="section-title">🛒 Other Options:</div>
    `;
    
    html += renderAllPurposeButtons(bookTitle, productInfo.brand);
    
    html += `
      </div>
      <div style="
        margin-top: 15px;
        padding: 12px;
        background: #e7f3ff;
        border: 1px solid #0066c0;
        border-radius: 5px;
        font-size: 13px;
        color: #333;
      ">
        📖 Don't forget about your local library! They also have audiobooks for rent. Download the <a href="https://libbyapp.com/" target="_blank" style="color: #0066c0; font-weight: bold;">Libby app</a> today.
      </div>
    `;
    
    html += getReclassifyButtons();
    content.innerHTML = html;
    addReclassifyHandlers(productInfo);
    return;
  }
  
  // Special handling for food
  if (productInfo.isFood) {
    let cleanedFoodTitle = productInfo.productName
      .replace(/,\s*\d+\s*(oz|ounce|lb|pound|g|gram|kg|ml|liter|l|count|ct|pack).*/gi, '')
      .replace(/\s*-\s*(Non GMO|Vegan|Kosher|Organic|Gluten Free|Dairy Free|Keto|Paleo).*/gi, '')
      .replace(/\(Pack of \d+\)/gi, '')
      .replace(/\d+\s*(oz|ounce|lb|pound|g|gram|kg|ml|liter|l|count|ct|pack)/gi, '')
      .trim();
    
    const foodTitle = encodeURIComponent(cleanedFoodTitle);
    
    let html = `
      <div class="product-info">
        <div class="product-name">${productInfo.productName}</div>
        ${productInfo.brand ? `<div style="margin-top: 5px; color: #666;">by ${productInfo.brand}</div>` : ''}
      </div>
      
      <div class="section">
        <div class="section-title">🛒 Food & Grocery Options:</div>
        <a href="https://www.costco.com/CatalogSearch?keyword=${foodTitle}" target="_blank" class="link-button">
          Costco
        </a>
        <a href="https://www.instacart.com/" target="_blank" class="link-button">
          Instacart - Search Local Stores
        </a>
        <a href="https://thrivemarket.com/search?searchTerm=${foodTitle}" target="_blank" class="link-button">
          Thrive Market
        </a>
      </div>
    `;
    
    html += getReclassifyButtons();
    content.innerHTML = html;
    addReclassifyHandlers(productInfo);
    return;
  }
  
  // Special handling for movies
  if (productInfo.isMovie) {
    const movieTitle = encodeURIComponent(productInfo.productName);
    
    let html = `
      <div class="product-info">
        <div class="product-name">${productInfo.productName}</div>
      </div>
      
      <div class="section">
        <div class="section-title">🎬 Physical Media:</div>
        <a href="https://www.bullmoose.com/search?q=${movieTitle}" target="_blank" class="link-button">
          Bull Moose
        </a>
      </div>
      
      <div class="section">
        <div class="section-title">🛒 Other Options:</div>
    `;
    
    html += renderAllPurposeButtons(movieTitle, productInfo.brand);
    
    html += `</div>`;
    html += getReclassifyButtons();
    content.innerHTML = html;
    addReclassifyHandlers(productInfo);
    return;
  }
  
  // Special handling for music
  if (productInfo.isMusic) {
    const musicTitle = encodeURIComponent(productInfo.productName);
    
    let html = `
      <div class="product-info">
        <div class="product-name">${productInfo.productName}</div>
        ${productInfo.brand ? `<div style="margin-top: 5px; color: #666;">by ${productInfo.brand}</div>` : ''}
      </div>
      
      <div class="section">
        <div class="section-title">🎵 Physical Music:</div>
        <a href="https://www.bullmoose.com/search?q=${musicTitle}" target="_blank" class="link-button">
          Bull Moose
        </a>
      </div>
      
      <div class="section">
        <div class="section-title">🛒 Other Options:</div>
    `;
    
    html += renderAllPurposeButtons(musicTitle, productInfo.brand);
    
    html += `</div>`;
    html += getReclassifyButtons();
    content.innerHTML = html;
    addReclassifyHandlers(productInfo);
    return;
  }
  
  // Special handling for video games
  if (productInfo.isVideoGame) {
    let gameTitle = productInfo.productName
      .replace(/\s*-\s*(Nintendo Switch|PlayStation 5|PlayStation 4|PS5|PS4|Xbox Series X\|S|Xbox Series X|Xbox One|PC|Steam)/gi, '')
      .replace(/\s*\((Nintendo Switch|PlayStation 5|PlayStation 4|PS5|PS4|Xbox Series X\|S|Xbox Series X|Xbox One|PC|Steam)\)/gi, '')
      .replace(/\s*(Nintendo Switch|PlayStation 5|PlayStation 4|PS5|PS4|Xbox Series X\|S|Xbox Series X|Xbox One|PC|Steam)\s*$/gi, '')
      .trim();
    
    const gameTitleEncoded = encodeURIComponent(gameTitle);
    const fullTitleEncoded = encodeURIComponent(productInfo.productName);
    
    let html = `
      <div class="product-info">
        <div class="product-name">${productInfo.productName}</div>
      </div>
      
      <div class="section">
        <div class="section-title">🎮 Video Games:</div>
        <a href="https://www.bullmoose.com/search?q=${fullTitleEncoded}" target="_blank" class="link-button">
          Bull Moose (Physical)
        </a>
        <a href="https://store.steampowered.com/search/?term=${gameTitleEncoded}" target="_blank" class="link-button">
          Steam (Digital)
        </a>
      </div>
      
      <div class="section">
        <div class="section-title">🛒 Other Options:</div>
    `;
    
    html += renderAllPurposeButtons(fullTitleEncoded, productInfo.brand);
    
    html += `</div>`;
    html += getReclassifyButtons();
    content.innerHTML = html;
    addReclassifyHandlers(productInfo);
    return;
  }
  
  // Special handling for art supplies
  if (productInfo.isArtSupplies) {
    const cleanedTitle = cleanGenericProductTitle(productInfo.productName, productInfo.brand);
    const searchQuery = encodeURIComponent(cleanedTitle);
    
    let html = `
      <div class="product-info">
        <div class="product-name">${productInfo.productName}</div>
        ${productInfo.brand ? `<div style="margin-top: 5px; color: #666;">by ${productInfo.brand}</div>` : ''}
      </div>
      
      <div class="section">
        <div class="section-title">🎨 Art Supplies:</div>
        <a href="https://www.dickblick.com/search/?q=${searchQuery}" target="_blank" class="link-button">
          Blick Art Materials
        </a>
      </div>
      
      <div class="section">
        <div class="section-title">🛒 Other Options:</div>
    `;
    
    html += renderAllPurposeButtons(searchQuery, productInfo.brand);
    
    html += `</div>`;
    html += getReclassifyButtons();
    content.innerHTML = html;
    addReclassifyHandlers(productInfo);
    return;
  }
  
  // Special handling for home improvement
  if (productInfo.isHomeImprovement) {
    const cleanedTitle = cleanGenericProductTitle(productInfo.productName, productInfo.brand);
    const searchQuery = encodeURIComponent(cleanedTitle);
    
    let html = `
      <div class="product-info">
        <div class="product-name">${productInfo.productName}</div>
        ${productInfo.brand ? `<div style="margin-top: 5px; color: #666;">by ${productInfo.brand}</div>` : ''}
      </div>
      
      <div class="section">
        <div class="section-title">🔨 Hardware & Tools:</div>
        <a href="https://www.acehardware.com/search?query=${searchQuery}" target="_blank" class="link-button">
          Ace Hardware
        </a>
      </div>
      
      <div class="section">
        <div class="section-title">🛒 Other Options:</div>
    `;
    
    html += renderAllPurposeButtons(searchQuery, productInfo.brand);
    
    html += `</div>`;
    html += getReclassifyButtons();
    content.innerHTML = html;
    addReclassifyHandlers(productInfo);
    return;
  }
  
  // Special handling for home & living
  if (productInfo.isHomeAndLiving) {
    const cleanedTitle = cleanGenericProductTitle(productInfo.productName, productInfo.brand);
    const searchQuery = encodeURIComponent(cleanedTitle);
    
    let html = `
      <div class="product-info">
        <div class="product-name">${productInfo.productName}</div>
        ${productInfo.brand ? `<div style="margin-top: 5px; color: #666;">by ${productInfo.brand}</div>` : ''}
      </div>
    `;
    
    // If we have a known brand, show manufacturer links first
    if (productInfo.brand && !isGenericBrand(productInfo.brand)) {
      const manufacturerInfo = getManufacturerInfo(productInfo.brand);
      html += `
        <div class="section">
          <div class="section-title">🏭 Try the Manufacturer:</div>
          <a href="${manufacturerInfo.searchUrl}${searchQuery}" target="_blank" class="link-button">
            Search ${productInfo.brand}'s site
          </a>
          <a href="${manufacturerInfo.baseUrl}" target="_blank" class="link-button">
            Visit ${productInfo.brand}'s site
          </a>
        </div>
      `;
    }
    
    html += `
      <div class="section">
        <div class="section-title">🌍 Sustainable Living:</div>
        <a href="https://earthhero.com/search?q=${searchQuery}" target="_blank" class="link-button">
          EarthHero
        </a>
        <a href="https://www.grove.co/search?q=${searchQuery}" target="_blank" class="link-button">
          Grove Collaborative
        </a>
      </div>
      
      <div class="section">
        <div class="section-title">🛒 Other Options:</div>
    `;
    
    html += renderAllPurposeButtons(searchQuery, productInfo.brand);
    
    html += `</div>`;
    html += getReclassifyButtons();
    content.innerHTML = html;
    addReclassifyHandlers(productInfo);
    return;
  }
  
  // Regular product handling - no special category detected
  if (!productInfo.brand) {
    content.innerHTML = `
      <div class="error">
        <p>Couldn't find brand information on this page.</p>
        <p>Try searching by category instead:</p>
      </div>
    `;
    html = getReclassifyButtons();
    content.innerHTML += html;
    addReclassifyHandlers(productInfo);
    return;
  }
  
  // Check if this is a generic/dropshipped brand (no manufacturer to link to)
  if (isGenericBrand(productInfo.brand)) {
    const cleanedTitle = cleanGenericProductTitle(productInfo.productName, productInfo.brand);
    const searchQuery = encodeURIComponent(cleanedTitle);
    
    let html = `
      <div class="product-info">
        <div class="product-name">${productInfo.productName}</div>
      </div>
      
      <div style="
        margin: 15px 0;
        padding: 12px;
        background: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 5px;
      ">
        <div style="font-weight: bold; color: #856404; margin-bottom: 5px;">
          ⚠️ Couldn't find manufacturer website
        </div>
        <div style="color: #856404; font-size: 13px;">
          Try these alternatives, or search by category below:
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">🛒 Alternative Retailers:</div>
    `;
    
    html += renderAllPurposeButtons(searchQuery, productInfo.brand);
    
    html += `</div><div class="section"><div class="section-title">💻 If tech, try:</div>`;
    ALTERNATIVES.tech.forEach(site => {
      html += `<a href="${site.url}${searchQuery}" target="_blank" class="link-button alt-button">${site.name}</a>`;
    });
    
    html += `</div><div class="section"><div class="section-title">👕 If fashion, check if ethical:</div>`;
    ALTERNATIVES.fashion.forEach(site => {
      const query = site.useBrand ? encodeURIComponent(productInfo.brand) : searchQuery;
      html += `<a href="${site.url}${query}" target="_blank" class="link-button alt-button">${site.name}</a>`;
    });
    
    html += `</div>`;
    html += getReclassifyButtons();
    content.innerHTML = html;
    addReclassifyHandlers(productInfo);
    return;
  }
  
  // Valid brand found - show manufacturer options
  displayManufacturerResults(productInfo);
}

// Display manufacturer/regular product results
function displayManufacturerResults(productInfo) {
  const content = document.getElementById('content');
  
  const manufacturerInfo = getManufacturerInfo(productInfo.brand);
  const cleanedName = cleanProductName(productInfo.productName, productInfo.brand);
  const searchQuery = encodeURIComponent(productInfo.productName);
  const cleanSearchQuery = encodeURIComponent(cleanedName);
  const brandQuery = encodeURIComponent(productInfo.brand);
  
  let html = `
    <div class="product-info">
      <div class="brand">${productInfo.brand}</div>
      <div class="product-name">${cleanedName}</div>
    </div>
    
    <div class="section">
      <div class="section-title">🏭 Try the Manufacturer:</div>
      <a href="${manufacturerInfo.searchUrl}${cleanSearchQuery}" target="_blank" class="link-button">
        Search ${productInfo.brand}'s site
      </a>
      <a href="${manufacturerInfo.baseUrl}" target="_blank" class="link-button">
        Visit ${productInfo.brand}'s site
      </a>
    </div>
    
    <div class="section">
      <div class="section-title">🛒 All-Purpose Alternatives:</div>
  `;
  
  html += renderAllPurposeButtons(cleanSearchQuery, productInfo.brand);
  
  html += `
    </div>
    
    <div class="section">
      <div class="section-title">💻 Great Places to Buy Tech:</div>
  `;
  
  ALTERNATIVES.tech.forEach(site => {
    const query = site.useBrand ? brandQuery : cleanSearchQuery;
    html += `<a href="${site.url}${query}" target="_blank" class="link-button alt-button">${site.name}</a>`;
  });
  
  html += `
    </div>
    
    <div class="section">
      <div class="section-title">👕 Check if your fashion brand is ethical:</div>
  `;
  
  ALTERNATIVES.fashion.forEach(site => {
    const query = site.useBrand ? brandQuery : cleanSearchQuery;
    html += `<a href="${site.url}${query}" target="_blank" class="link-button alt-button">${site.name}</a>`;
  });
  
  html += `</div>`;
  
  content.innerHTML = html;
}

// Get product info when popup opens
browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
  console.log('Popup opened, querying tab:', tabs[0].url);
  
  const timeout = setTimeout(() => {
    document.getElementById('content').innerHTML = `
      <div class="error">
        <p>Content script not responding.</p>
        <p>Please refresh the Amazon page and try again.</p>
      </div>
    `;
  }, 3000);
  
  browser.tabs.sendMessage(tabs[0].id, {action: "getProductInfo"})
    .then(productInfo => {
      clearTimeout(timeout);
      console.log('Received product info:', productInfo);
      displayResults(productInfo);
    })
    .catch(error => {
      clearTimeout(timeout);
      console.error('Error getting product info:', error);
      document.getElementById('content').innerHTML = `
        <div class="error">
          <p>Error: ${error.message}</p>
          <p>Make sure you're on an Amazon product page!</p>
          <p style="font-size: 11px;">If you are on an Amazon page, try refreshing the page and clicking the extension again.</p>
        </div>
      `;
    });
});