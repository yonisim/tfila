// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')

// --screenshot flag: render once, capture PNG, upload to S3, quit.
const isScreenshotMode = process.argv.includes('--screenshot')

// --test-mode flag: fixed window, no fullscreen, animations disabled — used by Playwright.
const isTestMode = process.argv.includes('--test-mode')

let watcher = null

// Watches the app's own source tree plus the prayer-times data repo (whichever
// directory --data_dir points npm_config_data_dir at) and reloads the window
// once changes settle, so a `git pull` in either repo takes effect immediately
// instead of requiring the kiosk process to be killed and restarted.
function startAutoReload(mainWindow) {
  const watchPaths = [__dirname]
  const dataDir = process.env.npm_config_data_dir
  if (dataDir && path.resolve(dataDir) !== __dirname) {
    watchPaths.push(dataDir)
  }

  watcher = chokidar.watch(watchPaths, {
    ignored: /[\\/](\.git|\.venv|\.vscode|\.idea|node_modules|test-results|playwright-report|screenshots)([\\/]|$)/,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 800, pollInterval: 100 }
  })

  let reloadTimer = null
  watcher.on('all', (event, changedPath) => {
    console.log('[auto-reload]', event, changedPath)
    clearTimeout(reloadTimer)
    // Debounce so a `git pull`/`git reset --hard` touching many files at once
    // triggers a single reload instead of one per file.
    reloadTimer = setTimeout(() => {
      if (!mainWindow.isDestroyed()) {
        console.log('[auto-reload] reloading window')
        mainWindow.webContents.reload()
      }
    }, 1000)
  })
}



function createWindow () {
  // Window sizing: test mode uses a stable fixed viewport; screenshot mode uses 1080p.
  const winWidth  = isTestMode ? 1280 : isScreenshotMode ? 1920 : 800
  const winHeight = isTestMode ? 800  : isScreenshotMode ? 1080 : 600

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    frame: !isTestMode,          // hide native title bar in test mode
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

  // Skip in test/screenshot mode so Playwright runs and screenshot captures
  // stay deterministic and aren't interrupted by a mid-run reload.
  if (!isTestMode && !isScreenshotMode) {
    startAutoReload(mainWindow)
  }

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
  if (watcher) watcher.close()
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
