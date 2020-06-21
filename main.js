const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

//SET ENV
process.env.NODE_ENV = "production";

let mainWindow;
let addWindow;

app.on("ready", function () {
	//Create new window
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
		},
	});
	//Load HTML into window
	mainWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, "mainWindow.html"),
			protocol: "file:",
			slashes: true,
		})
	);
	//Quit App when CLOSED
	mainWindow.on("closed", () => {
		app.quit();
	});

	//Build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	// Insert menu
	Menu.setApplicationMenu(mainMenu);
});

//Handle createAddWindow
function createAddWindow() {
	addWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
		},
		width: 300,
		height: 200,
		title: "Add Shopping List Item",
	});
	//Load HTML into window
	addWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, "addWindow.html"),
			protocol: "file:",
			slashes: true,
		})
	);

	//Garbage collection handle
	addWindow.on("close", () => {
		addWindow = null;
	});
}

// Catch item Add
ipcMain.on("item:add", (e, item) => {
	mainWindow.webContents.send("item:add", item);
	addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
	{
		label: "File",
		submenu: [
			{
				label: "Add Item",
				accelerator:
					process.platform == "darwin" ? "Command+A" : "Ctrl+A",
				click() {
					createAddWindow();
				},
			},
			{
				label: "Clear Items",
				click() {
					mainWindow.webContents.send("item:clear");
				},
			},
			{
				label: "Quit",
				accelerator:
					process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
				click() {
					app.quit();
				},
			},
		],
	},
	{
		label: "Edit",
		submenu: [
			{
				label: "Quit",
				accelerator:
					process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
				click() {
					app.quit();
				},
			},
		],
	},
];

// If mac, add empty object to menu

if (process.platform == "darwin") {
	mainMenuTemplate.unshift({ label: "Electron" });
}

// Add DevTools item if not in Prod mode
if (process.env.NODE_ENV !== "production") {
	mainMenuTemplate.push({
		label: "Developer Tools",
		submenu: [
			{
				label: "Toggle DevTools",
				accelerator:
					process.platform == "darwin" ? "Command+I" : "Ctrl+I",
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools();
				},
			},
			{
				role: "reload",
			},
		],
	});
}
