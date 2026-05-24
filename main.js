// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')

// --screenshot flag: render once, capture PNG, upload to S3, quit.
const isScreenshotMode = process.argv.includes('--screenshot')

// --test-mode flag: fixed window, no fullscreen, animations disabled — used by Playwright.
const isTestMode = process.argv.includes('--test-mode')



function createWindow () {
  // Window sizing: test mode uses a stable fixed viewport; screenshot mode uses 1080p.
  const winWidth  = isTestMode ? 1280 : isScreenshotMode ? 1920 : 800
  const winHeight = isTestMode ? 800  : isScreenshotMode ? 1080 : 600

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    show: !isScreenshotMode,   // keep hidden until capturePage() in screenshot mode
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // Full-screen only in normal run (not test or screenshot mode).
  if (!isScreenshotMode && !isTestMode) {
    mainWindow.setFullScreen(true)
  }

  // In test-mode inject a <style> that kills all CSS transitions/animations
  // so screenshots are stable and assertions don't race with animations.
  if (isTestMode) {
    mainWindow.webContents.on('dom-ready', () => {
      mainWindow.webContents.insertCSS(
        '*, *::before, *::after { ' +
        '  animation-duration: 0s !important; ' +
        '  animation-delay: 0s !important; ' +
        '  transition-duration: 0s !important; ' +
        '  transition-delay: 0s !important; ' +
        '}'
      )
    })
  }

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  if (isScreenshotMode) {
    mainWindow.webContents.on('did-finish-load', () => {
      // Wait for loop_pages() to load and render the first slide
      setTimeout(() => {
        mainWindow.webContents.capturePage().then(image => {
          fs.mkdirSync(path.join(__dirname, 'screenshots'), { recursive: true })
          const outPath = path.join(__dirname, 'screenshots', 'app.png')
          fs.writeFileSync(outPath, image.toPNG())
          console.log('Screenshot saved:', outPath)
          app.quit()
        })
      }, 8000)
    })
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
