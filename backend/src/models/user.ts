import type { User } from '../../../shared/types/user';

import Document from 'mongoose';

export interface UserDocument extends User, Document {}