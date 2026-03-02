import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, await params)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, await params)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, await params)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, await params)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, await params)
}

async function proxyRequest(request: NextRequest, { path }: { path: string[] }) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
        return NextResponse.json({ error: 'Supabase URL not configured on server' }, { status: 500 })
    }

    const searchParams = request.nextUrl.searchParams.toString()
    const subPath = path.join('/')
    const targetUrl = `${supabaseUrl}/${subPath}${searchParams ? `?${searchParams}` : ''}`

    // Clone headers and remove problematic ones
    const headers = new Headers(request.headers)
    headers.delete('host')
    headers.delete('connection')
    headers.delete('content-length')

    try {
        const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer()

        const response = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: body,
            redirect: 'manual',
        })

        // Handle redirects (OAuth)
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location')
            if (location) {
                return NextResponse.redirect(location, response.status)
            }
        }

        const responseData = await response.arrayBuffer()
        const responseHeaders = new Headers()

        // Explicitly pass through critical headers like Set-Cookie
        // But STRIP encoding headers because fetch/Next.js might have already decoded the body
        // AND rewrite Domain/Path in Set-Cookie to match the current domain
        response.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase()
            if (
                lowerKey === 'content-encoding' ||
                lowerKey === 'transfer-encoding' ||
                lowerKey === 'content-length'
            ) {
                return
            }

            if (lowerKey === 'set-cookie') {
                // Rewrite Supabase domain to the current site domain
                let newValue = value.replace(/Domain=[^; ]+;?/gi, '')
                newValue = newValue.replace(/Path=[^; ]+;?/gi, 'Path=/;')
                responseHeaders.append(key, newValue)
            } else {
                responseHeaders.set(key, value)
            }
        })

        return new NextResponse(responseData, {
            status: response.status,
            headers: responseHeaders,
        })
    } catch (error: any) {
        console.error('Proxy Error:', error)
        return NextResponse.json({ error: 'Proxy failed', details: error.message }, { status: 502 })
    }
}
