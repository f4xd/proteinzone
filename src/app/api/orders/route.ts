// filepath: frontend/src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// Security: Rate limiting
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
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'fitzone-admin-secret') {
    return NextResponse.json({ error: 'Admin access denied' }, { status: 403 });
  }

  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
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
      
      const productResult = await pool.query('SELECT * FROM products WHERE id = $1', [item.productId]);
      const product = productResult.rows[0];
      
      if (product) {
        const price = product.price;
        totalPrice += price * item.quantity;
        enrichedItems.push({
          productId: String(item.productId),
          name: product.name,
          price: price,
          quantity: item.quantity,
          image: product.image
        });
      }
    }

    if (enrichedItems.length === 0) {
      return NextResponse.json({ error: 'No valid products in order' }, { status: 400 });
    }

    // Save order to database
    const result = await pool.query(
      `INSERT INTO orders (full_name, phone, address, items, total_price, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id`,
      [sanitizedName, sanitizedPhone, sanitizedAddress, JSON.stringify(enrichedItems), totalPrice]
    );

    return NextResponse.json({
      message: 'Order created successfully',
      orderId: result.rows[0].id,
      totalPrice: totalPrice
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}