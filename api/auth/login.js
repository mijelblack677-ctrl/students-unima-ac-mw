// API route for Vercel (api/auth/login.js)
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

        // Check if user exists
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (userCheck.rows.length > 0) {
            // User exists - verify password
            const user = userCheck.rows[0];
            // Add your password verification logic here (compare hashed passwords)
            if (user.password === password) { // Replace with proper password hashing
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
            // User doesn't exist
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
}
