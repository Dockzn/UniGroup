import { checkAuth } from '../../services/authGuard.js';

if (!checkAuth()) {
    throw new Error('Unauthorized');
}