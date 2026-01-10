document.addEventListener('DOMContentLoaded', () => {
    const settingsMenu = document.getElementById('settings-menu')
    const settingsIcon = settingsMenu.querySelector('.settings-icon')
    const settingsDropdown = settingsMenu.querySelector('.settings-dropdown')
    const toggleButtons = settingsMenu.querySelectorAll('.toggle-btn')
    const quoteContainer = document.getElementById('quote-container')

    const iconTemplate = document.getElementById('icon-settings')
    if (iconTemplate) {
        const iconClone = iconTemplate.content.cloneNode(true)
        settingsIcon.appendChild(iconClone)
    }

    let hideTimeout = null

    const showDropdown = () => {
        clearTimeout(hideTimeout)
        settingsDropdown.classList.add('show')
        settingsIcon.style.transform = 'rotate(30deg)'
        settingsIcon.style.color = 'rgba(255, 255, 255, 1)'
    }

    const hideDropdown = () => {
        hideTimeout = setTimeout(() => {
            settingsDropdown.classList.remove('show')
            settingsIcon.style.transform = 'rotate(0deg)'
            settingsIcon.style.color = 'rgba(255, 255, 255, 0)'
        }, 100)
    }

    settingsIcon.addEventListener('mouseenter', showDropdown)
    settingsDropdown.addEventListener('mouseenter', showDropdown)
    settingsMenu.addEventListener('mouseleave', hideDropdown)

    const applyToggle = (action) => {
        if (!quoteContainer) return
        if (action === 'lyrics-on') {
            quoteContainer.style.display = 'block'
        } else if (action === 'lyrics-off') {
            quoteContainer.style.display = 'none'
        }
    }

    const activeBtn = settingsMenu.querySelector('.toggle-btn.active')
    const savedAction = (() => {
        try {
            return localStorage.getItem('lyricsToggle')
        } catch (e) {
            return null
        }
    })()

    if (savedAction) {
        const savedBtn = settingsMenu.querySelector(
            `.toggle-btn[data-action="${savedAction}"]`
        )
        if (savedBtn) {
            toggleButtons.forEach((b) => b.classList.remove('active'))
            savedBtn.classList.add('active')
            applyToggle(savedAction)
        } else if (activeBtn) {
            applyToggle(activeBtn.getAttribute('data-action'))
        }
    } else if (activeBtn) {
        applyToggle(activeBtn.getAttribute('data-action'))
    }

    toggleButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            toggleButtons.forEach((b) => b.classList.remove('active'))
            btn.classList.add('active')
            const action = btn.getAttribute('data-action')
            applyToggle(action)
            try {
                localStorage.setItem('lyricsToggle', action)
            } catch (e) {}
        })
    })
})
