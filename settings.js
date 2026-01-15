document.addEventListener('DOMContentLoaded', () => {
    const settingsMenu = document.getElementById('settings-menu')
    const settingsIcon = settingsMenu.querySelector('.settings-icon')
    const settingsDropdown = settingsMenu.querySelector('.settings-dropdown')
    const toggleButtons = settingsMenu.querySelectorAll('.toggle-btn')
    const quoteContainer = document.getElementById('quote-container')
    const bgElement = document.getElementById('bg')
    const settingsMask = document.querySelector('.settings-mask')

    // Custom Background Select
    const bgSelect = settingsMenu.querySelector('.bg-select')
    const bgSelectSelected = settingsMenu.querySelector('.selected')
    const bgSelectItems = settingsMenu.querySelector('.options')
    const bgSelectDivs = settingsMenu.querySelectorAll(
        '.bg-select .options div'
    )

    let currentActiveBgItem = null

    const iconTemplate = document.getElementById('icon-settings')
    if (iconTemplate) {
        const iconClone = iconTemplate.content.cloneNode(true)
        settingsIcon.appendChild(iconClone)
    }

    // let hideTimeout = null
    let isOpen = false
    const openDropdown = () => {
        settingsDropdown.classList.add('show')
        settingsMask.classList.add('show')
        settingsIcon.style.transform = 'rotate(30deg)'
        settingsIcon.style.color = 'rgba(255, 255, 255, 1)'
        isOpen = true
    }

    const closeDropdown = () => {
        settingsDropdown.classList.remove('show')
        settingsMask.classList.remove('show')
        settingsIcon.style.transform = 'rotate(0deg)'
        settingsIcon.style.color = 'rgba(255, 255, 255, 0)'
        isOpen = false
    }

    settingsIcon.addEventListener('click', (e) => {
        e.stopPropagation()
        isOpen ? closeDropdown() : openDropdown()
    })
    settingsDropdown.addEventListener('click', (e) => {
        e.stopPropagation()
    })
    document.addEventListener('click', (e) => {
        // Do not close the settings panel if clicking on the settings menu, search box, or pin modal
        if (
            settingsMenu.contains(e.target) ||
            e.target.closest('#search') ||
            e.target.closest('#pin-modal')
        ) {
            return
        }
        if (isOpen) closeDropdown()
    })

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
        item.addEventListener('click', (e) => {
            e.stopPropagation()
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

    // Pin Management
    const defaultPins = [
        {
            id: 'pin-1',
            name: '有道词典',
            url: 'https://dict.youdao.com/',
            icon: '<svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M17,10.5 C17.7796706,10.5 18.4204457,11.0949121 18.4931332,11.8555442 L18.5,12 L18.5,12.5 L19.5,12.5 C20.5543909,12.5 21.4181678,13.31585 21.4945144,14.3507339 L21.5,14.5 L21.5,17.5 C21.5,18.5543909 20.68415,19.4181678 19.6492661,19.4945144 L19.5,19.5 L18.5,19.5 L18.5,20 C18.5,20.8284 17.8284,21.5 17,21.5 C16.2203294,21.5 15.5795543,20.9050879 15.5068668,20.1444558 L15.5,20 L15.5,19.5 L14.5,19.5 C13.4456091,19.5 12.5818322,18.68415 12.5054856,17.6492661 L12.5,17.5 L12.5,14.5 C12.5,13.4456091 13.31585,12.5818322 14.3507339,12.5054856 L14.5,12.5 L15.5,12.5 L15.5,12 C15.5,11.1716 16.1716,10.5 17,10.5 Z M5,14.5 C5.82843,14.5 6.5,15.1716 6.5,16 L6.5,17 C6.5,17.2761 6.72386,17.5 7,17.5 L10,17.5 C10.8284,17.5 11.5,18.1716 11.5,19 C11.5,19.8284 10.8284,20.5 10,20.5 L7,20.5 C5.067,20.5 3.5,18.933 3.5,17 L3.5,16 C3.5,15.1716 4.17157,14.5 5,14.5 Z M15.5,15 L14.5,15 L14.5,17 L15.5,17 L15.5,15 Z M19.5,15 L18.5,15 L18.5,17 L19.5,17 L19.5,15 Z M9.5,2.5 C10.3284,2.5 11,3.17157 11,4 C11,4.82843 10.3284,5.5 9.5,5.5 L5.5,5.5 L5.5,6.5 L9,6.5 C9.82843,6.5 10.5,7.17157 10.5,8 C10.5,8.82843 9.82843,9.5 9,9.5 L5.5,9.5 L5.5,10.5 L10,10.5 C10.8284,10.5 11.5,11.1716 11.5,12 C11.5,12.8284 10.8284,13.5 10,13.5 L4.1,13.5 C3.21635,13.5 2.5,12.7837 2.5,11.9 L2.5,4.1 C2.5,3.21635 3.21634,2.5 4.1,2.5 L9.5,2.5 Z M17,3.5 C18.933,3.5 20.5,5.067 20.5,7 L20.5,9 C20.5,9.82843 19.8284,10.5 19,10.5 C18.1716,10.5 17.5,9.82843 17.5,9 L17.5,7 C17.5,6.72386 17.2761,6.5 17,6.5 L14,6.5 C13.1716,6.5 12.5,5.82843 12.5,5 C12.5,4.17157 13.1716,3.5 14,3.5 L17,3.5 Z"></path></svg>',
            isDefault: true
        },
        {
            id: 'pin-2',
            name: 'Vocakey',
            url: 'http://vocakey.imikufans.com/index.html',
            icon: chrome.runtime.getURL(
                'svg/Hatsune_Miku_logo_(Project_Sekai).svg'
            ),
            iconType: 'image',
            isDefault: true
        },
        {
            id: 'pin-3',
            name: 'CSTimer',
            url: 'https://cstimer.net',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 5C7.44621 5 3.75 8.69621 3.75 13.25C3.75 17.8038 7.44621 21.5 12 21.5C16.5538 21.5 20.25 17.8038 20.25 13.25C20.25 8.69621 16.5538 5 12 5ZM2.25 13.25C2.25 7.86779 6.61779 3.5 12 3.5C17.3822 3.5 21.75 7.86779 21.75 13.25C21.75 18.6322 17.3822 23 12 23C6.61779 23 2.25 18.6322 2.25 13.25Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M8.25 1.75C8.25 2.16421 8.58579 2.5 9 2.5L15 2.5C15.4142 2.5 15.75 2.16421 15.75 1.75C15.75 1.33579 15.4142 0.999999 15 0.999999L9 1C8.58579 1 8.25 1.33579 8.25 1.75Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M12 7.5C12.4142 7.5 12.75 7.83579 12.75 8.25V13.25C12.75 13.6642 12.4142 14 12 14C11.5858 14 11.25 13.6642 11.25 13.25V8.25C11.25 7.83579 11.5858 7.5 12 7.5Z" /></svg>',
            isDefault: true
        },
        {
            id: 'pin-4',
            name: 'GitHub',
            url: 'https://github.com',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" fill="currentColor" class="icon"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" /></svg>',
            isDefault: true
        },
        {
            id: 'pin-5',
            name: 'Hookpad',
            url: 'https://hookpad.hooktheory.com',
            icon: '<svg viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g><path d="M162.77,488.884c-8.509,0-15.41-6.901-15.41-15.41V309.941c0-8.509,6.901-15.41,15.41-15.41 s15.41,6.901,15.41,15.41v163.533C178.18,481.983,171.279,488.884,162.77,488.884z"></path><path d="M349.23,488.884c-8.509,0-15.41-6.901-15.41-15.41V309.941c0-8.509,6.901-15.41,15.41-15.41 c8.509,0,15.41,6.901,15.41,15.41v163.533C364.64,481.983,357.739,488.884,349.23,488.884z"></path><path d="M456.125,488.884H55.875C25.066,488.884,0,463.818,0,433.007V78.993 c0-30.811,25.066-55.876,55.875-55.876h400.25c8.509,0,15.41,6.901,15.41,15.41s-6.901,15.41-15.41,15.41H55.875 c-13.815,0-25.055,11.24-25.055,25.056v354.015c0,13.816,11.24,25.056,25.055,25.056h400.25c13.815,0,25.055-11.24,25.055-25.056 V143.512c0-8.509,6.901-15.41,15.41-15.41c8.509,0,15.41,6.901,15.41,15.41v289.495C512,463.818,486.934,488.884,456.125,488.884z"></path></g><path d="M178.951,314.564H146.59c-16.596,0-30.049-13.453-30.049-30.049V38.526H209v245.987 C209,301.109,195.547,314.564,178.951,314.564z"></path><path d="M178.951,329.974H146.59c-25.067,0-45.459-20.392-45.459-45.459V38.526 c0-8.509,6.901-15.41,15.41-15.41H209c8.509,0,15.41,6.901,15.41,15.41v245.988C224.41,309.58,204.018,329.974,178.951,329.974z M131.95,53.936v230.578c0,8.072,6.568,14.639,14.639,14.639h32.361c8.072,0,14.639-6.568,14.639-14.639V53.936H131.95z"></path><path d="M365.41,314.564h-32.361c-16.596,0-30.049-13.453-30.049-30.049V38.526h92.459v245.987 C395.46,301.109,382.005,314.564,365.41,314.564z"></path><path d="M365.41,329.974h-32.361c-25.067,0-45.459-20.392-45.459-45.459V38.526 c0-8.509,6.901-15.41,15.41-15.41h92.459c8.509,0,15.41,6.901,15.41,15.41v245.988C410.87,309.58,390.478,329.974,365.41,329.974z M318.41,53.936v230.578c0,8.072,6.568,14.639,14.639,14.639h32.361c8.072,0,14.639-6.568,14.639-14.639V53.936H318.41z"></path></svg>',
            isDefault: true
        },
        {
            id: 'pin-6',
            name: 'Niconico',
            url: 'https://www.nicovideo.jp/',
            icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M.4787 7.534v12.1279A2.0213 2.0213 0 0 0 2.5 21.6832h2.3888l1.323 2.0948a.4778.4778 0 0 0 .4043.2205.4778.4778 0 0 0 .441-.2205l1.323-2.0948h6.9828l1.323 2.0948a.4778.4778 0 0 0 .441.2205c.1838 0 .3308-.0735.4043-.2205l1.323-2.0948h2.6462a2.0213 2.0213 0 0 0 2.0213-2.0213V7.5339a2.0213 2.0213 0 0 0-2.0213-1.9845h-7.681l4.4468-4.4469L17.1637 0l-5.1452 5.1452L6.8 0 5.6973 1.1025l4.4102 4.4102H2.5367a2.0213 2.0213 0 0 0-2.058 2.058z"></path></svg>',
            isDefault: true
        }
    ]

    function getPins() {
        try {
            const saved = localStorage.getItem('customPins')
            const customPins = saved ? JSON.parse(saved) : []
            const deletedDefaults = localStorage.getItem('deletedDefaultPins')
            const deletedIds = deletedDefaults
                ? JSON.parse(deletedDefaults)
                : []
            // Filter out deleted default pins
            const activeDefaultPins = defaultPins.filter(
                (p) => !deletedIds.includes(p.id)
            )
            return [...activeDefaultPins, ...customPins]
        } catch (e) {
            return defaultPins
        }
    }

    function saveCustomPins(customPins) {
        try {
            localStorage.setItem('customPins', JSON.stringify(customPins))
        } catch (e) {
            console.error('Failed to save custom pins:', e)
        }
    }

    function renderPinList() {
        const pinList = document.getElementById('pin-list')
        if (!pinList) return

        const pins = getPins()
        pinList.innerHTML = ''

        pins.forEach((pin) => {
            const item = document.createElement('div')
            item.className = 'pin-item'
            item.dataset.pinId = pin.id

            const iconDiv = document.createElement('div')
            iconDiv.className = 'pin-item-icon'
            if (pin.iconType === 'image') {
                const img = document.createElement('img')
                img.src = pin.icon
                img.alt = pin.name
                iconDiv.appendChild(img)
            } else {
                iconDiv.innerHTML = pin.icon || ''
            }

            const nameDiv = document.createElement('div')
            nameDiv.className = 'pin-item-name'
            nameDiv.textContent = pin.name

            const actionsDiv = document.createElement('div')
            actionsDiv.className = 'pin-item-actions'

            const editBtn = document.createElement('button')
            editBtn.className = 'pin-edit-btn'
            editBtn.textContent = 'Edit'
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                // Prevent settings panel from closing
                e.preventDefault()
                openPinModal(pin)
            })

            const deleteBtn = document.createElement('button')
            deleteBtn.className = 'pin-delete-btn'
            deleteBtn.textContent = 'Delete'
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                deletePin(pin.id, pin.isDefault)
            })

            actionsDiv.appendChild(editBtn)
            actionsDiv.appendChild(deleteBtn)

            item.appendChild(iconDiv)
            item.appendChild(nameDiv)
            item.appendChild(actionsDiv)

            pinList.appendChild(item)
        })
    }

    function deletePin(pinId, isDefault = false) {
        const pins = getPins()
        const pin = pins.find((p) => p.id === pinId)
        if (!pin) return

        if (confirm(`Are you sure you want to delete "${pin.name}"?`)) {
            if (isDefault) {
                // Delete default pin: save to deleted list
                try {
                    const deletedDefaults =
                        localStorage.getItem('deletedDefaultPins')
                    const deletedIds = deletedDefaults
                        ? JSON.parse(deletedDefaults)
                        : []
                    if (!deletedIds.includes(pinId)) {
                        deletedIds.push(pinId)
                        localStorage.setItem(
                            'deletedDefaultPins',
                            JSON.stringify(deletedIds)
                        )
                    }
                } catch (e) {
                    console.error('Failed to save deleted default pins:', e)
                }
            } else {
                // Delete custom pin
                const customPins = pins.filter((p) => !p.isDefault)
                const updatedCustomPins = customPins.filter(
                    (p) => p.id !== pinId
                )
                saveCustomPins(updatedCustomPins)
            }
            renderPinList()
            // Trigger pin update event
            window.dispatchEvent(new CustomEvent('pinsUpdated'))
        }
    }

    function openPinModal(pin = null) {
        const modal = document.getElementById('pin-modal')
        const title = document.getElementById('pin-modal-title')
        const nameInput = document.getElementById('pin-name-input')
        const urlInput = document.getElementById('pin-url-input')
        const iconInput = document.getElementById('pin-icon-input')
        const iconPreview = document.getElementById('pin-icon-preview')
        const deleteBtn = document.getElementById('pin-delete')

        if (!modal || !title || !nameInput || !urlInput || !iconInput) return

        if (pin) {
            title.textContent = 'Edit Pin'
            nameInput.value = pin.name
            urlInput.value = pin.url
            iconInput.value = pin.icon || ''
            deleteBtn.style.display = 'block'
            deleteBtn.onclick = () => {
                deletePin(pin.id, pin.isDefault)
                closePinModal()
            }
        } else {
            title.textContent = 'New Pin'
            nameInput.value = ''
            urlInput.value = ''
            iconInput.value = ''
            deleteBtn.style.display = 'none'
        }

        const updatePreview = () => {
            const iconValue = iconInput.value.trim()
            iconPreview.innerHTML = ''
            if (iconValue) {
                if (
                    iconValue.startsWith('<svg') ||
                    iconValue.startsWith('<img')
                ) {
                    iconPreview.innerHTML = iconValue
                } else if (
                    iconValue.startsWith('http') ||
                    iconValue.startsWith('data:') ||
                    iconValue.startsWith('./')
                ) {
                    const img = document.createElement('img')
                    img.src = iconValue.startsWith('./')
                        ? chrome.runtime.getURL(iconValue.substring(2))
                        : iconValue
                    img.alt = 'Icon preview'
                    iconPreview.appendChild(img)
                }
            }
        }

        iconInput.addEventListener('input', updatePreview)
        updatePreview()

        modal.classList.remove('hidden')
        requestAnimationFrame(() => {
            modal.classList.add('show')
        })
        // Prevent settings panel from closing
        if (isOpen) {
            // Ensure settings panel stays open
        }

        const saveBtn = document.getElementById('pin-save')
        const cancelBtn = document.getElementById('pin-cancel')

        const saveHandler = () => {
            const name = nameInput.value.trim()
            const url = urlInput.value.trim()
            const icon = iconInput.value.trim()

            if (!name || !url) {
                alert('请填写名称和URL')
                return
            }

            const pins = getPins()
            const customPins = pins.filter((p) => !p.isDefault)

            // Check pin count limit (max 12)
            if (!pin && customPins.length >= 12) {
                alert('最多只能添加12个pin')
                return
            }

            if (pin) {
                // Edit existing pin
                if (pin.isDefault) {
                    // Edit default pin: create custom copy and delete original default pin
                    const deletedDefaults =
                        localStorage.getItem('deletedDefaultPins')
                    const deletedIds = deletedDefaults
                        ? JSON.parse(deletedDefaults)
                        : []
                    if (!deletedIds.includes(pin.id)) {
                        deletedIds.push(pin.id)
                        try {
                            localStorage.setItem(
                                'deletedDefaultPins',
                                JSON.stringify(deletedIds)
                            )
                        } catch (e) {
                            console.error(
                                'Failed to save deleted default pins:',
                                e
                            )
                        }
                    }
                    const newPin = {
                        id: 'pin-custom-' + Date.now(),
                        name,
                        url,
                        icon: icon || pin.icon,
                        iconType:
                            icon &&
                            (icon.startsWith('http') ||
                                icon.startsWith('data:') ||
                                icon.startsWith('./'))
                                ? 'image'
                                : undefined,
                        isDefault: false
                    }
                    customPins.push(newPin)
                } else {
                    // Update custom pin
                    const index = customPins.findIndex((p) => p.id === pin.id)
                    if (index !== -1) {
                        customPins[index] = {
                            ...customPins[index],
                            name,
                            url,
                            icon: icon || customPins[index].icon,
                            iconType:
                                icon &&
                                (icon.startsWith('http') ||
                                    icon.startsWith('data:') ||
                                    icon.startsWith('./'))
                                    ? 'image'
                                    : undefined
                        }
                    }
                }
            } else {
                // Add new pin
                const newPin = {
                    id: 'pin-custom-' + Date.now(),
                    name,
                    url,
                    icon: icon || '',
                    iconType:
                        icon &&
                        (icon.startsWith('http') ||
                            icon.startsWith('data:') ||
                            icon.startsWith('./'))
                            ? 'image'
                            : undefined,
                    isDefault: false
                }
                customPins.push(newPin)
            }

            saveCustomPins(customPins)
            renderPinList()
            closePinModal()
            // Trigger pin update event
            window.dispatchEvent(new CustomEvent('pinsUpdated'))
        }

        const cancelHandler = () => {
            closePinModal()
        }

        saveBtn.onclick = saveHandler
        cancelBtn.onclick = cancelHandler

        // Save on Enter
        const handleKeyPress = (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                saveHandler()
            } else if (e.key === 'Escape') {
                cancelHandler()
            }
        }

        document.addEventListener('keydown', handleKeyPress)
        modal._keyHandler = handleKeyPress
    }

    function closePinModal() {
        const modal = document.getElementById('pin-modal')
        if (!modal) return

        if (modal._keyHandler) {
            document.removeEventListener('keydown', modal._keyHandler)
            delete modal._keyHandler
        }

        modal.classList.remove('show')

        // Wait for animation to finish before actually hiding
        setTimeout(() => {
            modal.classList.add('hidden')
        }, 250) // Time matches CSS transition
    }

    // Click outside modal to close
    const pinModal = document.getElementById('pin-modal')
    if (pinModal) {
        pinModal.addEventListener('click', (e) => {
            e.stopPropagation() // Prevent event bubbling to document
            if (e.target === pinModal) {
                closePinModal()
            }
        })
    }

    // Add pin button
    const addPinBtn = document.getElementById('add-pin-btn')
    if (addPinBtn) {
        addPinBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            // Check pin count limit
            const pins = getPins()
            const customPins = pins.filter((p) => !p.isDefault)
            if (customPins.length >= 12) {
                alert('最多只能添加12个pin')
                return
            }
            openPinModal()
        })
    }

    // Initialize pin list
    renderPinList()
})
