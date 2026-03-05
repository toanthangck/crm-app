import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Dynamic imports to avoid Edge Runtime issues
                const { default: getDb } = await import('@/lib/db');
                const { seedDatabase } = await import('@/lib/seed');
                const bcryptjs = await import('bcryptjs');

                const db = getDb();
                seedDatabase();

                const user = db.prepare('SELECT * FROM users WHERE email = ?').get(credentials.email as string) as any;
                if (!user) return null;

                const isValid = bcryptjs.compareSync(credentials.password as string, user.password_hash);
                if (!isValid) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET || 'crm-super-secret-key-change-in-production',
});
