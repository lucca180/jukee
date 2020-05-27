/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';

import {launchWebTorrent} from './windows/webtorrent/webtorrent';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;
let torrentWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};



/**
 * Add event listeners...
 */

var userTorrentIP = null;

// Requests wt to add torrent
ipcMain.handle('jk-add-torrent', (event, torrentInfo, peerIP) => {
  torrentWindow.webContents.send('jk-add-torrent', torrentInfo, peerIP);
  return null
})

// Requests wt to remove torrent
ipcMain.handle('jk-remove-torrent', (event, arg) => {
  torrentWindow.webContents.send('jk-remove-torrent', arg.id, arg.path, arg.deleteFiles);
  return null
})

// Request wt progress
ipcMain.handle('jk-progress', () => {
  if(!torrentWindow) return;
  torrentWindow.webContents.send('jk-progress');
  return null;
})

// Request userIP
ipcMain.handle('jk-userIP', () => {
  return userTorrentIP;
})


// Receives wt progress and sends to mainRenderer
ipcMain.handle('wt-progress', (e, progress) => {
  mainWindow.webContents.send('wt-progress-result', progress);
  return null;
})

// Sends 'done' signal to mainRenderer
ipcMain.handle('wt-torrent-done', (e, torrentId) => {
  mainWindow.webContents.send('wt-torrent-done', torrentId);
  return null;
})

// Stores user's ip;
ipcMain.handle('wt-current-ip', (e, userIp) => {
  console.log(userIp);
  userTorrentIP = userIp;
});

// Resto //

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');
app.commandLine.appendSwitch('high-dpi-support', 'true');
app.commandLine.appendSwitch('force-device-scale-factor', '1');

app.on('ready', async () => {

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1080,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.maximize();
      mainWindow.show();
      mainWindow.maximize()
      mainWindow.focus();
    }

    if(!torrentWindow) {
      torrentWindow = launchWebTorrent();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    torrentWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
});
