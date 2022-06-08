const { Update, CheckForUpdates } = require('./updater');

const defaultStages = {
    Checking: "Checking For Updates...",
    Found: "Update Found...",
    NotFound: "No Update Found.",
    Downloading: "Downloading Update...",
    Unzipping: "Installing...",
    Cleaning: "Finalizing...",
    Launch: "Launching..."
};

async function updateGame(Game) {
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
        gitRepo: Game,
        gitUsername: "heyko-studio",
        appName: Game,
        appExecutableName: Game + ".exe",
        progressBar: progressBar,
        label: label,
        stageTitles: defaultStages
    };
    const updateAvaible = await CheckForUpdates(options);
    if (updateAvaible) {
        Update(options);
    }
}

module.exports = { updateGame };

