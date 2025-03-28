import { config } from "@/config/config";

// Login Function
export const Login = async (email: string, password: string) => {
    try {
        const response = await fetch(`${config.apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Login failed:', data.error || response.statusText);
            throw new Error(data.error || response.statusText);
        }

        // Store token and user data
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('token_expiry', data.expires_at.toString());
            // localStorage.setItem('user', JSON.stringify(data.user));
            
            // Set cookie if needed (remove if not using)
            document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        
        return data;
    } catch (error) {
        throw error;
    }
};

// Signup Function
export const SignUp = async (username: string, email: string, password: string) => {
    try {
        const response = await fetch(`${config.apiUrl}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username,
                email, 
                password
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || response.statusText);
        }
        
        return data;
    } catch (error) {
        throw error;
    }
};

// Fetch User Details
export const fetchUserDetails = async () => {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        // Check if token is expired
        const tokenExpiry = localStorage.getItem('token_expiry');
        if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
            // Token expired, clear storage and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('token_expiry');
            // localStorage.removeItem('user');
            window.location.href = '/login';
            return;
        }
        
        const response = await fetch(`${config.apiUrl}/auth`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
  
        if (!response.ok) {
            throw new Error(response.statusText);
        }
  
        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error && error.message === 'No authentication token found') {
            window.location.href = '/login';
        }
        throw error;
    }
};

// Logout Function
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');
    // localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
};