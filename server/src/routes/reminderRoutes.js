import Reminder from '../models/Reminder.js';
import buildItemRoutes from './itemRoutesFactory.js';

export default buildItemRoutes(Reminder, 'reminder');
