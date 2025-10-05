import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug) {
      return NextResponse.json({ error: 'Parámetro slug requerido' }, { status: 400 })
    }

    const url = `https://losvilos.ucn.cl/hawaii/api/mallas?${slug}`

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'X-HAWAII-AUTH': 'jf400fejof13f',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!resp.ok) {
      const texto = await resp.text().catch(() => '')
      console.error('Error proxy malla', { url, status: resp.status, body: texto })
      
      if (resp.status === 404) {
        return NextResponse.json([])
      }
      return NextResponse.json({ error: 'No se pudo obtener la malla', originalError: texto }, { status: resp.status })
    }

    const data = await resp.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}