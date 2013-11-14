# Chrome-Grapher

A Chrome extension to graph numerical values over time in a developer panel.

![Screenshot](screenshot.png?raw=true)

## Installation

### As a packed extension
- Download [the packed file](https://github.com/kmichel/chrome-grapher/raw/generated-files/chrome-grapher.crx).
- Visit **chrome://extensions** in chrome.
- Locate the extension file on your computer and drag the file onto the Extensions page.
- Review the list of permissions in the dialogue that appears. If you would like to proceed, click `Install`.
- Close and re-open developer tools if it's already open.

### From the repository
- Clone the repository.
- Visit **chrome://extensions** in chrome.
- Make sure `Developer mode` is checked.
- Click on `Load unpacked extension...`.
- Select the `chrome-grapher` folder inside the cloned repo.
- Close and re-open developer tools if it's already open.

## Commands
    console.graph(name, value)
Add the `value` to the graph labeled `name`. The graph is automatically created if it does not already exists.
