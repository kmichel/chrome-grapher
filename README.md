Chrome-Grapher
==============
A Chrome extension to graph numerical values over time in a developer panel.

![Screenshot](screenshot.png?raw=true)

Installation
------------
- Clone the repository
- Visit chrome://extensions in chrome
- Make sure `Developer mode` is checked
- Click on `Load unpacked extension...`
- Select the `chrome-grapher` folder inside the cloned repo
- Close and re-open developer tools if it's already open

Commands
--------
    console.graph(name, value)
Add the `value` to the graph labeled `name`. The graph is automatically created if it does not already exists.
