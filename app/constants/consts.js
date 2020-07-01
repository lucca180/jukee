const electron = require('electron');

exports.configDefaults = {
	downloadPath: (electron.app || electron.remote.app).getPath('downloads')+'/Jukee/',
};
