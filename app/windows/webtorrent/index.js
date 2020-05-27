console.time("init");

const electron = require('electron');
const WebTorrent = require('webtorrent');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const ElectronStore = require('electron-store');

const userConfigs = new ElectronStore();

const app = electron.remote.app;
const ipc = electron.ipcRenderer

const defaultAnnounce = require('../../constants/defaultAnnounceList.json');
const downloadPath = app.getPath('downloads') + '/karaoke/';
var CLIENT = new WebTorrent();
var latestProgress = {};
console.log(CLIENT);

init()

function init(){
	ipc.on('jk-add-torrent', (e, torrentInfo, peerIP) => startDownload(torrentInfo, peerIP));
	ipc.on('jk-remove-torrent', (e, torrentId, torrentPath, deleteFiles) =>  removeTorrent(torrentId, torrentPath, deleteFiles));
	ipc.on('jk-progress', () => sendProgress());

	CLIENT.on('error', (e) => console.error(e, 'destroyed: ', CLIENT.destroyed));
	
	sendUserIP();

	loadDownloadStack();
	setInterval(updateTorrentProgress, 1000);

	console.timeEnd("init")
}

function startDownload(torrentInfo, peerIP){
	try{
		CLIENT.add(torrentInfo, {announce: defaultAnnounce, path: downloadPath, private: false, maxWebConns: 7},(torrent) => {
			console.log('Client is downloading:', torrent.infoHash);

			if(peerIP) console.log(torrent.addPeer(peerIP));

			saveTorrent(torrent, false);

			updateTorrentProgress();
			sendProgress();

			torrent.on('error', (err) => console.log("torrent error: ",err));

			torrent.on('done', () => {
				saveTorrent(torrent, true);

				updateTorrentProgress();
				sendProgress();

				ipc.invoke('wt-torrent-done', torrent.infoHash);

				console.log('done', torrent);
			});
		});
	}catch(e){
		console.log(e);
		return null;
	}
}

function updateTorrentProgress() {
	if(CLIENT.torrents.length === 0) return {};
	if(CLIENT.uploadSpeed !== 0) console.log('upload:', CLIENT.uploadSpeed);
	if(CLIENT.downloadSpeed !== 0) console.log('download:', CLIENT.downloadSpeed);

	var progressObj = {}

	for (let torrent of CLIENT.torrents){
		if(torrent.done) continue;
		let cover = torrent.files.find(function (file) {return file.name.endsWith('.jpg')});
		let coverDone = cover ? cover.progress === 1 : false;
		let id = torrent.infoHash;

		//console.log(torrent.path);

		progressObj[id] = {
			id: torrent.infoHash,
			name: torrent.name,
			path: path.join(torrent.path, (torrent.name || '')),
			capa: cover ? cover.path : null,
			done: torrent.progress === 1,
			progress: torrent.progress,
			downloadSpeed: torrent.downloadSpeed,
			uploadSpeed: torrent.uploadSpeed,
			imgDone: coverDone,
		};

		if(progressObj[id].capa) progressObj[id].capa = path.join(app.getPath('downloads'), 'karaoke', progressObj[id].capa);
		}

		latestProgress = progressObj;
		//ipc.send('jk-wt-progress', progressObj);
}

function sendProgress(){
	ipc.invoke('wt-progress', latestProgress);
}

function saveTorrent(torrent, done){
		var torrentPath = path.join(torrent.path, torrent.name);
		var capa = torrent.files.find(function (file) {return file.name.endsWith('.jpg')});

		var songInfo = {
			id: torrent.infoHash,
			name: torrent.name,
			path: torrent.path,
			capa: capa.path,
			done: done,
		}

		songInfo.capa = path.join(app.getPath('downloads'), 'karaoke', songInfo.capa);

		fs.writeFileSync(path.join(torrentPath, 'info.json'), JSON.stringify(songInfo));
		fs.writeFileSync(path.join(torrentPath, torrent.name+'.torrent'), torrent.torrentFile);

		var downloadStack = userConfigs.get('downloadStack') || {};
		if(!done) downloadStack[torrent.infoHash] = path.join(torrentPath, torrent.name+'.torrent');
		else delete downloadStack[torrent.infoHash];
		userConfigs.set('downloadStack', downloadStack);

		return songInfo;
}

function removeTorrent(torrentId, torrentPath, deleteFiles){
		try{
				CLIENT.remove(torrentId);
		}catch(e){
			console.log(e);
		}

		if(deleteFiles && torrentPath !== downloadPath) {
				console.log('apagando ', torrentPath);
				rimraf(torrentPath, (e) => console.log(e));
		}

		var downloadStack = userConfigs.get('downloadStack') || {};

		if(downloadStack[torrentId]) {
				delete downloadStack[torrentId];
				userConfigs.set('downloadStack', downloadStack);
		}
}

function loadDownloadStack(){
		const downloadStack = userConfigs.get("downloadStack") || null;
		if(!downloadStack) return;

		for (let torrentPath of Object.values(downloadStack)){
			console.log(torrentPath);
			startDownload(torrentPath);
		}

		return;
}

async function sendUserIP(){
	var res = await fetch('https://l2.io/ip.json');
	var json = await res.json();
	
	console.log(json.ip+":"+CLIENT.torrentPort);

	ipc.invoke("wt-current-ip", json.ip+":"+CLIENT.torrentPort);
}