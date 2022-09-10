let tenc = new TextEncoder()
let tdec = new TextDecoder()

const INDEX_KEY = "index"

let index = null



const updateindex = document.getElementById("updateindex")
const indexinfo = document.getElementById("indexinfo")
const search = document.getElementById("search")
const nameField = document.getElementById("name")
const content = document.getElementById("content")

const contains = document.getElementById("contains")
const regex = document.getElementById("regex")

function showIndexData() {
    if (index === null) {
        indexinfo.innerHTML = "No downloaded index found"
    } else {
        indexinfo.innerHTML = `Index from: ${new Date(index.date).toLocaleString(navigator.language)}`
    }
}

updateindex.onclick = (ev) => {
    indexinfo.innerHTML = "Downloading index"
    fetch("https://raw.githubusercontent.com/termux/repology-metadata/master/packages.json").then((r) => {
        return r.json()
    }).then((json) => {
        index = {
            data: json,
            date: Date.now(),
        }
        try {
            let indexCompressed = pako.deflate(tenc.encode(JSON.stringify(index)))
            window.localStorage.setItem(INDEX_KEY, JSON.stringify(indexCompressed))
        } catch (err) {console.log(err)}
        showIndexData()
    }).catch((reason) => {
        indexinfo.innerHTML = "Error downloading index"
    })
}

nameField.onkeydown = (ev) => {
    if (ev.key === "Enter") {
        search.click()
    }
}

search.onclick = (ev) => {
    content.innerHTML = ""
    index.data.filter((pkg) => {
        if (contains.checked) return pkg.name.includes(nameField.value)
        if (regex.checked) return new RegExp(nameField.value).test(pkg.name)
        return pkg.name.startsWith(nameField.value)
    }).forEach(e => {
        let tr = document.createElement("tr")
        let td = document.createElement("td")
        td.textContent = e.name
        tr.appendChild(td)
        td = document.createElement("td")
        td.textContent = e.description
        tr.appendChild(td)
        td = document.createElement("td")
        td.textContent = e.version
        tr.appendChild(td)
        td = document.createElement("td")
        let a = document.createElement("a")
        a.href = e.homepage
        a.textContent = e.homepage
        td.appendChild(a)
        tr.appendChild(td)
        td = document.createElement("td")
        td.textContent = e.maintainer
        tr.appendChild(td)
        td = document.createElement("td")
        td.textContent = e.depends.join(", ")
        tr.appendChild(td)
        content.appendChild(tr)
    });
}

try {
    let indexCompressed = JSON.parse(window.localStorage.getItem(INDEX_KEY))
    index = JSON.parse(tdec.decode(pako.inflate(indexCompressed)))
} catch (err) {console.log(err)}
showIndexData()

