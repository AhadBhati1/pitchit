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

    const headers = new Headers(request.headers)
    headers.delete('host') // Let the fetch set the correct host

    try {
        const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer()

        const response = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: body,
            redirect: 'manual', // Important for OAuth redirects
        })

        // Handle redirects (like OAuth)
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location')
            if (location) {
                return NextResponse.redirect(location, response.status)
            }
        }

        const responseData = await response.arrayBuffer()
        const responseHeaders = new Headers(response.headers)

        // Fix CORS and other headers if needed, but mostly pass through
        return new NextResponse(responseData, {
            status: response.status,
            headers: responseHeaders,
        })
    } catch (error: any) {
        console.error('Proxy Error:', error)
        return NextResponse.json({ error: 'Proxy failed', details: error.message }, { status: 502 })
    }
}
