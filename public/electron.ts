import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import SocketManager from './utils/socketManager';
import { spawn, ChildProcess } from 'child_process';
import isDev from 'electron-is-dev';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';


let mainWindow: BrowserWindow;

const WIDTH = 900;
const HEIGHT = 650;

const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: WIDTH,
		height: HEIGHT,
		minWidth: WIDTH,
		minHeight: HEIGHT,
		center: true,
		resizable: false,
		minimizable: true,
		maximizable: false,
		fullscreen: false,
		fullscreenable: false,
		useContentSize: true,
		titleBarStyle: 'hidden',
		autoHideMenuBar: true,
		trafficLightPosition: { 
			x: 10, 
			y: 10 
		},
		webPreferences: {
			// 개발자도구
			devTools: true,
			// node환경처럼 사용하기
			nodeIntegration: true,
			contextIsolation: false,
			preload: path.join(__dirname, 'preload.js'),
		},
	});

    mainWindow.setResizable(false);

    mainWindow.on('will-resize', (e) => {
        e.preventDefault();
    });

	// production에서는 패키지 내부 리소스에 접근.
	// 개발 중에는 개발 도구에서 호스팅하는 주소에서 로드.
	mainWindow.loadURL(
		isDev ? 
		'http://localhost:3000' : 
		`file://${path.join(__dirname, '../build/index.html')}`
	);

	if (isDev) {
		mainWindow.webContents.openDevTools({ mode: 'detach' });
	}

	mainWindow.setResizable(true);

    // 혹시 모를 키 입력 차단
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if ((input.key === 'r' && (input.control || input.meta)) || input.key === 'F5') {
            console.log('Block refresh attempts');
            event.preventDefault();
        }
    });

	// Emitted when the window is closed.
	mainWindow.on('closed', () => (mainWindow = undefined!));
	mainWindow.focus();
};

const templete=[
	{ role: 'appMenu' },
	{ 
		role: 'fileMenu',
		submenu: [
			{
				label: 'Open Chromedriver',
				accelerator: 'CmdOrCtrl+Shift+C',
				click: () => openDirectory('driver'),
			},
			{
				label: 'Open Result Files',
				accelerator: 'CmdOrCtrl+Shift+R',
				click: () => openDirectory('crawling_results')
			},
			{
				label: 'Open Hashtag Blacklist',
				accelerator: 'CmdOrCtrl+Shift+H',
				click: () => openDirectory('black_list')
			},
			{ type: 'separator' },
			{ role: 'close' },
		]
	},
	{
        role: 'viewMenu',
        submenu: [
            { role: 'toggleDevTools' },
            { role: 'togglefullscreen' },
            { type: 'separator' },
			{
                label: 'Zoom Reset',
                accelerator: 'CmdOrCtrl+O',
                click: () => {
                    if (mainWindow) mainWindow.webContents.setZoomLevel(0);
                }
            },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
        ]
    },
	{ role: 'windowMenu' },
	{
		role: 'help',
		submenu: [
			{
				label: 'Learn More',
				click: async () => {
					await shell.openExternal('https://github.com/sonhaechang/instagram_crawler')
				}
			}
		]
	}
];

// @ts-ignore
const newMenu = Menu.buildFromTemplate(templete);

Menu.setApplicationMenu(newMenu);

app.setAboutPanelOptions({
    applicationName: 'Instagram crawler', 
    applicationVersion: '0.1.0',
    version: '0.1.0',
    copyright: 'Copyright © 2025. All rights reserved.'
});

let pyProc: ChildProcess | null = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

app.on('ready', () => {
	createWindow();
});


// Quit when all windows are closed.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});

app.on('before-quit', () => {
	console.log('[main] Gracefully shutting down...');
	socketManager.disconnect();

	if (pyProc && !pyProc.killed) {
		pyProc.kill('SIGTERM');
	}
});

const socketManager = new SocketManager({
	host: '127.0.0.1',
	port: 65432,
	onMessage: (data) => {
		console.log(JSON.stringify(data));
		mainWindow.webContents.send(data.channel, data);
	},
});

let socketReady = false;
const pendingQueue: string[] = [];

function flushQueueSmoothly() {
	const interval = 50; // 50ms 간격

	const flushNext = () => {
		if (!pendingQueue.length) return;

		const payload = pendingQueue.shift();
		if (payload) socketManager.send(payload);

		setTimeout(flushNext, interval);
	};

	flushNext();
};

const pyshellIpcRendererChannels = [
	'driverStart',
	'loggedIn',
	'crawlingOption',
	'hashtag',
	'fileName',
	'extract',
	'extractStop',
];

