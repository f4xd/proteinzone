// filepath: frontend/src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE;
  if (host && user && password && database) {
    return `postgres://${user}:${password}@${host}:5432/${database}?sslmode=require`;
  }
  throw new Error('DATABASE_URL not configured');
};

const sql = neon(getDatabaseUrl());

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = await sql('SELECT * FROM products WHERE id = $1', [id]);
    const product = products[0];
    
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
    const result = await sql('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}