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

        const responseHeaders = new Headers()

        // Explicitly pass through critical headers like Set-Cookie
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
                let newValue = value.replace(/Domain=[^; ]+;?/gi, '')
                newValue = newValue.replace(/Path=[^; ]+;?/gi, 'Path=/;')
                responseHeaders.append(key, newValue)
            } else {
                responseHeaders.set(key, value)
            }
        })

        // 204, 205, and 304 status codes MUST NOT have a body.
        // The Response constructor throws if a body is provided for these codes.
        if ([204, 205, 304].includes(response.status)) {
            return new NextResponse(null, {
                status: response.status,
                headers: responseHeaders,
            })
        }

        const responseData = await response.arrayBuffer()
        return new NextResponse(responseData, {
            status: response.status,
            headers: responseHeaders,
        })
    } catch (error: any) {
        console.error('Proxy Error:', error)
        return NextResponse.json({ error: 'Proxy failed', details: error.message }, { status: 502 })
    }
}
