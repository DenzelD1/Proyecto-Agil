import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rut = searchParams.get('rut')
    const codcarrera = searchParams.get('codcarrera')

    if (!rut || !codcarrera) {
      return NextResponse.json({ error: 'Parámetros rut y codcarrera son requeridos' }, { status: 400 })
    }

    const url = `https://puclaro.ucn.cl/eross/avance/avance.php?rut=${encodeURIComponent(rut)}&codcarrera=${encodeURIComponent(codcarrera)}`

    const resp = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' }, cache: 'no-store' })

    if (!resp.ok) {
      const texto = await resp.text().catch(() => '')
      console.error('Error proxy avance', { url, status: resp.status, body: texto })
      return NextResponse.json({ error: 'No se pudo obtener el avance', originalError: texto }, { status: resp.status })
    }

    const data = await resp.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
