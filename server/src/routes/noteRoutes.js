import Note from '../models/Note.js';
import buildItemRoutes from './itemRoutesFactory.js';

export default buildItemRoutes(Note, 'note');
