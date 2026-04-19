// filepath: frontend/src/app/api/setup/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Test connection first
    await sql`SELECT 1`;
    await sql(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image TEXT,
        category TEXT NOT NULL,
        stock INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        items TEXT NOT NULL,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Seed products if empty
    const products = await sql('SELECT COUNT(*) as count FROM products');
    
    if (products[0].count === 0) {
      const seedProducts = [
        { name: 'Whey Protein Pro', price: 4500, description: 'Premium whey protein for muscle building. 24g protein per serving.', image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400', category: 'protein', stock: 50 },
        { name: 'Creatine Monohydrate', price: 2500, description: 'Pure creatine monohydrate for strength and power. 5g per serving.', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', category: 'creatine', stock: 80 },
        { name: 'Fat Burner Extreme', price: 3200, description: 'Advanced thermogenic fat burner. Boost metabolism and energy.', image: 'https://images.unsplash.com/photo-1579722820308-d74b5711e8c4?w=400', category: 'fat-burners', stock: 40 },
        { name: 'BCAA Energy', price: 2800, description: 'Branched chain amino acids for recovery. 2:1:1 ratio.', image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=400', category: 'protein', stock: 60 },
        { name: 'Pre-Workout Boost', price: 3500, description: 'High-caffeine pre-workout for intense training sessions.', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400', category: 'protein', stock: 45 },
        { name: 'Casein Protein', price: 4200, description: 'Slow-digesting protein ideal for nighttime recovery.', image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400', category: 'protein', stock: 35 },
        { name: 'Beta-Alanine', price: 1900, description: 'Carnosine booster for endurance. Reduces muscle fatigue.', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', category: 'creatine', stock: 70 },
        { name: 'Vitamin D3 + Calcium', price: 1800, description: 'Essential bone health support. 5000 IU Vitamin D3 + Calcium.', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'vitamins', stock: 120 },
        { name: 'Omega-3 Fish Oil', price: 2200, description: 'Pure fish oil for heart and joint health. 1000mg EPA/DHA.', image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400', category: 'vitamins', stock: 90 },
        { name: 'L-Carnitine', price: 2600, description: 'Fat metabolism support. Helps convert fat to energy.', image: 'https://images.unsplash.com/photo-1622484212028-5f1bfc57c420?w=400', category: 'fat-burners', stock: 55 },
      ];

      for (const p of seedProducts) {
        await sql(
          `INSERT INTO products (name, price, description, image, category, stock, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [p.name, p.price, p.description, p.image, p.category, p.stock]
        );
      }
    }

    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}