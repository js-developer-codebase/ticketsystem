import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '@/repositories/UserRepository';
import { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export class AuthService {
    async register(userData: Partial<IUser>) {
        const existingUser = await userRepository.findByEmail(userData.email!);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password!, 10);
        const user = await userRepository.create({
            ...userData,
            password: hashedPassword,
        });

        return this.generateToken(user);
    }

    async login(email: string, password: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        return this.generateToken(user);
    }

    private generateToken(user: IUser) {
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
        return { token, user: payload };
    }

    verifyToken(token: string) {
        return jwt.verify(token, JWT_SECRET) as any;
    }
}

export const authService = new AuthService();
