import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const { html, css } = await request.json();

    await writeFile("public/templates/index.html", html, "utf8");
    await writeFile("public/templates/style.css", css, "utf8");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Errore salvataggio" }, { status: 500 });
  }
}