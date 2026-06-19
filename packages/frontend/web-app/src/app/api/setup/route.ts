import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETUP_MARKER = path.join(process.cwd(), 'data', '.setup-complete');

export async function GET() {
  const isComplete = fs.existsSync(SETUP_MARKER);
  return NextResponse.json({ setupComplete: isComplete });
}

export async function POST(request: Request) {
  const data = await request.json();
  const dir = path.dirname(SETUP_MARKER);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETUP_MARKER, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true, message: 'Configuração concluída' });
}
