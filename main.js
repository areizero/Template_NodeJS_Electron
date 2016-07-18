const electron = require('electron');   //  get electron module (before, install it: npm install -g electron-prebuilt)
const app = electron.app;   //  Aplication Live Cycle control
const BrowserWindow = electron.BrowserWindow;   //  Electron window creation
const crashReporter = electron.crashReporter;;  // fail and error control (https://github.com/electron/electron/blob/master/docs/api/crash-reporter.md)

crashReporter.start({productName: 'TemplateProduct', companyName: 'areizero inc.', submitURL: 'https://localhost/error/crash.log'});
//crashReporter.start();    //  for old versions of electron
var mainWindow = null;  //  main window (apparience of app)
app.on('ready', createWindow);
app.on('window-all-closed', function () {   //close app when windows closed
    if (process.platform != 'darwin') {
        app.quit();
    }
});
function createWindow() {   //  init windows in Electron
    mainWindow = new BrowserWindow({
        width: 800
        , height: 600
    });
    mainWindow.loadURL('file://' + __dirname + '/content/index.html');  //  main page, init page in View
    mainWindow.webContents.openDevTools();  //  dev tools, disable it in production environment
    mainWindow.maximize();    
    mainWindow.on('closed', function () {   //  when windows close
        mainWindow = null
    });
}

setEnvVariables();
var rest = require('./src/restManager.js');
rest.exposeServices();  //  REST service for MVC, Controller layout
function setEnvVariables(){    
    process.env.MONGO_MYDB_URL = 'mongodb://' + 'localhost:27017' + '/' + 'templateDB'; //  url to Mongo
    process.env.APP_SERVICES_PORT = 8888;
}
