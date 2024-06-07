
const func = async () => {
    const response = await userInfo.ping()
    return response
}
window.addEventListener('DOMContentLoaded', async () => {
    const information = document.getElementById('info')
    information.innerText = `本人是：${userInfo.name}，大名：${userInfo.getName()}`
    const ping = document.getElementById('ping')
    ping.innerText = await func()
    const setButton = document.getElementById('btn')
    const titleInput = document.getElementById('title')
    setButton.addEventListener('click', () => {
    const title = titleInput.value
    electronAPI.setTitle(title)
    })
    const btn = document.getElementById('btnForOpen')
    const filePathElement = document.getElementById('filePath')

    btn.addEventListener('click', async () => {
        const filePath = await electronAPI.openFile()
        filePathElement.innerText = filePath
    })

    const counter = document.getElementById('counter')
    electronAPI.onUpdateCounter((value) => {
        const oldValue = Number(counter.innerText)
        const newValue = oldValue + value
        counter.innerText = newValue.toString()
        electronAPI.counterValue(newValue)
    })
})