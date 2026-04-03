import { sql } from "bun";

// Initialize table if it doesn't exist
export async function handleInitDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    return Response.json({ message: "Database initialized successfully" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/users
export async function handleGetUsers() {
  try {
    const users = await sql`SELECT * FROM users ORDER BY id ASC`;
    return Response.json(users);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/users/:id
export async function handleGetUser(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    
    if (!id || isNaN(Number(id))) {
      return Response.json({ error: "Invalid ID parameter" }, { status: 400 });
    }

    const users = await sql`SELECT * FROM users WHERE id = ${Number(id)}`;
    
    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    
    return Response.json(users[0]);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/users
export async function handleCreateUser(req: Request) {
  try {
    const body: any = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return Response.json({ error: "Name and email are required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO users (name, email) 
      VALUES (${name}, ${email}) 
      RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/users/:id
export async function handleUpdateUser(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    
    if (!id || isNaN(Number(id))) {
      return Response.json({ error: "Invalid ID parameter" }, { status: 400 });
    }

    const body: any = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return Response.json({ error: "Name and email are required" }, { status: 400 });
    }

    const result = await sql`
      UPDATE users 
      SET name = ${name}, email = ${email} 
      WHERE id = ${Number(id)} 
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/users/:id
export async function handleDeleteUser(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    
    if (!id || isNaN(Number(id))) {
      return Response.json({ error: "Invalid ID parameter" }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM users 
      WHERE id = ${Number(id)} 
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ message: "User deleted successfully", deletedId: result[0].id });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
