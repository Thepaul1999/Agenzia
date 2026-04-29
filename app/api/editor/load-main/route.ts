import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const html = await readFile("public/templates/index.html", "utf8");
    const css = await readFile("public/templates/style.css", "utf8");
    return NextResponse.json({ html, css });
  } catch (error) {
    return NextResponse.json({ error: "File non trovati" }, { status: 500 });
  }
}