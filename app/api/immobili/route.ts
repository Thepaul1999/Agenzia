// app/api/immobili/route.ts
import { NextResponse } from "next/server"

// Simulazione dati in memoria
const immobili = [
  { id: "1", titolo: "Cascina ristrutturata", citta: "Vignale Monferrato", prezzo: 280000, featured: true },
  { id: "2", titolo: "Appartamento in centro", citta: "Asti", prezzo: 145000, featured: false },
]

export async function GET() {
  return NextResponse.json({ immobili })
}

export async function POST(request: Request) {
  const body = await request.json()
  const newImmobile = {
    id: Date.now().toString(),
    ...body,
    featured: false,
  }
  immobili.push(newImmobile)
  return NextResponse.json(newImmobile, { status: 201 })
}
