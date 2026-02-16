import { authController } from '@/controllers';
import { withAuth } from '@/middleware/auth';

export const GET = withAuth(async (req: any) => {
    return authController.getMe(req);
});
