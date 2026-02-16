import User, { IUser } from '@/models/User';
import dbConnect from '@/lib/mongodb';

export class UserRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        await dbConnect();
        return User.findOne({ email });
    }

    async findById(id: string): Promise<IUser | null> {
        await dbConnect();
        return User.findById(id);
    }

    async create(userData: Partial<IUser>): Promise<IUser> {
        await dbConnect();
        return User.create(userData);
    }
}

export const userRepository = new UserRepository();
