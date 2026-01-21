const MAX_HINT_LENGTH = 100

Bun.serve({
    hostname: '127.0.0.1',
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url)
        const hint = decodeURIComponent(url.pathname.replace('/hint/', ''))

        
        if (
            !hint ||
            url.pathname === '/' ||
            hint.length > MAX_HINT_LENGTH ||
            !/^[\w\s-]*$/.test(hint)
        ) {
            return new Response('Invalid query', { status: 400 })
        }

        try {
            const response = await fetch(
                `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(
                    hint
                )}`
            )

            const data = await response.json()
            const suggestions = Array.isArray(data[1]) ? data[1] : []

            const origin = req.headers.get('Origin') || ''
            const allowedOrigin =
                origin === 'http://localhost:3000' ||
                origin.startsWith('http://127.0.0.1') || 
                origin === 'null' ||
                origin.startsWith('chrome-extension://')
                    ? origin
                    : 'null'

            return new Response(JSON.stringify(suggestions), {
                headers: {
                    'Access-Control-Allow-Origin': allowedOrigin,
                    'Content-Type': 'application/json; charset=utf-8'
                }
            })
        } catch (err) {
            console.error('Fetch error:', err)
            return new Response('[]', {
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:3000',
                    'Content-Type': 'application/json; charset=utf-8'
                }
            })
        }
    }
})

console.log('Secure proxy running on http://localhost:3000')
