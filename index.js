let tenc = new TextEncoder()
let tdec = new TextDecoder()

const INDEX_KEY = "index"

let index = null
let doSearch = false



const updateindex = document.getElementById("updateindex")
const indexinfo = document.getElementById("indexinfo")
const search = document.getElementById("search")
const nameField = document.getElementById("name")
const content = document.getElementById("content")

const startswith = document.getElementById("startswith")
const contains = document.getElementById("contains")
const regex = document.getElementById("regex")

const searchname = document.getElementById("searchName")
const searchdescription = document.getElementById("searchDescription")
const searchdependencies = document.getElementById("searchDependencies")


startswith.checked = true
contains.checked = false
regex.checked = false

searchname.checked = true
contains.checked = false
regex.checked = false


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
        if (doSearch) {
            search.click()
            doSearch = false
        }
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
    if (index === null) {
        doSearch = true
        updateindex.click()
    }
    content.innerHTML = ""
    index.data.filter((pkg) => {
        let searchString = null
        
        if (searchname.checked) searchString = pkg.name;
        if (searchdescription.checked) searchString = pkg.description;
        
        if (searchString != null) {
            if (contains.checked) return searchString.includes(nameField.value)
            if (regex.checked) return new RegExp(nameField.value).test(searchString)
            return searchString.startsWith(nameField.value)
        } else {
            for (let dep of pkg.depends) {
                if (contains.checked && dep.includes(nameField.value)) return true
                if (regex.checked && new RegExp(nameField.value).test(dep)) return true
                if (dep.startsWith(nameField.value)) return true
            }
        }
        
        return false
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
} catch (_) {}
showIndexData()

