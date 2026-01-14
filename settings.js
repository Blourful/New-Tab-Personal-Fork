document.addEventListener('DOMContentLoaded', () => {
    const settingsMenu = document.getElementById('settings-menu')
    const settingsIcon = settingsMenu.querySelector('.settings-icon')
    const settingsDropdown = settingsMenu.querySelector('.settings-dropdown')
    const toggleButtons = settingsMenu.querySelectorAll('.toggle-btn')
    const quoteContainer = document.getElementById('quote-container')
    const bgElement = document.getElementById('bg')

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

    let dropdownOpen = false

    // Auto-hide setting
    let autoHideEnabled = (() => {
        try {
            return localStorage.getItem('autoHideSettings') !== 'false'
        } catch (e) {
            return true
        }
    })()

    // Set icon always visible when autoHide is off
    if (!autoHideEnabled) {
        settingsIcon.style.opacity = '1'
        settingsIcon.style.color = 'rgba(255,255,255,0.8)'
    } else {
        settingsIcon.style.opacity = '1'
        settingsIcon.style.color = 'rgba(255,255,255,0)'
    }

    const showDropdown = () => {
        settingsDropdown.classList.add('show')
        settingsMenu.classList.add('dropdown-open')
        settingsIcon.classList.add('open')
        settingsIcon.style.transform = 'rotate(45deg)'
        dropdownOpen = true
    }

    const hideDropdown = () => {
        settingsDropdown.classList.remove('show')
        settingsMenu.classList.remove('dropdown-open')
        settingsIcon.classList.remove('open')
        settingsIcon.style.transform = 'rotate(0deg)'
        dropdownOpen = false
    }

    settingsIcon.addEventListener('click', () => {
        if (dropdownOpen) {
            hideDropdown()
        } else {
            showDropdown()
        }
    })

    const closeBtn = document.getElementById('close-settings-btn')
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            hideDropdown()
        })
    }

    document.addEventListener('click', (e) => {
        if (!settingsMenu.contains(e.target) && dropdownOpen) {
            hideDropdown()
        }
    })

    settingsDropdown.addEventListener('click', (e) => {
        e.stopPropagation()
    })

    const applyToggle = (action) => {
        if (!quoteContainer) return
        if (action === 'lyrics-on') {
            quoteContainer.style.display = 'block'
        } else if (action === 'lyrics-off') {
            quoteContainer.style.display = 'none'
        }
    }

    const changeBgImage = (imagePath, isCustom = false) => {
        if (window.setBgImageSmooth) {
            window.setBgImageSmooth(imagePath, isCustom)
            try {
                localStorage.setItem('bgImage', imagePath)
                if (isCustom) {
                    localStorage.setItem('bgImageCustom', 'true')
                } else {
                    localStorage.removeItem('bgImageCustom')
                }
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

    // Initialize Auto Hide setting
    const autoHideBtn = autoHideEnabled
        ? settingsMenu.querySelector('[data-action="auto-hide-on"]')
        : settingsMenu.querySelector('[data-action="auto-hide-off"]')
    if (autoHideBtn) {
        toggleButtons.forEach((b) => {
            if (
                b.hasAttribute('data-action') &&
                (b.getAttribute('data-action') === 'auto-hide-on' ||
                    b.getAttribute('data-action') === 'auto-hide-off')
            ) {
                b.classList.remove('active')
            }
        })
        autoHideBtn.classList.add('active')
    }

    if (savedBgImage) {
        const isCustomBg = (() => {
            try {
                return localStorage.getItem('bgImageCustom') === 'true'
            } catch (e) {
                return false
            }
        })()
    }

    if (savedAction) {
        const savedBtn = settingsMenu.querySelector(
            `.toggle-btn[data-action="${savedAction}"]`
        )
        if (savedBtn) {
            toggleButtons.forEach((b) => {
                if (
                    b.hasAttribute('data-action') &&
                    !b.getAttribute('data-action').startsWith('auto-hide')
                ) {
                    b.classList.remove('active')
                }
            })
            savedBtn.classList.add('active')
            applyToggle(savedAction)
        } else if (
            activeBtn &&
            !activeBtn.getAttribute('data-action').startsWith('auto-hide')
        ) {
            applyToggle(activeBtn.getAttribute('data-action'))
        }
    } else if (
        activeBtn &&
        !activeBtn.getAttribute('data-action').startsWith('auto-hide')
    ) {
        applyToggle(activeBtn.getAttribute('data-action'))
    }

    const isCustomBg = (() => {
        try {
            return localStorage.getItem('bgImageCustom') === 'true'
        } catch (e) {
            return false
        }
    })()

    if (isCustomBg && savedBgImage) {
        bgSelectDivs.forEach((d) => d.classList.remove('active'))
        bgSelectSelected.textContent = 'Custom Image'
        currentActiveBgItem = null
    } else if (savedBgImage) {
        const savedBgDiv = settingsMenu.querySelector(
            `.options div[data-bg="${savedBgImage}"]`
        )
        if (savedBgDiv) {
            bgSelectDivs.forEach((d) => d.classList.remove('active'))
            savedBgDiv.classList.add('active')
            currentActiveBgItem = savedBgDiv
        }
    } else {
        bgSelectDivs[0].classList.add('active')
        currentActiveBgItem = bgSelectDivs[0]
    }

    toggleButtons.forEach((btn) => {
        if (btn.hasAttribute('data-action')) {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action')

                // Handle auto-hide toggle
                if (action === 'auto-hide-on' || action === 'auto-hide-off') {
                    const autoHideBtns = settingsMenu.querySelectorAll(
                        '[data-action^="auto-hide"]'
                    )
                    autoHideBtns.forEach((b) => b.classList.remove('active'))
                    btn.classList.add('active')

                    if (action === 'auto-hide-on') {
                        autoHideEnabled = true
                        try {
                            localStorage.setItem('autoHideSettings', 'true')
                        } catch (e) {}
                        settingsIcon.style.opacity = '1'
                        // Do not set color to transparent immediately when toggling ON; let updateSettingsIconColor handle it
                    } else {
                        autoHideEnabled = false
                        try {
                            localStorage.setItem('autoHideSettings', 'false')
                        } catch (e) {}
                        settingsIcon.style.opacity = '1'
                        settingsIcon.style.color = 'rgba(255,255,255,0.8)'
                    }
                } else {
                    // Handle lyrics toggle
                    const lyricsBtns = settingsMenu.querySelectorAll(
                        '[data-action="lyrics-on"], [data-action="lyrics-off"]'
                    )
                    lyricsBtns.forEach((b) => b.classList.remove('active'))
                    btn.classList.add('active')
                    applyToggle(action)
                    try {
                        localStorage.setItem('lyricsToggle', action)
                    } catch (e) {}
                }

                updateSettingsIconColor()
            })
        }
    })

    bgSelectDivs.forEach((item) => {
        item.addEventListener('click', () => {
            if (item === currentActiveBgItem) {
                return
            }

            const imageName = item.getAttribute('data-bg')
            changeBgImage(imageName, false)

            bgSelectDivs.forEach((d) => d.classList.remove('active'))
            item.classList.add('active')
            currentActiveBgItem = item

            try {
                localStorage.setItem('bgImage', imageName)
                localStorage.removeItem('bgImageCustom')
            } catch (e) {}

            const scheduleOnBtn = settingsMenu.querySelector(
                '[data-schedule="schedule-on"]'
            )
            if (scheduleOnBtn && scheduleOnBtn.classList.contains('active')) {
                const offBtn = settingsMenu.querySelector(
                    '[data-schedule="schedule-off"]'
                )
                if (offBtn) {
                    scheduleToggleBtns.forEach((b) =>
                        b.classList.remove('active')
                    )
                    offBtn.classList.add('active')
                    timeScheduleSection.style.display = 'none'
                    disableSchedule()
                }
            }
        })
    })

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
            reader.onload = async (event) => {
                const dataUrl = event.target.result

                if (window.saveCustomBg) {
                    await window.saveCustomBg(dataUrl)
                }

                changeBgImage(dataUrl, true)

                bgSelectDivs.forEach((d) => d.classList.remove('active'))
                if (currentActiveBgItem) {
                    currentActiveBgItem.classList.remove('active')
                }
                currentActiveBgItem = null
                bgSelectSelected.textContent = file.name || 'Custom Image'

                const scheduleOnBtn = settingsMenu.querySelector(
                    '[data-schedule="schedule-on"]'
                )
                if (
                    scheduleOnBtn &&
                    scheduleOnBtn.classList.contains('active')
                ) {
                    const offBtn = settingsMenu.querySelector(
                        '[data-schedule="schedule-off"]'
                    )
                    if (offBtn) {
                        scheduleToggleBtns.forEach((b) =>
                            b.classList.remove('active')
                        )
                        offBtn.classList.add('active')
                        timeScheduleSection.style.display = 'none'
                        disableSchedule()
                    }
                }
            }
            reader.readAsDataURL(file)
        })
    }

    const scheduleToggleBtns = settingsMenu.querySelectorAll('[data-schedule]')
    const timeScheduleSection = document.getElementById('time-schedule-section')
    const periodImageBtns = settingsMenu.querySelectorAll('.period-image-btn')
    const sunsetInfo = document.getElementById('sunset-info')

    const timeScheduleImages = {
        day: null,
        night: null
    }

    let sunTimes = {
        sunrise: null,
        sunset: null,
        lastUpdate: null
    }

    const calculateSunTimes = (lat, lon) => {
        const now = new Date()
        const start = new Date(now.getFullYear(), 0, 0)
        const diff = now - start
        const oneDay = 1000 * 60 * 60 * 24
        const dayOfYear = Math.floor(diff / oneDay)

        const rad = Math.PI / 180
        const deg = 180 / Math.PI

        const zenith = 90.833

        const lngHour = lon / 15

        const t_rise = dayOfYear + (6 - lngHour) / 24
        const t_set = dayOfYear + (18 - lngHour) / 24

        const calcSunTime = (t, isRise) => {
            const M = 0.9856 * t - 3.289
            const MRad = M * rad

            let L =
                M + 1.916 * Math.sin(MRad) + 0.02 * Math.sin(2 * MRad) + 282.634
            while (L < 0) L += 360
            while (L >= 360) L -= 360

            let RA = deg * Math.atan(0.91764 * Math.tan(L * rad))
            while (RA < 0) RA += 360
            while (RA >= 360) RA -= 360

            const Lquadrant = Math.floor(L / 90) * 90
            const RAquadrant = Math.floor(RA / 90) * 90
            RA = RA + (Lquadrant - RAquadrant)
            RA = RA / 15

            const sinDec = 0.39782 * Math.sin(L * rad)
            const cosDec = Math.cos(Math.asin(sinDec))

            const cosH =
                (Math.cos(zenith * rad) - sinDec * Math.sin(lat * rad)) /
                (cosDec * Math.cos(lat * rad))

            if (cosH > 1) {
                return null
            } else if (cosH < -1) {
                return null
            }

            let H = deg * Math.acos(cosH)
            if (isRise) {
                H = 360 - H
            }
            H = H / 15

            const T = H + RA - 0.06571 * t - 6.622

            let UT = T - lngHour
            while (UT < 0) UT += 24
            while (UT >= 24) UT -= 24

            const localOffset = -now.getTimezoneOffset() / 60
            let localT = UT + localOffset
            while (localT < 0) localT += 24
            while (localT >= 24) localT -= 24

            return localT
        }

        const sunriseHours = calcSunTime(t_rise, true)
        const sunsetHours = calcSunTime(t_set, false)

        const toTimeString = (hours) => {
            if (hours === null) return 'N/A'
            const h = Math.floor(hours)
            const m = Math.floor((hours - h) * 60)
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        }

        return {
            sunrise: toTimeString(sunriseHours),
            sunset: toTimeString(sunsetHours),
            sunriseHours: sunriseHours || 6,
            sunsetHours: sunsetHours || 18
        }
    }

    const updateSunTimes = async () => {
        try {
            // Check permission status first
            const permissionStatus = await navigator.permissions.query({
                name: 'geolocation'
            })

            if (permissionStatus.state === 'denied') {
                if (sunsetInfo) {
                    sunsetInfo.innerHTML = `
                        <div style="color: rgba(255, 150, 150, 0.9);">⚠️ Location access denied</div>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 4px;">
                            Enable location in browser settings
                        </div>
                    `
                }
                return
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject)
            })

            const { latitude, longitude } = position.coords
            const times = calculateSunTimes(latitude, longitude)

            sunTimes = {
                sunrise: times.sunriseHours,
                sunset: times.sunsetHours,
                lastUpdate: Date.now()
            }

            try {
                localStorage.setItem('sunTimes', JSON.stringify(sunTimes))
            } catch (e) {}

            if (sunsetInfo) {
                const isDaytime = getCurrentPeriod() === 'day'
                sunsetInfo.innerHTML = `
                    <div>🌅 Sunrise: ${times.sunrise}</div>
                    <div>🌇 Sunset: ${times.sunset}</div>
                    <div style="margin-top: 4px; color: ${
                        isDaytime
                            ? 'rgba(255, 220, 100, 0.9)'
                            : 'rgba(150, 150, 255, 0.9)'
                    };">
                        ${
                            isDaytime
                                ? '☀️ Currently Daytime'
                                : '🌙 Currently Nighttime'
                        }
                    </div>
                `
            }
        } catch (error) {
            const savedSunTimes = (() => {
                try {
                    return JSON.parse(localStorage.getItem('sunTimes'))
                } catch (e) {
                    return null
                }
            })()

            if (
                savedSunTimes &&
                savedSunTimes.lastUpdate &&
                typeof savedSunTimes.sunrise === 'number' &&
                typeof savedSunTimes.sunset === 'number'
            ) {
                sunTimes = savedSunTimes
                if (sunsetInfo) {
                    const toTimeString = (hours) => {
                        const h = Math.floor(hours)
                        const m = Math.floor((hours - h) * 60)
                        return `${String(h).padStart(2, '0')}:${String(
                            m
                        ).padStart(2, '0')}`
                    }
                    sunsetInfo.innerHTML = `
                        <div>🌅 Sunrise: ${toTimeString(sunTimes.sunrise)}</div>
                        <div>🌇 Sunset: ${toTimeString(sunTimes.sunset)}</div>
                        <div style="margin-top: 4px; color: rgba(255, 180, 100, 0.8);">Using cached times</div>
                    `
                }
            } else {
                sunTimes = { sunrise: 6, sunset: 18, lastUpdate: null }
                if (sunsetInfo) {
                    sunsetInfo.innerHTML = `
                        <div style="color: rgba(255, 150, 150, 0.9);">⚠️ Location access denied</div>
                        <div style="margin-top: 4px;">Using default times (6:00 - 18:00)</div>
                    `
                }
            }
        }
    }

    const loadScheduleImages = () => {
        try {
            const saved = localStorage.getItem('timeScheduleImages')
            if (saved) {
                const parsed = JSON.parse(saved)
                Object.assign(timeScheduleImages, parsed)

                periodImageBtns.forEach((btn) => {
                    const period = btn.getAttribute('data-period')
                    if (timeScheduleImages[period]) {
                        btn.classList.add('has-image')
                        btn.textContent =
                            period === 'day'
                                ? 'Daytime Image Set ✓'
                                : 'Nighttime Image Set ✓'
                    }
                })
            }
        } catch (e) {}
    }

    const saveScheduleImages = () => {
        try {
            localStorage.setItem(
                'timeScheduleImages',
                JSON.stringify(timeScheduleImages)
            )
        } catch (e) {}
    }

    const getCurrentPeriod = () => {
        const now = new Date()
        const hours = now.getHours() + now.getMinutes() / 60

        if (sunTimes.sunrise !== null && sunTimes.sunset !== null) {
            if (sunTimes.sunrise < sunTimes.sunset) {
                return hours >= sunTimes.sunrise && hours < sunTimes.sunset
                    ? 'day'
                    : 'night'
            } else {
                return hours >= sunTimes.sunrise || hours < sunTimes.sunset
                    ? 'day'
                    : 'night'
            }
        }

        return hours >= 6 && hours < 18 ? 'day' : 'night'
    }

    const applyScheduledBackground = () => {
        const period = getCurrentPeriod()
        const imageData = timeScheduleImages[period]
        if (imageData && bgElement) {
            bgElement.src = imageData
            try {
                localStorage.setItem('bgImage', imageData)
                localStorage.setItem('bgImageCustom', 'true')
            } catch (e) {}
        }
    }

    let scheduleInterval = null

    const enableSchedule = () => {
        updateSunTimes()
        applyScheduledBackground()
        if (scheduleInterval) clearInterval(scheduleInterval)
        scheduleInterval = setInterval(applyScheduledBackground, 60000)
        try {
            localStorage.setItem('scheduleEnabled', 'true')
        } catch (e) {}

        // Monitor permission changes in real-time
        try {
            navigator.permissions
                .query({ name: 'geolocation' })
                .then((permissionStatus) => {
                    permissionStatus.addEventListener('change', () => {
                        updateSunTimes()
                    })
                })
        } catch (e) {}

        // Clear the active state of background options
        bgSelectDivs.forEach((d) => d.classList.remove('active'))
        currentActiveBgItem = null
    }

    const disableSchedule = () => {
        if (scheduleInterval) {
            clearInterval(scheduleInterval)
            scheduleInterval = null
        }
        try {
            localStorage.removeItem('scheduleEnabled')
        } catch (e) {}
        // Do nothing else: keep current background and UI state
    }

    const savedScheduleEnabled = (() => {
        try {
            return localStorage.getItem('scheduleEnabled') === 'true'
        } catch (e) {
            return false
        }
    })()

    loadScheduleImages()

    if (savedScheduleEnabled) {
        const onBtn = settingsMenu.querySelector(
            '[data-schedule="schedule-on"]'
        )
        if (onBtn) {
            scheduleToggleBtns.forEach((b) => b.classList.remove('active'))
            onBtn.classList.add('active')
            timeScheduleSection.style.display = 'block'
            updateSunTimes().then(() => enableSchedule())

            // Clear the active state of background options
            bgSelectDivs.forEach((d) => d.classList.remove('active'))
            currentActiveBgItem = null
        }
    } else {
        const offBtn = settingsMenu.querySelector(
            '[data-schedule="schedule-off"]'
        )
        if (offBtn) {
            offBtn.classList.add('active')
        }
    }

    scheduleToggleBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const schedule = btn.getAttribute('data-schedule')
            scheduleToggleBtns.forEach((b) => b.classList.remove('active'))
            btn.classList.add('active')

            if (schedule === 'schedule-on') {
                timeScheduleSection.style.display = 'block'
                enableSchedule()
            } else {
                timeScheduleSection.style.display = 'none'
                disableSchedule()

                // Set background to 'qiyue' and highlight its button
                const qiyueDiv = settingsMenu.querySelector(
                    '.options div[data-bg="qiyue"]'
                )
                if (qiyueDiv) {
                    changeBgImage('qiyue', false)
                    bgSelectDivs.forEach((d) => d.classList.remove('active'))
                    qiyueDiv.classList.add('active')
                    currentActiveBgItem = qiyueDiv
                    bgSelectSelected.textContent = qiyueDiv.textContent
                    try {
                        localStorage.setItem('bgImage', 'qiyue')
                        localStorage.removeItem('bgImageCustom')
                    } catch (e) {}
                }
            }
        })
    })

    periodImageBtns.forEach((btn) => {
        const period = btn.getAttribute('data-period')
        const input = document.getElementById(`${period}-bg-input`)

        if (input) {
            btn.addEventListener('click', () => {
                input.click()
            })

            input.addEventListener('change', (e) => {
                const file = e.target.files[0]
                if (!file) return

                const reader = new FileReader()
                reader.onload = (event) => {
                    const dataUrl = event.target.result
                    timeScheduleImages[period] = dataUrl
                    saveScheduleImages()

                    btn.classList.add('has-image')
                    btn.textContent =
                        period === 'day'
                            ? 'Daytime Image Set ✓'
                            : 'Nighttime Image Set ✓'

                    const scheduleEnabled = settingsMenu
                        .querySelector('[data-schedule="schedule-on"]')
                        ?.classList.contains('active')
                    if (scheduleEnabled && getCurrentPeriod() === period) {
                        applyScheduledBackground()
                    }
                }
                reader.readAsDataURL(file)
            })
        }
    })

    // Request location permission function
    window.requestLocationPermission = async () => {
        const confirmed = confirm(
            'Request location access?\n\nThis will be used to calculate sunrise and sunset times.'
        )

        if (!confirmed) return

        let resolve, reject
        const geolocationPromise = new Promise((_resolve, _reject) => {
            resolve = _resolve
            reject = _reject
        })

        // Try native geolocation first
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => resolve(coords),
                async (error) => {
                    console.warn('Geolocation error:', error)

                    // Try to get from URL parameters
                    const href = location.href
                    const query = new URL(href).searchParams
                    const latlon = query.get('latlon')
                    if (latlon) {
                        const [latitude, longitude] = latlon
                            .split(',')
                            .map(Number)
                        if (
                            !Number.isNaN(latitude) &&
                            !Number.isNaN(longitude)
                        ) {
                            return resolve({ latitude, longitude })
                        }
                    }

                    // Fallback to manual input
                    const latLon = prompt(
                        'Browser cannot get location. Please enter coordinates manually.\nFormat: latitude,longitude\nExample: 39.9,116.4'
                    )
                    if (!latLon) return resolve(new Error('No location'))

                    const [latitude, longitude] = latLon.split(',').map(Number)

                    if (Number.isNaN(latitude) || Number.isNaN(longitude))
                        return resolve(new Error('Invalid location'))

                    resolve({ latitude, longitude })
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 10000
                }
            )
        } else {
            // Geolocation not available at all
            console.error('Geolocation API not available')

            // Try IP-based geolocation

            // Fallback to manual input
            const latLon = prompt(
                'Browser cannot get location. Please enter coordinates manually.\nFormat: latitude,longitude\nExample: 39.9,116.4'
            )
            if (!latLon) return resolve(new Error('No location'))

            const [latitude, longitude] = latLon.split(',').map(Number)
            if (Number.isNaN(latitude) || Number.isNaN(longitude))
                return resolve(new Error('Invalid location'))

            resolve({ latitude, longitude })
        }

        const geolocation = await geolocationPromise
        if (!geolocation || geolocation instanceof Error) {
            alert(
                '✗ Unable to get location\n\nPlease check the following options:\n1. Enter coordinates manually\n2. Enable geolocation in browser settings\n3. Add ?latlon=latitude,longitude to URL'
            )
            return
        }

        const { latitude, longitude } = geolocation

        alert(
            `✓ Location acquired successfully!\n\nLatitude: ${latitude.toFixed(
                4
            )}\nLongitude: ${longitude.toFixed(
                4
            )}\n\nEnable "Day/Night Auto Switch" to use auto-switching.`
        )

        // Update sun times with the new location
        if (window.updateSunTimes) {
            window.updateSunTimes()
        }
    }

    // Add click handler for request location button with retry logic
    const setupRequestLocationBtn = () => {
        const requestLocationBtn = document.getElementById(
            'request-location-btn'
        )
        if (requestLocationBtn) {
            requestLocationBtn.addEventListener('click', (e) => {
                e.preventDefault()
                e.stopPropagation()
                window.requestLocationPermission()
            })
        } else {
            // Retry after a short delay if button not found yet
            setTimeout(setupRequestLocationBtn, 100)
        }
    }

    setupRequestLocationBtn()

    // Clear permission cache function
    window.clearGeolocationCache = () => {
        try {
            localStorage.removeItem('sunTimes')
            localStorage.removeItem('scheduleEnabled')
            console.log('✓ Geolocation cache cleared')
            alert(
                '✓ Geolocation permission cache cleared\n\nRe-enable "Day/Night Auto Switch" to request permissions again'
            )

            // Reset UI
            const scheduleOffBtn = settingsMenu.querySelector(
                '[data-schedule="schedule-off"]'
            )
            const scheduleOnBtn = settingsMenu.querySelector(
                '[data-schedule="schedule-on"]'
            )
            if (scheduleOffBtn && scheduleOnBtn) {
                scheduleOnBtn.classList.remove('active')
                scheduleOffBtn.classList.add('active')
                const timeScheduleSection = document.getElementById(
                    'time-schedule-section'
                )
                if (timeScheduleSection) {
                    timeScheduleSection.style.display = 'none'
                }
            }
        } catch (e) {
            console.error('清除缓存失败:', e)
        }
    }

    // Helper to update icon color for auto-hide
    function updateSettingsIconColor() {
        if (!autoHideEnabled) {
            settingsIcon.style.opacity = '1'
            settingsIcon.style.color = 'rgba(255,255,255,0.8)'
        } else if (
            settingsIcon.classList.contains('open') ||
            settingsIcon.matches(':hover')
        ) {
            settingsIcon.style.opacity = '1'
            settingsIcon.style.color = 'rgba(255,255,255,0.8)'
        } else {
            settingsIcon.style.opacity = '1'
            settingsIcon.style.color = 'rgba(255,255,255,0)'
        }
    }

    // Initial icon color
    updateSettingsIconColor()

    // Observe open/close
    settingsIcon.addEventListener('mouseenter', updateSettingsIconColor)
    settingsIcon.addEventListener('mouseleave', updateSettingsIconColor)
    settingsIcon.addEventListener('transitionend', updateSettingsIconColor)
    // When dropdown opens/closes
    const origShowDropdown = showDropdown
    const origHideDropdown = hideDropdown
    showDropdown = function () {
        origShowDropdown()
        updateSettingsIconColor()
    }
    hideDropdown = function () {
        origHideDropdown()
        updateSettingsIconColor()
    }
})
