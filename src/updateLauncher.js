const { Update, CheckForUpdates } = require('./updater');
const { launcherName, gitUsername } = require('./config');

const defaultStages = {
    Checking: "Checking For Updates...",
    Found: "Update Found...",
    NotFound: "No Update Found.",
    Downloading: "Downloading Update...",
    Unzipping: "Installing...",
    Cleaning: "Finalizing...",
    Launch: "Launching..."
};
async function checkLauncherUpdates() {
    const options = {
        gitRepo: launcherName,
        gitUsername: gitUsername,
        appName: launcherName,
        appExecutableName: launcherName.toLowerCase() + ".exe",
        progressBar: null,
        label: null,
        stageTitles: defaultStages
    };
    return await CheckForUpdates(options);
}
async function updateLauncher() {
    const body = document.querySelector('body');
    const contener = document.createElement('div');
    const subContener = document.createElement('div');
    contener.classList.add('updateContener');
    contener.classList.add('defaultInterface');
    const label = document.createElement("p");
    const progressBar = document.createElement("progress");
    subContener.append(label)
    subContener.append(progressBar)
    contener.append(subContener)
    body.append(contener)
    const options = {
        gitRepo: launcherName,
        gitUsername: gitUsername,
        appName: launcherName,
        appExecutableName: launcherName.toLowerCase() + ".exe",
        progressBar: progressBar,
        label: label,
        stageTitles: defaultStages,
        forceUpdate: true
    };
    Update(options);
}

module.exports = { updateLauncher, checkLauncherUpdates };

