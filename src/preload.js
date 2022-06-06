const path = require('path');
console.log(__dirname)

window.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body');
    const navbar = document.createElement("nav")
    navbar.innerHTML = `
        <a href="${path.join(__dirname, 'home/home.html')}">Home</a>
        <a href="${path.join(__dirname, 'games/poly-story.html')}">Poly Story</a>
        <a href="${path.join(__dirname, 'games/five-mysteries.html')}">Five Mysteries</a>
    `
    body.prepend(navbar)
})