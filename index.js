let tenc = new TextEncoder()
let tdec = new TextDecoder()

const INDEX_KEY_OLD = "index"
const INDEX_KEY = "indexNew"

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


const offline = document.getElementById("offline")
const persistent = document.getElementById("persistent")
const persistbutton = document.getElementById("persistbutton")
const updatesbutton = document.getElementById("updatesbutton")




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
            localforage.setItem(INDEX_KEY, indexCompressed)
        } catch (err) {}
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
    window.localStorage.removeItem(INDEX_KEY_OLD)
} catch (_) {}


localforage.getItem(INDEX_KEY).then((indexCompressed) => {
    index = JSON.parse(tdec.decode(pako.inflate(indexCompressed)))
    showIndexData()
}).catch(() => {
    showIndexData()
}).


sw = null

if ("serviceWorker" in navigator) {
    updatesbutton.onclick = (ev) => {
        if (sw != null) {
            sw.update()
        }
    }
    navigator.serviceWorker.register("/sw.js", {scope: "/"}).then((w) => {
        sw = w
        sw.onupdatefound = () => {
            window.alert("Update found! Please refresh the page to apply the update.")
        }
        offline.innerText = "Yes"
        offline.style = "color: green;"
    }).catch( ()=> {
        offline.innerText = "No"
    })
} else {
    offline.innerText = "No"
    updatesbutton.remove()
}


function displayPersist(pers) {
    if (pers) {
        persistbutton.remove()
        persistent.innerText = "Yes"
        persistent.style = "color: green;"
    } else {
        persistent.innerText = "No"
    }
}

persistbutton.onclick = (ev) => {
    navigator.storage.persist().then((pers) => {
        displayPersist(pers)
    })
}

if (navigator.storage) {
    navigator.storage.persisted().then((pers) => {
        displayPersist(pers)
    })
} else {
    persistbutton.remove()
    persistent.innerText = "No"
}



