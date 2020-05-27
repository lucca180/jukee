import React from 'react'
// import icon from 'path/to/icon.png';
// import menu from 'path/to/menu';
import { remote } from 'electron';

import TitleBar from 'frameless-titlebar'

const currentWindow = remote.getCurrentWindow();

const theme = {
    bar:{
        pallete: 'dark',
        background: "#1e1e1e",
        borderBottom: "",
        title: {
            
            align: "left",
          },
    }
}

export default function JukeeTitleBar(){
    const maximize = () =>{
        return currentWindow.isMaximized() ? currentWindow.unmaximize() : currentWindow.maximize();
    }

    return (
        <div>
        <TitleBar
            // iconSrc={icon} // app icon
            currentWindow={currentWindow} // electron window instance
            platform={process.platform} // win32, darwin, linux
            // menu={menu}
            theme={theme}
            title="Jukee"
            onClose={() => currentWindow.close()}
            onMinimize={() => currentWindow.minimize()}
            onMaximize={() => maximize()}
            // when the titlebar is double clicked
            onDoubleClick={() => currentWindow.maximize()}
        >
            {/* custom titlebar items */}
        </TitleBar>
        </div>
    )
}