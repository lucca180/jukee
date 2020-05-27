import { BrowserWindow} from 'electron';



export function launchWebTorrent(){
    const win = new BrowserWindow({ 
        width: 400, 
        height: 400, 
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    
    if (process.env.NODE_ENV === 'development')  win.loadURL(`file://${__dirname}/index.html`);
    else win.loadURL(`file://${__dirname}/windows/webtorrent/index.html`);

    win.webContents.on('did-finish-load', function () {
        // win.show();
    });


    return win;
}

