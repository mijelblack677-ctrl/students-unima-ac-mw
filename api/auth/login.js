// APexport default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, password } = req.body;
    
    try {
        // Use DATABASE_URL from NeonDB integration
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });

        // Check if user exists
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (userCheck.rows.length > 0) {
            const user = userCheck.rows[0];
            if (user.password === password) {
                return res.status(200).json({ 
                    success: true, 
                    message: 'Login successful',
                    user: { id: user.id, username: user.username }
                });
            } else {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid password' 
                });
            }
        } else {
            return res.status(404).json({ 
                success: false, 
                userNotFound: true,
                message: 'User not found' 
            });
        }
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}I route for Vercel (api/auth/login.js)
