import { authController } from '@/controllers';

export async function POST(req: Request) {
    return authController.register(req);
}
