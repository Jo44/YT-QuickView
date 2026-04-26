# YouTube – Quick View

Chrome extension to improve YouTube display with Quick View mode and statistics colorization.

## Features

- **Quick View mode**           : Quickly switch between classic view and grid view (more columns)
- **Statistics colorization**	: Automatic colorization of dates and view counts, with customization by theme
- **Keyboard shortcut**         : Toggle mode with `Shift + L`
- **Multilingual support**      : English and French (automatic detection)
- **Advanced configuration**    : Customize the colors for each type of statistic and for each theme

## Installation

### From Chrome WebStore

[Link 🌐](https://chromewebstore.google.com/detail/youtube-quick-view/pfgnimcdoenieikioadlnbicnjldmhoa) 

### From source files

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Activate "Developer mode" (top right)
4. Click on "Load unpacked"
5. Select the folder containing the extension

## Usage

1. Go to YouTube.com
2. Click the toggle button in the header (list/grid icon)
3. Or use the shortcut `Shift + L`

<img width="1280" height="800" alt="quick_view_display_fr" src="https://github.com/user-attachments/assets/fe2156c0-0e00-43e8-a56c-9c27af5f6fb3" />

Quick View mode displays videos in a grid with more columns, and statistics (dates / views) are automatically color-coded according to their value :
- **Dates**  : Different colors depending on the scale (hour, day, week, month, year)
- **Views**  : Different colors depending on the scale (base, thousands, millions, billions)

The colors can be customized via the extension's configuration popup.

<img width="640" height="400" alt="quick_view_config_fr" src="https://github.com/user-attachments/assets/e3d1ebdc-c2d3-467a-89de-adf0851a77e6" />

## File structure

```
Quick View/
├── _locales/            # Translations (EN/FR)
├── css/                 # CSS files
│   ├── config.css       # Configuration window style
│   └── content.css      # YouTube style
├── html/                # HTML file
│   └── config.html      # Configuration interface
├── icons/               # Extension icons
├── js/                  # JavaScript files
│   ├── modules/         # JavaScript modules
│   │   ├── colorizer.js # Colorization module
│   │   ├── global.js    # Global module
│   │   ├── main.js      # Main module
│   │   ├── observer.js  # DOM change observation module
│   │   ├── theme.js     # Theme management module
│   │   ├── ui.js        # User interface module
│   │   └── utils.js     # Utility module
│   ├── config.js        # Configuration behaviour
│   ├── content.js       # Module loader
│   └── shared.js        # Shared constants and functions
├── manifest.json        # Configuring the extension (Manifest V3)
└── README.md            # Documentation
```

## Notes

- The extension only works on `https://www.youtube.com/*`
- Colorization can be enabled/disabled via a toggle in the configuration popup
- The configuration popup allows you to customize the colors for each theme (dark / light)
- Preferences are saved in `localStorage` (mode state) and `chrome.storage.local` (colors and activation)

## Updates
- **v1.0** : 
  - Initial release
- **v1.1** : 
  - Fixed CSS selectors for colorization (after YouTube update)
  - Modularized code into separate files for better maintainability
  - Better optimization and performance
- **v1.2** : 
  - Fixed unexpected comment content colorization
