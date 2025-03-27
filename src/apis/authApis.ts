import { config } from "@/config/config"

// Login Function
export const Login = async (email: string, password: string) => {
    try {
        const response = await fetch(`${config.apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json();

        if (!response.ok) {
            console.error('Login failed:', data.error || response.statusText);
            throw new Error(data.error || response.statusText);
        }

        // Store in localStorage for API requests
        if (data.session) {
            localStorage.setItem('access_token', data.session.access_token);
            localStorage.setItem('refresh_token', data.session.refresh_token);
            localStorage.setItem('token_expiry', data.session.expires_at.toString());
            localStorage.setItem('user', JSON.stringify(data.user));
            
            document.cookie = `auth_token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax`;
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Signup Function
export const SignUp = async (email: string, password: string) => {
    try {
        const response = await fetch(`${config.apiUrl}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: email, 
                password: password
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
}

// User Details
export const fetchUserDetails = async () => {
    try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        // Check if token is expired
        const tokenExpiry = localStorage.getItem('token_expiry');
        if (tokenExpiry && Date.now() > parseInt(tokenExpiry) * 1000) {
            // Token expired, try to refresh before proceeding
            await refreshToken();
        }
        
        const response = await fetch(`${config.apiUrl}/auth`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
  
        if (!response.ok) {
            throw new Error(response.statusText);
        }
  
        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error && error.message === 'No authentication token found') {
            // Redirect to login or handle unauthenticated state
            window.location.href = '/auth/login';
        }
        throw error;
    }
};

// Function to refresh the token
async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
    
    try {
      const response = await fetch(`${config.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh token');
      }
      
      localStorage.setItem('access_token', data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refresh_token);
      localStorage.setItem('token_expiry', data.session.expires_at.toString());
      
      return data.session.access_token;
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw error;
    }
}
