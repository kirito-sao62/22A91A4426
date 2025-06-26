import { Log } from 'logging-middleware';

// Use localStorage to persist URLs across browser sessions
const getUrlsFromStorage = () => {
  const urls = localStorage.getItem('shortenedUrls');
  return urls ? JSON.parse(urls) : [];
};

const saveUrlsToStorage = (urls) => {
  localStorage.setItem('shortenedUrls', JSON.stringify(urls));
};

// Generates a random alphanumeric string of a given length
const generateShortcode = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// The core service object
export const urlService = {
  // Get all stored URLs
  getAllUrls: () => {
    Log('frontend', 'info', 'service', 'Fetching all URLs from storage.');
    return getUrlsFromStorage();
  },

  // Get a single URL by its shortcode
  getUrlByShortcode: (shortcode) => {
    const urls = getUrlsFromStorage();
    const urlData = urls.find(u => u.shortcode === shortcode);
    if (urlData) {
        Log('frontend', 'info', 'service', `Found URL for shortcode: ${shortcode}`);
    } else {
        Log('frontend', 'warn', 'service', `No URL found for shortcode: ${shortcode}`);
    }
    return urlData;
  },

  // Shorten a new URL
  shortenUrl: (longUrl, customShortcode = null, validity = 30) => {
    return new Promise((resolve, reject) => {
      let urls = getUrlsFromStorage();
      let finalShortcode = customShortcode;

      // Validate custom shortcode if provided
      if (customShortcode) {
        if (!/^[a-zA-Z0-9]+$/.test(customShortcode) || customShortcode.length < 3) {
          Log('frontend', 'error', 'service', 'Invalid custom shortcode format provided.');
          return reject(new Error('Custom shortcode is invalid (alphanumeric, min 3 chars).'));
        }
        if (urls.some(u => u.shortcode === customShortcode)) {
          Log('frontend', 'warn', 'service', 'Custom shortcode already exists.');
          return reject(new Error('This custom shortcode is already taken.'));
        }
      } else {
        // Generate a unique shortcode
        do {
          finalShortcode = generateShortcode();
        } while (urls.some(u => u.shortcode === finalShortcode));
        Log('frontend', 'info', 'service', `Generated new shortcode: ${finalShortcode}`);
      }
      
      const expiryDate = new Date(Date.now() + validity * 60 * 1000).toISOString();
      const newUrl = {
        longUrl,
        shortcode: finalShortcode,
        shortUrl: `${window.location.origin}/${finalShortcode}`,
        createdAt: new Date().toISOString(),
        expiryDate,
      };

      urls.push(newUrl);
      saveUrlsToStorage(urls);

      Log('frontend', 'info', 'service', `Successfully shortened URL: ${longUrl}`);
      resolve(newUrl);
    });
  }
};