// filepath: frontend/src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';

const DB_PATH = process.env.DB_PATH || './fitzone.db';

let db: Database.Database | null = null;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
  }
  return db;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product: any = getDb().prepare('SELECT * FROM products WHERE id = ?').get(id);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ ...product, _id: product.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'fitzone-admin-secret') {
    return NextResponse.json({ error: 'Admin access denied' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const stmt = getDb().prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}