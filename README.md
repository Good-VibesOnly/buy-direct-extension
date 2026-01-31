# Buy Direct

A Firefox extension that helps you shop ethically by finding products directly from manufacturers and independent retailers instead of Amazon.

## What It Does

Buy Direct analyzes Amazon product pages and suggests better places to buy:

- **Direct from manufacturers** - Find products on the brand's own website
- **Independent bookstores** - Support local bookstores through Bookshop.org and Libro.fm
- **Ethical alternatives** - Discover sustainable and ethical retailers
- **Category-specific options** - Get curated suggestions for books, food, art supplies, tools, and more

## Features

✅ **Smart Category Detection** - Automatically identifies books, food, tech, home goods, and more  
✅ **Manufacturer Links** - Direct links to brand websites with smart search  
✅ **Generic Product Detection** - Identifies dropshipped/generic products and suggests alternatives  
✅ **Ethical Retailers** - Curated list of independent and sustainable businesses  
✅ **Privacy First** - No data collection, no tracking, works entirely locally  
✅ **Manual Override** - Reclassify products if the auto-detection is wrong  

## Supported Categories

- 📚 **Books** - Bookshop.org, Libro.fm (audiobooks), local library via Libby
- 🛒 **Food** - Costco, Instacart, Thrive Market
- 🎬 **Movies & Music** - Bull Moose
- 🎮 **Video Games** - Bull Moose, Steam
- 🎨 **Art Supplies** - Blick Art Materials
- 🔨 **Tools & Hardware** - Ace Hardware
- 🌍 **Home & Living** - EarthHero, Grove Collaborative
- 💻 **Tech** - B&H Photo, Back Market (refurbished)
- 👕 **Fashion** - Good On You (ethical brand ratings)

## Installation

### From Firefox Add-ons (Recommended)
1. Visit **[Buy Direct]**(https://addons.mozilla.org/en-US/firefox/addon/buy-direct/) on the official Mozilla Firefox Browser Add-ons store
2. Click **Add to Firefox**

### Manual Installation (Development)
1. Download or clone this repository
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the extension folder

## How to Use

1. **Browse Amazon** - Go to any product page on Amazon.com
2. **Click the Extension** - Click the Buy Direct icon in your toolbar
3. **See Alternatives** - View manufacturer links and ethical alternatives
4. **Reclassify if Needed** - Use the category buttons if auto-detection is wrong

## Privacy

Buy Direct:
- ✅ Does NOT collect any personal data
- ✅ Does NOT track your browsing
- ✅ Does NOT send information to third parties
- ✅ Works entirely on your device

The extension only runs on Amazon.com pages and only when you click the icon.

## Contributing

Contributions are welcome! Here's how you can help:

- 🐛 **Report bugs** - Open an issue if something isn't working
- 💡 **Suggest features** - Have an idea? Let us know
- 🔧 **Submit fixes** - Pull requests are appreciated
- 🛍️ **Add retailers** - Know a great ethical retailer? Suggest it!

### Adding New Retailers

To add a new retailer, edit `popup.js` and add to the appropriate section:

```javascript
// Example: Adding a new tech retailer
tech: [
  { name: 'Your Retailer', url: 'https://example.com/search?q=' }
]
```

### Adding Manufacturer Search Formats

If a manufacturer's search doesn't work, add their specific format:

```javascript
MANUFACTURER_SEARCH_FORMATS = {
  'brandname': 'https://www.brandname.com/search?query='
}
```

## Roadmap

Not sure I'll keep this updated. This was my first project, so I just wanted to try it out! However, if you've got ideas and want to send them to me, or if you're interested in forking this into your own thing, go for it!

Some ideas for future versions:
- Chrome/Edge support
- Add more retailers
- Price comparison features
- User-submitted retailer suggestions
- Support for international Amazon sites

## License

MIT License - see [LICENSE](./LICENSE) file for details

## Acknowledgments

Built with the goal of making ethical shopping easier and supporting independent businesses.

Special thanks to all the retailers and services that make shopping outside Amazon possible:
- Bookshop.org for supporting independent bookstores
- Libro.fm for ethical audiobooks
- All the small businesses and manufacturers making products

## Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/Good-VibesOnly/buy-direct-extension/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Good-VibesOnly/buy-direct-extension/discussions)

---

Made with ❤️ for ethical consumers everywhere.
