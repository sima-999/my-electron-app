
const func = async () => {
    const response = await userInfo.ping()
    return response
}
window.addEventListener('DOMContentLoaded', async () => {
    const information = document.getElementById('info')
    information.innerText = `本人是：${userInfo.name}，大名：${userInfo.getName()}`
    const ping = document.getElementById('ping')
    ping.innerText = await func()
})
