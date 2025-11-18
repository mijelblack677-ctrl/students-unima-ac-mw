export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, password } = req.body;
    
    try {
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });

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

        const result = await pool.query(
            'INSERT INTO users (username, password, created_at) VALUES ($1, $2, NOW()) RETURNING id',
            [username, password]
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
