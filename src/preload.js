const path = require('path');
const { updateLauncher, checkLauncherUpdates } = require('./updateLauncher');
const { updateGame, getGameVersion } = require('./updateGame');
const { launcherName } = require('./config');
const fs = require('fs');

window.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body');
    const navbar = document.createElement("nav")
    navbar.innerHTML = `
        <a href="${path.join(__dirname, 'home/home.html')}">Home</a>
        <a href="${path.join(__dirname, 'games/poly-story.html')}">Poly Story</a>
        <a href="${path.join(__dirname, 'games/five-mysteries.html')}">Five Mysteries</a>
    `
    body.prepend(navbar)

    const game = document.querySelector('#gameContainer')

    // Check if the launcher is executed in the temp directory
    let tmpPath = path.join(__dirname, '../../../');
    if (tmpPath.slice(tmpPath.length - 4, tmpPath.length - 1) == "tmp") {
        setTimeout(async () => {
            const StreamZip = require('node-stream-zip');
            const zip = new StreamZip.async({ file: `${tmpPath}/${launcherName}.zip` });
            await zip.extract(null, path.join(tmpPath, '../'));
            await zip.close();
            let child = require('child_process').exec;
            child(`"${path.join(tmpPath, '../', 'heyko-launcher.exe')}"`, function (err, data) {
                if (err) console.log(err)
            });
            setTimeout(() => {
                window.close();
            }, 500);
        }, 1000);
    } else {
        tmpPath = path.join(tmpPath, 'tmp');
        // Remove recursively all files in the temp directory
        if (fs.existsSync(tmpPath)) {
            fs.rmSync(tmpPath, { recursive: true, maxRetries: 3, retryDelay: 500 })
        }
        checkLauncherUpdates().then((updateAvaible) => {
            if (updateAvaible) updateLauncher();
        })
    }

    // Check if the page contains a game
    if (game) {
        loadGame()
        function loadGame() {
            const name = game.getAttribute('data-name')
            const gamesPath = path.join(__dirname, "../games")
            const gamePath = path.join(gamesPath, name)
            let gameStatus = 0
            getGameVersion(name).then(datas => {
                const size = datas.size
                const lastVersion = datas.v
                let installedVersion = 0
                try {
                    installedVersion = JSON.parse(fs.readFileSync(path.join(gamePath, "versionDatas.json"))).number;
                }
                catch {                }
                if (installedVersion == lastVersion) gameStatus = 1
                else if (installedVersion < lastVersion && installedVersion != 0) gameStatus = 2
                const playButton = document.createElement('button')
                playButton.classList.add('download')
                let playContainer = document.getElementById("playContainer")
                if (playContainer) {
                    playContainer.innerHTML = ''
                } else {
                    playContainer = document.createElement('div')
                    playContainer.id = "playContainer"
                }
                playContainer.append(playButton)
                game.append(playContainer)
                switch (gameStatus) {
                    case 1:
                        playButton.innerText = "Play"
                        playButton.addEventListener('click', () => {
                            if (playButton.innerText == "Loading...") return
                            playButton.innerText = "Loading..."
                            fs.readdir(gamePath, function (err, files) {
                                const openGame = require('child_process').execFile;
                                files.forEach(element => {
                                    element.split(".exe").length > 1 && openGame(path.join(__dirname, "../games", name, element), function (err, data) {
                                        if (err) {
                                            console.error(err);
                                            return;
                                        }
                                    });
                                });
                            })
                            setTimeout(() => {
                                playButton.innerText = "Play"
                            }, 2500);
                        })
                    break;
                    case 2:
                        playButton.innerText = "Update (" + parseInt(size * 0.000001) + "MB)"
                        downloadButton()
                    break;
                    default:
                        playButton.innerText = "Download (" + parseInt(size * 0.000001) + "MB)"
                        downloadButton()
                }
                function downloadButton() {
                    playButton.addEventListener('click', () => {
                        playButton.id="downloadGame"
                        if (playButton.innerText == "Downloading...") return
                        const progress = document.createElement('progress')
                        progress.id = "downloadProgress"
                        progress.classList.add('download')
                        playContainer.append(progress)
                        updateGame(name, size, lastVersion, function() {loadGame()})
                        playButton.innerText = "Downloading..."
                        playButton.classList.add('downloading')
                    })
                }
            })
        }
    }
})