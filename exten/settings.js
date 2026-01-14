document.addEventListener('DOMContentLoaded', () => {
    const settingsMenu = document.getElementById('settings-menu')
    const settingsIcon = settingsMenu.querySelector('.settings-icon')
    const settingsDropdown = settingsMenu.querySelector('.settings-dropdown')
    const toggleButtons = settingsMenu.querySelectorAll('.toggle-btn')
    const quoteContainer = document.getElementById('quote-container')
    const bgElement = document.getElementById('bg')

    // Custom Background Select
    const bgSelect = settingsMenu.querySelector('.bg-select')
    const bgSelectSelected = settingsMenu.querySelector('.selected')
    const bgSelectItems = settingsMenu.querySelector('.options')
    const bgSelectDivs = settingsMenu.querySelectorAll('.options div')
    let currentActiveBgItem = null

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
    bgSelectItems.addEventListener('mouseenter', showDropdown)
    settingsMenu.addEventListener('mouseleave', hideDropdown)

    const applyToggle = (action) => {
        if (!quoteContainer) return
        if (action === 'lyrics-on') {
            quoteContainer.style.display = 'block'
        } else if (action === 'lyrics-off') {
            quoteContainer.style.display = 'none'
        }
    }

    const changeBgImage = (imageName) => {
        if (bgElement) {
            bgElement.src = `./images/${imageName}`
            try {
                localStorage.setItem('bgImage', imageName)
            } catch (e) {}
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

    const savedBgImage = (() => {
        try {
            return localStorage.getItem('bgImage')
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

    if (savedBgImage) {
        const savedBgDiv = settingsMenu.querySelector(
            `.options div[data-bg="${savedBgImage}"]`
        )
        if (savedBgDiv) {
            bgSelectDivs.forEach((d) => d.classList.remove('active'))
            savedBgDiv.classList.add('active')
            currentActiveBgItem = savedBgDiv
            changeBgImage(savedBgImage)
        }
    } else {
        bgSelectDivs[0].classList.add('active')
        currentActiveBgItem = bgSelectDivs[0]
    }

    // Lyrics Toggle Buttons
    toggleButtons.forEach((btn) => {
        if (btn.hasAttribute('data-action')) {
            btn.addEventListener('click', () => {
                const actionBtns =
                    settingsMenu.querySelectorAll('[data-action]')
                actionBtns.forEach((b) => b.classList.remove('active'))
                btn.classList.add('active')
                const action = btn.getAttribute('data-action')
                applyToggle(action)
                try {
                    localStorage.setItem('lyricsToggle', action)
                } catch (e) {}
            })
        }
    })

    // Background Select Item Click
    bgSelectDivs.forEach((item) => {
        item.addEventListener('click', () => {
            if (item === currentActiveBgItem) {
                return
            }

            const imageName = item.getAttribute('data-bg')
            changeBgImage(imageName)

            bgSelectDivs.forEach((d) => d.classList.remove('active'))
            item.classList.add('active')
            currentActiveBgItem = item
        })
    })

    // Upload Custom Image
    const uploadInput = document.getElementById('upload-bg-input')
    const uploadBtn = document.getElementById('upload-bg-btn')

    if (uploadBtn && uploadInput) {
        uploadBtn.addEventListener('click', () => {
            uploadInput.click()
        })

        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0]
            if (!file) return

            const reader = new FileReader()
            reader.onload = (event) => {
                const dataUrl = event.target.result
                if (bgElement) {
                    bgElement.src = dataUrl
                    try {
                        localStorage.setItem('bgImage', dataUrl)
                        localStorage.setItem('bgImageCustom', 'true')
                    } catch (e) {
                        console.error('LocalStorage error:', e)
                    }
                }

                // Update UI
                bgSelectDivs.forEach((d) => d.classList.remove('active'))
                if (currentActiveBgItem) {
                    currentActiveBgItem.classList.remove('active')
                }
                currentActiveBgItem = null
                bgSelectSelected.textContent = file.name || 'Custom Image'
            }
            reader.readAsDataURL(file)
        })
    }
})
