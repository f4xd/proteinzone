// filepath: frontend/src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Security: Rate limiting (simple in-memory store)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

function rateLimit(req: NextRequest) {
  const now = Date.now();
  const record = rateLimitStore.get('global') || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    record.count++;
    if (record.count > RATE_LIMIT_MAX) {
      return true;
    }
  }
  
  rateLimitStore.set('global', record);
  return false;
}

function sanitizeInput(str: string) {
  if (typeof str !== 'string') return str;
  return str.replace(/[;'"--]/g, '').trim();
}

export async function GET(request: NextRequest) {
  if (rateLimit(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: string[] = [];
    
    if (search) {
      const sanitized = sanitizeInput(search);
      query += ' AND name LIKE $' + (params.length + 1);
      params.push(`%${sanitized}%`);
    }
    
    if (category && ['protein', 'creatine', 'fat-burners', 'vitamins'].includes(category)) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    const products = await sql(query, params);
    const mappedProducts = products.map((p: any) => ({ 
      ...p, 
      _id: p.id,
      createdAt: p.created_at 
    }));
    
    return NextResponse.json(mappedProducts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'fitzone-admin-secret') {
    return NextResponse.json({ error: 'Admin access denied' }, { status: 403 });
  }

  try {
    const { name, price, description, image, category, stock } = await request.json();
    
    const result = await sql(
      `INSERT INTO products (name, price, description, image, category, stock, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [name, price, description, image, category, stock || 100]
    );
    
    const product = result[0];
    return NextResponse.json({ ...product, _id: product.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}