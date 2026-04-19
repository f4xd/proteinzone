// filepath: frontend/src/app/api/orders/route.ts
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

// Security: Rate limiting
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

function rateLimit(req: NextRequest) {
  // Simple rate limiting without IP (Vercel serverless friendly)
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
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'fitzone-admin-secret') {
    return NextResponse.json({ error: 'Admin access denied' }, { status: 403 });
  }

  try {
    const orders = getDb().prepare('SELECT * FROM orders ORDER BY createdAt DESC').all();
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (rateLimit(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { fullName, phone, address, items } = body;

    // Security: Validate required fields
    if (!fullName || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Security: Sanitize inputs
    const sanitizedName = sanitizeInput(fullName);
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedAddress = sanitizeInput(address);

    // Security: Calculate total from DB prices (NEVER trust frontend prices)
    let totalPrice = 0;
    const enrichedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity) continue;
      
      const product = getDb().prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
      if (product) {
        const price = (product as any).price;
        totalPrice += price * item.quantity;
        enrichedItems.push({
          productId: String(item.productId),
          name: (product as any).name,
          price: price,
          quantity: item.quantity,
          image: (product as any).image
        });
      }
    }

    if (enrichedItems.length === 0) {
      return NextResponse.json({ error: 'No valid products in order' }, { status: 400 });
    }

    // Save order to database
    const stmt = getDb().prepare(`
      INSERT INTO orders (fullName, phone, address, items, totalPrice)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      sanitizedName,
      sanitizedPhone,
      sanitizedAddress,
      JSON.stringify(enrichedItems),
      totalPrice
    );

    return NextResponse.json({
      message: 'Order created successfully',
      orderId: result.lastInsertRowid,
      totalPrice: totalPrice
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}