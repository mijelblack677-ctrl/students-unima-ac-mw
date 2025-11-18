// API route for registration (api/auth/register.js)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, password } = req.body;
    
    try {
        // Connect to NeonDB
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.NEONDB_CONNECTION_STRING,
        });

        // Check if username already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }

        // Insert new user (add proper password hashing in production)
        const result = await pool.query(
            'INSERT INTO users (username, password, created_at) VALUES ($1, $2, NOW()) RETURNING id',
            [username, password] // Hash password properly in production
        );

        return res.status(201).json({ 
            success: true, 
            message: 'User registered successfully',
            userId: result.rows[0].id
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Registration failed' 
        });
    }
}
