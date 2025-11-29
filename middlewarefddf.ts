import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Daftar rute yang dilindungi
const PROTECTED_ROUTES: string[] = ['/dashboard', '/profile'];
const ADMIN_ROUTES: string[] = ['/admin'];

// Rute yang harus dialihkan jika pengguna sudah login
const AUTH_ROUTES: string[] = ['/login', '/register'];

/**
 * Middleware Next.js untuk pengecekan autentikasi dan pengalihan.
 */
export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const currentPath = url.pathname;
    
    // --- 1. Pengecekan Token Sesi ---
    const sessionToken = request.cookies.get('sb-access-token')?.value; // Supabase token
    const userMetadata = request.cookies.get('user-metadata')?.value;
    
    let userRole = null;
    if (userMetadata) {
        try {
            const metadata = JSON.parse(userMetadata);
            userRole = metadata.app_metadata?.role;
        } catch (error) {
            console.error('Error parsing user metadata:', error);
        }
    }

    // --- 2. Logika Rute Admin ---
    const isAdminRoute = ADMIN_ROUTES.some(route => currentPath.startsWith(route));
    
    if (isAdminRoute) {
        if (!sessionToken) {
            // Tidak ada token, redirect ke login
            const loginUrl = new URL('/auth/admin/login', request.url);
            // loginUrl.
            console.log(`REDIRECTING: ${currentPath} to /login (No token)`);
            return NextResponse.redirect(loginUrl);
        }
        
        if (userRole !== 'admin') {
            // Bukan admin, redirect ke dashboard atau unauthorized
            const dashboardUrl = new URL('/dashboard', request.url);
            console.log(`REDIRECTING: ${currentPath} to /dashboard (Not admin)`);
            return NextResponse.redirect(dashboardUrl);
        }
    }

    // --- 3. Logika Rute User Biasa (yang dilindungi) ---
    const isProtectedRoute = PROTECTED_ROUTES.some(route => currentPath.startsWith(route));
    
    if (isProtectedRoute) {
        if (!sessionToken) {
            // Tidak ada token, redirect ke login
            const loginUrl = new URL('/login', request.url);
            console.log(`REDIRECTING: ${currentPath} to /login`);
            return NextResponse.redirect(loginUrl);
        }
        
        if (userRole === 'admin') {
            // Admin tidak boleh akses halaman user biasa, redirect ke admin
            const adminUrl = new URL('/admin', request.url);
            console.log(`REDIRECTING: ${currentPath} to /admin (Admin user)`);
            return NextResponse.redirect(adminUrl);
        }
    }

    // --- 4. Logika Rute Autentikasi (Jika sudah login) ---
    const isAuthRoute = AUTH_ROUTES.includes(currentPath);

    if (sessionToken && isAuthRoute) {
        // Redirect berdasarkan role
        const redirectUrl = userRole === 'admin' 
            ? new URL('/admin', request.url)
            : new URL('/dashboard', request.url);
        
        console.log(`REDIRECTING: ${currentPath} to ${redirectUrl.pathname} (Already logged in)`);
        return NextResponse.redirect(redirectUrl);
    }

    // Lanjutkan request jika tidak ada aturan redirect yang dipicu
    return NextResponse.next();
}

// --- 5. Konfigurasi Matcher ---
export const config = {
    // Letakkan SEMUA string path secara eksplisit di sini
    matcher: [
      // Rute Terproteksi
      '/dashboard/:path*', // Match /dashboard dan sub-jalurnya
      '/profile',
      '/admin/:path*',
      
      // Rute Autentikasi yang perlu dicek (misalnya untuk redirect jika sudah login)
      '/login',
      '/register',
      
      // Pastikan semua adalah string statis
    ],
  };