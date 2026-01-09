document.addEventListener('DOMContentLoaded', () => {
    const tpl = document.getElementById('icon-sun')
    if (!tpl) return

    // 创建容器，固定在右上角
    const holder = document.createElement('div')
    holder.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 0;
    width: 32px;
    height: 32px;
    color: #fff; /* 让 currentColor 变成白色 */
  `
    holder.appendChild(tpl.content.cloneNode(true))
    document.body.appendChild(holder)
})