pyshellIpcRendererChannels.forEach(channel => {
	ipcMain.on(channel, (event, arg) => {
		if (!socketReady) {
			console.warn('[IPC] socket not ready, queuing:', arg);
			pendingQueue.push(arg);
		} else {
			socketManager.send(arg);
		}
	})
});

const getCurrentOsPythonPath = () => {
	if (os.platform() === 'win32') {
		return isDev ? 
		path.join(__dirname, '/../backend/venv/python.exe') : 
		path.join(process.resourcesPath, 'backend/venv/python.exe');
	}
	
	return isDev ? 
	path.join(__dirname, '/../backend/venv/bin/python3.9') : 
	path.join(process.resourcesPath, 'backend/venv/bin/python3.9');
}

const pythonPath = getCurrentOsPythonPath();

const scriptPath = isDev
	? path.join(__dirname, '/../backend/main.py')
	: path.join(process.resourcesPath, 'backend/main.py');

console.log('▶ pythonPath:', pythonPath);
console.log('▶ isDev:', isDev);
console.log('▶ exists:', fs.existsSync(pythonPath));
console.log('▶ isFile:', fs.existsSync(pythonPath) && fs.lstatSync(pythonPath).isFile());

// Spawn Python process with unbuffered output (-u)
pyProc = spawn(pythonPath, ['-u', scriptPath], {
	cwd: path.dirname(scriptPath), // optional, sets working directory
	stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
});

if (pyProc.stdout) {
	pyProc.stdout.on('data', (data) => {
		const lines = data.toString().split('\n');

		lines.forEach((line: any) => {
			const message = line.trim();
			if (!message) return;

			console.log('[Python STDOUT]', message);

			if (message === 'READY' && !socketReady) {
				socketManager.connect();
				socketReady = true;

				console.log('[IPC] Socket is now ready. Flushing queue...');
				setTimeout(flushQueueSmoothly, 100);
			}
		});
	});
};

if (pyProc.stderr) {
	pyProc.stderr.on('data', (data) => {
		console.error(`[Python STDERR] ${data.toString()}`);
	});
};

pyProc.on('error', (err) => {
	console.error('[Python Process Error]', err);
});

pyProc.on('exit', (code, signal) => {
	console.log(`[Python Exit] Code: ${code}, Signal: ${signal}`);
});

function openDirectory(directory) {
	const targetPath = path.join(app.getPath('userData'), directory);

	shell.openPath(targetPath)
  		.then(() => console.log('Folder opened!'))
  		.catch(err => console.error('Error opening folder:', err));
}

ipcMain.on('openDriverDir', (event) => {
	openDirectory('driver');
});

ipcMain.on('openResultsDir', (event) => {
	openDirectory('crawling_results');
});

ipcMain.on('openBlacklistDir', (event) => {
	openDirectory('black_list');
});

ipcMain.on('getResultFileNames', (event) => {
	const targetDir = path.join(app.getPath('userData'), 'crawling_results');
	const files = fs.readdirSync(targetDir);
	const results: string[] = [];

	files.forEach((file) => {
		const fullPath = path.join(targetDir, file);
		const stats = fs.statSync(fullPath);

		if (stats.isFile()) {
			results.push(file);
		} else if (stats.isDirectory()) {
			console.log('폴더:', fullPath);
		}
	});

	event.reply('getResultFileNames', results);
});

ipcMain.on('showAboutPanel', (event) => {
	app.showAboutPanel(); 
});

ipcMain.on('getOsPlatform', (event) => {
	event.reply('getOsPlatform', os.platform());
});

ipcMain.on('minimizeWindow', (event) => {
	mainWindow.minimize();
});

ipcMain.on('maximizeWindow', (event) => {
	if (mainWindow.isMaximized()) {
		mainWindow.unmaximize();
		event.reply('maximizeWindow', mainWindow.isMaximized());
	} else {
		mainWindow.maximize();
		event.reply('maximizeWindow', mainWindow.isMaximized());
	}
});

ipcMain.on('closeWindow', (event) => {
	mainWindow.close();
});

ipcMain.on('reloadWindow', (event) => {
	mainWindow.reload();
});

ipcMain.on('forceReloadWindow', (event) => {
	mainWindow.webContents.reloadIgnoringCache();
});

ipcMain.on('toggleDevTools', (event) => {
	mainWindow.webContents.toggleDevTools();
});

ipcMain.on('zoomInOutWindow', (event, arg) => {
	const win = mainWindow.webContents;
	const currentZoom = win.getZoomFactor();
	const factor = 0.1;

	if (arg === 'in') {
		win.zoomFactor = currentZoom + factor;
	} else if (arg === 'out') {
        win.zoomFactor = currentZoom - factor;
    } else if (arg === 'reset') {
        win.zoomFactor = factor;
    }
});