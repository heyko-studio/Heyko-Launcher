const { Update, CheckForUpdates } = require('./updater');
const fs = require('fs');
const path = require('path');
const request = require('request');


const defaultStages = {
    Checking: "Checking For Updates...",
    Found: "Update Found...",
    NotFound: "No Update Found.",
    Downloading: "Downloading Update...",
    Unzipping: "Installing...",
    Cleaning: "Finalizing...",
    Launch: "Launching..."
};

async function getGameVersion(Game) {
    var req = request(
        {
            method: 'GET',
            uri: "https://backend.heyko.fr/dl/" + Game + "/version"
        }
    );
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    const datas = await new Promise((resolve, reject) => {
        req.on('end', async () => {

            resolve(JSON.parse(data))
        })
    })
    return datas
}

async function updateGame(Game, total_bytes, version, end) {
    const gamesPath = path.join(__dirname, "../games")
    const gamePath = path.join(gamesPath, Game)
    const tempDirectory = path.join(gamesPath, "temp")
    if (!fs.existsSync(gamesPath)) {
        fs.mkdirSync(gamesPath);
    }
    if (!fs.existsSync(gamePath)) {
        fs.mkdirSync(gamePath);
    }
    if (!fs.existsSync(tempDirectory)) {
        fs.mkdirSync(tempDirectory);
    }
    let received_bytes = 0;

    var req = request(
        {
            method: 'GET',
            uri: "https://backend.heyko.fr/dl/" + Game
        }
    );
    const tempDest = path.join(tempDirectory, "/" + Game + ".zip");
    var out = fs.createWriteStream(tempDest);
    req.pipe(out);

    req.on('data', chunk => {
        received_bytes += chunk.length;
        showProgress(received_bytes, total_bytes);
    });
    function showProgress(received_bytes, total_bytes) {
        const progressBar = document.getElementById("downloadProgress");
        if (!progressBar) return;
        progressBar.value = (received_bytes / total_bytes);
    }
    
    req.on('end', async () => {
        out.close();
        const gamesPath = path.join(__dirname, "../games")
        const gamePath = path.join(gamesPath, Game)
        const tempDirectory = path.join(gamesPath, "temp")
        const tempDest = path.join(tempDirectory, "/" + Game + ".zip");
        const StreamZip = require('node-stream-zip');
        const zip = new StreamZip.async({ file: tempDest });
        await zip.extract(null, gamePath);
        await zip.close();
        let versionDatas = { 
            number: version,
        };
        fs.writeFileSync(path.join(gamePath, "versionDatas.json"), JSON.stringify(versionDatas));
        end()
    });
}

module.exports = { updateGame, getGameVersion };

