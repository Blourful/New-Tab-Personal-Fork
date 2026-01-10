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

    const iconTemplate = document.getElementById('icon-settings')
    if (iconTemplate) {
        const iconClone = iconTemplate.content.cloneNode(true)
        settingsIcon.appendChild(iconClone)
    }

    let hideTimeout = null

    // Calculate background color and apply to options
    const calculateAndApplyOptionsBackground = () => {
        const bgImg = document.getElementById('bg')
        if (!bgImg || !bgImg.complete) return

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Get the entire selected element area
        const selectedRect = bgSelectSelected.getBoundingClientRect()

        // Calculate position relative to background image
        const bgRect = bgImg.getBoundingClientRect()
        const relativeLeft = selectedRect.left - bgRect.left
        const relativeTop = selectedRect.top - bgRect.top
        const relativeWidth = selectedRect.width
        const relativeHeight = selectedRect.height

        canvas.width = bgImg.naturalWidth || bgImg.width
        canvas.height = bgImg.naturalHeight || bgImg.height

        ctx.drawImage(bgImg, 0, 0)

        // Calculate scale ratio
        const scaleX = canvas.width / bgRect.width
        const scaleY = canvas.height / bgRect.height

        // Calculate sampling area on canvas
        const sampleLeft = Math.round(relativeLeft * scaleX)
        const sampleTop = Math.round(relativeTop * scaleY)
        const sampleWidth = Math.round(relativeWidth * scaleX)
        const sampleHeight = Math.round(relativeHeight * scaleY)

        try {
            // Get pixel data for entire selected area
            const imageData = ctx.getImageData(
                Math.max(0, sampleLeft),
                Math.max(0, sampleTop),
                Math.max(1, Math.min(sampleWidth, canvas.width - sampleLeft)),
                Math.max(1, Math.min(sampleHeight, canvas.height - sampleTop))
            )

            const data = imageData.data
            const rValues = []
            const gValues = []
            const bValues = []

            // Collect all R, G, B values for each pixel in the area
            for (let i = 0; i < data.length; i += 4) {
                rValues.push(data[i])
                gValues.push(data[i + 1])
                bValues.push(data[i + 2])
            }

            // Calculate median value
            const getMedian = (arr) => {
                const sorted = arr.slice().sort((a, b) => a - b)
                const mid = Math.floor(sorted.length / 2)
                if (sorted.length % 2 === 0) {
                    return Math.round((sorted[mid - 1] + sorted[mid]) / 2)
                }
                return sorted[mid]
            }

            const medianR = getMedian(rValues)
            const medianG = getMedian(gValues)
            const medianB = getMedian(bValues)

            // Three-layer color blending calculation
            // Layer 1: Background median color
            // Layer 2: Blend with parent element color rgba(0, 0, 0, 0.2)
            const parentAlpha = 0.2
            const afterParent = [
                medianR * (1 - parentAlpha) + 0 * parentAlpha,
                medianG * (1 - parentAlpha) + 0 * parentAlpha,
                medianB * (1 - parentAlpha) + 0 * parentAlpha
            ]

            // Layer 3: Blend with selected:hover color rgba(255, 255, 255, 0.12)
            const selectedHoverAlpha = 0.12
            const mixedR = Math.round(
                afterParent[0] * (1 - selectedHoverAlpha) +
                    255 * selectedHoverAlpha
            )
            const mixedG = Math.round(
                afterParent[1] * (1 - selectedHoverAlpha) +
                    255 * selectedHoverAlpha
            )
            const mixedB = Math.round(
                afterParent[2] * (1 - selectedHoverAlpha) +
                    255 * selectedHoverAlpha
            )

            // Layer 4: Add another layer of black rgba(0, 0, 0, 0.1) blending
            const blackAlpha = 0.1
            const finalR = Math.round(
                mixedR * (1 - blackAlpha) + 0 * blackAlpha
            )
            const finalG = Math.round(
                mixedG * (1 - blackAlpha) + 0 * blackAlpha
            )
            const finalB = Math.round(
                mixedB * (1 - blackAlpha) + 0 * blackAlpha
            )

            bgSelectItems.style.background = `rgb(${finalR}, ${finalG}, ${finalB})`
            bgSelectItems.style.backdropFilter = 'blur(20px)'
        } catch (e) {
            console.warn('Failed to sample background image color')
        }
    }

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
            bgSelectSelected.textContent = savedBgDiv.textContent
            bgSelectDivs.forEach((d) => d.classList.remove('active'))
            savedBgDiv.classList.add('active')
            changeBgImage(savedBgImage)
        }
    } else {
        bgSelectDivs[0].classList.add('active')
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

    // Background Select - Update display on hover
    const updateBgSelectDisplay = () => {
        bgSelectDivs.forEach((item) => {
            if (item.textContent === bgSelectSelected.textContent) {
                item.classList.add('hidden')
            } else {
                item.classList.remove('hidden')
            }
        })
    }

    bgSelect.addEventListener('mouseenter', () => {
        updateBgSelectDisplay()
        // Calculate and apply new background color
        calculateAndApplyOptionsBackground()
    })

    // Background Select Item Click
    bgSelectDivs.forEach((item) => {
        item.addEventListener('click', () => {
            const imageName = item.getAttribute('data-bg')

            if (item.textContent === bgSelectSelected.textContent) {
                return
            }

            bgSelectSelected.textContent = item.textContent
            changeBgImage(imageName)

            bgSelectDivs.forEach((d) => d.classList.remove('active'))
            item.classList.add('active')

            // Recalculate color after background change
            setTimeout(() => {
                calculateAndApplyOptionsBackground()
            }, 50)
        })
    })

    // Calculate initial color after page load
    if (bgImg.complete) {
        setTimeout(() => {
            calculateAndApplyOptionsBackground()
        }, 100)
    } else {
        bgImg.addEventListener('load', () => {
            calculateAndApplyOptionsBackground()
        })
    }
})
