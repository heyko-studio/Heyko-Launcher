const path = require('path');
const { updateLauncher, checkLauncherUpdates } = require('./updateLauncher');
const { updateGame, getGameVersion } = require('./updateGame');
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
    checkLauncherUpdates().then((updateAvaible) => {
        updateAvaible && updateLauncher();
    })
    const game = document.querySelector('#gameContainer')
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